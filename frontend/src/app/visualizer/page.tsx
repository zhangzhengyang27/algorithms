import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

const visualizations = [
  {
    title: '排序算法',
    description: '冒泡、选择、插入、快排、归并、堆排',
    href: '/visualizer/sorting',
    tag: '6 种算法',
  },
  {
    title: '搜索算法',
    description: '二分查找、BFS、DFS',
    href: '/visualizer/searching',
    tag: '3 种算法',
  },
  {
    title: '八数码 8-Puzzle',
    description: 'BFS 状态空间搜索求最短还原路径',
    href: '/visualizer/eight-puzzle',
    tag: '高级搜索',
  },
  {
    title: '十五数码 15-Puzzle',
    description: 'IDA* + 曼哈顿距离求解，16! 状态空间',
    href: '/visualizer/fifteen-puzzle',
    tag: '高级搜索',
  },
  {
    title: '树结构',
    description: '二叉树遍历（前序、中序、后序）',
    href: '/visualizer/trees',
    tag: '遍历',
  },
  {
    title: '图结构',
    description: 'BFS 广度优先、DFS 深度优先',
    href: '/visualizer/graphs',
    tag: '遍历',
  },
  {
    title: '栈 Stack',
    description: 'LIFO 入栈 / 出栈，演示递归调用栈',
    href: '/visualizer/stack',
    tag: 'LIFO',
  },
  {
    title: '队列 Queue',
    description: 'FIFO 入队 / 出队，BFS 基础',
    href: '/visualizer/queue',
    tag: 'FIFO',
  },
  {
    title: '链表 Linked List',
    description: '头插 / 遍历 / 删除 / 反转',
    href: '/visualizer/linked-list',
    tag: '指针',
  },
  {
    title: '哈希表 Hash Table',
    description: '链地址法演示冲突处理',
    href: '/visualizer/hash-table',
    tag: 'O(1)',
  },
  {
    title: '单调栈 Monotonic Stack',
    description: '下一个更大元素：栈维护单调递增',
    href: '/visualizer/monotonic-stack',
    tag: '进阶',
  },
  {
    title: '滑动窗口 Sliding Window',
    description: '最长无重复子串：双指针扩窗 + 收缩',
    href: '/visualizer/sliding-window',
    tag: '双指针',
  },
  {
    title: '双指针 Two Pointers',
    description: '排序数组两数之和：左右指针相向而行',
    href: '/visualizer/two-pointers',
    tag: 'O(n)',
  },
  {
    title: '二叉搜索树 BST',
    description: '逐步插入构建 BST，演示搜索路径',
    href: '/visualizer/bst',
    tag: 'O(log n)',
  },
  {
    title: '堆 Heap',
    description: '最大堆插入上浮 / 提取下沉全过程',
    href: '/visualizer/heap',
    tag: '优先队列',
  },
  {
    title: '动态规划 DP',
    description: '0/1 背包：逐步填充 DP 表，状态转移',
    href: '/visualizer/dp',
    tag: '表格',
  },
  {
    title: '回溯 Backtracking',
    description: '全排列：选择 → 递归 → 撤销选择',
    href: '/visualizer/backtracking',
    tag: 'DFS',
  },
  {
    title: '递归 Recursion',
    description: '阶乘 / 斐波那契调用栈展开与回溯',
    href: '/visualizer/recursion',
    tag: '调用栈',
  },
  {
    title: '前缀树 Trie',
    description: '逐字符插入单词，观察前缀共享',
    href: '/visualizer/trie',
    tag: '字符串',
  },
  {
    title: '并查集 Union-Find',
    description: '按秩合并 + 路径查找，集合连通',
    href: '/visualizer/union-find',
    tag: '连通',
  },
  {
    title: '拓扑排序 Topo Sort',
    description: 'Kahn BFS：逐步移除入度为 0 的节点',
    href: '/visualizer/topological-sort',
    tag: 'DAG',
  },
  {
    title: '最短路 Dijkstra',
    description: '贪心选最近节点，逐步松弛确定最短距',
    href: '/visualizer/dijkstra',
    tag: '图论',
  },
  {
    title: '二分查找 Binary Search',
    description: '逐步缩半搜索范围，L/M/R 指针移动',
    href: '/visualizer/binary-search',
    tag: 'O(log n)',
  },
  {
    title: '前缀和 Prefix Sum',
    description: 'O(n) 构建，O(1) 区间求和',
    href: '/visualizer/prefix-sum',
    tag: '预处理',
  },
  {
    title: '位运算 Bit',
    description: 'AND/OR/XOR/NOT/移位逐位演示',
    href: '/visualizer/bit-manipulation',
    tag: '二进制',
  },
  {
    title: '贪心 Greedy',
    description: '区间调度：按结束时间贪心选最多活动',
    href: '/visualizer/greedy',
    tag: '区间',
  },
  {
    title: '线段树 Segment Tree',
    description: '递归构建区间树，区间求和查询',
    href: '/visualizer/segment-tree',
    tag: '区间',
  },
  {
    title: 'AVL 树旋转',
    description: '插入失衡检测 + LL/RR/LR/RL 旋转',
    href: '/visualizer/avl-tree',
    tag: '平衡',
  },
  {
    title: 'KMP 字符串匹配',
    description: '构建 next 数组，失配回退高效匹配',
    href: '/visualizer/kmp',
    tag: '字符串',
  },
  {
    title: 'LRU 缓存',
    description: '哈希 + 双向链表，淘汰最久未用',
    href: '/visualizer/lru-cache',
    tag: '设计',
  },
  {
    title: '单调队列 Mono Queue',
    description: '滑动窗口最大值：单调递减双端队列',
    href: '/visualizer/monotonic-queue',
    tag: '窗口',
  },
  {
    title: '最小生成树 Kruskal',
    description: '按权排序 + 并查集判环构建 MST',
    href: '/visualizer/kruskal',
    tag: '图论',
  },
  {
    title: 'Bellman-Ford',
    description: '逐轮松弛所有边，支持负权最短路',
    href: '/visualizer/bellman-ford',
    tag: '负权',
  },
  {
    title: '归并排序 Merge Sort',
    description: '分治：递归分割 + 逐步合并有序子数组',
    href: '/visualizer/merge-sort',
    tag: '分治',
  },
  {
    title: '快速排序 Quick Sort',
    description: '分治 + 基准分区：左右指针交换就位',
    href: '/visualizer/quick-sort',
    tag: '排序',
  },
  {
    title: '堆排序 Heap Sort',
    description: '建大顶堆，反复交换堆顶与末尾下沉',
    href: '/visualizer/heap-sort',
    tag: '排序',
  },
  {
    title: '计数排序 Counting Sort',
    description: '线性排序：统计计数 + 前缀和定位输出',
    href: '/visualizer/counting-sort',
    tag: '线性',
  },
  {
    title: '树状数组 BIT',
    description: 'lowbit 跳跃更新 / 前缀和查询，区间覆盖示意',
    href: '/visualizer/binary-indexed-tree',
    tag: '区间',
  },
  {
    title: '最长递增子序列 LIS',
    description: 'O(n²) DP 填表，比较转移 + 回溯子序列',
    href: '/visualizer/lis',
    tag: 'DP',
  },
  {
    title: '最长公共子序列 LCS',
    description: '二维 DP 表逐格填充，字符匹配回溯路径',
    href: '/visualizer/lcs',
    tag: 'DP',
  },
  {
    title: '红黑树 Red-Black Tree',
    description: '插入着色 + 旋转调整，维护五条性质',
    href: '/visualizer/red-black-tree',
    tag: '平衡',
  },
  {
    title: '跳表 Skip List',
    description: '多层索引逐层下降查找，概率化插入',
    href: '/visualizer/skip-list',
    tag: 'O(log n)',
  },
  {
    title: 'Manacher 回文',
    description: '回文半径数组 p[]，中心扩展 + 镜像复用',
    href: '/visualizer/manacher',
    tag: '字符串',
  },
  {
    title: '字符串哈希',
    description: '多项式滚动哈希，O(1) 子串比较匹配',
    href: '/visualizer/string-hashing',
    tag: '字符串',
  },
  {
    title: 'Tarjan 强连通分量',
    description: 'DFS 计算 dfn/low，栈操作识别 SCC',
    href: '/visualizer/tarjan-scc',
    tag: '图论',
  },
  {
    title: '区间 DP',
    description: '石子合并：枚举区间长度与分割点填表',
    href: '/visualizer/dp-interval',
    tag: 'DP',
  },
  {
    title: '数位 DP',
    description: '数位分解 + 记忆化搜索，受限/自由状态',
    href: '/visualizer/dp-digit',
    tag: 'DP',
  },
  {
    title: '状压 DP',
    description: 'TSP 旅行商：二进制集合状态转移',
    href: '/visualizer/dp-state-compression',
    tag: 'DP',
  },
  {
    title: '树形 DP',
    description: '没有上司的舞会：后序遍历选/不选决策',
    href: '/visualizer/dp-tree',
    tag: 'DP',
  },
  {
    title: '集合与映射 Set/Map',
    description: 'Set 去重增删查 + Map 键值对哈希分布',
    href: '/visualizer/set-and-map',
    tag: 'O(1)',
  },
  {
    title: '希尔排序 Shell Sort',
    description: '递减增量分组插入，逐步逼近有序',
    href: '/visualizer/shell-sort',
    tag: '排序',
  },
  {
    title: '欧拉路径',
    description: 'Hierholzer 算法：DFS 走边回溯入栈成回路',
    href: '/visualizer/eulerian-path',
    tag: '图论',
  },
  {
    title: '二分图',
    description: '染色法判定 + 匈牙利算法增广求最大匹配',
    href: '/visualizer/bipartite-graph',
    tag: '图论',
  },
  {
    title: '网络流',
    description: 'Edmonds-Karp 增广路，残量网络求最大流',
    href: '/visualizer/network-flow',
    tag: '图论',
  },
  {
    title: 'Floyd-Warshall',
    description: '多源最短路：以 k 为中转更新所有 i→j',
    href: '/visualizer/floyd-warshall',
    tag: '图论',
  },
  {
    title: 'Prim 最小生成树',
    description: '贪心选 key 最小节点加入 MST，逐边松弛',
    href: '/visualizer/prim',
    tag: '图论',
  },
  {
    title: '矩阵快速幂',
    description: '斐波那契矩阵化 + 二进制分解加速幂',
    href: '/visualizer/matrix-exponentiation',
    tag: '数学',
  },
  {
    title: '高斯消元',
    description: '增广矩阵行变换：选主元、消元、回代',
    href: '/visualizer/gaussian-elimination',
    tag: '数学',
  },
  {
    title: '分块',
    description: 'sqrt 分块：整块懒标记 + 零散块暴力',
    href: '/visualizer/sqrt-decomposition',
    tag: '区间',
  },
  {
    title: '扫描线',
    description: '矩形面积并：扫描线移动 + 事件点处理',
    href: '/visualizer/sweep-line',
    tag: '几何',
  },
  {
    title: '记忆化搜索',
    description: '朴素递归 vs 记忆化剪枝，memo 表填充',
    href: '/visualizer/memoization',
    tag: 'DP',
  },
  {
    title: '分治',
    description: '归并排序求逆序对：分解、解决、合并',
    href: '/visualizer/divide-and-conquer',
    tag: '分治',
  },
  {
    title: '数组基础',
    description: '连续内存随机访问，插入删除元素移动',
    href: '/visualizer/array',
    tag: '基础',
  },
  {
    title: 'B 树',
    description: '多路平衡查找树：插入与节点分裂上移',
    href: '/visualizer/b-tree',
    tag: '数据库',
  },
  {
    title: 'AC 自动机',
    description: 'Trie + fail 指针，多模式串一次匹配',
    href: '/visualizer/aho-corasick',
    tag: '字符串',
  },
  {
    title: '后缀数组',
    description: '倍增法构建 sa/rank/height 数组',
    href: '/visualizer/suffix-array',
    tag: '字符串',
  },
  {
    title: '数论基础',
    description: '快速幂、辗转相除 gcd、埃氏筛素数',
    href: '/visualizer/number-theory',
    tag: '数学',
  },
  {
    title: '组合数学',
    description: '杨辉三角递推组合数 + 全排列生成',
    href: '/visualizer/combinatorics',
    tag: '数学',
  },
  {
    title: '博弈论',
    description: 'Nim 游戏：SG 函数与异或和必胜判定',
    href: '/visualizer/game-theory',
    tag: '数学',
  },
  {
    title: '扩展欧几里得',
    description: '递归回溯推导贝祖系数 x/y，ax+by=gcd',
    href: '/visualizer/extended-gcd',
    tag: '数学',
  },
  {
    title: '中国剩余定理',
    description: 'CRT 求解同余方程组：逆元与逐项合并',
    href: '/visualizer/chinese-remainder-theorem',
    tag: '数学',
  },
  {
    title: '二分答案',
    description: '木材切割：check 验证 + 答案区间收缩',
    href: '/visualizer/binary-search-answer',
    tag: '二分',
  },
  {
    title: '坐标离散化',
    description: '排序去重 + 二分映射，大值域压缩',
    href: '/visualizer/coordinate-compression',
    tag: '技巧',
  },
  {
    title: '差分约束',
    description: '约束转建边，Bellman-Ford 求可行解判负环',
    href: '/visualizer/difference-constraints',
    tag: '图论',
  },
  {
    title: '2-SAT',
    description: '蕴含图 + Tarjan 缩点，拓扑序赋值判可满足',
    href: '/visualizer/two-sat',
    tag: '图论',
  },
  {
    title: '状态机 DP',
    description: '股票含冷冻期：状态转移图 + 逐天填表',
    href: '/visualizer/dp-state-machine',
    tag: 'DP',
  },
  {
    title: '倍增 LCA',
    description: '预处理祖先表 fa[u][k]，二进制跳跃求公共祖先',
    href: '/visualizer/binary-lifting',
    tag: '树',
  },
  {
    title: '树的直径与重心',
    description: '两次 BFS 求直径，DFS 求重心最小化最大子树',
    href: '/visualizer/tree-diameter-centroid',
    tag: '树',
  },
  {
    title: '树链剖分',
    description: '重儿子划分重链 + dfs 序，路径查询沿链跳跃',
    href: '/visualizer/heavy-light-decomposition',
    tag: '树',
  },
  {
    title: '主席树',
    description: '可持久化线段树：路径复制共享子树，查询第 k 小',
    href: '/visualizer/persistent-segment-tree',
    tag: '区间',
  },
  {
    title: '线段树进阶',
    description: '懒标记区间修改，查询按需下推传播',
    href: '/visualizer/segment-tree-advanced',
    tag: '区间',
  },
  {
    title: '并查集进阶',
    description: '带权并查集：维护到根距离，路径压缩更新权值',
    href: '/visualizer/union-find-advanced',
    tag: '连通',
  },
  {
    title: 'CDQ 分治',
    description: '三维偏序：分治归并 + 树状数组统计贡献',
    href: '/visualizer/cdq-divide-conquer',
    tag: '分治',
  },
  {
    title: '时间复杂度',
    description: '六种复杂度增长曲线对比 + 耗时估算',
    href: '/visualizer/time-complexity',
    tag: '基础',
  },
  {
    title: '字符串基础',
    description: '遍历/反转/回文判断/子串查找/字符统计',
    href: '/visualizer/string',
    tag: '基础',
  },
  {
    title: '线性查找',
    description: '顺序逐个比较，命中返回 / 失败遍历全部',
    href: '/visualizer/linear-search',
    tag: '基础',
  },
  {
    title: '图的存储与遍历',
    description: '邻接矩阵/邻接表双存储 + BFS/DFS 过程联动',
    href: '/visualizer/graph-storage-traversal',
    tag: '图论',
  },
  {
    title: '哈希冲突',
    description: '线性探测/链地址/再哈希三种冲突解决对比',
    href: '/visualizer/hash-collision',
    tag: 'O(1)',
  },
  {
    title: '链表经典问题',
    description: 'Floyd 判环、合并有序链表、删倒数第 k 个',
    href: '/visualizer/linked-list-problems',
    tag: '指针',
  },
  {
    title: '计算几何',
    description: 'Andrew 单调链求凸包：叉积转向判断',
    href: '/visualizer/computational-geometry',
    tag: '几何',
  },
  {
    title: '数据结构设计',
    description: '循环队列：数组 + 双指针取模与边界判断',
    href: '/visualizer/design-data-structures',
    tag: '设计',
  },
  {
    title: '优先队列进阶',
    description: 'TopK 问题：小顶堆维护 K 个最大元素',
    href: '/visualizer/priority-queue-advanced',
    tag: '堆',
  },
  {
    title: '单调栈进阶',
    description: '柱状图最大矩形：弹出时确定宽度算面积',
    href: '/visualizer/monotonic-stack-advanced',
    tag: '进阶',
  },
  {
    title: '背包 DP',
    description: '0/1/完全/多重背包：正倒序遍历差异对比',
    href: '/visualizer/dp-knapsack',
    tag: 'DP',
  },
  {
    title: '高级二分',
    description: '左右边界写法对比，查第一个/最后一个目标',
    href: '/visualizer/binary-search-advanced',
    tag: '二分',
  },
  {
    title: '排序进阶',
    description: '计数/桶/基数三种线性排序：分配与收集',
    href: '/visualizer/sorting-advanced',
    tag: '排序',
  },
  {
    title: 'N 皇后',
    description: '回溯逐行尝试放置皇后，冲突则回溯撤销',
    href: '/visualizer/n-queens',
    tag: '回溯',
  },
  {
    title: '汉诺塔',
    description: '递归分治：将整塔从 A 柱移到 C 柱',
    href: '/visualizer/hanoi-tower',
    tag: '递归',
  },
  {
    title: '接雨水',
    description: '动态规划：左右最高取较小值计算每柱接水量',
    href: '/visualizer/rain-terraces',
    tag: 'DP',
  },
  {
    title: '编辑距离',
    description: 'DP 填表：增/删/改将串 A 变为串 B 的最少操作',
    href: '/visualizer/edit-distance',
    tag: 'DP',
  },
  {
    title: '打家劫舍',
    description: '动态规划：相邻不可同抢，状态 DP 求最大金额',
    href: '/visualizer/house-robber',
    tag: 'DP',
  },
  {
    title: '跳跃游戏',
    description: '贪心：从右向左维护最左可达目标判定能否到达末尾',
    href: '/visualizer/jump-game',
    tag: '贪心',
  },
  {
    title: '0/1 背包',
    description: '动态规划：二维 dp 表求限定容量下的最大价值',
    href: '/visualizer/knapsack',
    tag: 'DP',
  },
  {
    title: '凯撒密码',
    description: '古典密码：字母按固定移位数循环替换',
    href: '/visualizer/caesar-cipher',
    tag: '密码学',
  },
  {
    title: '买卖股票最佳时机',
    description: '动态规划：同时维护持币成本与最大利润',
    href: '/visualizer/best-time',
    tag: 'DP',
  },
  {
    title: '不同路径',
    description: '动态规划：网格中只能向右/向下的路径总数',
    href: '/visualizer/unique-paths',
    tag: 'DP',
  },
  {
    title: '最大子数组',
    description: 'Kadane 算法：求连续子段的最大和',
    href: '/visualizer/maximum-subarray',
    tag: 'DP',
  },
  {
    title: '栅栏密码',
    description: '古典密码：明文按之字形写在多条轨道',
    href: '/visualizer/rail-fence',
    tag: '密码学',
  },
  {
    title: '矩阵旋转',
    description: '先转置再逐行翻转，原地顺时针旋转 90°',
    href: '/visualizer/matrix-rotation',
    tag: '数组',
  },
  {
    title: '骑士巡游',
    description: '回溯：日字走法走遍棋盘每个格子',
    href: '/visualizer/knight-tour',
    tag: '回溯',
  },
  {
    title: '幂集',
    description: '回溯：生成集合的全部子集（含空集）',
    href: '/visualizer/power-set',
    tag: '组合',
  },
  {
    title: '爬楼梯',
    description: '动态规划：每次 1 或 2 步的方法数',
    href: '/visualizer/staircase',
    tag: 'DP',
  },
  {
    title: '组合求和',
    description: '回溯：可重复选数凑出目标和的全部组合',
    href: '/visualizer/combination-sum',
    tag: '回溯',
  },
  {
    title: '希尔密码',
    description: '古典密码：明文乘密钥矩阵后 mod 26',
    href: '/visualizer/hill-cipher',
    tag: '密码学',
  },
  {
    title: '多项式滚动哈希',
    description: 'Rabin-Karp 核心：h = (h*base + code) % mod',
    href: '/visualizer/polynomial-hash',
    tag: '字符串',
  },
  {
    title: '加权随机',
    description: '统计：按累计权重随机抽取，权重越大概率越高',
    href: '/visualizer/weighted-random',
    tag: '统计',
  },
  {
    title: 'K-Means 聚类',
    description: '机器学习：分配最近质心 → 均值更新，迭代收敛',
    href: '/visualizer/kmeans',
    tag: 'ML',
  },
  {
    title: 'K 近邻',
    description: '机器学习：最近 k 个邻居多数投票分类',
    href: '/visualizer/knn',
    tag: 'ML',
  },
  {
    title: '全排列',
    description: '回溯：生成元素的全部排列顺序',
    href: '/visualizer/permutations',
    tag: '组合',
  },
  {
    title: '组合',
    description: '回溯：从集合取指定长度的不重复无序组合',
    href: '/visualizer/combinations',
    tag: '组合',
  },
  {
    title: 'Fisher-Yates 洗牌',
    description: '均匀洗牌：从后往前与随机位置交换',
    href: '/visualizer/fisher-yates',
    tag: '统计',
  },
  {
    title: '最长递增子序列',
    description: '动态规划：以每个位置结尾的 LIS 长度',
    href: '/visualizer/lis',
    tag: 'DP',
  },
  {
    title: '笛卡尔积',
    description: '集合：A × B 的全部有序对',
    href: '/visualizer/cartesian-product',
    tag: '集合',
  },
  {
    title: '布隆过滤器 Bloom Filter',
    description: '概率数据结构：多哈希置位，查询有误判可能',
    href: '/visualizer/bloom-filter',
    tag: '概率',
  },
];

export default function VisualizerPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="mb-8 anim-fade-up">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">算法可视化</h1>
        <p className="text-ink-2 text-sm">
          {visualizations.length} 个交互模块 · 拖动、步进、回放，亲眼看清每一步
        </p>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {visualizations.map((viz, idx) => (
          <Link
            key={viz.href}
            href={viz.href}
            className="group relative p-5 glass-card rounded-lg hover:border-brand/40 transition-all hover:-translate-y-1 anim-fade-up"
            style={{ animationDelay: `${idx * 0.04}s` }}
          >
            {/* Index + tag */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] text-ink-3">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-[10px] text-brand bg-brand-soft px-1.5 py-0.5 rounded">
                {viz.tag}
              </span>
            </div>

            <h3 className="font-display text-base font-semibold mb-1.5 group-hover:text-brand transition-colors">
              {viz.title}
            </h3>
            <p className="text-ink-3 text-xs leading-relaxed mb-4">{viz.description}</p>

            {/* Hover CTA */}
            <div className="flex items-center gap-1.5 text-xs text-ink-3 group-hover:text-brand transition-colors">
              <Play size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              <span>运行</span>
              <ArrowRight
                size={12}
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              />
            </div>

            {/* Corner accent on hover */}
            <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand/40" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
