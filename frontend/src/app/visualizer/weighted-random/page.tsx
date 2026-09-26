import { WeightedRandomPanel } from '@/components/visualizer/weighted-random-panel';

export default function WeightedRandomPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">加权随机 Weighted Random</h1>
        <p className="text-gray-400 text-sm mt-1">统计：按累计权重随机落点，权重越大被选中概率越高。</p>
      </div>
      <WeightedRandomPanel />
    </div>
  );
}
