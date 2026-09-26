import { tutorialResources } from "@/lib/tutorial-resources";

export type RelatedTutorial = { href: string; title: string; description?: string };
export type RelatedVisualizer = { href: string; title: string; description?: string };

export type ProblemRelations = {
  tutorials: RelatedTutorial[];
  visualizers: RelatedVisualizer[];
};

/**
 * 题目 slug → 相关教程/可视化 的反向索引。
 * 由 tutorialResources（教程维度）自动反转得到：
 * 凡在某教程的 problems 列表中出现过的题目，即关联该教程及其可视化。
 * 打通「做题卡壳 → 看讲解 → 看动画」闭环。
 */
function buildProblemIndex(): Record<string, ProblemRelations> {
  const index: Record<string, ProblemRelations> = {};

  for (const [tutSlug, res] of Object.entries(tutorialResources)) {
    for (const prob of res.problems) {
      const slug = prob.href.replace(/^\/problems\//, "");
      if (!slug) continue;
      const entry = (index[slug] ??= { tutorials: [], visualizers: [] });

      // 关联教程（去重）
      const tutHref = `/tutorials/${tutSlug}`;
      if (!entry.tutorials.some((t) => t.href === tutHref)) {
        entry.tutorials.push({
          href: tutHref,
          title: prob.title ? `${prob.title} · 讲解` : tutSlug,
          description: `回到「${tutSlug}」相关教程巩固原理`,
        });
      }

      // 关联该教程的可视化（去重）
      for (const viz of res.visualizers) {
        if (!entry.visualizers.some((v) => v.href === viz.href)) {
          entry.visualizers.push(viz);
        }
      }
    }
  }

  return index;
}

const problemIndex = buildProblemIndex();

/**
 *  curated 兜底关联：覆盖 tutorialResources 未收录、但确有对应教程/可视化的常见题目。
 * 键为题目 slug。
 */
const curatedRelations: Record<string, ProblemRelations> = {
  "two-sum": {
    tutorials: [{ href: "/tutorials/hash-table", title: "哈希表", description: "一次遍历哈希解法" }],
    visualizers: [{ href: "/visualizer/hash-table", title: "哈希表演示", description: "哈希函数与冲突处理" }],
  },
  "valid-parentheses": {
    tutorials: [{ href: "/tutorials/stack", title: "栈 Stack", description: "括号匹配的栈解法" }],
    visualizers: [{ href: "/visualizer/stack", title: "栈可视化", description: "入栈出栈动画" }],
  },
  "reverse-linked-list": {
    tutorials: [{ href: "/tutorials/linked-list", title: "链表", description: "链表指针反转" }],
    visualizers: [{ href: "/visualizer/linked-list", title: "链表可视化", description: "节点插入/删除动画" }],
  },
  "remove-linked-list-elements": {
    tutorials: [{ href: "/tutorials/linked-list", title: "链表", description: "链表删除操作" }],
    visualizers: [{ href: "/visualizer/linked-list", title: "链表可视化", description: "节点删除动画" }],
  },
  "climbing-stairs": {
    tutorials: [{ href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 入门状态转移" }],
    visualizers: [{ href: "/visualizer/dp", title: "动态规划可视化", description: "状态转移动画" }],
  },
  "coin-change": {
    tutorials: [{ href: "/tutorials/dynamic-programming", title: "动态规划", description: "完全背包思想" }],
    visualizers: [{ href: "/visualizer/dp", title: "动态规划可视化", description: "状态转移动画" }],
  },
  "maximum-subarray": {
    tutorials: [{ href: "/tutorials/dynamic-programming", title: "动态规划", description: "Kadane 算法" }],
    visualizers: [{ href: "/visualizer/dp", title: "动态规划可视化", description: "状态转移动画" }],
  },
  "longest-common-subsequence": {
    tutorials: [{ href: "/tutorials/lcs", title: "最长公共子序列", description: "二维 DP 经典" }],
    visualizers: [{ href: "/visualizer/lcs", title: "LCS 可视化", description: "DP 表填充动画" }],
  },
  "longest-substring-without-repeating": {
    tutorials: [{ href: "/tutorials/sliding-window", title: "双指针与滑动窗口", description: "扩窗/收缩技巧" }],
    visualizers: [{ href: "/visualizer/sliding-window", title: "滑动窗口可视化", description: "最长无重复子串动画" }],
  },
  "number-of-islands": {
    tutorials: [{ href: "/tutorials/grid-search", title: "网格搜索", description: "BFS/DFS 遍历网格" }],
    visualizers: [{ href: "/visualizer/graphs", title: "图可视化", description: "BFS/DFS 遍历动画" }],
  },
  "permutations": {
    tutorials: [{ href: "/tutorials/backtracking", title: "回溯算法", description: "全排列的回溯框架" }],
    visualizers: [{ href: "/visualizer/backtracking", title: "回溯可视化", description: "决策树剪枝动画" }],
  },
  "top-k-frequent": {
    tutorials: [{ href: "/tutorials/heap", title: "堆和优先队列", description: "TopK 的堆解法" }],
    visualizers: [{ href: "/visualizer/heap", title: "堆可视化", description: "堆插入/弹出动画" }],
  },
  "smallest-k-numbers": {
    tutorials: [{ href: "/tutorials/heap", title: "堆和优先队列", description: "TopK 的堆解法" }],
    visualizers: [{ href: "/visualizer/heap", title: "堆可视化", description: "堆插入/弹出动画" }],
  },
  "reverse-pairs": {
    tutorials: [{ href: "/tutorials/divide-conquer-applications", title: "分治应用", description: "归并统计翻转对" }],
    visualizers: [{ href: "/visualizer/sorting", title: "排序可视化", description: "归并排序动画" }],
  },
  "intersection-of-arrays": {
    tutorials: [{ href: "/tutorials/hash-table", title: "哈希表", description: "哈希集合求交集" }],
    visualizers: [{ href: "/visualizer/hash-table", title: "哈希表演示", description: "哈希函数与冲突处理" }],
  },
};

/** 获取题目对应的教程/可视化关联（无关联返回 null） */
export function getProblemRelations(slug: string): ProblemRelations | null {
  const derived = problemIndex[slug];
  const curated = curatedRelations[slug];
  if (!derived && !curated) return null;

  // 合并去重（derived 优先，curated 补充）
  const tutorials: RelatedTutorial[] = [...(derived?.tutorials ?? [])];
  const visualizers: RelatedVisualizer[] = [...(derived?.visualizers ?? [])];
  for (const t of curated?.tutorials ?? []) {
    if (!tutorials.some((x) => x.href === t.href)) tutorials.push(t);
  }
  for (const v of curated?.visualizers ?? []) {
    if (!visualizers.some((x) => x.href === v.href)) visualizers.push(v);
  }

  if (tutorials.length === 0 && visualizers.length === 0) return null;
  return { tutorials, visualizers };
}
