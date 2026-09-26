import { TreeTraversalPanel } from '@/components/visualizer/tree-traversal-panel';

export default function TreesVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">二叉树遍历可视化</h1>
        <p className="text-gray-400">
          交互式演示二叉树的三种遍历方式：前序、中序、后序，理解递归遍历的执行过程
        </p>
      </div>

      <TreeTraversalPanel />
    </div>
  );
}
