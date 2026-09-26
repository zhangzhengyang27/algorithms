import { TwoPointersPanel } from '@/components/visualizer/two-pointers-panel';

export default function TwoPointersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">双指针 Two Pointers</h1>
        <p className="text-gray-400 text-sm mt-1">
          在排序数组中寻找两数之和等于目标值的配对。左右指针相向而行。
        </p>
      </div>
      <TwoPointersPanel />
    </div>
  );
}
