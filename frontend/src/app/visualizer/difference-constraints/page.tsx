import { DifferenceConstraintsPanel } from '@/components/visualizer/difference-constraints-panel';

export default function DifferenceConstraintsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">差分约束 Difference Constraints</h1>
        <p className="text-gray-400 text-sm mt-1">
          将 x_j - x_i ≤ w 约束转化为图上的边，用 Bellman-Ford 松弛求可行解，负环则无解。
        </p>
      </div>
      <DifferenceConstraintsPanel />
    </div>
  );
}
