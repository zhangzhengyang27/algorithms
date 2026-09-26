import { SweepLinePanel } from '@/components/visualizer/sweep-line-panel';

export default function SweepLinePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">扫描线 Sweep Line</h1>
        <p className="text-gray-400 text-sm mt-1">
          以矩形面积并为例。观察扫描线从左到右移动、事件点处理与活跃区间的覆盖长度。
        </p>
      </div>
      <SweepLinePanel />
    </div>
  );
}
