'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const sweepCode = [
  'function rectangleArea(rects) {',
  '  const events = [];',
  '  for (const [x1, y1, x2, y2] of rects) {',
  '    events.push([x1, 0, y1, y2]);',
  '    events.push([x2, 1, y1, y2]);',
  '  }',
  '  events.sort((a, b) => a[0] - b[0]);',
  '  let area = 0, prevX = events[0][0];',
  '  const active = [];',
  '  for (const [x, type, y1, y2] of events) {',
  '    area += coveredLength(active) * (x - prevX);',
  '    if (type === 0) active.push([y1, y2]);',
  '    else active.splice(active.findIndex(s => s[0] === y1 && s[1] === y2), 1);',
  '    prevX = x;',
  '  }',
  '  return area;',
  '}',
  'function coveredLength(intervals) {',
  '  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);',
  '  let len = 0, end = -Infinity;',
  '  for (const [s, e] of sorted)',
  '    if (e > end) { len += e - Math.max(s, end); end = e; }',
  '  return len;',
  '}',
];

type Rect = [number, number, number, number];
type Interval = [number, number];
interface Strip { x1: number; x2: number; intervals: Interval[] }

const RECT_COLORS = [
  { fill: 'rgba(59,130,246,0.15)', stroke: '#3b82f6' },
  { fill: 'rgba(168,85,247,0.15)', stroke: '#a855f7' },
  { fill: 'rgba(249,115,22,0.15)', stroke: '#f97316' },
];

const PX = (x: number) => 24 + x * 46;
const PY = (y: number) => 296 - y * 38;

function mergeIntervals(intervals: Interval[]): { merged: Interval[]; length: number } {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  for (const [s, e] of sorted) {
    if (merged.length > 0 && s <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
    } else {
      merged.push([s, e]);
    }
  }
  const length = merged.reduce((acc, [s, e]) => acc + e - s, 0);
  return { merged, length };
}

interface SweepState {
  rects: Rect[];
  events: [number, number, number, number][];
  sweepX: number;
  active: Interval[];
  strips: Strip[];
  area: number;
  covered: number;
  eventIdx: number;
  phase: 'init' | 'sweep' | 'event' | 'done';
  message: string;
}

export function buildSteps(rects: Rect[]): VizStep<SweepState>[] {
  const steps: VizStep<SweepState>[] = [];
  if (rects.length === 0) {
    return [{
      state: { rects, events: [], sweepX: 0, active: [], strips: [], area: 0, covered: 0, eventIdx: -1, phase: 'done', message: '没有矩形：面积并 = 0' },
      description: '空输入',
      codeLine: 1,
    }];
  }
  const events: [number, number, number, number][] = [];
  for (const [x1, y1, x2, y2] of rects) {
    events.push([x1, 0, y1, y2]);
    events.push([x2, 1, y1, y2]);
  }
  events.sort((a, b) => a[0] - b[0]);

  let area = 0;
  let prevX = events[0][0];
  const active: Interval[] = [];
  const strips: Strip[] = [];

  const cloneStrips = () => strips.map((s) => ({ ...s, intervals: s.intervals.map((iv): Interval => [iv[0], iv[1]]) }));
  const snap = (partial: Partial<SweepState> & { message: string }): SweepState => ({
    rects,
    events: events.map((e) => [...e] as [number, number, number, number]),
    sweepX: prevX,
    active: active.map((iv): Interval => [iv[0], iv[1]]),
    strips: cloneStrips(),
    area,
    covered: 0,
    eventIdx: -1,
    phase: 'init',
    ...partial,
  });

  steps.push({
    state: snap({ message: `共 ${events.length} 个事件（左边缘=加入区间，右边缘=移除区间），按 x 排序` }),
    description: '事件排序',
    codeLine: 6,
  });

  for (let ei = 0; ei < events.length; ei++) {
    const [x, type, y1, y2] = events[ei];
    const { merged, length } = mergeIntervals(active);
    const dx = x - prevX;
    const add = length * dx;
    if (dx > 0 && merged.length > 0) {
      strips.push({ x1: prevX, x2: x, intervals: merged.map((m): Interval => [m[0], m[1]]) });
    }
    area += add;
    prevX = x;

    steps.push({
      state: snap({ sweepX: x, covered: length, eventIdx: ei, phase: 'sweep', message: `扫描到 x=${x}：覆盖长度 ${length} × 宽度 ${dx} = +${add}，累计面积 ${area}` }),
      description: `面积 +${add}`,
      codeLine: 10,
    });

    if (type === 0) {
      active.push([y1, y2]);
    } else {
      const idx = active.findIndex((s) => s[0] === y1 && s[1] === y2);
      if (idx >= 0) active.splice(idx, 1);
    }
    const { length: newCovered } = mergeIntervals(active);

    steps.push({
      state: snap({
        sweepX: x, covered: newCovered, eventIdx: ei, phase: 'event',
        message: type === 0 ? `处理左边缘 x=${x}：加入活跃区间 [${y1}, ${y2}]` : `处理右边缘 x=${x}：移除活跃区间 [${y1}, ${y2}]`,
      }),
      description: type === 0 ? `加入 [${y1},${y2}]` : `移除 [${y1},${y2}]`,
      codeLine: type === 0 ? 11 : 12,
    });
  }

  steps.push({
    state: snap({ phase: 'done', message: `扫描完成，矩形面积并 = ${area}` }),
    description: `面积并 = ${area}`,
    codeLine: 15,
  });

  return steps;
}

