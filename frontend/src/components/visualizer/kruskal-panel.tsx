'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const kruskalCode = [
  'function kruskal(n, edges) {',
  '  edges.sort((a, b) => a.w - b.w);',
  '  const parent = Array.from({length: n}, (_, i) => i);',
  '  const mst = []; let totalWeight = 0;',
  '  for (const {u, v, w} of edges) {',
  '    const ru = find(parent, u), rv = find(parent, v);',
  '    if (ru === rv) continue;',
  '    parent[ru] = rv;',
  '    mst.push({u, v, w}); totalWeight += w;',
  '    if (mst.length === n - 1) break;',
  '  }',
  '  return { mst, totalWeight };',
  '}',
];

interface Edge { u: number; v: number; w: number; }

interface KruskalState {
  n: number;
  edges: Edge[];
  sortedEdges: Edge[];
  currentEdge: number;
  selectedEdges: number[];
  parent: number[];
  totalWeight: number;
  message: string;
}

function find(parent: number[], x: number): number {
  while (parent[x] !== x) x = parent[x];
  return x;
}

export function buildSteps(n: number, edges: Edge[]): VizStep<KruskalState>[] {
  const steps: VizStep<KruskalState>[] = [];
  const sorted = [...edges].sort((a, b) => a.w - b.w);
  const parent = Array.from({ length: n }, (_, i) => i);
  const selected: number[] = [];
  let totalWeight = 0;

  const snap = (cur: number, msg: string): KruskalState => ({
    n, edges, sortedEdges: sorted, currentEdge: cur, selectedEdges: [...selected], parent: [...parent], totalWeight, message: msg,
  });

  steps.push({ state: snap(-1, `${n} 个节点，${edges.length} 条边，按权重排序后开始 Kruskal`), description: '初始化', codeLine: 3 });

  for (let i = 0; i < sorted.length; i++) {
    const { u, v, w } = sorted[i];
    const ru = find(parent, u);
    const rv = find(parent, v);

    if (ru === rv) {
      steps.push({ state: snap(i, `边 (${u},${v}) w=${w}：find(${u})=${ru}, find(${v})=${rv}，同集合 → 跳过（会形成环）`), description: `跳过 (${u},${v})`, codeLine: 7 });
    } else {
      parent[ru] = rv;
      selected.push(i);
      totalWeight += w;
      steps.push({ state: snap(i, `边 (${u},${v}) w=${w}：不同集合，合并！union(${ru},${rv})，总权重=${totalWeight}`), description: `选取 (${u},${v}) w=${w}`, codeLine: 9 });
    }

    if (selected.length === n - 1) {
      steps.push({ state: snap(-1, `✅ MST 完成！选取 ${n - 1} 条边，总权重 = ${totalWeight}`), description: 'MST 完成', codeLine: 12 });
      return steps;
    }
  }

  steps.push({ state: snap(-1, `完成，选取 ${selected.length} 条边，总权重 = ${totalWeight}`), description: '结束', codeLine: 12 });
  return steps;
}

export function KruskalPanel() {
  const [nodeCount, setNodeCount] = useState(5);
  const [edgesText, setEdgesText] = useState('0,1,2 0,3,6 1,2,3 1,3,8 1,4,5 2,4,7 3,4,9');

  const edges = useMemo<Edge[]>(() => {
    return edgesText.split(/\s+/).map((s) => s.split(',').map(Number)).filter((p) => p.length === 3 && p.every(Number.isFinite)).map(([u, v, w]) => ({ u, v, w }));
  }, [edgesText]);

  const steps = useMemo(() => buildSteps(nodeCount, edges), [nodeCount, edges]);
  const initial: KruskalState = { n: nodeCount, edges, sortedEdges: [...edges].sort((a, b) => a.w - b.w), currentEdge: -1, selectedEdges: [], parent: Array.from({ length: nodeCount }, (_, i) => i), totalWeight: 0, message: '' };

  return (
    <Stepper<KruskalState>
      steps={steps}
      initialState={initial}
      codeLines={kruskalCode}
      codeTitle="Kruskal MST"
      headerActions={
        <>
          <span className="text-sm text-gray-400">节点:</span>
          <input type="number" value={nodeCount} onChange={(e) => setNodeCount(Math.max(2, Math.min(10, Number(e.target.value))))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
          <span className="text-sm text-gray-400">边(u,v,w):</span>
          <input type="text" value={edgesText} onChange={(e) => setEdgesText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-72" placeholder="空格分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">绿色=已选入MST，黄色=当前判断，红色=跳过（成环）</div>

          {/* Sorted edges list */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500">按权重排序的边:</span>
            <div className="flex gap-2 flex-wrap justify-center">
              {state.sortedEdges.map((e, i) => {
                const isSelected = state.selectedEdges.includes(i);
                const isCurrent = i === state.currentEdge;
                const isSkipped = isCurrent && !isSelected;
                return (
                  <div key={i} className={clsx('px-2.5 py-1.5 rounded text-xs font-mono border transition-all', isSelected ? 'bg-green-500/20 border-green-500 text-green-300' : isSkipped ? 'bg-red-500/20 border-red-400 text-red-300' : isCurrent ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200' : 'bg-surface-2 border-edge-2 text-gray-500')}>
                    ({e.u},{e.v}) w={e.w}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nodes with parent */}
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: state.n }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 flex items-center justify-center rounded-full text-sm font-mono border-2 bg-surface-2 border-edge-2 text-gray-300">{i}</div>
                <div className="text-[9px] text-gray-600 font-mono">p={state.parent[i]}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-green-300">已选边: {state.selectedEdges.length}/{state.n - 1}</div>
            <div className="text-gray-300">总权重: <span className="font-mono text-yellow-300">{state.totalWeight}</span></div>
          </div>

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
