'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const shellSortCode = [
  'function shellSort(arr) {',
  '  const n = arr.length;',
  '  for (let gap = n >> 1; gap > 0; gap >>= 1) {',
  '    for (let i = gap; i < n; i++) {',
  '      const temp = arr[i];',
  '      let j = i;',
  '      while (j >= gap && arr[j - gap] > temp) {',
  '        arr[j] = arr[j - gap];',
  '        j -= gap;',
  '      }',
  '      arr[j] = temp;',
  '    }',
  '  }',
  '  return arr;',
  '}',
];

interface ShellSortState {
  arr: number[];
  gap: number;
  i: number;
  j: number;
  compare: number;
  temp: number | null;
  phase: 'init' | 'gap' | 'compare' | 'shift' | 'place' | 'done';
  message: string;
}

export function buildSteps(input: number[]): VizStep<ShellSortState>[] {
  const arr = [...input];
  const n = arr.length;
  const steps: VizStep<ShellSortState>[] = [];
  const snap = (extra: Partial<ShellSortState> & { message: string }): ShellSortState => ({
    arr: [...arr], gap: 0, i: -1, j: -1, compare: -1, temp: null, phase: 'gap', ...extra,
  });

  steps.push({
    state: snap({ phase: 'init', message: `原数组 [${arr.join(', ')}]，增量序列 gap = n/2, n/4, …, 1` }),
    description: '初始化',
    codeLine: 1,
  });

  for (let gap = n >> 1; gap > 0; gap >>= 1) {
    steps.push({
      state: snap({ gap, phase: 'gap', message: `gap = ${gap}：按下标 % ${gap} 分为 ${gap} 组，对每组做插入排序` }),
      description: `gap=${gap}`,
      codeLine: 2,
    });
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap) {
        steps.push({
          state: snap({ gap, i, j, compare: j - gap, temp, phase: 'compare', message: `组内比较：arr[${j - gap}]=${arr[j - gap]} 与 temp=${temp}` }),
          description: `${arr[j - gap]}/${temp}`,
          codeLine: 6,
        });
        if (arr[j - gap] > temp) {
          arr[j] = arr[j - gap];
          steps.push({
            state: snap({ gap, i, j, compare: -1, temp, phase: 'shift', message: `arr[${j - gap}] > temp，向后移动：arr[${j}] = ${arr[j]}` }),
            description: '后移',
            codeLine: 7,
          });
          j -= gap;
        } else {
          break;
        }
      }
      arr[j] = temp;
      steps.push({
        state: snap({ gap, i, j, compare: -1, temp, phase: 'place', message: j === i ? `temp=${temp} 无需移动，放回 arr[${j}]` : `temp=${temp} 插入到 arr[${j}]` }),
        description: `放${temp}`,
        codeLine: 10,
      });
    }
  }

  steps.push({
    state: snap({ phase: 'done', message: `排序完成：[${arr.join(', ')}]` }),
    description: '完成',
    codeLine: 13,
  });
  return steps;
}

const GROUP_COLORS = [
  'border-blue-500/70 text-blue-200 bg-blue-500/10',
  'border-green-500/70 text-green-200 bg-green-500/10',
  'border-purple-500/70 text-purple-200 bg-purple-500/10',
  'border-orange-500/70 text-orange-200 bg-orange-500/10',
];

export function ShellSortPanel() {
  const [seed, setSeed] = useState<number[]>([8, 3, 5, 1, 9, 2, 7, 4]);

  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: ShellSortState = {
    arr: [...seed], gap: 0, i: -1, j: -1, compare: -1, temp: null, phase: 'init', message: '',
  };

  return (
    <Stepper<ShellSortState>
      steps={steps}
      initialState={initial}
      codeLines={shellSortCode}
      codeTitle="希尔排序 Shell Sort"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((v) => Number.isFinite(v));
              if (parsed.length >= 2 && parsed.length <= 12) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="逗号分隔"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            颜色=分组（下标 % gap），红框=比较对象，黄框=插入位置 temp
            {state.gap >= 1 && state.phase !== 'done' && <span className="ml-2 text-yellow-300">当前 gap = {state.gap}</span>}
          </div>

          {/* temp display */}
          {state.temp !== null && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-gray-500">暂存 temp =</span>
              <span className="px-2 py-1 rounded bg-yellow-500/25 border border-yellow-400 text-yellow-200">{state.temp}</span>
            </div>
          )}

          {/* Array */}
          <div className="space-y-1">
            <div className="flex gap-1 flex-wrap items-end">
              {state.arr.map((v, idx) => {
                const isDone = state.phase === 'done';
                const group = state.gap >= 1 ? idx % state.gap : -1;
                const isCompare = idx === state.compare;
                const isJ = idx === state.j && (state.phase === 'compare' || state.phase === 'shift' || state.phase === 'place');
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={clsx(
                        'w-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                        isDone
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : group >= 0
                            ? GROUP_COLORS[group % GROUP_COLORS.length]
                            : 'bg-surface-2 border-edge-2 text-gray-300',
                        isCompare && 'ring-2 ring-red-400 scale-105',
                        isJ && !isCompare && 'ring-2 ring-yellow-400 scale-105',
                      )}
                      style={{ height: `${Math.max(28, v * 5)}px` }}
                    >
                      {v}
                    </div>
                    <div className="text-[9px] text-gray-600">{idx}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group legend */}
          {state.gap >= 1 && state.phase !== 'done' && (
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              {Array.from({ length: state.gap }, (_, g) => g).map((g) => (
                <span key={g} className={clsx('px-2 py-0.5 rounded border', GROUP_COLORS[g % GROUP_COLORS.length])}>
                  组{g}: 下标 {state.arr.map((_, idx) => idx).filter((idx) => idx % state.gap === g).join(',')}
                </span>
              ))}
            </div>
          )}

          {state.phase === 'done' && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">排序完成：[{state.arr.join(', ')}]</span>
            </div>
          )}

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
