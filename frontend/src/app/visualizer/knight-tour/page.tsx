import { KnightTourPanel } from '@/components/visualizer/knight-tour-panel';

export default function KnightTourPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">骑士巡游 Knight Tour</h1>
        <p className="text-gray-400 text-sm mt-1">回溯算法：走遍棋盘每个格子各一次（日字走法）。</p>
      </div>
      <KnightTourPanel />
    </div>
  );
}
