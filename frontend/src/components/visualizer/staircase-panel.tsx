'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const staircaseCode = [
  'function climb(n) {',
  '  steps[0] = 0; steps[1] = 1; steps[2] = 2;',
  '  for (let i = 3; i <= n; i++)',
  '    steps[i] = steps[i-1] + steps[i-2];',
  '  return steps[n];',
  '}',
];

interface StaircaseState {
  n: number;
  steps: number[];
  i: number;
  message: string;
}

export function buildSteps(n: number): VizStep<StaircaseState>[] {
  const steps: VizStep<StaircaseState>[] = [];
  const dp = new Array(Math.max(n, 2) + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;

  const snapshot = (i: number, message: string, codeLine: number): VizStep<StaircaseState> => ({
    state: { n, steps: [...dp], i, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, `爬 ${n} 级楼梯，每次 1 或 2 步，求方法总数`, 1));

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    steps.push(snapshot(i, `steps[${i}] = steps[${i - 1}](${dp[i - 1]}) + steps[${i - 2}](${dp[i - 2]}) = ${dp[i]}`, 4));
  }

  steps.push(snapshot(n, `共 ${dp[n]} 种方法`, 5));
  return steps;
}

function render(state: StaircaseState) {
  const { n, steps, i, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: n }).map((_, idx) => {
          const lvl = idx + 1;
          return (
            <div
              key={idx}
              className={`flex flex-col items-center border border-edge rounded px-2 py-1 min-w-10 ${
                lvl === i ? 'bg-amber-300 text-black' : 'bg-surface-2'
              }`}
            >
              <span className="text-[10px] text-gray-400">第{lvl}级</span>
              <span className="font-mono">{lvl <= steps.length - 1 && steps[lvl] >= 0 ? steps[lvl] : ''}</span>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
    </div>
  );
}

export function StaircasePanel() {
  const [n, setN] = useState(6);
  const steps = useMemo(() => buildSteps(n), [n]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">楼梯级数 n:</span>
        <input
          type="number"
          value={n}
          min={1}
          max={20}
          onChange={(e) => setN(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
        />
      </div>
      <Stepper steps={steps} codeLines={staircaseCode} render={render} />
    </div>
  );
}
