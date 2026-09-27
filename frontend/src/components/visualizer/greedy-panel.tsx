'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const greedyCode = [
  'function intervalScheduling(intervals) {',
  '  intervals.sort((a, b) => a.end - b.end);',
  '  const selected = [];',
  '  let lastEnd = -Infinity;',
  '  for (const {start, end} of intervals) {',
  '    if (start >= lastEnd) {',
  '      selected.push({start, end});',
  '      lastEnd = end;',
  '    }',
  '  }',
  '  return selected;',
  '}',
];

interface Interval {
  start: number;
  end: number;
}

interface GreedyState {
  intervals: Interval[];
  sorted: Interval[];
  selected: number[];
  current: number;
  lastEnd: number;
  message: string;
}

export function buildSteps(intervals: Interval[]): VizStep<GreedyState>[] {
  const steps: VizStep<GreedyState>[] = [];
  const sorted = [...intervals].sort((a, b) => a.end - b.end);

  steps.push({
    state: { intervals, sorted, selected: [], current: -1, lastEnd: -Infinity, message: `区间调度问题：${intervals.length} 个活动，按结束时间排序后贪心选取` },
    description: '初始化',
    codeLine: 1,
  });

  steps.push({
    state: { intervals, sorted, selected: [], current: -1, lastEnd: -Infinity, message: `按结束时间排序：${sorted.map((s) => `[${s.start},${s.end}]`).join(' ')}` },
    description: '按结束时间排序',
    codeLine: 2,
  });

  const selected: number[] = [];
  let lastEnd = -Infinity;

  for (let i = 0; i < sorted.length; i++) {
    const { start, end } = sorted[i];

    if (start >= lastEnd) {
      selected.push(i);
      lastEnd = end;
      steps.push({
        state: { intervals, sorted, selected: [...selected], current: i, lastEnd, message: `✅ 选取 [${start},${end}]：开始时间 ${start} ≥ 上次结束 ${lastEnd === end ? sorted[selected[selected.length - 2] ?? 0]?.end ?? '-∞' : lastEnd}，兼容` },
        description: `选取 [${start},${end}]`,
        codeLine: 7,
      });
    } else {
      steps.push({
        state: { intervals, sorted, selected: [...selected], current: i, lastEnd, message: `❌ 跳过 [${start},${end}]：开始时间 ${start} < 上次结束 ${lastEnd}，冲突` },
        description: `跳过 [${start},${end}]`,
        codeLine: 6,
      });
    }
  }

  steps.push({
    state: { intervals, sorted, selected: [...selected], current: -1, lastEnd, message: `✅ 完成！最多可选 ${selected.length} 个不重叠活动：${selected.map((i) => `[${sorted[i].start},${sorted[i].end}]`).join(' ')}` },
    description: `结果：${selected.length} 个活动`,
    codeLine: 11,
  });

  return steps;
}

export function GreedyPanel() {
  const [intervalsText, setIntervalsText] = useState('1,3 2,5 3,7 4,8 5,9 6,10 8,11');

  const intervals = useMemo<Interval[]>(() => {
    return intervalsText
      .split(/\s+/)
      .map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 2 && p.every(Number.isFinite))
      .map(([start, end]) => ({ start, end }));
  }, [intervalsText]);

  const steps = useMemo(() => buildSteps(intervals), [intervals]);
  const initial: GreedyState = {
    intervals,
    sorted: [...intervals].sort((a, b) => a.end - b.end),
    selected: [],
    current: -1,
    lastEnd: -Infinity,
    message: '',
  };

  const maxTime = useMemo(() => {
    return Math.max(...intervals.map((i) => i.end), 12);
  }, [intervals]);

  return (
    <Stepper<GreedyState>
      steps={steps}
      initialState={initial}
      codeLines={greedyCode}
      codeTitle="贪心区间调度 Greedy"
      headerActions={
        <>
          <span className="text-sm text-gray-400">区间(start,end):</span>
          <input
            type="text"
            value={intervalsText}
            onChange={(e) => setIntervalsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-72"
            placeholder="空格分隔，如 1,3 2,5 4,7"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            绿色=已选取，红色=冲突跳过，黄色=当前判断，按结束时间排序
          </div>

          {/* Timeline view */}
          <div className="space-y-2 min-h-[160px]">
            {/* Time axis */}
            <div className="flex items-center gap-0 ml-20">
              {Array.from({ length: maxTime + 1 }, (_, t) => (
                <div key={t} className="flex-1 text-center text-[9px] text-gray-600 font-mono">
                  {t}
                </div>
              ))}
            </div>

            {state.sorted.map((interval, i) => {
              const isSelected = state.selected.includes(i);
              const isCurrent = i === state.current;
              const isSkipped = isCurrent && !isSelected;
              const left = (interval.start / maxTime) * 100;
              const width = ((interval.end - interval.start) / maxTime) * 100;

              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-mono w-16 text-right">
                    [{interval.start},{interval.end}]
                  </span>
                  <div className="flex-1 relative h-6 bg-bg rounded">
                    <div
                      className={clsx(
                        'absolute top-0.5 bottom-0.5 rounded transition-all flex items-center justify-center text-[9px] font-mono',
                        isSelected
                          ? 'bg-green-500/40 border border-green-400 text-green-200'
                          : isSkipped
                            ? 'bg-red-500/30 border border-red-400 text-red-300'
                            : isCurrent
                              ? 'bg-yellow-500/30 border border-yellow-400 text-yellow-200'
                              : 'bg-surface-2 border border-edge-2 text-gray-500',
                      )}
                      style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                    >
                      {isSelected ? '✓' : isSkipped ? '✗' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-green-300">已选: {state.selected.length}</div>
            <div className="text-gray-400">总计: {state.sorted.length}</div>
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
