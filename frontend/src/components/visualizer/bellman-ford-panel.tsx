'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const bellmanFordCode = [
  'function bellmanFord(n, edges, src) {',
  '  const dist = new Array(n).fill(Infinity);',
  '  dist[src] = 0;',
  '  for (let round = 1; round <= n - 1; round++) {',
  '    let anyRelaxed = false;',
  '    for (const {u, v, w} of edges) {',
  '      if (dist[u] + w < dist[v]) {',
  '        dist[v] = dist[u] + w;',
  '        anyRelaxed = true;',
  '      }',
  '    }',
  '    if (!anyRelaxed) break;',
  '  }',
  '  return dist;',
  '}',
];

interface BFEdge { u: number; v: number; w: number; }

interface BFState {
  n: number;
  edges: BFEdge[];
  dist: number[];
  round: number;
  currentEdge: number;
  relaxed: boolean;
  message: string;
}

export function buildSteps(n: number, edges: BFEdge[], src: number): VizStep<BFState>[] {
  const steps: VizStep<BFState>[] = [];
  // 与 floyd-warshall / prim / kruskal 对齐：本面板的边表表示**无向**图。
  // 以前只按 u→v 单向松弛，导致同一份边表在这里和那几个面板得出不同的距离
  // （源点没有出边时就整片 ∞）。这里把每条边展开成两个方向，松弛过程与展示
  // 的边表都保持一致。
  const undirected: BFEdge[] = [];
  for (const e of edges) {
    undirected.push(e);
    if (e.u !== e.v) undirected.push({ u: e.v, v: e.u, w: e.w });
  }
  edges = undirected;
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  const snap = (round: number, curEdge: number, relaxed: boolean, msg: string): BFState => ({
    n, edges, dist: [...dist], round, currentEdge: curEdge, relaxed, message: msg,
  });

  steps.push({ state: snap(0, -1, false, `初始化：dist[${src}]=0，其余为 ∞，共需 ${n - 1} 轮松弛`), description: '初始化', codeLine: 3 });

  for (let round = 1; round <= n - 1; round++) {
    steps.push({ state: snap(round, -1, false, `第 ${round} 轮松弛（遍历所有 ${edges.length} 条边）`), description: `第 ${round} 轮`, codeLine: 4 });
    let anyRelaxed = false;

    for (let i = 0; i < edges.length; i++) {
      const { u, v, w } = edges[i];
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        const oldDist = dist[v];
        dist[v] = dist[u] + w;
        anyRelaxed = true;
        steps.push({ state: snap(round, i, true, `松弛 (${u}→${v}, w=${w})：dist[${u}]+${w}=${dist[u]} < ${oldDist === Infinity ? '∞' : oldDist} → dist[${v}]=${dist[v]}`), description: `松弛 ${u}→${v}`, codeLine: 8 });
      } else {
        steps.push({ state: snap(round, i, false, `边 (${u}→${v}, w=${w})：${dist[u] === Infinity ? 'dist[' + u + ']=∞' : `dist[${u}]+${w}=${dist[u] + w} ≥ dist[${v}]=${dist[v]}`}，不更新`), description: `跳过 ${u}→${v}`, codeLine: 7 });
      }
    }

    if (!anyRelaxed) {
      steps.push({ state: snap(round, -1, false, `第 ${round} 轮无任何松弛，提前终止`), description: '提前终止', codeLine: 12 });
      break;
    }
  }

  steps.push({ state: snap(-1, -1, false, `✅ 完成！从节点 ${src} 出发的最短距离：[${dist.map((d) => d === Infinity ? '∞' : d).join(', ')}]`), description: '完成', codeLine: 14 });
  return steps;
}

export function BellmanFordPanel() {
  const [nodeCount, setNodeCount] = useState(5);
  const [source, setSource] = useState(0);
  const [edgesText, setEdgesText] = useState('0,1,4 0,2,1 1,3,1 2,1,2 2,3,5 3,4,3');

  const edges = useMemo<BFEdge[]>(() => {
    return edgesText.split(/\s+/).map((s) => s.split(',').map(Number)).filter((p) => p.length === 3 && p.every(Number.isFinite)).map(([u, v, w]) => ({ u, v, w }));
  }, [edgesText]);

  const steps = useMemo(() => buildSteps(nodeCount, edges, source), [nodeCount, edges, source]);
  const initial: BFState = { n: nodeCount, edges, dist: new Array(nodeCount).fill(Infinity), round: 0, currentEdge: -1, relaxed: false, message: '' };

  return (
    <Stepper<BFState>
      steps={steps}
      initialState={initial}
      codeLines={bellmanFordCode}
      codeTitle="Bellman-Ford 最短路"
      headerActions={
        <>
          <span className="text-sm text-gray-400">节点:</span>
          <input type="number" value={nodeCount} onChange={(e) => setNodeCount(Math.max(2, Math.min(8, Number(e.target.value))))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-12" />
          <span className="text-sm text-gray-400">起点:</span>
          <input type="number" value={source} onChange={(e) => setSource(Math.max(0, Math.min(nodeCount - 1, Number(e.target.value))))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-12" />
          <span className="text-sm text-gray-400">边(u,v,w):</span>
          <input type="text" value={edgesText} onChange={(e) => setEdgesText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-64" placeholder="空格分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">绿色=松弛成功，红色=未更新，蓝色=当前轮次</div>

          {/* Nodes with dist */}
          <div className="flex items-center justify-center gap-4 flex-wrap min-h-[70px]">
            {Array.from({ length: state.n }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={clsx('w-11 h-11 flex items-center justify-center rounded-full text-sm font-mono border-2', i === source ? 'bg-blue-500/20 border-blue-400 text-blue-200' : state.dist[i] !== Infinity ? 'bg-surface-2 border-green-700 text-gray-300' : 'bg-bg border-edge text-gray-600')}>{i}</div>
                <div className={clsx('text-xs font-mono', state.dist[i] === Infinity ? 'text-gray-600' : 'text-green-300')}>{state.dist[i] === Infinity ? '∞' : state.dist[i]}</div>
              </div>
            ))}
          </div>

          {/* Edges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {state.edges.map((e, i) => (
              <span key={i} className={clsx('px-2 py-0.5 rounded text-xs font-mono border', i === state.currentEdge ? (state.relaxed ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-red-500/20 border-red-400 text-red-300') : 'bg-surface-2 border-edge-2 text-gray-500')}>
                {e.u}→{e.v}({e.w})
              </span>
            ))}
          </div>

          {/* Round indicator */}
          {state.round > 0 && (
            <div className="text-center text-xs text-blue-300">第 {state.round} / {state.n - 1} 轮</div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
