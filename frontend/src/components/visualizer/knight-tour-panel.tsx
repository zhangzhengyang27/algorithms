'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const knightTourCode = [
  'function tour(board, moves) {',
  '  if (moves.length === n*n) return true;',
  '  for (const move of getMoves(moves.last)) {',
  '    if (board[move] === 0) {',
  '      moves.push(move); board[move] = 1;',
  '      if (tour(board, moves)) return true;',
  '      moves.pop(); board[move] = 0; // 回溯',
  '    }',
  '  }',
  '  return false;',
  '}',
];

interface KnightTourState {
  n: number;
  board: number[][];
  order: number[][];
  cur: [number, number] | null;
  candidates: [number, number][];
  backtrack: boolean;
  message: string;
}

function inBounds(n: number, r: number, c: number) {
  return r >= 0 && c >= 0 && r < n && c < n;
}

const MAX_STEPS = 50_000;

function buildSteps(n: number): VizStep<KnightTourState>[] {
  const steps: VizStep<KnightTourState>[] = [];
  const board = Array(n).fill(null).map(() => Array(n).fill(0));
  const order = Array(n).fill(null).map(() => Array(n).fill(-1));
  const moves: [number, number][] = [];
  let aborted = false;

  const pushStep = (step: VizStep<KnightTourState>) => {
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

  const snapshot = (cur: [number, number] | null, candidates: [number, number][], backtrack: boolean, message: string, codeLine: number): VizStep<KnightTourState> => ({
    state: { n, board: board.map((r) => [...r]), order: order.map((r) => [...r]), cur, candidates, backtrack, message },
    description: message,
    codeLine,
  });

  const deltas = [
    [-1, -2], [-2, -1], [-1, 2], [-2, 1],
    [1, -2], [2, -1], [1, 2], [2, 1],
  ];

  steps.push(snapshot(null, [], false, `骑士巡游：从 (0,0) 出发，走遍 ${n}×${n} 每个格子各一次`, 1));
  // 注意：snapshot 内部不做 push，由 pushStep 统一包装

  function getMoves(last: [number, number]): [number, number][] {
    return deltas
      .map(([dr, dc]) => [last[0] + dr, last[1] + dc] as [number, number])
      .filter(([r, c]) => inBounds(n, r, c));
  }

  function tour(): boolean {
    if (aborted) return false;
    if (moves.length === n * n) return true;
    const last = moves[moves.length - 1];
    const cands = getMoves(last);
    pushStep(snapshot(last, cands, false, `当前 (${last[0]},${last[1]}) 的候选落点：${cands.map((m) => `(${m[0]},${m[1]})`).join(' ')}`, 3));
    for (const move of cands) {
      if (aborted) return false;
      if (board[move[0]][move[1]] === 0) {
        moves.push(move);
        board[move[0]][move[1]] = 1;
        order[move[0]][move[1]] = moves.length - 1;
        pushStep(snapshot(move, [], false, `落子 (${move[0]},${move[1]})，第 ${moves.length} 步`, 5));
        if (tour()) return true;
        if (aborted) return false;
        moves.pop();
        board[move[0]][move[1]] = 0;
        order[move[0]][move[1]] = -1;
        pushStep(snapshot(move, [], true, `回溯：撤销 (${move[0]},${move[1]})`, 7));
      }
    }
    return false;
  }

  moves.push([0, 0]);
  board[0][0] = 1;
  order[0][0] = 0;
  tour();

  if (!aborted) pushStep(snapshot(null, [], false, moves.length === n * n ? `完成巡游，共 ${n * n} 步` : `未找到解`, 10));
  return steps;
}

function render(state: KnightTourState) {
  const { n, order, cur, candidates, message } = state;
  return (
    <div className="space-y-3">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, maxWidth: 360 }}>
        {Array.from({ length: n }).map((_, r) =>
          Array.from({ length: n }).map((_, c) => {
            const isCur = cur && cur[0] === r && cur[1] === c;
            const isCand = candidates.some(([cr, cc]) => cr === r && cc === c);
            const step = order[r][c];
            return (
              <div
                key={`${r}-${c}`}
                className={`aspect-square flex items-center justify-center border border-edge text-sm ${
                  isCur ? 'bg-emerald-500/50' : isCand ? 'bg-amber-300/60' : step >= 0 ? 'bg-surface-2' : 'bg-surface'
                }`}
              >
                {step >= 0 ? step : ''}
              </div>
            );
          }),
        )}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
    </div>
  );
}

export function KnightTourPanel() {
  const [n, setN] = useState(5);
  const steps = useMemo(() => buildSteps(n), [n]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">棋盘 n:</span>
        <input
          type="number"
          value={n}
          min={3}
          max={5}
          onChange={(e) => setN(Math.max(3, Math.min(5, Number(e.target.value) || 3)))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
        />
        <span className="text-xs text-gray-500">（3–5，越大越慢）</span>
      </div>
      <Stepper steps={steps} codeLines={knightTourCode} render={render} />
    </div>
  );
}
