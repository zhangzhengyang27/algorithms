/**
 * 教程 slug → 可视化路由 slug 的完整映射（服务端安全，无 "use client"）。
 * 仅收录「存在对应可视化」的教程。键集合即 hasVisualizer 的判定依据。
 * 多数教程 slug 与可视化目录同名；不同的在此显式标注。
 */
export const tutorialToVisualizer: Record<string, string> = {
  // 排序
  "bubble-selection-insertion-sort": "sorting",
  "quick-sort": "sorting",
  "heap-sort": "sorting",
  "sorting-summary": "sorting",
  "shell-sort": "shell-sort",
  "merge-sort": "merge-sort",
  "sorting-advanced": "sorting-advanced",
  // 搜索
  "time-complexity": "time-complexity",
  "linear-search": "linear-search",
  "binary-search": "binary-search",
  "binary-search-advanced": "binary-search-advanced",
  "binary-search-answer": "binary-search-answer",
  // 线性结构
  array: "array",
  "linked-list": "linked-list",
  "linked-list-problems": "linked-list-problems",
  "linked-list-binary-search": "linked-list-problems",
  stack: "stack",
  queue: "queue",
  "hash-table": "hash-table",
  "hash-collision": "hash-collision",
  "set-and-map": "set-and-map",
  heap: "heap",
  "priority-queue-advanced": "priority-queue-advanced",
  // 树
  "binary-tree": "trees",
  "binary-tree-traversal": "trees",
  "binary-search-tree": "bst",
  "avl-tree": "avl-tree",
  "splay-tree": "splay-tree",
  "treap": "treap",
  "red-black-tree": "red-black-tree",
  trie: "trie",
  "binary-lifting": "binary-lifting",
  "tree-diameter-centroid": "tree-diameter-centroid",
  "b-tree": "b-tree",
  // 高级结构
  "segment-tree": "segment-tree",
  "segment-tree-advanced": "segment-tree-advanced",
  "persistent-segment-tree": "persistent-segment-tree",
  "binary-indexed-tree": "binary-indexed-tree",
  "monotonic-stack": "monotonic-stack",
  "monotonic-stack-advanced": "monotonic-stack-advanced",
  "monotonic-queue": "monotonic-queue",
  "union-find": "union-find",
  "union-find-advanced": "union-find-advanced",
  "lru-cache": "lru-cache",
  "skip-list": "skip-list",
  "block-list": "block-list",
  "design-data-structures": "design-data-structures",
  "heavy-light-decomposition": "heavy-light-decomposition",
  "sqrt-decomposition": "sqrt-decomposition",
  // 算法思想
  recursion: "recursion",
  "divide-and-conquer": "divide-and-conquer",
  "divide-conquer-applications": "divide-and-conquer",
  greedy: "greedy",
  "interval-scheduling": "greedy",
  backtracking: "backtracking",
  "two-pointers": "two-pointers",
  "fast-slow-pointers": "two-pointers",
  "sliding-window": "sliding-window",
  "prefix-sum": "prefix-sum",
  "bit-manipulation": "bit-manipulation",
  "coordinate-compression": "coordinate-compression",
  "sweep-line": "sweep-line",
  "cdq-divide-conquer": "cdq-divide-conquer",
  combinatorics: "combinatorics",
  "matrix-exponentiation": "matrix-exponentiation",
  "extended-gcd": "extended-gcd",
  "chinese-remainder-theorem": "chinese-remainder-theorem",
  "gaussian-elimination": "gaussian-elimination",
  "game-theory": "game-theory",
  "number-theory": "number-theory",
  "computational-geometry": "computational-geometry",
  // 动态规划
  "dynamic-programming": "dp",
  memoization: "memoization",
  lis: "lis",
  lcs: "lcs",
  "dp-state-machine": "dp-state-machine",
  "dp-knapsack": "dp-knapsack",
  "dp-interval": "dp-interval",
  "dp-tree": "dp-tree",
  "dp-state-compression": "dp-state-compression",
  "dp-digit": "dp-digit",
  // 图论
  "graph-storage-traversal": "graph-storage-traversal",
  "graph-algorithms": "graphs",
  "grid-search": "graphs",
  "shortest-path": "dijkstra",
  "topological-sort": "topological-sort",
  "minimum-spanning-tree": "kruskal",
  "bipartite-graph": "bipartite-graph",
  "tarjan-scc": "tarjan-scc",
  "eulerian-path": "eulerian-path",
  "two-sat": "two-sat",
  "difference-constraints": "difference-constraints",
  "network-flow": "network-flow",
  // 字符串
  string: "string",
  kmp: "kmp",
  "string-matching": "kmp",
  manacher: "manacher",
  "string-hashing": "string-hashing",
  "suffix-array": "suffix-array",
  "aho-corasick": "aho-corasick",
};

/** 该教程是否有对应的可视化 */
export function hasVisualizer(slug: string): boolean {
  return slug in tutorialToVisualizer;
}

/** 获取教程对应的可视化路由 slug（无映射时回退为自身） */
export function getVisualizerRoute(slug: string): string {
  return tutorialToVisualizer[slug] ?? slug;
}
