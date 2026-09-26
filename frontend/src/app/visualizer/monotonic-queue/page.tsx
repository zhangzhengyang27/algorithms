import { MonotonicQueuePanel } from '@/components/visualizer/monotonic-queue-panel';

export default function MonotonicQueuePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">单调队列 Monotonic Queue</h1>
        <p className="text-gray-400 text-sm mt-1">
          经典滑动窗口最大值：维护单调递减双端队列，O(n) 求解。
        </p>
      </div>
      <MonotonicQueuePanel />
    </div>
  );
}
