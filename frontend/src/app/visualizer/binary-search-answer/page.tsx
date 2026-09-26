import { BinarySearchAnswerPanel } from '@/components/visualizer/binary-search-answer-panel';

export default function BinarySearchAnswerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">二分答案 Binary Search on Answer</h1>
        <p className="text-gray-400 text-sm mt-1">
          以木材切割为例：对答案空间二分，用 check 函数验证可行性，逐步收缩搜索区间。
        </p>
      </div>
      <BinarySearchAnswerPanel />
    </div>
  );
}
