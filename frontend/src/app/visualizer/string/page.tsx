import { StringPanel } from '@/components/visualizer/string-panel';

export default function StringPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">字符串基础 String Basics</h1>
        <p className="text-gray-400 text-sm mt-1">
          字符串的五大基本操作：遍历字符、反转、回文判断（双指针）、子串查找、字符统计，逐字符高亮演示。
        </p>
      </div>
      <StringPanel />
    </div>
  );
}
