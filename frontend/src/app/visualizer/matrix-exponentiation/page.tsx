import { MatrixExponentiationPanel } from '@/components/visualizer/matrix-exponentiation-panel';

export default function MatrixExponentiationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">矩阵快速幂 Matrix Exponentiation</h1>
        <p className="text-gray-400 text-sm mt-1">
          以斐波那契数列为例，O(log n) 求解。观察指数的二进制分解、矩阵平方与乘法过程。
        </p>
      </div>
      <MatrixExponentiationPanel />
    </div>
  );
}
