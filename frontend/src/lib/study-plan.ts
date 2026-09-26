/**
 * 题单 / 学习计划数据（题单维度，区别于教程维度的 roadmap）。
 * 参考 NeetCode Roadmap / LeetCode 学习计划：按知识图谱节点组织具体题目，
 * 每个节点显示完成度。题目 slug 对应 /problems/[slug]。
 */
export type PlanDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface PlanProblem {
  slug: string;
  title: string;
  difficulty: PlanDifficulty;
}

export interface PlanNode {
  id: string;
  title: string;
  /** 关联教程，便于「题单 ↔ 讲解」联动 */
  tutorial?: string;
  /** 关联可视化 */
  visualizer?: string;
  problems: PlanProblem[];
}

export interface PlanSection {
  id: string;
  title: string;
  description: string;
  nodes: PlanNode[];
}

export const STUDY_PLAN: PlanSection[] = [
  {
    id: 'linear',
    title: '线性结构',
    description: '数组、链表、栈、队列与哈希表——一切数据结构的基石',
    nodes: [
      {
        id: 'array-hash',
        title: '数组与哈希',
        tutorial: 'hash-table',
        visualizer: 'hash-table',
        problems: [
          { slug: 'two-sum', title: '两数之和', difficulty: 'EASY' },
          { slug: 'intersection-of-arrays', title: '两个数组的交集', difficulty: 'EASY' },
          { slug: 'maximum-subarray', title: '最大子数组和', difficulty: 'MEDIUM' },
        ],
      },
      {
        id: 'two-pointers',
        title: '双指针',
        tutorial: 'two-pointers',
        visualizer: 'two-pointers',
        problems: [
          { slug: 'merge-sorted-array', title: '合并两个有序数组', difficulty: 'EASY' },
          { slug: '3sum', title: '三数之和', difficulty: 'MEDIUM' },
          { slug: 'container-with-most-water', title: '盛最多水的容器', difficulty: 'MEDIUM' },
        ],
      },
      {
        id: 'sliding-window',
        title: '滑动窗口',
        tutorial: 'sliding-window',
        visualizer: 'sliding-window',
        problems: [
          { slug: 'longest-substring-without-repeating', title: '无重复字符的最长子串', difficulty: 'MEDIUM' },
          { slug: 'best-time-to-buy-and-sell-stock', title: '买卖股票的最佳时机', difficulty: 'EASY' },
        ],
      },
      {
        id: 'linked-list',
        title: '链表',
        tutorial: 'linked-list',
        visualizer: 'linked-list',
        problems: [
          { slug: 'reverse-linked-list', title: '反转链表', difficulty: 'EASY' },
          { slug: 'remove-linked-list-elements', title: '移除链表元素', difficulty: 'EASY' },
          { slug: 'linked-list-cycle', title: '环形链表', difficulty: 'EASY' },
          { slug: 'merge-two-sorted-lists', title: '合并两个有序链表', difficulty: 'EASY' },
        ],
      },
      {
        id: 'stack',
        title: '栈',
        tutorial: 'stack',
        visualizer: 'stack',
        problems: [
          { slug: 'valid-parentheses', title: '有效的括号', difficulty: 'EASY' },
          { slug: 'min-stack', title: '最小栈', difficulty: 'MEDIUM' },
        ],
      },
    ],
  },
  {
    id: 'search-sort',
    title: '搜索与排序',
    description: '二分查找、排序算法与分治思想',
    nodes: [
      {
        id: 'binary-search',
        title: '二分查找',
        tutorial: 'binary-search',
        visualizer: 'binary-search',
        problems: [
          { slug: 'binary-search', title: '二分查找', difficulty: 'EASY' },
          { slug: 'search-insert-position', title: '搜索插入位置', difficulty: 'EASY' },
          { slug: 'find-first-and-last-position', title: '查找元素的首尾位置', difficulty: 'MEDIUM' },
        ],
      },
      {
        id: 'sorting',
        title: '排序与分治',
        tutorial: 'quick-sort',
        visualizer: 'sorting',
        problems: [
          { slug: 'merge-sorted-array', title: '合并两个有序数组', difficulty: 'EASY' },
          { slug: 'smallest-k-numbers', title: '最小的 k 个数', difficulty: 'MEDIUM' },
          { slug: 'reverse-pairs', title: '翻转对', difficulty: 'HARD' },
        ],
      },
    ],
  },
  {
    id: 'tree-graph',
    title: '树与图',
    description: '二叉树遍历、BFS/DFS 与网格搜索',
    nodes: [
      {
        id: 'binary-tree',
        title: '二叉树',
        tutorial: 'binary-tree',
        visualizer: 'trees',
        problems: [
          { slug: 'invert-binary-tree', title: '翻转二叉树', difficulty: 'EASY' },
          { slug: 'maximum-depth-of-binary-tree', title: '二叉树的最大深度', difficulty: 'EASY' },
          { slug: 'same-tree', title: '相同的树', difficulty: 'EASY' },
        ],
      },
      {
        id: 'bst',
        title: '二叉搜索树',
        tutorial: 'binary-search-tree',
        visualizer: 'bst',
        problems: [
          { slug: 'validate-binary-search-tree', title: '验证二叉搜索树', difficulty: 'MEDIUM' },
          { slug: 'lowest-common-ancestor', title: '最近公共祖先', difficulty: 'MEDIUM' },
        ],
      },
      {
        id: 'graph',
        title: '图与网格搜索',
        tutorial: 'grid-search',
        visualizer: 'graphs',
        problems: [
          { slug: 'number-of-islands', title: '岛屿数量', difficulty: 'MEDIUM' },
          { slug: 'course-schedule', title: '课程表', difficulty: 'MEDIUM' },
          { slug: 'clone-graph', title: '克隆图', difficulty: 'MEDIUM' },
        ],
      },
    ],
  },
  {
    id: 'advanced',
    title: '进阶算法思想',
    description: '回溯、动态规划、贪心与堆——面试高频核心',
    nodes: [
      {
        id: 'backtracking',
        title: '回溯',
        tutorial: 'backtracking',
        visualizer: 'backtracking',
        problems: [
          { slug: 'permutations', title: '全排列', difficulty: 'MEDIUM' },
          { slug: 'subsets', title: '子集', difficulty: 'MEDIUM' },
          { slug: 'combination-sum', title: '组合总和', difficulty: 'MEDIUM' },
        ],
      },
      {
        id: 'dp',
        title: '动态规划',
        tutorial: 'dynamic-programming',
        visualizer: 'dp',
        problems: [
          { slug: 'climbing-stairs', title: '爬楼梯', difficulty: 'EASY' },
          { slug: 'house-robber', title: '打家劫舍', difficulty: 'MEDIUM' },
          { slug: 'coin-change', title: '零钱兑换', difficulty: 'MEDIUM' },
          { slug: 'longest-common-subsequence', title: '最长公共子序列', difficulty: 'MEDIUM' },
          { slug: 'longest-increasing-subsequence', title: '最长递增子序列', difficulty: 'MEDIUM' },
        ],
      },
      {
        id: 'greedy-heap',
        title: '贪心与堆',
        tutorial: 'heap',
        visualizer: 'heap',
        problems: [
          { slug: 'top-k-frequent', title: '前 K 个高频元素', difficulty: 'MEDIUM' },
          { slug: 'smallest-k-numbers', title: '最小的 k 个数', difficulty: 'MEDIUM' },
          { slug: 'jump-game', title: '跳跃游戏', difficulty: 'MEDIUM' },
        ],
      },
    ],
  },
  {
    id: 'lcof',
    title: '剑指 Offer 精选',
    description: '《剑指 Offer（第 2 版）》高频面试题，覆盖数组、链表、树、字符串与数学',
    nodes: [
      {
        id: 'lcof-array',
        title: '数组与查找',
        problems: [
          { slug: 'shu-zu-zhong-zhong-fu-de-shu-zi-lcof', title: '寻找文件副本', difficulty: 'EASY' },
          { slug: 'er-wei-shu-zu-zhong-de-cha-zhao-lcof', title: '寻找目标值 - 二维数组', difficulty: 'MEDIUM' },
          { slug: 'xuan-zhuan-shu-zu-de-zui-xiao-shu-zi-lcof', title: '库存管理 I', difficulty: 'EASY' },
          { slug: 'zai-pai-xu-shu-zu-zhong-cha-zhao-shu-zi-lcof', title: '统计目标成绩的出现次数', difficulty: 'EASY' },
          { slug: 'shun-shi-zhen-da-yin-ju-zhen-lcof', title: '螺旋遍历二维数组', difficulty: 'EASY' },
          { slug: 'diao-zheng-shu-zu-shun-xu-shi-qi-shu-wei-yu-ou-shu-qian-mian-lcof', title: '训练计划 I', difficulty: 'EASY' },
          { slug: 'lian-xu-zi-shu-zu-de-zui-da-he-lcof', title: '连续天数的最高销售额', difficulty: 'EASY' },
          { slug: 'zui-xiao-de-kge-shu-lcof', title: '库存管理 III', difficulty: 'EASY' },
          { slug: 'shu-zu-zhong-de-ni-xu-dui-lcof', title: '交易逆序对的总数', difficulty: 'HARD' },
        ],
      },
      {
        id: 'lcof-linked-list',
        title: '链表',
        problems: [
          { slug: 'cong-wei-dao-tou-da-yin-lian-biao-lcof', title: '图书整理 I', difficulty: 'EASY' },
          { slug: 'shan-chu-lian-biao-de-jie-dian-lcof', title: '删除链表的节点', difficulty: 'EASY' },
          { slug: 'lian-biao-zhong-dao-shu-di-kge-jie-dian-lcof', title: '训练计划 II', difficulty: 'EASY' },
          { slug: 'fan-zhuan-lian-biao-lcof', title: '训练计划 III', difficulty: 'EASY' },
          { slug: 'he-bing-liang-ge-pai-xu-de-lian-biao-lcof', title: '训练计划 IV', difficulty: 'EASY' },
          { slug: 'liang-ge-lian-biao-de-di-yi-ge-gong-gong-jie-dian-lcof', title: '训练计划 V', difficulty: 'EASY' },
          { slug: 'fu-za-lian-biao-de-fu-zhi-lcof', title: '复杂链表的复制', difficulty: 'MEDIUM' },
        ],
      },
      {
        id: 'lcof-tree',
        title: '二叉树',
        problems: [
          { slug: 'er-cha-shu-de-shen-du-lcof', title: '计算二叉树的深度', difficulty: 'EASY' },
          { slug: 'er-cha-shu-de-jing-xiang-lcof', title: '翻转二叉树', difficulty: 'EASY' },
          { slug: 'dui-cheng-de-er-cha-shu-lcof', title: '判断对称二叉树', difficulty: 'EASY' },
          { slug: 'ping-heng-er-cha-shu-lcof', title: '判断是否为平衡二叉树', difficulty: 'EASY' },
          { slug: 'cong-shang-dao-xia-da-yin-er-cha-shu-lcof', title: '彩灯装饰记录 I', difficulty: 'MEDIUM' },
          { slug: 'zhong-jian-er-cha-shu-lcof', title: '推理二叉树', difficulty: 'MEDIUM' },
          { slug: 'er-cha-sou-suo-shu-de-hou-xu-bian-li-xu-lie-lcof', title: '验证二叉搜索树的后序遍历序列', difficulty: 'MEDIUM' },
          { slug: 'er-cha-shu-zhong-he-wei-mou-yi-zhi-de-lu-jing-lcof', title: '二叉树中和为目标值的路径', difficulty: 'MEDIUM' },
          { slug: 'er-cha-sou-suo-shu-yu-shuang-xiang-lian-biao-lcof', title: '将BST转化为排序双向链表', difficulty: 'MEDIUM' },
          { slug: 'xu-lie-hua-er-cha-shu-lcof', title: '序列化与反序列化二叉树', difficulty: 'HARD' },
        ],
      },
      {
        id: 'lcof-string-math',
        title: '字符串与数学',
        problems: [
          { slug: 'ti-huan-kong-ge-lcof', title: '路径加密', difficulty: 'EASY' },
          { slug: 'zuo-xuan-zhuan-zi-fu-chuan-lcof', title: '动态口令', difficulty: 'EASY' },
          { slug: 'fan-zhuan-dan-ci-shun-xu-lcof', title: '字符串中的单词反转', difficulty: 'EASY' },
          { slug: 'fei-bo-na-qi-shu-lie-lcof', title: '斐波那契数', difficulty: 'EASY' },
          { slug: 'qing-wa-tiao-tai-jie-wen-ti-lcof', title: '跳跃训练', difficulty: 'EASY' },
          { slug: 'jian-sheng-zi-lcof', title: '砍竹子 I', difficulty: 'MEDIUM' },
          { slug: 'shu-zhi-de-zheng-shu-ci-fang-lcof', title: 'Pow(x, n)', difficulty: 'MEDIUM' },
          { slug: 'ba-shu-zi-fan-yi-cheng-zi-fu-chuan-lcof', title: '解密数字', difficulty: 'MEDIUM' },
          { slug: 'nge-tou-zi-de-dian-shu-lcof', title: '统计结果概率', difficulty: 'MEDIUM' },
        ],
      },
      {
        id: 'lcof-advanced',
        title: '高级专题',
        problems: [
          { slug: 'bao-han-minhan-shu-de-zhan-lcof', title: '最小栈', difficulty: 'EASY' },
          { slug: 'yong-liang-ge-zhan-shi-xian-dui-lie-lcof', title: '图书整理 II', difficulty: 'EASY' },
          { slug: 'hua-dong-chuang-kou-de-zui-da-zhi-lcof', title: '望远镜中最高的海拔', difficulty: 'HARD' },
          { slug: 'shu-ju-liu-zhong-de-zhong-wei-shu-lcof', title: '数据流中的中位数', difficulty: 'HARD' },
          { slug: 'zheng-ze-biao-da-shi-pi-pei-lcof', title: '模糊搜索验证', difficulty: 'HARD' },
          { slug: 'ju-zhen-zhong-de-lu-jing-lcof', title: '字母迷宫', difficulty: 'MEDIUM' },
          { slug: 'ji-qi-ren-de-yun-dong-fan-wei-lcof', title: '衣橱整理', difficulty: 'MEDIUM' },
          { slug: 'zi-fu-chuan-de-pai-lie-lcof', title: '套餐内商品的排列顺序', difficulty: 'MEDIUM' },
        ],
      },
    ],
  },
  {
    id: 'lcci',
    title: '程序员面试金典',
    description: '《程序员面试金典（第 6 版）》经典题目，侧重字符串与链表操作',
    nodes: [
      {
        id: 'lcci-string',
        title: '字符串',
        problems: [
          { slug: 'is-unique-lcci', title: '判定字符是否唯一', difficulty: 'EASY' },
          { slug: 'check-permutation-lcci', title: '判定是否互为字符重排', difficulty: 'EASY' },
          { slug: 'string-to-url-lcci', title: 'URL化', difficulty: 'EASY' },
          { slug: 'palindrome-permutation-lcci', title: '回文排列', difficulty: 'EASY' },
          { slug: 'one-away-lcci', title: '一次编辑', difficulty: 'MEDIUM' },
          { slug: 'compress-string-lcci', title: '字符串压缩', difficulty: 'EASY' },
          { slug: 'string-rotation-lcci', title: '字符串轮转', difficulty: 'EASY' },
        ],
      },
      {
        id: 'lcci-linked-list',
        title: '链表',
        problems: [
          { slug: 'remove-duplicate-node-lcci', title: '移除重复节点', difficulty: 'EASY' },
          { slug: 'kth-node-from-end-of-list-lcci', title: '返回倒数第 k 个节点', difficulty: 'EASY' },
          { slug: 'delete-middle-node-lcci', title: '删除中间节点', difficulty: 'EASY' },
          { slug: 'partition-list-lcci', title: '分割链表', difficulty: 'MEDIUM' },
          { slug: 'sum-lists-lcci', title: '链表求和', difficulty: 'MEDIUM' },
          { slug: 'palindrome-linked-list-lcci', title: '回文链表', difficulty: 'EASY' },
          { slug: 'intersection-of-two-linked-lists-lcci', title: '链表相交', difficulty: 'EASY' },
        ],
      },
      {
        id: 'lcci-array',
        title: '数组与矩阵',
        problems: [
          { slug: 'rotate-matrix-lcci', title: '旋转矩阵', difficulty: 'MEDIUM' },
          { slug: 'zero-matrix-lcci', title: '零矩阵', difficulty: 'MEDIUM' },
        ],
      },
    ],
  },
];

/** 全部题单题目数（用于总览统计） */
export const PLAN_TOTAL_PROBLEMS = STUDY_PLAN.reduce(
  (sum, sec) => sum + sec.nodes.reduce((s, n) => s + n.problems.length, 0),
  0,
);
