# AI Agent 概述与开发指南笔记

> 来源：[【Agent方法论】06.Agent应用开发指南 - 【全748集】目前B站最全最细的AI Agent开发零基础教程，2026最新版，包含所有干货！七天就能从小白到大神！少走99%的弯路！学完即就业，带你玩转AI！](https://www.bilibili.com/video/BV1xwVr6FEh4?p=7)
> UP 主：AI大模型码农｜时长：22:53｜整理日期：2026-09-05

> 基于《Agent 方法论》系列第 6 课（第 7 集）字幕与课程 PPT 截图整理。本课是一节**总纲课**：不急着写代码，先建立 Agent 开发的整体认知和知识架构，后续课程再对照核心技术栈逐层深挖。字幕语音识别有噪声，关键术语已按上下文还原（见文末术语对照表）。

## 0. 先看结论

- **Agent 是什么**：一种以大语言模型（LLM）为核心驱动的新型软件，区别于 Web 应用和手机 App；
- **怎么开发**：按「模型服务 → Agent 类型 → 核心能力 → 开发框架」四层技术栈搭建，从 MVP（最小可用产品）起步，再补部署、前端、容器化等外围能力；
- **学什么**：大模型与提示工程 → ReAct 理论 → Agent 类型分类 → 四大核心能力（规划/记忆/工具/执行）→ 开发框架（LangChain / LlamaIndex / Semantic Kernel）→ 模型服务（闭源 API + 开源私有化部署）→ 生产部署。

---

## 1. Agent 是什么

### 1.1 定义（课程 PPT 原文）

> AI Agent（人工智能代理）是一个能够自主行动的软件程序，通过感知环境、收集数据、并基于这些数据来执行自我决定的任务，以实现预定目标。**LLMs（大模型）是现代 AI 代理的核心**，因为它们提供了最关键的推理层，并且可以方便地衡量性能。其关键特点包括**自主性、交互能力、学习能力和多模态支持**。

### 1.2 软件形态的演变：Web → App → Agent

| 时代 | 软件形态 | 代表 | 核心特征 |
| --- | --- | --- | --- |
| Web 时代（2000 年代） | Web 应用 | 搜狐、搜狗、新浪、网易等门户网站 | 静态网页起步，逐步出现 Web 框架 |
| 移动互联网时代 | App | 安卓（基于 Linux 的开源系统）+ 智能手机 | 每天重度使用的软件形态 |
| 大模型时代 | **AI Agent** | 各类 Agent 产品 | **以 LLM 为核心驱动**，与以往软件的本质区别 |

### 1.3 为什么 LLM 是核心

- **LLM 的能力直接决定 Agent 的下限**：大模型够强，即使 Agent 研发粗糙，响应也有底线；大模型不够强，再怎么调提示工程和 Agent 设计都有限；
- 大模型迭代速度远超 Web/Mobile 时代：2018 年 GPT-1 → GPT-4、Claude 3.5、Gemma、Llama 3……；
- 大模型为上层 Agent 提供越来越强的**推理能力、交互能力、多模态支持**；
- 因此，原来程序员/产品经理**硬编码**的软件逻辑，在 Agent 里可以由大模型在特定环境下判断，产生特定交互和结果；整个流程充满**环境感知、数据收集、基于数据决策**的提示工程与流程。

### 1.4 Agent 的理论源头：ReAct（早期范式）

- **ReAct**（Reason + Act）论文：Yao, Shunyu et al., *ReAct: Synergizing Reasoning and Acting in Language Models*，arXiv:2210.03629（**ICLR 2023**）。2022 年提出，**早于 ChatGPT（2022 年 11 月底发布）**，因此被称为 Agent 的早期范式；
- 背景：ChatGPT 出现前，开源社区能用的主要是 GPT-3，且不是人人都跑得动，大家都在想怎么提升模型生成质量；
- ReAct 把大模型的两个能力结合起来：
  - **推理（Reasoning Traces）**：用思维链（CoT）、提示工程提升生成质量；
  - **行动（Actions）**：调用外部工具——早期的 Act-only 实践有 **SayCan、WebGPT**（单次调用工具模式）；
- 循环结构：**推理 → 行动 → 观察（Observations）→ 再推理**；大模型作为大脑调用外部工具与环境交互，拿到反馈后继续决策；
- **两层感知**：
  1. 大模型是整个 ReAct 的关键，模型出问题 ReAct 就崩（Agent 开发中的常见坑）；
  2. 框架本身**不够落地**——只提出思想，没给出具体怎么推理、怎么交互；实操中 AutoGPT 等会**大量消耗 token、可能陷入无限循环**；
- 到 2024 年，业界共识：**单纯 reasoning + action 已无法完整描述一个 Agent**。

---

## 2. 最简 AI Agent 的核心组件

课程用一张图抽象出最小 Agent（本质就是 ReAct 流程的工程化）：

```text
        Sensors（传感器）
环境 ───────────────────────→ Agent
        Percepts（感知数据）       │
                                  ▼
                        LLM + prompts
                    （推理引擎 / 大脑）
                                  │
        Actions（动作）            │
环境 ←──────────────────── Actuators（执行器）
```

- **感知**：Agent 通过传感器（Sensors）收集各类数据（Percepts）；
- **决策**：借助推理引擎（Reasoning Engine，即 LLM + prompts）提出合理解决方案（Rational Solutions）；
- **行动**：通过控制系统（Actuators）执行动作（Action），与环境交互，以此提升能力。

要点：

- **LLM + prompts** 就是 LangChain 经典的 `LLMChain`（大模型 + 提示模板），也是最简单的一个 Chat 形态；
- 决定“大脑怎么决策”的是**提示策略**：Plan-and-Execute、BabyAGI、AutoGPT、Zero-shot ReAct 等（LangChain 里预置了多种 agents，看起来又多又杂，选择逻辑见下一节）；
- LangChain **0.3 即将发布并彻底废弃 LLMChain**，转向 **Runnable（LCEL 表达式语言）**；课程会在第二个 Agent 项目前补 0.3 的前置内容，第一个项目相对简单。

---

## 3. Agent 开发核心技术栈（本课重点）

> 这是全课的总览图，聚焦**不带前端美化的 Agent MVP** 需要了解的核心技术。自下而上分层：

```text
┌─────────────────────────────────────────────────────────────┐
│ 开发框架   LangChain │ LlamaIndex │ Semantic Kernel           │
├─────────────────────────────────────────────────────────────┤
│ 核心能力   Planning(规划) │ Memory(记忆) │ Tools(工具) │ Action(执行) │
├─────────────────────────────────────────────────────────────┤
│ Agent 类型（三个切分维度，互有重叠）                            │
│   · 按场景：Action │ Simulation │ Autonomous                   │
│   · 按技术：Chatbot │ Multi-Agent │ RAG │ Planning │ Reflection │
│             │ Evaluation                                        │
│   · 按智能：Simple Reflex │ Model-based Reflex │ Goal-based      │
│             │ Utility-based │ Learning                          │
├─────────────────────────────────────────────────────────────┤
│ 模型服务   闭源：Claude 3 │ GPT-4（商业最强 Top2）              │
│            开源：Ollama（托管）│ Mistral AI │ Gemma 2 │ Phi-3   │
│                  Llama │ Qwen(通义千问) │ DeepSeek              │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 模型服务（最底层）

- 指把大模型**封装成 API 服务**，通过 API 请求访问并拿到生成结果；绝大多数开发者不自己部署模型，而是调用 API（或用 ChatGPT 这类产品，但开发 Agent 不会直接拿 ChatGPT 当后端引擎）；
- **闭源商业模型**（目前最强 Top2）：Anthropic **Claude 3**、OpenAI **GPT-4**；
- **开源模型**（对开发者友好）：
  - **Ollama**：大模型托管平台，课程贯穿始终，三个项目都支持“闭源 + 开源私有化部署”两套 API；
  - **Mistral AI**：被称为“欧洲的 OpenAI”，以 MoE 架构发布模型；
  - **Gemma 2**（Google）、**Phi-3**（微软，小尺寸、性能不错）、**Llama**（Meta，本轮开源核心）；
  - 国内：**通义千问 Qwen、DeepSeek**；
- 实践路径：用 **Ollama + Hugging Face**，在自有 GPU 或公有云租的 GPU 上搭建私有化 LLM 服务，暴露 **REST API** 即可调用（课程先讲闭源再讲开源，照顾没有 GPU 的同学）。

### 3.2 Agent 类型（三个维度）

三类切分**维度不同、有重叠**，目的是听到各种 “XX Agent” 时不被名字扰乱，而是关注其**内涵**：面向什么场景、解决什么问题。

| 维度 | 类型 | 说明 |
| --- | --- | --- |
| 场景 | Action / Simulation / Autonomous | 按用途划分：执行动作、模拟仿真、自主运行 |
| 技术 | Chatbot / Multi-Agent / RAG / Planning / Reflection / Evaluation | 按所用技术划分 |
| 智能 | Simple Reflex / Model-based Reflex / Goal-based / Utility-based / Learning | 按智能层级划分（经典 AI Agent 分类） |

### 3.3 核心能力

企业级/生产级 Agent 必须搭建的四大能力：

- **Planning（规划）**：把复杂问题拆成小问题、分领域执行（AutoGPT 最先示范，后来 multi-agent 沿此思路做更细的控制）；
- **Memory（记忆）**：上下文与长期记忆；
- **Tools（工具）**：调用外部工具/API；
- **Action（执行）**：执行动作并验证结果。

### 3.4 开发框架

- **LangChain**：发展最重要的一环——把**模型服务与提示工程解耦**，形成中间层设计；从最早的 Chain 嵌套（LLMChain、Router Chain、Transform Chain）转向 **Runnable / LCEL 表达式语言**（0.3 版本）；
- **LlamaIndex**：侧重数据/检索（RAG）场景；
- **Semantic Kernel**：微软框架。

---

## 4. 如何开发一个 Agent（从 MVP 到生产）

按课程脉络，开发路径是：

1. **定目标与场景**：明确 Agent 面向什么场景、解决什么问题（对照 3.2 的 Agent 类型）；
2. **选模型服务**：闭源 API（Claude / GPT-4）或开源私有化（Ollama + Hugging Face 自建 REST API）；
3. **搭核心能力**：规划、记忆、工具、执行四大件；
4. **选框架**：LangChain（0.3 Runnable）/ LlamaIndex / Semantic Kernel，把模型服务与提示工程解耦；
5. **做 MVP**：先做最小可用产品，不追求前端美化（技术栈图即 MVP 视角）；
6. **外围工程化**（后续课程深入）：
   - **生产部署平台**：Agent 要能部署、支撑生产级访问；
   - **可视化前端**：命令行工具缺交互，需要前端让普通人也能用；
   - **Docker 容器化**：一键部署、跨服务器快速使用、分享给研发同事；
7. **一人团队方法论**：利用 ChatGPT 等大模型应用撬动杠杆，一个人承担产品全链路（课上以作者与 ChatGPT 的聊天实践为例）。

---

## 5. 具体要学什么（学习清单）

| 优先级 | 模块 | 内容 | 依据 |
| --- | --- | --- | --- |
| ★★★ | 大模型与提示工程 | 提示工程、思维链（CoT）、few-shot | 提升生成质量的基础，课程前期已讲 |
| ★★★ | Agent 理论 | 精读 ReAct 论文（arXiv:2210.03629，很短） | Agent 早期范式，必读 |
| ★★★ | Agent 类型 | 场景/技术/智能三个维度；听到 XX Agent 关注内涵 | 技术栈图核心 |
| ★★★ | 核心能力 | Planning / Memory / Tools / Action | 生产级 Agent 四大件 |
| ★★★ | 开发框架 | LangChain（重点，0.3 Runnable）、LlamaIndex、Semantic Kernel | 解耦模型服务与提示工程 |
| ★★☆ | 模型服务 | 闭源 API + 开源私有化（Ollama / Hugging Face + GPU） | 课程三个项目贯穿 |
| ★★☆ | 工程化 | 生产部署平台、可视化前端、Docker 容器化 | 外围关键技术 |
| ★☆☆ | 方法 | 一人团队：用大模型应用撬动杠杆 | 实践分享 |

> 学习建议（课程原意）：不要一开始就盯着细节写代码；先建立总体认知和知识架构，后续**对照技术栈不断深挖、按需点自己的科技树**。课程通过 3 个 Agent 项目举一反三，不要求覆盖每个模型/框架/类型。学完不要还只会说“有 LangChain、有 RAG”——那就不专业了。

---

## 6. 术语对照（字幕 ASR 还原）

| 字幕原词 | 实际术语 |
| --- | --- |
| 年CHEN / NCHEN / 南茜 / 连倩 / MANCHIN | LangChain |
| 津巴兔 | Gemma |
| 拉A3 | Llama 3 |
| GPTBT | GPT-1（2018） |
| 欧拉玛 | Ollama |
| hagin face top | Hugging Face |
| 费三 | Phi-3 |
| MISTROMISTALAI | Mistral AI |
| chill fts | Chain-of-Thought（思维链） |
| fuel short | few-shot |
| market agent | multi-agent（多智能体） |
| A证 / A型 | Agent |
| cloud3 / claud3.5 | Claude 3 / Claude 3.5 |
| 用开发时代领和微调 | 大模型开发与微调（ASR 不确定） |

---

## 7. 边界说明

- 本笔记基于第 7 集（22:53）**字幕**与课程 **PPT 截图**整理；PPT 原文引用处与字幕一致；
- 本课是**总纲课**：Agent 类型三个维度、各框架细节、生产部署等只做引入，具体展开在后续课程；
- 课件中模型版本（Claude 3、GPT-4、Gemma 2、Phi-3 等）为课程制作时点的信息，实际以当前官方版本为准；
- 字幕存在语音识别噪声，关键术语已按上下文还原（见上表）；无法确认处已标注。

## 副产物导航

副产物（原始字幕、时间轴转录、元数据）仅存本地，不进公开仓库。来源：[https://www.bilibili.com/video/BV1xwVr6FEh4?p=7](https://www.bilibili.com/video/BV1xwVr6FEh4?p=7)
