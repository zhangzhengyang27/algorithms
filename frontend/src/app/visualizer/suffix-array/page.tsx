import { SuffixArrayPanel } from '@/components/visualizer/suffix-array-panel';

export default function SuffixArrayPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">后缀数组 Suffix Array</h1>
        <p className="text-gray-400 text-sm mt-1">
          倍增法构建 sa[] 与 rank[]，Kasai 算法计算 height[]。观察双关键字排序与后缀逐步区分的过程。
        </p>
      </div>
      <SuffixArrayPanel />
    </div>
  );
}
