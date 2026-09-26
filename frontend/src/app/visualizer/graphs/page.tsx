import { GraphSearchPanel } from '@/components/visualizer/graph-search-panel';

export default function GraphsVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">图搜索可视化</h1>
        <p className="text-gray-400">
          交互式演示 BFS 广度优先和 DFS 深度优先搜索算法，理解图遍历的过程
        </p>
      </div>

      <GraphSearchPanel />
    </div>
  );
}
