# media-notes

[English](README.en.md) · [日本語](README.ja.md)

> 音视频 → 结构化笔记的一站式工作区。

`media-notes` 把音视频内容提取并整理成**给人读的结构化笔记**：用 `media-content-distiller` 技能抓取 B 站 / YouTube 等平台的字幕（由 BibiGPT 提供），再由 AI Agent 基于字幕整理成 `笔记` / `指南` / `手册`，并可一键发布到个人站点。

## 特性

| 特性 | 说明 |
| --- | --- |
| 🎬 多平台字幕获取 | 抓取 B 站 / YouTube 等平台字幕，原始 cue 逐条落盘留证 |
| 🤖 Agent 整理成稿 | 字幕 → 结构化笔记：按约定命名、索引、互链 |
| 📂 主产物 / 副产物分离 | 人读的笔记在 `media-note/`，字幕等副产物在 `byproducts/` |
| 📤 单向发布 | `scripts/publish-notes.mjs` 一键发布到个人站点；副产物一律不公开 |
| 🔒 公开仓库安全边界 | 完整 ASR 转写只留本地（gitignore），公开仓库不含副产物 |

发布目标站点：<https://dithob.github.io/notes/>（Astro · GitHub Pages / Actions 自动构建）。

## 目录结构

```text
media-notes/
├── README.md / README.en.md / README.ja.md   # 三语 README
├── AGENTS.md                                 # 面向 Agent 的操作手册（命名、工作流、安全红线）
├── media-note/                               # 主产物：人读的成品笔记（平铺）
│   ├── README.md                             # 笔记索引
│   └── <标题> <类型>.md
├── byproducts/                               # 副产物：字幕、元数据、转录（仅存本地）
│   └── <source-id>/
├── scripts/                                  # 发布脚本 publish-notes.mjs
├── skills/                                   # skills.sh 技能源（media-content-distiller 等）
├── .pi/skills/                               # pi 项目技能（media-notes-publishing）
└── docs/                                     # 设计文档
```

## 快速开始

1. 取字幕：`python <skill>/scripts/acquire_subtitle.py subtitle --input "<URL>" --output-dir ./byproducts --main-product-dir ./media-note --preflight`
2. 由 Agent 基于字幕写成主产物 `media-note/<标题> <类型>.md`
3. 更新 `media-note/README.md` 索引，并在笔记文末加 `## 副产物导航`
4. （可选）`node scripts/publish-notes.mjs --write` 发布到个人站点

命名规则、工作流细节与已知坑见 [AGENTS.md](AGENTS.md)；发布方案完整设计见 [docs/site-notes-publishing.md](docs/site-notes-publishing.md)。

## 发布到个人站点

```bash
node scripts/publish-notes.mjs           # 预演，只报告不写文件
node scripts/publish-notes.mjs --write   # 写入站点仓库 src/content/notes/
```

只发笔记正文，副产物一律不公开。每篇笔记在 `scripts/publish.config.mjs` 里有一条配置（slug、分类、摘要等，只填脚本推不出来的字段）；其余元数据从文件名、索引表和正文来源引用块解析。

## 配套技能（skills.sh 技能源）

本仓库同时是 [skills.sh](https://skills.sh) 的技能源：[`skills/`](skills/README.md) 下有 `media-content-distiller`、`extract-tool-registration`；项目自身的 `media-notes-publishing` 在 `.pi/skills/`（pi 项目技能，同为源的一部分）。任何 agent 一条命令安装：

```bash
npx skills add Dithob/media-notes --skill media-content-distiller
npx skills add Dithob/media-notes --skill extract-tool-registration
npx skills add Dithob/media-notes --skill media-notes-publishing
npx skills add Dithob/media-notes --list        # 查看全部
```

[![skills.sh](https://skills.sh/b/Dithob/media-notes)](https://skills.sh/Dithob/media-notes)

## 安全

**本仓库是公开仓库。** `byproducts/`（原始字幕、时间轴转录）已 gitignore 并停止跟踪；若历史提交含副产物，必须用 `git filter-repo --path byproducts/ --invert-paths` 重写历史。Token、账号文件同样不入库。完整边界见 [AGENTS.md](AGENTS.md#安全红线)。
