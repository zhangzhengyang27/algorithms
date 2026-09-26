import { LinearSearchPanel } from '@/components/visualizer/linear-search-panel';

export default function LinearSearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">线性查找 Linear Search</h1>
        <p className="text-gray-400 text-sm mt-1">
          最朴素的查找：从头到尾逐个比较。观察命中提前返回与查找失败遍历全部两种情况，时间复杂度 O(n)。
        </p>
      </div>
      <LinearSearchPanel />
    </div>
  );
}
