import { HashCollisionPanel } from '@/components/visualizer/hash-collision-panel';

export default function HashCollisionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">哈希冲突 Hash Collision</h1>
        <p className="text-gray-400 text-sm mt-1">
          同一个哈希值被多个键命中时怎么办？对比开放寻址（线性探测）、链地址法、再哈希（双重哈希）三种解决策略。
        </p>
      </div>
      <HashCollisionPanel />
    </div>
  );
}
