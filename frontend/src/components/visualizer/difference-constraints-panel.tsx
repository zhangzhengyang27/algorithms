'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const diffConstraintsCode = [
  'function differenceConstraints(n, edges) {',
  '  // x_v - x_u <= w  =>  edge u->v weight w',
  '  const dist = new Array(n).fill(0);',
  '  for (let round = 1; round <= n; round++) {',
  '    let changed = false;',
  '    for (const {u, v, w} of edges) {',
  '      if (dist[u] + w < dist[v]) {',
  '        dist[v] = dist[u] + w;',
  '        changed = true;',
  '      }',
  '    }',
  '    if (!changed) return dist;',
  '  }',
  '  return null; // negative cycle, no solution',
  '}',
];

interface DCEdge { u: number; v: number; w: number; }

interface DCState {
  n: number;
  edges: DCEdge[];
  dist: number[];
  round: number;
  currentEdge: number;
  relaxed: boolean;
  negativeCycle: boolean;
  phase: 'build' | 'solve' | 'done' | 'no-solution';
  message: string;
}

function buildSteps(n: number, edges: DCEdge[]): VizStep<DCState>[] {
  const steps: VizStep<DCState>[] = [];
  const dist = new Array(n).fill(0);

  const snap = (round: number, curEdge: number, relaxed: boolean, negativeCycle: boolean, phase: DCState['phase'], msg: string): DCState => ({
    n, edges, dist: [...dist], round, currentEdge: curEdge, relaxed, negativeCycle, phase, message: msg,
  });

  steps.push({
    state: snap(0, -1, false, false, 'build', `差分约束系统：${edges.map((e) => `x${e.v} - x${e.u} ≤ ${e.w}`).join('，')}`),
    description: '约束系统',
    codeLine: 1,
  });

  steps.push({
    state: snap(0, -1, false, false, 'build', `建图：每个约束 x_v - x_u ≤ w 对应边 u→v（权 w），共 ${edges.length} 条边`),
    description: '约束转边',
    codeLine: 1,
  });

  steps.push({
    state: snap(0, -1, false, false, 'solve', `初始化 dist 全为 0（超级源点到所有点距离为 0），开始 Bellman-Ford 松弛`),
    description: 'dist 全 0',
    codeLine: 2,
  });

  for (let round = 1; round <= n; round++) {
    steps.push({
      state: snap(round, -1, false, false, 'solve', `第 ${round} 轮松弛（最多 n=${n} 轮，若第 ${n} 轮仍有更新则存在负环）`),
      description: `第 ${round} 轮`,
      codeLine: 3,
    });

    let changed = false;
    for (let i = 0; i < edges.length; i++) {
      const { u, v, w } = edges[i];
      if (dist[u] + w < dist[v]) {
        const old = dist[v];
        dist[v] = dist[u] + w;
        changed = true;
        steps.push({
          state: snap(round, i, true, false, 'solve', `松弛 ${u}→${v}(w=${w})：dist[${u}]+(${w}) = ${dist[u]} < ${old} → dist[${v}] = ${dist[v]}`),
          description: `松弛 ${u}→${v}`,
          codeLine: 7,
        });
      } else {
        steps.push({
          state: snap(round, i, false, false, 'solve', `边 ${u}→${v}(w=${w})：dist[${u}]+(${w}) = ${dist[u] + w} ≥ dist[${v}] = ${dist[v]}，无需松弛`),
          description: `跳过 ${u}→${v}`,
          codeLine: 6,
        });
      }
    }

    if (!changed) {
      steps.push({
        state: snap(round, -1, false, false, 'solve', `第 ${round} 轮无任何松弛，收敛提前结束`),
        description: '收敛',
        codeLine: 11,
      });
      break;
    }

    if (round === n) {
      steps.push({
        state: snap(round, -1, false, true, 'no-solution', `❌ 第 ${n} 轮仍有松弛发生 → 存在负环 → 约束系统无解`),
        description: '负环！无解',
        codeLine: 13,
      });
      return steps;
    }
  }

  const checks = edges.map((e) => `x${e.v}-x${e.u} = ${dist[e.v] - dist[e.u]} ≤ ${e.w} ✓`).join('，');
  steps.push({
    state: snap(-1, -1, false, false, 'done', `✅ 可行解：x = [${dist.join(', ')}]。验证：${checks}`),
    description: '可行解',
    codeLine: 11,
  });

  return steps;
}

