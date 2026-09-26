export type TutorialItem = {
  slug: string;
  title: string;
  category: string;
};

/**
 * 分类在侧边栏中的展示顺序；不在其中的分类排到最后。
 * 与 tutorial-page.TUTORIAL_CATEGORY_ORDER 保持一致。
 */
export const TUTORIAL_CATEGORY_ORDER = [
  '排序算法',
  '搜索算法',
  '数据结构',
  '算法思想',
  '动态规划',
  '图论',
  '字符串',
  '面试进阶',
  '工程实战',
];

/**
 * 教程目录列表（按学习路径排序）
 * 仅用于「上一篇/下一篇」与 roadmap 学习路径；侧边栏请改用
 * `groupTutorialsForSidebar(items)` 让其跟随本地 .md 自动覆盖。
 */
export const TUTORIAL_LIST: TutorialItem[] = [
  // 基础
  { slug: 'time-complexity', title: '时间与空间复杂度', category: '算法思想' },
  // 排序算法
  { slug: 'bubble-selection-insertion-sort', title: '基础排序：冒泡、选择与插入', category: '排序算法' },
  { slug: 'shell-sort', title: '希尔排序', category: '排序算法' },
  { slug: 'merge-sort', title: '归并排序详解', category: '排序算法' },
  { slug: 'quick-sort', title: '快速排序详解', category: '排序算法' },
  { slug: 'heap-sort', title: '堆排序', category: '排序算法' },
  { slug: 'sorting-advanced', title: '非比较排序：计数、基数与桶', category: '排序算法' },
  { slug: 'sorting-summary', title: '排序算法大总结', category: '排序算法' },
  // 搜索算法
  { slug: 'linear-search', title: '线性查找与搜索策略', category: '搜索算法' },
  { slug: 'binary-search', title: '二分查找详解', category: '搜索算法' },
  { slug: 'binary-search-advanced', title: '二分查找进阶', category: '搜索算法' },
  { slug: 'binary-search-answer', title: '二分答案', category: '搜索算法' },
  // 数据结构：线性结构
  { slug: 'array', title: '数组', category: '数据结构' },
  { slug: 'linked-list', title: '链表', category: '数据结构' },
  { slug: 'linked-list-problems', title: '链表经典问题', category: '数据结构' },
  { slug: 'linked-list-binary-search', title: '链表二分与分治', category: '数据结构' },
  { slug: 'stack', title: '栈 Stack', category: '数据结构' },
  { slug: 'queue', title: '队列', category: '数据结构' },
  { slug: 'hash-table', title: '哈希表', category: '数据结构' },
  { slug: 'hash-collision', title: '哈希冲突与负载因子', category: '数据结构' },
  { slug: 'set-and-map', title: '集合与映射', category: '数据结构' },
  { slug: 'heap', title: '堆和优先队列', category: '数据结构' },
  { slug: 'priority-queue-advanced', title: '优先队列与堆进阶', category: '数据结构' },
  // 数据结构：树
  { slug: 'binary-tree', title: '二叉树', category: '数据结构' },
  { slug: 'binary-tree-traversal', title: '二叉树遍历与递归', category: '数据结构' },
  { slug: 'binary-search-tree', title: '二分搜索树', category: '数据结构' },
  { slug: 'avl-tree', title: 'AVL 树与平衡二叉搜索树', category: '数据结构' },
  { slug: 'red-black-tree', title: '红黑树', category: '数据结构' },
  { slug: 'trie', title: 'Trie 字典树', category: '数据结构' },
  { slug: 'binary-lifting', title: '倍增法与 LCA', category: '数据结构' },
  { slug: 'tree-diameter-centroid', title: '树的直径与重心', category: '数据结构' },
  { slug: 'b-tree', title: 'B 树与 B+ 树', category: '数据结构' },
  // 数据结构：高级
  { slug: 'segment-tree', title: '线段树', category: '数据结构' },
  { slug: 'segment-tree-advanced', title: '线段树进阶', category: '数据结构' },
  { slug: 'persistent-segment-tree', title: '主席树（可持久化线段树）', category: '数据结构' },
  { slug: 'binary-indexed-tree', title: '树状数组（Fenwick Tree）', category: '数据结构' },
  { slug: 'monotonic-stack', title: '单调栈与单调队列', category: '数据结构' },
  { slug: 'monotonic-stack-advanced', title: '单调栈进阶', category: '数据结构' },
  { slug: 'monotonic-queue', title: '单调队列', category: '数据结构' },
  { slug: 'union-find', title: '并查集', category: '数据结构' },
  { slug: 'union-find-advanced', title: '并查集进阶', category: '数据结构' },
  { slug: 'lru-cache', title: 'LRU 缓存', category: '数据结构' },
  { slug: 'skip-list', title: '跳表', category: '数据结构' },
  { slug: 'design-data-structures', title: '设计数据结构', category: '数据结构' },
  { slug: 'heavy-light-decomposition', title: '树链剖分', category: '数据结构' },
  { slug: 'sqrt-decomposition', title: '分块与莫队算法', category: '数据结构' },
  { slug: 'b-plus-tree', title: 'B+树与数据库索引', category: '数据结构' },
  { slug: 'block-list', title: '块状链表', category: '数据结构' },
  { slug: 'bloom-filter', title: '位图与布隆过滤器', category: '数据结构' },
  { slug: 'fibonacci-heap', title: '斐波那契堆', category: '数据结构' },
  { slug: 'kd-tree', title: 'KD 树', category: '数据结构' },
  { slug: 'leftist-tree', title: '左偏树', category: '数据结构' },
  { slug: 'splay-tree', title: '伸展树 Splay Tree', category: '数据结构' },
  { slug: 'treap', title: '树堆 Treap', category: '数据结构' },
  // 算法思想
  { slug: 'recursion', title: '递归', category: '算法思想' },
  { slug: 'divide-and-conquer', title: '分治算法', category: '算法思想' },
  { slug: 'divide-conquer-applications', title: '分治应用：逆序对与最近点对', category: '算法思想' },
  { slug: 'greedy', title: '贪心算法', category: '算法思想' },
  { slug: 'interval-scheduling', title: '区间调度与贪心', category: '算法思想' },
  { slug: 'backtracking', title: '回溯算法', category: '算法思想' },
  { slug: 'two-pointers', title: '双指针技巧', category: '算法思想' },
  { slug: 'fast-slow-pointers', title: '快慢指针', category: '算法思想' },
  { slug: 'sliding-window', title: '滑动窗口', category: '算法思想' },
  { slug: 'prefix-sum', title: '前缀和与差分', category: '算法思想' },
  { slug: 'bit-manipulation', title: '位运算', category: '算法思想' },
  { slug: 'coordinate-compression', title: '离散化与坐标压缩', category: '算法思想' },
  { slug: 'sweep-line', title: '扫描线算法', category: '算法思想' },
  { slug: 'cdq-divide-conquer', title: 'CDQ 分治', category: '算法思想' },
  { slug: 'combinatorics', title: '组合数学与计数', category: '算法思想' },
  { slug: 'matrix-exponentiation', title: '快速幂与矩阵快速幂', category: '算法思想' },
  { slug: 'extended-gcd', title: '扩展欧几里得与模逆元', category: '算法思想' },
  { slug: 'chinese-remainder-theorem', title: '中国剩余定理', category: '算法思想' },
  { slug: 'gaussian-elimination', title: '高斯消元', category: '算法思想' },
  { slug: 'game-theory', title: '博弈论基础', category: '算法思想' },
  { slug: 'number-theory', title: '数论算法', category: '算法思想' },
  { slug: 'computational-geometry', title: '计算几何', category: '算法思想' },
  { slug: 'a-star-search', title: 'A*搜索算法', category: '算法思想' },
  { slug: 'big-number-arithmetic', title: '高精度运算', category: '算法思想' },
  { slug: 'discrete-log', title: '离散对数', category: '算法思想' },
  { slug: 'interval-merge', title: '区间合并与区间操作', category: '算法思想' },
  { slug: 'lucas', title: '卢卡斯定理', category: '算法思想' },
  { slug: 'mobius', title: '莫比乌斯反演', category: '算法思想' },
  { slug: 'primitive-root', title: '原根', category: '算法思想' },
  { slug: 'quadratic-residue', title: '二次剩余', category: '算法思想' },
  { slug: 'stirling', title: '斯特林数', category: '算法思想' },
  // 动态规划
  { slug: 'dynamic-programming', title: '动态规划：从入门到精通', category: '动态规划' },
  { slug: 'memoization', title: '记忆化搜索', category: '动态规划' },
  { slug: 'lis', title: '最长递增子序列（LIS）', category: '动态规划' },
  { slug: 'lcs', title: '最长公共子序列（LCS）', category: '动态规划' },
  { slug: 'dp-state-machine', title: '状态机 DP', category: '动态规划' },
  { slug: 'dp-knapsack', title: '背包问题', category: '动态规划' },
  { slug: 'dp-interval', title: '区间 DP', category: '动态规划' },
  { slug: 'dp-tree', title: '树形 DP', category: '动态规划' },
  { slug: 'dp-state-compression', title: '状态压缩 DP', category: '动态规划' },
  { slug: 'dp-digit', title: '数位 DP', category: '动态规划' },
  { slug: 'edit-distance', title: '编辑距离', category: '动态规划' },
  { slug: 'stock-problems', title: '股票买卖系列', category: '动态规划' },
  { slug: 'house-robber', title: '打家劫舍系列', category: '动态规划' },
  { slug: 'palindrome-problems', title: '回文问题专题', category: '动态规划' },
  // 图论
  { slug: 'graph-storage-traversal', title: '图的存储与遍历', category: '图论' },
  { slug: 'graph-algorithms', title: 'BFS 与 DFS', category: '图论' },
  { slug: 'shortest-path', title: '最短路径算法', category: '图论' },
  { slug: 'topological-sort', title: '拓扑排序', category: '图论' },
  { slug: 'minimum-spanning-tree', title: '最小生成树', category: '图论' },
  { slug: 'bipartite-graph', title: '二分图', category: '图论' },
  { slug: 'tarjan-scc', title: 'Tarjan 算法：强连通分量', category: '图论' },
  { slug: 'eulerian-path', title: '欧拉回路与一笔画', category: '图论' },
  { slug: 'two-sat', title: '2-SAT 问题', category: '图论' },
  { slug: 'difference-constraints', title: '差分约束系统', category: '图论' },
  { slug: 'network-flow', title: '网络流基础', category: '图论' },
  { slug: 'grid-search', title: '网格搜索与岛屿问题', category: '图论' },
  { slug: 'advanced-bfs', title: '高级 BFS 专题', category: '图论' },
  { slug: 'critical-path', title: '关键路径', category: '图论' },
  { slug: 'hamiltonian', title: '哈密顿回路', category: '图论' },
  { slug: 'matching', title: '二分图最大匹配', category: '图论' },
  { slug: 'min-cost-flow', title: '最小费用最大流', category: '图论' },
  // 字符串
  { slug: 'string', title: '字符串：高频面试题型', category: '字符串' },
  { slug: 'kmp', title: 'KMP 算法', category: '字符串' },
  { slug: 'string-matching', title: '字符串匹配', category: '字符串' },
  { slug: 'manacher', title: 'Manacher 算法', category: '字符串' },
  { slug: 'string-hashing', title: '字符串哈希与 Rabin-Karp', category: '字符串' },
  { slug: 'suffix-array', title: '后缀数组', category: '字符串' },
  { slug: 'aho-corasick', title: 'AC 自动机', category: '字符串' },
  { slug: 'palindromic-tree', title: '回文树', category: '字符串' },
  { slug: 'suffix-automaton', title: '后缀自动机', category: '字符串' },
  // 面试
  { slug: 'interview-system', title: '算法面试通关指南', category: '面试进阶' },
  { slug: 'design-problems', title: '构造与设计专题', category: '面试进阶' },
  // 工程实战（系统设计 / 工业级数据结构）
  { slug: 'short-url-system', title: '算法实战：短网址系统设计', category: '工程实战' },
  { slug: 'redis-data-structures', title: '算法实战：Redis 数据结构剖析', category: '工程实战' },
  { slug: 'disruptor-queue', title: '算法实战：高性能队列 Disruptor', category: '工程实战' },
  { slug: 'rate-limiting-auth', title: '算法实战：限流与鉴权', category: '工程实战' },
  { slug: 'search-engine-algorithms', title: '算法实战：搜索引擎背后的数据结构与算法', category: '工程实战' },
  { slug: 'data-structure-selection', title: '数据结构选型策略：什么场景用什么结构', category: '工程实战' },
  { slug: 'index-design', title: '索引设计与海量数据查找', category: '工程实战' },
  { slug: 'naive-bayes', title: '朴素贝叶斯与垃圾信息过滤', category: '工程实战' },
  { slug: 'parallel-algorithms', title: '并行算法', category: '工程实战' },
  { slug: 'vector-space-recommendation', title: '向量空间与推荐系统', category: '工程实战' },
];

