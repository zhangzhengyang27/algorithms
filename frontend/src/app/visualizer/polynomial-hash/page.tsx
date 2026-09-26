import { PolynomialHashPanel } from '@/components/visualizer/polynomial-hash-panel';

export default function PolynomialHashPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">多项式滚动哈希</h1>
        <p className="text-gray-400 text-sm mt-1">h = (h*base + code) % modulus：Rabin-Karp 字符串匹配的核心。</p>
      </div>
      <PolynomialHashPanel />
    </div>
  );
}
