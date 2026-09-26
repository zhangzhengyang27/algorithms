import { SplayPanel } from '@/components/visualizer/splay-panel';

export default function SplayTreePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">伸展树 Splay Tree</h1>
        <p className="text-gray-400 text-sm mt-1">
          自调整的二叉搜索树：每次访问后通过 zig / zig-zig / zig-zag 把节点伸展到根。观察插入后新节点如何被旋转到顶部。
        </p>
      </div>
      <SplayPanel />
    </div>
  );
}
