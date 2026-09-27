'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const complexityCode = [
  'const complexities = [',
  "  { name: 'O(1)',       ops: (n) => 1 },",
  "  { name: 'O(log n)',   ops: (n) => Math.ceil(Math.log2(n)) },",
  "  { name: 'O(n)',       ops: (n) => n },",
  "  { name: 'O(n log n)', ops: (n) => Math.ceil(n * Math.log2(n)) },",
  "  { name: 'O(n²)',      ops: (n) => n * n },",
  "  { name: 'O(2ⁿ)',      ops: (n) => 2 ** n },",
  '];',
  'function countOps(name, n) {',
  '  const f = complexities.find((c) => c.name === name);',
  '  return f ? f.ops(n) : 0;',
  '}',
  'function estimate(ops, nsPerOp = 1) {',
  '  const t = ops * nsPerOp;',
  "  if (t < 1e3) return t + ' ns';",
  "  if (t < 1e6) return (t / 1e3).toFixed(1) + ' μs';",
  "  if (t < 1e9) return (t / 1e6).toFixed(1) + ' ms';",
  "  return (t / 1e9).toFixed(1) + ' s';",
  '}',
];

const CURVES = [
  { name: 'O(1)', color: '#9ca3af', ops: (n: number) => 1 },
  { name: 'O(log n)', color: '#4ade80', ops: (n: number) => Math.ceil(Math.log2(n)) },
  { name: 'O(n)', color: '#60a5fa', ops: (n: number) => n },
  { name: 'O(n log n)', color: '#facc15', ops: (n: number) => Math.ceil(n * Math.log2(n)) },
  { name: 'O(n²)', color: '#fb923c', ops: (n: number) => n * n },
  { name: 'O(2ⁿ)', color: '#f87171', ops: (n: number) => 2 ** n },
];

interface ComplexityState {
  visibleCount: number;
  activeN: number | null;
  curveOps: { name: string; ops: number }[];
  message: string;
}

export function buildSteps(maxN: number): VizStep<ComplexityState>[] {
  const steps: VizStep<ComplexityState>[] = [];

  steps.push({
    state: { visibleCount: 0, activeN: null, curveOps: [], message: `纵轴为操作次数（对数刻度），横轴为输入规模 n（1 ~ ${maxN}），逐条绘制增长曲线` },
    description: '建立坐标系',
    codeLine: 0,
  });

  const intro = [
    '常数阶：无论 n 多大，操作次数恒为 1，如数组按下标取值',
    '对数阶：每步排除一半，如二分查找',
    '线性阶：遍历一遍输入，如顺序查找',
    '线性对数阶：分治排序的典型代价，如归并排序',
    '平方阶：双重循环枚举，如冒泡排序',
    '指数阶：子集枚举，n=30 就超过十亿次',
  ];
  CURVES.forEach((c, i) => {
    steps.push({
      state: { visibleCount: i + 1, activeN: null, curveOps: [], message: `${c.name} — ${intro[i]}` },
      description: `绘制 ${c.name}`,
      codeLine: i + 1,
    });
  });

  const evalNs = [2, 4, 8, 16, 32].filter((n) => n <= maxN);
  for (const n of evalNs) {
    const worst = CURVES[CURVES.length - 1].ops(n);
    steps.push({
      state: { visibleCount: CURVES.length, activeN: n, curveOps: CURVES.map((c) => ({ name: c.name, ops: c.ops(n) })), message: `n = ${n} 时各复杂度的操作次数与耗时估算（假设每次操作 1ns），O(2ⁿ) 已达 ${worst.toLocaleString()} 次` },
      description: `代入 n=${n}`,
      codeLine: 10,
    });
  }

  steps.push({
    state: { visibleCount: CURVES.length, activeN: maxN, curveOps: CURVES.map((c) => ({ name: c.name, ops: c.ops(maxN) })), message: '结论：n 增大时曲线斜率差异急剧放大——选对算法复杂度比优化常数更重要' },
    description: '总结',
    codeLine: 17,
  });

  return steps;
}

function estimateTime(ops: number): string {
  const t = ops;
  if (t < 1e3) return `${t} ns`;
  if (t < 1e6) return `${(t / 1e3).toFixed(1)} μs`;
  if (t < 1e9) return `${(t / 1e6).toFixed(1)} ms`;
  return `${(t / 1e9).toFixed(1)} s`;
}

// ---- SVG chart helpers ----
const W = 560;
const H = 300;
const ML = 56;
const MR = 16;
const MT = 14;
const MB = 34;

