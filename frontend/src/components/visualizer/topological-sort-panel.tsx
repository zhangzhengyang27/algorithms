'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const topoSortCode = [
  'function kahnTopoSort(n, edges) {',
  '  const inDegree = new Array(n).fill(0);',
  '  for (const [u, v] of edges) inDegree[v]++;',
  '  const queue = [];',
  '  for (let i = 0; i < n; i++) if (inDegree[i] === 0) queue.push(i);',
  '  const result = [];',
  '  while (queue.length) {',
  '    const node = queue.shift();',
  '    result.push(node);',
  '    for (const next of adj[node])',
  '      if (--inDegree[next] === 0) queue.push(next);',
  '  }',
  '  return result;',
  '}',
];

interface TopoState {
  nodes: number[];
  edges: [number, number][];
  inDegree: number[];
  queue: number[];
  result: number[];
  currentNode: number;
  removedEdges: [number, number][];
  message: string;
}

function buildSteps(n: number, edges: [number, number][]): VizStep<TopoState>[] {
  const steps: VizStep<TopoState>[] = [];
  const inDegree = new Array(n).fill(0);
  const adj: number[][] = Array.from({ length: n }, () => []);

  for (const [u, v] of edges) {
    adj[u].push(v);
    inDegree[v]++;
  }

  const snap = (
    deg: number[],
    q: number[],
    res: number[],
    cur: number,
    removed: [number, number][],
    msg: string,
  ): TopoState => ({
    nodes: Array.from({ length: n }, (_, i) => i),
    edges,
    inDegree: [...deg],
    queue: [...q],
    result: [...res],
    currentNode: cur,
    removedEdges: [...removed],
    message: msg,
  });

  steps.push({
    state: snap(inDegree, [], [], -1, [], `初始化：${n} 个节点，计算入度`),
    description: '初始化入度',
    codeLine: 2,
  });

  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  steps.push({
    state: snap(inDegree, queue, [], -1, [], `入度为 0 的节点入队：[${queue.join(', ')}]`),
    description: '初始队列',
    codeLine: 5,
  });

  const result: number[] = [];
  const removed: [number, number][] = [];
  const deg = [...inDegree];
  let qi = 0;

  while (qi < queue.length) {
    const node = queue[qi];
    qi++;
    result.push(node);

    steps.push({
      state: snap(deg, queue.slice(qi), result, node, removed, `出队节点 ${node}，加入拓扑序`),
      description: `处理节点 ${node}`,
      codeLine: 8,
    });

    for (const next of adj[node]) {
      deg[next]--;
      removed.push([node, next]);
      if (deg[next] === 0) {
        queue.push(next);
        steps.push({
          state: snap(deg, queue.slice(qi), result, node, removed, `边 ${node}→${next} 移除，inDegree[${next}]=0，入队`),
          description: `${next} 入度归零，入队`,
          codeLine: 11,
        });
      } else {
        steps.push({
          state: snap(deg, queue.slice(qi), result, node, removed, `边 ${node}→${next} 移除，inDegree[${next}]=${deg[next]}`),
          description: `移除边 ${node}→${next}`,
          codeLine: 11,
        });
      }
    }
  }

  const hasCycle = result.length < n;
  steps.push({
    state: snap(deg, [], result, -1, removed, hasCycle ? `⚠️ 存在环！只有 ${result.length}/${n} 个节点完成排序` : `✅ 拓扑排序完成：[${result.join(', ')}]`),
    description: hasCycle ? '检测到环' : '排序完成',
    codeLine: 13,
  });

  return steps;
}

export function TopologicalSortPanel() {
  const [edgesText, setEdgesText] = useState('0,1 0,2 1,3 2,3 3,4 4,5');
  const [nodeCount, setNodeCount] = useState(6);

  const edges = useMemo<[number, number][]>(() => {
    return edgesText
      .split(/\s+/)
      .map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 2 && p.every(Number.isFinite))
      .map(([a, b]) => [a, b] as [number, number]);
  }, [edgesText]);

  const steps = useMemo(() => buildSteps(nodeCount, edges), [nodeCount, edges]);
  const initial: TopoState = {
    nodes: Array.from({ length: nodeCount }, (_, i) => i),
    edges,
    inDegree: new Array(nodeCount).fill(0),
    queue: [],
    result: [],
    currentNode: -1,
    removedEdges: [],
    message: '',
  };

  return (
    <Stepper<TopoState>
      steps={steps}
      initialState={initial}
      codeLines={topoSortCode}
      codeTitle="拓扑排序 Topological Sort"
      headerActions={
        <>
          <span className="text-sm text-gray-400">节点数:</span>
          <input
            type="number"
            value={nodeCount}
            onChange={(e) => setNodeCount(Math.max(2, Math.min(12, Number(e.target.value))))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
          <span className="text-sm text-gray-400">边(u,v):</span>
          <input
            type="text"
            value={edgesText}
            onChange={(e) => setEdgesText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="空格分隔，如 0,1 1,2"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前处理，绿色=已排序，蓝色=队列中，灰色=未处理
          </div>

          {/* Nodes */}
          <div className="flex items-center justify-center gap-3 flex-wrap min-h-[80px]">
            {state.nodes.map((node) => {
              const isDone = state.result.includes(node);
              const isCurrent = node === state.currentNode;
              const inQueue = state.queue.includes(node);
              return (
                <div key={node} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      'w-11 h-11 flex items-center justify-center rounded-lg text-sm font-mono border-2 transition-all',
                      isCurrent
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                        : isDone
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : inQueue
                            ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                            : 'bg-surface-2 border-edge-2 text-gray-400',
                    )}
                  >
                    {node}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    入度={state.inDegree[node]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">边:</span>
            {state.edges.map(([u, v], i) => {
              const isRemoved = state.removedEdges.some(([ru, rv]) => ru === u && rv === v);
              return (
                <span
                  key={i}
                  className={clsx(
                    'px-2 py-0.5 rounded text-xs font-mono',
                    isRemoved ? 'bg-red-900/30 text-red-400 line-through' : 'bg-surface-2 text-gray-400',
                  )}
                >
                  {u}→{v}
                </span>
              );
            })}
          </div>

          {/* Result */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500">拓扑序:</span>
            <span className="font-mono text-sm text-green-300">
              [{state.result.join(', ')}]
            </span>
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
