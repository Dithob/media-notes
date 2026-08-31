# Pi Agent 使用手册
> 来源：[原始内容](<https://www.bilibili.com/video/BV15wGR6CEhY/>)
> 整理日期：2026-08-31


> **来源说明**：本手册主体整理自 B 站视频《Pi Agent：比Claude Code和Codex更适合普通人的AI工具》（UP主：第四种黑猩猩CHIMP，2026-05-25 发布，21分18秒），关键步骤附时间戳可回看；标注 **【背景补充】** 的内容来自检索到的官方/社区资料（2026-08-19 查证），非视频原话。

---

## 1. Pi Agent 是什么

**一句话定位**：一个极简主义的本地 Agent——底座只保留 4 个基础工具（读文件、写文件、改文件、跑命令），其他一切能力靠安装 skill 按需扩展，最终"搭出一个属于你自己的 Agent"。

视频开场的判断：世界上 T0 级别的 Agent 有四个——**Claude Code、Codex、OpenCode、Pi Agent**。前三个名字里都带 code，主要是帮你写代码；Pi Agent 最冷门（国内几乎没人聊），但也最特别：它不是帮你写代码，而是帮你**完成日常任务**。

| 维度 | Coding Agent（Claude Code / Codex / OpenCode） | Pi Agent |
|---|---|---|
| 定位 | 代码智能体，产出是代码 | 日常任务智能体，产出是结果（文件/网页/音频/视频） |
| 预装能力 | 代码索引、测试运行、Git 操作、编码规范整套 | 只有 4 个工具：读 / 写 / 改 / 跑命令 |
| 扩展方式 | 出厂即全套 | 装 skill 才有能力，一人一个 Pi |
| 系统提示词 | Claude Code 约 2 万 token；Codex/OpenCode 约 1.5 万 | **不到 1500 token** |
| 类比（视频原话） | 预制菜——内置完整写代码流程 | 自己搭的个性化工作台 |

极简底座带来的三个直接好处（04:10）：

1. **快**：上下文短，模型算得快、答得快；
2. **省 token**：UP主体感，同规模任务消耗约为 Claude Code 的 1/3 甚至更少；
3. **更聪明、更听话**：没有上万字的编程预设提示词抢占注意力，模型注意力更集中，日常任务表现更好。

佐证数据（视频引述）：OpenRouter 排行榜上 Pi 每日 token 消耗量排第六，紧随 Claude Code 之后；OpenAI Codex 负责人称约 5% 的生产流量跑在这个 agent 上。单次对话消耗只有其他 agent 的几分之一，总量还能排第六，说明海外极客圈已有大批人把它当日常工具。

**【背景补充】Pi 的身世与生态**（检索自社区资料）：

- 作者是 **Mario Zechner（网名 badlogic）**，知名 Java 游戏框架 **libGDX 的作者**（GitHub 23k+ star）；
- 开源仓库：[github.com/badlogic/pi-mono](https://github.com/badlogic/pi-mono)，TypeScript Monorepo，MIT 协议，社区文档站 [pi.dev](https://pi.dev)；
- 刻意**没有内置**：MCP、子 Agent、权限弹窗、Plan 模式、内置 Todo、后台 Bash——这些全部通过 Skills / Extensions 按需加；
- 架构是一套"乐高积木"：`pi-ai`（20+ LLM 提供商统一 API）、`pi-agent-core`（Agent 运行时）、`pi-coding-agent`（终端主产品）、`pi-tui` / `pi-web-ui`（界面）、`pi-pods`（GPU 部署管理）；
- 热门项目 OpenClaw 的核心运行时就基于 Pi 的 SDK 构建。

---

## 2. 安装与启动

### 2.1 前置：安装 Node.js（05:21）

几乎所有 Agent 都依赖 Node.js。去官网选自己系统的安装包，双击一路下一步即可。已装过的跳过。

### 2.2 可选：设置 npm 国内镜像加速（05:42）

国内网络建议先配镜像（视频用的是腾讯镜像）：

```bash
npm config set registry https://mirrors.tencent.com/npm/
```

### 2.3 路径 A：Web 版启动（视频演示的方式，05:53）

Windows 打开 PowerShell，Mac 直接开终端，同一条命令：

```bash
npx @agegr/pi-web@latest
```

- 回车后询问是否继续，输入 `Y`；
- 首次运行要下载项目文件会慢一些，之后更新走缓存会快很多；
- 装好后自动弹出网页应用。

> 说明：`@agegr/pi-web` 是 UP主自己开发并开源的 Pi 网页壳（他自用了三个月），底层跑的还是 Pi。Pi 官方本体是终端形态，这个壳把它包成了易用的 Web 应用：左边文件浏览器 + 中间对话框 + 模型/skills 设置。

**【背景补充】路径 B：官方终端版**（更原生，适合习惯命令行的人）：

```bash
npm install -g @mariozechner/pi-coding-agent
pi                # 交互模式
pi "帮我做某件事"  # 单次任务模式
```

认证两种方式：设置环境变量 `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`，或在交互模式输入 `/login` 走浏览器 OAuth（可直接用 Claude Pro / ChatGPT Plus 订阅）。

---

## 3. 首次配置：接入模型（06:43）

没有模型，Agent 再好也没用。Web 版配置三步：

1. **添加服务商**：点击"模型"→"添加模型服务商"。Pi 支持很多官方供应商，也支持走 ChatGPT 订阅；列表里没有的就选 **custom 自定义接口**——和其他 Agent 配接口一样，填 `base URL` + `API Key` 保存即可。
2. **添加模型**：填模型名，按需勾选能力。视频示例（GPT-5.5）的配置：

| 配置项 | 视频取值 |
|---|---|
| 推理模式 | ✅ 勾选 |
| 图片输入 | ✅ 允许 |
| 思考模式 | 选最高的 |
| 上下文窗口 | 20 万 |
| 最大 token 输出 | 6.4 万 |

3. **连通性测试**：先发个"你好"确认模型通了；再问"看一下我的桌面上有什么"，能列出桌面文件说明本地文件读取正常。

### 什么都不装时的"裸装能力"（07:44）

下载完什么 skill 都没加的 Pi，已经能做不少事：

- 整理文件夹
- 批量改文件名
- 执行命令、跑脚本
- 凡是本地电脑上能通过"文件 + 命令"完成的事，基本都能交给它

---

## 4. 核心概念：Skill（08:01）

**记住一个公式：Agent + Skill**。这是普通人跟上 AI 时代最本质的框架。

**Skill 就是一份给 Agent 的说明书 / 操作手册**——Agent 读完就知道具体怎么干活。装一个 skill，Agent 就多一项能力：搞研究的装 PDF、搜索的 skill；办公的装表格 skill；想让它开口说话装 Edge TTS；想做视频装 Hyperframes。每个人手里的 Pi 最后长得都不一样，官网口号就是这个意思："世界上有很多 Agent，但 Pi Agent 是你自己的 Agent。"

### 安装方式与作用域（08:40）

Web 版点 Skills → 添加 skill → 搜索名字 → 安装。装的时候有两个选项：

| 作用域 | 含义 | 建议 |
|---|---|---|
| **global** | 所有项目都能用 | 默认选这个 |
| **project** | 仅当前项目可用 | 特定项目隔离时用 |

### 装完怎么验证（16:34）

直接问 Agent：

```
你现在安装了哪些 skills？他们的位置在哪里？
```

它会列出自己当前拥有的全部技能。

---

## 5. 五大 Skill 配方（覆盖 90% 日常场景）

| # | 能力 | Skill | 需要的账号/凭证 | 成本 |
|---|---|---|---|---|
| 1 | 联网搜索 | Tavily / Brave Search | 官网注册 API Key | 免费每月各 1000 次 |
| 2 | 读文档 | PDF / Word / Excel / PPT skill | 无 | 免费 |
| 3 | 语音合成 | Edge TTS | **无需任何账号** | 免费 |
| 4 | 生成图片 | GPT Image Two | ChatGPT Plus / Pro 订阅 | 订阅内 |
| 5 | 做视频 | Hyperframes | 无（本地渲染） | 免费开源 |

### 5.1 搜索：让 Pi 联网（09:03）

两家服务商任选：

- **Tavily**：注册简单，免费账号每月 1000 次搜索，适合新手（视频演示用一个）；
- **Brave Search**：结果更好一点，但要绑信用卡，免费额度同为 1000 次/月。skill 推荐装 **badlogic 写的那版**（badlogic 是 Pi 的作者，他的 skill 质量有保障，10:47）。

**配置方法（09:35）**：官网注册 → 复制 API Key → 回到 Pi 直接对话：

```
帮我设置 tavily search 用的 key，key 是 xxxxx
```

Pi 会自己把 Key 写进配置，不需要手动改配置文件。

**验证任务（09:57）**：

```
搜一下这周最重要的五条 AI 新闻，按重要程度排序，
每条说明发生了什么、为什么重要、适不适合做短视频，
保存到一个 news.md 文件
```

Pi 会调用搜索 skill，去重、排序、评价搜索结果，最后在当前目录生成 news.md（Web 版右侧还有预览界面）。

### 5.2 读文档：PDF / Office（11:07）

- **PDF**：推荐装 OpenAI 发布的 PDF skill。文字版 PDF 直接提取文字读；**扫描版 PDF 需要在模型设置里打开图像识别能力**（就是第 3 节勾选的"允许图片输入"），让模型能看见 PDF 里的图。
- **Word**（读文档）、**PPT**（拆演示文稿）、**Excel**（处理表格）各有对应 skill，其中 PPT 门道最多（UP主说以后单独出视频）。

**验证任务（11:26）**：把 PDF 拖进工作目录 → 刷新文件浏览器 → `@` 这份报告：

```
读取这个 PDF，总结里面的核心信息
```

十几页的技术报告（视频用的是 DeepSeek 技术报告）会被读完并整理成结构化总结。**重点是全程不用复制内容、不用自己提文字，文件丢给它就行。**

### 5.3 语音：Edge TTS（12:23）

不需要任何账号，直接安装就能用。

**演示工作流（12:40）**——把 5.1 生成的 news.md 变成"语音 + 网页"：

```
@这份文件 把这份文件改成一分钟的口播稿，转成语音，
做一个 HTML 界面，里面包含文稿和音频，排版简单直观，
然后帮我打开这个网页
```

约 3 分钟后 Pi 自动完成四步：写口播稿 → 调 Edge TTS 生成 MP3 音频 → 写 HTML 把文稿和音频装进去 → 自动弹出网页。这一步已经有**工作流**的感觉了：搜索 skill 找信息、Pi 整理、TTS 出语音、HTML 落地成可打开可分享的文件。以前聊天机器人只能把结果输出在对话框里，Pi 能把答案变成你电脑上的文件、网页、音频。

### 5.4 生图：GPT Image Two（14:17）

原理是调用 Codex 里的 GPT Image Two 生图——**订阅了 ChatGPT Plus 或 Pro 就能把生图能力交给 Pi 用**。

**验证任务（14:37）**：

```
根据这个文件的第一条 AI 新闻，用 GPT Image Two 生成一张
适合短视频封面的图片，风格是简洁的 3D 科技感
```

**已知坑（15:06）**：Mac 上直接可用；**Windows 上遇到脚本报错不用慌**——万事皆问 AI，让 Pi 检查 skill 脚本哪里有 bug、修复再运行，它自己完全能修好。

### 5.5 视频：Hyperframes（15:28）

UP主最近最喜欢用的 skill，适合做讲解类视频、产品介绍、科普动画、过程演示。思路很巧妙：**不是直接让 AI 生成视频，而是先让 Agent 写一个带动画的 HTML 网页**——HTML 是代码，生成非常稳定、可编辑、可预览，然后再逐帧渲染成完整视频。你不需要懂 HTML 代码，只要告诉它你想要什么。

**验证任务（16:07）**：

```
用 Hyperframes 做一个 20 秒的动画，解释什么是 agent，
只生成 HTML，不需要渲染视频
```

它会做出标题、转场、图形动画、字幕节奏，再配上语音和图片就能变成完整视频。

**【背景补充】Hyperframes 背景资料**：HeyGen 公司 2026 年 4 月开源（Apache 2.0，GitHub `heygen-com/hyperframes`，上线数天 6600+ star，现 24k+）。核心命令 `npx hyperframes render --output output.mp4`，用无头 Puppeteer 逐帧采集 + FFmpeg 编码，**确定性渲染**（同一 HTML 每次输出完全一致）；支持 GSAP、Lottie、CSS 动画、Three.js、WebGL shader 转场；要求 Node.js 22+ 和 FFmpeg。它不止支持 Pi，Claude Code、Cursor、Codex 等支持 skill 的 Agent 都能装（`npx skills add heygen-com/hyperframes`）。注意它只管"合成和渲染"——图片、视频素材、音频这些内容资产要靠其他 skill（如 5.4 的生图）或你自己提供。

---

## 6. 综合实战：从一句话到一份行业调研演讲（16:52）

五个 skill 都解锁后（搜索的、读资料的、语音的、生图的、做视频的），单独看每个都不复杂，**串起来就能做很复杂的任务**。

### 任务原文（17:10）

> 做一个调研项目：一台英伟达 GB200 NVL72 的 AI 机柜要 300 万美元左右，钱到底花在了哪里？要求：做成中文的 Hyperframes 演讲，用 TTS 配音，用 GPT Image Two 生成图片素材，关键数字数据必须有来源，不确定的地方写清楚是估算，长度约 2 分钟，需要有字幕显示，不需要渲染视频。

只需要说清"我要什么结果"，Pi 自动拆解成 7 步执行：

| 步骤 | 动作 | 用到的 skill |
|---|---|---|
| 1 | 搜英伟达官方 GB200 NVL72 产品信息、公开报道与成本估算 | 搜索 |
| 2 | 整理资料，把关键数字和来源单独记录 | — |
| 3 | 拆解成本：算力核心、网络互联、液冷等 | — |
| 4 | 写中文演讲稿，把硬件名词翻译成人话 | — |
| 5 | 生成图片素材 | GPT Image Two |
| 6 | 生成中文语音解说 | Edge TTS |
| 7 | 把标题页、成本拆解、图片、动画、语音组合成演讲页面 | Hyperframes |

**交付物是一个完整的项目文件夹**：资料笔记、成本拆解、中文演讲稿、语音文件、全部图片素材，外加一个可直接打开预览的 Hyperframes 页面。成品里连数据口径都交代得很清楚（如"36 颗 GB200 Superchip 按 HSBC 估计每颗 6–7 万美元、合计约七到八成整机成本""整柜功耗 120kW、重 1.36 吨，需要液冷供电等工程成本""最不确定的是实际成交价和非芯片部分拆分"）。

### 成本参考（13:52)

很多人担心 Agent 跑任务很贵，实际体感：

- 上面这种**多步骤长任务，单次约 0.3 美元额度**（从搜索到语音到 HTML 的完整工具调用链）；
- 实际支出更低：订阅 200 美元档套餐，每月可折合 5000–10000 美元的 API 额度；
- 且 Pi 上下文提示词极短，token 消耗比其他代码智能体低很多。

---

## 7. 常见问题

| 问题 | 处理办法 |
|---|---|
| Windows 上 skill 脚本报错（如生图 skill） | 不用慌，直接让 Pi 自己检查 skill 脚本的 bug 并修复重跑（15:13） |
| 扫描版 PDF 读不出文字 | 在模型设置里打开图像识别能力（11:17） |
| 列表里没有我的模型服务商 | 选 custom 自定义接口，填 base URL + API Key（06:59） |
| 不确定当前装了什么能力 | 问 Agent："你现在安装了哪些 skills？"（16:34） |

**【背景补充】官方终端版常用命令**（Web 版用不到，终端党备查）：

| 命令 | 作用 |
|---|---|
| `pi -c` | 继续上一次会话 |
| `pi -r` | 浏览并恢复历史会话 |
| `/model <名字>` 或 Ctrl+L | 切换模型 |
| `/tree` | 可视化查看对话分支树 |
| `pi install npm:@foo/pi-tools` | 安装 npm 扩展（也支持 `git:github.com/user/repo`） |
| `pi list` | 查看已安装扩展 |

---

## 8. 方法论小结

- **两类 Agent**：Coding Agent 产出代码，解决的是开发效率；Pi 这种日常任务 Agent 产出结果（代码只是中间手段），解决的是**工作流的效率**。
- **极简 + 按需扩展**：底座只留 4 个工具，能力靠 skill 一个一个加——装搜索就联网、装 Office 就读资料、装 TTS 就开口说话、装 GPT Image Two 就生图、装 Hyperframes 就做动画演讲。每个人的 Pi 都不一样。
- **串起来才是真正的强大**：单一 skill 都不复杂，串联后能完成"像工作一样的任务"——从一句话开始，交付一份完整的行业调研演讲报告。
- **最佳学习方法**（UP主建议）：别光看视频，打开电脑一边看一边动手。

---

## 附录：来源与副产物

| 项 | 内容 |
|---|---|
| 视频 | [Pi Agent：比Claude Code和Codex更适合普通人的AI工具](https://www.bilibili.com/video/BV15wGR6CEhY/)（BV15wGR6CEhY，21:18） |
| UP主 | 第四种黑猩猩CHIMP |
| Pi 开源仓库 | [github.com/badlogic/pi-mono](https://github.com/badlogic/pi-mono)（【背景补充】） |
| 社区文档 | [pi.dev](https://pi.dev)（【背景补充】） |
| Hyperframes | [github.com/heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)（【背景补充】） |
| 字幕/转录副产物 | [仅本地保存](https://www.bilibili.com/video/BV15wGR6CEhY/)（含时间轴转录、元数据、边界说明） |

## 副产物导航

副产物（原始字幕、时间轴转录、元数据）仅存本地，不进公开仓库。来源：[https://www.bilibili.com/video/BV15wGR6CEhY/](https://www.bilibili.com/video/BV15wGR6CEhY/)
