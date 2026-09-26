import { BlockListPanel } from '@/components/visualizer/block-list-panel';

export default function BlockListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">块状链表 Block List</h1>
        <p className="text-gray-400 text-sm mt-1">
          把链表分块、每块上限 √n：任意位置插入/删除/访问降到 O(√n)。观察元素插入后块如何从中点分裂。
        </p>
      </div>
      <BlockListPanel />
    </div>
  );
}
