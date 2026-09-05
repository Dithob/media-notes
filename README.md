# media-notes

> 音视频 → 结构化笔记的一站式工作区 · A workspace that turns audio & video into structured notes.

## 项目简介 · About

**中文**

`media-notes` 是一个音视频内容提取与整理工作区。它用 `media-content-distiller` 技能抓取 B 站 / YouTube 等平台的字幕（BibiGPT），再由 Codex 等 AI Agent 基于字幕整理成**给人读的结构化笔记**（`笔记` / `指南` / `手册`），并可一键发布到个人站点。

**English**

`media-notes` is a workspace for extracting and distilling audio/video content. It pulls subtitles from platforms like Bilibili and YouTube via the `media-content-distiller` skill (powered by BibiGPT), then an AI agent (e.g. Codex) turns the transcripts into **structured, human-readable notes** (`note` / `guide` / `manual`) — publishable to a personal site with one command.

## 特性 · Features

| 特性 | 说明 |
| --- | --- |
| 🎬 多平台字幕获取 | 抓取 B 站 / YouTube 等平台字幕，原始 cue 逐条落盘留证 · Multi-platform subtitle acquisition with raw cues archived as evidence |
| 🤖 Agent 整理成稿 | 字幕 → 结构化笔记：按约定命名、索引、互链 · Agent-driven distillation with agreed naming, indexing and cross-links |
| 📂 主产物 / 副产物分离 | 给人读的笔记在 `media-note/`，字幕、元数据、转录在 `byproducts/` · Final notes in `media-note/`, raw byproducts in `byproducts/` |
| 📤 单向发布 | `scripts/publish-notes.mjs` 一键发布到个人站点，副产物一律不公开 · One-command publishing to a personal Astro site — byproducts never leave the private repo |
| 🔒 私有仓库设计 | 完整 ASR 转写只留存于私有仓库 · Designed to stay private: full ASR transcripts live only in the private repo |

发布目标站点：<https://dithob.github.io/notes/>（Astro，GitHub Pages / Actions 自动构建）。

## 配套技能（skills.sh 技能源）