const FEASIBLE_PRESET = '0,1,4 0,2,5 1,2,-1 1,3,3 2,3,-3';
const INFEASIBLE_PRESET = '0,1,-1 1,0,-1';

export function DifferenceConstraintsPanel() {
  const [nodeCount, setNodeCount] = useState(4);
  const [edgesText, setEdgesText] = useState(FEASIBLE_PRESET);

  const edges = useMemo<DCEdge[]>(() => {
    return edgesText
      .split(/\s+/)
      .map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 3 && p.every(Number.isFinite))
      .map(([u, v, w]) => ({ u, v, w }));
  }, [edgesText]);

  const steps = useMemo(() => buildSteps(nodeCount, edges), [nodeCount, edges]);
  const initial: DCState = {
    n: nodeCount, edges, dist: new Array(nodeCount).fill(0), round: 0, currentEdge: -1,
    relaxed: false, negativeCycle: false, phase: 'build', message: '',
  };

  return (
    <Stepper<DCState>
      steps={steps}
      initialState={initial}
      codeLines={diffConstraintsCode}
      codeTitle="差分约束 Difference Constraints"
      headerActions={
        <>
          <span className="text-sm text-gray-400">变量数:</span>
          <input
            type="number"
            value={nodeCount}
            onChange={(e) => setNodeCount(Math.max(2, Math.min(8, Number(e.target.value) || 2)))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-12"
          />
          <span className="text-sm text-gray-400">约束(u,v,w):</span>
          <input
            type="text"
            value={edgesText}
            onChange={(e) => setEdgesText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="x_v-x_u≤w，空格分隔"
          />
          <button
            type="button"
            onClick={() => { setNodeCount(2); setEdgesText(INFEASIBLE_PRESET); }}
            className="text-xs px-2 py-1 rounded bg-red-900/30 border border-red-800 text-red-300 hover:bg-red-900/50"
          >
            负环示例
          </button>
          <button
            type="button"
            onClick={() => { setNodeCount(4); setEdgesText(FEASIBLE_PRESET); }}
            className="text-xs px-2 py-1 rounded bg-blue-900/30 border border-blue-800 text-blue-300 hover:bg-blue-900/50"
          >
            有解示例
          </button>
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            绿色=松弛成功，红色=无需松弛，紫色=负环无解
          </div>

          {/* Constraint → edge mapping */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">约束 → 边:</div>
            <div className="flex gap-2 flex-wrap justify-center">
              {state.edges.map((e, i) => (
                <div
                  key={i}
                  className={clsx(
                    'px-2 py-1 rounded text-xs font-mono border transition-all',
                    i === state.currentEdge
                      ? state.relaxed
                        ? 'bg-green-500/20 border-green-500 text-green-300 scale-105'
                        : 'bg-red-500/20 border-red-400 text-red-300'
                      : 'bg-surface-2 border-edge-2 text-ink-3',
                  )}
                >
                  x{e.v}-x{e.u}≤{e.w} ⇔ {e.u}→{e.v}({e.w})
                </div>
              ))}
            </div>
          </div>

          {/* Nodes with dist values */}
          <div className="flex items-center justify-center gap-4 flex-wrap min-h-[70px]">
            {Array.from({ length: state.n }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={clsx(
                    'w-11 h-11 flex items-center justify-center rounded-full text-sm font-mono border-2 transition-all',
                    state.negativeCycle
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : state.round > 0
                        ? 'bg-surface-2 border-green-700 text-ink-2'
                        : 'bg-surface-2 border-edge-2 text-ink-3',
                  )}
                >
                  x{i}
                </div>
                <div className={clsx('text-xs font-mono', state.phase === 'build' ? 'text-gray-600' : 'text-green-300')}>
                  {state.dist[i]}
                </div>
              </div>
            ))}
          </div>

          {/* Round indicator */}
          {state.round > 0 && !state.negativeCycle && (
            <div className="text-center text-xs text-blue-300">第 {state.round} / {state.n} 轮松弛</div>
          )}

          {/* Negative cycle warning */}
          {state.negativeCycle && (
            <div className="text-center p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <span className="text-red-300 font-mono text-sm">❌ 检测到负环，差分约束系统无解</span>
            </div>
          )}

          {/* Solution */}
          {state.phase === 'done' && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                ✅ 一组可行解：x = [{state.dist.join(', ')}]
              </span>
            </div>
          )}

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
