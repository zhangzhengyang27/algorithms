import { BitManipulationPanel } from '@/components/visualizer/bit-manipulation-panel';

export default function BitManipulationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">位运算 Bit Manipulation</h1>
        <p className="text-gray-400 text-sm mt-1">
          逐位演示 AND / OR / XOR / NOT / 移位运算，看清每一位的变化。
        </p>
      </div>
      <BitManipulationPanel />
    </div>
  );
}
