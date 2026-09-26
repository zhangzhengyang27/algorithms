import { PriorityQueueAdvancedPanel } from '@/components/visualizer/priority-queue-advanced-panel';

export default function PriorityQueueAdvancedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">优先队列进阶 Priority Queue Advanced</h1>
        <p className="text-gray-400 text-sm mt-1">
          堆的高级应用：用小顶堆维护 K 个最大元素解决 TopK 问题，观察数据流入堆、替换堆顶与下沉调整。
        </p>
      </div>
      <PriorityQueueAdvancedPanel />
    </div>
  );
}
