import { DesignDataStructuresPanel } from '@/components/visualizer/design-data-structures-panel';

export default function DesignDataStructuresPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数据结构设计 Design Data Structures</h1>
        <p className="text-gray-400 text-sm mt-1">
          以循环队列为例，观察底层数组 + 双指针的设计、取模循环与边界处理（队满/队空判断）。
        </p>
      </div>
      <DesignDataStructuresPanel />
    </div>
  );
}
