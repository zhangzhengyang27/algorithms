import { UnionFindPanel } from '@/components/visualizer/union-find-panel';

export default function UnionFindPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">并查集 Union-Find</h1>
        <p className="text-gray-400 text-sm mt-1">
          按秩合并 + 路径查找，观察集合的合并过程与树结构变化。
        </p>
      </div>
      <UnionFindPanel />
    </div>
  );
}
