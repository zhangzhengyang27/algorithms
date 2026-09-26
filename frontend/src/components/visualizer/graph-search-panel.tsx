'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RefreshCw, GitBranch, Layers } from 'lucide-react';
import { generateRandomGraph, generateBFSSteps, generateDFSSteps, SearchStep, GraphNode } from '@/lib/algorithms/graph';
import clsx from 'clsx';
import { CodePanel } from './code-panel';

const graphSearchCode = [
  'function bfs(graph, start) {',
  '  const visited = new Set();',
  '  const queue = [start];',
  '  visited.add(start);',
  '  while (queue.length > 0) {',
  '    const node = queue.shift();',
  '    for (const neighbor of graph[node]) {',
  '      if (!visited.has(neighbor)) {',
  '        visited.add(neighbor);',
  '        queue.push(neighbor);',
  '      }',
  '    }',
  '  }',
  '}',
  '',
  'function dfs(graph, node, visited = new Set()) {',
  '  visited.add(node);',
  '  for (const neighbor of graph[node]) {',
  '    if (!visited.has(neighbor)) {',
  '      dfs(graph, neighbor, visited);',
  '    }',
  '  }',
  '}',
];

type AlgorithmType = 'bfs' | 'dfs';

const algorithms = [
  { id: 'bfs', name: '广度优先搜索 (BFS)', icon: Layers },
  { id: 'dfs', name: '深度优先搜索 (DFS)', icon: GitBranch },
] as const;

export function GraphSearchPanel() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bfs');
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: Array<{ from: string; to: string }> } | null>(null);
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentState, setCurrentState] = useState<SearchStep | null>(null);

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateNewGraph = useCallback(() => {
    const data = generateRandomGraph(6);
    setGraphData(data);
    const newSteps = algorithm === 'bfs'
      ? generateBFSSteps(data.nodes, 'node-0')
      : generateDFSSteps(data.nodes, 'node-0');
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
    if (newSteps.length > 0) {
      setCurrentState(newSteps[0]);
    }
  }, [algorithm]);

  useEffect(() => {
    generateNewGraph();
  }, [generateNewGraph]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 800);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      setCurrentState(steps[currentStep]);
    }
  }, [currentStep, steps]);

  // Draw graph on canvas
  useEffect(() => {
    if (!canvasRef.current || !graphData || !currentState) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    for (const edge of graphData.edges) {
      const fromNode = graphData.nodes.find(n => n.id === edge.from)!;
      const toNode = graphData.nodes.find(n => n.id === edge.to)!;

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
    }

    // Draw current path edges with highlight
    if (currentState.currentPath.length > 1) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      for (let i = 0; i < currentState.currentPath.length - 1; i++) {
        const fromNode = graphData.nodes.find(n => n.id === currentState.currentPath[i])!;
        const toNode = graphData.nodes.find(n => n.id === currentState.currentPath[i + 1])!;

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const node of graphData.nodes) {
      const isVisited = currentState.visited.includes(node.id);
      const isCurrent = currentState.nodeId === node.id;
      const isInPath = currentState.currentPath.includes(node.id);

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 24, 0, Math.PI * 2);

      if (isCurrent) {
        ctx.fillStyle = '#F59E0B';
      } else if (isInPath) {
        ctx.fillStyle = '#3B82F6';
      } else if (isVisited) {
        ctx.fillStyle = '#10B981';
      } else {
        ctx.fillStyle = '#374151';
      }

      ctx.fill();
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node value
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.value.toString(), node.x, node.y);
    }
  }, [graphData, currentState]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleAlgorithmChange = (newAlgo: AlgorithmType) => {
    setAlgorithm(newAlgo);
    const data = graphData;
    if (data) {
      const newSteps = newAlgo === 'bfs'
        ? generateBFSSteps(data.nodes, 'node-0')
        : generateDFSSteps(data.nodes, 'node-0');
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
      if (newSteps.length > 0) {
        setCurrentState(newSteps[0]);
      }
    }
  };

  const currentCodeLine = (() => {
    const desc = currentState?.description || '';
    if (algorithm === 'bfs') {
      if (desc.includes('初始化') || desc.includes('开始')) return 3;
      if (desc.includes('队列') || desc.includes('取出')) return 6;
      if (desc.includes('邻居') || desc.includes('邻接')) return 7;
      if (desc.includes('访问') || desc.includes('加入')) return 9;
      if (desc.includes('完成')) return 14;
      return 5;
    } else {
      if (desc.includes('初始化') || desc.includes('开始')) return 16;
      if (desc.includes('访问') || desc.includes('标记')) return 17;
      if (desc.includes('邻居') || desc.includes('邻接')) return 18;
      if (desc.includes('递归') || desc.includes('深入')) return 20;
      if (desc.includes('回溯')) return 21;
      if (desc.includes('完成')) return 23;
      return 16;
    }
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: '480px' }}>
      <div className="lg:col-span-3 space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            return (
              <button
                key={algo.id}
                onClick={() => handleAlgorithmChange(algo.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
                  algorithm === algo.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-surface-2 text-gray-400 hover:text-white'
                )}
              >
                <Icon size={16} />
                {algo.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={generateNewGraph}
          className="flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-edge rounded-lg text-sm transition-colors ml-auto"
        >
          <RefreshCw size={16} />
          新图
        </button>
      </div>

      {/* Visualization */}
      <div className="bg-surface rounded-xl border border-edge p-4">
        <canvas
          ref={canvasRef}
          width={500}
          height={300}
          className="w-full max-w-[500px] mx-auto"
        />
      </div>

      {/* Description */}
      <div className="text-center text-gray-300 text-sm min-h-[1.5rem] p-3 bg-surface rounded-lg border border-edge">
        {currentState?.description || '点击播放开始可视化'}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700 rounded-full" />
          <span className="text-gray-400">未访问</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full" />
          <span className="text-gray-400">已访问</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full" />
          <span className="text-gray-400">当前路径</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full" />
          <span className="text-gray-400">当前节点</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={handleReset} className="p-2 text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={20} />
        </button>

        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className={clsx(
            'p-3 rounded-full transition-colors',
            isPlaying ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
          )}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <div className="ml-4 text-sm text-gray-400">
          {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Step Slider */}
      <div className="px-4">
        <input
          type="range"
          min="0"
          max={Math.max(0, steps.length - 1)}
          value={currentStep}
          onChange={(e) => setCurrentStep(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Visit Order */}
      <div className="bg-surface rounded-lg border border-edge p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">访问顺序</h3>
        <div className="flex flex-wrap gap-2">
          {currentState?.visited.map((nodeId, index) => (
            <span key={nodeId} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
              {graphData?.nodes.find(n => n.id === nodeId)?.value}
            </span>
          ))}
          {currentState && currentState.visited.length === 0 && (
            <span className="text-gray-500 text-sm">无</span>
          )}
        </div>
      </div>
      </div>
      <div className="lg:col-span-2 min-h-[480px]">
        <CodePanel
          codeLines={graphSearchCode}
          highlightLine={currentCodeLine}
          description={currentState?.description || ''}
          title={algorithm === 'bfs' ? 'BFS 广度优先搜索' : 'DFS 深度优先搜索'}
        />
      </div>
    </div>
  );
}
