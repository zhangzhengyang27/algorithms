'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const editDistCode = [
  'function editDistance(a, b) {',
  '  const dp = Array(m+1).fill().map(() => Array(n+1).fill(0));',
  '  for (let i = 0; i <= m; i++) dp[i][0] = i;',
  '  for (let j = 0; j <= n; j++) dp[0][j] = j;',
  '  for (let i = 1; i <= m; i++)',
  '    for (let j = 1; j <= n; j++)',
  '      dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]',
  '               : 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);',
  '  return dp[m][n];',
  '}',
];

interface EDState {
  a: string;
  b: string;
  dp: number[][];
  i: number;
  j: number;
  operation: string;
  message: string;
}

export function buildSteps(a: string, b: string): VizStep<EDState>[] {
  const steps: VizStep<EDState>[] = [];
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  const snap = (i: number, j: number, op: string, msg: string, cl: number): VizStep<EDState> => ({
    state: { a, b, dp: dp.map((r) => [...r]), i, j, operation: op, message: msg },
    description: msg,
    codeLine: cl,
  });

  steps.push(snap(-1, -1, '', `编辑距离：将 "${a}" 变为 "${b}" 的最少单字符操作数`, 1));

  for (let i = 0; i <= m; i++) { dp[i][0] = i; steps.push(snap(i, 0, '删除', `a 前缀长度 ${i} 配空串，需 ${i} 次删除`, 3)); }
  for (let j = 0; j <= n; j++) { dp[0][j] = j; steps.push(snap(0, j, '插入', `空串配 b 前缀长度 ${j}，需 ${j} 次插入`, 4)); }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        steps.push(snap(i, j, '匹配', `${a[i - 1]}==${b[j - 1]}，无需操作，dp=${dp[i][j]}`, 7));
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        steps.push(snap(i, j, '增/删/改', `${a[i - 1]}≠${b[j - 1]}，取增删改最小值+1，dp=${dp[i][j]}`, 8));
      }
    }
  }

  steps.push(snap(m, n, '', `✅ 编辑距离 = ${dp[m][n]}`, 9));
  return steps;
}

export function EditDistancePanel() {
  const [a, setA] = useState('sunday');
  const [b, setB] = useState('saturday');

  const steps = useMemo(() => buildSteps(a || ' ', b || ' '), [a, b]);
  const initial: EDState = { a, b, dp: [], i: -1, j: -1, operation: '', message: '' };

  return (
    <Stepper<EDState>
      steps={steps}
      initialState={initial}
      codeLines={editDistCode}
      codeTitle="编辑距离 Edit Distance"
      headerActions={
        <>
          <span className="text-sm text-gray-400">串A:</span>
          <input type="text" value={a} onChange={(e) => setA(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-28" />
          <span className="text-sm text-gray-400">串B:</span>
          <input type="text" value={b} onChange={(e) => setB(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-28" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">黄色=当前 (i,j) 格，绿字=字符匹配，红字=需操作</div>
          <table className="mx-auto border-collapse text-xs font-mono">
            <thead>
              <tr>
                <th className="border border-edge px-2 py-1 text-gray-500">ε</th>
                {state.b.split('').map((ch, j) => (
                  <th key={j} className={clsx('border border-edge px-2 py-1', state.j - 1 === j ? 'bg-purple-500/20 text-purple-200' : 'text-gray-400')}>{ch}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.dp.map((row, i) => (
                <tr key={i}>
                  <th className={clsx('border border-edge px-2 py-1', state.i - 1 === i - 1 ? 'bg-purple-500/20 text-purple-200' : 'text-gray-400')}>{i === 0 ? 'ε' : state.a[i - 1]}</th>
                  {row.map((v, j) => {
                    const isCur = state.i === i && state.j === j;
                    const matched = i > 0 && j > 0 && state.a[i - 1] === state.b[j - 1];
                    return (
                      <td key={j} className={clsx('border border-edge px-2 py-1 text-center min-w-9', isCur ? 'bg-yellow-500/30 text-yellow-200' : matched && i === state.i && j === state.j ? 'text-green-300' : 'text-gray-300')}>{v}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-center text-sm text-gray-300">{state.message}</div>
        </div>
      )}
    />
  );
}
