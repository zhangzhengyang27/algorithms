'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const lcsCode = [
  'function longestCommonSubsequence(s1, s2) {',
  '  const m = s1.length, n = s2.length;',
  '  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
  '  for (let i = 1; i <= m; i++) {',
  '    for (let j = 1; j <= n; j++) {',
  '      if (s1[i - 1] === s2[j - 1])',
  '        dp[i][j] = dp[i - 1][j - 1] + 1;',
  '      else',
  '        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);',
  '    }',
  '  }',
  '  return dp[m][n];',
  '}',
];

interface LCSState {
  s1: string;
  s2: string;
  dp: number[][];
  i: number; // current row (1-based)
  j: number; // current col (1-based)
  matched: boolean | null;
  backtrack: [number, number][]; // backtrack path cells
  lcsResult: string;
  phase: 'dp' | 'backtrack' | 'result';
  message: string;
}

export function buildSteps(s1: string, s2: string): VizStep<LCSState>[] {
  const steps: VizStep<LCSState>[] = [];
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  const snap = (
    i: number,
    j: number,
    matched: boolean | null,
    bt: [number, number][],
    res: string,
    phase: 'dp' | 'backtrack' | 'result',
    msg: string,
  ): LCSState => ({
    s1,
    s2,
    dp: dp.map((row) => [...row]),
    i,
    j,
    matched,
    backtrack: bt.map((c) => [...c] as [number, number]),
    lcsResult: res,
    phase,
    message: msg,
  });

  steps.push({
    state: snap(-1, -1, null, [], '', 'dp', `s1="${s1}"，s2="${s2}"，dp 为 (m+1)×(n+1) 矩阵，边界为 0`),
    description: '初始化 dp 矩阵',
    codeLine: 3,
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = s1[i - 1] === s2[j - 1];
      if (match) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
      steps.push({
        state: snap(i, j, match, [], '', 'dp', match
          ? `s1[${i - 1}]='${s1[i - 1]}' = s2[${j - 1}]='${s2[j - 1]}' ✓，dp[${i}][${j}] = dp[${i - 1}][${j - 1}]+1 = ${dp[i][j]}`
          : `s1[${i - 1}]='${s1[i - 1]}' ≠ s2[${j - 1}]='${s2[j - 1]}'，dp[${i}][${j}] = max(上${dp[i - 1][j]}, 左${dp[i][j - 1]}) = ${dp[i][j]}`),
        description: `dp[${i}][${j}]=${dp[i][j]}`,
        codeLine: match ? 7 : 9,
      });
    }
  }

  // Backtrack
  const bt: [number, number][] = [];
  let lcs = '';
  let bi = m;
  let bj = n;
  while (bi > 0 && bj > 0) {
    if (s1[bi - 1] === s2[bj - 1]) {
      bt.push([bi, bj]);
      lcs = s1[bi - 1] + lcs;
      bi--;
      bj--;
    } else if (dp[bi - 1][bj] >= dp[bi][bj - 1]) {
      bt.push([bi, bj]);
      bi--;
    } else {
      bt.push([bi, bj]);
      bj--;
    }
  }

  steps.push({
    state: snap(-1, -1, null, bt, lcs, 'backtrack', `从 dp[${m}][${n}]=${dp[m][n]} 开始回溯：相等取左上，否则取较大方向`),
    description: '回溯路径',
    codeLine: 12,
  });

  steps.push({
    state: snap(-1, -1, null, bt, lcs, 'result', `✅ LCS = "${lcs}"，长度 = ${dp[m][n]}`),
    description: `LCS = "${lcs}"`,
    codeLine: 12,
  });

  return steps;
}

export function LCSPanel() {
  const [s1, setS1] = useState('abcde');
  const [s2, setS2] = useState('ace');

  const steps = useMemo(() => buildSteps(s1, s2), [s1, s2]);
  const initial: LCSState = {
    s1,
    s2,
    dp: Array.from({ length: s1.length + 1 }, () => new Array(s2.length + 1).fill(0)),
    i: -1,
    j: -1,
    matched: null,
    backtrack: [],
    lcsResult: '',
    phase: 'dp',
    message: '',
  };

  return (
    <Stepper<LCSState>
      steps={steps}
      initialState={initial}
      codeLines={lcsCode}
      codeTitle="最长公共子序列 LCS"
      headerActions={
        <>
          <span className="text-sm text-gray-400">s1:</span>
          <input
            type="text"
            value={s1}
            onChange={(e) => { if (e.target.value.length >= 1 && e.target.value.length <= 10) setS1(e.target.value); }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-28"
            placeholder="字符串1"
          />
          <span className="text-sm text-gray-400">s2:</span>
          <input
            type="text"
            value={s2}
            onChange={(e) => { if (e.target.value.length >= 1 && e.target.value.length <= 10) setS2(e.target.value); }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-28"
            placeholder="字符串2"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前填表位置，绿色=字符相等（取左上+1），紫色=回溯路径
          </div>

          {/* Strings */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 w-8">s1:</span>
              {state.s1.split('').map((ch, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-8 h-8 flex items-center justify-center rounded text-sm font-mono border',
                    state.phase !== 'dp' && state.lcsResult.includes(ch)
                      ? 'bg-green-500/20 border-green-500 text-green-300'
                      : state.i === i + 1
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200'
                        : 'bg-surface-2 border-edge-2 text-gray-300',
                  )}
                >
                  {ch}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 w-8">s2:</span>
              {state.s2.split('').map((ch, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-8 h-8 flex items-center justify-center rounded text-sm font-mono border',
                    state.j === i + 1
                      ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                      : 'bg-surface-2 border-edge-2 text-gray-300',
                  )}
                >
                  {ch}
                </div>
              ))}
            </div>
          </div>

          {/* DP matrix */}
          <div className="overflow-x-auto">
            <div className="inline-block">
              {state.dp.map((row, i) => (
                <div key={i} className="flex gap-1 mb-1">
                  {row.map((v, j) => {
                    const isCurrent = i === state.i && j === state.j;
                    const inBt = state.backtrack.some(([bi, bj]) => bi === i && bj === j);
                    const isMatch = isCurrent && state.matched === true;
                    return (
                      <div
                        key={j}
                        className={clsx(
                          'w-9 h-9 flex items-center justify-center rounded text-xs font-mono border transition-all',
                          isMatch
                            ? 'bg-green-500/30 border-green-400 text-green-200 scale-105'
                            : isCurrent
                              ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                              : inBt
                                ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                                : i === 0 || j === 0
                                  ? 'bg-surface border-edge text-gray-600'
                                  : 'bg-surface-2 border-edge-2 text-gray-300',
                        )}
                      >
                        {v}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          {state.phase === 'result' && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                LCS = &quot;{state.lcsResult}&quot;，长度 = {state.lcsResult.length}
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
