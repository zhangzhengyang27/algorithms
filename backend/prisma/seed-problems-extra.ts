import { PrismaClient, Difficulty } from '@prisma/client';
import { EXTRA_PROBLEMS, HELPERS, type ExtraProblem } from './problems-extra.data';

const prisma = new PrismaClient();

// 分类：中文名 -> { slug }。现有 11 类保持原 slug，并新增 8 类。
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
  字符串: { slug: 'string', name: '字符串' },
  二叉树: { slug: 'binary-tree', name: '二叉树' },
  数学: { slug: 'math', name: '数学' },
  位运算: { slug: 'bit-manipulation', name: '位运算' },
  贪心: { slug: 'greedy', name: '贪心' },
  双指针: { slug: 'two-pointers', name: '双指针' },
  分治: { slug: 'divide-and-conquer', name: '分治' },
  设计: { slug: 'design', name: '设计' },
};

function buildCode(p: ExtraProblem): string {
  return (p.helpers ? HELPERS : '') + p.solution;
}
function buildDefaultCode(p: ExtraProblem): string {
  return (p.helpers ? HELPERS : '') + p.stub;
}

// 用参考解实跑每个用例，自动算出 expected（JSON 字符串），保证用例对参考解一定通过。
function buildTestCases(p: ExtraProblem): { input: string; expected: string }[] {
  const code = buildCode(p);
  let fn: (...a: any[]) => any;
  try {
    fn = new Function(`${code}\n return solve;`)() as any;
  } catch (e) {
    throw new Error(`编译参考解失败 (${p.slug}): ${(e as Error).message}`);
  }
  const testCases: { input: string; expected: string }[] = [];
  for (const args of p.cases) {
    let result: unknown;
    try {
      result = fn(...(args as any[]));
    } catch (e) {
      throw new Error(`运行参考解失败 (${p.slug}): ${(e as Error).message}`);
    }
    const input = `solve(${args.map((a) => JSON.stringify(a)).join(', ')})`;
    testCases.push({ input, expected: JSON.stringify(result) });
  }
  return testCases;
}

async function main() {
  console.log(`准备导入 ${EXTRA_PROBLEMS.length} 道题目...`);

  // 1) upsert 分类
  const catIdByName: Record<string, string> = {};
  let order = 100;
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
  console.log(`分类就绪（${Object.keys(CATEGORIES).length} 类）。`);

  // 2) upsert 题目
  let ok = 0;
  let skipped = 0;
  for (const p of EXTRA_PROBLEMS) {
    const categoryId = catIdByName[p.category];
    if (!categoryId) {
      console.warn(`跳过 ${p.slug}：找不到分类 "${p.category}"`);
      skipped++;
      continue;
    }
    let testCases: { input: string; expected: string }[];
    try {
      testCases = buildTestCases(p);
    } catch (e) {
      console.error(`✗ ${p.slug}：${(e as Error).message}`);
      skipped++;
      continue;
    }
    const data = {
      categoryId,
      title: p.title,
      difficulty: p.difficulty as Difficulty,
      descriptionMd: p.description,
      examples: [] as any,
      solutions: { javascript: p.solution },
      hints: p.hints,
      testCases,
      defaultCode: buildDefaultCode(p),
    };
    await prisma.problem.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
    ok++;
    console.log(`  ✓ ${p.slug.padEnd(34)} 难度=${(p.difficulty as string).padEnd(7)} 用例=${testCases.length}`);
  }

  const total = await prisma.problem.count();
  console.log(`\n完成：成功 ${ok} 题，跳过 ${skipped} 题。Problem 表现共 ${total} 条记录。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
