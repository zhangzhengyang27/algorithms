import { BinaryIndexedTreePanel } from '@/components/visualizer/binary-indexed-tree-panel';

export default function BinaryIndexedTreePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">树状数组 Binary Indexed Tree</h1>
        <p className="text-gray-400 text-sm mt-1">
          O(log n) 单点更新与前缀和查询。观察 lowbit 跳跃路径与 tree[i] 的覆盖区间。
        </p>
      </div>
      <BinaryIndexedTreePanel />
    </div>
  );
}
