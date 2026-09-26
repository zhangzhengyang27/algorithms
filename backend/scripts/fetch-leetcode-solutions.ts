/**
 * 从 LeetCode 力扣获取官方题解，提取 Java/Python 代码更新到数据库。
 * 运行: cd backend && npx ts-node scripts/fetch-leetcode-solutions.ts
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

// slug 映射：数据库 slug → LeetCode slug（不一致的需要手动映射）
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

/**
 * 从 Markdown 内容中提取指定语言的代码块
 */
function extractCode(content: string, lang: string): string | null {
  // 匹配 ```Java [...]\n...``` 或 ```java\n...```
  const regex = new RegExp('```' + lang + '[^\\n]*\\n([\\s\\S]*?)```', 'gi');
  const matches: string[] = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    const code = m[1].trim();
    if (code.length > 20) matches.push(code); // 过滤太短的片段
  }
  if (matches.length === 0) return null;
  // 如果有多个代码块（多种方法），合并前两个
  if (matches.length >= 2) {
    return matches[0] + '\n\n' + matches[1];
  }
  return matches[0];
}

async function fetchSolution(slug: string): Promise<{ java: string | null; python: string | null } | null> {
  const lcSlug = SLUG_MAP[slug] || slug;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.cn/problems/${lcSlug}/solution/`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { questionSlug: lcSlug, first: 1, skip: 0, orderBy: 'DEFAULT' },
      }),
    });

    const data = await res.json() as any;
    const edges = data?.data?.questionSolutionArticles?.edges;
    if (!edges || edges.length === 0) return null;

    const content = edges[0].node.content as string;
    if (!content) return null;

    const java = extractCode(content, 'Java');
    const python = extractCode(content, 'Python');

    return { java, python };
  } catch (e: any) {
    console.error(`  ✗ 请求失败 [${slug}]: ${e.message}`);
    return null;
  }
}

// 命令行参数: --all 处理所有, 否则只处理缺少 Java/Python 的
const ONLY_MISSING = !process.argv.includes('--all');

async function main() {
  let problems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, solutions: true },
  });

  if (ONLY_MISSING) {
    problems = problems.filter(p => {
      const s = p.solutions as Record<string, string> | null;
      return !s || !s.java || !s.python;
    });
  }

  console.log(`待处理: ${problems.length} 道题目，开始从 LeetCode 获取题解...\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;
  const failedSlugs: string[] = [];

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    const progress = `[${i + 1}/${problems.length}]`;

    const result = await fetchSolution(p.slug);

    if (!result || (!result.java && !result.python)) {
      console.log(`${progress} ✗ ${p.slug} - 未找到题解`);
      failed++;
      failedSlugs.push(p.slug);
      await sleep(500);
      continue;
    }

    // 合并到现有 solutions
    const existing = (p.solutions as Record<string, string>) || {};
    const updated: Record<string, string> = { ...existing };
    if (result.java) updated.java = result.java;
    if (result.python) updated.python = result.python;

    await prisma.problem.update({
      where: { id: p.id },
      data: { solutions: updated as any },
    });

    const langs = [result.java ? 'Java' : '', result.python ? 'Python' : ''].filter(Boolean).join('+');
    console.log(`${progress} ✓ ${p.slug} (${langs})`);
    success++;

    // 限流：每个请求间隔 800ms
    await sleep(800);
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`完成! 成功: ${success}, 失败: ${failed}, 总计: ${problems.length}`);
  if (failedSlugs.length > 0) {
    console.log(`\n未找到题解的题目 (${failedSlugs.length}):`);
    failedSlugs.forEach(s => console.log(`  - ${s}`));
  }

  await prisma.$disconnect();
}

main().catch(console.error);
