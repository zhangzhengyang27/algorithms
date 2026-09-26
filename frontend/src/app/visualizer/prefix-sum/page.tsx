import { PrefixSumPanel } from '@/components/visualizer/prefix-sum-panel';

export default function PrefixSumPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">前缀和 Prefix Sum</h1>
        <p className="text-gray-400 text-sm mt-1">
          O(n) 预处理，O(1) 区间求和。观察前缀数组构建与区间查询过程。
        </p>
      </div>
      <PrefixSumPanel />
    </div>
  );
}
