import { AVLPanel } from '@/components/visualizer/avl-panel';

export default function AVLPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AVL 树旋转</h1>
        <p className="text-gray-400 text-sm mt-1">
          逐步插入节点，观察失衡检测与 LL/RR/LR/RL 四种旋转操作。
        </p>
      </div>
      <AVLPanel />
    </div>
  );
}
