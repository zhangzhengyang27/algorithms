import { BSTPanel } from '@/components/visualizer/bst-panel';

export default function BSTPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">二叉搜索树 BST</h1>
        <p className="text-gray-400 text-sm mt-1">
          逐步插入节点构建 BST，再演示搜索路径。左子树 &lt; 根 &lt; 右子树。
        </p>
      </div>
      <BSTPanel />
    </div>
  );
}
