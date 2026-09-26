import { NumberTheoryPanel } from '@/components/visualizer/number-theory-panel';

export default function NumberTheoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数论基础 Number Theory</h1>
        <p className="text-gray-400 text-sm mt-1">
          快速幂（二进制拆位）、辗转相除法求 gcd、埃氏筛求素数。观察每一步的数字变化与高亮。
        </p>
      </div>
      <NumberTheoryPanel />
    </div>
  );
}
