import { HeapPanel } from '@/components/visualizer/heap-panel';

export default function HeapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">堆 Heap</h1>
        <p className="text-gray-400 text-sm mt-1">
          最大堆的插入（上浮 sift-up）与提取最大值（下沉 sift-down）全过程。
        </p>
      </div>
      <HeapPanel />
    </div>
  );
}
