'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const gameTheoryCode = [
  'function nimSG(piles) {',
  '  // Nim: 一堆 x 个石子的 SG 值为 SG(x) = x',
  '  return piles.map((p) => p);',
  '}',
  'function nimSum(piles) {',
  '  return piles.reduce((x, p) => x ^ p, 0);',
  '}',
  'function isWinning(piles) {',
  '  return nimSum(piles) !== 0; // 异或和非零 → 必胜态',
  '}',
  'function findWinningMove(piles) {',
  '  const xs = nimSum(piles);',
  '  if (xs === 0) return null; // 必败态，无必胜策略',
  '  for (let i = 0; i < piles.length; i++) {',
  '    const target = piles[i] ^ xs;',
  '    if (target < piles[i])',
  '      return { pile: i, take: piles[i] - target };',
  '  }',
  '  return null;',
  '}',
];

interface NimState {
  piles: number[];
  activePile: number;
  phase: 'sg' | 'xor' | 'judge' | 'move' | 'done';
  sgRevealed: number;
  xorRevealed: number;
  xorSoFar: number;
  nimSum: number | null;
  isWinning: boolean | null;
  move: { pile: number; take: number } | null;
  afterPiles: number[] | null;
  message: string;
}

function buildSteps(piles: number[]): VizStep<NimState>[] {
  const steps: VizStep<NimState>[] = [];
  const bits = Math.max(3, Math.ceil(Math.log2(Math.max(...piles) + 1)));
  let xorSoFar = 0;
  let sgRevealed = 0;
  let xorRevealed = 0;
  let nimSum: number | null = null;
  let isWinning: boolean | null = null;
  let move: { pile: number; take: number } | null = null;
  let afterPiles: number[] | null = null;

  const snap = (activePile: number, phase: NimState['phase'], msg: string): NimState => ({
    piles: [...piles],
    activePile,
    phase,
    sgRevealed,
    xorRevealed,
    xorSoFar,
    nimSum,
    isWinning,
    move,
    afterPiles: afterPiles ? [...afterPiles] : null,
    message: msg,
  });

  steps.push({
    state: snap(-1, 'sg', `Nim 游戏：石子堆 [${piles.join(', ')}]，两人轮流从一堆中取任意多颗。Nim 中 SG(x) = x`),
    description: 'Nim 游戏',
    codeLine: 0,
  });

  for (let i = 0; i < piles.length; i++) {
    sgRevealed = i + 1;
    steps.push({
      state: snap(i, 'sg', `堆 ${i} 有 ${piles[i]} 颗石子，SG(${piles[i]}) = ${piles[i]}，二进制 ${piles[i].toString(2).padStart(bits, '0')}`),
      description: `SG(${piles[i]})=${piles[i]}`,
      codeLine: 2,
    });
  }

  for (let i = 0; i < piles.length; i++) {
    const prev = xorSoFar;
    xorSoFar ^= piles[i];
    xorRevealed = i + 1;
    steps.push({
      state: snap(i, 'xor', `异或累加：${prev} ^ ${piles[i]} = ${xorSoFar}（${prev.toString(2).padStart(bits, '0')} ⊕ ${piles[i].toString(2).padStart(bits, '0')} = ${xorSoFar.toString(2).padStart(bits, '0')}）`),
      description: `异或和=${xorSoFar}`,
      codeLine: 5,
    });
  }

  nimSum = xorSoFar;
  isWinning = nimSum !== 0;
  steps.push({
    state: snap(-1, 'judge', isWinning
      ? `Nim-sum = ${nimSum} ≠ 0 → 必胜态！先手存在必胜策略`
      : `Nim-sum = 0 → 必败态，先手无论怎么取都会留给对手必胜态`),
    description: isWinning ? '必胜态' : '必败态',
    codeLine: 8,
  });

  if (isWinning) {
    for (let i = 0; i < piles.length; i++) {
      const target = piles[i] ^ nimSum;
      if (target < piles[i]) {
        move = { pile: i, take: piles[i] - target };
        steps.push({
          state: snap(i, 'move', `堆 ${i}：target = ${piles[i]} ⊕ ${nimSum} = ${target} < ${piles[i]} ✓，从堆 ${i} 取走 ${piles[i] - target} 颗，剩 ${target} 颗`),
          description: `堆${i}取${piles[i] - target}颗`,
          codeLine: 16,
        });
        break;
      } else {
        steps.push({
          state: snap(i, 'move', `堆 ${i}：target = ${piles[i]} ⊕ ${nimSum} = ${target} ≥ ${piles[i]}，无法操作，检查下一堆`),
          description: `堆${i}不可行`,
          codeLine: 14,
        });
      }
    }
    afterPiles = [...piles];
    afterPiles[move!.pile] -= move!.take;
    steps.push({
      state: snap(move!.pile, 'done', `✅ 取完后石子堆 [${afterPiles.join(', ')}]，Nim-sum = ${afterPiles.reduce((x, p) => x ^ p, 0)}，对手陷入必败态`),
      description: '对手必败',
      codeLine: 16,
    });
  } else {
    steps.push({
      state: snap(-1, 'done', '必败态：对任意堆都有 piles[i] ⊕ xs ≥ piles[i]，不存在必胜操作'),
      description: '无必胜策略',
      codeLine: 12,
    });
  }

  return steps;
}

