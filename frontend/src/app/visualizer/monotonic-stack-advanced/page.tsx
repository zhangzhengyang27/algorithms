import { MonotonicStackAdvancedPanel } from '@/components/visualizer/monotonic-stack-advanced-panel';

export default function MonotonicStackAdvancedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">单调栈进阶 Monotonic Stack Advanced</h1>
        <p className="text-gray-400 text-sm mt-1">
          以「柱状图中最大的矩形」为例，观察单调递增栈的维护、弹出时宽度确定与面积更新。
        </p>
      </div>
      <MonotonicStackAdvancedPanel />
    </div>
  );
}
