import { HeavyLightDecompositionPanel } from '@/components/visualizer/heavy-light-decomposition-panel';

export default function HeavyLightDecompositionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">树链剖分 Heavy-Light Decomposition</h1>
        <p className="text-gray-400 text-sm mt-1">
          重儿子标记、重链划分、DFS 序分配，路径查询时沿重链跳跃，将树上路径拆成 O(log n) 段连续区间。
        </p>
      </div>
      <HeavyLightDecompositionPanel />
    </div>
  );
}
