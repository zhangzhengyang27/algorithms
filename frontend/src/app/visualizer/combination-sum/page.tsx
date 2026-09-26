import { CombinationSumPanel } from '@/components/visualizer/combination-sum-panel';

export default function CombinationSumPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">组合求和 Combination Sum</h1>
        <p className="text-gray-400 text-sm mt-1">回溯算法：可重复选数，找出和为目标的全部组合。</p>
      </div>
      <CombinationSumPanel />
    </div>
  );
}
