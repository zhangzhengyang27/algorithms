/**
 * 从 LeetCode 力扣官方题解中提取中文解题思路，补充到 hints 字段。
 * 仅处理当前 hints 为空的题目。
 *
 * 运行: cd backend && npx ts-node scripts/fetch-hints.ts
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

// slug 映射（与 import-doocs-solutions.ts 保持一致）
const SLUG_MAP: Record<string, string> = {
  'smallest-k-numbers': 'zui-xiao-de-kge-shu-lcof',
  'intersection-of-arrays': 'two-sum',
  'top-k-frequent': 'top-k-frequent-elements',
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
  'three-sum': '3sum',
  'copy-list-random': 'copy-list-with-random-pointer',
  'validate-bst': 'validate-binary-search-tree',
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
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 从题解 Markdown 中提取纯文本思路（去掉代码块、图片、HTML标签）
 * 返回最多 5 条要点
 */
function extractHints(content: string): string[] | null {
  if (!content) return null;

  // 去掉代码块
  let text = content.replace(/```[\s\S]*?```/g, '');
  // 去掉图片
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');
  // 去掉 HTML 标签
  text = text.replace(/<[^>]+>/g, '');
  // 去掉 Markdown 链接但保留文字
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  // 去掉标题标记
  text = text.replace(/^#{1,6}\s*/gm, '');
  // 去掉加粗/斜体标记
  text = text.replace(/[*_]{1,3}/g, '');
  // 去掉多余空行
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  if (text.length < 30) return null;

  // 按段落拆分，取有意义的段落作为要点
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.replace(/\n/g, ' ').trim())
    .filter(p => p.length >= 15 && p.length <= 300)
    .slice(0, 5);

  return paragraphs.length > 0 ? paragraphs : null;
}

async function fetchHints(slug: string): Promise<string[] | null> {
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
    return extractHints(content);
  } catch (e: any) {
    console.error(`  ✗ 请求失败 [${slug}]: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('=== 从 LeetCode 官方题解补充解题思路 ===\n');

  // 找出 hints 为空的题目
  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, hints: true },
  });

  const needHints = problems.filter(p => {
    const h = p.hints as string[] | null;
    return !h || h.length === 0;
  });

  console.log(`共 ${problems.length} 题，其中 ${needHints.length} 题缺少解题思路\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < needHints.length; i++) {
    const p = needHints[i];
    const progress = `[${i + 1}/${needHints.length}]`;

    const hints = await fetchHints(p.slug);

    if (!hints) {
      console.log(`${progress} ✗ ${p.slug} - 未获取到思路`);
      failed++;
      await sleep(500);
      continue;
    }

    await prisma.problem.update({
      where: { id: p.id },
      data: { hints },
    });

    console.log(`${progress} ✓ ${p.title} (${hints.length} 条)`);
    success++;

    // 限流
    await sleep(800);
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`完成! 成功: ${success}, 失败: ${failed}, 总计: ${needHints.length}`);

  await prisma.$disconnect();
}

main().catch(console.error);
