'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

// BFS 求解八数码：目标布局固定为 1 2 3 / 4 5 6 / 7 8 0（0 为空格）。
// 面板演示「状态空间 BFS → 最短还原路径逐帧播放」。
const eightPuzzleCode = [
  'const goal = [1,2,3,4,5,6,7,8,0];       // 目标布局',
  'const queue = [start];                  // BFS 队列',
  'const seen = new Set([key(start)]);     // 已访问状态',
  'while (queue.length) {                  // BFS 主循环',
  '  const s = queue.shift();              // 出队：当前布局',
  '  if (key(s) === key(goal))',           // 命中目标 → 回溯路径',
  '    return reconstructPath(s);',
  '  for (const dir of [[-1,0],[1,0],[0,-1],[0,1]]) {',
  '    const ns = move(s, dir);            // 空格沿 dir 滑动一步',
  '    if (!seen.has(key(ns))) {',
  '      seen.add(key(ns)); queue.push(ns);',
  '    }',
  '  }',
  '}',
];

interface PuzzleState {
  board: number[];   // 9 个数字，0 = 空格
  moved: number;     // 当前步刚滑入空格的方块值（-1 表示无）
  moveIndex: number; // 已走步数
  total: number;     // 最短路径总步数（-1 = 不可达）
  message: string;
}

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function keyOf(b: number[]): string {
  return b.join(',');
}

/** BFS 求最短路径，返回「中间布局序列 + 每步滑动的方块值」；不可达返回 null。 */
function solvePath(start: number[]): { path: number[][]; moves: number[] } | null {
  const goalK = keyOf(GOAL);
  const startK = keyOf(start);
  if (startK === goalK) return { path: [], moves: [] };
  const seen = new Set<string>([startK]);
  const parent = new Map<string, { prev: string; board: number[]; moved: number }>();
  const q: number[][] = [start];
  while (q.length) {
    const b = q.shift()!;
    const k = keyOf(b);
    if (k === goalK) {
      const path: number[][] = [];
      const moves: number[] = [];
      let cur = k;
      while (cur !== startK) {
        const p = parent.get(cur)!;
        path.unshift(p.board);
        moves.unshift(p.moved);
        cur = p.prev;
      }
      return { path, moves };
    }
    const z = b.indexOf(0);
    const r = Math.floor(z / 3);
    const c = z % 3;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue;
      const nz = nr * 3 + nc;
      const ns = b.slice();
      ns[z] = ns[nz];   // 方块滑入空格
      ns[nz] = 0;
      const nk = keyOf(ns);
      if (!seen.has(nk)) {
        seen.add(nk);
        parent.set(nk, { prev: k, board: ns, moved: ns[z] });
        q.push(ns);
      }
    }
  }
  return null; // 不可达
}

function buildSteps(start: number[]): VizStep<PuzzleState>[] {
  const res = solvePath(start);
  if (!res) {
    return [{
      state: { board: start.slice(), moved: -1, moveIndex: 0, total: -1, message: '该布局不可达目标（逆序对奇偶性不匹配）' },
      description: '不可达',
      codeLine: 1,
    }];
  }
  const { path, moves } = res;
  const steps: VizStep<PuzzleState>[] = [];
  steps.push({
    state: { board: start.slice(), moved: -1, moveIndex: 0, total: moves.length, message: `初始布局 · BFS 求得最短路径共 ${moves.length} 步` },
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-surface-2 border border-edge rounded-2xl p-3 sm:p-4">
        {board.map((v, i) =>
          v === 0 ? (
            <div
              key={i}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-edge-2 bg-surface flex items-center justify-center"
            />
          ) : (
            <div
              key={i}
              className={clsx(
                'w-14 h-14 sm:w-20 sm:h-20 rounded-xl border-2 flex items-center justify-center text-xl sm:text-2xl font-mono font-semibold transition-all duration-200',
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
        琥珀格 = 当前步滑入空格的方块；深色边框格 = 已归位；虚线格 = 空格
      </div>
    </div>
  );
}

export function EightPuzzlePanel() {
  // 默认用例与判题样例一致（cr-8puzzle tc0：4 1 2 / 0 8 3 / 5 7 6，9 步还原）
  const [seed, setSeed] = useState<number[]>([4, 1, 2, 0, 8, 3, 5, 7, 6]);
  const [input, setInput] = useState('4 1 2 0 8 3 5 7 6');
  const steps = useMemo(() => buildSteps(seed), [seed]);

  const onInputChange = (s: string) => {
    setInput(s);
    const p = s.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n));
    if (p.length === 9 && new Set(p).size === 9 && p.every((n) => n >= 0 && n <= 8)) {
      setSeed(p);
    }
  };

  const randomize = () => {
    const b = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const K = 25 + Math.floor(Math.random() * 26); // 25~50 步随机游走 → 保证可解
    for (let k = 0; k < K; k++) {
      const z = b.indexOf(0);
      const r = Math.floor(z / 3);
      const c = z % 3;
      const cand: number[] = [];
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) cand.push(nr * 3 + nc);
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
      codeLines={eightPuzzleCode}
      codeTitle="BFS 求解最短路径"
      headerActions={
        <>
          <span className="text-sm text-ink-3">布局:</span>
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-44 font-mono"
            placeholder="0-8 共 9 个数，空格分隔"
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
