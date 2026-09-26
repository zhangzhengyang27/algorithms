import { MergeSortPanel } from '@/components/visualizer/merge-sort-panel';

export default function MergeSortPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">归并排序 Merge Sort</h1>
        <p className="text-gray-400 text-sm mt-1">
          分治策略：递归分割至单元素，再逐步合并有序子数组。
        </p>
      </div>
      <MergeSortPanel />
    </div>
  );
}
