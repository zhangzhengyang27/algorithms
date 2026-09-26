import { KNNPanel } from '@/components/visualizer/knn-panel';

export default function KNNPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">K 近邻 KNN</h1>
        <p className="text-gray-400 text-sm mt-1">分类：取最近的 k 个邻居，按多数投票决定待分类点类别。</p>
      </div>
      <KNNPanel />
    </div>
  );
}
