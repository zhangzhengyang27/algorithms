import { ShellSortPanel } from '@/components/visualizer/shell-sort-panel';

export default function ShellSortPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">希尔排序 Shell Sort</h1>
        <p className="text-gray-400 text-sm mt-1">
          观察不同增量 gap 下的分组、组内插入排序与数组逐步趋于有序的过程。
        </p>
      </div>
      <ShellSortPanel />
    </div>
  );
}
