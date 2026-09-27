'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

function euclid(a: number[], b: number[]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

const knnCode = [
  'function knn(data, labels, target, k) {',
  '  dists = data.map(p => [euclid(p, target), label]);',
  '  dists.sort(by dist);',
  '  topK = dists.slice(0, k);',
  '  return majority(topK.labels);',
  '}',
];

interface KnnState {
  data: number[][];
  labels: number[];
  target: number[];
  k: number;
  sorted: { dist: number; label: number }[];
  chosen: number[];
  message: string;
}

export function buildSteps(data: number[][], labels: number[], target: number[], k: number): VizStep<KnnState>[] {
  const steps: VizStep<KnnState>[] = [];
  const dists = data.map((p, i) => ({ dist: euclid(p, target), label: labels[i] }));

  const snapshot = (sorted: { dist: number; label: number }[], chosen: number[], message: string, codeLine: number): VizStep<KnnState> => ({
    state: { data, labels, target, k, sorted: [...sorted], chosen: [...chosen], message },
    description: message,
    codeLine,
  });

  steps.push(snapshot([], [], `计算待分类点 (${target.join(',')}) 到各训练点的距离`, 1));

  dists.sort((a, b) => a.dist - b.dist);
  steps.push(snapshot(dists, [], `按距离升序排列：${dists.map((d) => d.dist.toFixed(2)).join(', ')}`, 3));

  const topK = dists.slice(0, k);
  const chosenIndices = data
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => topK.some((t) => euclid(p, target) === t.dist))
    .map(({ i }) => i);
  steps.push(snapshot(dists, chosenIndices, `取最近的 ${k} 个邻居`, 4));

  const counter: Record<number, number> = {};
  for (const t of topK) counter[t.label] = (counter[t.label] || 0) + 1;
  let topClass = topK[0].label;
  let topCount = 0;
  for (const label in counter) {
    if (counter[label] > topCount) {
      topCount = counter[label];
      topClass = Number(label);
    }
  }
  steps.push(snapshot(dists, chosenIndices, `多数投票：类 ${topClass}（${topCount}/${k} 票），分类结果为 ${topClass}`, 5));
  return steps;
}

function render(state: KnnState) {
  const { data, labels, target, k, chosen, message } = state;
  const palette = ['bg-emerald-400', 'bg-rose-400', 'bg-sky-400'];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 100 100" className="w-full max-w-sm bg-surface-2 border border-edge rounded">
        {data.map((p, i) => (
          <circle
            key={i}
            cx={p[0] * 10}
            cy={100 - p[1] * 10}
            r={chosen.includes(i) ? 4 : 2.5}
            className={`${palette[labels[i] % palette.length]} ${chosen.includes(i) ? 'opacity-100' : 'opacity-60'}`}
          />
        ))}
        <circle cx={target[0] * 10} cy={100 - target[1] * 10} r={3.5} className="fill-yellow-300" stroke="white" strokeWidth={0.5} />
      </svg>
      <p className="text-xs text-gray-400">圆点=训练样本（颜色=类别），黄点=待分类；坐标 0–10。</p>
      <p className="text-sm text-gray-300">{message}</p>
    </div>
  );
}

export function KNNPanel() {
  const [k, setK] = useState(3);
  const data = [
    [1, 2], [1.5, 1], [2, 2.5], [3, 1.5], [8, 8], [8.5, 7], [9, 8.5], [7.5, 9],
  ];
  const labels = [0, 0, 0, 0, 1, 1, 1, 1];
  const target = [5, 5];
  const steps = useMemo(() => buildSteps(data, labels, target, k), [k]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">k (邻居数):</span>
        <input type="number" value={k} min={1} max={7} onChange={(e) => setK(Math.max(1, Math.min(7, Number(e.target.value) || 1)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
      </div>
      <Stepper steps={steps} codeLines={knnCode} render={render} />
    </div>
  );
}
