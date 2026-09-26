import { UnionFindAdvancedPanel } from '@/components/visualizer/union-find-advanced-panel';

export default function UnionFindAdvancedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">并查集进阶 Weighted Union-Find</h1>
        <p className="text-gray-400 text-sm mt-1">
          带权并查集：维护节点到根的距离/关系，路径压缩时权值自动累加，合并时推导新权值。观察集合树与权值标注。
        </p>
      </div>
      <UnionFindAdvancedPanel />
    </div>
  );
}
