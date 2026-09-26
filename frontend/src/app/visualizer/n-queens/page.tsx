import { NQueensPanel } from '@/components/visualizer/n-queens-panel';

export default function NQueensPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">N 皇后 N-Queens</h1>
        <p className="text-gray-400 text-sm mt-1">
          回溯算法：在 N×N 棋盘上放置 N 个互不攻击的皇后，逐行尝试并回溯。
        </p>
      </div>
      <NQueensPanel />
    </div>
  );
}
