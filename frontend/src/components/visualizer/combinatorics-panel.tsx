'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const combinatoricsCode = [
  'function pascalTriangle(n) {',
  '  const C = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));',
  '  for (let i = 0; i <= n; i++) {',
  '    C[i][0] = 1;',
  '    for (let j = 1; j <= i; j++)',
  '      C[i][j] = C[i - 1][j - 1] + C[i - 1][j];',
  '  }',
  '  return C;',
  '}',
  'function permute(nums) {',
  '  const res = [];',
  '  const dfs = (path, used) => {',
  '    if (path.length === nums.length) { res.push([...path]); return; }',
  '    for (let i = 0; i < nums.length; i++) {',
  '      if (used[i]) continue;',
  '      used[i] = true;',
  '      path.push(nums[i]);',
  '      dfs(path, used);',
  '      path.pop();',
  '      used[i] = false;',
  '    }',
  '  };',
  '  dfs([], new Array(nums.length).fill(false));',
  '  return res;',
  '}',
];

interface CombState {
  phase: 'pascal' | 'query' | 'perm';
  tri: number[][];
  activeI: number;
  activeJ: number;
  n: number;
  k: number;
  queryResult: number | null;
  permNums: number[];
  permPath: number[];
  permUsed: boolean[];
  permResults: number[][];
  message: string;
}

function buildSteps(n: number, k: number): VizStep<CombState>[] {
  const steps: VizStep<CombState>[] = [];
  const permNums = [1, 2, 3];
  const tri: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  const permResults: number[][] = [];

  const snap = (phase: CombState['phase'], activeI: number, activeJ: number, queryResult: number | null, permPath: number[], permUsed: boolean[], msg: string): CombState => ({
    phase,
    tri: tri.map((row) => [...row]),
    activeI, activeJ, n, k, queryResult,
    permNums,
    permPath: [...permPath],
    permUsed: [...permUsed],
    permResults: permResults.map((r) => [...r]),
    message: msg,
  });

  steps.push({
    state: snap('pascal', -1, -1, null, [], [], `用杨辉三角递推组合数：C(i,j) = C(i-1,j-1) + C(i-1,j)，构建到第 ${n} 行`),
    description: '初始化',
    codeLine: 1,
  });

  for (let i = 0; i <= n; i++) {
    tri[i][0] = 1;
    steps.push({
      state: snap('pascal', i, 0, null, [], [], `第 ${i} 行行首：C(${i},0) = 1`),
      description: `C(${i},0)=1`,
      codeLine: 3,
    });
    for (let j = 1; j <= i; j++) {
      tri[i][j] = tri[i - 1][j - 1] + tri[i - 1][j];
      steps.push({
        state: snap('pascal', i, j, null, [], [], `C(${i},${j}) = C(${i - 1},${j - 1}) + C(${i - 1},${j}) = ${tri[i - 1][j - 1]} + ${tri[i - 1][j]} = ${tri[i][j]}`),
        description: `C(${i},${j})=${tri[i][j]}`,
        codeLine: 5,
      });
    }
  }

  steps.push({
    state: snap('query', n, k, tri[n][k], [], [], `杨辉三角构建完成，查询 C(${n},${k}) = ${tri[n][k]}`),
    description: `C(${n},${k})=${tri[n][k]}`,
    codeLine: 7,
  });

  // ---------- permutations ----------
  steps.push({
    state: snap('perm', -1, -1, tri[n][k], [], new Array(permNums.length).fill(false), `接下来用回溯法生成 [${permNums.join(', ')}] 的全排列（共 ${permNums.length}! = 6 个）`),
    description: '全排列',
    codeLine: 9,
  });

  function dfs(path: number[], used: boolean[]) {
    if (path.length === permNums.length) {
      permResults.push([...path]);
      steps.push({
        state: snap('perm', -1, -1, tri[n][k], path, used, `路径已满，收集全排列 [${path.join(', ')}]（第 ${permResults.length} 个），回溯`),
        description: `排列 ${permResults.length}: [${path.join(',')}]`,
        codeLine: 12,
      });
      return;
    }
    for (let i = 0; i < permNums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      path.push(permNums[i]);
      steps.push({
        state: snap('perm', -1, -1, tri[n][k], path, used, `选择 ${permNums[i]}，当前路径 [${path.join(', ')}]`),
        description: `选 ${permNums[i]}`,
        codeLine: 16,
      });
      dfs(path, used);
      path.pop();
      used[i] = false;
    }
  }

  dfs([], new Array(permNums.length).fill(false));

  steps.push({
    state: snap('perm', -1, -1, tri[n][k], [], new Array(permNums.length).fill(false), `✅ 全排列生成完毕，共 ${permResults.length} 个：${permResults.map((r) => `[${r.join('')}]`).join(' ')}`),
    description: '生成完毕',
    codeLine: 23,
  });

  return steps;
}

