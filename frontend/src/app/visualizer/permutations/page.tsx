import { PermutationsPanel } from '@/components/visualizer/permutations-panel';

export default function PermutationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">全排列 Permutations</h1>
        <p className="text-gray-400 text-sm mt-1">回溯算法：生成元素的全部排列顺序。</p>
      </div>
      <PermutationsPanel />
    </div>
  );
}
