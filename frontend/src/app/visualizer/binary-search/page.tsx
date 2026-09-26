import { BinarySearchPanel } from '@/components/visualizer/binary-search-panel2';

export default function BinarySearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">二分查找 Binary Search</h1>
        <p className="text-gray-400 text-sm mt-1">
          逐步缩半搜索范围，观察 left / mid / right 指针的移动与区间排除。
        </p>
      </div>
      <BinarySearchPanel />
    </div>
  );
}
