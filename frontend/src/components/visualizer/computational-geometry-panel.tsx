'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const geometryCode = [
  'function cross(O, A, B) {',
  '  return (A[0] - O[0]) * (B[1] - O[1])',
  '       - (A[1] - O[1]) * (B[0] - O[0]);',
  '}',
  'function convexHull(points) {',
  '  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);',
  '  const lower = [];',
  '  for (const p of pts) {',
  '    while (lower.length >= 2 &&',
  '           cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)',
  '      lower.pop();',
  '    lower.push(p);',
  '  }',
  '  const upper = [];',
  '  for (let i = pts.length - 1; i >= 0; i--) {',
  '    while (upper.length >= 2 &&',
  '           cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0)',
  '      upper.pop();',
  '    upper.push(pts[i]);',
  '  }',
  '  lower.pop(); upper.pop();',
  '  return lower.concat(upper);',
  '}',
];

type Pt = [number, number];
type GPhase = 'sort' | 'lower' | 'upper' | 'done';

interface GeometryState {
  points: Pt[];
  sorted: Pt[];
  phase: GPhase;
  hull: Pt[];
  lowerHull: Pt[];
  current: Pt | null;
  popped: Pt | null;
  crossValue: number | null;
  hullFinal: Pt[];
  message: string;
}

const fmt = (p: Pt) => `${p[0]},${p[1]}`;
const same = (a: Pt | null, b: Pt) => !!a && a[0] === b[0] && a[1] === b[1];

function cross(O: Pt, A: Pt, B: Pt): number {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
}

const DEFAULT_POINTS: Pt[] = [[0, 0], [4, 0], [4, 4], [0, 4], [2, 1], [1, 2], [3, 2], [2, 3], [2, 2], [5, 2], [2, 5]];

export function buildSteps(points: Pt[]): VizStep<GeometryState>[] {
  const steps: VizStep<GeometryState>[] = [];
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const base = (phase: GPhase): GeometryState => ({
    points, sorted, phase, hull: [], lowerHull: [], current: null, popped: null, crossValue: null, hullFinal: [], message: '',
  });

  steps.push({
    state: { ...base('sort'), message: `给定 ${points.length} 个点，目标：找到包围所有点的最小凸多边形（凸包）` },
    description: '点集',
    codeLine: 4,
  });
  steps.push({
    state: { ...base('sort'), message: `按 x 升序（x 相同按 y）排序：[${sorted.map(fmt).join('  ')}]，随后从左到右扫两遍` },
    description: '按 x 排序',
    codeLine: 5,
  });

  // lower hull
  const lower: Pt[] = [];
  steps.push({
    state: { ...base('lower'), message: '构建下凸壳：从左到右扫描，维护栈中始终只保留"左转"的拐点' },
    description: '开始下凸壳',
    codeLine: 6,
  });
  for (const p of sorted) {
    while (lower.length >= 2) {
      const O = lower[lower.length - 2];
      const A = lower[lower.length - 1];
      const cv = cross(O, A, p);
      if (cv <= 0) {
        lower.pop();
        steps.push({
          state: { ...base('lower'), hull: [...lower], current: p, popped: A, crossValue: cv, message: `cross((${fmt(O)}), (${fmt(A)}), (${fmt(p)})) = ${cv} ≤ 0 → 右转或共线，(${fmt(A)}) 不是凸点，弹出` },
          description: `弹出 (${fmt(A)})`,
          codeLine: 10,
        });
      } else break;
    }
    lower.push(p);
    const cv = lower.length >= 3 ? cross(lower[lower.length - 3], lower[lower.length - 2], p) : null;
    steps.push({
      state: { ...base('lower'), hull: [...lower], current: p, crossValue: cv, message: cv === null ? `栈内不足 2 点，(${fmt(p)}) 直接入栈` : `cross = ${cv} > 0 → 左转，(${fmt(p)}) 入栈，下凸壳现有 ${lower.length} 点` },
      description: `入栈 (${fmt(p)})`,
      codeLine: 11,
    });
  }

  // upper hull
  const upper: Pt[] = [];
  steps.push({
    state: { ...base('upper'), lowerHull: [...lower], hull: [], message: '下凸壳完成（蓝色）。构建上凸壳：从右到左反向扫描，规则相同' },
    description: '开始上凸壳',
    codeLine: 13,
  });
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2) {
      const O = upper[upper.length - 2];
      const A = upper[upper.length - 1];
      const cv = cross(O, A, p);
      if (cv <= 0) {
        upper.pop();
        steps.push({
          state: { ...base('upper'), lowerHull: [...lower], hull: [...upper], current: p, popped: A, crossValue: cv, message: `cross((${fmt(O)}), (${fmt(A)}), (${fmt(p)})) = ${cv} ≤ 0 → 右转或共线，弹出 (${fmt(A)})` },
          description: `弹出 (${fmt(A)})`,
          codeLine: 17,
        });
      } else break;
    }
    upper.push(p);
    const cv = upper.length >= 3 ? cross(upper[upper.length - 3], upper[upper.length - 2], p) : null;
    steps.push({
      state: { ...base('upper'), lowerHull: [...lower], hull: [...upper], current: p, crossValue: cv, message: cv === null ? `栈内不足 2 点，(${fmt(p)}) 直接入栈` : `cross = ${cv} > 0 → 左转，(${fmt(p)}) 入栈，上凸壳现有 ${upper.length} 点` },
      description: `入栈 (${fmt(p)})`,
      codeLine: 18,
    });
  }

  const finalHull = lower.slice(0, -1).concat(upper.slice(0, -1));
  steps.push({
    state: { ...base('done'), lowerHull: [...lower], hullFinal: finalHull, message: `去掉上下凸壳共享的两个端点，拼接得到凸包：[${finalHull.map(fmt).join(' → ')}]（逆时针）` },
    description: '凸包完成',
    codeLine: 21,
  });

  return steps;
}

