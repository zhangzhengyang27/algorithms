import { HanoiTowerPanel } from '@/components/visualizer/hanoi-tower-panel';

export default function HanoiTowerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">汉诺塔 Tower of Hanoi</h1>
        <p className="text-gray-400 text-sm mt-1">
          递归分治：将 A 柱的圆盘全部移到 C 柱，每次只移一个且大盘不能压小盘。
        </p>
      </div>
      <HanoiTowerPanel />
    </div>
  );
}
