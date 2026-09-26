'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const fisherYatesCode = [
  'function shuffle(arr) {',
  '  for (i = arr.length-1; i > 0; i--) {',
  '    j = random(0, i);',
  '    swap(arr[i], arr[j]);',
  '  }',
  '  return arr;',
  '}',
];

interface FisherYatesState {
  arr: number[];
  i: number;
  j: number;
  message: string;
}

function buildSteps(arr: number[], seed: number): VizStep<FisherYatesState>[] {
  const steps: VizStep<FisherYatesState>[] = [];
  const a = [...arr];
  let s = seed;

  const rand = (n: number) => {
    s = (s * 9301 + 49297) % 233280;
    return Math.floor((s / 233280) * (n + 1));
  };

  const snapshot = (i: number, j: number, message: string, codeLine: number): VizStep<FisherYatesState> => ({
    state: { arr: [...a], i, j, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, -1, `Fisher-Yates 洗牌：从后往前，与前面随机位置交换`, 1));

  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = rand(i);
    steps.push(snapshot(i, j, `i=${i}，随机 j=${j}`, 3));
    [a[i], a[j]] = [a[j], a[i]];
    steps.push(snapshot(i, j, `交换 arr[${i}] 与 arr[${j}]`, 4));
  }

  steps.push(snapshot(-1, -1, `洗牌完成：${a.join(' ')}`, 6));
  return steps;
}

function render(state: FisherYatesState) {
  const { arr, i, j, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {arr.map((v, idx) => (
          <span
            key={idx}
            className={`px-2 py-1 rounded border border-edge text-sm ${
              idx === i ? 'bg-amber-300 text-black' : idx === j ? 'bg-emerald-500/40' : 'bg-surface-2'
            }`}
          >
            {v}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
    </div>
  );
}

export function FisherYatesPanel() {
  const [seed, setSeed] = useState(1);
  const arr = useMemo(() => Array.from({ length: 8 }, (_, i) => i + 1), []);
  const steps = useMemo(() => buildSteps(arr, seed), [arr, seed]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setSeed((s) => s + 7)} className="px-2 py-1 rounded border border-edge text-sm bg-surface-2">重新洗牌</button>
      </div>
      <Stepper steps={steps} codeLines={fisherYatesCode} render={render} />
    </div>
  );
}
