import { RedBlackTreePanel } from '@/components/visualizer/red-black-tree-panel';

export default function RedBlackTreePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">红黑树 Red-Black Tree</h1>
        <p className="text-gray-400 text-sm mt-1">
          自平衡二叉搜索树。观察插入后的红黑着色、重着色与旋转调整，保持近似平衡。
        </p>
      </div>
      <RedBlackTreePanel />
    </div>
  );
}
