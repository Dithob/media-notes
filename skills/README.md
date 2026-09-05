# Skills（本仓库 = skills.sh 技能源）

本目录是 [skills.sh](https://www.skills.sh/Dithob/media-notes) 的技能源仓库：目录下的每个子目录
是一个标准 Agent Skill（`SKILL.md` + YAML frontmatter），可通过 `npx skills` 直接安装到
Claude Code、Codex、Cursor、Gemini CLI、Pi 等 agent。

## 技能清单

| 技能 | 用途 | 安装 |
| --- | --- | --- |
| [`media-content-distiller`](media-content-distiller/) | 音视频内容蒸馏：公开 URL → BibiGPT 字幕（curl 或自带 Node CLI）→ AI 整理成摘要/大纲/手册/学习笔记 | `npx skills add Dithob/media-notes --skill media-content-distiller -g -y` |
| [`extract-tool-registration`](extract-tool-registration/) | 提取工具（BibiGPT）账号注册与开放平台 API Key 获取（Web UI 自动化测试 · 仅学习/测试） | `npx skills add Dithob/media-notes --skill extract-tool-registration -g -y` |

## 安装全部技能

```bash
npx skills add Dithob/media-notes --all
npx skills add Dithob/media-notes --list   # 先看看有哪些
```

## 目录约定

```text
skills/
├── README.md                      # 本文件：技能源索引
├── media-content-distiller/       # 独立 skill，含 CLI、脚本、测试、references
│   ├── SKILL.md
│   ├── package.json / bin/ / lib/ / scripts/ / tests/ / references/
│   └── README.md / README.en.md / CHANGELOG.md / LICENSE
└── extract-tool-registration/
    ├── SKILL.md
    └── scripts/verify-tokens.sh
```

- 每个技能自包含：不引用仓库其他路径，副本可直接安装到任意 agent；
- `name` 为小写 kebab-case，目录名与 frontmatter `name` 保持一致；
- 新增技能 = 新增子目录 + `SKILL.md`，本表加一行；
- 技能迭代后提交到 `main`，skills.sh 会自动重新收录（页面 `https://skills.sh/Dithob/media-notes`）。

## 安全边界

- `media-content-distiller` 只接受用户本人授权的 Token，`.env` / `accounts.json` 等凭证文件
  已在 `.gitignore` 中全局排除，禁止提交；
- `extract-tool-registration` 仅用于学习/测试的自建账号，遵守目标站点 ToS，发现验证码/风控即停止；
- 技能内出现真实 Token、Cookie、账号密码即视为事故，立即从历史中清除。
