import type { Related } from "@/components/tutorial/related-resources";

export type ResourceMap = {
  tutorials: Related[];
  visualizers: { href: string; title: string; description?: string }[];
  problems: { href: string; title: string; difficulty?: "Easy" | "Medium" | "Hard" }[];
};

export const tutorialResources: Record<string, ResourceMap> = {
  // ============= 基础数据结构 =============
  "binary-search": {
    tutorials: [
      { href: "/tutorials/recursion", title: "递归", description: "二分查找的递归实现基础" },
      { href: "/tutorials/time-complexity", title: "时间与空间复杂度", description: "理解 O(log n) 的数学意义" },
    ],
    visualizers: [
      { href: "/visualizer/searching", title: "二分查找可视化", description: "动画演示区间缩小过程" },
    ],
    problems: [
      { href: "/problems/binary-search", title: "二分查找", difficulty: "Easy" },
      { href: "/problems/merge-sorted-array", title: "合并有序数组", difficulty: "Easy" },
    ],
  },
  stack: {
    tutorials: [
      { href: "/tutorials/queue", title: "队列", description: "FIFO 数据结构" },
      { href: "/tutorials/recursion", title: "递归", description: "调用栈就是栈的应用" },
      { href: "/tutorials/monotonic-stack", title: "单调栈", description: "进阶：下一个更大元素" },
    ],
    visualizers: [
      { href: "/visualizer/stack", title: "栈可视化", description: "LIFO 入栈出栈动画" },
    ],
    problems: [
      { href: "/problems/valid-parentheses", title: "有效括号", difficulty: "Easy" },
    ],
  },
  queue: {
    tutorials: [
      { href: "/tutorials/stack", title: "栈", description: "LIFO 数据结构" },
      { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "队列是 BFS 的核心" },
      { href: "/tutorials/heap", title: "堆和优先队列", description: "按优先级出队的队列" },
    ],
    visualizers: [
      { href: "/visualizer/queue", title: "队列可视化", description: "FIFO 入队出队动画" },
    ],
    problems: [],
  },
  "linked-list": {
    tutorials: [
      { href: "/tutorials/lru-cache", title: "LRU 缓存", description: "哈希 + 双向链表的经典设计" },
      { href: "/tutorials/recursion", title: "递归", description: "链表天然适合递归处理" },
      { href: "/tutorials/stack", title: "栈", description: "链表是栈的底层之一" },
    ],
    visualizers: [
      { href: "/visualizer/linked-list", title: "链表可视化", description: "节点插入/删除动画" },
    ],
    problems: [
      { href: "/problems/reverse-linked-list", title: "反转链表", difficulty: "Easy" },
    ],
  },
  "hash-table": {
    tutorials: [
      { href: "/tutorials/lru-cache", title: "LRU 缓存", description: "哈希表 + 双向链表" },
      { href: "/tutorials/linked-list", title: "链表", description: "链地址法的底层结构" },
    ],
    visualizers: [
      { href: "/visualizer/hash-table", title: "哈希表演示", description: "哈希函数与冲突处理" },
    ],
    problems: [
      { href: "/problems/two-sum", title: "两数之和", difficulty: "Easy" },
    ],
  },
  heap: {
    tutorials: [
      { href: "/tutorials/queue", title: "队列", description: "对比 FIFO 与优先队列" },
      { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "Dijkstra 用堆优化" },
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 状态压缩常用堆" },
    ],
    visualizers: [],
    problems: [],
  },
  "binary-tree": {
    tutorials: [
      { href: "/tutorials/binary-search-tree", title: "二分搜索树", description: "有序二叉树" },
      { href: "/tutorials/recursion", title: "递归", description: "树的遍历是经典递归" },
      { href: "/tutorials/heap", title: "堆", description: "特殊的完全二叉树" },
    ],
    visualizers: [
      { href: "/visualizer/trees", title: "树可视化", description: "BFS/DFS 遍历动画" },
    ],
    problems: [],
  },
  "binary-search-tree": {
    tutorials: [
      { href: "/tutorials/binary-tree", title: "二叉树", description: "BST 是特殊的二叉树" },
      { href: "/tutorials/red-black-tree", title: "红黑树", description: "自平衡的 BST" },
      { href: "/tutorials/recursion", title: "递归", description: "BST 的中序遍历是递归的" },
    ],
    visualizers: [
      { href: "/visualizer/trees", title: "树可视化", description: "插入/删除动画" },
    ],
    problems: [],
  },
  "red-black-tree": {
    tutorials: [
      { href: "/tutorials/binary-search-tree", title: "二分搜索树", description: "红黑树是自平衡的 BST" },
      { href: "/tutorials/heap", title: "堆", description: "另一种平衡树" },
    ],
    visualizers: [],
    problems: [],
  },
  trie: {
    tutorials: [
      { href: "/tutorials/binary-tree", title: "二叉树", description: "Trie 是特殊的 m 叉树" },
      { href: "/tutorials/hash-table", title: "哈希表", description: "字符串查找的替代方案" },
    ],
    visualizers: [],
    problems: [],
  },
  "union-find": {
    tutorials: [
      { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "连通性问题" },
      { href: "/tutorials/binary-tree", title: "二叉树", description: "树形结构的并查集变体" },
    ],
    visualizers: [],
    problems: [],
  },
  "segment-tree": {
    tutorials: [
      { href: "/tutorials/heap", title: "堆", description: "另一种区间查询结构" },
      { href: "/tutorials/recursion", title: "递归", description: "线段树是递归的" },
    ],
    visualizers: [],
    problems: [],
  },

  // ============= 排序 / 算法 =============
  "quick-sort": {
    tutorials: [
      { href: "/tutorials/merge-sort", title: "归并排序", description: "对比分治策略" },
      { href: "/tutorials/recursion", title: "递归", description: "快排是递归的" },
    ],
    visualizers: [
      { href: "/visualizer/sorting", title: "排序可视化", description: "多种排序算法对比" },
    ],
    problems: [],
  },
  "merge-sort": {
    tutorials: [
      { href: "/tutorials/quick-sort", title: "快速排序", description: "对比分治策略" },
      { href: "/tutorials/recursion", title: "递归", description: "归并排序是递归的" },
    ],
    visualizers: [
      { href: "/visualizer/sorting", title: "排序可视化", description: "归并过程动画" },
    ],
    problems: [
      { href: "/problems/merge-sorted-array", title: "合并有序数组", difficulty: "Easy" },
    ],
  },

  // ============= 算法思想 =============
  recursion: {
    tutorials: [
      { href: "/tutorials/stack", title: "栈", description: "递归底层就是调用栈" },
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "记忆化递归" },
      { href: "/tutorials/binary-tree", title: "二叉树", description: "经典递归应用" },
    ],
    visualizers: [
      { href: "/visualizer/stack", title: "栈可视化", description: "看递归调用栈帧" },
    ],
    problems: [],
  },
  "dynamic-programming": {
    tutorials: [
      { href: "/tutorials/greedy", title: "贪心算法", description: "DP 与贪心的辨析" },
      { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "树形 DP" },
      { href: "/tutorials/recursion", title: "递归", description: "DP 起点是递归记忆化" },
    ],
    visualizers: [],
    problems: [
      { href: "/problems/climbing-stairs", title: "爬楼梯", difficulty: "Easy" },
    ],
  },
  greedy: {
    tutorials: [
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 与贪心的辨析" },
      { href: "/tutorials/sliding-window", title: "双指针与滑动窗口", description: "贪心的常用工具" },
    ],
    visualizers: [],
    problems: [],
  },
  "sliding-window": {
    tutorials: [
      { href: "/tutorials/recursion", title: "递归", description: "另一种数组处理思路" },
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "定长滑动窗口" },
      { href: "/tutorials/heap", title: "堆", description: "滑动窗口最值" },
    ],
    visualizers: [
      { href: "/visualizer/sliding-window", title: "滑动窗口可视化", description: "最长无重复子串的扩窗/收缩动画" },
    ],
    problems: [],
  },
  "graph-algorithms": {
    tutorials: [
      { href: "/tutorials/queue", title: "队列", description: "BFS 的底层结构" },
      { href: "/tutorials/heap", title: "堆", description: "Dijkstra 优化" },
      { href: "/tutorials/union-find", title: "并查集", description: "连通性问题" },
      { href: "/tutorials/recursion", title: "递归", description: "DFS 的实现" },
    ],
    visualizers: [
      { href: "/visualizer/graphs", title: "图可视化", description: "BFS/DFS 遍历" },
    ],
    problems: [],
  },
  "monotonic-stack": {
    tutorials: [
      { href: "/tutorials/stack", title: "栈", description: "单调栈的底层" },
      { href: "/tutorials/heap", title: "堆", description: "另一种顺序结构" },
    ],
    visualizers: [
      { href: "/visualizer/stack", title: "栈可视化", description: "观察单调栈行为" },
      { href: "/visualizer/monotonic-stack", title: "单调栈可视化", description: "下一个更大元素动画" },
    ],
    problems: [],
  },
  "time-complexity": {
    tutorials: [
      { href: "/tutorials/recursion", title: "递归", description: "主定理与递归" },
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 复杂度分析" },
    ],
    visualizers: [],
    problems: [],
  },
  "lru-cache": {
    tutorials: [
      { href: "/tutorials/linked-list", title: "链表", description: "双向链表" },
      { href: "/tutorials/hash-table", title: "哈希表", description: "O(1) 查找" },
    ],
    visualizers: [],
    problems: [],
  },
  "interview-system": {
    tutorials: [
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "面试最高频" },
      { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "图论问题" },
      { href: "/tutorials/sliding-window", title: "双指针与滑动窗口", description: "数组子串利器" },
      { href: "/tutorials/greedy", title: "贪心算法", description: "面试加分项" },
    ],
    visualizers: [],
    problems: [
      { href: "/problems/two-sum", title: "两数之和", difficulty: "Easy" },
      { href: "/problems/valid-parentheses", title: "有效括号", difficulty: "Easy" },
      { href: "/problems/climbing-stairs", title: "爬楼梯", difficulty: "Easy" },
    ],
  },

  // ============= 新增教程 =============
  backtracking: {
    tutorials: [
      { href: "/tutorials/recursion", title: "递归", description: "回溯的底层就是递归" },
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "记忆化搜索 vs 回溯" },
      { href: "/tutorials/greedy", title: "贪心算法", description: "何时用贪心替代回溯" },
    ],
    visualizers: [],
    problems: [],
  },
  "divide-and-conquer": {
    tutorials: [
      { href: "/tutorials/quick-sort", title: "快速排序", description: "分治排序的经典" },
      { href: "/tutorials/merge-sort", title: "归并排序", description: "稳定分治排序" },
      { href: "/tutorials/recursion", title: "递归", description: "分治的实现基础" },
    ],
    visualizers: [
      { href: "/visualizer/sorting", title: "排序可视化", description: "分治排序动画" },
    ],
    problems: [],
  },
  "bit-manipulation": {
    tutorials: [
      { href: "/tutorials/time-complexity", title: "时间与空间复杂度", description: "O(1) 空间的极致" },
      { href: "/tutorials/hash-table", title: "哈希表", description: "位运算 vs 哈希的取舍" },
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "状态压缩 DP 的基础" },
    ],
    visualizers: [],
    problems: [],
  },
  "prefix-sum": {
    tutorials: [
      { href: "/tutorials/sliding-window", title: "双指针与滑动窗口", description: "另一种区间问题解法" },
      { href: "/tutorials/segment-tree", title: "线段树", description: "动态区间查询的进阶" },
      { href: "/tutorials/hash-table", title: "哈希表", description: "前缀和 + 哈希的组合" },
    ],
    visualizers: [],
    problems: [],
  },
  "shortest-path": {
    tutorials: [
      { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "图遍历是基础" },
      { href: "/tutorials/heap", title: "堆和优先队列", description: "Dijkstra 的核心数据结构" },
      { href: "/tutorials/greedy", title: "贪心算法", description: "Dijkstra 本质是贪心" },
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "Floyd 本质是 DP" },
    ],
    visualizers: [
      { href: "/visualizer/graphs", title: "图可视化", description: "图遍历动画" },
    ],
    problems: [],
  },
  "string-matching": {
    tutorials: [
      { href: "/tutorials/hash-table", title: "哈希表", description: "Rabin-Karp 的哈希思想" },
      { href: "/tutorials/sliding-window", title: "双指针与滑动窗口", description: "滚动窗口思路" },
      { href: "/tutorials/trie", title: "Trie 字典树", description: "多模式匹配的前置" },
    ],
    visualizers: [],
    problems: [],
  },
  "sorting-advanced": {
    tutorials: [
      { href: "/tutorials/quick-sort", title: "快速排序", description: "比较排序的标杆" },
      { href: "/tutorials/merge-sort", title: "归并排序", description: "稳定比较排序" },
      { href: "/tutorials/heap", title: "堆和优先队列", description: "堆排序的基础" },
    ],
    visualizers: [
      { href: "/visualizer/sorting", title: "排序可视化", description: "多种排序算法对比" },
    ],
    problems: [],
  },

  // ============= 第二批新增教程 =============
  array: {
    tutorials: [
      { href: "/tutorials/linked-list", title: "链表", description: "数组的对手" },
      { href: "/tutorials/sliding-window", title: "双指针与滑动窗口", description: "数组题核心技巧" },
      { href: "/tutorials/prefix-sum", title: "前缀和与差分", description: "区间操作利器" },
    ],
    visualizers: [],
    problems: [
      { href: "/problems/two-sum", title: "两数之和", difficulty: "Easy" },
    ],
  },
  string: {
    tutorials: [
      { href: "/tutorials/string-matching", title: "字符串匹配", description: "KMP 算法" },
      { href: "/tutorials/sliding-window", title: "滑动窗口", description: "子串问题" },
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "LCS、编辑距离" },
    ],
    visualizers: [],
    problems: [],
  },
  "binary-search-advanced": {
    tutorials: [
      { href: "/tutorials/binary-search", title: "二分查找", description: "基础二分" },
      { href: "/tutorials/greedy", title: "贪心算法", description: "check 函数常用贪心" },
    ],
    visualizers: [
      { href: "/visualizer/searching", title: "二分查找可视化", description: "区间缩小动画" },
    ],
    problems: [
      { href: "/problems/binary-search", title: "二分查找", difficulty: "Easy" },
    ],
  },
  "number-theory": {
    tutorials: [
      { href: "/tutorials/bit-manipulation", title: "位运算", description: "快速幂的位操作" },
      { href: "/tutorials/recursion", title: "递归", description: "欧几里得算法" },
    ],
    visualizers: [],
    problems: [],
  },
  "topological-sort": {
    tutorials: [
      { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "图遍历基础" },
      { href: "/tutorials/queue", title: "队列", description: "BFS 的底层结构" },
      { href: "/tutorials/shortest-path", title: "最短路径", description: "DAG 上最短路" },
    ],
    visualizers: [
      { href: "/visualizer/graphs", title: "图可视化", description: "图遍历动画" },
    ],
    problems: [],
  },
  "minimum-spanning-tree": {
    tutorials: [
      { href: "/tutorials/union-find", title: "并查集", description: "Kruskal 的核心" },
      { href: "/tutorials/greedy", title: "贪心算法", description: "MST 的贪心本质" },
      { href: "/tutorials/shortest-path", title: "最短路径", description: "对比 Prim 与 Dijkstra" },
    ],
    visualizers: [],
    problems: [],
  },
  "bipartite-graph": {
    tutorials: [
      { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "图遍历基础" },
      { href: "/tutorials/greedy", title: "贪心算法", description: "匹配中的贪心" },
    ],
    visualizers: [],
    problems: [],
  },
  "avl-tree": {
    tutorials: [
      { href: "/tutorials/binary-search-tree", title: "二分搜索树", description: "AVL 的基础" },
      { href: "/tutorials/red-black-tree", title: "红黑树", description: "另一种平衡方案" },
    ],
    visualizers: [
      { href: "/visualizer/trees", title: "树可视化", description: "旋转动画" },
    ],
    problems: [],
  },
  "skip-list": {
    tutorials: [
      { href: "/tutorials/linked-list", title: "链表", description: "跳表的底层" },
      { href: "/tutorials/binary-search", title: "二分查找", description: "跳表 = 链表上的二分" },
      { href: "/tutorials/red-black-tree", title: "红黑树", description: "跳表的竞争对手" },
    ],
    visualizers: [],
    problems: [],
  },
  "monotonic-queue": {
    tutorials: [
      { href: "/tutorials/monotonic-stack", title: "单调栈", description: "单调栈部分" },
      { href: "/tutorials/sliding-window", title: "滑动窗口", description: "窗口基础" },
      { href: "/tutorials/heap", title: "堆", description: "另一种窗口最值" },
    ],
    visualizers: [
      { href: "/visualizer/sliding-window", title: "滑动窗口可视化", description: "窗口动画" },
    ],
    problems: [],
  },
  "bubble-selection-insertion-sort": {
    tutorials: [
      { href: "/tutorials/quick-sort", title: "快速排序", description: "冒泡的进化版" },
      { href: "/tutorials/sorting-advanced", title: "非比较排序", description: "突破 O(n log n)" },
    ],
    visualizers: [
      { href: "/visualizer/sorting", title: "排序可视化", description: "多种排序对比" },
    ],
    problems: [],
  },
  "dp-knapsack": {
    tutorials: [
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 基础" },
      { href: "/tutorials/greedy", title: "贪心算法", description: "背包贪心为何错" },
    ],
    visualizers: [],
    problems: [
      { href: "/problems/climbing-stairs", title: "爬楼梯", difficulty: "Easy" },
    ],
  },
  "dp-interval": {
    tutorials: [
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 基础" },
      { href: "/tutorials/prefix-sum", title: "前缀和", description: "区间代价计算" },
    ],
    visualizers: [],
    problems: [],
  },
  "dp-tree": {
    tutorials: [
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 基础" },
      { href: "/tutorials/binary-tree", title: "二叉树", description: "树的遍历" },
      { href: "/tutorials/recursion", title: "递归", description: "树形 DP 的实现" },
    ],
    visualizers: [
      { href: "/visualizer/trees", title: "树可视化", description: "树遍历动画" },
    ],
    problems: [],
  },
  "dp-state-compression": {
    tutorials: [
      { href: "/tutorials/bit-manipulation", title: "位运算", description: "状压的位操作" },
      { href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 思想" },
      { href: "/tutorials/backtracking", title: "回溯算法", description: "暴力 vs 状压" },
    ],
    visualizers: [],
    problems: [],
  },
  "computational-geometry": {
    tutorials: [
      { href: "/tutorials/array", title: "数组", description: "点的存储" },
      { href: "/tutorials/quick-sort", title: "快速排序", description: "凸包需要排序" },
    ],
    visualizers: [],
    problems: [],
  },
  "design-data-structures": {
    tutorials: [
      { href: "/tutorials/lru-cache", title: "LRU 缓存", description: "最经典设计题" },
      { href: "/tutorials/hash-table", title: "哈希表", description: "设计题核心组件" },
      { href: "/tutorials/heap", title: "堆", description: "动态最值" },
      { href: "/tutorials/trie", title: "Trie", description: "前缀匹配" },
    ],
    visualizers: [
      { href: "/visualizer/hash-table", title: "哈希表演示", description: "哈希函数与冲突" },
    ],
    problems: [],
  },
  // ============= 新增教程 =============
  "edit-distance": {
    tutorials: [
      { href: "/tutorials/dynamic-programming", title: "动态规划：从入门到精通", description: "DP 基础框架" },
      { href: "/tutorials/lcs", title: "最长公共子序列", description: "同框架变体" },
      { href: "/tutorials/memoization", title: "记忆化搜索", description: "自顶向下实现" },
    ],
    visualizers: [],
    problems: [],
  },
  "stock-problems": {
    tutorials: [
      { href: "/tutorials/dp-state-machine", title: "状态机 DP", description: "股票问题的理论基础" },
      { href: "/tutorials/dynamic-programming", title: "动态规划：从入门到精通", description: "DP 基础" },
      { href: "/tutorials/greedy", title: "贪心算法", description: "k=∞ 时的贪心解法" },
    ],
    visualizers: [],
    problems: [],
  },
  "house-robber": {
    tutorials: [
      { href: "/tutorials/dynamic-programming", title: "动态规划：从入门到精通", description: "线性 DP 基础" },
      { href: "/tutorials/dp-tree", title: "树形 DP", description: "LC 337 的理论基础" },
      { href: "/tutorials/dp-state-machine", title: "状态机 DP", description: "选/不选状态设计" },
    ],
    visualizers: [],
    problems: [],
  },
  "palindrome-problems": {
    tutorials: [
      { href: "/tutorials/manacher", title: "Manacher 算法", description: "O(n) 最长回文子串" },
      { href: "/tutorials/dp-interval", title: "区间 DP", description: "回文子序列的基础" },
      { href: "/tutorials/backtracking", title: "回溯算法", description: "分割回文串的枚举" },
    ],
    visualizers: [],
    problems: [],
  },
  "grid-search": {
    tutorials: [
      { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "图的搜索理论基础" },
      { href: "/tutorials/union-find", title: "并查集", description: "连通性问题的另一种解法" },
      { href: "/tutorials/queue", title: "队列", description: "BFS 的核心数据结构" },
    ],
    visualizers: [],
    problems: [
      { href: "/problems/number-of-islands", title: "岛屿数量", difficulty: "Medium" },
    ],
  },
  "fast-slow-pointers": {
    tutorials: [
      { href: "/tutorials/linked-list", title: "链表", description: "链表基础操作" },
      { href: "/tutorials/two-pointers", title: "双指针技巧", description: "对撞指针与滑动窗口" },
      { href: "/tutorials/linked-list-problems", title: "链表经典问题", description: "反转、合并等技巧" },
    ],
    visualizers: [
      { href: "/visualizer/linked-list", title: "链表可视化", description: "节点移动动画" },
    ],
    problems: [],
  },
  "linked-list-binary-search": {
    tutorials: [
      { href: "/tutorials/fast-slow-pointers", title: "快慢指针", description: "中点定位基础" },
      { href: "/tutorials/merge-sort", title: "归并排序详解", description: "数组版归并排序" },
      { href: "/tutorials/linked-list", title: "链表", description: "链表基础" },
    ],
    visualizers: [
      { href: "/visualizer/sorting", title: "排序可视化", description: "归并排序动画" },
    ],
    problems: [],
  },
  "design-problems": {
    tutorials: [
      { href: "/tutorials/lru-cache", title: "LRU 缓存", description: "哈希 + 双向链表" },
      { href: "/tutorials/hash-table", title: "哈希表", description: "O(1) 查找的基石" },
      { href: "/tutorials/stack", title: "栈 Stack", description: "最小栈的基础" },
    ],
    visualizers: [
      { href: "/visualizer/hash-table", title: "哈希表演示", description: "哈希函数与冲突" },
    ],
    problems: [],
  },
  "data-structure-selection": {
    tutorials: [
      { href: "/tutorials/hash-table", title: "哈希表", description: "O(1) 查找" },
      { href: "/tutorials/heap", title: "堆和优先队列", description: "极值维护" },
      { href: "/tutorials/segment-tree", title: "线段树", description: "区间操作" },
      { href: "/tutorials/trie", title: "Trie 字典树", description: "前缀匹配" },
    ],
    visualizers: [],
    problems: [],
  },
  "divide-conquer-applications": {
    tutorials: [
      { href: "/tutorials/divide-and-conquer", title: "分治算法", description: "分治思想基础" },
      { href: "/tutorials/merge-sort", title: "归并排序详解", description: "归并排序本身" },
      { href: "/tutorials/binary-indexed-tree", title: "树状数组", description: "LC 315 的替代解法" },
    ],
    visualizers: [
      { href: "/visualizer/sorting", title: "排序可视化", description: "归并排序动画" },
    ],
    problems: [
      { href: "/problems/reverse-pairs", title: "翻转对", difficulty: "Hard" },
    ],
  },
  "short-url-system": {
    tutorials: [
      { href: "/tutorials/hash-table", title: "哈希表", description: "O(1) 查找的基石" },
      { href: "/tutorials/design-data-structures", title: "设计数据结构", description: "面试高频设计题" },
    ],
    visualizers: [
      { href: "/visualizer/hash-table", title: "哈希表演示", description: "哈希函数与冲突" },
    ],
    problems: [],
  },
  "redis-data-structures": {
    tutorials: [
      { href: "/tutorials/skip-list", title: "跳表", description: "ZSet 的底层" },
      { href: "/tutorials/hash-table", title: "哈希表", description: "Hash 类型基础" },
      { href: "/tutorials/lru-cache", title: "LRU 缓存", description: "缓存淘汰策略" },
    ],
    visualizers: [
      { href: "/visualizer/skip-list", title: "跳表演示", description: "链表上的二分" },
      { href: "/visualizer/hash-table", title: "哈希表演示", description: "冲突处理" },
    ],
    problems: [],
  },
  "disruptor-queue": {
    tutorials: [
      { href: "/tutorials/queue", title: "队列", description: "FIFO 基础" },
      { href: "/tutorials/linked-list", title: "链表", description: "环形缓冲的线性结构" },
      { href: "/tutorials/lru-cache", title: "LRU 缓存", description: "生产者-消费者场景" },
    ],
    visualizers: [
      { href: "/visualizer/queue", title: "队列演示", description: "入队出队动画" },
      { href: "/visualizer/linked-list", title: "链表演示", description: "节点指针操作" },
    ],
    problems: [],
  },
  "rate-limiting-auth": {
    tutorials: [
      { href: "/tutorials/queue", title: "队列", description: "令牌桶的缓冲" },
      { href: "/tutorials/sliding-window", title: "滑动窗口", description: "滑动窗口限流" },
      { href: "/tutorials/hash-table", title: "哈希表", description: "Session 存储" },
    ],
    visualizers: [
      { href: "/visualizer/queue", title: "队列演示", description: "令牌流入" },
    ],
    problems: [],
  },
  "search-engine-algorithms": {
    tutorials: [
      { href: "/tutorials/trie", title: "Trie 字典树", description: "前缀检索" },
      { href: "/tutorials/hash-table", title: "哈希表", description: "倒排索引存储" },
      { href: "/tutorials/string", title: "字符串", description: "分词与匹配" },
    ],
    visualizers: [
      { href: "/visualizer/trie", title: "Trie 演示", description: "前缀树构建" },
    ],
    problems: [],
  },

  // ============= 补齐的 75 篇注册 =============
  "a-star-search": {
    tutorials: [{ href: "/tutorials/shortest-path", title: "最短路径算法", description: "Dijkstra/BFS 是 A* 的基础" }, { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "图遍历基础" }],
    visualizers: [],
    problems: [],
  },
  "advanced-bfs": {
    tutorials: [{ href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "基础图遍历" }],
    visualizers: [{ href: "/visualizer/graphs", title: "图可视化", description: "BFS/DFS 遍历动画" }],
    problems: [],
  },
  "aho-corasick": {
    tutorials: [{ href: "/tutorials/trie", title: "Trie 字典树", description: "多模式匹配的树形基础" }, { href: "/tutorials/kmp", title: "KMP 算法", description: "单模式匹配" }],
    visualizers: [{ href: "/visualizer/aho-corasick", title: "AC 自动机演示", description: "Trie+fail 指针动画" }],
    problems: [],
  },
  "b-plus-tree": {
    tutorials: [{ href: "/tutorials/b-tree", title: "B 树与 B+ 树", description: "B+ 树的父结构" }],
    visualizers: [{ href: "/visualizer/b-tree", title: "B 树可视化", description: "插入/删除动画" }],
    problems: [],
  },
  "b-tree": {
    tutorials: [{ href: "/tutorials/binary-search-tree", title: "二分搜索树", description: "平衡有序树基础" }, { href: "/tutorials/b-plus-tree", title: "B+树与数据库索引", description: "B 树的变体" }],
    visualizers: [{ href: "/visualizer/b-tree", title: "B 树可视化", description: "多路平衡树动画" }],
    problems: [],
  },
  "big-number-arithmetic": {
    tutorials: [{ href: "/tutorials/number-theory", title: "数论算法", description: "高精度运算的基础" }],
    visualizers: [],
    problems: [],
  },
  "binary-indexed-tree": {
    tutorials: [{ href: "/tutorials/segment-tree", title: "线段树", description: "区间操作" }, { href: "/tutorials/prefix-sum", title: "前缀和与差分", description: "树状数组的前置" }],
    visualizers: [{ href: "/visualizer/binary-indexed-tree", title: "树状数组演示", description: "lowbit 更新动画" }],
    problems: [],
  },
  "binary-lifting": {
    tutorials: [{ href: "/tutorials/binary-tree-traversal", title: "二叉树遍历", description: "树的基础" }, { href: "/tutorials/tree-diameter-centroid", title: "树的直径与重心", description: "树形问题" }],
    visualizers: [{ href: "/visualizer/binary-lifting", title: "倍增法演示", description: "LCA 动画" }],
    problems: [],
  },
  "binary-search-answer": {
    tutorials: [{ href: "/tutorials/binary-search", title: "二分查找", description: "基础二分" }, { href: "/tutorials/greedy", title: "贪心算法", description: "check 函数常用贪心" }],
    visualizers: [{ href: "/visualizer/binary-search-answer", title: "二分答案演示", description: "单调性二分动画" }],
    problems: [],
  },
  "binary-tree-traversal": {
    tutorials: [{ href: "/tutorials/binary-tree", title: "二叉树", description: "树结构基础" }, { href: "/tutorials/recursion", title: "递归", description: "遍历的递归本质" }],
    visualizers: [{ href: "/visualizer/trees", title: "树可视化", description: "BFS/DFS 遍历动画" }],
    problems: [],
  },
  "block-list": {
    tutorials: [{ href: "/tutorials/linked-list", title: "链表", description: "块状链表的底层" }, { href: "/tutorials/sqrt-decomposition", title: "分块与莫队算法", description: "分块思想" }],
    visualizers: [{ href: "/visualizer/block-list", title: "块状链表演示", description: "块状结构动画" }],
    problems: [],
  },
  "bloom-filter": {
    tutorials: [{ href: "/tutorials/hash-table", title: "哈希表", description: "哈希思想" }, { href: "/tutorials/bit-manipulation", title: "位运算", description: "位图基础" }],
    visualizers: [{ href: "/visualizer/bloom-filter", title: "布隆过滤器演示", description: "多哈希位图动画" }],
    problems: [],
  },
  "cdq-divide-conquer": {
    tutorials: [{ href: "/tutorials/divide-and-conquer", title: "分治算法", description: "CDQ 的框架" }, { href: "/tutorials/binary-indexed-tree", title: "树状数组", description: "第三维维护" }],
    visualizers: [{ href: "/visualizer/cdq-divide-conquer", title: "CDQ 分治演示", description: "偏序统计动画" }],
    problems: [],
  },
  "chinese-remainder-theorem": {
    tutorials: [{ href: "/tutorials/extended-gcd", title: "扩展欧几里得与模逆元", description: "求逆元工具" }, { href: "/tutorials/number-theory", title: "数论算法", description: "同余基础" }],
    visualizers: [{ href: "/visualizer/chinese-remainder-theorem", title: "中国剩余定理演示", description: "同余合并动画" }],
    problems: [],
  },
  "combinatorics": {
    tutorials: [{ href: "/tutorials/number-theory", title: "数论算法", description: "逆元与取模" }, { href: "/tutorials/dynamic-programming", title: "动态规划", description: "计数递推" }],
    visualizers: [{ href: "/visualizer/combinatorics", title: "组合数学演示", description: "排列组合动画" }],
    problems: [],
  },
  "coordinate-compression": {
    tutorials: [{ href: "/tutorials/prefix-sum", title: "前缀和与差分", description: "离散化前置" }, { href: "/tutorials/binary-indexed-tree", title: "树状数组", description: "值域压缩后使用" }],
    visualizers: [{ href: "/visualizer/coordinate-compression", title: "离散化演示", description: "坐标压缩动画" }],
    problems: [],
  },
  "critical-path": {
    tutorials: [{ href: "/tutorials/topological-sort", title: "拓扑排序", description: "DAG 递推" }, { href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "图遍历" }],
    visualizers: [],
    problems: [],
  },
  "difference-constraints": {
    tutorials: [{ href: "/tutorials/shortest-path", title: "最短路径算法", description: "Bellman-Ford 判负环" }, { href: "/tutorials/topological-sort", title: "拓扑排序", description: "DAG 约束" }],
    visualizers: [{ href: "/visualizer/difference-constraints", title: "差分约束演示", description: "建图最短路动画" }],
    problems: [],
  },
  "discrete-log": {
    tutorials: [{ href: "/tutorials/number-theory", title: "数论算法", description: "模运算基础" }, { href: "/tutorials/primitive-root", title: "原根", description: "离散对数相关" }],
    visualizers: [],
    problems: [],
  },
  "dp-digit": {
    tutorials: [{ href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 基础" }, { href: "/tutorials/dp-state-machine", title: "状态机 DP", description: "数位 DP 的状态设计" }],
    visualizers: [{ href: "/visualizer/dp-digit", title: "数位 DP 演示", description: "逐位递推动画" }],
    problems: [],
  },
  "dp-state-machine": {
    tutorials: [{ href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 基础" }, { href: "/tutorials/stock-problems", title: "股票买卖系列", description: "状态机经典应用" }],
    visualizers: [{ href: "/visualizer/dp-state-machine", title: "状态机 DP 演示", description: "状态转移动画" }],
    problems: [],
  },
  "eulerian-path": {
    tutorials: [{ href: "/tutorials/graph-storage-traversal", title: "图的存储与遍历", description: "图遍历基础" }, { href: "/tutorials/union-find", title: "并查集", description: "连通性判定" }],
    visualizers: [{ href: "/visualizer/eulerian-path", title: "欧拉回路演示", description: "一笔画动画" }],
    problems: [],
  },
  "extended-gcd": {
    tutorials: [{ href: "/tutorials/number-theory", title: "数论算法", description: "GCD 基础" }, { href: "/tutorials/chinese-remainder-theorem", title: "中国剩余定理", description: "exgcd 的应用" }],
    visualizers: [{ href: "/visualizer/extended-gcd", title: "扩展欧几里得演示", description: "gcd 动画" }],
    problems: [],
  },
  "fibonacci-heap": {
    tutorials: [{ href: "/tutorials/heap", title: "堆和优先队列", description: "堆的基础" }, { href: "/tutorials/leftist-tree", title: "左偏树", description: "可并堆" }],
    visualizers: [],
    problems: [],
  },
  "game-theory": {
    tutorials: [{ href: "/tutorials/dynamic-programming", title: "动态规划", description: "博弈的 DP 解法" }, { href: "/tutorials/bit-manipulation", title: "位运算", description: "Nim 异或" }],
    visualizers: [{ href: "/visualizer/game-theory", title: "博弈论演示", description: "Nim/SG 动画" }],
    problems: [],
  },
  "gaussian-elimination": {
    tutorials: [{ href: "/tutorials/matrix-exponentiation", title: "快速幂与矩阵快速幂", description: "矩阵运算" }, { href: "/tutorials/number-theory", title: "数论算法", description: "模运算" }],
    visualizers: [{ href: "/visualizer/gaussian-elimination", title: "高斯消元演示", description: "消元过程动画" }],
    problems: [],
  },
  "graph-storage-traversal": {
    tutorials: [{ href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "图遍历" }, { href: "/tutorials/topological-sort", title: "拓扑排序", description: "DAG 遍历" }],
    visualizers: [{ href: "/visualizer/graph-storage-traversal", title: "图的存储演示", description: "邻接表/矩阵动画" }],
    problems: [],
  },
  "hamiltonian": {
    tutorials: [{ href: "/tutorials/eulerian-path", title: "欧拉回路与一笔画", description: "边遍历对比" }, { href: "/tutorials/dp-state-compression", title: "状态压缩 DP", description: "TSP 的状压解法" }],
    visualizers: [],
    problems: [],
  },
  "hash-collision": {
    tutorials: [{ href: "/tutorials/hash-table", title: "哈希表", description: "哈希基础" }, { href: "/tutorials/bloom-filter", title: "位图与布隆过滤器", description: "哈希应用" }],
    visualizers: [{ href: "/visualizer/hash-collision", title: "哈希冲突演示", description: "链地址/开放地址动画" }],
    problems: [],
  },
  "heap-sort": {
    tutorials: [{ href: "/tutorials/heap", title: "堆和优先队列", description: "堆的基础" }, { href: "/tutorials/quick-sort", title: "快速排序", description: "对比排序" }],
    visualizers: [{ href: "/visualizer/heap-sort", title: "堆排序可视化", description: "建堆取极值动画" }],
    problems: [],
  },
  "heavy-light-decomposition": {
    tutorials: [{ href: "/tutorials/segment-tree", title: "线段树", description: "链上区间查询" }, { href: "/tutorials/tree-diameter-centroid", title: "树的直径与重心", description: "树形问题" }],
    visualizers: [{ href: "/visualizer/heavy-light-decomposition", title: "树链剖分演示", description: "重链动画" }],
    problems: [],
  },
  "index-design": {
    tutorials: [{ href: "/tutorials/b-tree", title: "B 树与 B+ 树", description: "索引底层结构" }, { href: "/tutorials/b-plus-tree", title: "B+树与数据库索引", description: "数据库索引" }],
    visualizers: [],
    problems: [],
  },
  "interval-merge": {
    tutorials: [{ href: "/tutorials/interval-scheduling", title: "区间调度与贪心", description: "区间贪心" }, { href: "/tutorials/sweep-line", title: "扫描线算法", description: "区间事件" }],
    visualizers: [],
    problems: [],
  },
  "interval-scheduling": {
    tutorials: [{ href: "/tutorials/greedy", title: "贪心算法", description: "贪心思想" }, { href: "/tutorials/interval-merge", title: "区间合并与区间操作", description: "区间处理" }],
    visualizers: [],
    problems: [],
  },
  "kd-tree": {
    tutorials: [{ href: "/tutorials/computational-geometry", title: "计算几何", description: "几何问题" }, { href: "/tutorials/binary-search-tree", title: "二分搜索树", description: "树形划分" }],
    visualizers: [],
    problems: [],
  },
  "kmp": {
    tutorials: [{ href: "/tutorials/string-matching", title: "字符串匹配", description: "匹配算法" }, { href: "/tutorials/string-hashing", title: "字符串哈希与 Rabin-Karp", description: "另一种匹配" }],
    visualizers: [{ href: "/visualizer/kmp", title: "KMP 可视化", description: "前缀函数动画" }],
    problems: [],
  },
  "lcs": {
    tutorials: [{ href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 基础" }, { href: "/tutorials/edit-distance", title: "编辑距离", description: "同框架变体" }],
    visualizers: [{ href: "/visualizer/lcs", title: "LCS 可视化", description: "最长公共子序列动画" }],
    problems: [{ href: "/problems/longest-common-subsequence", title: "最长公共子序列", difficulty: "Medium" }],
  },
  "leftist-tree": {
    tutorials: [{ href: "/tutorials/heap", title: "堆和优先队列", description: "堆的基础" }, { href: "/tutorials/fibonacci-heap", title: "斐波那契堆", description: "可并堆" }],
    visualizers: [],
    problems: [],
  },
  "linear-search": {
    tutorials: [{ href: "/tutorials/binary-search", title: "二分查找详解", description: "有序查找" }, { href: "/tutorials/array", title: "数组", description: "线性结构" }],
    visualizers: [{ href: "/visualizer/linear-search", title: "线性查找演示", description: "逐个扫描动画" }],
    problems: [],
  },
  "linked-list-problems": {
    tutorials: [{ href: "/tutorials/linked-list", title: "链表", description: "链表基础" }, { href: "/tutorials/fast-slow-pointers", title: "快慢指针", description: "链表常用技巧" }],
    visualizers: [{ href: "/visualizer/linked-list-problems", title: "链表问题演示", description: "经典链表题动画" }],
    problems: [{ href: "/problems/reverse-linked-list", title: "反转链表", difficulty: "Easy" }],
  },
  "lis": {
    tutorials: [{ href: "/tutorials/dynamic-programming", title: "动态规划", description: "DP 解法" }, { href: "/tutorials/binary-search", title: "二分查找", description: "O(n log n) 优化" }],
    visualizers: [{ href: "/visualizer/lis", title: "LIS 可视化", description: "最长递增子序列动画" }],
    problems: [],
  },
  "lucas": {
    tutorials: [{ href: "/tutorials/combinatorics", title: "组合数学与计数", description: "组合数" }, { href: "/tutorials/number-theory", title: "数论算法", description: "模运算" }],
    visualizers: [],
    problems: [],
  },
  "manacher": {
    tutorials: [{ href: "/tutorials/palindromic-tree", title: "回文树", description: "回文结构" }, { href: "/tutorials/string", title: "字符串：高频面试题型", description: "字符串基础" }],
    visualizers: [{ href: "/visualizer/manacher", title: "Manacher 可视化", description: "回文半径动画" }],
    problems: [],
  },
  "matching": {
    tutorials: [{ href: "/tutorials/bipartite-graph", title: "二分图", description: "匹配的图基础" }, { href: "/tutorials/network-flow", title: "网络流基础", description: "匹配=最大流" }],
    visualizers: [],
    problems: [],
  },
  "matrix-exponentiation": {
    tutorials: [{ href: "/tutorials/number-theory", title: "数论算法", description: "快速幂基础" }, { href: "/tutorials/dynamic-programming", title: "动态规划", description: "线性递推" }],
    visualizers: [{ href: "/visualizer/matrix-exponentiation", title: "矩阵快速幂演示", description: "递推加速动画" }],
    problems: [],
  },
  "memoization": {
    tutorials: [{ href: "/tutorials/dynamic-programming", title: "动态规划", description: "自底向上" }, { href: "/tutorials/recursion", title: "递归", description: "自顶向下" }],
    visualizers: [{ href: "/visualizer/memoization", title: "记忆化搜索演示", description: "缓存递归动画" }],
    problems: [],
  },
  "min-cost-flow": {
    tutorials: [{ href: "/tutorials/network-flow", title: "网络流基础", description: "最大流基础" }, { href: "/tutorials/shortest-path", title: "最短路径算法", description: "SPFA 增广" }],
    visualizers: [],
    problems: [],
  },
  "mobius": {
    tutorials: [{ href: "/tutorials/number-theory", title: "数论算法", description: "数论基础" }, { href: "/tutorials/combinatorics", title: "组合数学与计数", description: "计数问题" }],
    visualizers: [],
    problems: [],
  },
  "monotonic-stack-advanced": {
    tutorials: [{ href: "/tutorials/monotonic-stack", title: "单调栈与单调队列", description: "单调栈基础" }, { href: "/tutorials/monotonic-queue", title: "单调队列", description: "滑动窗口最值" }],
    visualizers: [{ href: "/visualizer/monotonic-stack-advanced", title: "单调栈进阶演示", description: "进阶动画" }],
    problems: [],
  },
  "naive-bayes": {
    tutorials: [{ href: "/tutorials/vector-space-recommendation", title: "向量空间与推荐系统", description: "文本向量化" }, { href: "/tutorials/search-engine-algorithms", title: "搜索引擎背后的数据结构与算法", description: "文本检索" }],
    visualizers: [],
    problems: [],
  },
  "network-flow": {
    tutorials: [{ href: "/tutorials/bipartite-graph", title: "二分图", description: "流与匹配" }, { href: "/tutorials/matching", title: "二分图最大匹配", description: "最大流应用" }],
    visualizers: [{ href: "/visualizer/network-flow", title: "网络流演示", description: "增广路动画" }],
    problems: [],
  },
  "palindromic-tree": {
    tutorials: [{ href: "/tutorials/manacher", title: "Manacher 算法", description: "回文半径" }, { href: "/tutorials/string", title: "字符串：高频面试题型", description: "字符串基础" }],
    visualizers: [],
    problems: [],
  },
  "parallel-algorithms": {
    tutorials: [{ href: "/tutorials/divide-and-conquer", title: "分治算法", description: "并行分治" }, { href: "/tutorials/sqrt-decomposition", title: "分块与莫队算法", description: "分块思想" }],
    visualizers: [],
    problems: [],
  },
  "persistent-segment-tree": {
    tutorials: [{ href: "/tutorials/segment-tree", title: "线段树", description: "基础线段树" }, { href: "/tutorials/segment-tree-advanced", title: "线段树进阶", description: "可持久化前置" }],
    visualizers: [{ href: "/visualizer/persistent-segment-tree", title: "主席树演示", description: "历史版本动画" }],
    problems: [],
  },
  "primitive-root": {
    tutorials: [{ href: "/tutorials/number-theory", title: "数论算法", description: "模运算基础" }, { href: "/tutorials/discrete-log", title: "离散对数", description: "原根应用" }],
    visualizers: [],
    problems: [],
  },
  "priority-queue-advanced": {
    tutorials: [{ href: "/tutorials/heap", title: "堆和优先队列", description: "堆基础" }, { href: "/tutorials/lru-cache", title: "LRU 缓存", description: "优先级应用" }],
    visualizers: [{ href: "/visualizer/priority-queue-advanced", title: "优先队列进阶演示", description: "对顶堆动画" }],
    problems: [],
  },
  "quadratic-residue": {
    tutorials: [{ href: "/tutorials/number-theory", title: "数论算法", description: "模运算基础" }, { href: "/tutorials/primitive-root", title: "原根", description: "平方根相关" }],
    visualizers: [],
    problems: [],
  },
  "segment-tree-advanced": {
    tutorials: [{ href: "/tutorials/segment-tree", title: "线段树", description: "基础线段树" }, { href: "/tutorials/persistent-segment-tree", title: "主席树", description: "可持久化" }],
    visualizers: [{ href: "/visualizer/segment-tree-advanced", title: "线段树进阶演示", description: "扫描线动画" }],
    problems: [],
  },
  "set-and-map": {
    tutorials: [{ href: "/tutorials/hash-table", title: "哈希表", description: "哈希实现" }, { href: "/tutorials/binary-search-tree", title: "二分搜索树", description: "有序实现" }],
    visualizers: [{ href: "/visualizer/set-and-map", title: "集合与映射演示", description: "有序/无序对比动画" }],
    problems: [],
  },
  "shell-sort": {
    tutorials: [{ href: "/tutorials/bubble-selection-insertion-sort", title: "基础排序", description: "插入排序基础" }, { href: "/tutorials/sorting-summary", title: "排序算法大总结", description: "排序对比" }],
    visualizers: [{ href: "/visualizer/shell-sort", title: "希尔排序可视化", description: "分组插入动画" }],
    problems: [],
  },
  "sorting-summary": {
    tutorials: [{ href: "/tutorials/quick-sort", title: "快速排序详解", description: "分治排序" }, { href: "/tutorials/merge-sort", title: "归并排序详解", description: "稳定排序" }],
    visualizers: [{ href: "/visualizer/sorting", title: "排序可视化", description: "多种排序对比" }],
    problems: [],
  },
  "splay-tree": {
    tutorials: [{ href: "/tutorials/avl-tree", title: "AVL 树", description: "平衡树" }, { href: "/tutorials/red-black-tree", title: "红黑树", description: "平衡树" }],
    visualizers: [{ href: "/visualizer/splay-tree", title: "伸展树可视化", description: "旋转动画" }],
    problems: [],
  },
  "sqrt-decomposition": {
    tutorials: [{ href: "/tutorials/segment-tree", title: "线段树", description: "区间操作" }, { href: "/tutorials/binary-indexed-tree", title: "树状数组", description: "区间查询" }],
    visualizers: [{ href: "/visualizer/sqrt-decomposition", title: "分块演示", description: "分块动画" }],
    problems: [],
  },
  "stirling": {
    tutorials: [{ href: "/tutorials/combinatorics", title: "组合数学与计数", description: "计数基础" }, { href: "/tutorials/dynamic-programming", title: "动态规划", description: "计数 DP" }],
    visualizers: [],
    problems: [],
  },
  "string-hashing": {
    tutorials: [{ href: "/tutorials/string-matching", title: "字符串匹配", description: "匹配基础" }, { href: "/tutorials/kmp", title: "KMP 算法", description: "确定性匹配" }],
    visualizers: [{ href: "/visualizer/string-hashing", title: "字符串哈希演示", description: "滚动哈希动画" }],
    problems: [],
  },
  "suffix-array": {
    tutorials: [{ href: "/tutorials/string-hashing", title: "字符串哈希与 Rabin-Karp", description: "字符串哈希" }, { href: "/tutorials/suffix-automaton", title: "后缀自动机", description: "后缀结构" }],
    visualizers: [{ href: "/visualizer/suffix-array", title: "后缀数组演示", description: "后缀排序动画" }],
    problems: [],
  },
  "suffix-automaton": {
    tutorials: [{ href: "/tutorials/suffix-array", title: "后缀数组", description: "后缀结构" }, { href: "/tutorials/trie", title: "Trie 字典树", description: "自动机基础" }],
    visualizers: [],
    problems: [],
  },
  "sweep-line": {
    tutorials: [{ href: "/tutorials/interval-merge", title: "区间合并与区间操作", description: "区间处理" }, { href: "/tutorials/coordinate-compression", title: "离散化与坐标压缩", description: "坐标压缩" }],
    visualizers: [{ href: "/visualizer/sweep-line", title: "扫描线演示", description: "事件排序动画" }],
    problems: [],
  },
  "tarjan-scc": {
    tutorials: [{ href: "/tutorials/graph-algorithms", title: "BFS 与 DFS", description: "DFS 基础" }, { href: "/tutorials/two-sat", title: "2-SAT 问题", description: "SCC 应用" }],
    visualizers: [{ href: "/visualizer/tarjan-scc", title: "Tarjan 演示", description: "强连通分量动画" }],
    problems: [],
  },
  "treap": {
    tutorials: [{ href: "/tutorials/splay-tree", title: "伸展树 Splay Tree", description: "平衡树" }, { href: "/tutorials/skip-list", title: "跳表", description: "概率平衡" }],
    visualizers: [{ href: "/visualizer/treap", title: "Treap 演示", description: "旋转动画" }],
    problems: [],
  },
  "tree-diameter-centroid": {
    tutorials: [{ href: "/tutorials/binary-tree-traversal", title: "二叉树遍历", description: "树遍历" }, { href: "/tutorials/binary-lifting", title: "倍增法与 LCA", description: "树上倍增" }],
    visualizers: [{ href: "/visualizer/tree-diameter-centroid", title: "树的直径演示", description: "直径动画" }],
    problems: [],
  },
  "two-pointers": {
    tutorials: [{ href: "/tutorials/sliding-window", title: "滑动窗口", description: "双指针变体" }, { href: "/tutorials/fast-slow-pointers", title: "快慢指针", description: "指针技巧" }],
    visualizers: [{ href: "/visualizer/two-pointers", title: "双指针演示", description: "对撞指针动画" }],
    problems: [{ href: "/problems/two-sum", title: "两数之和", difficulty: "Easy" }],
  },
  "two-sat": {
    tutorials: [{ href: "/tutorials/tarjan-scc", title: "Tarjan 算法", description: "SCC 判定" }, { href: "/tutorials/topological-sort", title: "拓扑排序", description: "DAG 赋序" }],
    visualizers: [{ href: "/visualizer/two-sat", title: "2-SAT 演示", description: "约束满足动画" }],
    problems: [],
  },
  "union-find-advanced": {
    tutorials: [{ href: "/tutorials/union-find", title: "并查集", description: "基础并查集" }, { href: "/tutorials/segment-tree", title: "线段树", description: "区间操作" }],
    visualizers: [{ href: "/visualizer/union-find-advanced", title: "并查集进阶演示", description: "带权/可撤销动画" }],
    problems: [],
  },
  "vector-space-recommendation": {
    tutorials: [{ href: "/tutorials/naive-bayes", title: "朴素贝叶斯与垃圾信息过滤", description: "文本分类" }, { href: "/tutorials/search-engine-algorithms", title: "搜索引擎背后的数据结构与算法", description: "检索相关" }],
    visualizers: [],
    problems: [],
  },
};
