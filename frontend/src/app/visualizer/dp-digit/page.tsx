import { DpDigitPanel } from '@/components/visualizer/dp-digit-panel';

export default function DpDigitPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数位 DP Digit DP</h1>
        <p className="text-gray-400 text-sm mt-1">
          以「统计 1~n 中数字 1 出现次数」为例，观察数位分解、limit 受限/自由状态与记忆化搜索过程。
        </p>
      </div>
      <DpDigitPanel />
    </div>
  );
}
