import { ChineseRemainderTheoremPanel } from '@/components/visualizer/chinese-remainder-theorem-panel';

export default function ChineseRemainderTheoremPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">中国剩余定理 Chinese Remainder Theorem</h1>
        <p className="text-gray-400 text-sm mt-1">
          求解一元线性同余方程组。观察 M/Mᵢ 计算、逆元求解与逐项合并得解的全过程。
        </p>
      </div>
      <ChineseRemainderTheoremPanel />
    </div>
  );
}
