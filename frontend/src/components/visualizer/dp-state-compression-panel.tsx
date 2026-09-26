'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const dpStateCode = [
  'function tsp(dist) {',
  '  const n = dist.length;',
  '  const FULL = 1 << n;',
  '  const dp = Array.from({ length: FULL }, () => new Array(n).fill(Infinity));',
  '  dp[1][0] = 0;',
  '  for (let mask = 1; mask < FULL; mask++) {',
  '    if (!(mask & 1)) continue;',
  '    for (let u = 0; u < n; u++) {',
  '      if (!(mask & (1 << u)) || dp[mask][u] === Infinity) continue;',
  '      for (let v = 0; v < n; v++) {',
  '        if (mask & (1 << v)) continue;',
  '        const next = mask | (1 << v);',
  '        dp[next][v] = Math.min(dp[next][v], dp[mask][u] + dist[u][v]);',
  '      }',
  '    }',
  '  }',
  '  let ans = Infinity;',
  '  for (let u = 1; u < n; u++)',
  '    ans = Math.min(ans, dp[FULL - 1][u] + dist[u][0]);',
  '  return ans;',
  '}',
];

const DEFAULT_DIST = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
];

interface DpStateCompressionState {
  n: number;
  dist: number[][];
  dp: number[][];
  mask: number;
  u: number;
  v: number;
  phase: 'init' | 'dp' | 'close' | 'done';
  result: number | null;
  message: string;
}

const fmt = (x: number) => (x === Infinity ? '∞' : String(x));
const setOf = (m: number, n: number) =>
  '{' + Array.from({ length: n }, (_, i) => i).filter((i) => m & (1 << i)).join(',') + '}';

function buildSteps(dist: number[][]): VizStep<DpStateCompressionState>[] {
  const n = dist.length;
  const FULL = 1 << n;
  const dp = Array.from({ length: FULL }, () => new Array(n).fill(Infinity));
  dp[1][0] = 0;
  const steps: VizStep<DpStateCompressionState>[] = [];
  const snap = () => dp.map((r) => [...r]);

  steps.push({
    state: { n, dist, dp: snap(), mask: 1, u: 0, v: -1, phase: 'init', result: null, message: '起点为城市 0，dp[{0}][0] = 0，其余状态为 ∞' },
    description: '初始化',
    codeLine: 4,
  });

  for (let mask = 1; mask < FULL; mask++) {
    if (!(mask & 1)) continue;
    for (let u = 0; u < n; u++) {
      if (!(mask & (1 << u)) || dp[mask][u] === Infinity) continue;
      for (let v = 0; v < n; v++) {
        if (mask & (1 << v)) continue;
        const next = mask | (1 << v);
        const oldVal = dp[next][v];
        const newVal = dp[mask][u] + dist[u][v];
        dp[next][v] = Math.min(oldVal, newVal);
        steps.push({
          state: {
            n, dist, dp: snap(), mask, u, v, phase: 'dp', result: null,
            message: `mask=${setOf(mask, n)} 当前在 u=${u}：走向 v=${v}，dp[${setOf(next, n)}][${v}] = min(${fmt(oldVal)}, ${dp[mask][u]}+${dist[u][v]}) = ${fmt(dp[next][v])}`,
          },
          description: `${setOf(mask, n)}→${v}`,
          codeLine: 12,
        });
      }
    }
  }

  steps.push({
    state: { n, dist, dp: snap(), mask: FULL - 1, u: -1, v: -1, phase: 'close', result: null, message: '所有城市已访问（全集），枚举最后所在城市 u，加上回程 dist[u][0]' },
    description: '枚举回程',
    codeLine: 17,
  });

  let ans = Infinity;
  for (let u = 1; u < n; u++) {
    const total = dp[FULL - 1][u] + dist[u][0];
    ans = Math.min(ans, total);
    steps.push({
      state: { n, dist, dp: snap(), mask: FULL - 1, u, v: 0, phase: 'close', result: null, message: `u=${u}：总路程 = dp[全集][${u}] + dist[${u}][0] = ${fmt(dp[FULL - 1][u])} + ${dist[u][0]} = ${total}` },
      description: `u=${u}→${total}`,
      codeLine: 18,
    });
  }

  steps.push({
    state: { n, dist, dp: snap(), mask: FULL - 1, u: -1, v: -1, phase: 'done', result: ans, message: `最短哈密顿回路长度 = ${ans}` },
    description: `结果=${ans}`,
    codeLine: 19,
  });

  return steps;
}

