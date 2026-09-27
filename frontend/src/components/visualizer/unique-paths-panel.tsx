'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const uniquePathsCode = [
  'function uniquePaths(m, n) {',
  '  const dp = Array(m).fill().map(() => Array(n).fill(1));',
  '  for (let i = 1; i < m; i++)',
  '    for (let j = 1; j < n; j++)',
  '      dp[i][j] = dp[i-1][j] + dp[i][j-1];',
  '  return dp[m-1][n-1];',
  '}',
];

interface UniquePathsState {
  m: number;
  n: number;
  dp: number[][];
  i: number;
  j: number;
  message: string;
}

export function buildSteps(m: number, n: number): VizStep<UniquePathsState>[] {
  const steps: VizStep<UniquePathsState>[] = [];
  const dp: number[][] = Array(m)
    .fill(null)
    .map(() => Array(n).fill(1));

  const snapshot = (i: number, j: number, message: string, codeLine: number): VizStep<UniquePathsState> => ({
    state: { m, n, dp: dp.map((r) => [...r]), i, j, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(0, 0, `从 (0,0) 到 (${m - 1},${n - 1}) 只能向右/向下走，求路径总数`, 1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      steps.push(
        snapshot(i, j, `dp[${i}][${j}] = dp[${i - 1}][${j}](${dp[i - 1][j]}) + dp[${i}][${j - 1}](${dp[i][j - 1]}) = ${dp[i][j]}`, 5),
      );
    }
  }

  steps.push(snapshot(m - 1, n - 1, `路径总数 = ${dp[m - 1][n - 1]}`, 6));
  return steps;
}

function render(state: UniquePathsState) {
  const { m, n, dp, i, j, message } = state;
  return (
    <div className="space-y-3">
      <table className="border-collapse text-sm">
        <tbody>
          {dp.map((row, ri) => (
            <tr key={ri}>
              {row.map((v, ci) => (
                <td
                  key={ci}
                  className={`border border-edge w-12 h-12 text-center font-mono ${
                    ri === i && ci === j ? 'bg-emerald-500/40' : 'bg-surface-2'
                  }`}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-gray-300">{message}</p>
    </div>
  );
}

export function UniquePathsPanel() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(4);
  const steps = useMemo(() => buildSteps(m, n), [m, n]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">行 m:</span>
        <input
          type="number"
          value={m}
          min={1}
          max={8}
          onChange={(e) => setM(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
        />
        <span className="text-sm text-gray-400">列 n:</span>
        <input
          type="number"
          value={n}
          min={1}
          max={8}
          onChange={(e) => setN(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
        />
        <span className="text-xs text-gray-500">（1–8）</span>
      </div>
      <Stepper steps={steps} codeLines={uniquePathsCode} render={render} />
    </div>
  );
}
