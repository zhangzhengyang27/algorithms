import { PersistentSegmentTreePanel } from '@/components/visualizer/persistent-segment-tree-panel';

export default function PersistentSegmentTreePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">主席树 Persistent Segment Tree</h1>
        <p className="text-gray-400 text-sm mt-1">
          可持久化线段树：插入时路径复制新建节点、共享未修改子树，保留全部历史版本，两版本做差查询区间第 k 小。
        </p>
      </div>
      <PersistentSegmentTreePanel />
    </div>
  );
}
