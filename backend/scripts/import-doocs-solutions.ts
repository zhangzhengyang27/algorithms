/**
 * 从 doocs/leetcode 仓库导入题解代码和解题思路到数据库。
 * 只导入 Java / Python / TypeScript / JavaScript 四种语言。
 * 仅填充缺失语言，不覆盖已有代码。
 *
 * 运行: cd backend && npx ts-node scripts/import-doocs-solutions.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DOOCS_ROOT = '/Users/xiaoye/Desktop/待处理的项目/leetcode';

// 语言文件映射
const LANG_FILES: Record<string, string> = {
  java: 'Solution.java',
  python: 'Solution.py',
  typescript: 'Solution.ts',
  javascript: 'Solution.js',
};

// 已知的 slug 不一致映射（数据库 slug → LeetCode slug）
const SLUG_MAP: Record<string, string> = {
  'smallest-k-numbers': 'zui-xiao-de-kge-shu-lcof',
  'intersection-of-arrays': 'two-sum',
  'top-k-frequent': 'top-k-frequent-elements',
  'reverse-pairs': 'shu-zu-zhong-de-ni-xu-dui-lcof',
  'trap-rain-water': 'trapping-rain-water',
  'find-min-rotated': 'find-minimum-in-rotated-sorted-array',
  'squares-of-sorted-array': 'squares-of-a-sorted-array',
  'remove-duplicates': 'remove-duplicates-from-sorted-array',
  'is-ugly': 'ugly-number',
  'longest-substring-without-repeating': 'longest-substring-without-repeating-characters',
  'reverse-array': 'reverse-string',
  'intersect': 'intersection-of-two-arrays-ii',
  'int-to-roman': 'integer-to-roman',
  'reverse-words': 'reverse-words-in-a-string',
  'remove-nth-node': 'remove-nth-node-from-end-of-list',
  'four-sum-ii': '4sum-ii',
  'intersection-of-linked-lists': 'intersection-of-two-linked-lists',
  'largest-rectangle-histogram': 'largest-rectangle-in-histogram',
  'implement-queue-stacks': 'implement-queue-using-stacks',
  'min-depth-binary-tree': 'minimum-depth-of-binary-tree',
  'inorder-traversal': 'binary-tree-inorder-traversal',
  'best-time-to-buy-sell-stock': 'best-time-to-buy-and-sell-stock',
  'right-side-view': 'binary-tree-right-side-view',
  'lowest-common-ancestor': 'lowest-common-ancestor-of-a-binary-tree',
  'zigzag-level-order': 'binary-tree-zigzag-level-order-traversal',
  'kth-smallest-bst': 'kth-smallest-element-in-a-bst',
  'kth-largest-element': 'kth-largest-element-in-an-array',
  'excel-column-number': 'excel-sheet-column-number',
  'n-th-tribonacci': 'n-th-tribonacci-number',
  'bitwise-and-range': 'bitwise-and-of-numbers-range',
  'binary-alternating-bits': 'binary-number-with-alternating-bits',
  'queue-reconstruction': 'queue-reconstruction-by-height',
  'min-size-subarray-sum': 'minimum-size-subarray-sum',
  'three-sum': '3sum',
  'copy-list-random': 'copy-list-with-random-pointer',
  'validate-bst': 'validate-binary-search-tree',
  // 扩充映射：缩写 slug → 完整 LeetCode slug
  'three-sum-closest': '3sum-closest',
  'surround-regions': 'surrounded-regions',
  'pacific-atlantic': 'pacific-atlantic-water-flow',
  'best-time-to-buy-sell-stock-ii': 'best-time-to-buy-and-sell-stock-ii',
  'two-sum-ii': 'two-sum-ii-input-array-is-sorted',
  'excel-column-title': 'excel-sheet-column-title',
  'preorder-traversal': 'binary-tree-preorder-traversal',
  'sort-characters-frequency': 'sort-characters-by-frequency',
  'eval-rpn': 'evaluate-reverse-polish-notation',
  'restore-ip': 'restore-ip-addresses',
  'first-unique-char': 'first-unique-character-in-a-string',
  'roman-to-int': 'roman-to-integer',
  'average-of-levels': 'average-of-levels-in-binary-tree',
  'implement-trie': 'implement-trie-prefix-tree',
  'postorder-traversal': 'binary-tree-postorder-traversal',
  'range-sum-bst': 'range-sum-of-bst',
  'minimum-arrows': 'minimum-number-of-arrows-to-burst-balloons',
  'level-order-traversal': 'binary-tree-level-order-traversal',
  'letter-combinations': 'letter-combinations-of-a-phone-number',
  'product-except-self': 'product-of-array-except-self',
  'max-depth-binary-tree': 'maximum-depth-of-binary-tree',
  'find-first-and-last-position': 'find-first-and-last-position-of-element-in-sorted-array',
  'remove-linked-list-elements': 'remove-linked-list-elements',
  'search-insert-position': 'search-insert-position',
  'maximum-subarray': 'maximum-subarray',
  'merge-sorted-array': 'merge-sorted-array',
  'climbing-stairs': 'climbing-stairs',
  'house-robber': 'house-robber',
  'jump-game': 'jump-game',
  'unique-paths': 'unique-paths',
  'set-matrix-zeroes': 'set-matrix-zeroes',
  'spiral-matrix': 'spiral-matrix',
  'spiral-matrix-ii': 'spiral-matrix-ii',
  'plus-one': 'plus-one',
  'group-anagrams': 'group-anagrams',
  'first-missing-positive': 'first-missing-positive',
  'linked-list-cycle-ii': 'linked-list-cycle-ii',
  'string-to-integer-atoi': 'string-to-integer-atoi',
  'median-of-two-sorted-arrays': 'median-of-two-sorted-arrays',
  'isomorphic-strings': 'isomorphic-strings',
  'rectangle-area': 'rectangle-area',
  'delete-node-in-a-linked-list': 'delete-node-in-a-linked-list',
  'frog-jump': 'frog-jump',
  'arranging-coins': 'arranging-coins',
  'concatenated-words': 'concatenated-words',
  'ones-and-zeroes': 'ones-and-zeroes',
};

// 反转映射：LeetCode slug → 数据库 slug
const REVERSE_SLUG_MAP: Record<string, string> = {};
for (const [dbSlug, lcSlug] of Object.entries(SLUG_MAP)) {
  REVERSE_SLUG_MAP[lcSlug] = dbSlug;
}

/**
 * 从 doocs README.md 第一行提取 LeetCode slug 和中文标题
 * 格式: # [15. 三数之和](https://leetcode.cn/problems/3sum)
 */