export function DpStateCompressionPanel() {
  const dist = DEFAULT_DIST;
  const n = dist.length;
  const FULL = 1 << n;
  const steps = useMemo(() => buildSteps(dist), [dist]);

  const initial: DpStateCompressionState = {
    n, dist,
    dp: Array.from({ length: FULL }, (_, m) => Array.from({ length: n }, (_, u) => (m === 1 && u === 0 ? 0 : Infinity))),
    mask: 1, u: 0, v: -1, phase: 'init', result: null, message: '',
  };

  const masksWithZero = Array.from({ length: FULL }, (_, m) => m).filter((m) => m & 1);

  return (
    <Stepper<DpStateCompressionState>
      steps={steps}
      initialState={initial}
      codeLines={dpStateCode}
      codeTitle="状压DP·旅行商 TSP"
      render={(state) => {
        const target = state.v >= 0 ? state.mask | (1 << state.v) : -1;
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">
              绿色=已访问城市，黄色=当前城市u，紫色=目标城市v，蓝色=刚更新的dp格
            </div>

            {/* Cities */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">城市访问状态（mask = {setOf(state.mask, state.n)}）:</div>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: state.n }, (_, c) => c).map((c) => {
                  const visited = state.mask & (1 << c);
                  const isU = c === state.u;
                  const isV = c === state.v;
                  return (
                    <div
                      key={c}
                      className={clsx(
                        'w-12 h-12 flex flex-col items-center justify-center rounded-full text-sm font-mono border-2 transition-all',
                        isV
                          ? 'bg-purple-500/30 border-purple-400 text-purple-200 scale-105'
                          : isU
                            ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                            : visited
                              ? 'bg-green-900/40 border-green-600 text-green-300'
                              : 'bg-surface-2 border-edge-2 text-gray-400',
                      )}
                    >
                      <span>{c}</span>
                      <span className="text-[8px] opacity-70">{visited ? '已访问' : '未访问'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* dist matrix */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">距离矩阵 dist[u][v]:</div>
              <div className="inline-block">
                {state.dist.map((row, uu) => (
                  <div key={uu} className="flex gap-1 mb-1">
                    {row.map((d, vv) => {
                      const isEdge = state.phase === 'dp' && uu === state.u && vv === state.v;
                      return (
                        <div
                          key={vv}
                          className={clsx(
                            'w-9 h-8 flex items-center justify-center rounded text-xs font-mono border',
                            isEdge
                              ? 'bg-purple-500/30 border-purple-400 text-purple-100 scale-105'
                              : 'bg-surface-2 border-edge-2 text-gray-400',
                          )}
                        >
                          {d}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* dp table */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">dp[mask][u]（仅含起点0的状态）:</div>
              <div className="inline-block">
                <div className="flex gap-1 mb-1">
                  <div className="w-20 h-8" />
                  {Array.from({ length: state.n }, (_, u) => (
                    <div key={u} className="w-12 h-8 flex items-center justify-center text-[10px] text-gray-500">u={u}</div>
                  ))}
                </div>
                {masksWithZero.map((m) => (
                  <div key={m} className="flex gap-1 mb-1">
                    <div className="w-20 h-8 flex items-center text-[10px] font-mono text-gray-500">
                      {m.toString(2).padStart(state.n, '0')} {setOf(m, state.n)}
                    </div>
                    {state.dp[m].map((val, u) => {
                      const isSource = state.phase === 'dp' && m === state.mask && u === state.u;
                      const isTarget = m === target && u === state.v;
                      return (
                        <div
                          key={u}
                          className={clsx(
                            'w-12 h-8 flex items-center justify-center rounded text-xs font-mono border transition-all',
                            isTarget
                              ? 'bg-blue-500/30 border-blue-400 text-blue-100 scale-105'
                              : isSource
                                ? 'bg-yellow-500/25 border-yellow-500 text-yellow-200'
                                : val !== Infinity
                                  ? 'bg-green-900/25 border-green-800 text-green-300'
                                  : 'bg-surface-2 border-edge-2 text-gray-600',
                          )}
                        >
                          {fmt(val)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {state.phase === 'done' && state.result !== null && (
              <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <span className="text-green-300 font-mono text-sm">最短哈密顿回路长度 = {state.result}</span>
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
