'use client';

import { BinarySearchPanel } from '@/components/visualizer/binary-search-panel';
import { GraphSearchPanel } from '@/components/visualizer/graph-search-panel';
import { useState } from 'react';
import clsx from 'clsx';

const tabs = [
  { id: 'binary', name: '二分查找', description: '有序数组搜索' },
  { id: 'bfs-dfs', name: '图搜索', description: 'BFS/DFS 遍历' },
] as const;

export default function SearchingVisualizerPage() {
  const [activeTab, setActiveTab] = useState<'binary' | 'bfs-dfs'>('binary');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8 anim-fade-up">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">搜索算法可视化</h1>
        <p className="text-ink-2 text-sm">
          交互式演示各种搜索算法的执行过程，理解算法背后的逻辑
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm transition-all',
              activeTab === tab.id
                ? 'bg-brand text-on-brand'
                : 'bg-surface border border-edge text-ink-2 hover:border-edge-2 hover:text-ink'
            )}
          >
            <div className="font-medium">{tab.name}</div>
            <div className="text-xs opacity-70">{tab.description}</div>
          </button>
        ))}
      </div>

      {/* Panels */}
      {activeTab === 'binary' && <BinarySearchPanel />}
      {activeTab === 'bfs-dfs' && <GraphSearchPanel />}
    </div>
  );
}
