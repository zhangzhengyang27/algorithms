import { BipartiteGraphPanel } from '@/components/visualizer/bipartite-graph-panel';

export default function BipartiteGraphPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">二分图 Bipartite Graph</h1>
        <p className="text-gray-400 text-sm mt-1">
          先用染色法判定二分图，再用匈牙利算法寻找增广路径求最大匹配。
        </p>
      </div>
      <BipartiteGraphPanel />
    </div>
  );
}
