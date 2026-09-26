import { ArrayPanel } from '@/components/visualizer/array-panel';

export default function ArrayPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数组基础 Array Basics</h1>
        <p className="text-gray-400 text-sm mt-1">
          观察数组的连续内存布局、O(1) 随机访问、顺序遍历，以及插入/删除时的元素移动过程。
        </p>
      </div>
      <ArrayPanel />
    </div>
  );
}
