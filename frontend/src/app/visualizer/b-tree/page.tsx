import { BTreePanel } from '@/components/visualizer/b-tree-panel';

export default function BTreePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">B 树 B-Tree</h1>
        <p className="text-gray-400 text-sm mt-1">
          自平衡多路搜索树，磁盘 I/O 友好。观察插入时的关键字定位、节点分裂与中间键上移过程。
        </p>
      </div>
      <BTreePanel />
    </div>
  );
}
