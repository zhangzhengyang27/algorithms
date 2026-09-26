import { CdqDivideConquerPanel } from '@/components/visualizer/cdq-divide-conquer-panel';

export default function CdqDivideConquerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CDQ 分治 CDQ Divide & Conquer</h1>
        <p className="text-gray-400 text-sm mt-1">
          以三维偏序为例：按第一维排序后递归分治，归并时按第二维统计贡献，树状数组处理第三维，O(n log² n)。
        </p>
      </div>
      <CdqDivideConquerPanel />
    </div>
  );
}
