import { SlidingWindowPanel } from '@/components/visualizer/sliding-window-panel';

export default function SlidingWindowVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">滑动窗口 Sliding Window</h1>
        <p className="text-gray-400 text-sm mt-1">
          以"无重复字符的最长子串"为例：右指针扩窗，遇到重复字符则左指针一直收缩至合法，更新答案。
        </p>
      </div>
      <SlidingWindowPanel />
    </div>
  );
}
