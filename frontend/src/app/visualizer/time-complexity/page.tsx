import { TimeComplexityPanel } from '@/components/visualizer/time-complexity-panel';

export default function TimeComplexityPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">时间复杂度 Time Complexity</h1>
        <p className="text-gray-400 text-sm mt-1">
          对比 O(1) / O(log n) / O(n) / O(n log n) / O(n²) / O(2ⁿ) 的增长曲线，观察 n 增大时操作次数的爆炸式差异。
        </p>
      </div>
      <TimeComplexityPanel />
    </div>
  );
}
