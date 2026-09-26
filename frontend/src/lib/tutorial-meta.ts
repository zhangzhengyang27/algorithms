/**
 * 教程结构化元数据
 * 用于教程页头部面板（复杂度/稳定性/标签/应用场景）与算法卡片页。
 * 仅收录适合展示复杂度的算法/数据结构主题。
 */
export interface TutorialMeta {
  /** 时间复杂度（best/average/worst 缺省时只展示单一 time） */
  time?: { best: string; average: string; worst: string };
  /** 单一时间复杂度（无 best/worst 区分时使用） */
  timeSimple?: string;
  /** 空间复杂度 */
  space?: string;
  /** 是否稳定（仅排序算法有意义；undefined 表示不适用） */
  stable?: boolean;
  /** 特性标签 */
  tags?: string[];
  /** 应用场景 */
  scenarios?: string[];
  /** 前提条件 */
  prerequisites?: string[];
}

export const tutorialMeta: Record<string, TutorialMeta> = {
  // ============= 排序算法 =============
  "bubble-selection-insertion-sort": {
    time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    space: "O(1)",
    stable: true,
    tags: ["原地排序", "稳定排序", "简单直观"],
    scenarios: ["小数据集", "教学演示", "近乎有序的数据"],
    prerequisites: ["数组基础", "时间与空间复杂度"],
  },
  "shell-sort": {
    time: { best: "O(n log n)", average: "O(n^1.3)", worst: "O(n²)" },
    space: "O(1)",
    stable: false,
    tags: ["原地排序", "间隙序列", "插入排序改进"],
    scenarios: ["中等规模数据", "嵌入式等内存受限场景"],
    prerequisites: ["插入排序"],
  },
  "merge-sort": {
    time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    space: "O(n)",
    stable: true,
    tags: ["分治策略", "稳定排序", "空间换时间"],
    scenarios: ["外部排序", "大数据处理", "链表排序", "求逆序对"],
    prerequisites: ["递归", "分治算法"],
  },
  "quick-sort": {
    time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
    space: "O(log n)",
    stable: false,
    tags: ["分治策略", "原地排序", "高效"],
    scenarios: ["通用排序首选", "缓存友好", "Top K（QuickSelect）"],
    prerequisites: ["递归", "分治算法"],
  },
  "heap-sort": {
    time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    space: "O(1)",
    stable: false,
    tags: ["原地排序", "树形结构", "最坏情况良好"],
    scenarios: ["最坏情况性能保证", "Top K", "优先队列"],
    prerequisites: ["堆和优先队列"],
  },
  "sorting-advanced": {
    timeSimple: "O(n + k)",
    space: "O(n + k)",
    stable: true,
    tags: ["非比较排序", "线性时间", "稳定排序"],
    scenarios: ["整数排序", "值域有限", "均匀分布数据"],
    prerequisites: ["哈希表", "计数思想"],
  },

  // ============= 搜索算法 =============
  "linear-search": {
    timeSimple: "O(n)",
    space: "O(1)",
    tags: ["无序可用", "基线算法"],
    scenarios: ["无序数据", "小规模查找", "作为优化基线"],
    prerequisites: ["数组基础"],
  },
  "binary-search": {
    timeSimple: "O(log n)",
    space: "O(1)",
    tags: ["有序前提", "分治", "高效"],
    scenarios: ["有序数组查找", "查找边界", "二分答案"],
    prerequisites: ["数组有序", "时间与空间复杂度"],
  },
  "binary-search-advanced": {
    timeSimple: "O(log n)",
    space: "O(1)",
    tags: ["左闭右开", "边界处理"],
    scenarios: ["第一个/最后一个满足条件的位置", "旋转数组"],
    prerequisites: ["二分查找基础"],
  },
  "binary-search-answer": {
    timeSimple: "O(log V · check)",
    space: "O(1)",
    tags: ["二分答案", "单调性"],
    scenarios: ["最大化最小值", "最小化最大值", "可行性判定"],
    prerequisites: ["二分查找", "贪心 check 函数"],
  },

  // ============= 线性结构 =============
  array: {
    timeSimple: "访问 O(1) / 查找 O(n)",
    space: "O(n)",
    tags: ["连续存储", "随机访问", "缓存友好"],
    scenarios: ["按下标随机访问", "双指针", "前缀和"],
    prerequisites: ["时间与空间复杂度"],
  },
  "linked-list": {
    timeSimple: "访问 O(n) / 插删 O(1)*",
    space: "O(n)",
    tags: ["动态扩容", "插入删除快"],
    scenarios: ["频繁头部插删", "实现栈/队列", "LRU"],
    prerequisites: ["指针/引用"],
  },
  stack: {
    timeSimple: "压入/弹出 O(1)",
    space: "O(n)",
    tags: ["LIFO", "后进先出"],
    scenarios: ["括号匹配", "表达式求值", "单调栈", "DFS"],
    prerequisites: ["数组/链表"],
  },
  queue: {
    timeSimple: "入队/出队 O(1)",
    space: "O(n)",
    tags: ["FIFO", "先进先出"],
    scenarios: ["BFS", "层序遍历", "单调队列", "任务调度"],
    prerequisites: ["数组/链表"],
  },
  "hash-table": {
    timeSimple: "O(1) 均摊",
    space: "O(n)",
    tags: ["O(1) 查找", "哈希函数"],
    scenarios: ["判重", "计数", "两数之和", "缓存定位"],
    prerequisites: ["哈希函数", "数组"],
  },
  heap: {
    timeSimple: "插入/删除 O(log n) / 取极值 O(1)",
    space: "O(n)",
    tags: ["完全二叉树", "极值维护"],
    scenarios: ["Top K", "优先队列", "Dijkstra", "合并 K 链表"],
    prerequisites: ["二叉树", "数组"],
  },

  // ============= 树结构 =============
  "binary-tree": {
    timeSimple: "遍历 O(n)",
    space: "O(h)",
    tags: ["递归结构", "分治"],
    scenarios: ["表达式树", "遍历", "递归问题载体"],
    prerequisites: ["递归", "指针"],
  },
  "binary-search-tree": {
    time: { best: "O(log n)", average: "O(log n)", worst: "O(n)" },
    space: "O(n)",
    tags: ["有序", "中序递增"],
    scenarios: ["动态有序集合", "范围查询"],
    prerequisites: ["二叉树", "递归"],
  },
  "avl-tree": {
    timeSimple: "O(log n)",
    space: "O(n)",
    tags: ["自平衡", "旋转"],
    scenarios: ["严格平衡的有序集合", "数据库索引"],
    prerequisites: ["二分搜索树", "递归"],
  },
  "red-black-tree": {
    timeSimple: "O(log n)",
    space: "O(n)",
    tags: ["弱平衡", "旋转+变色"],
    scenarios: ["语言标准库（TreeMap）", "工程首选平衡树"],
    prerequisites: ["二分搜索树", "AVL 树"],
  },
  trie: {
    timeSimple: "O(L)（L 为串长）",
    space: "O(字符集 × 节点数)",
    tags: ["前缀匹配", "字典序"],
    scenarios: ["自动补全", "拼写检查", "单词搜索 II", "IP 路由"],
    prerequisites: ["树", "哈希表"],
  },
  "b-tree": {
    timeSimple: "O(log n)",
    space: "O(n)",
    tags: ["多路平衡", "磁盘友好"],
    scenarios: ["数据库索引", "文件系统"],
    prerequisites: ["平衡树", "磁盘 I/O"],
  },

  // ============= 高级结构 =============
  "segment-tree": {
    timeSimple: "查询/修改 O(log n)",
    space: "O(n)",
    tags: ["区间操作", "懒标记"],
    scenarios: ["区间求和/最值", "区间修改", "动态统计"],
    prerequisites: ["递归", "二叉树"],
  },
  "binary-indexed-tree": {
    timeSimple: "更新/前缀查询 O(log n)",
    space: "O(n)",
    tags: ["前缀和", "lowbit", "代码短"],
    scenarios: ["前缀和", "逆序对", "单点更新区间查询"],
    prerequisites: ["前缀和", "位运算"],
  },
  "union-find": {
    timeSimple: "近 O(α(n))",
    space: "O(n)",
    tags: ["并查集", "路径压缩", "按秩合并"],
    scenarios: ["动态连通性", "Kruskal", "岛屿问题"],
    prerequisites: ["树", "递归"],
  },
  "lru-cache": {
    timeSimple: "get/put O(1)",
    space: "O(capacity)",
    tags: ["哈希+双向链表", "缓存淘汰"],
    scenarios: ["缓存系统", "页面置换"],
    prerequisites: ["哈希表", "双向链表"],
  },
  "skip-list": {
    timeSimple: "O(log n) 期望",
    space: "O(n)",
    tags: ["概率平衡", "多层链表"],
    scenarios: ["Redis 有序集合", "范围查询"],
    prerequisites: ["链表", "二分查找"],
  },

  // ============= 字符串 =============
  kmp: {
    timeSimple: "O(n + m)",
    space: "O(m)",
    tags: ["前缀函数", "无回溯"],
    scenarios: ["单模式串匹配", "循环节检测"],
    prerequisites: ["字符串基础", "前缀和思想"],
  },
  manacher: {
    timeSimple: "O(n)",
    space: "O(n)",
    tags: ["中心扩展优化", "回文半径"],
    scenarios: ["最长回文子串"],
    prerequisites: ["字符串基础", "中心扩展"],
  },
  "string-hashing": {
    timeSimple: "O(n)",
    space: "O(n)",
    tags: ["滚动哈希", "O(1) 转移"],
    scenarios: ["子串匹配", "最长重复子串", "多模式"],
    prerequisites: ["哈希表", "前缀和"],
  },
  "suffix-array": {
    timeSimple: "构建 O(n log n)",
    space: "O(n)",
    tags: ["后缀排序", "height 数组"],
    scenarios: ["最长重复子串", "子串统计"],
    prerequisites: ["排序", "字符串哈希"],
  },
  "aho-corasick": {
    timeSimple: "O(n + Σm)",
    space: "O(Σm)",
    tags: ["Trie+KMP", "fail 指针"],
    scenarios: ["多模式串匹配", "敏感词过滤"],
    prerequisites: ["Trie", "KMP"],
  },

  // ============= 算法思想 =============
  recursion: {
    timeSimple: "视问题而定",
    space: "O(递归深度)",
    tags: ["自调用", "调用栈"],
    scenarios: ["树遍历", "分治", "回溯"],
    prerequisites: ["函数", "栈"],
  },
  "dynamic-programming": {
    timeSimple: "O(状态数 × 转移)",
    space: "O(状态数)",
    tags: ["最优子结构", "重叠子问题"],
    scenarios: ["最优化", "计数", "可行性判定"],
    prerequisites: ["递归", "记忆化"],
  },
  greedy: {
    timeSimple: "O(n log n) 常见",
    space: "O(1)",
    tags: ["局部最优", "贪心选择性质"],
    scenarios: ["区间调度", "Huffman", "Dijkstra"],
    prerequisites: ["排序", "优先队列"],
  },
  backtracking: {
    timeSimple: "O(解空间大小)",
    space: "O(递归深度)",
    tags: ["DFS", "剪枝"],
    scenarios: ["排列组合", "N 皇后", "数独"],
    prerequisites: ["递归", "DFS"],
  },
  "two-pointers": {
    timeSimple: "O(n)",
    space: "O(1)",
    tags: ["对撞指针", "快慢指针"],
    scenarios: ["有序数组", "原地操作", "回文判断"],
    prerequisites: ["数组", "排序"],
  },
  "sliding-window": {
    timeSimple: "O(n)",
    space: "O(k)",
    tags: ["双指针变体", "窗口维护"],
    scenarios: ["子串/子数组问题", "最长无重复"],
    prerequisites: ["双指针", "哈希表"],
  },
  "prefix-sum": {
    timeSimple: "预处理 O(n) / 查询 O(1)",
    space: "O(n)",
    tags: ["前缀和", "差分"],
    scenarios: ["区间和查询", "差分数组"],
    prerequisites: ["数组"],
  },
  "bit-manipulation": {
    timeSimple: "O(1) 单位运算",
    space: "O(1)",
    tags: ["位运算", "状态压缩"],
    scenarios: ["快速幂", "状压 DP", "去重"],
    prerequisites: ["二进制"],
  },

  // ============= 图论 =============
  "graph-algorithms": {
    timeSimple: "O(V + E)",
    space: "O(V)",
    tags: ["BFS", "DFS"],
    scenarios: ["连通性", "层序", "拓扑", "路径搜索"],
    prerequisites: ["队列", "栈", "递归"],
  },
  "shortest-path": {
    timeSimple: "Dijkstra O(E log V)",
    space: "O(V)",
    tags: ["Dijkstra", "Bellman-Ford", "Floyd"],
    scenarios: ["导航", "网络路由"],
    prerequisites: ["图遍历", "堆", "贪心"],
  },
  "topological-sort": {
    timeSimple: "O(V + E)",
    space: "O(V)",
    tags: ["DAG", "Kahn", "DFS"],
    scenarios: ["任务依赖", "编译顺序", "课程表"],
    prerequisites: ["图遍历", "队列"],
  },
  "minimum-spanning-tree": {
    timeSimple: "Kruskal O(E log E)",
    space: "O(V)",
    tags: ["Kruskal", "Prim"],
    scenarios: ["网络铺设", "聚类"],
    prerequisites: ["并查集", "贪心", "堆"],
  },
};
