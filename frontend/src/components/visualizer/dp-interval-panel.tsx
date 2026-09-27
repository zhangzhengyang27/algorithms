'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const dpIntervalCode = [
  'function stoneMerge(stones) {',
  '  const n = stones.length;',
  '  const prefix = new Array(n + 1).fill(0);',
  '  for (let i = 0; i < n; i++)',
  '    prefix[i + 1] = prefix[i] + stones[i];',
  '  const dp = Array.from({ length: n }, () => new Array(n).fill(0));',
  '  for (let len = 2; len <= n; len++) {',
  '    for (let l = 0; l + len - 1 < n; l++) {',
  '      const r = l + len - 1;',
  '      dp[l][r] = Infinity;',
  '      for (let k = l; k < r; k++)',
  '        dp[l][r] = Math.min(dp[l][r], dp[l][k] + dp[k+1][r]);',
  '      dp[l][r] += prefix[r + 1] - prefix[l];',
  '    }',
  '  }',
  '  return dp[0][n - 1];',
  '}',
];

interface DpIntervalState {
  stones: number[];
  prefix: number[];
  dp: (number | null)[][];
  len: number;
  l: number;
  r: number;
  k: number;
  bestK: number;
  candidate: number | null;
  phase: 'init' | 'compute' | 'done';
  message: string;
}

export function buildSteps(stones: number[]): VizStep<DpIntervalState>[] {
  const n = stones.length;
  const steps: VizStep<DpIntervalState>[] = [];
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + stones[i];
  const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
  for (let i = 0; i < n; i++) dp[i][i] = 0;

  const snap = () => dp.map((row) => [...row]);

  steps.push({
    state: { stones, prefix: [...prefix], dp: snap(), len: 0, l: -1, r: -1, k: -1, bestK: -1, candidate: null, phase: 'init', message: `石子堆 [${stones.join(', ')}]，dp[i][i]=0（单堆无需合并），构建前缀和` },
    description: '初始化',
    codeLine: 5,
  });

  for (let len = 2; len <= n; len++) {
    steps.push({
      state: { stones, prefix: [...prefix], dp: snap(), len, l: -1, r: -1, k: -1, bestK: -1, candidate: null, phase: 'compute', message: `枚举区间长度 len = ${len}` },
      description: `len=${len}`,
      codeLine: 6,
    });

    for (let l = 0; l + len - 1 < n; l++) {
      const r = l + len - 1;
      steps.push({
        state: { stones, prefix: [...prefix], dp: snap(), len, l, r, k: -1, bestK: -1, candidate: null, phase: 'compute', message: `区间 [${l}, ${r}]，dp[${l}][${r}] = ∞，枚举分割点 k ∈ [${l}, ${r - 1}]` },
        description: `区间[${l},${r}]`,
        codeLine: 9,
      });

      let best = Infinity;
      let bestK = l;
      for (let k = l; k < r; k++) {
        const val = (dp[l][k] as number) + (dp[k + 1][r] as number);
        if (val < best) { best = val; bestK = k; }
        steps.push({
          state: { stones, prefix: [...prefix], dp: snap(), len, l, r, k, bestK, candidate: val, phase: 'compute', message: `k=${k}: dp[${l}][${k}]+dp[${k + 1}][${r}] = ${(dp[l][k] as number)}+${(dp[k + 1][r] as number)} = ${val}，当前最小 ${best}（k=${bestK}）` },
          description: `k=${k},val=${val}`,
          codeLine: 11,
        });
      }

      const cost = prefix[r + 1] - prefix[l];
      dp[l][r] = best + cost;
      steps.push({
        state: { stones, prefix: [...prefix], dp: snap(), len, l, r, k: -1, bestK, candidate: null, phase: 'compute', message: `dp[${l}][${r}] = ${best} + cost(${l}..${r}) = ${best} + ${cost} = ${dp[l][r]}` },
        description: `dp[${l}][${r}]=${dp[l][r]}`,
        codeLine: 12,
      });
    }
  }

  steps.push({
    state: { stones, prefix: [...prefix], dp: snap(), len: 0, l: 0, r: n - 1, k: -1, bestK: -1, candidate: null, phase: 'done', message: `最小合并代价 dp[0][${n - 1}] = ${dp[0][n - 1]}` },
    description: `结果=${dp[0][n - 1]}`,
    codeLine: 15,
  });

  return steps;
}

export function DpIntervalPanel() {
  const [stones, setStones] = useState<number[]>([4, 1, 3, 2]);

  const steps = useMemo(() => buildSteps(stones), [stones]);
  const n = stones.length;
  const initial: DpIntervalState = {
    stones,
    prefix: new Array(n + 1).fill(0),
    dp: Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : null))),
    len: 0, l: -1, r: -1, k: -1, bestK: -1, candidate: null,
    phase: 'init',
    message: '',
  };

  return (
    <Stepper<DpIntervalState>
      steps={steps}
      initialState={initial}
      codeLines={dpIntervalCode}
      codeTitle="区间DP·石子合并 Interval DP"
      headerActions={
        <>
          <span className="text-sm text-gray-400">石子堆:</span>
          <input
            type="text"
            value={stones.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((v) => Number.isFinite(v));
              if (parsed.length >= 2 && parsed.length <= 6) setStones(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40"
            placeholder="逗号分隔(2~6个)"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前区间端点，紫色=分割点k，蓝色=当前计算的dp格，绿色=已完成
          </div>

          {/* Stones row */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">stones[]:</div>
            <div className="flex gap-1 flex-wrap">
              {state.stones.map((v, i) => {
                const inInterval = state.phase === 'compute' && i >= state.l && i <= state.r;
                const isEndpoint = state.phase === 'compute' && (i === state.l || i === state.r);
                const isSplit = state.k >= 0 && (i === state.k || i === state.k + 1);
                return (
                  <div
                    key={i}
                    className={clsx(
                      'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                      isSplit
                        ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                        : isEndpoint
                          ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                          : inInterval
                            ? 'bg-blue-500/15 border-blue-500/60 text-blue-200'
                            : 'bg-surface-2 border-edge-2 text-gray-300',
                    )}
                  >
                    {v}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 flex-wrap">
              {state.stones.map((_, i) => (
                <div key={i} className="w-10 text-center text-[9px] text-gray-600">{i}</div>
              ))}
            </div>
          </div>

          {/* DP matrix */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">dp[l][r] 矩阵（行=l，列=r）:</div>
            <div className="inline-block">
              {state.dp.map((row, l) => (
                <div key={l} className="flex gap-1 mb-1">
                  {row.map((v, r) => {
                    const isCurrent = state.phase === 'compute' && l === state.l && r === state.r;
                    const isComputed = v !== null && !isCurrent;
                    const invalid = r < l;
                    return (
                      <div
                        key={r}
                        className={clsx(
                          'w-12 h-9 flex items-center justify-center rounded text-xs font-mono border transition-all',
                          invalid
                            ? 'bg-surface border-edge text-gray-700'
                            : isCurrent
                              ? 'bg-blue-500/30 border-blue-400 text-blue-100 scale-105'
                              : isComputed
                                ? 'bg-green-900/30 border-green-800 text-green-300'
                                : 'bg-surface-2 border-edge-2 text-gray-400',
                        )}
                      >
                        {invalid ? '' : v === null ? '∞' : v}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          {state.phase === 'done' && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                最小合并代价 = dp[0][{state.stones.length - 1}] = {state.dp[0][state.stones.length - 1]}
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