function extractReadmeInfo(readmePath: string): { slug: string; title: string } | null {
  try {
    const content = fs.readFileSync(readmePath, 'utf-8');
    const slugMatch = content.match(/https:\/\/leetcode\.cn\/problems\/([^)\s/]+)/);
    // 标题格式多样："# [15. 三数之和](...)" 或 "# [面试题 03. 数组中重复的数字](...)" 或 "# [剑指 Offer II 001. 整数除法](...)"
    const titleMatch = content.match(/^#\s*\[.+?[.．]\s*(.+?)\]/m);
    if (!slugMatch) return null;
    return {
      slug: slugMatch[1],
      title: titleMatch ? titleMatch[1].trim() : '',
    };
  } catch {
    return null;
  }
}

/**
 * 从 README.md 提取 "## 解法" 部分的纯文本思路（去掉代码块）
 */
function extractExplanation(readmePath: string): string | null {
  try {
    const content = fs.readFileSync(readmePath, 'utf-8');
    // 找到 "## 解法" 开始
    const startIdx = content.indexOf('## 解法');
    if (startIdx === -1) return null;

    const afterSection = content.slice(startIdx + '## 解法'.length);
    // 到下一个 ## 或 <!-- tabs:start --> 为止
    const endMatch = afterSection.match(/\n## |\n<!-- tabs:start -->/);
    let section = endMatch
      ? afterSection.slice(0, endMatch.index)
      : afterSection.slice(0, 2000);

    // 去掉 HTML 注释
    section = section.replace(/<!--[\s\S]*?-->/g, '');
    // 去掉代码块
    section = section.replace(/```[\s\S]*?```/g, '');
    // 去掉多余空行
    section = section.replace(/\n{3,}/g, '\n\n').trim();

    return section.length > 20 ? section : null;
  } catch {
    return null;
  }
}

/**
 * 读取题解代码文件
 */
function readSolutionFile(dirPath: string, fileName: string): string | null {
  const filePath = path.join(dirPath, fileName);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      return content.length > 0 ? content : null;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * 扫描 doocs 所有题目目录（solution + lcof + lcof2 + lcci + lcp）
 */
function scanDoocsProblems(): string[] {
  const dirs: string[] = [];

  // 1. solution/ 主站题目
  const solutionDir = path.join(DOOCS_ROOT, 'solution');
  const ranges = fs.readdirSync(solutionDir).filter(d => /^\d{4}-\d{4}$/.test(d));
  for (const range of ranges) {
    const rangePath = path.join(solutionDir, range);
    const problems = fs.readdirSync(rangePath).filter(d => {
      const fullPath = path.join(rangePath, d);
      return fs.statSync(fullPath).isDirectory() && /^\d{4}\./.test(d);
    });
    for (const prob of problems) {
      dirs.push(path.join(rangePath, prob));
    }
  }

  // 2. lcof / lcof2 / lcci / lcp 目录
  for (const sub of ['lcof', 'lcof2', 'lcci', 'lcp', 'lcs']) {
    const subDir = path.join(DOOCS_ROOT, sub);
    if (!fs.existsSync(subDir)) continue;
    const entries = fs.readdirSync(subDir).filter(d => {
      const fullPath = path.join(subDir, d);
      return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'README.md'));
    });
    for (const entry of entries) {
      dirs.push(path.join(subDir, entry));
    }
  }

  return dirs;
}

