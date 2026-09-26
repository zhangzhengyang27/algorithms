'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const knapsackCode = [
  'function knapsack(weights, values, capacity) {',
  '  const dp = Array(items + 1).fill().map(() => Array(capacity + 1).fill(0));',
  '  for (let i = 1; i <= items; i++) {',
  '    for (let w = 1; w <= capacity; w++) {',
  '      if (weights[i-1] > w) dp[i][w] = dp[i-1][w];',
  '      else dp[i][w] = max(values[i-1] + dp[i-1][w-weights[i-1]], dp[i-1][w]);',
  '    }',
  '  }',
  '  return dp[items][capacity];',
  '}',
];

interface KnapsackItem {
  weight: number;
  value: number;
}
interface KnapsackState {
  items: KnapsackItem[];
  capacity: number;
  dp: number[][];
  i: number;
  w: number;
  chosen: boolean;
  message: string;
}

function buildSteps(items: KnapsackItem[], capacity: number): VizStep<KnapsackState>[] {
  const steps: VizStep<KnapsackState>[] = [];
  const n = items.length;
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));

  const snapshot = (i: number, w: number, chosen: boolean, message: string, codeLine: number): VizStep<KnapsackState> => ({
    state: { items, capacity, dp: dp.map((r) => [...r]), i, w, chosen, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(0, 0, false, `0/1 背包：容量 ${capacity}，物品 ${n} 个`, 1));

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      const { weight, value } = items[i - 1];
      const fit = weight <= w;
      steps.push(
        snapshot(i, w, fit, `物品 ${i - 1}（w=${weight}, v=${value}）容量 ${w}${fit ? '：可放入' : '：超重'}`, fit ? 5 : 5),
      );
      if (!fit) {
        dp[i][w] = dp[i - 1][w];
        steps.push(snapshot(i, w, false, `放不下 → 取上一行 dp[${i - 1}][${w}] = ${dp[i][w]}`, 6));
      } else {
        dp[i][w] = Math.max(value + dp[i - 1][w - weight], dp[i - 1][w]);
        steps.push(
          snapshot(i, w, true, `max(${value} + dp[${i - 1}][${w - weight}], dp[${i - 1}][${w}]) = ${dp[i][w]}`, 6),
        );
      }
    }
  }

  steps.push(snapshot(n, capacity, false, `最大价值 = ${dp[n][capacity]}`, 9));
  return steps;
}

function render(state: KnapsackState) {
  const { items, capacity, dp, i, w, message } = state;
  return (
    <div className="space-y-3 overflow-x-auto">
      <div className="text-xs text-gray-400">
        物品：{items.map((it, idx) => `(${idx}: w${it.weight}/v${it.value})`).join('  ')}
      </div>
      <table className="border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-edge px-2 py-1 text-gray-400">i\w</th>
            {Array.from({ length: capacity + 1 }).map((_, c) => (
              <th key={c} className={`border border-edge px-2 py-1 ${c === w ? 'bg-amber-300 text-black' : 'text-gray-400'}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dp.map((row, ri) => (
            <tr key={ri}>
              <td className={`border border-edge px-2 py-1 ${ri === i ? 'bg-amber-300 text-black' : 'text-gray-400'}`}>{ri}</td>
              {row.map((v, ci) => (
                <td
                  key={ci}
                  className={`border border-edge px-2 py-1 text-center font-mono ${
                    ri === i && ci === w ? 'bg-emerald-500/40' : 'bg-surface-2'
                  }`}
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

export function KnapsackPanel() {
  const [items, setItems] = useState<KnapsackItem[]>([
    { weight: 1, value: 1 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
    { weight: 5, value: 7 },
  ]);
  const [capacity, setCapacity] = useState(7);
  const steps = useMemo(() => buildSteps(items, capacity), [items, capacity]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">背包容量:</span>
        <input
          type="number"
          value={capacity}
          min={1}
          max={12}
          onChange={(e) => setCapacity(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
        />
        <span className="text-xs text-gray-500">（物品在代码中预设）</span>
      </div>
      <Stepper steps={steps} codeLines={knapsackCode} render={render} />
    </div>
  );
}
