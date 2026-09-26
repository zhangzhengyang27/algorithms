import { LinkedListProblemsPanel } from '@/components/visualizer/linked-list-problems-panel';

export default function LinkedListProblemsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">链表经典问题 Linked List Problems</h1>
        <p className="text-gray-400 text-sm mt-1">
          快慢指针四连：Floyd 判圈、找环入口、合并两个有序链表、删除倒数第 k 个节点，指针移动全程动画。
        </p>
      </div>
      <LinkedListProblemsPanel />
    </div>
  );
}
