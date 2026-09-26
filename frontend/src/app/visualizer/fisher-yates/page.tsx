import { FisherYatesPanel } from '@/components/visualizer/fisher-yates-panel';

export default function FisherYatesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fisher-Yates 洗牌</h1>
        <p className="text-gray-400 text-sm mt-1">均匀洗牌：从后往前，与前面随机位置交换。</p>
      </div>
      <FisherYatesPanel />
    </div>
  );
}
