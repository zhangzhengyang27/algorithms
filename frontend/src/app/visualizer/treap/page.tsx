import { TreapPanel } from '@/components/visualizer/treap-panel';

export default function TreapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">树堆 Treap</h1>
        <p className="text-gray-400 text-sm mt-1">
          随机平衡的二叉搜索树：key 满足 BST、priority 满足最大堆。观察插入后节点如何按 priority 上浮旋转。
        </p>
      </div>
      <TreapPanel />
    </div>
  );
}
