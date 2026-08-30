#!/usr/bin/env node
// 把 media-note/ 下的笔记单向发布到个人站点的 Astro collection。
//
// 用法：
//   node scripts/publish-notes.mjs              # 预演，只报告不写文件
//   node scripts/publish-notes.mjs --write      # 实际写入站点目录
//   SITE_NOTES_DIR=<路径> node scripts/publish-notes.mjs --write
//
// 只同步笔记正文。副产物（原始字幕、时间轴转录）不进公开仓库，文末的
// 「副产物导航」整段会被剥离，正文里残留的 ../byproducts/ 链接会被改写
// 成指向原视频。

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { notes as overrides, siteNotesDir } from './publish.config.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(here, '..');
const noteDir = join(projectRoot, 'media-note');
const indexPath = join(noteDir, 'README.md');

const write = process.argv.includes('--write');

const TYPES = { 笔记: 'note', 指南: 'guide', 手册: 'manual' };

const fail = (msg) => {
  console.error(`[publish-notes] ${msg}`);
  process.exit(1);
};

// ---------- 读取索引表 ----------

function readIndex() {
  if (!existsSync(indexPath)) fail(`找不到索引文件 ${indexPath}`);
  const rows = new Map();
  for (const line of readFileSync(indexPath, 'utf8').split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 5 || cells[0] === '类型' || cells[0].startsWith('-')) continue;
    const [, titleCell, source, date, byproductCell] = cells;
    const fileMatch = titleCell.match(/\[([^\]]+\.md)\]/);
    const idMatch = byproductCell.match(/byproducts\/([^/)]+)\//);
    if (!fileMatch) continue;
    rows.set(fileMatch[1], {
      type: cells[0],
      title: fileMatch[1].replace(/\.md$/, ''),
      source,
      date,
      sourceId: idMatch ? idMatch[1] : null,
    });
  }
  return rows;
}

// ---------- 正文解析 ----------

