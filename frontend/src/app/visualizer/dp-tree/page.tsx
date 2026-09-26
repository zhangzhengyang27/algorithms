import { DpTreePanel } from '@/components/visualizer/dp-tree-panel';

export default function DpTreePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">树形 DP Tree DP</h1>
        <p className="text-gray-400 text-sm mt-1">
          以「没有上司的舞会」（树的最大独立集）为例，观察后序遍历与每个节点「选 / 不选」的 dp 值汇总。
        </p>
      </div>
      <DpTreePanel />
    </div>
  );
}
