import { AhoCorasickPanel } from '@/components/visualizer/aho-corasick-panel';

export default function AhoCorasickPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AC 自动机 Aho-Corasick</h1>
        <p className="text-gray-400 text-sm mt-1">
          多模式串匹配算法：Trie + fail 指针。观察自动机构建与在文本上的状态转移、命中输出过程。
        </p>
      </div>
      <AhoCorasickPanel />
    </div>
  );
}
