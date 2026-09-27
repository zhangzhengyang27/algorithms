'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const tarjanCode = [
  'function tarjanSCC(n, edges) {',
  '  const dfn = Array(n).fill(0), low = Array(n).fill(0);',
  '  const stack = [], inStack = Array(n).fill(false);',
  '  let ts = 0; const sccs = [];',
  '  function dfs(u) {',
  '    dfn[u] = low[u] = ++ts;',
  '    stack.push(u); inStack[u] = true;',
  '    for (const v of adj[u]) {',
  '      if (!dfn[v]) { dfs(v); low[u] = Math.min(low[u], low[v]); }',
  '      else if (inStack[v]) low[u] = Math.min(low[u], dfn[v]);',
  '    }',
  '    if (dfn[u] === low[u]) {',
  '      const scc = []; let v;',
  '      do { v = stack.pop(); inStack[v] = false; scc.push(v); } while (v !== u);',
  '      sccs.push(scc);',
  '    }',
  '  }',
  '  for (let i = 0; i < n; i++) if (!dfn[i]) dfs(i);',
  '  return sccs;',
  '}',
];

const SCC_COLORS = ['#22c55e', '#a855f7', '#f97316', '#06b6d4', '#ec4899', '#eab308', '#3b82f6', '#ef4444'];

interface TarjanState {
  n: number;
  edges: [number, number][];
  dfn: number[];
  low: number[];
  stack: number[];
  inStack: boolean[];
  currentNode: number;
  currentEdge: [number, number] | null;
  sccs: number[][];
  sccId: number[];
  phase: 'dfs' | 'done';
  message: string;
}

export function buildSteps(n: number, edges: [number, number][]): VizStep<TarjanState>[] {
  const steps: VizStep<TarjanState>[] = [];
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    if (u >= 0 && u < n && v >= 0 && v < n) adj[u].push(v);
  }
  const dfn = new Array(n).fill(0);
  const low = new Array(n).fill(0);
  const inStack = new Array(n).fill(false);
  const stack: number[] = [];
  const sccs: number[][] = [];
  const sccId = new Array(n).fill(-1);
  let ts = 0;

  const snap = (
    cur: number,
    curEdge: [number, number] | null,
    phase: 'dfs' | 'done',
    msg: string,
  ): TarjanState => ({
    n,
    edges,
    dfn: [...dfn],
    low: [...low],
    stack: [...stack],
    inStack: [...inStack],
    currentNode: cur,
    currentEdge: curEdge ? [curEdge[0], curEdge[1]] : null,
    sccs: sccs.map((s) => [...s]),
    sccId: [...sccId],
    phase,
    message: msg,
  });

  const push = (
    cur: number,
    curEdge: [number, number] | null,
    phase: 'dfs' | 'done',
    msg: string,
    description: string,
    codeLine: number,
  ) => {
    steps.push({ state: snap(cur, curEdge, phase, msg), description, codeLine });
  };

  push(-1, null, 'dfs', `初始化：${n} 个节点，dfn/low 全为 0，空栈`, '初始化', 2);

  function dfs(u: number) {
    dfn[u] = low[u] = ++ts;
    stack.push(u);
    inStack[u] = true;
    push(u, null, 'dfs', `访问节点 ${u}：dfn[${u}]=low[${u}]=${ts}，入栈`, `访问 ${u}`, 6);

    for (const v of adj[u]) {
      if (!dfn[v]) {
        push(u, [u, v], 'dfs', `树边 ${u}→${v}（${v} 未访问），递归深入`, `边 ${u}→${v}`, 8);
        dfs(v);
        const oldLow = low[u];
        low[u] = Math.min(low[u], low[v]);
        push(u, [u, v], 'dfs', `回溯：low[${u}] = min(${oldLow}, low[${v}]=${low[v]}) = ${low[u]}`, `更新 low[${u}]=${low[u]}`, 8);
      } else if (inStack[v]) {
        const oldLow = low[u];
        low[u] = Math.min(low[u], dfn[v]);
        push(u, [u, v], 'dfs', `回边 ${u}→${v}（${v} 在栈中）：low[${u}] = min(${oldLow}, dfn[${v}]=${dfn[v]}) = ${low[u]}`, `回边 ${u}→${v}`, 9);
      } else {
        push(u, [u, v], 'dfs', `边 ${u}→${v}：${v} 已属于其他 SCC（不在栈中），忽略`, `边 ${u}→${v}`, 9);
      }
    }

    if (dfn[u] === low[u]) {
      const scc: number[] = [];
      let v: number;
      do {
        v = stack.pop()!;
        inStack[v] = false;
        scc.push(v);
        sccId[v] = sccs.length;
      } while (v !== u);
      sccs.push(scc);
      push(u, null, 'dfs', `dfn[${u}]==low[${u}]==${dfn[u]}，${u} 是 SCC 根，弹出 {${scc.join(', ')}}`, `SCC {${scc.join(',')}}`, 13);
    }
  }

  for (let i = 0; i < n; i++) if (!dfn[i]) dfs(i);

  push(-1, null, 'done', `✅ 共 ${sccs.length} 个强连通分量：${sccs.map((s) => `{${s.join(',')}}`).join('  ')}`, '完成', 18);

  return steps;
}