async function main() {
  console.log('=== 从 doocs/leetcode 导入题解 ===\n');

  // 1. 加载数据库所有题目的 slug 和 title
  const dbProblems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, solutions: true, hints: true },
  });
  const slugToProblem = new Map<string, (typeof dbProblems)[0]>();
  const titleToProblem = new Map<string, (typeof dbProblems)[0]>();
  for (const p of dbProblems) {
    slugToProblem.set(p.slug, p);
    // 用中文标题建立索引（去掉空格和括号差异）
    const normalizedTitle = p.title.replace(/[\s（）()]/g, '');
    titleToProblem.set(normalizedTitle, p);
  }
  console.log(`数据库中共 ${dbProblems.length} 题\n`);

  // 2. 扫描 doocs 目录
  const doocsDirs = scanDoocsProblems();
  console.log(`doocs 仓库共 ${doocsDirs.length} 题\n`);

  // 3. 匹配并导入
  let matched = 0;
  let updated = 0;
  let solutionAdded = 0;
  let hintAdded = 0;
  const unmatched: string[] = [];

  for (const dir of doocsDirs) {
    const readmePath = path.join(dir, 'README.md');
    if (!fs.existsSync(readmePath)) continue;

    const info = extractReadmeInfo(readmePath);
    if (!info) continue;

    const lcSlug = info.slug;

    // 尝试匹配数据库 slug：直接匹配 → 反转映射 → 标题匹配
    let problem = slugToProblem.get(lcSlug);
    if (!problem && REVERSE_SLUG_MAP[lcSlug]) {
      problem = slugToProblem.get(REVERSE_SLUG_MAP[lcSlug]);
    }
    if (!problem && info.title) {
      const normalizedTitle = info.title.replace(/[\s（）()]/g, '');
      problem = titleToProblem.get(normalizedTitle);
    }
    if (!problem) {
      unmatched.push(lcSlug);
      continue;
    }
    matched++;

    // 读取各语言代码
    const existingSolutions = (problem.solutions as Record<string, string>) || {};
    const newSolutions = { ...existingSolutions };
    let hasNew = false;

    for (const [lang, fileName] of Object.entries(LANG_FILES)) {
      if (existingSolutions[lang]) continue; // 已有则跳过
      const code = readSolutionFile(dir, fileName);
      if (code) {
        newSolutions[lang] = code;
        hasNew = true;
        solutionAdded++;
      }
    }

    // 提取解题思路作为 hint
    let newHints = problem.hints as string[] | null;
    const explanation = extractExplanation(readmePath);
    if (explanation && (!newHints || newHints.length === 0)) {
      // 将思路拆分为要点（按段落）
      const points = explanation
        .split(/\n\n+/)
        .map(p => p.replace(/\n/g, ' ').trim())
        .filter(p => p.length > 10)
        .slice(0, 5);
      if (points.length > 0) {
        newHints = points;
        hintAdded++;
        hasNew = true;
      }
    }

    if (hasNew) {
      await prisma.problem.update({
        where: { id: problem.id },
        data: {
          solutions: newSolutions,
          ...(newHints ? { hints: newHints } : {}),
        },
      });
      updated++;
    }
  }

  console.log('=== 导入完成 ===');
  console.log(`匹配成功: ${matched} 题`);
  console.log(`实际更新: ${updated} 题`);
  console.log(`新增代码: ${solutionAdded} 条`);
  console.log(`新增思路: ${hintAdded} 题`);
  console.log(`未匹配: ${unmatched.length} 题（doocs 有但数据库无）`);

  if (unmatched.length > 0 && unmatched.length <= 30) {
    console.log('\n未匹配示例:', unmatched.slice(0, 20).join(', '));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
