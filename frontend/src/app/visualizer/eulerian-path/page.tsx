import { EulerianPathPanel } from '@/components/visualizer/eulerian-path-panel';

export default function EulerianPathPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">欧拉路径 Eulerian Path</h1>
        <p className="text-gray-400 text-sm mt-1">
          用 Hierholzer 算法求欧拉回路：沿未走边 DFS 入栈，无路可走时回溯记入 path，最后逆序输出。
        </p>
      </div>
      <EulerianPathPanel />
    </div>
  );
}
