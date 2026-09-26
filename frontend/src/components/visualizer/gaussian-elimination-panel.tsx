'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const gaussCode = [
  'function gaussianElimination(aug) {',
  '  const n = aug.length;',
  '  for (let col = 0; col < n; col++) {',
  '    let pivot = col;',
  '    for (let r = col + 1; r < n; r++)',
  '      if (Math.abs(aug[r][col]) > Math.abs(aug[pivot][col])) pivot = r;',
  '    if (pivot !== col) [aug[col], aug[pivot]] = [aug[pivot], aug[col]];',
  '    for (let r = col + 1; r < n; r++) {',
  '      const factor = aug[r][col] / aug[col][col];',
  '      for (let c = col; c <= n; c++)',
  '        aug[r][c] -= factor * aug[col][c];',
  '    }',
  '  }',
  '  const x = new Array(n).fill(0);',
  '  for (let i = n - 1; i >= 0; i--) {',
  '    let sum = aug[i][n];',
  '    for (let j = i + 1; j < n; j++) sum -= aug[i][j] * x[j];',
  '    x[i] = sum / aug[i][i];',
  '  }',
  '  return x;',
  '}',
];

function fmt(v: number): string {
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? '0' : String(r);
}

interface GaussState {
  matrix: number[][];
  col: number;
  pivotRow: number;
  activeRow: number;
  factor: number | null;
  backRow: number;
  solution: (number | null)[];
  phase: 'elim' | 'swap' | 'back' | 'done';
  message: string;
}

function buildSteps(input: number[][]): VizStep<GaussState>[] {
  const steps: VizStep<GaussState>[] = [];
  const aug = input.map((r) => [...r]);
  const n = aug.length;
  const solution: (number | null)[] = new Array(n).fill(null);

  const snap = (partial: Partial<GaussState> & { message: string }): GaussState => ({
    matrix: aug.map((r) => [...r]),
    col: -1,
    pivotRow: -1,
    activeRow: -1,
    factor: null,
    backRow: -1,
    solution: [...solution],
    phase: 'elim',
    ...partial,
  });

  steps.push({
    state: snap({ message: '增广矩阵 [A|b]，目标：化为上三角矩阵' }),
    description: '初始矩阵',
    codeLine: 1,
  });

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[pivot][col])) pivot = r;
    }

    steps.push({
      state: snap({ col, pivotRow: pivot, message: `第 ${col} 列选主元：第 ${pivot} 行绝对值最大（|${fmt(aug[pivot][col])}|）` }),
      description: `选主元 行${pivot}`,
      codeLine: 5,
    });

    if (pivot !== col) {
      [aug[col], aug[pivot]] = [aug[pivot], aug[col]];
      steps.push({
        state: snap({ col, pivotRow: col, phase: 'swap', message: `交换第 ${col} 行与第 ${pivot} 行，主元 = ${fmt(aug[col][col])}` }),
        description: `交换行 ${col}↔${pivot}`,
        codeLine: 6,
      });
    }

    for (let r = col + 1; r < n; r++) {
      const factor = aug[r][col] / aug[col][col];
      for (let c = col; c <= n; c++) {
        aug[r][c] -= factor * aug[col][c];
      }
      steps.push({
        state: snap({ col, pivotRow: col, activeRow: r, factor, message: `消元：第 ${r} 行 -= ${fmt(factor)} × 第 ${col} 行，a[${r}][${col}] 变为 0` }),
        description: `消元 行${r}`,
        codeLine: 10,
      });
    }
  }

  steps.push({
    state: snap({ phase: 'back', message: '消元完成，矩阵已化为上三角，开始回代' }),
    description: '上三角完成',
    codeLine: 13,
  });

  for (let i = n - 1; i >= 0; i--) {
    let sum = aug[i][n];
    for (let j = i + 1; j < n; j++) sum -= aug[i][j] * solution[j]!;
    const xi = sum / aug[i][i];
    solution[i] = xi;
    steps.push({
      state: snap({ backRow: i, phase: 'back', message: `回代：x[${i}] = ${fmt(sum)} / ${fmt(aug[i][i])} = ${fmt(xi)}` }),
      description: `x[${i}]=${fmt(xi)}`,
      codeLine: 17,
    });
  }

  steps.push({
    state: snap({ phase: 'done', message: `方程组解：x = [${solution.map((v) => fmt(v!)).join(', ')}]` }),
    description: '求解完成',
    codeLine: 19,
  });

  return steps;
}