/**
 * 权威分类映射：slug → category。
 * 当 .md 文件缺少 YAML frontmatter `category` 字段时，用此表回退，
 * 确保列表页/侧边栏/详情标签的全量教程都能被正确归类。
 * 覆盖 src/app/tutorials 下全部 <slug>.md。
 */
export const TUTORIAL_CATEGORY_MAP: Record<string, string> = {
  // 从 TUTORIAL_LIST 自动提取（避免重复维护）
  ...Object.fromEntries(TUTORIAL_LIST.map((t) => [t.slug, t.category])),
  // 以下为目录中存在但未在 TUTORIAL_LIST 中的补充项
  'a-star-search': '算法思想',
  'advanced-bfs': '图论',
  'b-plus-tree': '数据结构',
  'big-number-arithmetic': '算法思想',
  'block-list': '数据结构',
  'bloom-filter': '数据结构',
  'critical-path': '图论',
  'discrete-log': '算法思想',
  'fibonacci-heap': '数据结构',
  'hamiltonian': '图论',
  'index-design': '工程实战',
  'interval-merge': '算法思想',
  'kd-tree': '数据结构',
  'leftist-tree': '数据结构',
  'lucas': '算法思想',
  'matching': '图论',
  'min-cost-flow': '图论',
  'mobius': '算法思想',
  'naive-bayes': '工程实战',
  'palindromic-tree': '字符串',
  'parallel-algorithms': '工程实战',
  'primitive-root': '算法思想',
  'quadratic-residue': '算法思想',
  'splay-tree': '数据结构',
  'stirling': '算法思想',
  'suffix-automaton': '字符串',
  'treap': '数据结构',
  'vector-space-recommendation': '工程实战',
};

