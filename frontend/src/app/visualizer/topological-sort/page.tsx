import { TopologicalSortPanel } from '@/components/visualizer/topological-sort-panel';

export default function TopologicalSortPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">拓扑排序 Topological Sort</h1>
        <p className="text-gray-400 text-sm mt-1">
          BFS（Kahn 算法）：逐步移除入度为 0 的节点，生成 DAG 的线性序列。
        </p>
      </div>
      <TopologicalSortPanel />
    </div>
  );
}