本仓库同时是 [skills.sh](https://skills.sh) 的技能源：配套的 `media-content-distiller`、
`extract-tool-registration`（原 `bibigpt-account-registration`，已更名并通用化）放在
[`skills/`](skills/README.md)，项目本身使用的 `media-notes-publishing` 在 `.pi/skills/`
（pi 项目技能，同样会被收录），github.com 仓库即可被 skills.sh 收录（
<https://skills.sh/Dithob/media-notes>），任何 agent 一条命令安装：

```bash
npx skills add Dithob/media-notes --skill media-content-distiller
npx skills add Dithob/media-notes --skill extract-tool-registration
npx skills add Dithob/media-notes --skill media-notes-publishing
npx skills add Dithob/media-notes --list        # 查看全部
```

[![skills.sh](https://skills.sh/b/Dithob/media-notes)](https://skills.sh/Dithob/media-notes)

> 说明：`media-content-distiller` 原本单独存放在 <https://github.com/Dithob/media-content-distiller>，
> 迁移后该仓库已归档，只留 README 指向本仓库 `skills/`。

## 目录约定

工作区只分两层：**给人读的成品笔记**放 `media-note/`，**提取过程的副产物**放 `byproducts/`。

```text
media-notes/
├── README.md                 # 本文件：目录约定与工作流
├── media-note/               # 主产物（人读的最终笔记）
│   ├── README.md             # 笔记索引
│   └── <标题> 笔记.md
└── byproducts/               # 副产物（字幕、元数据、转录）
    ├── README.md
    └── <source-id>/
        ├── README.md
        ├── raw-subtitle.json
        ├── metadata.json
        ├── transcript.md
        └── status.json
```

## 主产物 `media-note/`

成品笔记**直接平铺**在 `media-note/` 根目录，不再按来源分子目录。

命名：`<标题或内容主题> <类型>.md`，类型取其一：

| 类型   | 用于                  |
| ---- | ------------------- |
| `笔记` | 默认。内容梳理、观点摘录、学习记录   |
| `指南` | 有明确操作步骤、需要照着做的内容    |
| `手册` | 内容量大、需要长期反复查阅的参考型内容 |

规则：

- 文件名用清理后的标题，去掉不能用于文件名的字符；
- 不把 `-raw-subtitle`、`-metadata`、`-transcript` 这类技术后缀拼进标题；
- 不把 BV 号写进标题，BV 号只作为副产物目录名；
- 同名文件已存在时追加短来源 ID，不覆盖；
- 每篇笔记文末必须有 `## 副产物导航`，链接回对应 `byproducts/<source-id>/README.md`；
- 每新增一篇，同步在 `media-note/README.md` 索引里加一行。

## 副产物 `byproducts/`

每个来源一个文件夹，目录名用短来源 ID：

- Bilibili → BV 号（如 `BV1xx411c7mD`）；
- 其他平台 → 稳定的短 ID（如 YouTube 视频 ID）；
- 需要按时间排序时，可加日期前缀 `20260830-BV1xx411c7mD`。

一个来源的所有副产物都收进它自己的文件夹，固定短文件名：`raw-subtitle.json`、`metadata.json`、`transcript.md`、`status.json`。

## 工作流

1. 拿到 URL 或本地文件，先取字幕，不要走 BibiGPT 总结接口；
2. 副产物落到 `byproducts/<source-id>/`，同时用 `--main-product-dir` 让脚本生成的链接指向 `media-note/`；
3. 由 Codex 基于字幕整理主产物，写进 `media-note/<标题> <类型>.md`；
4. 更新 `media-note/README.md` 索引，并在笔记文末加副产物导航。

取字幕的实际命令（在项目根目录执行）：

```bash
python <skill>/scripts/acquire_subtitle.py subtitle \
  --input "<URL>" \
  --output-dir ./byproducts \
  --main-product-dir ./media-note \
  --preflight
```

`<skill>` 为 `C:\Users\wujue\.workbuddy\skills\media-content-distiller`。

### 两个已知的坑

1. **脚本按 slug 生成主产物链接名**（空格转成 `-`，如 `Superpowers-与-Harness-Engineering-笔记.md`），而笔记文件按本目录约定用空格命名。所以脚本写进 README 的链接是断的，**写完笔记后要手动把链接改成真实文件名**。
2. 脚本会把一段 `<!-- media-content-distiller:index -->` 索引块追加到 `byproducts/README.md`，其中仍可能出现 `media-artifacts/` 的旧措辞，同样需要按本目录约定修正。

## 发布到个人站点

笔记可以单向发布到个人主页 <https://dithob.github.io/notes/>。原则：**只发笔记正文，副产物一律不公开**。

```bash
node scripts/publish-notes.mjs           # 预演，只报告不写文件
node scripts/publish-notes.mjs --write   # 写入站点仓库的 src/content/notes/
```

脚本做四件事：文件名转 slug、注入 frontmatter、剥掉文末「副产物导航」整段、校验正文内链锚点。然后到站点仓库 commit / push，Actions 自动构建上线。

每篇笔记在 `scripts/publish.config.mjs` 里有一条配置，只填脚本推不出来的字段（slug、分类、中英文摘要、英文标题）。新增笔记时记得加一条，否则脚本会跳过并提示。

衍生字段（title、type、source、sourceUrl、author、duration、date、sourceId）全部从文件名、`media-note/README.md` 索引表和正文开头的来源引用块解析，不手写。

详细方案见 [`docs/site-notes-publishing.md`](docs/site-notes-publishing.md)。

## 凭证

BibiGPT Token 通过 `BIBIGPT_TOKEN_REGISTRY` 指向账号文件，已在 `.env` 里配好，不填在命令行里。查看余额：

```bash
python <skill>/scripts/token_registry.py list --registry <accounts.json>
```

## 安全

**本仓库是公开仓库。** `byproducts/`（原始字幕、时间轴转录等副产物）已 gitignore 并停止跟踪，只存本地；若历史提交里已含副产物，必须用 `git filter-repo --path byproducts/ --invert-paths` 重写历史并 force push，确保任何提交都不含完整 ASR 转写（公开即接近分发原视频字幕全文）。副产物如需备份，请放私有仓库或其他私有存储，不要推到本仓库。

`.env`、`accounts.json`、`accounts-tokens.json`、`*.token` 已在 `.gitignore` 中，不要把 Token 写进笔记、日志或提交记录。

`.workbuddy/` 也在 `.gitignore` 中——Agent 的 memory 里会记跨项目的绝对路径，不适合进仓库。
