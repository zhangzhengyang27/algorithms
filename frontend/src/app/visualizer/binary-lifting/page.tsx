import { BinaryLiftingPanel } from '@/components/visualizer/binary-lifting-panel';

export default function BinaryLiftingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">倍增 Binary Lifting</h1>
        <p className="text-gray-400 text-sm mt-1">
          O(n log n) 预处理祖先表 fa[u][k]，O(log n) 查询 LCA。观察二进制分解跳跃与两节点同步上跳过程。
        </p>
      </div>
      <BinaryLiftingPanel />
    </div>
  );
}
