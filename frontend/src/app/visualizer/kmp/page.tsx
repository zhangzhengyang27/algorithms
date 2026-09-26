import { KMPPanel } from '@/components/visualizer/kmp-panel';

export default function KMPPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">KMP 字符串匹配</h1>
        <p className="text-gray-400 text-sm mt-1">
          构建 next 数组（前缀函数），演示失配回退与高效匹配过程。
        </p>
      </div>
      <KMPPanel />
    </div>
  );
}
