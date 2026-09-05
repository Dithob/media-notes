> 来源：[Pi 公开源码与工程结构](https://github.com/badlogic/pi-mono)
> 整理日期：2026-08-31

明白，你要的是**工程实现层面的答案**——不是"用什么语言写的"，而是"这个项目是怎么一步步搭出来的"。我先把公开的源码结构核实一下，再给你拆解。
仓库结构确认了。我再抓一下核心循环的源码目录，把实现细节坐实。
源码目录确认了关键信息（`harness/`、`search/` 含 SQLite 会话存储）。现在给你完整的工程实现拆解——**Pi 不是"一个程序"，而是一个由 5 个 npm 包组成的 monorepo 项目**，逐层看它是怎么搭出来的。
这就是整个核心引擎的"发动机"。下面按工程实现顺序，把 Pi 从零到一怎么开发的讲透。

## 1. 项目骨架：npm workspaces monorepo

```
pi/
├── packages/
│   ├── ai/            # @earendil-works/pi-ai          模型抽象层
│   ├── agent/         # @earendil-works/pi-agent-core  Agent 运行时（harness/、search/）
│   ├── coding-agent/  # @earendil-works/pi-coding-agent 开箱 CLI
│   ├── tui/           # @earendil-works/pi-tui         终端 UI
│   └── telemetry/     # @earendil-works/pi-telemetry   遥测契约
├── scripts/build-binaries.sh   # 打独立二进制
├── AGENTS.md                   # 给 AI 开发者的项目规则
└── package-lock.json           # 供应链事实来源
```

关键工程决策：**依赖方向单向**（`ai ← agent ← coding-agent`），每个包可独立发布、独立复用——这就是它敢说"可拆成 SDK 嵌进你的系统"的原因。

## 2. 核心引擎：`agent-loop`（双层循环）

就是上图那个循环，代码里是 `packages/agent/src/harness/` 下的一个 while 循环，实现要点：

```ts
// 伪代码，还原 Pi 的实现结构
while (任务未完成) {            // 外层循环：任务流
  while (true) {               // 内层循环：单次工具调用回合
    const msg = await llm.chat(messages)      // ① LLM 推理
    if (!msg.toolCalls) break                 // 无工具调用 → 出内层
    for (const call of msg.toolCalls) {
      const result = await tools[call.name](call.args)  // ② 执行工具
      messages.push({ role: "tool", result })           // ③ 结果回注
    }
  }
  // 外层：衔接下一个任务（如"写完代码→跑测试→修失败"）
}
```

三个值得抄的工程细节：

- **Steering / FollowUp 双队列**：用户中途说"先修语法错误"→ 进 Steering 队列，**插队并取消后续未执行任务**；说"顺便记录一下"→ 进 FollowUp 队列，**当前任务流走完再执行**。这个设计让"用户可干预"和"任务不被打断"两者兼得。
- **极简 System Prompt（~200 tokens）**：只写"如何理解需求、如何选工具、如何分析结果"三条规则，把上下文成本压到同类 1/10。
- **工具参数精简**：每次只向模型暴露当前任务相关的工具 schema，减少 token 和模型选择负担。

## 3. 工具系统：Schema 驱动

每个工具 = **元数据 + JSON Schema 参数 + 处理函数** 三件套：

```ts
const readTool = {
  name: "read",
  description: "读取文件内容",
  parameters: { type: "object", properties: { path: { type: "string" } } },
  execute: async ({ path }) => fs.readFile(path, "utf8"),  // 处理函数
};
```

模型通过 **function calling 协议**（OpenAI 兼容）请求调用，Pi 负责校验参数、执行、截断输出（避免巨型结果撑爆上下文）。扩展（Extension/Skill）本质就是往这个注册表里加工具 + 挂生命周期事件（如"工具调用前加权限校验"）。

## 4. 模型抽象层 `pi-ai`

干三件事：把 15+ 厂商的 API 差异**抹平成统一接口**；支持**流式输出**；做 **token 计数和成本估算**（执行前能算出要花多少钱）。provider 的模型元数据是构建时刷新的快照（所以 `npm run build` 会"刷新模型数据"，`--offline-model-data` 用离线快照）。

## 5. TUI：差分渲染

`pi-tui` 的核心是**只重绘变化的部分**（类似 React 的虚拟 DOM diff），而不是整屏刷新——这是终端界面"低闪烁、流畅"的来源。你自己手搓时，这个可以最后做，甚至不做。

## 6. 会话持久化

源码里 `search/` 目录可见：**SQLite 存会话 + jsonl 存会话目录**，支持 `/fork` 分支会话树（从任意历史消息分叉，回滚坏路径）、`/compact` 压缩旧消息。这是 Pi"省 token"的另一个来源——不重复喂全部历史。

## 7. 构建与发布

```sh
npm install --ignore-scripts   # 供应链安全：跳过生命周期脚本
npm run build                  # 构建所有包 + 刷新模型数据
npm run check                  # lint + format + 类型检查 + 依赖审计
./test.sh                      # 无 API key 时自动跳过依赖 LLM 的测试
./scripts/build-binaries.sh    # 打平台独立二进制
```

工程上非常讲究：依赖**精确锁版本**（`save-exact` + 最小发布年龄 2 天）、`package-lock.json` 锁定为事实来源（改锁文件会被 CI 拦）、发布包内置 `npm-shrinkwrap.json`、`npm audit` 定期扫。

## 8. 安全模型：坦诚"无内置沙箱"

README 直接承认：**默认以启动用户权限运行**，没有内置权限系统。然后给三条容器化路径：Gondolin（工具路由进 micro-VM）、Docker（整进程隔离）、OpenShell（策略沙箱）。这是它的设计取舍——把安全交给容器，换取内核极简。

## 照着开发一个你自己的 Agent 的步骤清单

| 步骤  | 做什么                                   | 对应 Pi 的哪个模块           |
| --- | ------------------------------------- | --------------------- |
| 1   | 搭 monorepo（pnpm workspaces）           | 整个仓库                  |
| 2   | 写 `pi-ai` 等价物：封装 LLM 调用（先只接 DeepSeek） | packages/ai           |
| 3   | 写 agent-loop 双层循环（30 行内能跑）            | packages/agent        |
| 4   | 定义 2~3 个工具（如 read/bash）               | 工具注册表                 |
| 5   | 加会话持久化（SQLite 或直接 JSON 文件）            | packages/agent/search |
| 6   | 做 CLI 入口（`python mini_agent.py "任务"`） | packages/coding-agent |
| 7   | （可选）TUI / RPC 模式                      | packages/tui          |
| 8   | 用你自己的测试场景挂自定义工具                       | Extension             |
| 9   | 供应链 + 测试 + 发布                         | 构建脚本                  |

⚠️ 诚实边界：以上实现细节来自 **GitHub 公开仓库（包结构、构建脚本、容器化文档、SQLite/jsonl 会话存储）** + 多篇深度解析文章（agent-loop 双层循环、双队列、差分渲染等）。我没有 clone 全源码逐行核读；如果你想看到 `agent-loop.ts` 的真实代码，我可以把仓库拉下来（或用公网 GitHub）按文件给你讲。

我把这个学习过程记到工作日志里，方便你后续继续。
已记录到工作日志。

**一句话总结**：Pi Agent 就是一个 **TypeScript monorepo 项目**，核心是 `packages/agent` 里的双层 while 循环（LLM 推理 → 有工具调用就执行 → 结果回注 → 再推理），配合 schema 驱动的工具注册表、`pi-ai` 统一模型接口、SQLite 会话存储、差分渲染 TUI——**全部工程实现约等于"一个循环 + 一个工具注册表 + 一个模型封装"**，这也是为什么你上轮看到的 30 行 Python 骨架能复刻它的本质。

如果你想继续深挖，推荐两个方向：

1. **拉真源码**：把 `github.com/earendil-works/pi` 拉到本地，我带你逐文件读 `agent-loop` 和工具注册表的真实实现；
2. **直接开搓**：按上轮的 Python 骨架起步，把它扩展成"读 TAPD 用例 → 调地图接口 → 对比基线 → 出报告"的测试 Agent——骨架 + 3 个自定义工具就能跑，正好当秋招项目素材。

## 副产物导航

副产物（原始字幕、时间轴转录、元数据）仅存本地，不进公开仓库。来源：[https://github.com/badlogic/pi-mono](https://github.com/badlogic/pi-mono)
