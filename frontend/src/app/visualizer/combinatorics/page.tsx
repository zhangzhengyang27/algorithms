import { CombinatoricsPanel } from '@/components/visualizer/combinatorics-panel';

export default function CombinatoricsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">组合数学 Combinatorics</h1>
        <p className="text-gray-400 text-sm mt-1">
          杨辉三角递推组合数 C(n,k)，回溯法生成全排列。观察填表过程与递推来源。
        </p>
      </div>
      <CombinatoricsPanel />
    </div>
  );
}
