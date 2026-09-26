'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const nQueensCode = [
  'function solve(row) {',
  '  if (row === n) { solutions.push([...cols]); return; }',
  '  for (let col = 0; col < n; col++) {',
  '    if (isSafe(row, col)) {',
  '      cols[row] = col;          // 放置皇后',
  '      solve(row + 1);          // 递归下一行',
  '      cols[row] = -1;          // 回溯撤销',
  '    }',
  '  }',
  '}',
  'function isSafe(r, c) {',
  '  for (let i = 0; i < r; i++) {',
  '    if (cols[i] === c) return false;',
  '    if (Math.abs(cols[i] - c) === r - i) return false;',
  '  }',
  '  return true;',
  '}',
];

interface NQueensState {
  n: number;
  cols: number[];
  row: number;
  col: number;
  safe: boolean | null;
  solutions: number[][];
  solutionCount: number;
  message: string;
}

const MAX_STEPS = 50_000;

function buildSteps(n: number): VizStep<NQueensState>[] {
  const steps: VizStep<NQueensState>[] = [];
  const cols = new Array(n).fill(-1);
  const solutions: number[][] = [];
  let aborted = false;

  const pushStep = (step: VizStep<NQueensState>) => {
    if (aborted) return;
    if (steps.length >= MAX_STEPS) {
      aborted = true;
      steps.push({
        ...step,
        state: { ...step.state, message: `⚠️ 步骤超过 ${MAX_STEPS.toLocaleString()}，已提前终止。请减小 n 以避免卡顿。` },
      });
      return;
    }
    steps.push(step);
  };

  const snapshot = (row: number, col: number, safe: boolean | null, message: string, codeLine: number): VizStep<NQueensState> => ({
    state: {
      n,
      cols: [...cols],
      row,
      col,
      safe,
      solutions: solutions.map((s) => [...s]),
      solutionCount: solutions.length,
      message,
    },
    description: message,
    codeLine,
  });

  pushStep(snapshot(-1, -1, null, `在 ${n}×${n} 棋盘上放置 ${n} 个互不攻击的皇后`, 1));

  function isSafe(r: number, c: number): boolean {
    for (let i = 0; i < r; i++) {
      if (cols[i] === c) return false;
      if (Math.abs(cols[i] - c) === r - i) return false;
    }
    return true;
  }

  function solve(row: number) {
    if (aborted) return;
    if (row === n) {
      solutions.push([...cols]);
      pushStep(snapshot(row, -1, null, `找到一组解：${cols.join(', ')}（共 ${solutions.length} 组）`, 2));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (aborted) return;
      const ok = isSafe(row, col);
      pushStep(snapshot(row, col, ok, ok ? `尝试 (${row}, ${col})：安全，放置皇后` : `尝试 (${row}, ${col})：被攻击，跳过`, ok ? 4 : 4));
      if (ok) {
        cols[row] = col;
        pushStep(snapshot(row, col, true, `放置皇后于 (${row}, ${col})，递归下一行`, 5));
        solve(row + 1);
        if (aborted) return;
        cols[row] = -1;
        pushStep(snapshot(row, col, null, `回溯：撤销 (${row}, ${col}) 的皇后`, 7));
      }
    }
  }

  solve(0);
  if (!aborted) pushStep(snapshot(-1, -1, null, `搜索完成，共 ${solutions.length} 组解`, 1));
  return steps;
}

function render(state: NQueensState) {
  const { n, cols, row, col, safe, solutions, message } = state;
  return (
    <div className="space-y-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, maxWidth: 420 }}>
        {Array.from({ length: n }).map((_, r) =>
          Array.from({ length: n }).map((_, c) => {
            const isQueen = cols[r] === c;
            const isCurrent = r === row && c === col;
            const dark = (r + c) % 2 === 1;
            return (
              <div
                key={`${r}-${c}`}
                className={`aspect-square flex items-center justify-center border border-edge text-lg ${
                  dark ? 'bg-surface-2' : 'bg-surface'
                } ${isCurrent ? (safe ? 'ring-2 ring-emerald-400' : 'ring-2 ring-rose-400') : ''}`}
              >
                {isQueen ? '♛' : ''}
              </div>
            );
          }),
        )}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
      <p className="text-xs text-gray-500">
        已找到 {solutions.length} 组解{state.solutionCount > 0 ? `（当前展示第 ${state.solutionCount} 组）` : ''}
      </p>
    </div>
  );
}

export function NQueensPanel() {
  const [n, setN] = useState(6);
  const steps = useMemo(() => buildSteps(n), [n]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">棋盘大小 n:</span>
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
      <Stepper steps={steps} codeLines={nQueensCode} render={render} />
    </div>
  );
}