export function CombinatoricsPanel() {
  const [n, setN] = useState(5);
  const [k, setK] = useState(2);

  const steps = useMemo(() => buildSteps(n, Math.min(k, n)), [n, k]);
  const initial: CombState = {
    phase: 'pascal',
    tri: Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0)),
    activeI: -1,
    activeJ: -1,
    n,
    k: Math.min(k, n),
    queryResult: null,
    permNums: [1, 2, 3],
    permPath: [],
    permUsed: [false, false, false],
    permResults: [],
    message: '',
  };

  return (
    <Stepper<CombState>
      steps={steps}
      initialState={initial}
      codeLines={combinatoricsCode}
      codeTitle="组合数学 Combinatorics"
      headerActions={
        <>
          <span className="text-sm text-gray-400">n:</span>
          <input type="number" value={n} min={2} max={8} onChange={(e) => setN(Math.max(2, Math.min(8, Number(e.target.value) || 2)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
          <span className="text-sm text-gray-400">k:</span>
          <input type="number" value={k} min={0} max={n} onChange={(e) => setK(Math.max(0, Math.min(n, Number(e.target.value) || 0)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">
            黄色=当前填写的格子，蓝色=递推来源 C(i-1,j-1) 与 C(i-1,j)，绿色=查询结果
          </div>

          {/* Pascal triangle */}
          <div className="flex flex-col items-center gap-1">
            {Array.from({ length: state.n + 1 }, (_, i) => (
              <div key={i} className="flex gap-1 justify-center">
                {Array.from({ length: i + 1 }, (_, j) => {
                  const filled = state.tri[i]?.[j] !== 0;
                  const isActive = i === state.activeI && j === state.activeJ;
                  const isSource = state.activeI === i + 1 && (state.activeJ === j || state.activeJ === j + 1);
                  const isQuery = state.phase === 'query' && i === state.n && j === state.k;
                  return (
                    <div
                      key={j}
                      className={clsx(
                        'w-9 h-8 flex items-center justify-center rounded text-xs font-mono border transition-all',
                        isActive
                          ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                          : isQuery
                            ? 'bg-green-500/25 border-green-400 text-green-200 scale-110'
                            : isSource
                              ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                              : filled
                                ? 'bg-surface-2 border-edge-2 text-gray-300'
                                : 'bg-bg border-edge text-gray-700',
                      )}
                    >
                      {filled ? state.tri[i][j] : '·'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {state.phase === 'query' && state.queryResult !== null && (
            <div className="text-center p-2 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">C({state.n},{state.k}) = {state.queryResult}</span>
            </div>
          )}

          {/* Permutations */}
          {state.phase === 'perm' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500">全排列 [1,2,3]（回溯）:</div>
              <div className="flex gap-4 justify-center items-center">
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-600">可选数字:</div>
                  <div className="flex gap-1">
                    {state.permNums.map((v, i) => (
                      <div
                        key={i}
                        className={clsx(
                          'w-8 h-8 flex items-center justify-center rounded text-xs font-mono border',
                          state.permUsed[i]
                            ? 'bg-bg border-edge text-gray-700 line-through'
                            : 'bg-surface-2 border-edge-2 text-gray-300',
                        )}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-600">当前路径:</div>
                  <div className="flex gap-1">
                    {Array.from({ length: state.permNums.length }, (_, i) => (
                      <div
                        key={i}
                        className={clsx(
                          'w-8 h-8 flex items-center justify-center rounded text-xs font-mono border',
                          i < state.permPath.length
                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200'
                            : 'bg-bg border-edge text-gray-700',
                        )}
                      >
                        {state.permPath[i] ?? '·'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-center min-h-[28px]">
                {state.permResults.map((r, i) => (
                  <span
                    key={i}
                    className={clsx(
                      'text-xs px-2 py-0.5 rounded border font-mono',
                      i === state.permResults.length - 1
                        ? 'bg-green-900/30 border-green-700 text-green-300'
                        : 'bg-surface-2 border-edge-2 text-gray-400',
                    )}
                  >
                    [{r.join(', ')}]
                  </span>
                ))}
              </div>
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