function chartPoints(maxN: number, ops: (n: number) => number): string {
  const maxLog = Math.log10(Math.max(ops(maxN), 1));
  const pts: string[] = [];
  for (let n = 1; n <= maxN; n++) {
    const x = ML + ((n - 1) / (maxN - 1)) * (W - ML - MR);
    const logV = Math.log10(Math.max(ops(n), 1));
    const y = H - MB - (logV / maxLog) * (H - MT - MB);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

function xOf(n: number, maxN: number): number {
  return ML + ((n - 1) / (maxN - 1)) * (W - ML - MR);
}

export function TimeComplexityPanel() {
  const [maxN, setMaxN] = useState(16);

  const steps = useMemo(() => buildSteps(maxN), [maxN]);
  const initial: ComplexityState = { visibleCount: 0, activeN: null, curveOps: [], message: '' };

  const maxLog = Math.log10(Math.max(CURVES[CURVES.length - 1].ops(maxN), 1));
  const yTicks = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000].filter(
    (v) => Math.log10(v) <= maxLog + 1e-9,
  );

  return (
    <Stepper<ComplexityState>
      steps={steps}
      initialState={initial}
      codeLines={complexityCode}
      codeTitle="时间复杂度 Time Complexity"
      headerActions={
        <>
          <span className="text-sm text-gray-400">n 上限:</span>
          <select
            value={maxN}
            onChange={(e) => setMaxN(Number(e.target.value))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm"
          >
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={32}>32</option>
          </select>
        </>
      }
      render={(state) => (
        <div className="space-y-4">
          <div className="text-xs text-gray-500">纵轴：操作次数（对数刻度）；横轴：输入规模 n</div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-bg rounded-lg border border-edge">
            {/* axes */}
            <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="#444" strokeWidth={1} />
            <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke="#444" strokeWidth={1} />
            {yTicks.map((v) => {
              const y = H - MB - (Math.log10(v) / maxLog) * (H - MT - MB);
              return (
                <g key={v}>
                  <line x1={ML} y1={y} x2={W - MR} y2={y} stroke="#2a2a2a" strokeWidth={1} strokeDasharray="3 3" />
                  <text x={ML - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#777">
                    {v >= 1e6 ? `1e${Math.round(Math.log10(v))}` : v}
                  </text>
                </g>
              );
            })}
            {[2, 4, 8, 16, 32].filter((n) => n <= maxN).map((n) => (
              <text key={n} x={xOf(n, maxN)} y={H - MB + 14} textAnchor="middle" fontSize={9} fill="#777">
                {n}
              </text>
            ))}
            <text x={W - MR} y={H - MB + 26} textAnchor="end" fontSize={9} fill="#666">n</text>
            <text x={10} y={MT + 4} fontSize={9} fill="#666">ops</text>

            {/* active n vertical line */}
            {state.activeN !== null && (
              <line
                x1={xOf(state.activeN, maxN)}
                y1={MT}
                x2={xOf(state.activeN, maxN)}
                y2={H - MB}
                stroke="#60a5fa"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            )}

            {/* curves */}
            {CURVES.slice(0, state.visibleCount).map((c) => (
              <polyline
                key={c.name}
                points={chartPoints(maxN, c.ops)}
                fill="none"
                stroke={c.color}
                strokeWidth={2}
              />
            ))}

            {/* dots at activeN */}
            {state.activeN !== null &&
              CURVES.slice(0, state.visibleCount).map((c) => {
                const y = H - MB - (Math.log10(Math.max(c.ops(state.activeN!), 1)) / maxLog) * (H - MT - MB);
                return <circle key={c.name} cx={xOf(state.activeN!, maxN)} cy={y} r={4} fill={c.color} />;
              })}
          </svg>

          {/* legend */}
          <div className="flex flex-wrap gap-3">
            {CURVES.map((c, i) => (
              <span
                key={c.name}
                className={clsx(
                  'text-xs font-mono px-2 py-0.5 rounded border transition-all',
                  i < state.visibleCount
                    ? 'border-edge-2 text-ink-2 bg-surface-2'
                    : 'border-edge text-gray-600',
                )}
              >
                <span style={{ color: c.color }}>●</span> {c.name}
              </span>
            ))}
          </div>

          {/* evaluation table */}
          {state.activeN !== null && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-edge-2">
                    <th className="text-left py-1 px-2">复杂度</th>
                    <th className="text-right py-1 px-2">n = {state.activeN} 操作次数</th>
                    <th className="text-right py-1 px-2">耗时估算 (1ns/op)</th>
                  </tr>
                </thead>
                <tbody>
                  {CURVES.map((c) => {
                    const ops = c.ops(state.activeN!);
                    return (
                      <tr key={c.name} className="border-b border-edge">
                        <td className="py-1 px-2" style={{ color: c.color }}>{c.name}</td>
                        <td className="py-1 px-2 text-right text-gray-200">{ops.toLocaleString()}</td>
                        <td className="py-1 px-2 text-right text-gray-400">{estimateTime(ops)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
