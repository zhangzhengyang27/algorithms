import { SegmentTreePanel } from '@/components/visualizer/segment-tree-panel';

export default function SegmentTreePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">线段树 Segment Tree</h1>
        <p className="text-gray-400 text-sm mt-1">
          递归构建区间树，演示区间求和查询的分治过程。
        </p>
      </div>
      <SegmentTreePanel />
    </div>
  );
}
