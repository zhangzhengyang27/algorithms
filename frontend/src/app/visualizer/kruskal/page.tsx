import { KruskalPanel } from '@/components/visualizer/kruskal-panel';

export default function KruskalPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">最小生成树 Kruskal</h1>
        <p className="text-gray-400 text-sm mt-1">
          按权重排序边，用并查集判断环，贪心构建最小生成树。
        </p>
      </div>
      <KruskalPanel />
    </div>
  );
}
