import { DpStateCompressionPanel } from '@/components/visualizer/dp-state-compression-panel';

export default function DpStateCompressionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">状压 DP State Compression DP</h1>
        <p className="text-gray-400 text-sm mt-1">
          以旅行商问题（TSP）为例，用二进制 mask 表示已访问城市集合，观察状态转移与 dp 表填充。
        </p>
      </div>
      <DpStateCompressionPanel />
    </div>
  );
}
