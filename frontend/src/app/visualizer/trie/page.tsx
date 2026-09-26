import { TriePanel } from '@/components/visualizer/trie-panel';

export default function TriePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">前缀树 Trie</h1>
        <p className="text-gray-400 text-sm mt-1">
          逐步插入单词，观察 Trie 节点的创建与共享前缀过程。
        </p>
      </div>
      <TriePanel />
    </div>
  );
}
