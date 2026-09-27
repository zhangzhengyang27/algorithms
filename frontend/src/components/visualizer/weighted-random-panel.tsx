'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const weightedRandomCode = [
  'function weightedRandom(items, weights) {',
  '  let cum = [];',
  '  for (i) cum[i] = weights[i] + cum[i-1];',
  '  const r = cum.last * Math.random();',
  '  for (i) if (cum[i] >= r) return items[i];',
  '}',
];

interface WeightedRandomState {
  items: string[];
  weights: number[];
  cum: number[];
  pick: number;
  r: number;
  message: string;
}

export function buildSteps(items: string[], weights: number[], seed: number): VizStep<WeightedRandomState>[] {
  const steps: VizStep<WeightedRandomState>[] = [];
  const cum: number[] = [];
  let prev = 0;
  for (let i = 0; i < weights.length; i++) {
    prev += weights[i];
    cum.push(prev);
  }

  const snapshot = (pick: number, r: number, message: string, codeLine: number): VizStep<WeightedRandomState> => ({
    state: { items, weights, cum: [...cum], pick, r, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, 0, `按权重随机抽取：权重越大被抽中概率越高`, 1));
  steps.push(snapshot(-1, 0, `累计权重 cum = [${cum.join(', ')}]，总和 = ${cum[cum.length - 1]}`, 3));

  const max = cum[cum.length - 1];
  const r = (seed % 1000) / 1000 * max;
  steps.push(snapshot(-1, r, `随机数 r = ${r.toFixed(2)}（范围 [0, ${max}]）`, 4));

  let chosen = -1;
  for (let i = 0; i < items.length; i++) {
    if (cum[i] >= r) {
      chosen = i;
      steps.push(snapshot(i, r, `cum[${i}] = ${cum[i]} ≥ r → 选中 "${items[i]}"`, 5));
      break;
    }
    steps.push(snapshot(i, r, `cum[${i}] = ${cum[i]} < r，继续`, 5));
  }

  steps.push(snapshot(chosen, r, `结果："${items[chosen]}"（权重 ${weights[chosen]}）`, 6));
  return steps;
}

function render(state: WeightedRandomState) {
  const { items, weights, cum, pick, r, message } = state;
  const maxCum = cum[cum.length - 1] || 1;
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded border border-edge text-sm w-24 ${idx === pick ? 'bg-emerald-500/40' : 'bg-surface-2'}`}>{it}</span>
            <div className="flex-1 h-4 bg-surface-2 rounded relative overflow-hidden">
              <div
                className={`h-full ${idx === pick ? 'bg-emerald-500' : 'bg-slate-500'}`}
                style={{ width: `${(weights[idx] / maxCum) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-16">权重 {weights[idx]}</span>
            <span className="text-xs text-gray-500 w-20">cum {cum[idx]}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
      {pick >= 0 && <p className="text-xs text-gray-500">阈值 r = {r.toFixed(2)}</p>}
    </div>
  );
}

export function WeightedRandomPanel() {
  const [itemsText, setItemsText] = useState('apple,banana,cherry');
  const [weightsText, setWeightsText] = useState('1,4,3');
  const items = itemsText.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  const weights = weightsText.split(',').map((s) => parseFloat(s.trim())).filter((x) => !Number.isNaN(x));
  const valid = items.length === weights.length && items.length > 0;
  const [seed, setSeed] = useState(123);
  const steps = useMemo(
    () => (valid ? buildSteps(items, weights, seed) : []),
    [items, weights, seed, valid],
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">元素:</span>
        <input type="text" value={itemsText} onChange={(e) => setItemsText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48 font-mono" />
        <span className="text-sm text-gray-400">权重:</span>
        <input type="text" value={weightsText} onChange={(e) => setWeightsText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-32 font-mono" />
        <button onClick={() => setSeed((s) => s + 137)} className="px-2 py-1 rounded border border-edge text-sm bg-surface-2">换个随机种子</button>
      </div>
      {valid ? (
        <Stepper steps={steps} codeLines={weightedRandomCode} render={render} />
      ) : (
        <p className="text-sm text-rose-400">元素与权重数量需一致</p>
      )}
    </div>
  );
}
