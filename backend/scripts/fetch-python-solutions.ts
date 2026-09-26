/**
 * 第二轮：为缺少高质量 Python 题解的题目从 LeetCode 社区获取。
 * 运行: cd backend && npx ts-node scripts/fetch-python-solutions.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GRAPHQL_URL = 'https://leetcode.cn/graphql';
const QUERY = `
  query questionSolutionArticles($questionSlug: String!, $first: Int, $skip: Int, $orderBy: SolutionArticleOrderBy) {
    questionSolutionArticles(questionSlug: $questionSlug, first: $first, skip: $skip, orderBy: $orderBy) {
      edges {
        node {
          title
          content
        }
      }
    }
  }
`;

const SLUG_MAP: Record<string, string> = {
  'smallest-k-numbers': 'zui-xiao-de-kge-shu-lcof',
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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 检测 Python 代码是否是低质量的自动翻译 */
function isBadPython(code: string): boolean {
  const indicators = [
    /\breturn\b.*\bfunction\b/,       // JS function 关键字
    /\[\.\.\./,                        // JS spread operator
    /=>\s*/,                           // JS arrow function
    /\.sort\(\(/,                      // JS sort with callback
    /\.forEach\(/,                     // JS forEach
    /\.map\(\(/,                       // JS map with callback  
    /\bvar\b/,                         // JS var
    /\bconst\b/,                       // JS const
    /\blet\b/,                         // JS let
    /Math\./,                          // JS Math object
    /\.push\(/,                        // 这个在 Python 中不合法（应该用 append）
    /for\s*\([^)]*;/,                  // C-style for loop
    /\bnull\b/,                        // JS null (Python uses None)
    /;\s*$/,                           // 分号结尾（多行都有）
  ];
  let score = 0;
  for (const ind of indicators) {
    if (ind.test(code)) score++;
  }
  return score >= 2; // 2个以上指标命中则认为是低质量
}

function extractPython(content: string): string | null {
  const regex = /```[Pp]ython[^\n]*\n([\s\S]*?)```/g;
  const matches: string[] = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    const code = m[1].trim();
    if (code.length > 30) matches.push(code);
  }
  if (matches.length === 0) return null;
  return matches[0];
}

function extractJava(content: string): string | null {
  const regex = /```[Jj]ava[^\n]*\n([\s\S]*?)```/g;
  const matches: string[] = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    const code = m[1].trim();
    if (code.length > 30) matches.push(code);
  }
  if (matches.length === 0) return null;
  return matches[0];
}

async function fetchCommunitySolution(slug: string): Promise<{ java: string | null; python: string | null }> {
  const lcSlug = SLUG_MAP[slug] || slug;
  let java: string | null = null;
  let python: string | null = null;

  try {
    // 获取前 10 篇社区题解
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.cn/problems/${lcSlug}/solution/`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { questionSlug: lcSlug, first: 10, skip: 0, orderBy: 'DEFAULT' },
      }),
    });

    const data = await res.json() as any;
    const edges = data?.data?.questionSolutionArticles?.edges || [];

    for (const edge of edges) {
      const content = edge.node.content as string;
      if (!content) continue;

      if (!python) {
        const py = extractPython(content);
        if (py && !isBadPython(py)) python = py;
      }
      if (!java) {
        const jv = extractJava(content);
        if (jv) java = jv;
      }
      if (python && java) break;
    }
  } catch (e: any) {
    console.error(`  ✗ 请求失败 [${slug}]: ${e.message}`);
  }

  return { java, python };
}

async function main() {
  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, solutions: true },
  });

  // 筛选需要更新的题目：Python 缺失或质量差
  const needUpdate = problems.filter(p => {
    const s = (p.solutions as Record<string, string>) || {};
    const py = s.python;
    return !py || isBadPython(py);
  });

  console.log(`需要补充 Python 题解: ${needUpdate.length} 道\n`);

  let success = 0;
  let failed = 0;
  const failedSlugs: string[] = [];

  for (let i = 0; i < needUpdate.length; i++) {
    const p = needUpdate[i];
    const progress = `[${i + 1}/${needUpdate.length}]`;

    const result = await fetchCommunitySolution(p.slug);

    if (!result.python && !result.java) {
      console.log(`${progress} ✗ ${p.slug} - 未找到`);
      failed++;
      failedSlugs.push(p.slug);
      await sleep(500);
      continue;
    }

    const existing = (p.solutions as Record<string, string>) || {};
    const updated: Record<string, string> = { ...existing };
    if (result.python) updated.python = result.python;
    if (result.java && isBadPython(existing.java || '')) updated.java = result.java;

    await prisma.problem.update({
      where: { id: p.id },
      data: { solutions: updated as any },
    });

    const got = [result.python ? 'Python' : '', result.java ? 'Java' : ''].filter(Boolean).join('+');
    console.log(`${progress} ✓ ${p.slug} (${got})`);
    success++;
    await sleep(800);
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`完成! 成功: ${success}, 失败: ${failed}`);
  if (failedSlugs.length > 0) {
    console.log(`\n未找到: ${failedSlugs.join(', ')}`);
  }
  await prisma.$disconnect();
}

main().catch(console.error);
