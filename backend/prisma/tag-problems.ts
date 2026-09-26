/**
 * 启发式题目标签生成器。
 * 扫描全量题目的 slug + title，按关键词匹配赋予细粒度标签（双指针/滑动窗口/前缀和 等），
 * 并补充「分类名」作为基础标签，保证每题至少有一个可筛选标签。
 *
 * 运行：npx ts-node prisma/tag-problems.ts
 * 幂等：重复运行会覆盖 tags（重新计算），不会重复累加。
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 关键词 → 标签（匹配 slug 与 title，英文不区分大小写，中文直接包含匹配）
const RULES: { tags: string[]; kws: string[] }[] = [
  { tags: ['双指针'], kws: ['two-pointer', 'two-pointers', '双指针', 'pointer'] },
  { tags: ['滑动窗口'], kws: ['sliding-window', '滑动窗口', 'substring', 'subarray', '子串', '连续子'] },
  { tags: ['前缀和'], kws: ['prefix-sum', 'prefix', '前缀和', 'range-sum', 'subarray-sum'] },
  { tags: ['二分查找'], kws: ['binary-search', '二分', 'search-insert', 'search-a-2d', 'find-first-and-last', 'median-of-two'] },
  { tags: ['哈希表'], kws: ['hash', 'two-sum', 'contains-duplicate', 'anagram', '异位', 'intersection', '两数之和'] },
  { tags: ['链表'], kws: ['linked-list', '链表', 'list-node', 'reverse-linked', 'cycle', '环'] },
  { tags: ['栈'], kws: ['stack', 'parenthes', '括号', 'valid-parentheses', 'monotonic', '单调栈'] },
  { tags: ['队列'], kws: ['queue', '队列'] },
  { tags: ['堆'], kws: ['heap', 'priority-queue', 'top-k', 'kth-largest', 'kth-smallest', '第k', '前k'] },
  { tags: ['二叉树'], kws: ['binary-tree', 'tree', '树', 'bst', 'inorder', 'preorder', 'postorder', 'level-order', '遍历'] },
  { tags: ['递归'], kws: ['recursion', '递归', 'fibonacci', '斐波那契'] },
  { tags: ['回溯'], kws: ['backtracking', 'permutation', 'combination', 'subset', 'n-queens', 'sudoku', '排列', '组合', '子集', '全排列'] },
  { tags: ['动态规划'], kws: ['dp', 'dynamic', 'knapsack', 'climbing-stairs', 'coin-change', 'house-robber', 'longest-', 'subsequence', 'palindrome', '背包', '爬楼梯', '打家劫舍', '最长', '编辑距离', 'edit-distance'] },
  { tags: ['贪心'], kws: ['greedy', 'interval', 'jump-game', '贪心', '区间'] },
  { tags: ['图'], kws: ['graph', 'island', 'course-schedule', 'clone-graph', '岛屿', '图', 'rotting-oranges'] },
  { tags: ['BFS'], kws: ['bfs', 'level-order', 'breadth', '层序'] },
  { tags: ['DFS'], kws: ['dfs', 'depth-first', 'flood', '岛屿'] },
  { tags: ['并查集'], kws: ['union-find', 'disjoint', '并查集'] },
  { tags: ['字典树'], kws: ['trie', '字典树', 'prefix-tree'] },
  { tags: ['字符串'], kws: ['string', 'palindrome', 'kmp', 'anagram', '字符串', '回文', 'reverse-string', 'longest-common-prefix'] },
  { tags: ['数组'], kws: ['array', 'matrix', '数组', '矩阵', 'grid', 'spiral', 'rotate'] },
  { tags: ['排序'], kws: ['sort', '排序', 'merge-sorted', 'quick', 'largest-number'] },
  { tags: ['位运算'], kws: ['bit', 'xor', 'binary', '位运算', '异或', 'single-number', 'hamming'] },
  { tags: ['数学'], kws: ['math', 'number', 'prime', 'gcd', '数学', '质数', '阶乘', 'factorial', 'pow', 'sqrt'] },
  { tags: ['设计'], kws: ['lru', 'lfu', 'cache', 'design', '设计', 'min-stack', 'iterator', '序列化'] },
  { tags: ['分治'], kws: ['divide', 'merge-sort', '分治', 'majority-element'] },
  { tags: ['栈'], kws: ['calculator', '表达式', 'evaluate'] },
];

function tagsFor(slug: string, title: string, categoryName: string): string[] {
  const hay = `${slug} ${title}`.toLowerCase();
  const found = new Set<string>();
  for (const rule of RULES) {
    if (rule.kws.some((kw) => hay.includes(kw.toLowerCase()) || title.includes(kw))) {
      rule.tags.forEach((t) => found.add(t));
    }
  }
  // 基础标签：分类名（保证每题至少一个标签）
  if (categoryName) found.add(categoryName);
  return Array.from(found);
}

async function main() {
  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, category: { select: { name: true } } },
  });
  console.log(`待处理题目：${problems.length}`);

  let updated = 0;
  const BATCH = 200;
  for (let i = 0; i < problems.length; i += BATCH) {
    const slice = problems.slice(i, i + BATCH);
    await prisma.$transaction(
      slice.map((p) =>
        prisma.problem.update({
          where: { id: p.id },
          data: { tags: tagsFor(p.slug, p.title, p.category?.name ?? '') },
        }),
      ),
    );
    updated += slice.length;
    process.stdout.write(`\r已处理 ${updated}/${problems.length}`);
  }
  console.log('\n完成。');

  // 统计标签分布
  const tagged = await prisma.problem.findMany({ select: { tags: true } });
  const freq = new Map<string, number>();
  for (const row of tagged) for (const t of row.tags) freq.set(t, (freq.get(t) ?? 0) + 1);
  const sorted = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
  console.log('标签分布（Top 20）：');
  for (const [tag, count] of sorted.slice(0, 20)) console.log(`  ${tag}: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
