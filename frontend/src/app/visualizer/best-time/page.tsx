import { BestTimePanel } from '@/components/visualizer/best-time-panel';

export default function BestTimePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">买卖股票的最佳时机</h1>
        <p className="text-gray-400 text-sm mt-1">
          动态规划：同时维护持币成本 lastBuy 与最大利润 lastSold。
        </p>
      </div>
      <BestTimePanel />
    </div>
  );
}
