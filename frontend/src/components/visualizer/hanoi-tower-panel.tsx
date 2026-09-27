'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const hanoiCode = [
  'function move(n, from, aux, to) {',
  '  if (n === 1) { to.push(from.pop()); return; }',
  '  move(n - 1, from, to, aux);',
  '  to.push(from.pop());',
  '  move(n - 1, aux, from, to);',
  '}',
];

interface HanoiState {
  poles: number[][];
  fromPole: number;
  toPole: number;
  disc: number | null;
  message: string;
}

export function buildSteps(n: number): VizStep<HanoiState>[] {
  const steps: VizStep<HanoiState>[] = [];
  const poles: number[][] = [
    Array.from({ length: n }, (_, i) => n - i),
    [],
    [],
  ];

  const snapshot = (fromPole: number, toPole: number, disc: number | null, message: string, codeLine: number): VizStep<HanoiState> => ({
    state: { poles: poles.map((p) => [...p]), fromPole, toPole, disc, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(0, 2, null, `将 ${n} 个圆盘从 A 柱全部移到 C 柱（每次只移一个，且大盘不能压小盘）`, 1));

  function move(count: number, from: number, aux: number, to: number) {
    if (count === 1) {
      const disc = poles[from].pop()!;
      poles[to].push(disc);
      steps.push(snapshot(from, to, disc, `移动圆盘 ${disc}：A${from + 1} → A${to + 1}`, 2));
      return;
    }
    move(count - 1, from, to, aux);
    const disc = poles[from].pop()!;
    poles[to].push(disc);
    steps.push(snapshot(from, to, disc, `移动圆盘 ${disc}：A${from + 1} → A${to + 1}`, 4));
    move(count - 1, aux, from, to);
  }

  move(n, 0, 1, 2);
  steps.push(snapshot(0, 2, null, `完成！共移动 ${Math.pow(2, n) - 1} 步`, 1));
  return steps;
}

const POLE_NAMES = ['A', 'B', 'C'];

function render(state: HanoiState) {
  const { poles, fromPole, toPole, disc, message } = state;
  const maxDisc = poles.reduce((m, p) => Math.max(m, ...p, 0), 0);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4">
        {poles.map((pole, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-center text-xs text-gray-400">
              {POLE_NAMES[idx]}
              {(fromPole === idx || toPole === idx) && (
                <span className="ml-1 text-emerald-400">({fromPole === idx ? '源' : '目标'})</span>
              )}
            </div>
            <div className="flex flex-col-reverse items-center min-h-30 bg-surface-2 border border-edge rounded p-2">
              {pole.length === 0 && <div className="text-gray-600 text-xs">空</div>}
              {pole.map((d) => (
                <div
                  key={d}
                  className={`my-0.5 rounded text-center text-xs text-black ${disc === d ? 'bg-amber-300' : 'bg-slate-300'}`}
                  style={{ width: `${(d / maxDisc) * 80 + 20}%` }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
    </div>
  );
}

export function HanoiTowerPanel() {
  const [n, setN] = useState(4);
  const steps = useMemo(() => buildSteps(n), [n]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">圆盘数:</span>
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
      <Stepper steps={steps} codeLines={hanoiCode} render={render} />
    </div>
  );
}
