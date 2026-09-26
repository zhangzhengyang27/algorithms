import { KMeansPanel } from '@/components/visualizer/kmeans-panel';

export default function KMeansPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">K-Means 聚类</h1>
        <p className="text-gray-400 text-sm mt-1">迭代：分配最近质心 → 以簇均值更新质心，直至收敛。</p>
      </div>
      <KMeansPanel />
    </div>
  );
}
