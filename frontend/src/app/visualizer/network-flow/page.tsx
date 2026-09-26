import { NetworkFlowPanel } from '@/components/visualizer/network-flow-panel';

export default function NetworkFlowPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">网络流 Network Flow</h1>
        <p className="text-gray-400 text-sm mt-1">
          Edmonds-Karp（BFS 增广）求最大流。观察残量网络中增广路径的查找、流量推送与最大流累积。
        </p>
      </div>
      <NetworkFlowPanel />
    </div>
  );
}
