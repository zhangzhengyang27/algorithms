import { RainTerracesPanel } from '@/components/visualizer/rain-terraces-panel';

export default function RainTerracesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">接雨水 Trapping Rain Water</h1>
        <p className="text-gray-400 text-sm mt-1">
          动态规划：对每根柱子，取左右最高中的较小值减去自身高度，即为该处接水量。
        </p>
      </div>
      <RainTerracesPanel />
    </div>
  );
}
