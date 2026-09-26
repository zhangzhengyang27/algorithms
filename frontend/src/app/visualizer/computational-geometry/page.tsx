import { ComputationalGeometryPanel } from '@/components/visualizer/computational-geometry-panel';

export default function ComputationalGeometryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">计算几何 · 凸包 Convex Hull</h1>
        <p className="text-gray-400 text-sm mt-1">
          Andrew 单调链算法：按 x 排序后分别构建上下凸壳，用叉积判断左转/右转，O(n log n) 求出凸包。
        </p>
      </div>
      <ComputationalGeometryPanel />
    </div>
  );
}
