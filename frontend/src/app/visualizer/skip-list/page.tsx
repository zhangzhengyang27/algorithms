import { SkipListPanel } from '@/components/visualizer/skip-list-panel';

export default function SkipListPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">跳表 Skip List</h1>
        <p className="text-gray-400 text-sm mt-1">
          概率平衡的多层索引链表，O(log n) 查找。观察逐层下降的查找路径与各层插入。
        </p>
      </div>
      <SkipListPanel />
    </div>
  );
}
