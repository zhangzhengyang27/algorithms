import { DpStateMachinePanel } from '@/components/visualizer/dp-state-machine-panel';

export default function DpStateMachinePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">状态机 DP State Machine DP</h1>
        <p className="text-gray-400 text-sm mt-1">
          以股票买卖（含冷冻期）为例：持有/卖出/冷冻三状态转移，逐天填充 dp 表。
        </p>
      </div>
      <DpStateMachinePanel />
    </div>
  );
}
