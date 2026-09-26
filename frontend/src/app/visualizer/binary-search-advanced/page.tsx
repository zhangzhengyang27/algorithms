import { BinarySearchAdvancedPanel } from '@/components/visualizer/binary-search-advanced-panel';

export default function BinarySearchAdvancedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">高级二分 Binary Search Advanced</h1>
        <p className="text-gray-400 text-sm mt-1">
          二分的边界艺术：左闭右闭 vs 左闭右开、查找第一个/最后一个等于目标的位置、死循环陷阱对比。
        </p>
      </div>
      <BinarySearchAdvancedPanel />
    </div>
  );
}
