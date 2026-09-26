import { QueuePanel } from '@/components/visualizer/queue-panel';

export default function QueueVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">队列 Queue</h1>
        <p className="text-gray-400 text-sm mt-1">
          先进先出 (FIFO)。左侧出队，右侧入队。
        </p>
      </div>
      <QueuePanel />
    </div>
  );
}
