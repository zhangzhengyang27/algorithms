import { LinkedListPanel } from '@/components/visualizer/linked-list-panel';

export default function LinkedListVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">链表 Linked List</h1>
        <p className="text-gray-400 text-sm mt-1">
          头部插入 → 顺序遍历 → 删除中间节点 → 反转整条链表。
        </p>
      </div>
      <LinkedListPanel />
    </div>
  );
}
