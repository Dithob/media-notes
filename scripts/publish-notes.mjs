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
import { fileURLToPath, pathToFileURL } from 'node:url';
import { notes as overrides, siteNotesDir } from './publish.config.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(here, '..');
const noteDir = join(projectRoot, 'media-note');
const indexPath = join(noteDir, 'README.md');

const write = process.argv.includes('--write');

const TYPES = { 笔记: 'note', 指南: 'guide', 手册: 'manual', 阅读: 'review' };

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
    const [, titleCell, source, date, sourceLinkCell] = cells;
    const fileMatch = titleCell.match(/\[([^\]]+\.md)\]/);
    const idMatch = sourceLinkCell.match(/(?:video\/|v=)([\w-]+)/);
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

// ---------- 锚点 slugger ----------
// Astro 7 经 @astrojs/markdown-satteri 用 github-slugger 给标题生成 id
// （重复标题追加 -1/-2）。这里直接从站点 node_modules 加载同一份包，
// 保证 checkAnchors 与真实页面完全一致；站点升级 Astro / github-slugger 后
// 验收标准自动跟随。找不到时才退回内置近似算法并警告。

async function loadSlugger() {
  const candidates = [
    // 站点 node_modules（与构建时是同一个包，版本随站点升级）
    join(siteNotesDir, '..', '..', '..', 'node_modules', 'github-slugger', 'index.js'),
    // 本仓库自己的 node_modules（若以后把 github-slugger 加进依赖）
    join(projectRoot, 'node_modules', 'github-slugger', 'index.js'),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    const mod = await import(pathToFileURL(p).href);
    let version = '';
    try {
      const pkg = JSON.parse(readFileSync(join(p, '..', 'package.json'), 'utf8'));
      version = pkg.version ? `@${pkg.version}` : '';
    } catch {}
    return { Slugger: mod.default, label: `github-slugger${version}` };
  }
  return { Slugger: null, label: null };
}

// 兜底近似实现（仅当站点 node_modules 缺失时使用，与 github-slugger 不完全一致）
class ApproxSlugger {
  constructor() {
    this.seen = new Map();
  }
  slug(value) {
    const base =
      value
        .trim()
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/[`*_~]/g, '')
        .replace(/[^\p{L}\p{N}_\- ]/gu, '')
        .replace(/\s+/g, '-') || 'section';
    const n = this.seen.get(base) ?? 0;
    this.seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  }
}

const { Slugger, label: sluggerLabel } = await loadSlugger();
if (!Slugger) {
  console.warn(
    '[publish-notes] 警告：站点 node_modules 里找不到 github-slugger，锚点校验退回内置近似算法，结果仅供参考。',
  );
}
const sluggerClass = Slugger ?? ApproxSlugger;

// ---------- 正文解析 ----------

// 把标题行的 Markdown 还原成 Astro 渲染后的纯文本（HAST textContent）：
// [label](url) -> label、![alt](url) -> alt、`code` -> code、<b>x</b> -> x。
// 剩下的 * ~ 等标记符由 github-slugger 自身按黑名单剔除，无需处理。
function headingText(raw) {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/(?<!\w)_(.+?)_(?!\w)/g, '$1');
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
  const slugger = new sluggerClass();
  const ids = new Set();
  for (const line of body.split('\n')) {
    const m = line.match(/^(#{2,6})\s+(.+?)\s*$/);
    if (m) ids.add(slugger.slug(headingText(m[2])));
  }
  const broken = [];
  for (const m of body.matchAll(/\]\(#([^)]+)\)/g)) {
    if (!ids.has(m[1])) broken.push(m[1]);
  }
  return { anchorCount: ids.size, ids, broken };
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
console.log(`目标目录：${siteNotesDir}${write ? '' : '  (预演模式，未写入)'}`);
if (sluggerLabel) console.log(`锚点 slugger：${sluggerLabel}（与站点构建同一份，锚点校验与线上一致）`);
console.log();

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

// 供外部测试/校验导入使用：导出正文处理与锚点校验函数
export { headingText, checkAnchors };
