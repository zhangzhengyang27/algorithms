'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

function euclid(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

const kMeansCode = [
  'function kMeans(data, k) {',
  '  centers = first k points;',
  '  repeat {',
  '    // 分配：每点归入最近质心',
  '    for (p of data) cls[p] = argmin d(p, centers);',
  '    // 更新：质心 = 簇内均值',
  '    for (c) centers[c] = mean(points in c);',
  '  } until centers stable;',
  '}',
];

interface KMeansState {
  data: number[][];
  k: number;
  centers: number[][];
  classes: number[];
  phase: 'init' | 'assign' | 'update';
  message: string;
}

function buildSteps(data: number[][], k: number): VizStep<KMeansState>[] {
  const steps: VizStep<KMeansState>[] = [];
  const centers = data.slice(0, k).map((c) => [...c]);
  const classes = Array(data.length).fill(-1);

  const snapshot = (phase: KMeansState['phase'], message: string, codeLine: number): VizStep<KMeansState> => ({
    state: { data, k, centers: centers.map((c) => [...c]), classes: [...classes], phase, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot('init', `初始化 ${k} 个质心（取前 ${k} 个点）`, 2));

  let iterate = true;
  let round = 0;
  while (iterate && round < 8) {
    round += 1;
    iterate = false;
    steps.push(snapshot('assign', `第 ${round} 轮：将每个点分配到最近质心`, 4));
    for (let i = 0; i < data.length; i += 1) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c += 1) {
        const d = euclid(data[i], centers[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (classes[i] !== best) iterate = true;
      classes[i] = best;
    }
    steps.push(snapshot('update', `重新计算每个簇的均值作为新质心`, 6));
    for (let c = 0; c < k; c += 1) {
      const pts = data.filter((_, i) => classes[i] === c);
      if (pts.length === 0) continue;
      const dim = pts[0].length;
      const mean = Array(dim).fill(0);
      for (const p of pts) for (let d = 0; d < dim; d += 1) mean[d] += p[d];
      for (let d = 0; d < dim; d += 1) mean[d] = parseFloat((mean[d] / pts.length).toFixed(2));
      centers[c] = mean;
    }
  }

  steps.push(snapshot('update', `收敛，最终 ${k} 个簇`, 8));
  return steps;
}

function render(state: KMeansState) {
  const { data, centers, classes, k, message } = state;
  const palette = ['bg-emerald-400', 'bg-amber-400', 'bg-sky-400', 'bg-rose-400'];
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 100 100" className="w-full max-w-sm bg-surface-2 border border-edge rounded">
        {data.map((p, i) => (
          <circle key={i} cx={p[0] * 10} cy={100 - p[1] * 10} r={2.5} className={palette[classes[i] >= 0 ? classes[i] % palette.length : 0]} />
        ))}
        {centers.map((c, i) => (
          <rect key={i} x={c[0] * 10 - 1.5} y={100 - c[1] * 10 - 1.5} width={3} height={3} className={palette[i % palette.length]} stroke="white" strokeWidth={0.5} />
        ))}
      </svg>
      <p className="text-xs text-gray-400">圆点为数据点（颜色=所属簇），方块为质心；坐标范围 0–10。</p>
      <p className="text-sm text-gray-300">{message}</p>
      <p className="text-xs text-gray-500">质心：{centers.map((c) => `[${c.join(', ')}]`).join('  ')}</p>
    </div>
  );
}

export function KMeansPanel() {
  const [seed, setSeed] = useState(1);
  const [k, setK] = useState(2);
  const data = useMemo(() => {
    const pts: number[][] = [];
    let s = seed;
    for (let i = 0; i < 12; i += 1) {
      s = (s * 9301 + 49297) % 233280;
      const x = 1 + (s / 233280) * 8;
      s = (s * 9301 + 49297) % 233280;
      const y = 1 + (s / 233280) * 8;
      pts.push([x, y]);
    }
    return pts;
  }, [seed]);
  const steps = useMemo(() => buildSteps(data, k), [data, k]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">簇数 k:</span>
        <input type="number" value={k} min={2} max={4} onChange={(e) => setK(Math.max(2, Math.min(4, Number(e.target.value) || 2)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
        <button onClick={() => setSeed((s) => s + 7)} className="px-2 py-1 rounded border border-edge text-sm bg-surface-2">换一批点</button>
      </div>
      <Stepper steps={steps} codeLines={kMeansCode} render={render} />
    </div>
  );
}
