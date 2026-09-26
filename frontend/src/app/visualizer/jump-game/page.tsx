import { JumpGamePanel } from '@/components/visualizer/jump-game-panel';

export default function JumpGamePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">跳跃游戏 Jump Game</h1>
        <p className="text-gray-400 text-sm mt-1">
          贪心：从右向左维护最左可达目标，若下标 0 即目标则可达。
        </p>
      </div>
      <JumpGamePanel />
    </div>
  );
}
