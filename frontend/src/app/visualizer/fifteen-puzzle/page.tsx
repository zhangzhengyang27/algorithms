import { FifteenPuzzlePanel } from '@/components/visualizer/fifteen-puzzle-panel';

export default function FifteenPuzzlePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">十五数码 15-Puzzle</h1>
        <p className="text-ink-3 text-sm mt-1">
          4×4 棋盘上滑动方块还原到目标布局。状态空间高达 16!（BFS 不可行），用 IDA* + 曼哈顿距离启发求解最短路径，逐帧观察还原过程。
        </p>
      </div>
      <FifteenPuzzlePanel />
    </div>
  );
}
