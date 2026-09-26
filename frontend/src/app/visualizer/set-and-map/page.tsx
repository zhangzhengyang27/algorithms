import { SetAndMapPanel } from '@/components/visualizer/set-and-map-panel';

export default function SetAndMapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">集合与映射 Set &amp; Map</h1>
        <p className="text-gray-400 text-sm mt-1">
          观察 Set 的增删查（自动去重、哈希分桶）与 Map 的键值对操作，理解平均 O(1) 的原理。
        </p>
      </div>
      <SetAndMapPanel />
    </div>
  );
}
