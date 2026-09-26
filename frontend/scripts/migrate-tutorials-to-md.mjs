/**
 * 一次性迁移脚本：把 22 篇教程 page.tsx 里的
 *   const content = `...`; 字符串
 * 抽取出来，转成 backtick escape 还原 + 写到 content.md，
 * 然后 page.tsx 替换为 readFile 模板。
 *
 * 用法：node scripts/migrate-tutorials-to-md.mjs
 * 备份：迁移前会复制 page.tsx 到 .bak（首次迁移时）
 *
 * 不动 MarkdownContent 组件 / tutorial-resources.ts
 * 不动 React 客户端 mermaid 渲染 / TOC
 */
import { readFile, writeFile, rename, access } from "node:fs/promises";
import path from "node:path";

const ROOT = "/Users/xiaoye/Desktop/algorithms/frontend";
const TUTORIALS_DIR = path.join(ROOT, "src/app/tutorials");

const SLUGS = [
  "binary-search",
  "stack",
  "queue",
  "linked-list",
  "hash-table",
  "heap",
  "binary-tree",
  "binary-search-tree",
  "red-black-tree",
  "trie",
  "union-find",
  "segment-tree",
  "quick-sort",
  "merge-sort",
  "recursion",
  "dynamic-programming",
  "greedy",
  "sliding-window",
  "graph-algorithms",
  "monotonic-stack",
  "time-complexity",
  "lru-cache",
  "interview-system",
];

// 1. 提取 const content = `...`; 的内容（含转义）
function extractContent(src) {
  // 匹配 "  const content = `...`;" 或 "const content = `...`;"
  const re = /^(\s*)const\s+content\s*=\s*`([\s\S]*?)`\s*;/m;
  const m = src.match(re);
  if (!m) return null;
  return { indent: m[1] ?? "", body: m[2] };
}

// 2. 反 escape：JS 模板字符串里的 \` → `，\\ → \
function unescape(raw) {
  return raw
    .replace(/\\`/g, "`")  // \` → `
    .replace(/\\\\/g, "\\"); // \\ → \
}

// 3. 提取 "tag + h1 文本" 给 frontmatter
function buildFrontmatter(raw) {
  // 匹配第一个 # 开头的标题
  const h1Match = raw.match(/^#\s+(.+?)$/m);
  const title = h1Match ? h1Match[1].trim() : "Untitled";
  return `---\ntitle: ${title}\n---\n\n`;
}

// 4. 生成新 page.tsx 内容
function newPageTsx(slug, title) {
  // title 用于 h1 显示；上一个文件里 h1 是手写的，去掉重复
  // 简单起见：保留原 h1 标签，但 spell-check 出来才知道要不要
  return `import { readFile } from "node:fs/promises";
import path from "node:path";
import { MarkdownContent } from "@/components/tutorial/markdown-content";
import { RelatedResources } from "@/components/tutorial/related-resources";
import { tutorialResources } from "@/lib/tutorial-resources";

export default async function ${slugToPascal(slug)}Page() {
  const mdPath = path.join(process.cwd(), "src/app/tutorials/${slug}/content.md");
  const content = await readFile(mdPath, "utf8");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">数据结构</span>
        <h1 className="text-3xl font-bold mt-2">${escapeForJsx(title)}</h1>
      </div>

      <MarkdownContent content={content} />

      <RelatedResources
        tutorials={tutorialResources["${slug}"]?.tutorials ?? []}
        visualizers={tutorialResources["${slug}"]?.visualizers ?? []}
        problems={tutorialResources["${slug}"]?.problems ?? []}
      />
    </div>
  );
}
`;
}

function slugToPascal(slug) {
  return slug
    .split(/[-_]/)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join("");
}

function escapeForJsx(s) {
  return s.replace(/"/g, '\\"');
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function processSlug(slug, { skipExisting = false } = {}) {
  const tsxPath = path.join(TUTORIALS_DIR, slug, "page.tsx");
  const mdPath = path.join(TUTORIALS_DIR, slug, "content.md");
  const bakPath = path.join(TUTORIALS_DIR, slug, "page.tsx.bak");

  if (await fileExists(mdPath)) {
    if (skipExisting) {
      console.log(`[skip] ${slug} (content.md exists)`);
      return { slug, status: "skipped" };
    }
  }

  const tsx = await readFile(tsxPath, "utf8");
  const extracted = extractContent(tsx);
  if (!extracted) {
    console.log(`[fail] ${slug}: no "const content = \`...\`;" found`);
    return { slug, status: "fail" };
  }

  const raw = unescape(extracted.body);
  const frontmatter = buildFrontmatter(raw);
  const md = frontmatter + raw;

  // 备份（如果还没备份过）
  if (!(await fileExists(bakPath))) {
    await rename(tsxPath, bakPath);
  }

  // 写 md
  await writeFile(mdPath, md, "utf8");

  // 写新 tsx
  const h1Match = raw.match(/^#\s+(.+?)$/m);
  const title = h1Match ? h1Match[1].trim() : slug;
  const newTsx = newPageTsx(slug, title);
  await writeFile(tsxPath, newTsx, "utf8");

  console.log(`[ok] ${slug}: ${md.length} bytes MD, page.tsx ${newTsx.length} bytes`);
  return { slug, status: "ok" };
}

async function main() {
  const skipExisting = process.argv.includes("--skip-existing");
  console.log(`Migrating ${SLUGS.length} tutorials${skipExisting ? " (skip existing)" : ""}...`);
  let ok = 0, fail = 0, skipped = 0;
  for (const slug of SLUGS) {
    const r = await processSlug(slug, { skipExisting });
    if (r.status === "ok") ok++;
    else if (r.status === "skipped") skipped++;
    else fail++;
  }
  console.log(`\nDone. ok=${ok} skipped=${skipped} fail=${fail}`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
