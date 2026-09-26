import { StringHashingPanel } from '@/components/visualizer/string-hashing-panel';

export default function StringHashingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">字符串哈希 String Hashing</h1>
        <p className="text-gray-400 text-sm mt-1">
          多项式滚动哈希。观察前缀哈希构建与 O(1) 子串哈希比较，实现 Rabin-Karp 模式匹配。
        </p>
      </div>
      <StringHashingPanel />
    </div>
  );
}
