import { DijkstraPanel } from '@/components/visualizer/dijkstra-panel';

export default function DijkstraPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">最短路 Dijkstra</h1>
        <p className="text-gray-400 text-sm mt-1">
          贪心选取最近节点，逐步松弛边，确定单源最短路径。
        </p>
      </div>
      <DijkstraPanel />
    </div>
  );
}
