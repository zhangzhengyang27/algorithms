'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

// 十五数码：目标布局固定 1..15,0。状态空间 16!（BFS 不可行），用 IDA* + 曼哈顿距离。
const fifteenPuzzleCode = [
  'const goal = [1,2,...,15,0];            // 目标布局',
  'const dist = manhattanTable();          // 曼哈顿距离表',
  'let bound = h(start);                   // 初始阈值 = 曼哈顿距离',
  'function ida(state, g, bound, prev) {   // 迭代加深 A*',
  '  const f = g + h(state);               // 已走步数 + 启发',
  '  if (f > bound) return f;              // 超出阈值 → 剪枝',
  '  if (state === goal) return FOUND;     // 找到最优解',
  '  for (const dir of 上下左右) {',
  '    if (dir 是 prev 的反方向) continue; // 不回退',
  '    const ns = move(state, dir);        // 空格沿 dir 滑动',
  '    const res = ida(ns, g + 1, bound, dir);',
  '    if (res === FOUND) return FOUND;',
  '  }',
  '  return 最小的新阈值;                  // 提高阈值继续',
  '}',
];

interface PuzzleState {
  board: number[];   // 16 个数字，0 = 空格
  moved: number;     // 当前步刚滑入空格的方块值（-1 表示无）
  moveIndex: number;
  total: number;     // 最短路径总步数（-1 = 不可达）
  message: string;
}

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

function keyOf(b: number[]): string {
  return b.join(',');
}

/** IDA* 求最短路径（曼哈顿距离）；不可达返回 null；超时返回 'timeout'。 */
const MAX_IDA_NODES = 2_000_000;

function solvePath15(start: number[]): { path: number[][]; moves: number[] } | null | 'timeout' {
  const eq = (a: number[], b: number[]) => a.every((v, i) => v === b[i]);
  if (eq(start, GOAL)) return { path: [], moves: [] };
  // 可解性：逆序对奇偶 与 空格行距差 一致
  const flat = start.filter((x) => x !== 0);
  let inv = 0;
  for (let i = 0; i < flat.length; i++)
    for (let j = i + 1; j < flat.length; j++)
      if (flat[i] > flat[j]) inv++;
  const blankRow = Math.floor(start.indexOf(0) / 4);
  if ((inv + (3 - blankRow)) % 2 !== 0) return null;
  // 曼哈顿距离表 dist[value][pos]
  const dist: number[][] = [];
  for (let v = 0; v < 16; v++) {
    const g = v === 0 ? 15 : v - 1;
    const row: number[] = [];
    for (let pos = 0; pos < 16; pos++)
      row.push(Math.abs(Math.floor(g / 4) - Math.floor(pos / 4)) + Math.abs((g % 4) - (pos % 4)));
    dist.push(row);
  }
  const h = (s: number[]) => s.reduce((acc, v, i) => acc + dist[v][i], 0);
  const DR = [-1, 1, 0, 0];
  const DC = [0, 0, -1, 1];
  let bound = h(start);
  let found = false;
  let timedOut = false;
  let nodeCount = 0;
  const path: number[][] = [];
  const moves: number[] = [];
  const ida = (state: number[], g: number, b: number, prev: number): number => {
    nodeCount++;
    if (nodeCount > MAX_IDA_NODES) { timedOut = true; return Infinity; }
    const f = g + h(state);
    if (f > b) return f;
    if (eq(state, GOAL)) { found = true; return 0; }
    const z = state.indexOf(0);
    const r = Math.floor(z / 4);
    const c = z % 4;
    let minf = Infinity;
    for (let d = 0; d < 4; d++) {
      if (d === (prev ^ 1)) continue;
      const nr = r + DR[d];
      const nc = c + DC[d];
      if (nr < 0 || nr > 3 || nc < 0 || nc > 3) continue;
      const nz = nr * 4 + nc;
      const ns = state.slice();
      ns[z] = ns[nz];   // 方块滑入空格
      ns[nz] = 0;
      moves.push(ns[z]);
      path.push(ns);
      const res = ida(ns, g + 1, b, d);
      if (found || timedOut) return 0;
      moves.pop();
      path.pop();
      if (res < minf) minf = res;
    }
    return minf;
  };
  while (!found && !timedOut) {
    const res = ida(start, 0, bound, -1);
    if (found) break;
    if (timedOut) return 'timeout';
    bound = res;
  }
  if (timedOut) return 'timeout';
  return { path, moves };
}

