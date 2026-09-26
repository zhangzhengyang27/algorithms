'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const networkFlowCode = [
  'function edmondsKarp(cap, s, t) {',
  '  const n = cap.length;',
  '  const flow = cap.map(r => r.map(() => 0));',
  '  let maxFlow = 0;',
  '  while (true) {',
  '    const parent = new Array(n).fill(-1);',
  '    parent[s] = s;',
  '    const queue = [s];',
  '    for (let qi = 0; qi < queue.length; qi++) {',
  '      const u = queue[qi];',
  '      for (let v = 0; v < n; v++)',
  '        if (parent[v] < 0 && cap[u][v] - flow[u][v] > 0) {',
  '          parent[v] = u;',
  '          queue.push(v);',
  '        }',
  '    }',
  '    if (parent[t] < 0) break;',
  '    let bottleneck = Infinity;',
  '    for (let v = t; v !== s; v = parent[v])',
  '      bottleneck = Math.min(bottleneck, cap[parent[v]][v] - flow[parent[v]][v]);',
  '    for (let v = t; v !== s; v = parent[v]) {',
  '      flow[parent[v]][v] += bottleneck;',
  '      flow[v][parent[v]] -= bottleneck;',
  '    }',
  '    maxFlow += bottleneck;',
  '  }',
  '  return maxFlow;',
  '}',
];

const NODE_POS: [number, number][] = [
  [70, 140], [230, 55], [230, 225], [400, 55], [400, 225], [560, 140],
];
const NODE_LABELS = ['S', 'A', 'B', 'C', 'D', 'T'];
const GRAPH_EDGES: [number, number, number][] = [
  [0, 1, 4], [0, 2, 3], [1, 2, 2], [1, 3, 3], [2, 4, 3], [3, 5, 4], [4, 5, 3],
];

interface NetworkFlowState {
  cap: number[][];
  flow: number[][];
  parent: number[];
  visited: number[];
  path: number[];
  bottleneck: number | null;
  maxFlow: number;
  phase: 'init' | 'bfs' | 'augment' | 'done';
  message: string;
}

function buildSteps(capInput: number[][]): VizStep<NetworkFlowState>[] {
  const steps: VizStep<NetworkFlowState>[] = [];
  const n = capInput.length;
  const cap = capInput.map((r) => [...r]);
  const flow = cap.map((r) => r.map(() => 0));
  const s = 0;
  const t = n - 1;
  let maxFlow = 0;

  const snap = (partial: Partial<NetworkFlowState> & { message: string }): NetworkFlowState => ({
    cap: cap.map((r) => [...r]),
    flow: flow.map((r) => [...r]),
    parent: new Array(n).fill(-1),
    visited: [],
    path: [],
    bottleneck: null,
    maxFlow,
    phase: 'init',
    ...partial,
  });

  steps.push({
    state: snap({ message: '初始化：flow 全部为 0，开始寻找增广路径' }),
    description: '初始化',
    codeLine: 2,
  });

  let round = 0;
  while (true) {
    round++;
    const parent = new Array(n).fill(-1);
    parent[s] = s;
    const queue = [s];
    const visited: number[] = [s];

    steps.push({
      state: snap({ parent: [...parent], visited: [...visited], phase: 'bfs', message: `第 ${round} 轮 BFS：从源点 S 出发寻找增广路径` }),
      description: `BFS#${round} 起点`,
      codeLine: 7,
    });

    for (let qi = 0; qi < queue.length; qi++) {
      const u = queue[qi];
      for (let v = 0; v < n; v++) {
        if (parent[v] < 0 && cap[u][v] - flow[u][v] > 0) {
          parent[v] = u;
          queue.push(v);
          visited.push(v);
          steps.push({
            state: snap({ parent: [...parent], visited: [...visited], phase: 'bfs', message: `BFS：节点 ${NODE_LABELS[u]} → ${NODE_LABELS[v]}，残量 = ${cap[u][v] - flow[u][v]} > 0，加入队列` }),
            description: `${NODE_LABELS[u]}→${NODE_LABELS[v]}`,
            codeLine: 13,
          });
        }
      }
    }

    if (parent[t] < 0) {
      steps.push({
        state: snap({ parent: [...parent], visited: [...visited], phase: 'done', message: `BFS 无法到达汇点 T，不存在增广路径，算法结束。最大流 = ${maxFlow}` }),
        description: '无增广路',
        codeLine: 16,
      });
      break;
    }

    const path: number[] = [];
    for (let v = t; v !== s; v = parent[v]) path.unshift(v);
    path.unshift(s);

    let bottleneck = Infinity;
    for (let v = t; v !== s; v = parent[v])
      bottleneck = Math.min(bottleneck, cap[parent[v]][v] - flow[parent[v]][v]);

    steps.push({
      state: snap({
        parent: [...parent], visited: [...visited], path: [...path], bottleneck, phase: 'augment',
        message: `找到增广路径 ${path.map((v) => NODE_LABELS[v]).join(' → ')}，瓶颈流量 = ${bottleneck}`,
      }),
      description: `增广路 瓶颈=${bottleneck}`,
      codeLine: 19,
    });

    for (let v = t; v !== s; v = parent[v]) {
      const u = parent[v];
      flow[u][v] += bottleneck;
      flow[v][u] -= bottleneck;
    }
    maxFlow += bottleneck;

    steps.push({
      state: snap({
        parent: [...parent], visited: [...visited], path: [...path], bottleneck, maxFlow, phase: 'augment',
        message: `沿路径每条边推送流量 ${bottleneck}，累计最大流 = ${maxFlow}`,
      }),
      description: `更新流量 +${bottleneck}`,
      codeLine: 24,
    });
  }

  steps.push({
    state: snap({ phase: 'done', message: `算法结束，最大流 = ${maxFlow}` }),
    description: `最大流 = ${maxFlow}`,
    codeLine: 26,
  });

  return steps;
}

