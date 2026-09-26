'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const floydCode = [
  'function floydWarshall(dist) {',
  '  for (let k = 0; k < n; k++)',
  '    for (let i = 0; i < n; i++)',
  '      for (let j = 0; j < n; j++)',
  '        if (dist[i][k] + dist[k][j] < dist[i][j])',
  '          dist[i][j] = dist[i][k] + dist[k][j];',
  '}',
];

interface FWState {
  n: number;
  dist: number[][];
  k: number;
  i: number;
  j: number;
  updated: boolean;
  message: string;
}

function buildSteps(n: number, edges: [number, number, number][]): VizStep<FWState>[] {
  const steps: VizStep<FWState>[] = [];
  const dist: number[][] = Array.from({ length: n }, (_, a) =>
    Array.from({ length: n }, (_, b) => (a === b ? 0 : Infinity)),
  );
  for (const [u, v, w] of edges) {
    dist[u][v] = Math.min(dist[u][v], w);
    dist[v][u] = Math.min(dist[v][u], w);
  }

  const snap = (k: number, i: number, j: number, updated: boolean, msg: string, cl: number): VizStep<FWState> => ({
    state: { n, dist: dist.map((r) => [...r]), k, i, j, updated, message: msg },
    description: msg,
    codeLine: cl,
  });

  steps.push(snap(-1, -1, -1, false, `Floyd-Warshall：以 k 为中转点，更新所有 i→j 的最短距`, 1));

  for (let k = 0; k < n; k++) {
    steps.push(snap(k, -1, -1, false, `取中转点 k = ${k}，尝试经 ${k} 缩短所有路径`, 2));
    for (let i = 0; i < n; i++) {
      if (dist[i][k] === Infinity) continue;
      for (let j = 0; j < n; j++) {
        if (dist[k][j] === Infinity) continue;
        const via = dist[i][k] + dist[k][j];
        if (via < dist[i][j]) {
          steps.push(snap(k, i, j, true, `dist[${i}][${j}]: ${dist[i][j] === Infinity ? '∞' : dist[i][j]} > ${dist[i][k]}+${dist[k][j]}=${via}，更新`, 6));
          dist[i][j] = via;
        } else {
          steps.push(snap(k, i, j, false, `dist[${i}][${j}]: ${dist[i][j] === Infinity ? '∞' : dist[i][j]} ≤ ${via}，不更新`, 5));
        }
      }
    }
  }

  steps.push(snap(-1, -1, -1, false, `✅ 所有点对最短路径已确定`, 7));
  return steps;
}

export function FloydWarshallPanel() {
  const [edgesText, setEdgesText] = useState('0,1,3 0,2,8 1,2,2 1,3,5 2,3,1 3,4,4');
  const [nodeCount, setNodeCount] = useState(5);

  const edges = useMemo<[number, number, number][]>(() =>
    edgesText.split(/\s+/).map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 3 && p.every(Number.isFinite))
      .map(([a, b, w]) => [a, b, w] as [number, number, number]),
    [edgesText]);

  const steps = useMemo(() => buildSteps(nodeCount, edges), [nodeCount, edges]);
  const initial: FWState = { n: nodeCount, dist: [], k: -1, i: -1, j: -1, updated: false, message: '' };

  const fmt = (d: number) => (d === Infinity ? '∞' : d);

  return (
    <Stepper<FWState>
      steps={steps}
      initialState={initial}
      codeLines={floydCode}
      codeTitle="Floyd-Warshall 多源最短路"
      headerActions={
        <>
          <span className="text-sm text-gray-400">节点:</span>
          <input type="number" value={nodeCount} onChange={(e) => setNodeCount(Math.max(2, Math.min(8, Number(e.target.value))))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
          <span className="text-sm text-gray-400">边(u,v,w):</span>
          <input type="text" value={edgesText} onChange={(e) => setEdgesText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-64" placeholder="空格分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">黄色=k(中转)，绿色=当前 (i,j) 发生更新，蓝色=本次比较的 (i,j)</div>
          <table className="mx-auto border-collapse text-xs font-mono">
            <thead>
              <tr>
                <th className="border border-edge px-2 py-1 text-gray-500">i\j</th>
                {Array.from({ length: state.n }, (_, j) => (
                  <th key={j} className={clsx('border border-edge px-2 py-1', state.k === j ? 'bg-yellow-500/30 text-yellow-200' : 'text-gray-400')}>{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.dist.map((row, i) => (
                <tr key={i}>
                  <th className={clsx('border border-edge px-2 py-1', state.k === i ? 'bg-yellow-500/30 text-yellow-200' : 'text-gray-400')}>{i}</th>
                  {row.map((d, j) => (
                    <td
                      key={j}
                      className={clsx(
                        'border border-edge px-2 py-1 text-center min-w-10',
                        state.updated && state.i === i && state.j === j ? 'bg-green-500/25 text-green-300'
                          : state.i === i && state.j === j ? 'bg-blue-500/20 text-blue-200'
                            : 'text-gray-300',
                      )}
                    >
                      {fmt(d)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
