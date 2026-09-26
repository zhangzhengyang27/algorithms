import { GreedyPanel } from '@/components/visualizer/greedy-panel';

export default function GreedyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">贪心算法 Greedy</h1>
        <p className="text-gray-400 text-sm mt-1">
          经典区间调度：按结束时间排序，贪心选取不重叠的最多活动。
        </p>
      </div>
      <GreedyPanel />
    </div>
  );
}
