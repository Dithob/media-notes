---
name: media-notes-publishing
tags: ["notes-publishing", "astro", "markdown-pipeline", "personal-site", "media-notes"]
description: media-notes 项目的笔记发布 skill。当用户要求新增媒体笔记（字幕 → 笔记 → 索引 → 配置）、把 media-note/ 下的笔记发布到个人站点 https://dithob.github.io/notes/、或询问发布脚本/数据流逻辑时使用。涵盖新增笔记完整流程、publish-notes.mjs 的调用方式（预演/写入）、转换规则与已知坑。
---

# media-notes 笔记发布

media-notes 是一个音视频内容提取与整理工作区：用 `media-content-distiller` 抓字幕，Agent 整理成笔记，再**手动**发布到个人站点。

**核心结论：发布是手动触发的本地脚本，push 到 GitHub 不触发任何构建。** 发布链路为 media-notes → dithob.github.io（站点仓库）→ GitHub Pages。

## 一、新增笔记完整流程

新增一篇笔记时按此顺序操作：

1. **抓字幕**（在项目根目录执行）：
   ```bash
   python <skill>/scripts/acquire_subtitle.py subtitle \
     --input "<URL>" \
     --output-dir ./byproducts \
     --main-product-dir ./media-note \
     --preflight
   ```
   `<skill>` 为 `C:\Users\wujue\.workbuddy\skills\media-content-distiller`。副产物落在 `byproducts/<source-id>/`，**仅存本地**（已 gitignore，不进仓库）。

2. **整理笔记**：基于字幕由 Agent 写成 `media-note/<分类>/<标题> <类型>.md`，类型为 `笔记` / `指南` / `手册` 之一。分类取 `AI 工具指南` / `软件使用说明` / `开发教程` / `学习路线` / `编程基础`（或按内容主题新增）；**同一视频合集（同一 UP 主的系列、多分 P）的笔记归入同一系列文件夹**，如 `media-note/开发教程/Agent方法论/`。命名规则：
   - 用清理后的标题，不拼技术后缀（`-raw-subtitle` 等），不写 BV 号；
   - 同名文件已存在时追加短来源 ID，不覆盖；
   - 正文开头必须有来源引用块（发布脚本依赖它解析元数据）：
     ```
     > 来源：[<视频标题>](<原视频URL>)
     > UP 主：<作者>｜时长：<mm:ss>｜整理日期：<YYYY-MM-DD>
     ```
   - 文末必须有 `## 副产物导航` 段（注明副产物仅存本地并附原视频链接；发布时整段会被剥掉）。

   **ASR 术语还原单独落盘**：字幕误识别的专有名词还原，写到 `docs/asr-corrections/<作者>.md`（先读该作者对照表，命中即复用、新变体补回该作者文件；存疑项写进 `docs/asr-corrections/存疑清单.md`）。笔记正文**只留一行指针（指向作者文件 + 存疑清单），且必须放在 `## 副产物导航` 段内**——正文其他位置的 `../docs/asr-corrections/` 链接发布后会变成死链。

3. **更新索引**：`media-note/README.md` 对应分类的表里加一行。列结构（发布脚本解析依赖，**第 5 列必须是「来源链接」**，格式为指向原视频的 Markdown 链接，如 `[BV1V49MBLE6y](https://www.bilibili.com/video/BV1V49MBLE6y)`）：
   ```
   | 类型 | 标题 | 来源 | 生成日期 | 来源链接 |
   ```
   标题列的**链接**指向 `media-note/` 下的相对路径（含分类/系列目录，空格用 `%20`），发布脚本按链接解析文件位置：
   ```
   | 笔记 | [AI Agent 概述与开发指南笔记.md](开发教程/Agent方法论/AI%20Agent%20概述与开发指南笔记.md) | ... |
   ```

