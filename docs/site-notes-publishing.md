# 笔记发布到 dithob.github.io 的改造方案

对象站点：`D:/TestProjects/dithob.github.io`（Astro 静态站，GitHub Pages / Actions 部署）
 源：`D:/TestProjects/mediareport/media-note/`
 目标 URL：`https://dithob.github.io/notes/` 与 `https://dithob.github.io/notes/<slug>/`

本文是**实施前的设计稿**，站点侧尚未改动。mediareport 侧的发布脚本已实现，见 `scripts/publish-notes.mjs`。

---

## 一、目标与边界

| 项 | 结论 |
| --- | --- |
| 发布内容 | 只发笔记正文。副产物（原始字幕、时间轴转录）不进公开仓库 |
| 同步方向 | **单向**：mediareport → 站点。站点上的改动不回流 |
| 触发方式 | 手动跑脚本，再 commit / push 触发 Actions |
| 站点仓库 | 唯一发布源，公开 |
| mediareport | 可推 Private 仓库做备份，含 byproducts |

选单向的理由：两边不是同一份文件。站点里的笔记是**转换产物**（加了 frontmatter、文件名 slug 化、副产物导航被剥离），反向同步要做逆变换，任何一边手工改动都会在下次同步时被覆盖或撞冲突。跨仓库双向只能靠 CI 互开 PR，冲突时得手工解，比跑一次脚本痛苦得多。

---

## 二、站点现状（改造前）

- `/notes/` 页已存在，但只是 `src/data.ts` 里硬编码的 **3 张卡片，全部外链到 GitHub 仓库**，站点本身一篇笔记正文都没有。
- 数据源是 `src/data.ts` 手写数组，**没有用 Astro Content Collections**。
- 中英双语成对（`/notes/` ↔ `/en/notes/`），`BaseLayout` 自动生成 `hreflang` alternate。
- `public/sitemap.xml` 是手写的，新增页面要手动补。
- `trailingSlash: 'always'`，所有站内链接必须带尾斜杠。
- `node_modules` 未安装，本地验证前需要 `npm ci`。

---

## 三、改造清单

| 文件 | 动作 | 说明 |
| --- | --- | --- |
| `src/content.config.ts` | 新增 | 定义 notes collection 与 schema |
| `src/content/notes/*.md` | 新增（脚本产出） | 带 frontmatter 的正文，不手写 |
| `src/pages/notes.astro` → `src/pages/notes/index.astro` | 改造 | 从 collection 读真实列表 |
| `src/pages/notes/[...slug].astro` | 新增 | 正文渲染页 |
| `src/pages/en/notes.astro` → `src/pages/en/notes/index.astro` | 改造 | 英文摘要墙 |
| `src/layouts/BaseLayout.astro` | 小改 | 新增可选 `alternatePath` prop |
| `astro.config.mjs` | 小改 | Shiki 主题适配多套皮肤 |
| `public/sitemap.xml` 或接入 `@astrojs/sitemap` | 更新 | 补 `/notes/<slug>/` |
| `scripts/verify-site.mjs` | 必改 | 校验清单里的 notes 路径已经变了 |

> **坑**：`scripts/verify-site.mjs` 里写死了 `src/pages/notes.astro` 和 `src/pages/en/notes.astro`。把页面挪进目录后这个文件会直接 `exit(1)`，CI 就红了。改页面的同时必须同步改这里。

---

## 四、落地细节

### 4.1 `src/content.config.ts`

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string(),
    type: z.enum(['note', 'guide', 'manual']),
    typeLabel: z.string(),
    category: z.string(),
    categoryEn: z.string(),
    summary: z.string(),
    summaryEn: z.string(),
    source: z.string(),
    sourceTitle: z.string().nullable(),
    sourceUrl: z.string().url(),
    author: z.string().nullable(),
    duration: z.string().nullable(),
    sourceId: z.string().nullable(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes };
```

字段全部由 `publish-notes.mjs` 生成，schema 与脚本的 frontmatter 输出一一对应。改动任一侧都要同步另一侧。

### 4.2 `src/pages/notes/[...slug].astro`

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  return notes.map((note) => ({ params: { slug: note.id }, props: { note } }));
}

const { note } = Astro.props;
const { Content } = await render(note);
---
<BaseLayout
  title={`${note.data.title} — Dithob`}
  description={note.data.summary}
  path={`/notes/${note.id}/`}
  alternatePath="/en/notes/"
>
  <article class="page-intro shell">
    <div class="eyebrow">{note.data.typeLabel}</div>
    <h1>{note.data.title}</h1>
    <p>{note.data.summary}</p>
    <dl class="facts">
      <dt>来源</dt><dd><a href={note.data.sourceUrl} target="_blank" rel="noreferrer">{note.data.source}</a></dd>
      <dt>时长</dt><dd>{note.data.duration}</dd>
      <dt>整理日期</dt><dd>{note.data.date.toISOString().slice(0, 10)}</dd>
    </dl>
  </article>
  <div class="section shell prose"><Content /></div>
</BaseLayout>
```

`note.id` 由 glob loader 从文件名推导，即 `pi-usage-manual`、`superpowers-harness-engineering`。

### 4.3 `src/pages/notes/index.astro`

分两块：