const DEFAULT_AUG = [
  [2, 1, -1, 8],
  [-3, -1, 2, -11],
  [-2, 1, 2, -3],
];

export function GaussianEliminationPanel() {
  const [augInput] = useState<number[][]>(DEFAULT_AUG);
  const steps = useMemo(() => buildSteps(augInput), [augInput]);

  const initial: GaussState = {
    matrix: augInput.map((r) => [...r]),
    col: -1,
    pivotRow: -1,
    activeRow: -1,
    factor: null,
    backRow: -1,
    solution: new Array(augInput.length).fill(null),
    phase: 'elim',
    message: '',
  };

  return (
    <Stepper<GaussState>
      steps={steps}
      initialState={initial}
      codeLines={gaussCode}
      codeTitle="高斯消元 Gaussian Elimination"
      render={(state) => {
        const n = state.matrix.length;
        return (
          <div className="space-y-5">
            <div className="text-xs text-gray-500">
              黄色=主元行，红色=正在消元的行，蓝色=当前列，绿色=已求解变量
            </div>

            {/* Augmented matrix */}
            <div className="flex justify-center">
              <div className="inline-block border border-edge-2 rounded-lg overflow-hidden">
                {state.matrix.map((row, i) => {
                  const isPivot = i === state.pivotRow && state.phase !== 'back' && state.phase !== 'done';
                  const isActive = i === state.activeRow;
                  const isBack = i === state.backRow;
                  return (
                    <div key={i} className="flex">
                      {row.map((v, j) => {
                        const isLastCol = j === n;
                        const inCol = j === state.col && state.phase !== 'back' && state.phase !== 'done';
                        const isPivotCell = isPivot && j === state.col;
                        return (
                          <div
                            key={j}
                            className={clsx(
                              'w-16 h-11 flex items-center justify-center text-xs font-mono transition-all',
                              isLastCol ? 'border-l-2 border-l-gray-600' : 'border-r border-r-[#222]',
                              isPivot && 'bg-yellow-500/15',
                              isActive && 'bg-red-500/15',
                              isBack && 'bg-purple-500/15',
                              isPivotCell && 'bg-yellow-500/30',
                            )}
                          >
                            <span
                              className={clsx(
                                inCol ? 'text-blue-300 font-bold' : 'text-gray-300',
                                isPivotCell && 'text-yellow-200',
                                isActive && j === state.col && 'text-red-300',
                              )}
                            >
                              {fmt(v)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column headers */}
            <div className="flex justify-center -mt-3">
              <div className="flex">
                {Array.from({ length: n + 1 }).map((_, j) => (
                  <div key={j} className="w-16 text-center text-[9px] text-gray-600">
                    {j < n ? `x${j}` : 'b'}
                  </div>
                ))}
              </div>
            </div>

            {/* Factor info */}
            {state.factor !== null && (
              <div className="text-center text-sm font-mono text-red-300">
                factor = {fmt(state.factor)}
              </div>
            )}

            {/* Solution */}
            {(state.phase === 'back' || state.phase === 'done') && (
              <div className="flex justify-center gap-3 flex-wrap">
                {state.solution.map((v, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'px-3 py-2 rounded border text-sm font-mono',
                      v !== null
                        ? 'bg-green-500/15 border-green-700 text-green-300'
                        : 'bg-surface-2 border-edge-2 text-ink-3',
                    )}
                  >
                    x{i} = {v !== null ? fmt(v) : '?'}
                  </div>
                ))}
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
