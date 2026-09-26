import { TwoSatPanel } from '@/components/visualizer/two-sat-panel';

export default function TwoSatPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">2-SAT 问题</h1>
        <p className="text-gray-400 text-sm mt-1">
          构建蕴含图，Tarjan 缩点检测矛盾，按拓扑序赋值判断可满足性。
        </p>
      </div>
      <TwoSatPanel />
    </div>
  );
}
