# AGENTS.md

面向在本仓库工作的 AI Agent 与贡献者的操作手册：目录约定、命名规则、完整工作流、已知坑与安全红线。概览与特性见 [README.md](README.md)。

## 目录结构

工作区分三层：**给人读的成品笔记**放 `media-note/`，**提取过程的原始副产物**放 `byproducts/`，**人工还原的术语对照**放 `docs/asr-corrections/`。

```text
media-notes/
├── README.md / README.en.md / README.ja.md   # 三语 README
├── AGENTS.md                                 # 本文件
├── media-note/                               # 主产物（人读的最终笔记，按分类/系列分子目录）
│   ├── README.md                             # 笔记索引
│   ├── assets/                               # 笔记引用的静态资源（子目录笔记以 ../assets/ 引用）
│   ├── <分类>/                               # 如 AI 工具指南 / 软件使用说明 / 开发教程 / 学习路线 / 编程基础
│   │   ├── <标题> <类型>.md
│   │   └── <系列名>/                         # 同一视频合集的笔记归入同一系列文件夹
│   │       └── <标题> <类型>.md
│   └── ...
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
└── docs/                                     # 设计文档 + ASR 术语还原
    ├── site-notes-publishing.md
    └── asr-corrections/                      # ASR 还原对照（可提交、不发布；按讲者组织）
        ├── README.md                         # 索引：作者 → 对照表文件
        ├── <作者>.md                          # 该讲者的 ASR 还原对照表
        └── 存疑清单.md                        # 待人工审核的存疑项（与对照表分离）
```

## 主产物 `media-note/`

成品笔记**按分类**放在 `media-note/` 的分类子目录下，不再平铺在根目录。

### 分类

| 分类 | 用于 |
| --- | --- |
| `AI 工具指南` | AI skills、插件等工具的使用与实战 |
| `软件使用说明` | 具体软件 / Agent 产品的使用说明 |
| `开发教程` | RAG、Agent、源码工程等开发向教程 |
| `学习路线` | 阶段式学习路线 |
| `编程基础` | 通用编程基础概念 |

分类不限于上表，按内容主题增减；拿不准时优先按「内容主题」而不是来源分类。

### 系列文件夹

同一视频合集（同一 UP 主的系列、B 站多分 P 等）的笔记**必须**放在同一系列文件夹中，如 `开发教程/Agent方法论/`、`开发教程/Playwright 系列/`。系列文件夹位于分类文件夹之下；后续新增同系列笔记直接落入该文件夹，不要新开目录。

### 命名

`<标题或内容主题> <类型>.md`，类型取其一：

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
- 每新增一篇，同步在 `media-note/README.md` 对应分类的表里加一行。

### 索引表

`media-note/README.md` 按分类分组，每个分类一张表；表列结构（发布脚本解析依赖，**第 5 列必须是「来源链接」**，格式为指向原视频的 Markdown 链接，如 `[BV1V49MBLE6y](https://www.bilibili.com/video/BV1V49MBLE6y)`）：

```
| 类型 | 标题 | 来源 | 生成日期 | 来源链接 |
```

标题列的**链接**必须指向 `media-note/` 下的相对路径（含分类/系列目录，空格用 `%20`），发布脚本按链接而非链接文字解析文件位置。示例：

```
| 笔记 | [AI Agent 概述与开发指南笔记.md](开发教程/Agent方法论/AI%20Agent%20概述与开发指南笔记.md) | Bilibili / AI大模型码农 | 2026-09-05 | [BV1xwVr6FEh4](https://www.bilibili.com/video/BV1xwVr6FEh4?p=7) |
```

## 副产物 `byproducts/`

每个来源一个文件夹，目录名用短来源 ID：

- Bilibili → BV 号（如 `BV1xx411c7mD`）；
- 其他平台 → 稳定的短 ID（如 YouTube 视频 ID）；
- 需要按时间排序时，可加日期前缀 `20260830-BV1xx411c7mD`。

一个来源的所有副产物都收进它自己的文件夹，固定短文件名：`raw-subtitle.json`、`metadata.json`、`transcript.md`、`status.json`。

## ASR 术语还原 `docs/asr-corrections/`

视频字幕是语音识别产物，专有名词会被系统性误识别。误识别由讲者口音决定（同一个 UP 主会在不同视频里反复犯同样的错），所以**按讲者（UP 主）组织**，不按笔记组织：

- `<作者>.md`：该讲者的「ASR 还原对照表」，只放**已确定**的「误识别变体 → 正确术语」映射；
- `存疑清单.md`：所有**待人工审核**的存疑项集中于此（倾向判断、无法确认、需人工核对），按作者分组，含「已查证」回看记录——**与对照表分离**，拿不准的别塞进对照表；
- 笔记正文只留一行指针（指向作者文件 + 存疑清单），**指针必须放在 `## 副产物导航` 段内**——发布脚本只剥离该段，正文里的 `../docs/asr-corrections/` 链接发布后会变成死链；
- **先查后写**：整理新笔记前先读该讲者的 `<作者>.md`，命中就复用，发现新变体补回该作者的对照表；
- **查证规则**：包名、CLI 命令名、启动参数、文件路径、API 方法名、技术术语缩写**必须联网查证**（标「存疑」不等于免责）；模型版本号、UP 主昵称、视频未展示的命令原文可以只标存疑。

## 工作流

1. 拿到 URL 或本地文件，先取字幕，**不要走 BibiGPT 总结接口**；
2. 副产物落到 `byproducts/<source-id>/`，同时用 `--main-product-dir` 让脚本生成的链接指向 `media-note/`；
3. 由 Codex 基于字幕整理主产物，按分类写进 `media-note/<分类>/`（同一系列视频归入同一系列文件夹）；
4. 把 ASR 术语还原写到 `docs/asr-corrections/<作者>.md`（先读该作者的对照表，命中即复用），存疑项写进 `docs/asr-corrections/存疑清单.md`，笔记正文在 `## 副产物导航` 段内留指针；
5. 更新 `media-note/README.md` 对应分类的索引表，并在笔记文末加副产物导航。

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

1. **脚本按 slug 生成主产物链接名**（空格转成 `-`，如 `Superpowers-与-Harness-Engineering-笔记.md`），而笔记文件按本目录约定用空格命名。所以脚本写进 README 的链接是断的，**写完笔记后要手动把链接改成真实文件名（含分类/系列目录的相对路径，空格用 `%20`）**。
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
- `docs/asr-corrections/` **可提交**：它只是人工还原出的零散词条映射表，不含完整转写内容，不触碰上一条红线；
- `.env`、`accounts.json`、`accounts-tokens.json`、`*.token` 已在 `.gitignore` 中，不要把 Token 写进笔记、日志或提交记录；
- `.workbuddy/` 也在 `.gitignore` 中——Agent 的 memory 里会记跨项目的绝对路径，不适合进仓库。
