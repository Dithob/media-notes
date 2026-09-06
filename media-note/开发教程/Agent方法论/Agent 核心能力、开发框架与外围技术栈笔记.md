# Agent 核心能力、开发框架与外围技术栈笔记

> 来源：[【Agent方法论】08.Agent核心能力、开发框架与关键外围技术 - 【全748集】目前B站最全最细的AI Agent开发零基础教程，2026最新版，包含所有干货！七天就能从小白到大神！少走99%的弯路！学完即就业，带你玩转AI！](https://www.bilibili.com/video/BV1xwVr6FEh4?p=9)
> UP 主：AI大模型码农｜时长：29:16｜整理日期：2026-09-06

> 基于《Agent 方法论》系列第 8 课（第 9 集）字幕与课程 PPT 截图整理。本课承接第 6 课（见 [AI Agent 概述与开发指南笔记](AI%20Agent%20概述与开发指南笔记.md)）的技术栈总览：技术栈最底层（模型服务）和最上层（Agent 类型）前面已梳理，本课聚焦中间两层——**四大核心能力**与**三大开发框架**，并引出生产部署、评估、前端、容器化等**外围技术**。字幕语音识别有噪声，**关键术语已按上下文还原**（还原对照与存疑项仅存本地，不随笔记发布）。

## 0. 先看结论

- **四大核心能力**：Planning（规划）、Memory（记忆）、Tools（工具）、Action（执行）。Planning 的简化版是 reasoning，「简单 reasoning + action」就是 2022 年的 ReAct；后来加上 Memory、Tools 演化为今天的四大能力，四大支柱的演变又催生出各种各样的 Agent 类型；
- **三大开发框架**：LangChain（"一超"，首个且目前唯一覆盖 Agent 开发、测试到部署全生命周期的应用框架）、LlamaIndex（聚焦数据的框架，适合 RAG/检索优化）、Semantic Kernel（微软开源，类似 LangChain 早期定位）；
- **外围技术**：Hosting（Ollama 私有化部署大模型 + LangServe 部署 LangChain 应用）、Evaluation（LangSmith 可视化监控与评估）、前端（Gradio / Streamlit）、容器化（Docker）。

---

## 1. 课程定位

- 技术栈图中**最底层（模型服务）和最上层（Agent 类型）**已通过前面的内容梳理过；模型没有讲得特别深，只做了简单介绍——要讲深得看微调课（LLaMA 预训练怎么做、Mixtral 这类 MoE 技术怎么演进等，ASR 不确定处已标注存疑）；
- 本课聚焦 Agent 技术的**核心圈**：红框圈出的四大核心能力 + 开发框架如何落地。

## 2. 四大核心能力

### 2.1 Planning（规划）

- **拉开大模型智能化程度差异的关键点**：同样的 planning 提示词，给 2B、7B、13B、70B 到几千亿参数的大模型，做出来的 planning 结果千差万别；
- 在 ReAct 结构里考验的是模型的推理能力，但 planning **不只是推理**——还引入了规划、效用、目标等被抽象出来的概念（对应 Agent 类型智能维度的 Goal-based、Utility-based）。大模型理解得到这些概念，规划就做得好；理解不了，就不可能做好。

### 2.2 Memory（记忆）

- 本课不展开：Memory 更多是**向量数据库**这个技术垂类里的各种技巧；
- LangChain 集成了大量向量数据库：可以直接存储到内存，也可以持久化到硬盘，或者放到 GPU 显存里。

### 2.3 Tools（工具）

- 应用开发实战营已普及：各种各样的工具可以调用；**不同开发框架集成好的 tools 不一样**；
- LangChain 集成的工具较多：两三行代码就能调一个搜索引擎、调一个数学工具库。

### 2.4 Action（执行）

- 配合 Planning 而来：执行决策，具体要做的 action 怎样跟 planning 发生关系。

### 2.5 四大能力的演化关系

```text
planning 的简化版 = reasoning
简单 reasoning + action = 2022 年的 ReAct
技术迭代后：planning + memory + tools + action
四大核心支柱不断演变 → 演化出各种各样的 Agent 类型
```

### 2.6 Lilian Weng 的 Agent 基本框架（课程 PPT）

OpenAI 研究主管 **Lilian Weng** 的博客《LLM Powered Autonomous Agents》提出了"**Agent = LLM + 规划 + 记忆 + 工具使用**"的基础架构，其中大模型 LLM 扮演了 Agent 的"大脑"。课程讲解与该文逻辑类似：

- **Planning（规划）**：主要包括子目标分解、反思与改进——将大型任务分解为较小可管理的子目标处理复杂任务；反思和改进指对过去的行动进行自我批评和自我反思，从错误中学习并改进未来的步骤，从而提高最终结果的质量（PPT 原文）。
  - 子目标分解、反思改进其实**落到了 Agent 类型的不同维度上**：子目标分解对应 goals（目标维度），反思改进可以理解成技术实践维度的 Reflection，也可以理解成智能化程度维度的 Simple Reflex、Model-based Reflex——最终都落在 planning 这根支柱上；
  - 底层逻辑：**大任务拆解成小任务**，同样的大模型多次累计地解决被拆解的小任务，就能完成一个大任务——合理且被验证。
- **Memory（记忆）**：分为短期记忆和长期记忆。短期记忆指将所有的上下文学习看成利用模型的短期记忆来学习；长期记忆提供长期存储和召回信息的能力，通常通过外部的向量存储和快速检索来存储和召回信息（PPT 原文）。
  - 不需要每次都使用 memory；但当问题使用了**指代词**，或者有**参考答案、最佳实践**时，直接使用 memory 肯定更快。
- **Tools（工具）**：通过学会调用外部不同类型 API 来获取模型权重（通常在预训练后很难修改）中缺少的额外信息，包括当前信息、代码执行能力、访问专有信息源等（例如获取此时此刻的天气、联网搜索等）（PPT 原文）。
  - 完全**跳出大模型能力之外**，相当于给模型加各种 plugin——就像给高达做各种各样的装备。
- **Action（执行）**：根据大模型结合问句（Query）、上下文（Context）的规划、各类工具，最终决策出需要的动作（PPT 原文）。Action 完全在前三者的基础上、基于大模型本身的水平做出。

这四个构成 AI Agent 的**基本框架/核心能力**；而**开发框架才是最终落地它们的、代码层面上的载体**。

## 3. 三大开发框架

### 3.0 核心能力的载体与"一超多强"

- 不同能力有不同载体：**Action** → OpenAI 大模型本身支持 tool calling，LangChain 也支持，Anthropic、Cohere 等公司也做类似的事；**Memory** → 很多公司提供向量数据库服务，重点关注 **Pinecone**；
- 课程展示的架构图是 **AI Agent 基础设施的早期状态**（后面还有现阶段对比，见第 4 节）；Framework（开发框架）这一层比较稳定，出现了**"一超多强"**的状态：一超就是 LangChain，多强是后面的跟随者——都想蚕食开发框架这一层的份额，但都没能干掉 LangChain（LangChain 本身也有问题，是技术迭代过程中快速发展带来的）。

### 3.1 LangChain

- 课程给的定义：**首个、并且到目前为止应该还是唯一一个覆盖了从 Agent 开发、测试到部署全生命周期的应用框架**（PPT 红字原文）；
- 很多人吐槽它库越来越多——最早的 LangChain 只想做一个 Agent 开发框架，现在拆出了不同名字、承担不同使命；LangChain 生态现在想做全生命周期框架，也因为它是融了几千万美金的公司，有股东压力、要商业化；
- 生态图（右侧全生命周期图）：带 **OSS** 标签的都是开源软件——**LangChain 是 OSS，LangGraph 也是 OSS**；各种技术实现的 Agent 有 LangGraph 直接可用的版本；
- LangChain 内部展开：原始项目被拆成几个不同的 Python 库：
  - **LangChain 核心**：Chains 会在 **0.3 版本之后逐步退出历史舞台**，由新的 LangChain-Core——**LCEL（LangChain Expression Language，表达式语言）**——代替；原来的 Chains 会逐步变成 **Runnables** 这样的抽象；
  - **LangChain-Community**：基础组件 Model I/O（对接模型）、各种提示模板、Output Parser，以及 RAG 检索部分、Agent 可调用的各种 tools，都在 community 里——严格意义上它们都不影响 Agent 开发的核心；模型未来会有无数多（最终收敛到少数活下来），但都不属于 Agent 开发框架的内核，理论上应该解耦，所以放到 community；
  - 对应关系：**检索（Retrieval）更多对应 Memory 能力**（检索目标是一堆知识库，知识库提供记忆能力）；**Tool 跟 Action 有一定相关**（各种决策借助 tool 做得更好）；
- 这是目前看到的**最全的一种 Agent 开发框架架构**；期待 0.3；它迭代很快，每天都有新版本发出来；
- 课程**第一个 Agent 项目：GitHub 哨兵**——给快速迭代的开源项目生成日报总结，日报里甚至可以埋一些自己关注的点；
- **LangGraph = multi-agent**：未来多个 Agent 的系统可以通过 LangGraph 实现，内部通过**点和边**的方式定义不同功能（后续课程展开，本课不细讲）。

### 3.2 LlamaIndex

- 前身叫 **GPT Index**；严格说不算开发框架，但也放在这一层——本质上**更多聚焦数据**，某种层面上不局限于 Agent，是为大模型的各种各样应用程序打造的**数据框架**；
- 提供的组件聚焦数据层，有点像 LangChain 基础模块里的 **Data Connection** 组件，只是把这块"卷"得特别多：数据连接器、结构化工具、输入输出 formatter、对接向量的高级检索接口，也能跟外部应用框架集成；
- 目标：帮企业把**高价值数据资产**快速高效地集成和转换，加载到生产级的智能应用里；
- 局限：偏以 RAG 或类似 RAG、**以知识库为中心**的这一类 LLM 应用；自由度、灵活性没有 LangGraph/LangChain 高（LangChain 被吐槽恰是因为太灵活、什么都能做，学习门槛曲线太陡峭）；
- 好处：只做数据检索方面的优化，尽可能多支持数据结构，外部集成做得好——支持 PDF、PPT 等各种格式，支持 Notion、Slack 等各种应用；
- 定位：跟 LangChain **不在一个主战场**，切出一块小蛋糕深耕；劣势也明显——赛道单一、迭代速度没 LangChain 快、开源社区和支持相对少；
- 适用场景：推荐系统、数据索引、RAG 检索优化；**做不了 multi-agent**。

### 3.3 Semantic Kernel

- **微软开源**项目；目标简单：帮开发者更好地集成和使用 AI 新模型，甚至其他不是大模型的 AI 技术框架；
- 模式：你的代码（支持语言比较多，有很多 SDK）通过 Semantic Kernel 就可以调各种各样的 AI 模型——尤其新模型支持得比较好，包括微软自己出的 Phi-3；还能把其他 AI 应用整合起来，提供回调、过滤器之类的机制；
- **特别像 LangChain 最早期的定位**（帮开发者快速调用各种 AI model，不用关心各 model 的 SDK 怎么调）；但 LangChain 已远超当初的设计目标——各种维度的 Agent 实现、multi-agent、Agent 部署等都不是 Semantic Kernel 的目标；
- 结论：Semantic Kernel 可以理解成 **LangChain 0.x 版本的竞争者**，但它并不想往全生命周期方向做——不然微软也没必要再做一个 **GraphRAG** 去跟 LangGraph 竞争。

## 4. 外围技术：生产部署（Hosting）与评估（Evaluation）

### 4.0 为什么需要外围技术

- 把**开发框架和模型服务放在一起看**是必要的视角：Agent 的核心由大模型驱动，而开发框架本身不是大模型，更多是方便大家调用各种各样模型服务的**中间件/中间层**；底层模型服务最终还是要自己一个一个研究和对接，框架只是做好了通用性工作；
- 两个必须自己解决的场景：
  1. **私有化场景（数据隐私要求高）**：闭源海外服务（模型服务层左下角）直接被 pass；绝大部分时候只能使用开源模型；国内特定领域的国央企甚至只能使用国产模型权重——Llama、Gemma 等都不一定能直接使用，可能还得备案。第一步要能够**获取模型权重**（Hugging Face，微调训练营讲过很多）；**Ollama** 之前没讲过，会在企业级 Agents 实战营里讲，三个 Agent 项目都会用 Ollama 搭建不同的私有化大模型服务。开发阶段可以调 GPT 的 API 做测试，但**生产阶段得自己搞定模型部署**——这就是 **Agent 的 Hosting**，既包括 Agent 应用程序本身，也包括 host 大模型；
  2. **线上 debug 与评估**：开发部署后线上出现问题，需要 debug、需要评估，也有对应框架解决。
- **AI Agent 基础设施的演进**：早期（"刀耕火种"、手撸阶段）只看到开发框架；现阶段开发框架周围已出现越来越多生产部署的方案和平台——除 framework 外，**Agent Hosting、Agent Evaluation、开发者工具**都在逐渐完善，很多创业公司/开源项目在做类似的事。

### 4.1 Hosting：Ollama

- 只解决"私有化大模型部署变成一个 API"的话，**Ollama 应该就够用了**；现在大模型公司和团队都会第一时间支持 Ollama（Google 的 Gemma 2 刚发布没多久就支持了，Llama、微软 Phi-3 也是如此）；
- 课程会在第四节课左右教大家用 Ollama 调用（前期先用 GPT API）；
- Ollama 是帮你**下载、运行、管理大模型**的工具和服务，目前是该领域最受关注的项目；运行简单，支持两种模式：
  - **命令行工具**：通过 `pull` 把模型权重下载下来，运行后就变成命令行工具（课程第一个 Agent 也会支持多种启动方式）；
  - **变成服务（Rest API）**：通过 `serve` 方法启动，可以把任意大模型通过 server 接口变成对外暴露 Rest API 的服务；
- 调用方式（以本地部署的 Llama 3.1 为例）：`generate` 方法（简单文本生成，提供 prompt）或 `chat` API（message 聊天模型方法）——从 OpenAI 开始，GPT-3 一直是 generate 调用方法，GPT-3.5 推出后 chat model 变成主流，现在越来越多大模型支持 chat 模式，可支持多种角色进行更复杂的 Agent 设计。

### 4.2 Hosting：LangServe

- LangChain 生态提供的生产部署框架，支持 **LangChain 应用的快速部署**；
- 通过与 **FastAPI** 集成、与 **Pydantic** 数据验证功能集成，可以快速把 LangChain 应用变成一个大模型 server；
- 示例：把 Anthropic、GPT-3.5-turbo 都通过 LangServe 加载起来，通过不同路由访问；右侧 Python 客户端代码可以同时访问不同路由——这也回答了有同学问的"怎么用一个 Agent 调多个大模型、不同 Agent 能不能调不同大模型"：**都可以**。

### 4.3 Evaluation：LangSmith

> PPT 原文：LangSmith 是一个提供可视化监控和全面评估 LLM 应用的平台，适用于复杂 Agent 的调试和调用链路跟踪，可独立于 LangChain 单独使用。

- 平台形态：支持私有化部署，或官方云方式注册调用；**私有化部署需要海外公司才能使用**，绝大部分个人开发者需要在平台上注册账号，把 LangSmith 的 key 放到自己的 Agent 里——它就会把调用过程中的链路记录下来，在平台上查看，甚至通过平台调试、重新调用大模型（与 LangChain 深度集成）；
- 示例：一个 chat 模型在 LangSmith 平台上可以给出对话流的形式，即使不是 ChatGPT、只是一个简单的 LangChain chat model 也可以；并给出有效信息方便 debug——整个调用链路 5.13 秒、5846 个 token，不同环节耗时不同（RAG 0.7 秒，ChatOpenAI 调 OpenAI chat model 花了 5.07 秒）→ 要优化的话重点在哪里一目了然；
- LangSmith 的 evaluation 有自己的特定抽象：**数据集、评估器、任务、交互**四大模块——相当于把经典软件测试的方法论引入到 Agent 测试里（应用开发实战营加餐内容）；展开很复杂，后面具体应用开发用到时再深入介绍，本课只做总览式介绍。

## 5. 其他外围技术：前端与容器化

### 5.1 前端

- **Gradio**：课程已在多处使用的 UI。除了 Stable Diffusion 那种样式，chatbot 在 RAG 部分也介绍过——chatbot 不只支持简单聊天，大模型能生成的任何结果都能显示（包括模型生成代码）；还有下拉选项、多选、表格、图表生成（类似股票预测）等各种组件，后面做第一个 Agent 时会深入讲 Gradio 组件怎么用；
- **Streamlit**：更复杂前端的选择。大模型前端领域非常火热、知名的框架，比 Gradio 更灵活、样式更多，后续课程介绍学习；支持各种 dashboard，还有专区做大模型应用商店（gallery 里有成熟的趋势榜，比如专门做 RAG 增强的 ChatBot 等，具体名称 ASR 无法确认）。

### 5.2 容器化部署：Docker

- 整个课程都会教怎么把 Agent 用 Docker 部署起来；**Docker + LangChain/OpenAI/Anthropic** 是非常常见的容器化部署 Agent 方案；
- 实际情况：Docker Hub 上 LangChain 的镜像更新非常慢——因为 LangChain 迭代实在太快（可能每天发几个版本），官方镜像维护得并不好，很多同学不一定了解它自己传过一个 Docker 镜像；
- 课程会教怎样打包、怎样写 Dockerfile，把自己的 Agent 变成一个可以快速共享的 Docker 镜像，方便部署。

## 6. 边界说明

- 本笔记基于第 9 集（29:16）**字幕**与课程 **PPT 截图**整理；PPT 原文引用处已注明；
- 本课是**框架与外围技术的总览课**：LangChain 内部结构、LangGraph、LangSmith evaluation、Gradio/Streamlit 组件、Docker 打包等均只做引入，具体展开在后续课程（第一个 Agent 项目 GitHub 哨兵、企业级 Agents 实战营等）；
- 课件中框架与模型版本信息（LangChain 0.3 规划、Gemma 2、Phi-3、Llama 3.1 等）为课程制作时点的信息，实际以当前官方版本为准；
- 字幕存在语音识别噪声，**关键术语已按上下文还原**（还原对照与存疑项仅存本地，不随笔记发布）；无法确认处已标注"ASR 不确定/无法确认"。

## 副产物导航

副产物（原始字幕、时间轴转录、元数据）仅存本地，不进公开仓库：[`byproducts/BV1xwVr6FEh4-p9/README.md`](../../../byproducts/BV1xwVr6FEh4-p9/README.md)。来源：[https://www.bilibili.com/video/BV1xwVr6FEh4?p=9](https://www.bilibili.com/video/BV1xwVr6FEh4?p=9)

- ASR 还原对照：[`docs/asr-corrections/AI大模型码农.md`](../../../docs/asr-corrections/AI大模型码农.md)｜存疑待审：[`docs/asr-corrections/存疑清单.md`](../../../docs/asr-corrections/存疑清单.md)（均仅本地，不发布）
