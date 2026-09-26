import { CombinationsPanel } from '@/components/visualizer/combinations-panel';

export default function CombinationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">组合 Combinations</h1>
        <p className="text-gray-400 text-sm mt-1">回溯算法：从集合中取指定长度的不重复无序组合。</p>
      </div>
      <CombinationsPanel />
    </div>
  );
}
