import { SortingPanel } from '@/components/visualizer/sorting-panel';

export default function SortingVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">排序算法可视化</h1>
        <p className="text-gray-400 text-sm">
          交互式演示各种排序算法的执行过程，右侧代码实时联动高亮当前执行行
        </p>
      </div>

      <SortingPanel />
    </div>
  );
}
