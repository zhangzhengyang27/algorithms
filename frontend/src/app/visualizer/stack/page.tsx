import { StackPanel } from '@/components/visualizer/stack-panel';

export default function StackVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">栈 Stack</h1>
        <p className="text-gray-400 text-sm mt-1">
          后进先出 (LIFO)。依次入栈 5 个值，再依次出栈。
        </p>
      </div>
      <StackPanel />
    </div>
  );
}
