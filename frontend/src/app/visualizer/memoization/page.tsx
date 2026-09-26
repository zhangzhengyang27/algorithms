import { MemoizationPanel } from '@/components/visualizer/memoization-panel';

export default function MemoizationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">记忆化搜索 Memoization</h1>
        <p className="text-gray-400 text-sm mt-1">
          以斐波那契为例，对比朴素递归的重复计算与记忆化后的调用树剪枝，观察 memo 表的填充。
        </p>
      </div>
      <MemoizationPanel />
    </div>
  );
}
