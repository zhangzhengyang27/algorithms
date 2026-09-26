import { LRUPanel } from '@/components/visualizer/lru-cache-panel';

export default function LRUCachePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LRU 缓存</h1>
        <p className="text-gray-400 text-sm mt-1">
          哈希表 + 双向链表：get/put 操作，观察淘汰最久未使用的缓存项。
        </p>
      </div>
      <LRUPanel />
    </div>
  );
}
