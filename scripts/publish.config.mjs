// 笔记发布配置：站点写入位置 + 每篇笔记的「非派生字段」。
//
// 能从笔记正文自动推导的字段（title / type / source / sourceUrl / author /
// duration / date / sourceId）都不写在这里，由 publish-notes.mjs 解析。
// 这里只放推不出来的：slug、分类、中英文摘要、英文标题。
//
// 新增一篇笔记时，在本文件的 notes 里加一条，key 用 media-note/ 下的文件名。

import { fileURLToPath } from 'node:url';

// mediareport 与 dithob.github.io 同为 D:/TestProjects 下的兄弟目录。
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
};