4. **加发布配置**：在 `scripts/publish.config.mjs` 的 `notes` 对象里加一条，key 用 `media-note/` 下的**相对路径**（含分类/系列目录）。只填脚本推不出来的字段：`slug`、`category`、`categoryEn`、`summary`、`summaryEn`、`titleEn`。**不加配置脚本会跳过该笔记并提示。**

5. **预演**：`node scripts/publish-notes.mjs`（只报告，不写文件）。检查输出里的剥离/改写/锚点统计。

6. **写入**：`node scripts/publish-notes.mjs --write`（写入站点仓库 `D:/TestProjects/dithob.github.io/src/content/notes/`）。

7. **站点侧发布**：脚本只写文件不提交。需要去 `D:/TestProjects/dithob.github.io` 手动 commit + push，仓库的 GitHub Actions 检测到 push 后自动构建 Astro 并部署到 GitHub Pages。

## 二、发布脚本调用方式

```bash
node scripts/publish-notes.mjs              # 预演：只报告不写文件
node scripts/publish-notes.mjs --write      # 实际写入站点目录
SITE_NOTES_DIR=<路径> node scripts/publish-notes.mjs --write   # 站点目录变了时覆盖
```

- 两个脚本文件：`scripts/publish-notes.mjs`（发布逻辑）、`scripts/publish.config.mjs`（站点目录 + 每篇的非派生字段）。
- 站点目录默认是兄弟目录 `../../dithob.github.io/src/content/notes/`，目录关系变化时用 `SITE_NOTES_DIR` 覆盖。

## 三、数据流

```text
media-notes 工作区（手动）
  media-note/<标题> <类型>.md + README 索引 + publish.config.mjs
        │ node scripts/publish-notes.mjs --write（手动，纯本地）
        ▼
dithob.github.io 仓库（手动 commit + push）
  src/content/notes/<slug>.md
        │ GitHub Actions（deploy.yml，push 自动触发）
        ▼
Astro 构建：src/pages/notes/index.astro（列表） + [...slug].astro（正文）
        ▼
https://dithob.github.io/notes/          ← 列表卡片（title/category/date/summary）
https://dithob.github.io/notes/<slug>/   ← 正文页
```

- media-notes 仓库本身的 push 与发布**无关**（无 Actions），只是公开备份。
- 单向流动：media-notes → 站点仓库，站点上的手工改动不回传。

## 四、publish-notes.mjs 内部逻辑

1. 解析 `media-note/README.md` 索引表 → 每篇的类型/来源/日期/来源链接（从链接 URL 提取 sourceId）；
2. 读 `publish.config.mjs` → slug、分类、中英文摘要；
3. 解析正文开头来源引用块 → sourceTitle / sourceUrl / author / duration / date；
4. 转换正文：去掉首行 H1 → 剥掉文末「副产物导航」整段 → 残留的 `../byproducts/` 链接改写为原视频；
5. 生成 frontmatter（title/type/source/sourceUrl/author/duration/sourceId/date/draft + 配置字段）；
6. 文件名转 slug（用配置里的 slug）；
7. 锚点校验：从站点仓库 node_modules 加载同一份 github-slugger，校验正文内链标题锚点。

## 五、已知坑

- 索引表第 5 列必须是「来源链接」列，删列或改列名会导致脚本解析失败；
- 副产物导航段的标题必须保持 `## 副产物导航`，脚本按标题剥离到文末；
- `media-content-distiller` 脚本按 slug 生成的主产物链接名与实际文件名不一致，写完笔记要手动修正；
- 指向 `docs/asr-corrections/` 的链接**必须放在 `## 副产物导航` 段内**，放正文其他位置会在站点上变成死链（发布脚本只剥离导航段、只改写 `../byproducts/` 链接）；
- byproducts/ 含完整 ASR 转写，**绝不**提交到本公开仓库（已 gitignore），备份放私有存储；
- `.env`、`accounts*.json`、`*.token` 已在 .gitignore，不要把 Token 写进笔记、日志或提交记录。