/** 按 category 分组，保持 TUTORIAL_LIST 中的顺序 */
export function getGroupedTutorials(): { category: string; items: TutorialItem[] }[] {
  const groups: { category: string; items: TutorialItem[] }[] = [];
  const map = new Map<string, TutorialItem[]>();
  for (const item of TUTORIAL_LIST) {
    if (!map.has(item.category)) {
      map.set(item.category, []);
      groups.push({ category: item.category, items: map.get(item.category)! });
    }
    map.get(item.category)!.push(item);
  }
  return groups;
}

export interface SidebarGroup {
  category: string;
  items: TutorialItem[];
}

/**
 * 将教程列表按 category 分组并按 TUTORIAL_CATEGORY_ORDER 排序，
 * 分类内按 title 拼音升序。用于侧边栏，确保新增的 .md 自动出现。
 */
export function groupTutorialsForSidebar(items: TutorialItem[]): SidebarGroup[] {
  const map = new Map<string, TutorialItem[]>();
  for (const it of items) {
    if (!map.has(it.category)) map.set(it.category, []);
    map.get(it.category)!.push(it);
  }
  // 分类内按中文标题排序
  for (const arr of map.values()) {
    arr.sort((a, b) => a.title.localeCompare(b.title, 'zh'));
  }
  const groups: SidebarGroup[] = Array.from(map.entries()).map(([category, list]) => ({
    category,
    items: list,
  }));
  // 按预设顺序排，未出现的分类排到最后
  groups.sort((a, b) => {
    const ia = TUTORIAL_CATEGORY_ORDER.indexOf(a.category);
    const ib = TUTORIAL_CATEGORY_ORDER.indexOf(b.category);
    const ra = ia === -1 ? 999 : ia;
    const rb = ib === -1 ? 999 : ib;
    return ra - rb;
  });
  return groups;
}
