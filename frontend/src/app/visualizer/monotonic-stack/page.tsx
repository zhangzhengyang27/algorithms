import { MonotonicStackPanel } from '@/components/visualizer/monotonic-stack-panel';

export default function MonotonicStackVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">单调栈 Monotonic Stack</h1>
        <p className="text-gray-400 text-sm mt-1">
          演示"下一个更大元素"。遍历 arr，栈内下标对应 arr 单调递增；遇到更大的值时，把栈内更小的都弹出并填好 ans。
        </p>
      </div>
      <MonotonicStackPanel />
    </div>
  );
}
