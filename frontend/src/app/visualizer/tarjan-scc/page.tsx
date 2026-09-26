import { TarjanSCCPanel } from '@/components/visualizer/tarjan-scc-panel';

export default function TarjanSCCPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tarjan 强连通分量 SCC</h1>
        <p className="text-gray-400 text-sm mt-1">
          单次 DFS 求有向图强连通分量。观察 dfn/low 值计算、栈操作与分量识别。
        </p>
      </div>
      <TarjanSCCPanel />
    </div>
  );
}
