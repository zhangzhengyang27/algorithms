'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const eulerianCode = [
  'function eulerPath(edges, start) {',
  '  const adj = new Map();',
  '  for (const [u, v] of edges) {',
  '    if (!adj.has(u)) adj.set(u, []);',
  '    adj.get(u).push(v);',
  '  }',
  '  const stack = [start];',
  '  const path = [];',
  '  while (stack.length) {',
  '    const u = stack[stack.length - 1];',
  '    if (adj.get(u)?.length) stack.push(adj.get(u).pop());',
  '    else path.push(stack.pop());',
  '  }',
  '  return path.reverse();',
  '}',
];

const DEFAULT_EDGES: [number, number][] = [[0, 1], [1, 2], [2, 0], [0, 3], [3, 4], [4, 0]];
const DEFAULT_START = 0;

interface EulerianState {
  edges: [number, number][];
  adj: { node: number; neighbors: number[] }[];
  usedEdges: string[];
  currentEdge: [number, number] | null;
  stack: number[];
  path: number[];
  phase: 'init' | 'move' | 'backtrack' | 'done';
  result: number[] | null;
  message: string;
}

export function buildSteps(edges: [number, number][], start: number): VizStep<EulerianState>[] {
  const steps: VizStep<EulerianState>[] = [];
  const adj = new Map<number, number[]>();
  for (const [u, v] of edges) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)!.push(v);
  }
  const usedEdges: string[] = [];
  const stack = [start];
  const path: number[] = [];

  const snap = (extra: Partial<EulerianState> & { message: string }): EulerianState => ({
    edges,
    adj: [...adj.entries()].map(([node, neighbors]) => ({ node, neighbors: [...neighbors] })).sort((a, b) => a.node - b.node),
    usedEdges: [...usedEdges],
    currentEdge: null,
    stack: [...stack],
    path: [...path],
    phase: 'init',
    result: null,
    ...extra,
  });

  steps.push({
    state: snap({ message: `从节点 ${start} 出发，构建邻接表，stack = [${start}]` }),
    description: '初始化',
    codeLine: 6,
  });

  while (stack.length) {
    const u = stack[stack.length - 1];
    const neighbors = adj.get(u) ?? [];
    if (neighbors.length) {
      const v = neighbors.pop()!;
      usedEdges.push(`${u}-${v}`);
      stack.push(v);
      steps.push({
        state: snap({ currentEdge: [u, v], phase: 'move', message: `栈顶 ${u} 还有未走的边 ${u}→${v}：走这条边，${v} 入栈` }),
        description: `走 ${u}→${v}`,
        codeLine: 10,
      });
    } else {
      const popped = stack.pop()!;
      path.push(popped);
      steps.push({
        state: snap({ phase: 'backtrack', message: `栈顶 ${popped} 无未走边，回溯：${popped} 出栈并记入 path` }),
        description: `回溯 ${popped}`,
        codeLine: 11,
      });
    }
  }

  const result = [...path].reverse();
  steps.push({
    state: snap({ phase: 'done', result, message: `将 path 逆序得到欧拉回路：${result.join(' → ')}` }),
    description: '完成',
    codeLine: 13,
  });
  return steps;
}

function edgeGeom(x1: number, y1: number, x2: number, y2: number, r: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const sx = x1 + ux * (r + 3), sy = y1 + uy * (r + 3);
  const ex = x2 - ux * (r + 7), ey = y2 - uy * (r + 7);
  const angle = Math.atan2(ey - sy, ex - sx);
  const arrow = `${ex},${ey} ${ex - 9 * Math.cos(angle - 0.42)},${ey - 9 * Math.sin(angle - 0.42)} ${ex - 9 * Math.cos(angle + 0.42)},${ey - 9 * Math.sin(angle + 0.42)}`;
  return { sx, sy, ex, ey, arrow };
}

export function EulerianPathPanel() {
  const edges = DEFAULT_EDGES;
  const start = DEFAULT_START;
  const steps = useMemo(() => buildSteps(edges, start), [edges, start]);

  const nodeCount = Math.max(...edges.flat()) + 1;
  const CX = 200, CY = 150, R = 105, NR = 17;
  const pos = Array.from({ length: nodeCount }, (_, i) => {
    const ang = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
    return { x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang) };
  });

  const initial: EulerianState = {
    edges, adj: [], usedEdges: [], currentEdge: null,
    stack: [start], path: [], phase: 'init', result: null, message: '',
  };

  return (
    <Stepper<EulerianState>
      steps={steps}
      initialState={initial}
      codeLines={eulerianCode}
      codeTitle="欧拉路径 Hierholzer"
      render={(state) => {
        const top = state.stack.length ? state.stack[state.stack.length - 1] : -1;
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">
              黄色=当前走的边/栈顶，绿色=已走过的边，蓝色=栈中节点
            </div>

            <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
              {state.edges.map(([u, v], i) => {
                const g = edgeGeom(pos[u].x, pos[u].y, pos[v].x, pos[v].y, NR);
                const key = `${u}-${v}`;
                const isCurrent = state.currentEdge && state.currentEdge[0] === u && state.currentEdge[1] === v;
                const isUsed = state.usedEdges.includes(key);
                const color = isCurrent ? '#eab308' : isUsed ? '#16a34a' : '#444';
                return (
                  <g key={i}>
                    <line x1={g.sx} y1={g.sy} x2={g.ex} y2={g.ey} stroke={color} strokeWidth={isCurrent ? 3 : 2} />
                    <polygon points={g.arrow} fill={color} />
                  </g>
                );
              })}
              {pos.map((p, i) => {
                const isTop = i === top;
                const inStack = state.stack.includes(i);
                return (
                  <g key={i}>
                    <circle
                      cx={p.x} cy={p.y} r={NR}
                      fill={isTop ? '#eab30833' : inStack ? '#3b82f62e' : '#1a1a1a'}
                      stroke={isTop ? '#eab308' : inStack ? '#3b82f6' : '#444'}
                      strokeWidth={2}
                    />
                    <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="13" fontWeight="bold"
                      fill={isTop ? '#fde047' : inStack ? '#93c5fd' : '#9ca3af'}>{i}</text>
                  </g>
                );
              })}
            </svg>

            <div className="flex flex-wrap gap-4 text-xs font-mono">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">stack:</span>
                {state.stack.map((u, i) => (
                  <span key={i} className={clsx('px-2 py-0.5 rounded border', i === state.stack.length - 1 ? 'bg-yellow-500/25 border-yellow-400 text-yellow-200' : 'bg-blue-500/15 border-blue-500/50 text-blue-200')}>{u}</span>
                ))}
                {state.stack.length === 0 && <span className="text-gray-600">[空]</span>}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">path:</span>
                {state.path.map((u, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-green-900/30 border border-green-800 text-green-300">{u}</span>
                ))}
                {state.path.length === 0 && <span className="text-gray-600">[空]</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="text-gray-500">剩余邻接表:</span>
              {state.adj.map((a) => (
                <span key={a.node} className="px-2 py-0.5 rounded bg-surface-2 border border-edge-2 text-ink-3">
                  {a.node}: [{a.neighbors.join(', ')}]
                </span>
              ))}
            </div>

            {state.phase === 'done' && state.result && (
              <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <span className="text-green-300 font-mono text-sm">欧拉回路：{state.result.join(' → ')}</span>
              </div>
            )}

            {state.message && (
              <div className="text-center text-sm text-gray-300">{state.message}</div>
            )}
          </div>
        );
      }}
    />
  );
}
