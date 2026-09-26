'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const matrixRotationCode = [
  '// 1. 沿主对角线转置',
  'for i in 0..n: for j in i+1..n: swap(m[i][j], m[j][i]);',
  '// 2. 每行左右翻转',
  'for i in 0..n: for j in 0..n/2: swap(m[i][j], m[i][n-1-j]);',
  'return m;',
];

interface MatrixRotationState {
  m: number[][];
  phase: 'init' | 'transpose' | 'flip';
  i: number;
  j: number;
  message: string;
}

function buildSteps(initial: number[][]): VizStep<MatrixRotationState>[] {
  const steps: VizStep<MatrixRotationState>[] = [];
  const n = initial.length;
  const m = initial.map((r) => [...r]);

  const snapshot = (phase: MatrixRotationState['phase'], i: number, j: number, message: string, codeLine: number): VizStep<MatrixRotationState> => ({
    state: { m: m.map((r) => [...r]), phase, i, j, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot('init', -1, -1, `顺时针旋转 ${n}×${n} 矩阵：先转置再逐行翻转`, 1));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
      steps.push(snapshot('transpose', i, j, `转置：交换 (${i},${j}) 与 (${j},${i})`, 2));
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < Math.floor(n / 2); j++) {
      [m[i][j], m[i][n - 1 - j]] = [m[i][n - 1 - j], m[i][j]];
      steps.push(snapshot('flip', i, j, `翻转第 ${i} 行：交换 (${i},${j}) 与 (${i},${n - 1 - j})`, 4));
    }
  }

  steps.push(snapshot('init', -1, -1, `旋转完成`, 5));
  return steps;
}

function render(state: MatrixRotationState) {
  const { m, phase, i, j, message } = state;
  return (
    <div className="space-y-3">
      <table className="border-collapse text-sm">
        <tbody>
          {m.map((row, ri) => (
            <tr key={ri}>
              {row.map((v, ci) => (
                <td
                  key={ci}
                  className={`border border-edge w-12 h-12 text-center font-mono ${
                    phase === 'transpose' && (ri === i && ci === j) ? 'bg-emerald-500/40' : ''
                  } ${phase === 'flip' && ri === i && (ci === j) ? 'bg-amber-300 text-black' : ''} bg-surface-2`}
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

export function MatrixRotationPanel() {
  const [size, setSize] = useState(3);
  const matrix = useMemo(
    () => Array(size).fill(null).map((_, r) => Array(size).fill(0).map((__, c) => r * size + c + 1)),
    [size],
  );
  const steps = useMemo(() => buildSteps(matrix), [matrix]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">矩阵大小 n:</span>
        <input
          type="number"
          value={size}
          min={2}
          max={6}
          onChange={(e) => setSize(Math.max(2, Math.min(6, Number(e.target.value) || 2)))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
        />
        <span className="text-xs text-gray-500">（2–6）</span>
      </div>
      <Stepper steps={steps} codeLines={matrixRotationCode} render={render} />
    </div>
  );
}