function PilesView({ piles, activePile, move, dim }: { piles: number[]; activePile: number; move: { pile: number; take: number } | null; dim?: boolean }) {
  return (
    <div className="flex gap-6 justify-center items-end">
      {piles.map((count, i) => {
        const isActive = i === activePile;
        const isMovePile = move !== null && move.pile === i;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={clsx('flex flex-col-reverse gap-0.5 p-1.5 rounded-lg border transition-all', isActive ? 'border-yellow-400 bg-yellow-500/10' : 'border-transparent', dim && 'opacity-70')}>
              {Array.from({ length: count }, (_, si) => {
                const willTake = isMovePile && move !== null && si >= count - move.take;
                return (
                  <div
                    key={si}
                    className={clsx(
                      'w-4 h-4 rounded-full border transition-all',
                      willTake
                        ? 'bg-red-500/60 border-red-400'
                        : isActive
                          ? 'bg-yellow-500/50 border-yellow-400'
                          : 'bg-blue-500/40 border-blue-400/60',
                    )}
                  />
                );
              })}
            </div>
            <div className={clsx('text-xs font-mono', isActive ? 'text-yellow-200' : 'text-gray-500')}>
              堆{i}: {count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GameTheoryPanel() {
  const [pilesText, setPilesText] = useState('3,4,5');

  const piles = useMemo(() => {
    const parsed = pilesText.split(',').map((s) => Number(s.trim())).filter((v) => Number.isFinite(v) && v >= 1 && v <= 9);
    return parsed.length >= 2 ? parsed.slice(0, 5) : [3, 4, 5];
  }, [pilesText]);

  const steps = useMemo(() => buildSteps(piles), [piles]);
  const initial: NimState = {
    piles,
    activePile: -1,
    phase: 'sg',
    sgRevealed: 0,
    xorRevealed: 0,
    xorSoFar: 0,
    nimSum: null,
    isWinning: null,
    move: null,
    afterPiles: null,
    message: '',
  };

  const bits = Math.max(3, Math.ceil(Math.log2(Math.max(...piles) + 1)));

  return (
    <Stepper<NimState>
      steps={steps}
      initialState={initial}
      codeLines={gameTheoryCode}
      codeTitle="博弈论 Game Theory (Nim)"
      headerActions={
        <>
          <span className="text-sm text-gray-400">石子堆:</span>
          <input
            type="text"
            value={pilesText}
            onChange={(e) => setPilesText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-32"
            placeholder="如 3,4,5 (1~9)"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">
            黄色=当前分析的堆，红色=将要取走的石子。SG(x)=x，异或和 ≠ 0 为必胜态
          </div>

          <PilesView piles={state.piles} activePile={state.activePile} move={state.phase === 'move' || state.phase === 'done' ? state.move : null} />

          {/* Binary XOR table */}
          <div className="space-y-1 max-w-xs mx-auto font-mono text-xs">
            {state.piles.map((p, i) => (
              <div
                key={i}
                className={clsx(
                  'flex items-center justify-between px-2 py-0.5 rounded transition-all',
                  i === state.activePile ? 'bg-yellow-500/10 text-yellow-200' : i < state.xorRevealed ? 'text-gray-400' : 'text-gray-600',
                )}
              >
                <span>SG(堆{i})</span>
                <span>{i < state.sgRevealed ? p.toString(2).padStart(bits, '0') : '?'.repeat(bits)}</span>
              </div>
            ))}
            <div className="border-t border-edge-2 my-1" />
            <div className={clsx('flex items-center justify-between px-2 py-0.5 rounded', state.nimSum !== null ? (state.isWinning ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300') : 'text-blue-300')}>
              <span>Nim-sum</span>
              <span>{state.xorRevealed > 0 ? state.xorSoFar.toString(2).padStart(bits, '0') : '?'.repeat(bits)}</span>
            </div>
          </div>

          {/* Verdict */}
          {state.isWinning !== null && (
            <div className={clsx('text-center p-2 rounded-lg border', state.isWinning ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800')}>
              <span className={clsx('font-mono text-sm', state.isWinning ? 'text-green-300' : 'text-red-300')}>
                Nim-sum = {state.nimSum} {state.isWinning ? '≠ 0 → 先手必胜' : '= 0 → 先手必败'}
              </span>
            </div>
          )}

          {/* After state */}
          {state.afterPiles && state.move && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 text-center">必胜操作后（堆{state.move.pile} 取走 {state.move.take} 颗）:</div>
              <PilesView piles={state.afterPiles} activePile={state.move.pile} move={null} dim />
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
