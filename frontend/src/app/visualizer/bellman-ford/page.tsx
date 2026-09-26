import { BellmanFordPanel } from '@/components/visualizer/bellman-ford-panel';

export default function BellmanFordPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bellman-Ford 最短路</h1>
        <p className="text-gray-400 text-sm mt-1">
          逐轮松弛所有边，支持负权边，演示 n-1 轮迭代收敛过程。
        </p>
      </div>
      <BellmanFordPanel />
    </div>
  );
}
