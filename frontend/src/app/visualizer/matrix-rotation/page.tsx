import { MatrixRotationPanel } from '@/components/visualizer/matrix-rotation-panel';

export default function MatrixRotationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">矩阵顺时针旋转</h1>
        <p className="text-gray-400 text-sm mt-1">先沿主对角线转置，再逐行左右翻转，即可原地旋转 90°。</p>
      </div>
      <MatrixRotationPanel />
    </div>
  );
}
