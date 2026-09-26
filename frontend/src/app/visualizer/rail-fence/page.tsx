import { RailFenceCipherPanel } from '@/components/visualizer/rail-fence-panel';

export default function RailFencePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">栅栏密码 Rail Fence</h1>
        <p className="text-gray-400 text-sm mt-1">
          古典密码：明文按之字形写在多条轨道，逐行读出得密文。
        </p>
      </div>
      <RailFenceCipherPanel />
    </div>
  );
}
