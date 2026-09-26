/**
 * remark-code-tabs
 *
 * 将连续的带 `tab` meta 标记的代码块合并为一个 codeTabs 自定义节点。
 *
 * Markdown 写法：
 * ```java tab
 * public int search(...) { ... }
 * ```
 * ```javascript tab
 * function search(...) { ... }
 * ```
 * ```python tab
 * def search(...): ...
 * ```
 *
 * 渲染为带语言标签切换的代码块组。
 */
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Code, Parent } from 'mdast';

interface CodeTabItem {
  lang: string;
  label: string;
  value: string;
}

interface CodeTabsNode {
  type: 'codeTabs';
  data: {
    hName: 'codeTabs';
    hProperties: { tabs: CodeTabItem[] };
  };
  children: [];
}

// 语言名 → 显示标签映射
const LANG_LABELS: Record<string, string> = {
  java: 'Java',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  python: 'Python',
  py: 'Python',
  go: 'Go',
  golang: 'Go',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  rust: 'Rust',
  rs: 'Rust',
  kotlin: 'Kotlin',
  kt: 'Kotlin',
  swift: 'Swift',
  ruby: 'Ruby',
  rb: 'Ruby',
  php: 'PHP',
  csharp: 'C#',
  cs: 'C#',
  'c#': 'C#',
  shell: 'Shell',
  bash: 'Bash',
  sh: 'Shell',
  zsh: 'Zsh',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  markdown: 'Markdown',
  md: 'Markdown',
  plaintext: 'Text',
  text: 'Text',
  txt: 'Text',
};

function getLabel(lang: string): string {
  return LANG_LABELS[lang.toLowerCase()] ?? lang.toUpperCase();
}

function hasTabMeta(meta: string | null | undefined): boolean {
  if (!meta) return false;
  return /\btab\b/.test(meta);
}

function getCustomLabel(meta: string | null | undefined): string | null {
  if (!meta) return null;
  // 支持 tab="Custom Label" 或 tab=CustomLabel
  const match = meta.match(/tab\s*=\s*"?([^"\s]+)"?/);
  return match ? match[1] : null;
}

const remarkCodeTabs: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (node.type !== 'code') return;

      const codeNode = node as Code;
      if (!hasTabMeta(codeNode.meta)) return;

      // 收集连续的 tab 代码块
      const tabs: CodeTabItem[] = [];
      let i = index;

      while (i < parent.children.length) {
        const child = parent.children[i];
        if (child.type !== 'code') break;
        const code = child as Code;
        if (!hasTabMeta(code.meta)) break;

        const lang = code.lang ?? 'text';
        const customLabel = getCustomLabel(code.meta);
        tabs.push({
          lang,
          label: customLabel ?? getLabel(lang),
          value: code.value,
        });
        i++;
      }

      // 至少 2 个才成组
      if (tabs.length < 2) return;

      // 构建自定义节点
      const codeTabsNode = {
        type: 'codeTabs',
        data: {
          hName: 'codeTabs',
          hProperties: { 'data-tabs': JSON.stringify(tabs) },
        },
        children: [],
      } as unknown as Code;

      // 替换原始节点
      const count = i - index;
      (parent as Parent).children.splice(index, count, codeTabsNode);

      // 返回 SKIP 避免重复访问
      return ['skip', index];
    });
  };
};

export default remarkCodeTabs;
