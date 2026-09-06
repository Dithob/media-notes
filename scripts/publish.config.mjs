// 笔记发布配置：站点写入位置 + 每篇笔记的「非派生字段」。
//
// 能从笔记正文自动推导的字段（title / type / source / sourceUrl / author /
// duration / date / sourceId）都不写在这里，由 publish-notes.mjs 解析。
// 这里只放推不出来的：slug、分类、中英文摘要、英文标题。
//
// 新增一篇笔记时，在本文件的 notes 里加一条，key 用 media-note/ 下的相对路径
// （含分类/系列子目录，与 media-note/README.md 索引表标题列链接一致）。

import { fileURLToPath } from 'node:url';

// media-notes 与 dithob.github.io 同为 D:/TestProjects 下的兄弟目录。
// 目录关系变了就用 SITE_NOTES_DIR 覆盖。
const defaultSiteNotesDir = fileURLToPath(
  new URL('../../dithob.github.io/src/content/notes/', import.meta.url),
);

export const siteNotesDir = process.env.SITE_NOTES_DIR || defaultSiteNotesDir;

export const notes = {
  '软件使用说明/Pi 使用手册.md': {
    slug: 'pi-usage-manual',
    titleEn: 'Pi usage manual',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '只有 4 个工具、系统提示词约 1000 token 的极简 coding agent，MCP、子代理、计划模式全部靠插件补回来，代价是几乎零安全限制。',
    summaryEn:
      'A minimal coding agent with only four tools and a ~1000-token system prompt. MCP, subagents, and plan mode all come back through plugins; the trade-off is near-zero safety restrictions.',
  },

  'AI 工具指南/Superpowers 与 Harness Engineering 笔记.md': {
    slug: 'superpowers-harness-engineering',
    titleEn: 'Superpowers and harness engineering',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '用 spec + plan 锁死验收标准、用子代理拆分任务清空上下文、用 TDD 红绿灯约束写代码环节的 Agent 工作流插件，代价是时间和 token 成倍上涨。',
    summaryEn:
      'An agent workflow plugin that locks acceptance criteria with spec + plan, clears context via subagents, and constrains coding with a TDD red-green loop — at the cost of multiplied time and token usage.',
  },

  'AI 工具指南/Agent Skills 从入门到实战手册.md': {
    slug: 'agent-skills-practical-manual',
    titleEn: 'A practical manual for Agent Skills',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary: '从概念、目录结构和环境搭建，到编写、调试、复用 Skill 的完整入门手册。',
    summaryEn: 'A practical beginner manual covering Agent Skill concepts, structure, setup, authoring, debugging, and reuse.',
  },

  '编程基础/Git 与 GitHub 核心概念笔记.md': {
    slug: 'git-github-core-concepts',
    titleEn: 'Git and GitHub core concepts',
    category: 'Engineering',
    categoryEn: 'Engineering',
    summary: '梳理 Git 版本控制、GitHub 协作、分支、提交、合并与常用实战流程。',
    summaryEn: 'A structured guide to Git version control, GitHub collaboration, branches, commits, merges, and practical workflows.',
  },

  '软件使用说明/Pi Agent 使用手册.md': {
    slug: 'pi-agent-usage-manual',
    titleEn: 'Pi Agent usage manual',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary: '介绍 Pi Agent 的极简设计、安装、插件、技能、Session 管理、扩展与安全边界。',
    summaryEn: 'A practical overview of Pi Agent: its minimal design, setup, plugins, skills, sessions, extensions, and security boundaries.',
  },

  '开发教程/Pi Agent 工程实现指南.md': {
    slug: 'pi-agent-engineering-guide',
    titleEn: 'Pi Agent engineering guide',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary: '从 npm monorepo、模型抽象层到 agent loop 和会话存储，拆解 Pi 的工程实现。',
    summaryEn: 'An engineering walkthrough of Pi, from its npm monorepo and model abstraction to the agent loop and session storage.',
  },

  '开发教程/RAG 入门课程笔记.md': {
    slug: 'rag-beginner-course-notes',
    titleEn: 'RAG beginner course notes',
    category: 'AI / RAG',
    categoryEn: 'AI / RAG',
    summary: '从索引、检索、生成到评估和模块化 RAG，整理面向初学者的完整知识主线。',
    summaryEn: 'Beginner-friendly notes covering the full RAG path from indexing, retrieval, and generation to evaluation and modular RAG.',
  },

  '学习路线/测试开发学习路线笔记.md': {
    slug: 'software-testing-development-roadmap',
    titleEn: 'Software testing and development roadmap',
    category: 'Testing',
    categoryEn: 'Testing',
    summary: '按阶段梳理从编程基础、测试基础到自动化、平台工程和求职准备的测开学习路线。',
    summaryEn: 'A staged roadmap from programming and testing fundamentals to automation, platform engineering, and career preparation.',
  },

  '开发教程/Playwright 系列/Playwright 深入掌握笔记.md': {
    slug: 'playwright-in-depth',
    titleEn: 'Playwright in depth',
    category: 'Testing',
    categoryEn: 'Testing',
    summary: '围绕页面导航、内容读取、动作、evaluate、元素操作和断言建立 Playwright API 全景。',
    summaryEn: 'A structured overview of Playwright APIs covering navigation, content, actions, evaluate, element operations, and assertions.',
  },

  '开发教程/Agent方法论/AI Agent 概述与开发指南笔记.md': {
    slug: 'ai-agent-overview-dev-guide',
    titleEn: 'AI Agent overview and development guide',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '从 Agent 定义、ReAct 早期范式、最简核心组件到四层开发技术栈（模型服务 / Agent 类型 / 核心能力 / 开发框架），总纲式梳理 Agent 是什么、怎么开发、学什么。',
    summaryEn:
      'An outline-style guide to AI agents: definition, the ReAct early paradigm, minimal core components, and a four-layer tech stack (model services, agent types, core capabilities, frameworks) — what an agent is, how to build one, and what to learn.',
  },

  '开发教程/Agent方法论/Agent 核心能力、开发框架与外围技术栈笔记.md': {
    slug: 'agent-core-capabilities-frameworks',
    titleEn: 'Agent core capabilities, frameworks, and surrounding tech',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '拆解 Agent 四大核心能力（Planning / Memory / Tools / Action）与三大开发框架（LangChain、LlamaIndex、Semantic Kernel），并延伸到部署、评估、前端与容器化等外围技术。',
    summaryEn:
      'A breakdown of the four core agent capabilities (Planning, Memory, Tools, Action) and the three major frameworks (LangChain, LlamaIndex, Semantic Kernel), extended to hosting, evaluation, frontend, and containerization.',
  },

  '开发教程/Agent方法论/大模型时代的 Agent 开发方法论笔记.md': {
    slug: 'agent-dev-methodology-llm-era',
    titleEn: 'Agent development methodology in the LLM era',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '一个人加一个大模型如何交付一款 Agent：七个角色的工作量如何被压缩、大模型能接住哪七个阶段，以及用真实 ChatGPT 对话演示的立项调研、竞品分析、分版本排期与基础架构搭建全过程。',
    summaryEn:
      'How one person plus an LLM can ship an agent: which of the seven roles get compressed, which seven project stages an LLM can take over, and a real ChatGPT transcript walking through market research, competitive analysis, versioned planning, and scaffolding.',
  },

  '开发教程/Agent进阶篇/Agent 原理与多智能体协同笔记.md': {
    slug: 'agent-principles-multi-agent-collab',
    titleEn: 'Agent principles and multi-agent collaboration',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '从人与大模型多轮对话的局限讲起，用飞猪案例拆解 Agent 的完整工作方式，梳理 Agent = 大模型 + 规划 + 记忆 + 工具的经典架构，并对比上下级、师生式、竞争式三种多智能体协同范式。',
    summaryEn:
      'Starting from the limits of one-shot human-LLM chat, this note uses Fliggy as a case to walk through how an agent works, then maps the classic agent stack (LLM + planning + memory + tools) and compares supervisor, teacher-student, and competitive multi-agent patterns.',
  },

  '开发教程/Agent进阶篇/客户数据分析与营销方案实战笔记.md': {
    slug: 'customer-analysis-marketing-crewai',
    titleEn: 'Customer analysis and marketing with CrewAI',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '用 CrewAI 把销售场景（收集客户信息 → 判定意向等级 → 定制跟进策略）交给两个 Agent 协作完成：大白话定义角色与任务、配内置/自定义工具、接 DeepSeek 国产模型，自动输出公司分析报告与销售跟进邮件。',
    summaryEn:
      'A CrewAI hands-on for sales: two collaborative agents (sales rep + senior sales rep) collect target-company info, score prospects, and draft follow-up emails — defining roles/tasks in plain language, wiring built-in and custom tools, and switching the backend to DeepSeek.',
  },

  '开发教程/Agent进阶篇/Agent 多行业落地场景笔记.md': {
    slug: 'agent-industry-case-studies',
    titleEn: 'Agent adoption stories across industries',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '客服工单（HubSpot）、软件开发（MetaGPT、Cover Agent）、传统工业设备维护三类真实落地案例：从数据/知识库构建、多模态处理到量化收益（效率 +12%、检修 -60%），最后落在 AI 时代的思维转变。',
    summaryEn:
      'Real adoption stories in support tickets (HubSpot), software development (MetaGPT, Cover Agent), and industrial equipment maintenance — from knowledge-base construction and multimodal processing to measurable gains (+12% efficiency, -60% repair time).',
  },

  '开发教程/Agent项目篇/IM 多平台智能客服项目说明书.md': {
    slug: 'im-multi-platform-customer-service',
    titleEn: 'IM multi-platform AI customer-service project',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '用 Dify（Chatflow/RAG/Agent 编排）加 LangBot（多 IM 机器人网关）搭建"一次开发、多平台部署"的全渠道智能客服：方案优势、三类应用场景，以及企业微信 RAG 客服与飞书高考志愿客服两个端到端实战与配置速查。',
    summaryEn:
      'A project playbook for a full-channel AI customer-service platform built with Dify (Chatflow/RAG/agent orchestration) and LangBot (multi-IM bot gateway): architecture, advantages, scenarios, and two end-to-end builds — a WeChat Work RAG bot and a Feishu college-admission bot.',
  },
};
