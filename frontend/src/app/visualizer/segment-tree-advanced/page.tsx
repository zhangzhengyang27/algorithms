import { SegmentTreeAdvancedPanel } from '@/components/visualizer/segment-tree-advanced-panel';

export default function SegmentTreeAdvancedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">线段树进阶 Lazy Propagation</h1>
        <p className="text-gray-400 text-sm mt-1">
          懒标记线段树：区间修改时打标记不下推，查询时按需下推，标记逐层传播，实现 O(log n) 区间修改与查询。
        </p>
      </div>
      <SegmentTreeAdvancedPanel />
    </div>
  );
}
