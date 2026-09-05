# AGENTS.md

面向在本仓库工作的 AI Agent 与贡献者的操作手册：目录约定、命名规则、完整工作流、已知坑与安全红线。概览与特性见 [README.md](README.md)。

## 目录结构

工作区只分两层：**给人读的成品笔记**放 `media-note/`，**提取过程的副产物**放 `byproducts/`。

```text
media-notes/
├── README.md / README.en.md / README.ja.md   # 三语 README
├── AGENTS.md                                 # 本文件
├── media-note/                               # 主产物（人读的最终笔记）
│   ├── README.md                             # 笔记索引
│   ├── assets/                               # 笔记引用的静态资源
│   └── <标题> <类型>.md
├── byproducts/                               # 副产物（字幕、元数据、转录；仅存本地）
│   ├── README.md
│   └── <source-id>/
│       ├── README.md
│       ├── raw-subtitle.json
│       ├── metadata.json
│       ├── transcript.md
│       └── status.json
├── scripts/                                  # publish-notes.mjs / publish.config.mjs
├── skills/                                   # skills.sh 技能源
├── .pi/skills/                               # pi 项目技能
└── docs/                                     # 设计文档
```

## 主产物 `media-note/`

成品笔记**直接平铺**在 `media-note/` 根目录，不再按来源分子目录。

命名：`<标题或内容主题> <类型>.md`，类型取其一：

| 类型 | 用于 |
| --- | --- |
| `笔记` | 默认。内容梳理、观点摘录、学习记录 |
| `指南` | 有明确操作步骤、需要照着做的内容 |
| `手册` | 内容量大、需要长期反复查阅的参考型内容 |

规则：

- 文件名用清理后的标题，去掉不能用于文件名的字符；
- 不把 `-raw-subtitle`、`-metadata`、`-transcript` 这类技术后缀拼进标题；
- 不把 BV 号写进标题，BV 号只作为副产物目录名；
- 同名文件已存在时追加短来源 ID，不覆盖；
- 正文开头必须有来源引用块（发布脚本依赖它解析元数据）：
  ```
  > 来源：[<视频标题>](<原视频URL>)
  > UP 主：<作者>｜时长：<mm:ss>｜整理日期：<YYYY-MM-DD>
  ```
- 每篇笔记文末必须有 `## 副产物导航`，链接回对应 `byproducts/<source-id>/README.md`；
- 每新增一篇，同步在 `media-note/README.md` 索引里加一行。

索引表列结构（发布脚本解析依赖，**第 5 列必须是「来源链接」**，格式为指向原视频的 Markdown 链接，如 `[BV1V49MBLE6y](https://www.bilibili.com/video/BV1V49MBLE6y)`）：

```
| 类型 | 标题 | 来源 | 生成日期 | 来源链接 |
```

## 副产物 `byproducts/`

每个来源一个文件夹，目录名用短来源 ID：

- Bilibili → BV 号（如 `BV1xx411c7mD`）；
- 其他平台 → 稳定的短 ID（如 YouTube 视频 ID）；
- 需要按时间排序时，可加日期前缀 `20260830-BV1xx411c7mD`。

一个来源的所有副产物都收进它自己的文件夹，固定短文件名：`raw-subtitle.json`、`metadata.json`、`transcript.md`、`status.json`。

## 工作流

1. 拿到 URL 或本地文件，先取字幕，**不要走 BibiGPT 总结接口**；
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

权威流程见 `.pi/skills/media-notes-publishing/SKILL.md`，完整方案见 `docs/site-notes-publishing.md`。要点：

- 原则：只发笔记正文，副产物一律不公开；发布是**手动**的本地脚本，push 本仓库不触发任何构建；
- 脚本做四件事：文件名转 slug、注入 frontmatter、剥掉文末「副产物导航」整段、校验正文内链锚点；
- 每篇笔记在 `scripts/publish.config.mjs` 里有一条配置，只填脚本推不出来的字段（slug、分类、中英文摘要、英文标题），否则脚本会跳过并提示；
- 派生字段（title、type、source、sourceUrl、author、duration、date、sourceId）全部从文件名、`media-note/README.md` 索引表和正文开头的来源引用块解析，不手写；
- 先 `node scripts/publish-notes.mjs` 预演，再 `--write`，最后到站点仓库 commit / push，Actions 自动构建上线。

## 凭证

BibiGPT Token 通过 `BIBIGPT_TOKEN_REGISTRY` 指向账号文件，已在 `.env` 里配好，不填在命令行里。查看余额：

```bash
python <skill>/scripts/token_registry.py list --registry <accounts.json>
```

## 安全红线

**本仓库是公开仓库。**

- `byproducts/`（原始字幕、时间轴转录等副产物）已 gitignore 并停止跟踪，只存本地；若历史提交里已含副产物，必须用 `git filter-repo --path byproducts/ --invert-paths` 重写历史并 force push，确保任何提交都不含完整 ASR 转写（公开即接近分发原视频字幕全文）。副产物如需备份，请放私有仓库或其他私有存储，不要推到本仓库；
- `.env`、`accounts.json`、`accounts-tokens.json`、`*.token` 已在 `.gitignore` 中，不要把 Token 写进笔记、日志或提交记录；
- `.workbuddy/` 也在 `.gitignore` 中——Agent 的 memory 里会记跨项目的绝对路径，不适合进仓库。