1. **正文笔记清单** —— `getCollection('notes')` 按 `date` 倒序，卡片用现有的 `.note-card` 样式，链接指向 `/notes/<slug>/`（记得带尾斜杠）。
2. **延伸阅读** —— 原来 `src/data.ts` 里的 3 张外链卡片降级成这个区块，因为它们的性质是「相关仓库」而不是笔记。

### 4.4 `BaseLayout` 的 `alternatePath`

笔记详情页只有中文，但布局会无条件生成 `hreflang="en"` 的 alternate，指向 `/en/notes/<slug>/` —— 那个地址不存在。加一个可选 prop 让详情页把 alternate 指到 `/en/notes/` 摘要墙：

```ts
interface Props {
  title: string;
  description: string;
  lang?: 'zh' | 'en';
  path?: string;
  alternatePath?: string;   // 新增
}
```

默认值保持现有推导逻辑不变。

### 4.5 英文摘要墙 `src/pages/en/notes/index.astro`

列出 `titleEn` + `summaryEn`，点击跳到中文正文页。顶部加一行说明：

> These notes are written in Chinese. The list below links to the original Chinese text.

不做机翻。技术笔记机翻会翻错术语——Pi 手册里那批 `pi-web-access` / `pi-subagents` 之类的包名和 `goal` 模式，翻坏了比不翻更糟。

---

## 五、样式与渲染缺口（最容易翻车的地方）

`BaseLayout` 里的 `.prose` 目前只有两条规则：

```css
.prose h2 { margin-top: 2.4rem; }
.prose p, .prose li { color: var(--muted); }
```

而笔记正文大量使用**表格、引用块、行内代码、代码块、多级标题**——这些现在全都没有样式。直接渲染出来会是浏览器默认样式，和站点的 neo-brutalist 主题（粗黑边框、硬阴影、等宽字体）完全不搭。至少要补：

| 元素 | 需要什么 |
| --- | --- |
| `table` | 3px 边框 + `border-collapse`，外层包 `overflow-x: auto`（笔记表格有 4 列，手机会溢出） |
| `blockquote` | 左侧粗边 + 背景色。笔记开头那段来源信息就是引用块 |
| `code`（行内） | 背景 + 边框，字号略小 |
| `pre` | 代码块容器，配合 Shiki |
| `h2`–`h4` | 层级间距，以及 `scroll-margin-top`（sticky header 会挡住锚点跳转） |
| `hr` | 笔记里用 `---` 分节 |

**Shiki 主题**：站点有 5 套皮肤，其中 `geometric-bold` 是深色。Astro 默认 Shiki 主题是固定的，深色代码块在浅色皮肤上会突兀。建议 `astro.config.mjs` 加：

```js
markdown: {
  syntaxHighlight: 'shiki',
  shikiConfig: { theme: 'css-variables', wrap: true },
},
```

`css-variables` 会输出 CSS 变量，再用 `[data-theme='geometric-bold']` 覆盖即可跟着皮肤切换。

**锚点**：脚本里的 slugger 是 github-slugger 的近似实现。Astro 默认也用 github-slugger，当前 2 篇笔记共 50 个标题、内链全部校验通过。但 Astro 升级可能改算法，**首次构建后必须实测一遍 `#附录-aasr-还原对照表` 这类 CJK 锚点**。

---

## 六、验收清单

实施完按这个顺序验：

```bash
cd D:/TestProjects/dithob.github.io
npm ci                      # node_modules 还没装
node ../mediareport/scripts/publish-notes.mjs --write
npm run check               # 类型检查，schema 对不上会在这里报
npm run build               # 构建
node scripts/verify-site.mjs # 记得先改里面的 notes 路径
```

然后人工确认：

- [ ] `/notes/` 列出 2 篇笔记，卡片链接带尾斜杠
- [ ] `/notes/pi-usage-manual/` 正文渲染完整，表格和引用块有样式
- [ ] 页面里没有出现 `byproducts` 字样的链接
- [ ] 点击正文里的 `[附录 A](#...)` 能跳到位，且 sticky header 不遮挡
- [ ] `/en/notes/` 摘要墙能跳到中文正文
- [ ] 详情页的 `<link rel="alternate" hreflang="en">` 指向 `/en/notes/` 而不是 404
- [ ] 5 套皮肤下代码块都可读（重点看 `geometric-bold`）
- [ ] 手机宽度下宽表格可横向滚动
- [ ] `public/sitemap.xml` 已包含新的 `/notes/<slug>/`

CI 侧不用另配，`deploy.yml` 已经在 push main 时跑 `check` + `build` + 部署。

---

## 七、可选后续

- **接入 `@astrojs/sitemap`**：现在的 `public/sitemap.xml` 手写维护，笔记一多必然漏。接入后自动包含 collection 页面，可以删掉手写文件。
- **每篇笔记的 OG 图**：现在所有页面共用 `public/images/og.svg`，分享出去没有区分度。
- **按 category / type 归档**：现在只有 2 篇，等攒到 10 篇以上再说。
- **CI 自动开 PR**：如果 mediareport 也上 GitHub，可以做一个 scheduled workflow 检出源仓库、跑脚本、向站点仓库开 PR。当前 2 篇笔记，手动跑脚本的性价比更高。