function nodePos(i: number, n: number): { x: number; y: number } {
  const cx = 210;
  const cy = 165;
  const radius = 125;
  const angle = (2 * Math.PI * i) / n - Math.PI / 2;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function edgePath(x1: number, y1: number, x2: number, y2: number, curve: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const r = 24;
  const sx = x1 + (dx / dist) * r;
  const sy = y1 + (dy / dist) * r;
  const ex = x2 - (dx / dist) * r;
  const ey = y2 - (dy / dist) * r;
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const nx = -dy / dist;
  const ny = dx / dist;
  return `M ${sx} ${sy} Q ${mx + nx * curve} ${my + ny * curve} ${ex} ${ey}`;
}

export function TarjanSCCPanel() {
  const [nodeCount, setNodeCount] = useState(7);
  const [edgesText, setEdgesText] = useState('0,1 1,2 2,0 2,3 3,4 4,5 5,3 5,6');

  const edges = useMemo<[number, number][]>(() => {
    return edgesText
      .split(/\s+/)
      .map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 2 && p.every(Number.isFinite))
      .map(([a, b]) => [a, b] as [number, number]);
  }, [edgesText]);

  const steps = useMemo(() => buildSteps(nodeCount, edges), [nodeCount, edges]);
  const initial: TarjanState = {
    n: nodeCount,
    edges,
    dfn: new Array(nodeCount).fill(0),
    low: new Array(nodeCount).fill(0),
    stack: [],
    inStack: new Array(nodeCount).fill(false),
    currentNode: -1,
    currentEdge: null,
    sccs: [],
    sccId: new Array(nodeCount).fill(-1),
    phase: 'dfs',
    message: '',
  };

  return (
    <Stepper<TarjanState>
      steps={steps}
      initialState={initial}
      codeLines={tarjanCode}
      codeTitle="Tarjan 强连通分量 SCC"
      headerActions={
        <>
          <span className="text-sm text-gray-400">节点数:</span>
          <input
            type="number"
            value={nodeCount}
            onChange={(e) => setNodeCount(Math.max(2, Math.min(10, Number(e.target.value))))}
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
            黄色=当前 DFS 节点，蓝色=栈中节点，彩色=已识别 SCC。节点下方显示 dfn/low
          </div>

          {/* Graph SVG */}
          <div className="flex justify-center">
            <svg viewBox="0 0 420 330" className="w-full max-w-[480px]">
              <defs>
                <marker id="tarrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#555" />
                </marker>
                <marker id="tarrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#facc15" />
                </marker>
              </defs>

              {/* Edges */}
              {state.edges.map(([u, v], i) => {
                if (u < 0 || u >= state.n || v < 0 || v >= state.n) return null;
                const p1 = nodePos(u, state.n);
                const p2 = nodePos(v, state.n);
                const isActive = state.currentEdge !== null && state.currentEdge[0] === u && state.currentEdge[1] === v;
                const hasReverse = state.edges.some(([a, b]) => a === v && b === u);
                return (
                  <path
                    key={i}
                    d={edgePath(p1.x, p1.y, p2.x, p2.y, hasReverse ? 18 : 10)}
                    fill="none"
                    stroke={isActive ? '#facc15' : '#444'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    markerEnd={isActive ? 'url(#tarrow-active)' : 'url(#tarrow)'}
                  />
                );
              })}

              {/* Nodes */}
              {Array.from({ length: state.n }).map((_, i) => {
                const { x, y } = nodePos(i, state.n);
                const isCurrent = state.currentNode === i;
                const scc = state.sccId[i];
                const inStk = state.inStack[i];
                const fill = scc >= 0
                  ? SCC_COLORS[scc % SCC_COLORS.length]
                  : inStk
                    ? '#3b82f6'
                    : '#374151';
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r={20}
                      fill={fill}
                      fillOpacity={scc >= 0 ? 0.85 : inStk ? 0.55 : 0.4}
                      stroke={isCurrent ? '#facc15' : scc >= 0 ? SCC_COLORS[scc % SCC_COLORS.length] : '#555'}
                      strokeWidth={isCurrent ? 3 : 1.5}
                    />
                    <text x={x} y={y + 4} textAnchor="middle" fontSize="13" fontWeight="bold" style={{ fill: 'var(--ink)' }}>
                      {i}
                    </text>
                    <text x={x} y={y + 34} textAnchor="middle" fontSize="9" style={{ fill: 'var(--ink-3)' }} fontFamily="monospace">
                      {state.dfn[i] > 0 ? `${state.dfn[i]}/${state.low[i]}` : '-/-'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Stack + SCCs */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">栈:</span>
              {state.stack.length === 0 ? (
                <span className="text-xs text-gray-600">空</span>
              ) : (
                <div className="flex gap-1">
                  {state.stack.map((v, i) => (
                    <div key={i} className="w-8 h-8 flex items-center justify-center rounded bg-blue-500/20 border border-blue-400 text-blue-200 text-xs font-mono">
                      {v}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">SCC:</span>
              {state.sccs.map((scc, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-xs font-mono text-black"
                  style={{ backgroundColor: SCC_COLORS[i % SCC_COLORS.length] }}
                >
                  {`{${scc.join(',')}}`}
                </span>
              ))}
            </div>
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
