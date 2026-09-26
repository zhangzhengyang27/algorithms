/**
 * 为剩余缺少 hints 的题目，根据 descriptionMd 和 tags 自动生成解题思路。
 * 不依赖外部 API，纯本地生成。
 *
 * 运行: cd backend && npx ts-node scripts/generate-hints-local.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 根据题目标签生成通用解题思路
 */
function hintsFromTags(tags: string[], title: string, difficulty: string): string[] {
  const hints: string[] = [];

  if (tags.includes('数组')) {
    hints.push('考虑是否需要排序或预处理数组，排序后很多问题的解法会简化');
  }
  if (tags.includes('哈希表')) {
    hints.push('使用哈希表（Map/Set）存储已遍历的元素，实现 O(1) 查找');
  }
  if (tags.includes('双指针') || tags.includes('滑动窗口')) {
    hints.push('使用双指针/滑动窗口技巧，避免嵌套循环，将时间复杂度降为 O(n)');
  }
  if (tags.includes('二叉树')) {
    hints.push('二叉树问题通常用递归（DFS）或层序遍历（BFS）解决，明确递归函数的定义和返回值');
  }
  if (tags.includes('动态规划')) {
    hints.push('定义 dp 数组的含义，找出状态转移方程，确定初始条件和遍历顺序');
  }
  if (tags.includes('回溯')) {
    hints.push('回溯法：选择 → 递归 → 撤销选择，注意剪枝条件避免重复搜索');
  }
  if (tags.includes('贪心')) {
    hints.push('贪心策略：每步选局部最优，需证明局部最优能推出全局最优');
  }
  if (tags.includes('栈')) {
    hints.push('利用栈的后进先出特性，适合处理匹配、单调性、嵌套结构等问题');
  }
  if (tags.includes('链表')) {
    hints.push('链表题善用 dummy 头节点简化边界处理，快慢指针可检测环或找中点');
  }
  if (tags.includes('位运算')) {
    hints.push('利用异或（a^a=0, a^0=a）、与运算（判断奇偶）、移位等位操作优化');
  }
  if (tags.includes('数学')) {
    hints.push('寻找数学规律或公式，尝试将问题转化为已知数学模型');
  }
  if (tags.includes('字符串')) {
    hints.push('字符串题注意字符编码处理，考虑是否需要反转、拼接或逐字符遍历');
  }
  if (tags.includes('图搜索') || tags.includes('图')) {
    hints.push('图的遍历用 BFS（最短路）或 DFS（连通性），注意 visited 数组防止重复访问');
  }
  if (tags.includes('排序')) {
    hints.push('考虑排序后是否能使问题简化，注意选择合适的时间复杂度排序算法');
  }
  if (tags.includes('设计')) {
    hints.push('设计题先明确接口需求和操作频率，选择合适的数据结构组合实现');
  }
  if (tags.includes('数据结构')) {
    hints.push('分析各操作的时间要求，选择或组合合适的数据结构（堆、队列、哈希表等）');
  }
  if (tags.includes('递归') || tags.includes('algorithms')) {
    hints.push('明确递归的终止条件和递推关系，注意避免重复计算（记忆化）');
  }

  // 根据难度补充
  if (difficulty === 'EASY' && hints.length < 2) {
    hints.push('本题较为基础，尝试用最直观的方法模拟题目描述的过程');
  }
  if (difficulty === 'HARD' && hints.length > 0) {
    hints.push('本题难度较高，考虑将问题分解为子问题，或结合多种数据结构/算法技巧');
  }

  // 确保至少有 2 条
  if (hints.length === 0) {
    hints.push('仔细阅读题目约束条件，从示例中归纳规律');
    hints.push('先尝试暴力解法理清逻辑，再考虑如何优化时间/空间复杂度');
  }
  if (hints.length === 1) {
    hints.push('画出示例的执行过程，观察中间状态的变化规律');
  }

  return hints.slice(0, 4);
}

/**
 * 从 descriptionMd 中提取关键信息作为补充 hint
 */
function hintFromDescription(desc: string): string | null {
  if (!desc) return null;
  // 提取"提示"/"注意"部分
  const hintMatch = desc.match(/(?:提示|注意|说明)[：:]\s*(.{10,100})/);
  if (hintMatch) return hintMatch[1].trim();
  // 提取约束条件
  const constraintMatch = desc.match(/(\d+\s*<=?\s*[\w.]+\s*<=?\s*[\d.]+)/);
  if (constraintMatch) {
    return `注意数据范围：${constraintMatch[1]}，据此选择合适的算法复杂度`;
  }
  return null;
}

async function main() {
  console.log('=== 本地生成解题思路（剩余缺 hints 的题目）===\n');

  const problems = await prisma.problem.findMany({
    select: { id: true, slug: true, title: true, tags: true, descriptionMd: true, difficulty: true, hints: true },
  });

  const needHints = problems.filter(p => {
    const h = p.hints as string[] | null;
    return !h || h.length === 0;
  });

  console.log(`需处理: ${needHints.length} 题\n`);

  let updated = 0;
  for (const p of needHints) {
    const tags = p.tags || [];
    let hints = hintsFromTags(tags, p.title, p.difficulty);

    // 尝试从描述中提取补充信息
    const descHint = hintFromDescription(p.descriptionMd || '');
    if (descHint && !hints.includes(descHint)) {
      hints = [descHint, ...hints].slice(0, 4);
    }

    await prisma.problem.update({
      where: { id: p.id },
      data: { hints },
    });
    updated++;
    console.log(`  ✓ ${p.title} [${tags.slice(0, 3).join(',')}] → ${hints.length} 条`);
  }

  console.log(`\n完成! 更新 ${updated} 题`);
  await prisma.$disconnect();
}

main().catch(console.error);
