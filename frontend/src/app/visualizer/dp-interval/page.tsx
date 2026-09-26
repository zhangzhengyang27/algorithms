import { DpIntervalPanel } from '@/components/visualizer/dp-interval-panel';

export default function DpIntervalPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">区间 DP Interval DP</h1>
        <p className="text-gray-400 text-sm mt-1">
          以石子合并为例，观察枚举区间长度、分割点 k 与 dp 矩阵填表过程。
        </p>
      </div>
      <DpIntervalPanel />
    </div>
  );
}
