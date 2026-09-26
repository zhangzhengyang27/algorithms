import { DivideAndConquerPanel } from '@/components/visualizer/divide-and-conquer-panel';

export default function DivideAndConquerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">分治 Divide and Conquer</h1>
        <p className="text-gray-400 text-sm mt-1">
          以归并排序求逆序对为例，观察分治的分解、递归求解与合并三阶段。
        </p>
      </div>
      <DivideAndConquerPanel />
    </div>
  );
}
