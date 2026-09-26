import { GameTheoryPanel } from '@/components/visualizer/game-theory-panel';

export default function GameTheoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">博弈论 Game Theory</h1>
        <p className="text-gray-400 text-sm mt-1">
          以 Nim 游戏为例：SG 函数、异或和（Nim-sum）判断必胜/必败态，并找出必胜操作。
        </p>
      </div>
      <GameTheoryPanel />
    </div>
  );
}
