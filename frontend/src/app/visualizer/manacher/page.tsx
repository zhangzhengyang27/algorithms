import { ManacherPanel } from '@/components/visualizer/manacher-panel';

export default function ManacherPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manacher 算法</h1>
        <p className="text-gray-400 text-sm mt-1">
          O(n) 求最长回文子串。观察回文半径数组 p[] 的计算、镜像复用与中心扩展。
        </p>
      </div>
      <ManacherPanel />
    </div>
  );
}
