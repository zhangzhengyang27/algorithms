import { GraphStorageTraversalPanel } from '@/components/visualizer/graph-storage-traversal-panel';

export default function GraphStorageTraversalPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">图的存储与遍历 Graph Storage & Traversal</h1>
        <p className="text-gray-400 text-sm mt-1">
          邻接矩阵与邻接表两种存储方式联动展示，再观察 BFS 队列的按层扩散与 DFS 递归栈的一条路走到底。
        </p>
      </div>
      <GraphStorageTraversalPanel />
    </div>
  );
}