function buildSteps(start: number[]): VizStep<PuzzleState>[] {
  const res = solvePath15(start);
  if (res === null) {
    return [{
      state: { board: start.slice(), moved: -1, moveIndex: 0, total: -1, message: '该布局不可达目标（逆序对奇偶性不匹配）' },
      description: '不可达',
      codeLine: 1,
    }];
  }
  if (res === 'timeout') {
    return [{
      state: { board: start.slice(), moved: -1, moveIndex: 0, total: -1, message: `⚠️ IDA* 探索节点数超过 ${MAX_IDA_NODES.toLocaleString()}，已提前终止。请使用“随机”生成更易的布局，或手动输入简单用例。` },
      description: '求解超时',
      codeLine: 1,
    }];
  }
  const { path, moves } = res;
  const steps: VizStep<PuzzleState>[] = [];
  steps.push({
    state: { board: start.slice(), moved: -1, moveIndex: 0, total: moves.length, message: `初始布局 · IDA* 求得最短路径共 ${moves.length} 步` },
    description: '初始布局',
    codeLine: 1,
  });
  path.forEach((board, i) => {
    const solved = keyOf(board) === keyOf(GOAL);
    steps.push({
      state: {
        board,
        moved: moves[i],
        moveIndex: i + 1,
        total: moves.length,
        message: solved ? `已还原目标布局！共 ${moves.length} 步` : `第 ${i + 1} 步：把 ${moves[i]} 滑入空格`,
      },
      description: `第 ${i + 1} 步：滑动 ${moves[i]}`,
      codeLine: 4 + (i % 5),
    });
  });
  return steps;
}

function PuzzleView({ board, moved, message }: { board: number[]; moved: number; message: string }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 bg-surface-2 border border-edge rounded-2xl p-2.5 sm:p-4">
        {board.map((v, i) =>
          v === 0 ? (
            <div
              key={i}
              className="w-11 h-11 sm:w-16 sm:h-16 rounded-lg border-2 border-dashed border-edge-2 bg-surface flex items-center justify-center"
            />
          ) : (
            <div
              key={i}
              className={clsx(
                'w-11 h-11 sm:w-16 sm:h-16 rounded-lg border-2 flex items-center justify-center text-sm sm:text-lg font-mono font-semibold transition-all duration-200',
                v === moved
                  ? 'bg-warn text-black border-warn ring-2 ring-warn/40 scale-105'
                  : v === GOAL[i]
                    ? 'bg-surface border-edge text-ink-2'
                    : 'bg-surface border-edge-2 text-ink'
              )}
            >
              {v}
            </div>
          )
        )}
      </div>
      <div className="text-center text-sm text-ink-3 min-h-[20px]">{message}</div>
      <div className="text-xs text-ink-3">
        琥珀格 = 当前步滑入空格的方块；深色边框格 = 已归位；虚线格 = 空格。状态空间 16!，BFS 不可行 → IDA* + 曼哈顿距离
      </div>
    </div>
  );
}

export function FifteenPuzzlePanel() {
  // 默认用例与判题样例一致（cr-15puzzle tc0，8 步还原）
  const [seed, setSeed] = useState<number[]>([1, 2, 3, 4, 5, 6, 8, 11, 9, 10, 7, 0, 13, 14, 15, 12]);
  const [input, setInput] = useState('1 2 3 4 5 6 8 11 9 10 7 0 13 14 15 12');
  const steps = useMemo(() => buildSteps(seed), [seed]);

  const onInputChange = (s: string) => {
    setInput(s);
    const p = s.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n));
    if (p.length === 16 && new Set(p).size === 16 && p.every((n) => n >= 0 && n <= 15)) {
      setSeed(p);
    }
  };

  const randomize = () => {
    const b = Array.from({ length: 16 }, (_, i) => (i + 1) % 16); // 1..15,0
    const K = 20 + Math.floor(Math.random() * 11); // 20~30 步随机游走 → 保证可解且 IDA* 轻量
    for (let k = 0; k < K; k++) {
      const z = b.indexOf(0);
      const r = Math.floor(z / 4);
      const c = z % 4;
      const cand: number[] = [];
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) cand.push(nr * 4 + nc);
      }
      const nz = cand[Math.floor(Math.random() * cand.length)];
      b[z] = b[nz];
      b[nz] = 0;
    }
    setSeed(b.slice());
    setInput(b.join(' '));
  };

  const initial: PuzzleState = { board: seed, moved: -1, moveIndex: 0, total: 0, message: '' };

  return (
    <Stepper<PuzzleState>
      steps={steps}
      initialState={initial}
      codeLines={fifteenPuzzleCode}
      codeTitle="IDA* 求解最短路径"
      headerActions={
        <>
          <span className="text-sm text-ink-3">布局:</span>
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-64 font-mono"
            placeholder="0-15 共 16 个数，空格分隔"
          />
          <button
            type="button"
            onClick={randomize}
            className="px-2 py-1 rounded bg-surface-2 border border-edge text-sm text-ink-3 hover:text-ink hover:border-brand"
          >
            随机
          </button>
        </>
      }
      render={(state) => <PuzzleView board={state.board} moved={state.moved} message={state.message} />}
    />
  );
}
