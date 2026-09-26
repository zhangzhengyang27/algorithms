import { BacktrackingPanel } from '@/components/visualizer/backtracking-panel';

export default function BacktrackingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">回溯 Backtracking</h1>
        <p className="text-gray-400 text-sm mt-1">
          全排列问题：逐步展示「选择 → 递归 → 撤销」的回溯过程。
        </p>
      </div>
      <BacktrackingPanel />
    </div>
  );
}
