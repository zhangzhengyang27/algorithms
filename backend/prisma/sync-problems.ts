import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// 分类：中文名 -> { slug, name }。searching / sorting 复用 seed.ts 已建的，其余新建。
const CATEGORIES: Record<string, { slug: string; name: string }> = {
  搜索算法: { slug: 'searching', name: '搜索算法' },
  排序算法: { slug: 'sorting', name: '排序算法' },
  栈: { slug: 'stack', name: '栈' },
  动态规划: { slug: 'dynamic-programming', name: '动态规划' },
  链表: { slug: 'linked-list', name: '链表' },
  数组: { slug: 'array', name: '数组' },
  哈希表: { slug: 'hash-table', name: '哈希表' },
  堆: { slug: 'heap', name: '堆' },
  滑动窗口: { slug: 'sliding-window', name: '滑动窗口' },
  图搜索: { slug: 'graph-search', name: '图搜索' },
  回溯算法: { slug: 'backtracking', name: '回溯算法' },
};

const DIFFICULTY_TEXT: Record<Difficulty, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
};

// 题目元数据，与前端 app/problems/page.tsx 的 FALLBACK 对齐（共 17 题）
const PROBLEMS: { slug: string; title: string; difficulty: Difficulty; category: string }[] = [
  { slug: 'two-sum', title: '两数之和', difficulty: Difficulty.EASY, category: '搜索算法' },
  { slug: 'valid-parentheses', title: '有效的括号', difficulty: Difficulty.EASY, category: '栈' },
  { slug: 'climbing-stairs', title: '爬楼梯', difficulty: Difficulty.EASY, category: '动态规划' },
  { slug: 'binary-search', title: '搜索旋转排序数组', difficulty: Difficulty.MEDIUM, category: '搜索算法' },
  { slug: 'reverse-linked-list', title: '反转链表', difficulty: Difficulty.EASY, category: '链表' },
  { slug: 'merge-sorted-array', title: '合并两个有序数组', difficulty: Difficulty.EASY, category: '数组' },
  { slug: 'remove-linked-list-elements', title: '移除链表元素', difficulty: Difficulty.EASY, category: '链表' },
  { slug: 'intersection-of-arrays', title: '两个数组的交集', difficulty: Difficulty.EASY, category: '哈希表' },
  { slug: 'smallest-k-numbers', title: '最小的K个数', difficulty: Difficulty.MEDIUM, category: '堆' },
  { slug: 'top-k-frequent', title: '前K个高频元素', difficulty: Difficulty.MEDIUM, category: '堆' },
  { slug: 'reverse-pairs', title: '数组中的逆序对', difficulty: Difficulty.HARD, category: '排序算法' },
  { slug: 'longest-substring-without-repeating', title: '无重复字符的最长子串', difficulty: Difficulty.MEDIUM, category: '滑动窗口' },
  { slug: 'maximum-subarray', title: '最大子数组和', difficulty: Difficulty.MEDIUM, category: '动态规划' },
  { slug: 'permutations', title: '全排列', difficulty: Difficulty.MEDIUM, category: '回溯算法' },
  { slug: 'coin-change', title: '零钱兑换', difficulty: Difficulty.MEDIUM, category: '动态规划' },
  { slug: 'number-of-islands', title: '岛屿数量', difficulty: Difficulty.MEDIUM, category: '图搜索' },
  { slug: 'longest-common-subsequence', title: '最长公共子序列', difficulty: Difficulty.MEDIUM, category: '动态规划' },
];

async function main() {
  console.log('Syncing problem categories & problems...');

  // 1) upsert 分类
  const catIdByName: Record<string, string> = {};
  let order = 10;
  for (const [name, { slug, name: cn }] of Object.entries(CATEGORIES)) {
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: cn,
        description: `${cn}相关算法题目`,
        icon: 'code',
        order: order++,
      },
    });
    catIdByName[name] = cat.id;
  }
  console.log(`Upserted ${Object.keys(CATEGORIES).length} categories.`);

  // 2) upsert 题目（two-sum 已存在则保留 seed 的完整内容，其余新建）
  for (const p of PROBLEMS) {
    const categoryId = catIdByName[p.category];
    if (!categoryId) {
      console.warn(`跳过 ${p.slug}：找不到分类 "${p.category}"`);
      continue;
    }
    await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        categoryId,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        descriptionMd: `# ${p.title}\n\n难度：${DIFFICULTY_TEXT[p.difficulty]}。\n\n点击进入题解页查看完整题目描述、示例与多种语言解法。`,
        examples: [],
        solutions: [],
      },
    });
  }
  console.log(`Upserted ${PROBLEMS.length} problems.`);

  const total = await prisma.problem.count();
  console.log(`Problem 表现在共 ${total} 条记录。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
