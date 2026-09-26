import { CoordinateCompressionPanel } from '@/components/visualizer/coordinate-compression-panel';

export default function CoordinateCompressionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">坐标离散化 Coordinate Compression</h1>
        <p className="text-gray-400 text-sm mt-1">
          将大值域坐标映射到紧凑小值域。观察排序去重与二分查找映射的全过程。
        </p>
      </div>
      <CoordinateCompressionPanel />
    </div>
  );
}
