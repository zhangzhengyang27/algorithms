"use client";

import { lazy, type ComponentType } from "react";

/**
 * 可视化路由 slug → 面板组件 的注册表（按可视化目录 slug 索引）。
 * 使用 React.lazy 按需加载，避免一次性打包全部可视化组件。
 * 教程页通过 getVisualizerRoute(tutorialSlug) 取得此处的键。
 */
type LazyPanel = ComponentType;

// 面板组件均为命名导出，这里统一适配为 default 供 lazy 使用。
function named<T extends ComponentType>(loader: () => Promise<Record<string, T>>, name: string) {
  return lazy(async () => {
    const mod = await loader();
    return { default: mod[name] };
  });
}

export const visualizerRegistry: Record<string, LazyPanel> = {
  // 排序
  sorting: named(() => import("@/components/visualizer/sorting-panel"), "SortingPanel"),
  "shell-sort": named(() => import("@/components/visualizer/shell-sort-panel"), "ShellSortPanel"),
  "merge-sort": named(() => import("@/components/visualizer/merge-sort-panel"), "MergeSortPanel"),
  "quick-sort": named(() => import("@/components/visualizer/quick-sort-panel"), "QuickSortPanel"),
  "heap-sort": named(() => import("@/components/visualizer/heap-sort-panel"), "HeapSortPanel"),
  "counting-sort": named(() => import("@/components/visualizer/counting-sort-panel"), "CountingSortPanel"),
  "sorting-advanced": named(() => import("@/components/visualizer/sorting-advanced-panel"), "SortingAdvancedPanel"),
  // 搜索
  "time-complexity": named(() => import("@/components/visualizer/time-complexity-panel"), "TimeComplexityPanel"),
  "linear-search": named(() => import("@/components/visualizer/linear-search-panel"), "LinearSearchPanel"),
  "binary-search": named(() => import("@/components/visualizer/binary-search-panel2"), "BinarySearchPanel"),
  "binary-search-advanced": named(() => import("@/components/visualizer/binary-search-advanced-panel"), "BinarySearchAdvancedPanel"),
  "binary-search-answer": named(() => import("@/components/visualizer/binary-search-answer-panel"), "BinarySearchAnswerPanel"),
  // 线性结构
  array: named(() => import("@/components/visualizer/array-panel"), "ArrayPanel"),
  "linked-list": named(() => import("@/components/visualizer/linked-list-panel"), "LinkedListPanel"),
  "linked-list-problems": named(() => import("@/components/visualizer/linked-list-problems-panel"), "LinkedListProblemsPanel"),
  stack: named(() => import("@/components/visualizer/stack-panel"), "StackPanel"),
  queue: named(() => import("@/components/visualizer/queue-panel"), "QueuePanel"),
  "hash-table": named(() => import("@/components/visualizer/hash-table-panel"), "HashTablePanel"),
  "hash-collision": named(() => import("@/components/visualizer/hash-collision-panel"), "HashCollisionPanel"),
  "set-and-map": named(() => import("@/components/visualizer/set-and-map-panel"), "SetAndMapPanel"),
  heap: named(() => import("@/components/visualizer/heap-panel"), "HeapPanel"),
  "priority-queue-advanced": named(() => import("@/components/visualizer/priority-queue-advanced-panel"), "PriorityQueueAdvancedPanel"),
  // 树
  trees: named(() => import("@/components/visualizer/tree-traversal-panel"), "TreeTraversalPanel"),
  bst: named(() => import("@/components/visualizer/bst-panel"), "BSTPanel"),
  "avl-tree": named(() => import("@/components/visualizer/avl-panel"), "AVLPanel"),
  "splay-tree": named(() => import("@/components/visualizer/splay-panel"), "SplayPanel"),
  "treap": named(() => import("@/components/visualizer/treap-panel"), "TreapPanel"),
  "red-black-tree": named(() => import("@/components/visualizer/red-black-tree-panel"), "RedBlackTreePanel"),
  trie: named(() => import("@/components/visualizer/trie-panel"), "TriePanel"),
  "binary-lifting": named(() => import("@/components/visualizer/binary-lifting-panel"), "BinaryLiftingPanel"),
  "tree-diameter-centroid": named(() => import("@/components/visualizer/tree-diameter-centroid-panel"), "TreeDiameterCentroidPanel"),
  "b-tree": named(() => import("@/components/visualizer/b-tree-panel"), "BTreePanel"),
  // 高级结构
  "segment-tree": named(() => import("@/components/visualizer/segment-tree-panel"), "SegmentTreePanel"),
  "segment-tree-advanced": named(() => import("@/components/visualizer/segment-tree-advanced-panel"), "SegmentTreeAdvancedPanel"),
  "persistent-segment-tree": named(() => import("@/components/visualizer/persistent-segment-tree-panel"), "PersistentSegmentTreePanel"),
  "binary-indexed-tree": named(() => import("@/components/visualizer/binary-indexed-tree-panel"), "BinaryIndexedTreePanel"),
  "monotonic-stack": named(() => import("@/components/visualizer/monotonic-stack-panel"), "MonotonicStackPanel"),
  "monotonic-stack-advanced": named(() => import("@/components/visualizer/monotonic-stack-advanced-panel"), "MonotonicStackAdvancedPanel"),
  "monotonic-queue": named(() => import("@/components/visualizer/monotonic-queue-panel"), "MonotonicQueuePanel"),
  "union-find": named(() => import("@/components/visualizer/union-find-panel"), "UnionFindPanel"),
  "union-find-advanced": named(() => import("@/components/visualizer/union-find-advanced-panel"), "UnionFindAdvancedPanel"),
  "lru-cache": named(() => import("@/components/visualizer/lru-cache-panel"), "LRUPanel"),
  "skip-list": named(() => import("@/components/visualizer/skip-list-panel"), "SkipListPanel"),
  "block-list": named(() => import("@/components/visualizer/block-list-panel"), "BlockListPanel"),
  "design-data-structures": named(() => import("@/components/visualizer/design-data-structures-panel"), "DesignDataStructuresPanel"),
  "heavy-light-decomposition": named(() => import("@/components/visualizer/heavy-light-decomposition-panel"), "HeavyLightDecompositionPanel"),
  "sqrt-decomposition": named(() => import("@/components/visualizer/sqrt-decomposition-panel"), "SqrtDecompositionPanel"),
  // 算法思想
  recursion: named(() => import("@/components/visualizer/recursion-panel"), "RecursionPanel"),
  "divide-and-conquer": named(() => import("@/components/visualizer/divide-and-conquer-panel"), "DivideAndConquerPanel"),
  greedy: named(() => import("@/components/visualizer/greedy-panel"), "GreedyPanel"),
  backtracking: named(() => import("@/components/visualizer/backtracking-panel"), "BacktrackingPanel"),
  "two-pointers": named(() => import("@/components/visualizer/two-pointers-panel"), "TwoPointersPanel"),
  "sliding-window": named(() => import("@/components/visualizer/sliding-window-panel"), "SlidingWindowPanel"),
  "prefix-sum": named(() => import("@/components/visualizer/prefix-sum-panel"), "PrefixSumPanel"),
  "bit-manipulation": named(() => import("@/components/visualizer/bit-manipulation-panel"), "BitManipulationPanel"),
  "coordinate-compression": named(() => import("@/components/visualizer/coordinate-compression-panel"), "CoordinateCompressionPanel"),
  "sweep-line": named(() => import("@/components/visualizer/sweep-line-panel"), "SweepLinePanel"),
  "cdq-divide-conquer": named(() => import("@/components/visualizer/cdq-divide-conquer-panel"), "CdqDivideConquerPanel"),
  combinatorics: named(() => import("@/components/visualizer/combinatorics-panel"), "CombinatoricsPanel"),
  "matrix-exponentiation": named(() => import("@/components/visualizer/matrix-exponentiation-panel"), "MatrixExponentiationPanel"),
  "extended-gcd": named(() => import("@/components/visualizer/extended-gcd-panel"), "ExtendedGcdPanel"),
  "chinese-remainder-theorem": named(() => import("@/components/visualizer/chinese-remainder-theorem-panel"), "ChineseRemainderTheoremPanel"),
  "gaussian-elimination": named(() => import("@/components/visualizer/gaussian-elimination-panel"), "GaussianEliminationPanel"),
  "game-theory": named(() => import("@/components/visualizer/game-theory-panel"), "GameTheoryPanel"),
  "number-theory": named(() => import("@/components/visualizer/number-theory-panel"), "NumberTheoryPanel"),
  "computational-geometry": named(() => import("@/components/visualizer/computational-geometry-panel"), "ComputationalGeometryPanel"),
  // 动态规划
  dp: named(() => import("@/components/visualizer/dp-panel"), "DPPanel"),
  memoization: named(() => import("@/components/visualizer/memoization-panel"), "MemoizationPanel"),
  lis: named(() => import("@/components/visualizer/lis-panel"), "LISPanel"),
  lcs: named(() => import("@/components/visualizer/lcs-panel"), "LCSPanel"),
  "dp-state-machine": named(() => import("@/components/visualizer/dp-state-machine-panel"), "DpStateMachinePanel"),
  "dp-knapsack": named(() => import("@/components/visualizer/dp-knapsack-panel"), "DpKnapsackPanel"),
  "dp-interval": named(() => import("@/components/visualizer/dp-interval-panel"), "DpIntervalPanel"),
  "dp-tree": named(() => import("@/components/visualizer/dp-tree-panel"), "DpTreePanel"),
  "dp-state-compression": named(() => import("@/components/visualizer/dp-state-compression-panel"), "DpStateCompressionPanel"),
  "dp-digit": named(() => import("@/components/visualizer/dp-digit-panel"), "DpDigitPanel"),
  // 图论
  "graph-storage-traversal": named(() => import("@/components/visualizer/graph-storage-traversal-panel"), "GraphStorageTraversalPanel"),
  graphs: named(() => import("@/components/visualizer/graph-search-panel"), "GraphSearchPanel"),
  dijkstra: named(() => import("@/components/visualizer/dijkstra-panel"), "DijkstraPanel"),
  "topological-sort": named(() => import("@/components/visualizer/topological-sort-panel"), "TopologicalSortPanel"),
  kruskal: named(() => import("@/components/visualizer/kruskal-panel"), "KruskalPanel"),
  "bipartite-graph": named(() => import("@/components/visualizer/bipartite-graph-panel"), "BipartiteGraphPanel"),
  "tarjan-scc": named(() => import("@/components/visualizer/tarjan-scc-panel"), "TarjanSCCPanel"),
  "eulerian-path": named(() => import("@/components/visualizer/eulerian-path-panel"), "EulerianPathPanel"),
  "two-sat": named(() => import("@/components/visualizer/two-sat-panel"), "TwoSatPanel"),
  "difference-constraints": named(() => import("@/components/visualizer/difference-constraints-panel"), "DifferenceConstraintsPanel"),
  "network-flow": named(() => import("@/components/visualizer/network-flow-panel"), "NetworkFlowPanel"),
  "floyd-warshall": named(() => import("@/components/visualizer/floyd-warshall-panel"), "FloydWarshallPanel"),
  prim: named(() => import("@/components/visualizer/prim-panel"), "PrimPanel"),
  // 字符串
  string: named(() => import("@/components/visualizer/string-panel"), "StringPanel"),
  kmp: named(() => import("@/components/visualizer/kmp-panel"), "KMPPanel"),
  manacher: named(() => import("@/components/visualizer/manacher-panel"), "ManacherPanel"),
  "string-hashing": named(() => import("@/components/visualizer/string-hashing-panel"), "StringHashingPanel"),
  "suffix-array": named(() => import("@/components/visualizer/suffix-array-panel"), "SuffixArrayPanel"),
  "aho-corasick": named(() => import("@/components/visualizer/aho-corasick-panel"), "AhoCorasickPanel"),
  // 经典题目
  "n-queens": named(() => import("@/components/visualizer/n-queens-panel"), "NQueensPanel"),
  "hanoi-tower": named(() => import("@/components/visualizer/hanoi-tower-panel"), "HanoiTowerPanel"),
  "rain-terraces": named(() => import("@/components/visualizer/rain-terraces-panel"), "RainTerracesPanel"),
  "bloom-filter": named(() => import("@/components/visualizer/bloom-filter-panel"), "BloomFilterPanel"),
  // 经典题目 / 其他
  "jump-game": named(() => import("@/components/visualizer/jump-game-panel"), "JumpGamePanel"),
  "knapsack": named(() => import("@/components/visualizer/knapsack-panel"), "KnapsackPanel"),
  "caesar-cipher": named(() => import("@/components/visualizer/caesar-cipher-panel"), "CaesarCipherPanel"),
  // 经典题目 / 其他
  "best-time": named(() => import("@/components/visualizer/best-time-panel"), "BestTimePanel"),
  "unique-paths": named(() => import("@/components/visualizer/unique-paths-panel"), "UniquePathsPanel"),
  "maximum-subarray": named(() => import("@/components/visualizer/maximum-subarray-panel"), "MaximumSubarrayPanel"),
  "edit-distance": named(() => import("@/components/visualizer/edit-distance-panel"), "EditDistancePanel"),
  "house-robber": named(() => import("@/components/visualizer/house-robber-panel"), "HouseRobberPanel"),
  "rail-fence": named(() => import("@/components/visualizer/rail-fence-panel"), "RailFenceCipherPanel"),
  // 经典题目 / 其他
  "matrix-rotation": named(() => import("@/components/visualizer/matrix-rotation-panel"), "MatrixRotationPanel"),
  "knight-tour": named(() => import("@/components/visualizer/knight-tour-panel"), "KnightTourPanel"),
  "power-set": named(() => import("@/components/visualizer/power-set-panel"), "PowerSetPanel"),
  "staircase": named(() => import("@/components/visualizer/staircase-panel"), "StaircasePanel"),
  "combination-sum": named(() => import("@/components/visualizer/combination-sum-panel"), "CombinationSumPanel"),
  "hill-cipher": named(() => import("@/components/visualizer/hill-cipher-panel"), "HillCipherPanel"),
  "polynomial-hash": named(() => import("@/components/visualizer/polynomial-hash-panel"), "PolynomialHashPanel"),
  "weighted-random": named(() => import("@/components/visualizer/weighted-random-panel"), "WeightedRandomPanel"),
  // 机器学习 / 集合
  "kmeans": named(() => import("@/components/visualizer/kmeans-panel"), "KMeansPanel"),
  "knn": named(() => import("@/components/visualizer/knn-panel"), "KNNPanel"),
  "permutations": named(() => import("@/components/visualizer/permutations-panel"), "PermutationsPanel"),
  "combinations": named(() => import("@/components/visualizer/combinations-panel"), "CombinationsPanel"),
  "fisher-yates": named(() => import("@/components/visualizer/fisher-yates-panel"), "FisherYatesPanel"),
  "cartesian-product": named(() => import("@/components/visualizer/cartesian-product-panel"), "CartesianProductPanel"),
};