// github-slugger 的近似实现：转小写、去标点（保留 CJK / 字母数字 / - _）、
// 空格转连字符、重复标题追加 -1 -2。Astro 默认也用 github-slugger，
// 但升级后算法可能变，构建完必须实测一次锚点。
function slugger() {
  const seen = new Map();
  return (text) => {
    const base =
      text
        .trim()
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/[`*_~]/g, '')
        .replace(/[^\p{L}\p{N}_\- ]/gu, '')
        .replace(/\s+/g, '-') || 'section';
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };
}

function parseSourceBlock(md) {
  const link = md.match(/^>\s*来源：\[([^\]]+)\]\(([^)]+)\)/m);
  const meta = md.match(/^>\s*UP 主：(.+?)｜时长：(.+?)｜整理日期：([\d-]+)/m);
  return {
    sourceTitle: link ? link[1].trim() : null,
    sourceUrl: link ? link[2].trim() : null,
    author: meta ? meta[1].trim() : null,
    duration: meta ? meta[2].trim() : null,
    date: meta ? meta[3].trim() : null,
  };
}

function transformBody(raw, sourceUrl) {
  // 去掉首行 H1：页面标题由 frontmatter 渲染，保留会重复。
  let body = raw.replace(/^#\s+.+\n+/, '');

  // 剥掉文末「副产物导航」整段 —— 那些相对链接在站点上全是 404。
  const hadNav = /^##\s*副产物导航/m.test(body);
  body = body.replace(/\n*^##\s*副产物导航[\s\S]*$/m, '\n');

  // 正文里残留的 ../byproducts/ 链接统一改指向原视频。
  let rewritten = 0;
  if (sourceUrl) {
    body = body.replace(/\[([^\]]+)\]\(\.\.?\/byproducts\/[^)]+\)/g, (_, text) => {
      rewritten += 1;
      return `[${text}](${sourceUrl})`;
    });
  }

  return { body: body.trim() + '\n', hadNav, rewritten };
}

function checkAnchors(body) {
  const slug = slugger();
  const ids = new Set();
  for (const line of body.split('\n')) {
    const m = line.match(/^(#{2,6})\s+(.+?)\s*$/);
    if (m) ids.add(slug(m[2]));
  }
  const broken = [];
  for (const m of body.matchAll(/\]\(#([^)]+)\)/g)) {
    if (!ids.has(m[1])) broken.push(m[1]);
  }
  return { anchorCount: ids.size, broken };
}

// ---------- frontmatter ----------

const q = (v) => (v === null || v === undefined ? '""' : JSON.stringify(String(v)));

function buildFrontmatter(entry, meta, override) {
  if (!override) return null;
  const rows = [
    ['title', entry.title],
    ['titleEn', override.titleEn],
    ['type', TYPES[entry.type] ?? 'note'],
    ['typeLabel', entry.type],
    ['category', override.category],
    ['categoryEn', override.categoryEn],
    ['summary', override.summary],
    ['summaryEn', override.summaryEn],
    ['source', entry.source],
    ['sourceTitle', meta.sourceTitle],
    ['sourceUrl', meta.sourceUrl],
    ['author', meta.author],
    ['duration', meta.duration],
    ['sourceId', entry.sourceId],
    ['date', meta.date || entry.date],
    ['draft', 'false'],
  ];
  const lines = rows.map(([k, v]) => (k === 'draft' ? `${k}: ${v}` : `${k}: ${q(v)}`));
  return `---\n${lines.join('\n')}\n---\n\n`;
}

// ---------- 主流程 ----------

const index = readIndex();
const files = readdirSync(noteDir).filter((f) => f.endsWith('.md') && f !== 'README.md');

if (!files.length) fail('media-note/ 下没有笔记文件');

const results = [];
const problems = [];

for (const file of files) {
  const entry = index.get(file);
  if (!entry) problems.push(`${file}：不在 media-note/README.md 索引表里，已跳过`);

  const override = overrides[file];
  if (!override) {
    problems.push(`${file}：publish.config.mjs 里没有对应条目，无法生成英文摘要，已跳过`);
    continue;
  }
  if (!entry) continue;

  const raw = readFileSync(join(noteDir, file), 'utf8');
  const meta = parseSourceBlock(raw);
  const { body, hadNav, rewritten } = transformBody(raw, meta.sourceUrl);
  const { anchorCount, broken } = checkAnchors(body);

  if (!meta.sourceUrl) problems.push(`${file}：正文头部没解析到来源链接`);
  if (broken.length) problems.push(`${file}：${broken.length} 个内链锚点失效 -> ${broken.join(', ')}`);

  const frontmatter = buildFrontmatter(entry, meta, override);
  results.push({
    file,
    slug: override.slug,
    target: join(siteNotesDir, `${override.slug}.md`),
    content: frontmatter + body,
    stats: { hadNav, rewritten, anchorCount, broken: broken.length },
  });
}

// ---------- 输出 ----------

console.log(`来源目录：${noteDir}`);
console.log(`目标目录：${siteNotesDir}${write ? '' : '  (预演模式，未写入)'}\n`);

for (const r of results) {
  console.log(`  ${basename(r.file)}  ->  ${r.slug}.md`);
  console.log(`      剥离副产物导航 ${r.stats.hadNav ? '是' : '否'}｜改写链接 ${r.stats.rewritten} 处｜标题锚点 ${r.stats.anchorCount} 个`);
}

if (problems.length) {
  console.log('\n需要处理：');
  for (const p of problems) console.log(`  ! ${p}`);
}

if (!results.length) fail('没有可发布的笔记');

if (write) {
  mkdirSync(siteNotesDir, { recursive: true });
  for (const r of results) writeFileSync(r.target, r.content, 'utf8');
  console.log(`\n已写入 ${results.length} 篇，接下来到站点仓库执行 git commit / push。`);
} else {
  console.log(`\n共 ${results.length} 篇待发布。确认无误后加 --write 执行。`);
}

if (problems.some((p) => p.includes('锚点失效'))) process.exit(1);
