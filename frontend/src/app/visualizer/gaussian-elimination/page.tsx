import { GaussianEliminationPanel } from '@/components/visualizer/gaussian-elimination-panel';

export default function GaussianEliminationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">高斯消元 Gaussian Elimination</h1>
        <p className="text-gray-400 text-sm mt-1">
          O(n³) 求解线性方程组。观察增广矩阵的选主元、行交换、消元与回代全过程。
        </p>
      </div>
      <GaussianEliminationPanel />
    </div>
  );
}
