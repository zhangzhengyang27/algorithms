/**
 * 补抓「空壳」题解：扫描数据库里 solutions 为空/仅 starter template 的题目，
 * 通过 LeetCode questionSolutionArticles GraphQL 抓取真实 Java/Python/JavaScript/SQL 题解并写回。
 * 运行: cd backend && node scripts/fetch-empty-solutions.cjs
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GRAPHQL_URL = 'https://leetcode.cn/graphql';
const QUERY = `
  query questionSolutionArticles($questionSlug: String!, $first: Int, $skip: Int, $orderBy: SolutionArticleOrderBy) {
    questionSolutionArticles(questionSlug: $questionSlug, first: $first, skip: $skip, orderBy: $orderBy) {
      edges { node { title content } }
    }
  }
`;

// 数据库 slug → LeetCode slug 映射（与 fetch-leetcode-solutions.ts 保持一致）
const SLUG_MAP = {
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
  'surround-regions': 'surrounded-regions',
  'pacific-atlantic': 'pacific-atlantic-water-flow',
  'best-time-to-buy-sell-stock-ii': 'best-time-to-buy-and-sell-stock-ii',
  'two-sum-ii': 'two-sum-ii-input-array-is-sorted',
  'three-sum-closest': '3sum-closest',
  'excel-column-title': 'excel-sheet-column-title',
  'implement-strstr': 'find-the-index-of-the-first-occurrence-in-a-string',
  'happy-number': 'happy-number',
  'eval-rpn': 'evaluate-reverse-polish-notation',
  'preorder-traversal': 'binary-tree-preorder-traversal',
  'sort-characters-frequency': 'sort-characters-by-frequency',
  'restore-ip': 'restore-ip-addresses',
  'first-unique-char': 'first-unique-character-in-a-string',
  'roman-to-int': 'roman-to-integer',
  'postorder-traversal': 'binary-tree-postorder-traversal',
  'average-of-levels': 'average-of-levels-in-binary-tree',
  'implement-trie': 'implement-trie-prefix-tree',
  'level-order-traversal': 'binary-tree-level-order-traversal',
  'range-sum-bst': 'range-sum-of-bst',
  'letter-combinations': 'letter-combinations-of-a-phone-number',
  'minimum-arrows': 'minimum-number-of-arrows-to-burst-balloons',
  'product-except-self': 'product-of-array-except-self',
  'max-depth-binary-tree': 'maximum-depth-of-binary-tree',
};

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// 判断是否为「空壳」：null/空对象、全部空白、或仅 starter template（无实现）
function isEmptyShell(sol) {
  if (!sol || typeof sol !== 'object' || Object.keys(sol).length === 0) return true;
  const vals = Object.values(sol).map((v) => (typeof v === 'string' ? v.trim() : ''));
  if (vals.length === 0) return true;
  if (vals.every((v) => v.length === 0)) return true;
  const allPlaceholder = vals.every((v) => {
    const c = v.toLowerCase();
    return !/return|for\s*\(|while\s*\(|if\s*\(|console\.|print\(|system\.out|\.map\(|\.filter\(|def |function |select |from |group by|order by|join /i.test(c);
  });
  return allPlaceholder;
}

// 提取 markdown 中所有 ```围栏代码块
function extractAllBlocks(content) {
  const re = /```([^\n]*)\n([\s\S]*?)```/g;
  const out = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push({ hint: m[1].trim().toLowerCase(), code: m[2].trim() });
  }
  return out;
}

// 按代码内容推断语言（处理 LeetCode 中文围栏如 ```SQL 代码```）
function classify(code) {
  const c = code.toLowerCase();
  if (/\b(select|from|where|group by|order by|join|having|insert|update|delete)\b/.test(c) && !/\bclass\s+\w/.test(c) && !/^\s*def\s/.test(c)) return 'sql';
  if (/\bpublic\s+class\b/.test(c) || /\bclass\s+\w+\s*\{/.test(c)) return 'java';
  if (/^\s*def\s/.test(c)) return 'python';
  if (/function\s+\w+|const\s+\w+\s*=|=>\s*\{|console\.\w+/.test(c) && !/\bclass\s/.test(c)) return 'javascript';
  return null;
}

// 从文章正文提取题解：每语言取最长（最完整）的代码块
function pickSolutions(content) {
  const blocks = extractAllBlocks(content).filter((b) => b.code.length > 20);
  const byLang = {};
  for (const b of blocks) {
    let lang = null;
    if (['java', 'python', 'javascript', 'sql', 'mysql', 'postgresql', 'pgsql'].includes(b.hint)) {
      lang = b.hint === 'pgsql' ? 'postgresql' : b.hint;
    } else {
      lang = classify(b.code);
    }
    if (!lang) continue;
    // 每个语言保留最长的一块（通常是最完整的实现/正解）
    if (!byLang[lang] || b.code.length > byLang[lang].length) byLang[lang] = b.code;
  }
  return byLang;
}

async function fetchSolution(slug) {
  const lcSlug = SLUG_MAP[slug] || slug;
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: `https://leetcode.cn/problems/${lcSlug}/solution/`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { questionSlug: lcSlug, first: 1, skip: 0, orderBy: 'DEFAULT' },
      }),
    });
    const data = await res.json();
    const edges = data?.data?.questionSolutionArticles?.edges;
    if (!edges || edges.length === 0) return null;
    const content = edges[0].node.content;
    if (!content) return null;

    const out = pickSolutions(content);
    return Object.keys(out).length ? out : null;
  } catch (e) {
    console.error(`  ✗ 请求失败 [${slug}]: ${e.message}`);
    return null;
  }
}

async function main() {
  const all = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, solutions: true },
  });
  const targets = all.filter((p) => isEmptyShell(p.solutions));
  console.log(`空壳题总数: ${targets.length}，开始抓取...\n`);

  let success = 0, failed = 0;
  const failedSlugs = [];

  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    const result = await fetchSolution(p.slug);
    if (!result) {
      console.log(`[${i + 1}/${targets.length}] ✗ ${p.slug} - 未找到题解`);
      failed++; failedSlugs.push(p.slug);
      await sleep(500);
      continue;
    }
    await prisma.problem.update({ where: { id: p.id }, data: { solutions: result } });
    const langs = Object.keys(result).join('+');
    console.log(`[${i + 1}/${targets.length}] ✓ ${p.slug} (${langs})`);
    success++;
    await sleep(800);
  }

  console.log(`\n═════════════════════`);
  console.log(`完成! 成功: ${success}, 失败: ${failed}, 总计: ${targets.length}`);
  if (failedSlugs.length) {
    console.log(`\n未找到题解的题目 (${failedSlugs.length}):`);
    failedSlugs.forEach((s) => console.log(`  - ${s}`));
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