const GW = 460;
const GH = 300;
const GPAD = 36;

export function ComputationalGeometryPanel() {
  const [points, setPoints] = useState<Pt[]>(DEFAULT_POINTS);

  const steps = useMemo(() => buildSteps(points), [points]);
  const initial: GeometryState = {
    points, sorted: [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]),
    phase: 'sort', hull: [], lowerHull: [], current: null, popped: null, crossValue: null, hullFinal: [], message: '',
  };

  return (
    <Stepper<GeometryState>
      steps={steps}
      initialState={initial}
      codeLines={geometryCode}
      codeTitle="凸包 · Andrew 单调链 Convex Hull"
      headerActions={
        <>
          <span className="text-sm text-gray-400">点集(x,y 空格分隔):</span>
          <input
            type="text"
            value={points.map(fmt).join(' ')}
            onChange={(e) => {
              const tokens = e.target.value.trim().split(/\s+/);
              const parsed: Pt[] = [];
              for (const t of tokens) {
                const [x, y] = t.split(',').map(Number);
                if (Number.isFinite(x) && Number.isFinite(y)) parsed.push([x, y]);
              }
              if (parsed.length >= 3) setPoints(parsed.slice(0, 14));
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-72 font-mono"
            placeholder="如 0,0 4,0 2,3"
          />
        </>
      }
      render={(state) => {
        const xs = state.points.map((p) => p[0]);
        const ys = state.points.map((p) => p[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const sx = (x: number) => GPAD + ((x - minX) / (maxX - minX || 1)) * (GW - 2 * GPAD);
        const sy = (y: number) => GH - GPAD - ((y - minY) / (maxY - minY || 1)) * (GH - 2 * GPAD);

        const inHull = (p: Pt) => state.hull.some((q) => q[0] === p[0] && q[1] === p[1]);
        const inFinal = (p: Pt) => state.hullFinal.some((q) => q[0] === p[0] && q[1] === p[1]);

        return (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              黄色=当前扫描点，蓝色=凸壳栈内点，红色=刚被弹出的点，绿色=最终凸包顶点；叉积 &gt; 0 左转保留，≤ 0 右转弹出
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <svg viewBox={`0 0 ${GW} ${GH}`} className="w-full lg:w-[55%] shrink-0 bg-bg rounded-lg border border-edge">
                {/* grid */}
                {Array.from({ length: Math.round(maxX - minX) + 1 }, (_, i) => minX + i).map((gx) => (
                  <line key={`gx${gx}`} x1={sx(gx)} y1={GPAD - 10} x2={sx(gx)} y2={GH - GPAD + 10} stroke="#1f1f1f" strokeWidth={1} />
                ))}
                {Array.from({ length: Math.round(maxY - minY) + 1 }, (_, i) => minY + i).map((gy) => (
                  <line key={`gy${gy}`} x1={GPAD - 10} y1={sy(gy)} x2={GW - GPAD + 10} y2={sy(gy)} stroke="#1f1f1f" strokeWidth={1} />
                ))}

                {/* final hull polygon */}
                {state.phase === 'done' && state.hullFinal.length > 2 && (
                  <polygon
                    points={state.hullFinal.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')}
                    fill="rgba(74,222,128,0.08)"
                    stroke="#4ade80"
                    strokeWidth={2.5}
                  />
                )}

                {/* completed lower hull (static, during upper phase) */}
                {state.phase !== 'lower' && state.lowerHull.length >= 2 && (
                  <polyline
                    points={state.lowerHull.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    opacity={0.55}
                  />
                )}

                {/* current hull stack polyline */}
                {state.hull.length >= 2 && (
                  <polyline
                    points={state.hull.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')}
                    fill="none"
                    stroke={state.phase === 'upper' ? '#c084fc' : '#60a5fa'}
                    strokeWidth={2}
                    strokeDasharray="6 3"
                  />
                )}

                {/* points */}
                {state.sorted.map((p, i) => {
                  const isCurrent = same(state.current, p);
                  const isPopped = same(state.popped, p);
                  const isFinal = state.phase === 'done' && inFinal(p);
                  const isInHull = inHull(p);
                  const fill = isCurrent
                    ? '#facc15'
                    : isPopped
                      ? '#f87171'
                      : isFinal
                        ? '#4ade80'
                        : isInHull
                          ? state.phase === 'upper' ? '#c084fc' : '#60a5fa'
                          : '#555';
                  return (
                    <g key={`${fmt(p)}-${i}`}>
                      <circle cx={sx(p[0])} cy={sy(p[1])} r={isCurrent ? 7 : 5} fill={fill} stroke="#111" strokeWidth={1.5} />
                      <text x={sx(p[0]) + 8} y={sy(p[1]) - 7} fontSize={8.5} fill="#777" fontFamily="monospace">
                        {fmt(p)}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="flex-1 space-y-3">
                {/* sorted sequence */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">排序后扫描顺序:</div>
                  <div className="flex gap-1 flex-wrap">
                    {state.sorted.map((p, i) => (
                      <div
                        key={`${fmt(p)}-${i}`}
                        className={clsx(
                          'px-1.5 h-7 flex items-center justify-center rounded text-[10px] font-mono border transition-all',
                          same(state.current, p)
                            ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                            : same(state.popped, p)
                              ? 'bg-red-500/25 border-red-500 text-red-300'
                              : inHull(p)
                                ? state.phase === 'upper'
                                  ? 'bg-purple-500/20 border-purple-600 text-purple-300'
                                  : 'bg-blue-500/20 border-blue-600 text-blue-300'
                                : 'bg-surface-2 border-edge-2 text-ink-3',
                        )}
                      >
                        {fmt(p)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* hull stack */}
                {(state.phase === 'lower' || state.phase === 'upper') && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">
                      {state.phase === 'lower' ? '下凸壳栈 lower:' : '上凸壳栈 upper:'}
                    </div>
                    <div className="flex gap-1 flex-wrap items-center min-h-[1.75rem]">
                      {state.hull.map((p, i) => (
                        <span key={`${fmt(p)}-${i}`} className="flex items-center gap-1">
                          <span className={clsx('px-1.5 h-7 flex items-center justify-center rounded text-[10px] font-mono border', i === state.hull.length - 1 ? 'border-yellow-400 bg-yellow-500/20 text-yellow-200' : 'border-edge-2 bg-surface-2 text-ink-2')}>
                            {fmt(p)}
                          </span>
                          {i < state.hull.length - 1 && <span className="text-gray-600 text-xs">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* cross value */}
                {state.crossValue !== null && (
                  <div className={clsx('px-3 py-2 rounded-lg border text-sm font-mono', state.crossValue > 0 ? 'border-green-800 bg-green-900/20 text-green-300' : 'border-red-800 bg-red-900/20 text-red-300')}>
                    cross = {state.crossValue} → {state.crossValue > 0 ? '左转（逆时针），保留' : '右转/共线，弹出栈顶'}
                  </div>
                )}

                {state.phase === 'done' && (
                  <div className="px-3 py-2 rounded-lg border border-green-800 bg-green-900/20 text-green-300 text-sm font-mono">
                    凸包顶点（逆时针）: [{state.hullFinal.map(fmt).join(' → ')}]，共 {state.hullFinal.length} 个，算法 O(n log n)
                  </div>
                )}
              </div>
            </div>

            {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
          </div>
        );
      }}
    />
  );
}
