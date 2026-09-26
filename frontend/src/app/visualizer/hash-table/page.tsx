import { HashTablePanel } from '@/components/visualizer/hash-table-panel';

export default function HashTableVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">哈希表 Hash Table</h1>
        <p className="text-gray-400 text-sm mt-1">
          链地址法（separate chaining），容量 5，模运算散列。
        </p>
      </div>
      <HashTablePanel />
    </div>
  );
}
