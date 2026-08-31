// 笔记发布配置：站点写入位置 + 每篇笔记的「非派生字段」。
//
// 能从笔记正文自动推导的字段（title / type / source / sourceUrl / author /
// duration / date / sourceId）都不写在这里，由 publish-notes.mjs 解析。
// 这里只放推不出来的：slug、分类、中英文摘要、英文标题。
//
// 新增一篇笔记时，在本文件的 notes 里加一条，key 用 media-note/ 下的文件名。

import { fileURLToPath } from 'node:url';

// media-notes 与 dithob.github.io 同为 D:/TestProjects 下的兄弟目录。
// 目录关系变了就用 SITE_NOTES_DIR 覆盖。
const defaultSiteNotesDir = fileURLToPath(
  new URL('../../dithob.github.io/src/content/notes/', import.meta.url),
);

export const siteNotesDir = process.env.SITE_NOTES_DIR || defaultSiteNotesDir;

export const notes = {
  'Pi 使用手册.md': {
    slug: 'pi-usage-manual',
    titleEn: 'Pi usage manual',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '只有 4 个工具、系统提示词约 1000 token 的极简 coding agent，MCP、子代理、计划模式全部靠插件补回来，代价是几乎零安全限制。',
    summaryEn:
      'A minimal coding agent with only four tools and a ~1000-token system prompt. MCP, subagents, and plan mode all come back through plugins; the trade-off is near-zero safety restrictions.',
  },

  'Superpowers 与 Harness Engineering 笔记.md': {
    slug: 'superpowers-harness-engineering',
    titleEn: 'Superpowers and harness engineering',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary:
      '用 spec + plan 锁死验收标准、用子代理拆分任务清空上下文、用 TDD 红绿灯约束写代码环节的 Agent 工作流插件，代价是时间和 token 成倍上涨。',
    summaryEn:
      'An agent workflow plugin that locks acceptance criteria with spec + plan, clears context via subagents, and constrains coding with a TDD red-green loop — at the cost of multiplied time and token usage.',
  },

  'Agent Skills 从入门到实战手册.md': {
    slug: 'agent-skills-practical-manual',
    titleEn: 'A practical manual for Agent Skills',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary: '从概念、目录结构和环境搭建，到编写、调试、复用 Skill 的完整入门手册。',
    summaryEn: 'A practical beginner manual covering Agent Skill concepts, structure, setup, authoring, debugging, and reuse.',
  },

  'Git 与 GitHub 核心概念笔记.md': {
    slug: 'git-github-core-concepts',
    titleEn: 'Git and GitHub core concepts',
    category: 'Engineering',
    categoryEn: 'Engineering',
    summary: '梳理 Git 版本控制、GitHub 协作、分支、提交、合并与常用实战流程。',
    summaryEn: 'A structured guide to Git version control, GitHub collaboration, branches, commits, merges, and practical workflows.',
  },

  'Pi Agent 使用手册.md': {
    slug: 'pi-agent-usage-manual',
    titleEn: 'Pi Agent usage manual',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary: '介绍 Pi Agent 的极简设计、安装、插件、技能、Session 管理、扩展与安全边界。',
    summaryEn: 'A practical overview of Pi Agent: its minimal design, setup, plugins, skills, sessions, extensions, and security boundaries.',
  },

  'Pi Agent 工程实现指南.md': {
    slug: 'pi-agent-engineering-guide',
    titleEn: 'Pi Agent engineering guide',
    category: 'AI / Agent',
    categoryEn: 'AI / Agent',
    summary: '从 npm monorepo、模型抽象层到 agent loop 和会话存储，拆解 Pi 的工程实现。',
    summaryEn: 'An engineering walkthrough of Pi, from its npm monorepo and model abstraction to the agent loop and session storage.',
  },

  'RAG 入门课程笔记.md': {
    slug: 'rag-beginner-course-notes',
    titleEn: 'RAG beginner course notes',
    category: 'AI / RAG',
    categoryEn: 'AI / RAG',
    summary: '从索引、检索、生成到评估和模块化 RAG，整理面向初学者的完整知识主线。',
    summaryEn: 'Beginner-friendly notes covering the full RAG path from indexing, retrieval, and generation to evaluation and modular RAG.',
  },

  '测试开发学习路线笔记.md': {
    slug: 'software-testing-development-roadmap',
    titleEn: 'Software testing and development roadmap',
    category: 'Testing',
    categoryEn: 'Testing',
    summary: '按阶段梳理从编程基础、测试基础到自动化、平台工程和求职准备的测开学习路线。',
    summaryEn: 'A staged roadmap from programming and testing fundamentals to automation, platform engineering, and career preparation.',
  },

  'Playwright 深入掌握笔记.md': {
    slug: 'playwright-in-depth',
    titleEn: 'Playwright in depth',
    category: 'Testing',
    categoryEn: 'Testing',
    summary: '围绕页面导航、内容读取、动作、evaluate、元素操作和断言建立 Playwright API 全景。',
    summaryEn: 'A structured overview of Playwright APIs covering navigation, content, actions, evaluate, element operations, and assertions.',
  },
};
