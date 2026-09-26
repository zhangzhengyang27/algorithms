import { SqrtDecompositionPanel } from '@/components/visualizer/sqrt-decomposition-panel';

export default function SqrtDecompositionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">分块 Sqrt Decomposition</h1>
        <p className="text-gray-400 text-sm mt-1">
          O(√n) 的区间查询与单点修改。观察块的划分、整块懒标记与零散元素的处理。
        </p>
      </div>
      <SqrtDecompositionPanel />
    </div>
  );
}
