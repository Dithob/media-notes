# Pi 使用手册

> 来源：[Pi 大道至简，超越 Codex 和 Claude Code 的极简 Agent，保姆级全攻略，一期视频精通](https://www.bilibili.com/video/BV139bD6gEa8)
> UP 主：技术爬爬虾｜时长：44:38｜整理日期：2026-08-30
> 本手册基于字幕整理。ASR 转写对 Pi 本体名有大量误识别（派 / pad / pie / PAGENT 混用），专有名词已按上下文统一还原为 Pi，其余还原见[附录 A](#附录-aasr-还原对照表)。

> **⚠️ 2026-08-30 修订说明**：初版把 9 个插件名直接按 ASR 读音列出、未做查证。对照 [pi.dev 官方包目录](https://pi.dev/packages) 核实后**修正 5 处**：
> `pi-web-assistant`→**`pi-web-access`**｜`pi-sub-agents`→**`pi-subagents`**｜「GOGO 模式 `/go`」→**goal 模式 `/goal`**｜`plan-mode` 命令→**`/plan`**｜全局插件目录 `~/.pi/extensions/`→**`~/.pi/agent/extensions/`**。
> 修正项已在正文中标注来源，详见[第七章](#七扩展能力一插件)与[附录 B](#附录-b存疑清单)。

## 一句话结论

Pi 是一个把「少即是多」做到极端的 coding agent：**只有 4 个工具、系统提示词仅约 1000 token**，因此上下文占用和成本远低于 Codex / Claude Code，速度也更快。它没有 MCP、子代理、计划模式、Todo、BTW——这些**全部通过插件补回来**，另外还有 skills 和 `AGENTS.md` 两条扩展路径。代价是**几乎零安全限制**：一旦启动就全程最高权限、无审批，官方建议用容器或虚拟机兜底。

---

## 速查表

### 启动参数

| 命令 | 作用 | 备注 |
|---|---|---|
| `pi` | 交互式启动 | 在项目目录启动，该目录即项目根目录 |
| `pi -p "<指令>"` | 非交互模式，后台静默执行后输出结果 | 适合当一次性 CLI 命令用 |
| `pi -c` | 从**最近一次** session 继续 | 字幕读作「PGC」，按上下文还原 |
| `pi -r` | 列出 session 供挑选后继续 | 字幕读作「P 杠 R」 |

> ⚠️ 字幕只给出「杠 P」「PGC」「P 杠 R」的读法，未显示完整命令原文。以上为按上下文还原，**使用前建议 `pi --help` 确认**。

### 斜杠命令

| 命令 | 作用 |
|---|---|
| `/login` | 配置模型（API Key 或订阅登录） |
| `/model` | 切换模型 |
| `/new` | 新开 session，清空上下文 |
| `/tree` | 展开对话树，回退到历史节点 |
| `/clone` | 把当前 session 完整复制成新 session |
| `/fork` | 选一个对话节点，从该节点复制出新 session（只带该节点之前的历史） |
| `/compact` | 手动触发上下文压缩 |
| `/reload` | 重新加载插件（自写插件后必用） |

插件带的命令（**具体以所装插件的 README 为准**）：

| 命令 | 来自插件 |
|---|---|
| `/run` `/chain` `/parallel` `/agents` | `pi-subagents` |
| `/btw` | `pi-btw` |
| `/plan` | `pi-plan-mode` |
| `/goal` | `pi-goal` 系 |
| `/workflows` `/deep-research` | `pi-dynamic-workflows` |

### 快捷键

| 快捷键 | 作用 | 平台 |
|---|---|---|
| `Shift+Tab` | 切换模型思考强度 | 通用 |
| `Ctrl+L` | 打开模型选择器 | 通用 |
| `Shift+Enter` | 输入框内换行（回车直接发送，换行别按回车） | 通用 |
| `Ctrl+G` | 打开记事本编辑多行提示词，保存关闭后同步回输入框 | 通用 |
| `Alt+V` | 粘贴剪贴板截图 | Windows |
| `Ctrl+V` | 粘贴剪贴板截图 | Mac |
| `Alt+Enter` | 以 **follow up** 方式发送（排队，等本轮做完） | Windows |
| `Option+Enter` | 同上 | Mac |
| `Alt+↑` | 把排队中的指令取回重新编辑 | 通用 |
| `Ctrl+C` ×2 | 退出 Pi | 通用 |
| `Ctrl+O` | 展开查看内容（如回退总结） | 通用 |
| `! <命令>` | 在对话窗口内临时运行命令，**AI 可见结果** | 通用 |
| `!! <命令>` | 临时运行命令，**AI 看不到** | 通用 |
| `@` | 选择项目内文件作为上下文 | 通用 |

> ⚠️ **Windows 必做一步**：PowerShell 默认把 `Alt+Enter` 占为全屏快捷键，会跟 Pi 的 follow up 冲突。去 PowerShell 设置 → 操作 → 找到 `Alt+Enter`（全屏），删掉并保存。

### 关键路径

| 用途 | 路径 | 可信度 |
|---|---|---|
| 项目级插件 | `<项目>/.pi/extensions/` | 字幕已验证 |
| 全局插件 | `~/.pi/agent/extensions/` | 字幕说「点派 → agent 文件夹 → 粘贴 extensions」，与第三方文档一致 |
| 项目级 skill | `<项目>/.agents/skills/<skill名>/SKILL.md` | 字幕已验证 |
| 全局 skill | `~/.agents/skills/…`（字幕）或 `~/.pi/agent/skills/…`（第三方文档） | ⚠️ **两种说法并存**，见[附录 B](#附录-b存疑清单) |
| 项目记忆 | `<项目>/AGENTS.md` | 已交叉验证 |
| 全局记忆 | `~/.pi/agent/AGENTS.md` | 已交叉验证 |
| 全局追加系统提示词 | `~/.pi/agent/APPEND_SYSTEM.md`（优先级高于 AGENTS.md） | 目录层级按第三方文档补正 |
| MCP 配置 | `<项目>/.mcp.json`（需装 pi-mcp-adapter） | 字幕已验证 |

Windows 下 `~` = `C:\Users\<你的用户名>\`。目录不存在就手动新建。

> 路径清单已对照 pi.dev 包目录与第三方配置文档核过。初版漏了 `agent/` 这一层（全局插件和 `APPEND_SYSTEM.md` 都写成 `~/.pi/` 下），已补正。全局 skills 路径两种说法并存，见[附录 B](#附录-b存疑清单)。

### 状态栏怎么读

```
↑ 1.2k  ↓ 11k  R 8.4k  CH 92%  $0.31 (SUB)  4.6% / 272K  auto  openai/gpt-5.6.high
```

| 字段 | 含义 |
|---|---|
| `↑` | 整个 session 累计**输入** token |
| `↓` | 整个 session 累计**输出** token |
| `R` | 整个 session 命中缓存的 token 数（read） |
| `CH` | cache hit rate，**只统计最近一次**请求，不是整个 session |
| `$x.xx (SUB)` | 本次对话预估成本；`SUB` = subscription，用订阅时成本仅供参考 |
| `4.6% / 272K` | 已占用上下文百分比 / 模型总上下文窗口 |
| `auto` | 上下文压缩机制，auto = 达到阈值自动压缩 |
| 末尾 | 模型提供商 / 模型名 `.`思考强度 |

> session（字幕读作「赛森」）＝ 一段连续的对话记录。新开 session 会清空上下文窗口。

---

## 一、Pi 为什么这么设计

**极简的两个数字**（字幕已验证）：

- 只有 **4 个基础工具**：读文件、写文件、改文件、运行命令。
- 系统提示词仅约 **1000 token**。在 Pi 里说句你好，总共占用约 1100 token；而在 Codex 里，同样打个招呼就占 **18000 token**，白白吃掉 7% 上下文窗口，什么都没干。

**性能数据**（字幕已验证，均为作者转述的第三方测试）：

| 来源 | 结论 |
|---|---|
| Composer 上月的基准测试 | Pi 完成编程任务的速度比其他 coding agent 快 **1.5–2 倍**，任务成本低于主流框架 |
| Databricks（字幕误作「data breaks」）在自家百万行代码仓库上的基准 | 横轴成本、纵轴任务通过率的图上，Pi 在**大部分场景**优于 Claude Code 和 Codex；整张图代码质量最高点是 **Pi + Claude Opus** 的组合 |

> ⚠️ 组合中的模型版本号字幕读作「4.8」，当前无法确认（Claude 现役版本号无 4.8）。**存疑**。

**设计哲学**（字幕已验证）：

- 核心越小越干净，模型反而发挥得更好；让用户有最大自由度去组装其他能力。
- 官网首页那句话：**让工具适应你的工作流，而不是你去适应工具。**
- 4 个工具里，`bash`（运行命令）本身是万能工具——可以调 `fd` 搜文件、`rg`/`grep` 检索代码、`ls` 看目录。

**明确没有的东西**：MCP、sub agent、plan mode、todo、BTW。想用就装插件。

## 二、安装

零准备，不需要预先装任何东西。

**Windows**：

1. 桌面右键 → 在终端打开，进入 PowerShell。
2. 官网复制 PowerShell 一键安装命令，粘贴回车。
3. 检测不到 Node.js → 输入 `Y` 装 Node.js。
4. 再输入 `Y` 装 Pi 本体。
5. **Pi 用 Git Bash 作为命令行运行环境**，没装 Git 会询问，建议输入 `W` 让它帮你装。
6. 装完**关闭当前窗口**，重新右键打开一个终端，输入 `pi` —— 能看到对话窗口即安装成功。

**Mac**：打开终端 → 官网复制 **curl** 那条命令（注意不是 PowerShell 那条）→ 粘贴执行即可。

> 字幕未显示安装命令原文（只说「官网复制一键安装命令」）。第三方整理的官网命令如下，**执行前请先到官网确认**：
>
> ```bash
> # Windows PowerShell
> powershell -c "irm https://pi.dev/install.ps1 | iex"
> # macOS / Linux
> curl -fsSL https://pi.dev/install.sh | sh
> # 或用 npm
> npm install -g @mariozechner/pi-coding-agent
> ```
>
> 另注：视频说「Pi 用 Git Bash 作为运行环境」是 Windows 下的情况。

## 三、配置模型

输入 `/login`，两种方式二选一。

### 方式 A：API Key

1. 选 API Key 方式。Pi 支持 **40 多家**模型供应商，基本覆盖市面常见模型。
2. 输入关键词筛选（视频以 DeepSeek 为例）→ 回车。
3. 去厂商官网（DeepSeek：API 开放平台）确认有额度 → API Keys → 创建 API key → 复制。
4. 粘回 Pi 回车，打个招呼能收到回复即配置完成。

> 视频中的模型名读作「DeepSeek V4 Pro / V4 Flash」，为字幕还原。

### 方式 B：模型订阅

1. `/login` → 选 `Sign in with account` → 选服务商（视频以 **OpenAI Codex** 为例）→ 选「用浏览器登录」。
2. 浏览器完成登录，回到 Pi 按 `Ctrl+L`，模型列表里就出现 ChatGPT 的模型。

**切换与调节**：

- `/model` 切换模型；
- `Shift+Tab` 切换**思考强度**，按任务复杂度选；
- `Ctrl+L` 快速打开模型选择器。

## 四、第一份任务：从零做一个网页

1. 新建文件夹作为项目目录，在里面右键→终端打开→输入 `pi`。**窗口里显示的当前文件夹就是项目文件夹**，Pi 会把代码写到这里。
2. 输入多行提示词：`Shift+Enter` 换行，或 `Ctrl+G` 开记事本编辑（更方便，保存关掉后自动同步回输入框）。**回车是发送，不是换行。**
3. 跑完看状态栏信息（见速查表）。

**启动项目**：直接敲英文 `!` 再接命令，例如 `! npm run dev`，开发服务器就在当前对话窗口里跑起来了。

| 写法 | 效果 |
|---|---|
| `! <命令>` | AI **能看到**命令的运行过程和结果 |
| `!! <命令>` | AI **看不到** |

**迭代修改的两种方式**：

- **截图**：`Alt+V`（Mac `Ctrl+V`）粘贴截图，直接说哪儿不满意。视频里用「浮动卡片数量太少」一句话，Pi 读图后加了两个卡片。
- **@文件**：输入 `@` 选择具体代码文件（可进 `src` 目录再选文件），例如「不要把代码都放一个文件里，拆成模块」。

## 五、三种指令追加方式（Pi 的核心机制）

### 1. Steering——执行中途打方向盘

发现 AI 理解偏了，**不要打断它**，直接在对话框补一句新指令回车即可。默认就是 steering，指令前面会标 `steering`（字幕误作 staring / stering / sting），英文原意就是「打方向盘」。

视频例子：AI 打算用 Express 做后端，用户补一句「我要 Next.js 框架，数据库用 SQLite」——AI 立即改方向去装 Next.js 依赖。

### 2. Follow up——排队，等这轮做完

`Alt+Enter`（Mac `Option+Enter`）发送，指令前标 `follow up`。**不影响 AI 当前这一轮**，等它把手头工作全部做完才会看到并执行。

- 排队途中按 `Alt+↑` 可以把指令取回来改，改完再 `Alt+Enter` 送回队列。
- ⚠️ 用之前先按速查表把 PowerShell 的 `Alt+Enter` 全屏快捷键删掉。

### 3. 非交互模式——当 CLI 用

`pi -p "<指令>"`，后台静默执行，中间过程看不到，执行完一次性输出结果。适合脚本化、一次性任务。

### 底层原理：双层循环

```
外层循环（follow up 消息队列）
  └── 内层循环：调模型 → 按模型指令调工具 → 把工具结果回给模型
        → 模型判断完成？未完成 → 下一轮
        → 进入下一轮时，把 steering 消息注入上下文 ← 所以能实时响应
  └── 内层循环结束（手头工作做完）
        → 读取 follow up 消息 → 有则开启外层循环继续工作
```

**Steering 在内层循环注入，所以能实时打断方向；follow up 在外层循环，必须等内层跑完。** 这是 Pi 最经典的机制。

## 六、Session 管理与对话树

### 基本操作

| 操作 | 命令 | 说明 |
|---|---|---|
| 新开 | `/new` | 清空上下文，AI 没有过去的对话 |
| 续上次 | `pi -c` | 从最近一次 session 继续 |
| 挑一个 | `pi -r` | 列出 session 挑选 |
| 复制 | `/clone` | 当前 session **完整复制**成一份新的 |
| 分支复制 | `/fork` | 选中某个对话节点，复制出**只带该节点之前历史**的新 session |
| 压缩 | `/compact` | 手动总结精简历史。视频实测上下文占用 18% → 10% |

> **通用经验：清空好于压缩。** 过多历史会话会干扰 AI 注意力，一轮任务做完最好直接 `/new`。

### 对话树 `/tree`

session 不是纯线性结构，而是**树状**的。进入 `/tree` 选一个历史节点，回车两次即可把对话回退到该状态，然后基于它创建新分支做不同尝试。`/tree` 里能看到时间线上产生的分支。

**⚠️ 关键限制：回退对话历史 ≠ 回退代码。** 已经写进磁盘的代码不会因为回退而消失。要连代码一起回退，必须配合 Git：

1. `/tree` 找到目标节点（如「新增茄子」）回车，回退对话历史；
2. 找到该次提交的 commit id；
3. 在 Pi 里 `! git reset --hard <commit-id>`，强制把代码回退到那次提交。

### 回退时的三个选项

| 选项 | 行为 |
|---|---|
| 不总结 | 彻底回退，丢弃的对话历史完全抛弃 |
| 总结（summarize） | 让 AI 总结**你丢弃的这段分支**的工作，回退后 AI 对这段工作仍有大概印象 |
| 自定义 | 告诉 AI 该怎么总结 |

> ⚠️ **只总结当前分支，不总结别的分支。** 例如从「白菜」回退到「茄子」，同级的「皮皮虾」分支不会被总结。回退后按 `Ctrl+O` 可展开查看总结内容。

## 七、扩展能力一：插件

Pi 的扩展有两个渠道：**插件**和 **skills**。插件在官网的 package 列表里找。

### 安装与卸载

插件列表页每条都有一键安装命令，复制到终端执行即可。卸载把命令里的 `install` 改成 `uninstall`。

**全局 vs 项目级**：

```bash
pi install <插件>            # 全局安装，对所有项目生效
pi install <插件> -l         # local，只装到当前项目的 .pi/ 目录
```

> 字幕读作「空格接横杠 LL」，即 `-l`（local），按上下文还原。**每装一个插件都会增加一部分系统提示词**，用不到的插件就是给模型加负担——所以按需用 `-l` 装到项目级。

首次在含插件/skill 的目录启动 Pi 时，会询问是否信任当前目录，选信任才会加载。

### 推荐插件清单

**✅ 已对照 pi.dev/packages 官方包目录核过**。视频讲的功能都能对上，但**包名和命令名有多处与 ASR 还原不符**，下表为核实后的结果：

| 功能 | 视频里的说法（ASR） | **实际包名** | 实际命令 |
|---|---|---|---|
| 联网搜索 | pi web assi | **`pi-web-access`** | — |
| 并行子代理 | pi sub agents | **`pi-subagents`**（无连字符） | `/run` `/chain` `/parallel` `/agents` |
| MCP 支持 | pm cp adapter | **`pi-mcp-adapter`** ✅ | — |
| 旁路对话 | btw | **`@narumitw/pi-btw`** | `/btw` ✅ |
| 计划模式 | plan mode | **`@narumitw/pi-plan-mode`** | `/plan`（不是 `/plan-mode`） |
| 目标循环 | **GOGO 模式**（`斜线go`） | **`@narumitw/pi-goal`** 等 | **`/goal`** ← 视频的「GOGO」是 goal 的误听 |
| 动态工作流 | pdynamic workflow | **`@quintinshaw/pi-dynamic-workflows`** | `/workflows` `/deep-research` |
| 连微信 | pi wechat assistant | ⚠️ 官方目录前 50 无此包 | — |
| 权限审批 | pi permission system | **`@gotgenes/pi-permission-system`** | — |

补充说明：

- **`pi-web-access`**：官方目录里下载量最高的联网扩展（258K/月），支持 OpenAI、Brave、Tavily、Firecrawl、Jina 等多种后端，还能抓 GitHub 仓库、解析 PDF、理解 YouTube 视频。⚠️ 视频强调的「零配置、不需要 API key」**与该包描述不符**（多数后端需要 key），作者装的可能是别的包或早期版本，存疑。
- **`pi-subagents`**：内置 scout / planner / worker / reviewer / researcher 等角色，可在 `~/.pi/agent/settings.json` 里给单个角色指定模型。注意 researcher 依赖 `pi-web-access`。
- **goal 模式目前有多个实现**：`@narumitw/pi-goal`（34.1K/月）、`@amaster.ai/pi-goal`、`pi-goal-x`、`geto-goals`、以及 `@lyhue1991/pi-codex`（直接复刻 Codex 的 goal 面板 + 异步 bash）。**功能大同小异，选一个装即可**。
- **权限类替代**：`cc-safety-net`（拦截破坏性命令和密钥文件访问）、`@trim21/personal-pi-extensions`（bwrap 沙箱、workspace guard）。

### 三个值得单独说的插件

**plan mode（`/plan`）**：底部出现 `plan` 标记时，**AI 不动手，只输出计划**并写入 `plan.md`。你可以手动改这份计划，确认后再输一次 `/plan` 关闭，然后说「确认实施计划」，Pi 才正式开工。

> 官方描述是「Codex 风格的**只读** `/plan` 协作模式」，与视频演示一致。

**`/goal` 模式（初版误写为 `/go`、「GOGO 模式」）**：`/goal <目标>`，让 Pi 在**多个轮次**中朝一个固定目标持续迭代，直到达成才停。视频給的目标是「做一个 HTML 坦克大战 → 启动试玩 → 输出测试结论 → 重做一版 → 多次迭代 → 越像红白机越好」，Pi 迭代了 3 次完成，`iterations` 里能看到每次迭代过程。

**这是全片最值得装的功能，也是本次查证中唯一被我彻底写错的一条。** 补充查到的机制细节（来自 `@amaster.ai/pi-goal` 的 README）：

| 要点 | 说明 |
|---|---|
| 目标来源 | 可显式给条件（`/goal 所有测试通过且 lint 干净`），或 `/goal` 不带参数——**从对话里自动推导**目标，交互模式下会先给你确认 |
| 判定方式 | 每轮 agent 跑完（`agent_end`），用一个**小的评估模型**判断目标达成 / 未达成 / 不可能。未达成就推着 Pi 继续，告诉它还差什么 |
| 兜底 | `maxIterations`（默认 10）和 `tokenBudget` 两道闸，防止坏目标无限循环 |
| 血统 | 判定机制照搬 Claude Code 的 stop-condition，token/迭代预算照搬 **Codex 的 goal mode**——正好对应视频说的「Codex 和 Claude Code 都支持的功能」 |
| 状态存储 | session 级、内存态，**不跨 session 持久化**。想要持久化的可看 `geto-goals`（把目标写进 `.pi/goals/goal.json`，能扛住 `/new` 和压缩） |

**dynamic workflows**（`@quintinshaw/pi-dynamic-workflows`）：源自 Claude Code 的特色功能，根据任务复杂度写一段 JavaScript 编排脚本，后台调度几十上百个子代理协同，实现单次对话内的大规模长时任务。输入 `workflows` 关键字触发，用 `/workflows` 查看后台各子代理工作状态（自带交互式 TUI）。视频示例：调研 2022–2026 年 AI 领域重大影响力论文，启动了 10 个 agent 并行检索——**这个场景用包里自带的 `/deep-research` 更直接**。

该包还带模型路由、token/成本统计、断点续跑、git worktree 隔离。

## 八、扩展能力二：Skills

Pi 遵循标准 agent skills 协议，**把 skill 放到指定目录就会被自动识别**，SKILL.md 是入口文件。

| 级别 | 路径 | 来源 |
|---|---|---|
| 项目级 | `<项目>/.agents/skills/<skill名>/SKILL.md` | 字幕 |
| 全局 | `~/.agents/skills/…`（字幕）／ `~/.pi/agent/skills/…`（第三方文档） | ⚠️ 两种说法并存 |

> 第三方配置文档写的是 `~/.pi/agent/skills/`（与插件、AGENTS.md 同在 `.pi/agent/` 下），视频演示的是 `~/.agents/skills/`（agent skills 标准路径）。**两者可能都支持**，实测时若一个不生效就换另一个。

视频以 **playwright-cli**（浏览器自动化）为例，两种装法：

1. **命令行装**：先装 playwright CLI 本体（`npm install` 类命令），再按提示装配套 skill。
2. **手动装**：去 GitHub 仓库 Download ZIP → 解压后取里面的 `skills/playwright-cli/` 目录 → 复制到 `<项目>/.agents/skills/` 下。启动 Pi 后 skills 列表里就能看到。

**项目级转全局**：把整个 skills 文件夹从项目目录拖到 `~/.agents/` 下即可，之后任意项目都能用。

**找 skill 的渠道**：GitHub，以及 **skillhub**（可在 skillhub 检索后下载 zip 手动装，也可以把安装提示词直接粘给 Pi 让它自己装）。

> 视频里装 markdown-converter 时，Pi 提示本机缺 `uv`，用户说「你帮我把 uv 装一下」，Pi 自己装完并完成 PDF → Markdown 转换。这类依赖缺失可以让 Pi 自己解决。
>
> 关掉用不到的 skill 能省 token（Web UI 里可勾选开关）。

## 九、Web UI（可选）

社区有若干把 Pi 接到网页里的外部 UI，star 最高的是一位国内作者（字幕读作「第四种黑猩猩」）的项目，约 **4200 star**。官网 README 的 Quick Start 里有 `npx` 安装命令，终端执行、输入 `Y`，装完自动打开网页。关掉浏览器后想再用，重跑那个命令即可。

界面要点：

| 区域 | 功能 |
|---|---|
| 左上角 | 切换项目，或自定义路径打开本地任意文件夹作为项目目录 |
| 左下角 | 文件浏览器 / 模型按钮（添加 provider，如 Moonshot AI CN + Kimi API key）/ 技能与插件管理 |
| 中间 | 模型选择器、对话面板 |

**技能与插件都分 project 和 global 两栏**，可逐个开关——关闭后从提示词里隐藏，模型看不到，**及时关掉用不到的能省 token**。技能面板下方还能搜索并添加技能（视频示例：添加 TTS 技能，可选择装到项目还是全局）。

对话面板里斜杠命令、`@` 选文件、`Ctrl+V` 粘贴截图都能用，也能调思考强度，任务结束后显示输入输出 token 和预估花费。

> ⚠️ 作者观点：只要掌握了命令行版 Pi，Web UI 没什么使用门槛。

## 十、跨 session 记忆：AGENTS.md

每次开新对话，AI 对项目一无所知，复杂项目每次都要重新交代背景，非常低效。解法是在项目根目录放 **`AGENTS.md`**（字幕读作 agents 点 MD）——**AI 每次对话必读的指南**，之后所有对话都会自动带上它的内容。

> 背景补充：`AGENTS.md` 是 Codex、Open Code 等 agent 工具通用的约定，不是 Pi 独有。

**内容示例**（视频实际写的）：

```markdown
我叫技术爬爬虾，擅长的技术是...
我对前端一窍不通，如果遇到网页问题，需要用大白话给我解释。
```

**懒人写法**：直接让 Pi 自己写——「通读当前文件夹，把你学到的关于项目的知识保存到 AGENTS.md」。Pi 会通读源码和配置文档再生成。**复杂项目这个文件是必写的。**

### 全局提示词

| 文件 | 位置 | 作用范围 |
|---|---|---|
| `AGENTS.md` | `~/.pi/agent/AGENTS.md` | 全局，所有项目生效 |
| `APPEND_SYSTEM.md` | `~/.pi/agent/APPEND_SYSTEM.md` | 全局，内容**直接追加进系统提示词**，优先级更高、效果更强 |

作者自己用的全局规则（因为看过 AI 误删整个 D 盘的新闻）：

> 禁止批量删除文件或目录，只能通过明确的文件路径单个删除；如果需要批量删除，应停止操作并向用户请求，由用户手动删除。

一般情况下用通用 `AGENTS.md` 就够了，`APPEND_SYSTEM.md` 留给需要强约束的场景。

## 十一、安全：这是 Pi 最大的坑

**Pi 只有一个非常基础的安全机制**：在包含插件或 skill 的陌生目录启动时，询问是否信任并加载。

**一旦开始运行，就没有任何安全限制了**——永远处于最高权限，编辑文件、执行命令全部自动执行，不会停下来询问，也**没有任何杀伤/中断机制**。这是开发者有意为之：Pi 的哲学是保持本体简洁高效、用最快速度完成任务，而不是在内部造一个看似安全但实际不完整的沙箱。

**官方推荐的兜底方案**：

| 方案 | 说明 |
|---|---|
| 容器 / 虚拟机 | **官方文档首选**。WSL（Windows 上的 Linux 虚拟机）、Hyper-V、Docker 容器均可。环境搞坏了删掉重建即可，不影响宿主机 |
| pi-permission-system 插件 | 敏感操作弹窗等待审批，类似 Claude Code 权限系统，但拖慢效率 |

> Pi 因为极简轻量、启动快、内存占用低，**特别适合在容器里跑**，也适合用 Docker / K8s 批量部署。

## 十二、自己写插件

**不需要自己写代码——Pi 内置了插件开发知识，能自己给自己写插件。** 视频用 GPT-5.6 一次跑通了三个。

流程：跟 Pi 讲清楚需求 → 它读取插件开发文档 → 生成插件（一个 `.ts` 文件）→ 放到 `.pi/extensions/`（项目级）或 `~/.pi/agent/extensions/`（全局）→ 输入 **`/reload`** 加载生效。

三个实战例子：

| 需求 | 效果 |
|---|---|
| 根据 IP 查地理坐标 → 查当地天气 → 显示在对话窗口上方 | 完全定制了 Pi 的 UI |
| 禁止 AI 读取/编辑受保护的 `.env` 文件 | AI 尝试操作时被直接阻止并提示 |
| 执行 `rm` 删除命令前先弹窗询问 | 选 NO 文件保留，选 YES 才删除 |

> 作者的评价：只要把需求讲清楚，很快就能完成，一点也不难。

## 十三、源码架构与 SDK

GitHub 仓库的 `packages/` 下几个核心包：

| 包 | 职责 |
|---|---|
| **ai** | 模型调用层。把市面上几十个模型厂商做成统一调用规范，Pi 用一套相同接口调所有模型 |
| **agent** | 实现 **agent loop**，即前面讲的双层循环机制 |
| **coding-agent** | 编程功能的具体实现：4 个基础工具、系统提示词、skills 机制、插件实现机制 |
| **tui** | 命令行界面的全部功能 |

作者评价：**Pi 的源码就是一本 agent 设计规范的教科书**，从事 agent 开发的话非常值得深入读。

**核心包已封装成 SDK**，可以直接在自己项目里用：

```bash
npm install @mariozechner/pi-ai          # 接入市面上所有大模型
npm install @mariozechner/pi-coding-agent # 开箱即用的 coding agent
```

- `pi-ai`：接入任意模型。⚠️ 视频说的方法名是 `createModel`，但文档里出现的是 `getModel` / `stream` / `complete`（另有第三方示例用 `createLLM`）——**方法名存疑，以实际 d.ts 为准**。
- `pi-coding-agent`：创建 session 后直接给 agent 派任务。

> ⚠️ **npm scope 有两种说法**：`@mariozechner/*`（作者个人账号，多数第三方文章用这个）和 `@earendil-works/*`（公司账号，pi.dev 站点的 web-ui 包描述里用的是这个）。仓库已转由 Earendil Inc. 维护，**装之前先确认当前有效的是哪个 scope**。

源码包对照（已与第三方源码分析报告交叉验证）：

| 目录 | npm 包 |
|---|---|
| `packages/ai` | `@mariozechner/pi-ai` |
| `packages/agent` | `@mariozechner/pi-agent-core` |
| `packages/coding-agent` | `@mariozechner/pi-coding-agent` |
| `packages/tui` | `@mariozechner/pi-tui` |
| `packages/web-ui` | `@mariozechner/pi-web-ui` |
| `packages/mom` | `@mariozechner/pi-mom`（Slack 机器人） |
| `packages/pods` | `@mariozechner/pi`（vLLM GPU 部署管理） |

---

## 附录 A：ASR 还原对照表

| 字幕原文 | 实际所指 |
|---|---|
| 派 / pad / pie / PAGENT / 拍 / 皮 | **Pi**（本视频的 agent 本体） |
| 赛森 / sassin | session |
| codex | Codex |
| cloud code | Claude Code |
| data breaks | Databricks |
| cloud oppos | Claude Opus |
| deep sick / deep sc / deep sk | DeepSeek |
| chat gbt / Gb t5.6 | ChatGPT / GPT-5.6 |
| 携线 new / 斜线 T 等 | `/new` / `/tree` 等斜杠命令 |
| APIK | API Key |
| nod e js | Node.js |
| power shell | PowerShell |
| git bash | Git Bash |
| 叹号 / 两个叹号 | `!` / `!!` |
| 艾特 | `@` |
| staring / stering / sting / STERING | **steering**（引导、打方向盘） |
| folk | fork |
| 拜事 / 拜师 | bash |
| grape | grep |
| l s s | ls |
| XRMCP | 某个内置 MCP 服务（无法确认具体是哪个） |
| 点 MCP 点 JASON | `.mcp.json` |
| 点派 / 点 agents | `.pi` / `.agents` |
| 艾阵次点MD / agency点MD | `AGENTS.md` |
| append system 点MD | `APPEND_SYSTEM.md` |
| 点ENV | `.env` |
| WSSL | WSL |
| hyper v | Hyper-V |
| K8S | Kubernetes |
| 第四种黑猩猩 | 社区 Web UI 项目作者昵称（无法确认准确写法） |
| **GOGO 模式** | **goal 模式** ✅ 已查证 |
| 斜线 go | `/goal` ✅ 已查证 |
| plan mode（命令） | `/plan` ✅ 已查证 |

## 附录 B：存疑清单

**已查证、不再是存疑项**（对照 pi.dev 官方包目录与第三方文档）：

- ✅ `/goal` 模式——原误写为「GOGO 模式 / `/go`」。
- ✅ `pi -p` / `pi -c` / `pi -r` 三个启动参数——与官方文档一致。
- ✅ 插件包名——见第七章表格，其中 `pi-web-assistant`→`pi-web-access`、`pi-sub-agents`→`pi-subagents`、`pi-gogo`→`pi-goal` 系均为**修正项**。
- ✅ 源码包结构——`packages/{ai,agent,coding-agent,tui}` 与视频一致。

**仍未确认**：

1. **模型版本号**：「cloud oppos 4.8」——Claude 现役版本无 4.8，无法确认原词，推测为 4.5/4.6 的误识别。
2. **Composer 基准测试**：字幕只说「composer 上个月的一组基准测试」，未说明是哪个组织/产品，无法确认。
3. **安装命令原文**：视频只演示「从官网复制命令」。第三方文档给出的官网命令是 Windows `powershell -c "irm https://pi.dev/install.ps1 | iex"`、macOS/Linux `curl -fsSL https://pi.dev/install.sh | sh`，**请以官网当前页面为准**。
4. **npm scope**：`@mariozechner/*` 与 `@earendil-works/*` 两种说法并存（仓库已转由 Earendil Inc. 维护）。
5. **`pi-ai` 的方法名**：视频说 `createModel`，文档里出现的是 `getModel` / `stream` / `complete`。
6. **全局 skills 路径**：字幕 `~/.agents/skills/` vs 文档 `~/.pi/agent/skills/`，两者可能都支持。
7. **微信插件**：官方包目录前 50 名（按下载量）无此包，只有 `@llblab/pi-telegram`。全站 5410 个包未穷举，**无法确认**。
8. **联网插件的「零配置」**：视频强调不需要 API key，但 `pi-web-access` 多数后端需要 key。作者装的可能是别的包或旧版本。
9. **DeepSeek 模型名**：「V4 Pro / V4 Flash」为字幕读音还原。
10. **XRMCP**：联网插件内置的 MCP 服务名，无法确认。
11. **「第四种黑猩猩」**：Web UI 作者昵称，无法确认准确写法。

---

## 副产物导航

- 来源目录：[`byproducts/BV139bD6gEa8/`](../byproducts/BV139bD6gEa8/README.md)
- 时间轴转录：[`transcript.md`](../byproducts/BV139bD6gEa8/transcript.md)（1245 条 cue，125 段，覆盖 00:00–44:38）
- 原始字幕：[`raw-subtitle.json`](../byproducts/BV139bD6gEa8/raw-subtitle.json)
- 元数据：[`metadata.json`](../byproducts/BV139bD6gEa8/metadata.json)
- 获取状态：[`status.json`](../byproducts/BV139bD6gEa8/status.json)