function buildCapMatrix(edges: [number, number, number][]): number[][] {
  const m = new Array(6).fill(null).map(() => new Array(6).fill(0));
  for (const [u, v, c] of edges) m[u][v] = c;
  return m;
}

function edgePath(u: number, v: number, hasReverse: boolean): string {
  const [x1, y1] = NODE_POS[u];
  const [x2, y2] = NODE_POS[v];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const off = hasReverse ? 12 : 0;
  const cx = (x1 + x2) / 2 + (-dy / len) * off;
  const cy = (y1 + y2) / 2 + (dx / len) * off;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function quadPoint(t: number, x1: number, y1: number, cx: number, cy: number, x2: number, y2: number): [number, number] {
  const a = (1 - t) * (1 - t);
  const b = 2 * (1 - t) * t;
  const c = t * t;
  return [a * x1 + b * cx + c * x2, a * y1 + b * cy + c * y2];
}

export function NetworkFlowPanel() {
  const [edges] = useState<[number, number, number][]>(GRAPH_EDGES);
  const capMatrix = useMemo(() => buildCapMatrix(edges), [edges]);
  const steps = useMemo(() => buildSteps(capMatrix), [capMatrix]);

  const hasReverse = useMemo(() => {
    const set = new Set(edges.map(([u, v]) => `${u}-${v}`));
    return (u: number, v: number) => set.has(`${v}-${u}`);
  }, [edges]);

  const initial: NetworkFlowState = {
    cap: capMatrix,
    flow: capMatrix.map((r) => r.map(() => 0)),
    parent: new Array(6).fill(-1),
    visited: [],
    path: [],
    bottleneck: null,
    maxFlow: 0,
    phase: 'init',
    message: '',
  };

  return (
    <Stepper<NetworkFlowState>
      steps={steps}
      initialState={initial}
      codeLines={networkFlowCode}
      codeTitle="网络流 Network Flow (Edmonds-Karp)"
      render={(state) => {
        const pathEdgeSet = new Set<string>();
        for (let i = 0; i < state.path.length - 1; i++) {
          pathEdgeSet.add(`${state.path[i]}-${state.path[i + 1]}`);
        }
        return (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              蓝色=BFS 已访问，黄色=增广路径，边标注 = 流量/容量
            </div>
            <svg viewBox="0 0 630 280" className="w-full max-w-2xl mx-auto">
              <defs>
                <marker id="nf-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#666" />
                </marker>
                <marker id="nf-arrow-yellow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#facc15" />
                </marker>
                <marker id="nf-arrow-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#60a5fa" />
                </marker>
              </defs>
              {edges.map(([u, v, c]) => {
                const f = state.flow[u][v];
                const rev = hasReverse(u, v);
                const [x1, y1] = NODE_POS[u];
                const [x2, y2] = NODE_POS[v];
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.hypot(dx, dy);
                const off = rev ? 12 : 0;
                const cx = (x1 + x2) / 2 + (-dy / len) * off;
                const cy = (y1 + y2) / 2 + (dx / len) * off;
                const onPath = pathEdgeSet.has(`${u}-${v}`);
                const inTree = state.parent[v] === u && state.visited.includes(v) && state.phase === 'bfs';
                const color = onPath ? '#facc15' : inTree ? '#60a5fa' : '#555';
                const marker = onPath ? 'url(#nf-arrow-yellow)' : inTree ? 'url(#nf-arrow-blue)' : 'url(#nf-arrow)';
                const [lx, ly] = quadPoint(0.5, x1, y1, cx, cy, x2, y2);
                const nx = -dy / len;
                const ny = dx / len;
                const labelX = lx + nx * (off ? 16 : 12);
                const labelY = ly + ny * (off ? 16 : 12);
                return (
                  <g key={`${u}-${v}`}>
                    <path
                      d={edgePath(u, v, rev)}
                      fill="none"
                      stroke={color}
                      strokeWidth={onPath ? 2.5 : 1.5}
                      markerEnd={marker}
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fill={onPath ? '#fde047' : '#9ca3af'}
                      fontFamily="monospace"
                    >
                      {Math.max(0, f)}/{c}
                    </text>
                  </g>
                );
              })}
              {NODE_POS.map(([x, y], i) => {
                const isVisited = state.visited.includes(i);
                const onPath = state.path.includes(i);
                const isSource = i === 0;
                const isSink = i === NODE_POS.length - 1;
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r={20}
                      fill={onPath ? 'rgba(250,204,21,0.15)' : isVisited ? 'rgba(96,165,250,0.15)' : '#1a1a1a'}
                      stroke={onPath ? '#facc15' : isVisited ? '#60a5fa' : isSource || isSink ? '#4ade80' : '#444'}
                      strokeWidth={onPath || isSource || isSink ? 2 : 1.5}
                    />
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="bold" fill={onPath ? '#fde047' : isVisited ? '#93c5fd' : '#e5e7eb'}>
                      {NODE_LABELS[i]}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="flex items-center justify-center gap-6 text-sm font-mono">
              <span className="text-gray-400">
                最大流: <span className={clsx('font-bold', state.maxFlow > 0 ? 'text-green-400' : 'text-gray-300')}>{state.maxFlow}</span>
              </span>
              {state.bottleneck !== null && state.phase === 'augment' && (
                <span className="text-yellow-300">本轮瓶颈: {state.bottleneck}</span>
              )}
            </div>

            {state.message && (
              <div className="text-center text-sm text-gray-300">{state.message}</div>
            )}
          </div>
        );
      }}
    />
  );
}
