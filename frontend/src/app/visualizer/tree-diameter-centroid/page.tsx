import { TreeDiameterCentroidPanel } from '@/components/visualizer/tree-diameter-centroid-panel';

export default function TreeDiameterCentroidPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">树的直径与重心 Diameter & Centroid</h1>
        <p className="text-gray-400 text-sm mt-1">
          两次 BFS/DFS 求树的直径（最远点追踪），DFS 求树的重心（最大子树最小化）。观察距离标注与子树大小计算。
        </p>
      </div>
      <TreeDiameterCentroidPanel />
    </div>
  );
}
