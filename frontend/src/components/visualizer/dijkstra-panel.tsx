'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const dijkstraCode = [
  'function dijkstra(n, edges, src) {',
  '  const dist = new Array(n).fill(Infinity);',
  '  dist[src] = 0;',
  '  const visited = new Array(n).fill(false);',
  '  for (let iter = 0; iter < n; iter++) {',
  '    let u = -1;',
  '    for (let i = 0; i < n; i++)',
  '      if (!visited[i] && (u === -1 || dist[i] < dist[u])) u = i;',
  '    visited[u] = true;',
  '    for (const {to: v, w} of adj[u])',
  '      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;',
  '  }',
  '  return dist;',
  '}',
];

interface Edge {
  to: number;
  w: number;
}

interface DijkstraState {
  n: number;
  edges: [number, number, number][];
  dist: number[];
  visited: boolean[];
  current: number;
  relaxEdge: [number, number] | null;
  message: string;
}

function buildSteps(n: number, edges: [number, number, number][], src: number): VizStep<DijkstraState>[] {
  const steps: VizStep<DijkstraState>[] = [];
  const adj: Edge[][] = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push({ to: v, w });
    adj[v].push({ to: u, w });
  }

  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  dist[src] = 0;

  const snap = (cur: number, re: [number, number] | null, msg: string): DijkstraState => ({
    n,
    edges,
    dist: [...dist],
    visited: [...visited],
    current: cur,
    relaxEdge: re,
    message: msg,
  });

  steps.push({
    state: snap(src, null, `初始化：dist[${src}]=0，其余为 ∞`),
    description: '初始化距离',
    codeLine: 3,
  });

  for (let iter = 0; iter < n; iter++) {
    // Find unvisited min dist
    let u = -1;
    let minD = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i] < minD) {
        minD = dist[i];
        u = i;
      }
    }
    if (u === -1) break;

    visited[u] = true;
    steps.push({
      state: snap(u, null, `选取未访问中距离最小的节点 ${u}（dist=${dist[u]}），标记已访问`),
      description: `访问节点 ${u}`,
      codeLine: 9,
    });

    for (const { to: v, w } of adj[u]) {
      if (visited[v]) continue;
      const newDist = dist[u] + w;
      if (newDist < dist[v]) {
        steps.push({
          state: snap(u, [u, v], `松弛边 ${u}→${v}：dist[${u}]+${w}=${newDist} < dist[${v}]=${dist[v] === Infinity ? '∞' : dist[v]}，更新`),
          description: `松弛 ${u}→${v}`,
          codeLine: 11,
        });
        dist[v] = newDist;
      } else {
        steps.push({
          state: snap(u, [u, v], `边 ${u}→${v}：dist[${u}]+${w}=${newDist} ≥ dist[${v}]=${dist[v]}，不更新`),
          description: `跳过 ${u}→${v}`,
          codeLine: 11,
        });
      }
    }
  }

  steps.push({
    state: snap(-1, null, `✅ 完成！从节点 ${src} 到各节点的最短距离已确定`),
    description: '算法完成',
    codeLine: 13,
  });

  return steps;
}

export function DijkstraPanel() {
  const [edgesText, setEdgesText] = useState('0,1,4 0,2,1 1,3,1 2,1,2 2,3,5 3,4,3');
  const [nodeCount, setNodeCount] = useState(5);
  const [source, setSource] = useState(0);

  const edges = useMemo<[number, number, number][]>(() => {
    return edgesText
      .split(/\s+/)
      .map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 3 && p.every(Number.isFinite))
      .map(([a, b, w]) => [a, b, w] as [number, number, number]);
  }, [edgesText]);

  const steps = useMemo(() => buildSteps(nodeCount, edges, source), [nodeCount, edges, source]);
  const initial: DijkstraState = {
    n: nodeCount,
    edges,
    dist: new Array(nodeCount).fill(Infinity),
    visited: new Array(nodeCount).fill(false),
    current: -1,
    relaxEdge: null,
    message: '',
  };

  return (
    <Stepper<DijkstraState>
      steps={steps}
      initialState={initial}
      codeLines={dijkstraCode}
      codeTitle="Dijkstra 最短路"
      headerActions={
        <>
          <span className="text-sm text-gray-400">节点:</span>
          <input
            type="number"
            value={nodeCount}
            onChange={(e) => setNodeCount(Math.max(2, Math.min(10, Number(e.target.value))))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
          />
          <span className="text-sm text-gray-400">起点:</span>
          <input
            type="number"
            value={source}
            onChange={(e) => setSource(Math.max(0, Math.min(nodeCount - 1, Number(e.target.value))))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
          />
          <span className="text-sm text-gray-400">边(u,v,w):</span>
          <input
            type="text"
            value={edgesText}
            onChange={(e) => setEdgesText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-64"
            placeholder="空格分隔，如 0,1,4 1,2,2"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前节点，绿色=已确定，蓝色=正在松弛的边，∞=不可达
          </div>

          {/* Nodes with distances */}
          <div className="flex items-center justify-center gap-4 flex-wrap min-h-[80px]">
            {Array.from({ length: state.n }, (_, i) => {
              const isCurrent = i === state.current;
              const isVisited = state.visited[i];
              const isRelaxTarget = state.relaxEdge !== null && state.relaxEdge[1] === i;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      'w-12 h-12 flex items-center justify-center rounded-full text-sm font-mono border-2 transition-all',
                      isCurrent
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                        : isRelaxTarget
                          ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                          : isVisited
                            ? 'bg-green-500/20 border-green-500 text-green-300'
                            : 'bg-surface-2 border-edge-2 text-gray-400',
                    )}
                  >
                    {i}
                  </div>
                  <div className={clsx(
                    'text-xs font-mono px-1.5 py-0.5 rounded',
                    state.dist[i] === Infinity ? 'text-gray-600' : 'text-gray-300',
                  )}>
                    {state.dist[i] === Infinity ? '∞' : state.dist[i]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">边:</span>
            {state.edges.map(([u, v, w], i) => {
              const isActive = state.relaxEdge !== null &&
                ((state.relaxEdge[0] === u && state.relaxEdge[1] === v) ||
                 (state.relaxEdge[0] === v && state.relaxEdge[1] === u));
              return (
                <span
                  key={i}
                  className={clsx(
                    'px-2 py-0.5 rounded text-xs font-mono',
                    isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-surface-2 text-gray-500',
                  )}
                >
                  {u}↔{v}({w})
                </span>
              );
            })}
          </div>

          {/* Distance table */}
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-gray-500 mr-2">dist[]:</span>
            {state.dist.map((d, i) => (
              <span
                key={i}
                className={clsx(
                  'px-2 py-0.5 rounded text-xs font-mono',
                  state.visited[i] ? 'bg-green-900/40 text-green-300' : 'bg-surface-2 text-gray-400',
                )}
              >
                {d === Infinity ? '∞' : d}
              </span>
            ))}
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
