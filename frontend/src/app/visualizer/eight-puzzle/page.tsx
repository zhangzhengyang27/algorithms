import { EightPuzzlePanel } from '@/components/visualizer/eight-puzzle-panel';

export default function EightPuzzlePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">八数码 8-Puzzle</h1>
        <p className="text-ink-3 text-sm mt-1">
          3×3 棋盘上滑动方块还原到目标布局。用 BFS 在状态空间（9! 种排列）上求最短路径，逐帧观察方块如何还原——「最少步数」即 BFS 的最短解深度。
        </p>
      </div>
      <EightPuzzlePanel />
    </div>
  );
}
