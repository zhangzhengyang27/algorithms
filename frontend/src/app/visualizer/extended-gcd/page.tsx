import { ExtendedGcdPanel } from '@/components/visualizer/extended-gcd-panel';

export default function ExtendedGcdPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">扩展欧几里得 Extended GCD</h1>
        <p className="text-gray-400 text-sm mt-1">
          求解 ax + by = gcd(a,b) 的整数解。观察递归回溯过程中每层 x/y 系数的推导与贝祖等式验证。
        </p>
      </div>
      <ExtendedGcdPanel />
    </div>
  );
}
