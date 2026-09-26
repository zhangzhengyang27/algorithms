import { SortingAdvancedPanel } from '@/components/visualizer/sorting-advanced-panel';

export default function SortingAdvancedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">排序进阶 Sorting Advanced</h1>
        <p className="text-gray-400 text-sm mt-1">
          三种线性排序：计数排序（计数+前缀和）、桶排序（分桶+桶内排序+收集）、基数排序（按位稳定排序）。
        </p>
      </div>
      <SortingAdvancedPanel />
    </div>
  );
}
