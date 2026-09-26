import { PowerSetPanel } from '@/components/visualizer/power-set-panel';

export default function PowerSetPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">幂集 Power Set</h1>
        <p className="text-gray-400 text-sm mt-1">回溯算法：生成集合的全部子集（含空集）。</p>
      </div>
      <PowerSetPanel />
    </div>
  );
}
