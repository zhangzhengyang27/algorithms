'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const primCode = [
  'function prim(n, edges, start) {',
  '  const key = Array(n).fill(Infinity);',
  '  const inMST = Array(n).fill(false);',
  '  key[start] = 0;',
  '  for (let c = 0; c < n; c++) {',
  '    const u = minKey(key, inMST);',
  '    inMST[u] = true;',
  '    for (v of adj[u]) relax(u, v);',
  '  }',
  '}',
];

interface PrimState {
  n: number;
  edges: [number, number, number][];
  key: number[];
  inMST: boolean[];
  current: number;
  from: (number | null)[];
  totalWeight: number;
  message: string;
}

export function buildSteps(n: number, edges: [number, number, number][], start: number): VizStep<PrimState>[] {
  const steps: VizStep<PrimState>[] = [];
  const adj: [number, number][][] = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }
  const key = new Array(n).fill(Infinity);
  const inMST = new Array(n).fill(false);
  const from: (number | null)[] = new Array(n).fill(null);

  const snap = (cur: number, msg: string): PrimState => ({
    n, edges, key: [...key], inMST: [...inMST], current: cur, from: [...from], totalWeight: key.reduce((s, v) => (v !== Infinity && v !== 0 ? s + v : s), 0), message: msg,
  });

  key[start] = 0;
  steps.push({ state: snap(start, `Prim 算法：从起点 ${start} 开始，key 为到 MST 的最小边权`), description: '初始化', codeLine: 1 });

  for (let c = 0; c < n; c++) {
    let u = -1;
    let min = Infinity;
    for (let i = 0; i < n; i++) {
      if (!inMST[i] && key[i] < min) { min = key[i]; u = i; }
    }
    if (u === -1) break;
    inMST[u] = true;
    steps.push({ state: snap(u, `选 key 最小的未访问节点 ${u}（key=${key[u]}）加入 MST`), description: `加入 ${u}`, codeLine: 6 });

    for (const [v, w] of adj[u]) {
      if (!inMST[v] && w < key[v]) {
        key[v] = w;
        from[v] = u;
        steps.push({ state: snap(u, `松弛边 ${u}→${v}：新权 ${w} < key[${v}]=${key[v] === w ? '∞(旧)' : key[v]}，更新`), description: `松弛 ${u}→${v}`, codeLine: 8 });
      }
    }
  }

  steps.push({ state: snap(-1, `✅ MST 构建完成，总权重 = ${key.reduce((s, v) => (v !== Infinity ? s + v : s), 0)}`), description: '完成', codeLine: 9 });
  return steps;
}

export function PrimPanel() {
  const [edgesText, setEdgesText] = useState('0,1,2 0,3,6 1,2,3 1,3,8 1,4,5 2,4,7 3,4,9');
  const [nodeCount, setNodeCount] = useState(5);
  const [start, setStart] = useState(0);

  const edges = useMemo<[number, number, number][]>(() =>
    edgesText.split(/\s+/).map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 3 && p.every(Number.isFinite))
      .map(([a, b, w]) => [a, b, w] as [number, number, number]),
    [edgesText]);

  const steps = useMemo(() => buildSteps(nodeCount, edges, start), [nodeCount, edges, start]);
  const initial: PrimState = { n: nodeCount, edges, key: [], inMST: [], current: -1, from: [], totalWeight: 0, message: '' };

  return (
    <Stepper<PrimState>
      steps={steps}
      initialState={initial}
      codeLines={primCode}
      codeTitle="Prim 最小生成树"
      headerActions={
        <>
          <span className="text-sm text-gray-400">节点:</span>
          <input type="number" value={nodeCount} onChange={(e) => setNodeCount(Math.max(2, Math.min(8, Number(e.target.value))))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
          <span className="text-sm text-gray-400">起点:</span>
          <input type="number" value={start} onChange={(e) => setStart(Math.max(0, Math.min(nodeCount - 1, Number(e.target.value))))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
          <span className="text-sm text-gray-400">边(u,v,w):</span>
          <input type="text" value={edgesText} onChange={(e) => setEdgesText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-64" placeholder="空格分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">绿色=已入 MST，黄色=当前节点，蓝色=边，红色=连接新节点的关键边</div>
          <div className="flex gap-1.5 flex-wrap justify-center min-h-15">
            {Array.from({ length: state.n }, (_, i) => (
              <div key={i} className={clsx('w-12 h-12 flex items-center justify-center rounded-full text-sm font-mono border-2 transition-all', i === state.current ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110' : state.inMST[i] ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-surface-2 border-edge-2 text-gray-400')}>
                {i}
                <span className="text-[9px] ml-1 text-gray-500">k={state.key[i] === Infinity ? '∞' : state.key[i]}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {state.edges.map(([u, v, w], i) => {
              const inTree = state.inMST[u] && state.inMST[v] && (state.from[v] === u || state.from[u] === v);
              return (
                <span key={i} className={clsx('px-2 py-0.5 rounded text-xs font-mono', inTree ? 'bg-green-500/20 text-green-300' : 'bg-surface-2 text-gray-500')}>{u}↔{v}({w})</span>
              );
            })}
          </div>
          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
