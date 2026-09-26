import { MaximumSubarrayPanel } from '@/components/visualizer/maximum-subarray-panel';

export default function MaximumSubarrayPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">最大子数组 Kadane</h1>
        <p className="text-gray-400 text-sm mt-1">
          动态规划：curSum 为负则归零，实时刷新最大连续子段和。
        </p>
      </div>
      <MaximumSubarrayPanel />
    </div>
  );
}
