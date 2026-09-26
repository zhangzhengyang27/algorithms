import { RecursionPanel } from '@/components/visualizer/recursion-panel';

export default function RecursionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">递归 Recursion</h1>
        <p className="text-gray-400 text-sm mt-1">
          可视化函数调用栈：阶乘 n! 与斐波那契 fib(n) 的递归展开与回溯过程。
        </p>
      </div>
      <RecursionPanel />
    </div>
  );
}