export function SweepLinePanel() {
  const [rects] = useState<Rect[]>([[1, 1, 4, 4], [2, 3, 6, 6], [4, 2, 7, 5]]);
  const steps = useMemo(() => buildSteps(rects), [rects]);

  const initial: SweepState = {
    rects,
    events: [],
    sweepX: 0,
    active: [],
    strips: [],
    area: 0,
    covered: 0,
    eventIdx: -1,
    phase: 'init',
    message: '',
  };

  return (
    <Stepper<SweepState>
      steps={steps}
      initialState={initial}
      codeLines={sweepCode}
      codeTitle="扫描线 Sweep Line（矩形面积并）"
      render={(state) => (
        <div className="space-y-4">
          <div className="text-xs text-gray-500">
            黄色=扫描线，绿色=已扫过的面积与活跃区间，彩色=原始矩形
          </div>

          <svg viewBox="0 0 420 320" className="w-full max-w-xl mx-auto">
            {/* axes */}
            <line x1={PX(0)} y1={PY(0)} x2={PX(8)} y2={PY(0)} style={{ stroke: 'var(--edge-2)' }} strokeWidth="1" />
            <line x1={PX(0)} y1={PY(0)} x2={PX(0)} y2={PY(7)} style={{ stroke: 'var(--edge-2)' }} strokeWidth="1" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((x) => (
              <text key={`x${x}`} x={PX(x)} y={PY(0) + 14} textAnchor="middle" fontSize="9" style={{ fill: 'var(--ink-3)' }}>{x}</text>
            ))}
            {[1, 2, 3, 4, 5, 6, 7].map((y) => (
              <text key={`y${y}`} x={PX(0) - 8} y={PY(y) + 3} textAnchor="end" fontSize="9" style={{ fill: 'var(--ink-3)' }}>{y}</text>
            ))}

            {/* swept area strips */}
            {state.strips.map((strip, si) =>
              strip.intervals.map(([y1, y2], ii) => (
                <rect
                  key={`${si}-${ii}`}
                  x={PX(strip.x1)}
                  y={PY(y2)}
                  width={PX(strip.x2) - PX(strip.x1)}
                  height={PY(y1) - PY(y2)}
                  fill="rgba(74,222,128,0.28)"
                />
              )),
            )}

            {/* original rectangles */}
            {state.rects.map(([x1, y1, x2, y2], i) => (
              <rect
                key={i}
                x={PX(x1)}
                y={PY(y2)}
                width={PX(x2) - PX(x1)}
                height={PY(y1) - PY(y2)}
                fill={RECT_COLORS[i % RECT_COLORS.length].fill}
                stroke={RECT_COLORS[i % RECT_COLORS.length].stroke}
                strokeWidth="1.5"
              />
            ))}

            {/* active intervals on sweep line */}
            {state.active.map(([y1, y2], i) => (
              <line
                key={`act${i}`}
                x1={PX(state.sweepX)}
                y1={PY(y1)}
                x2={PX(state.sweepX)}
                y2={PY(y2)}
                stroke="#4ade80"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.9"
              />
            ))}

            {/* sweep line */}
            {state.phase !== 'init' && (
              <line x1={PX(state.sweepX)} y1={PY(0)} x2={PX(state.sweepX)} y2={PY(7)} stroke="#facc15" strokeWidth="1.5" strokeDasharray="4 3" />
            )}
          </svg>

          {/* Event list */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {state.events.map(([x, type, y1, y2], i) => (
              <span
                key={i}
                className={clsx(
                  'px-2 py-1 rounded text-[10px] font-mono border transition-all',
                  i === state.eventIdx
                    ? 'bg-yellow-500/25 border-yellow-400 text-yellow-200'
                    : i < state.eventIdx
                      ? 'bg-surface-2 border-edge-2 text-gray-500'
                      : 'bg-surface-2 border-edge-2 text-gray-300',
                )}
              >
                x={x} {type === 0 ? '入' : '出'} [{y1},{y2}]
              </span>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-sm font-mono">
            <span className="text-gray-400">
              覆盖长度: <span className="text-green-300 font-bold">{state.covered}</span>
            </span>
            <span className="text-gray-400">
              累计面积: <span className="text-green-300 font-bold">{state.area}</span>
            </span>
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
