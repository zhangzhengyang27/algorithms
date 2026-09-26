'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const quickSortCode = [
  'function quickSort(arr, l, r) {',
  '  if (l >= r) return;',
  '  const pivot = arr[r];',
  '  let i = l;',
  '  for (let j = l; j < r; j++) {',
  '    if (arr[j] < pivot) swap(arr, i++, j);',
  '  }',
  '  swap(arr, i, r);',
  '  quickSort(arr, l, i - 1);',
  '  quickSort(arr, i + 1, r);',
  '}',
];

interface QuickState {
  array: number[];
  pivot: number | null;
  i: number;
  j: number;
  range: [number, number] | null;
  sorted: boolean[];
  message: string;
}

export function buildSteps(input: number[]): VizStep<QuickState>[] {
  const steps: VizStep<QuickState>[] = [];
  const arr = [...input];
  const sorted = new Array(arr.length).fill(false);

  const snap = (pivot: number | null, i: number, j: number, range: [number, number] | null, msg: string): QuickState => ({
    array: [...arr], pivot, i, j, range, sorted: [...sorted], message: msg,
  });

  steps.push({ state: snap(null, -1, -1, null, `快速排序：[${arr.join(', ')}]，选末尾为基准(pivot)分区`), description: '初始化', codeLine: 1 });

  function swap(a: number, b: number) {
    [arr[a], arr[b]] = [arr[b], arr[a]];
  }

  function quickSort(l: number, r: number) {
    if (l >= r) {
      if (l === r) {
        sorted[l] = true;
        steps.push({ state: snap(null, -1, -1, [l, r], `区间 [${l},${r}] 仅一个元素 ${arr[l]}，已就位`), description: `定点 [${l}]`, codeLine: 2 });
      }
      return;
    }

    const pivot = arr[r];
    let i = l;
    steps.push({ state: snap(pivot, i, l, [l, r], `分区 [${l},${r}]，基准 pivot = arr[${r}] = ${pivot}`), description: `分区 [${l},${r}]`, codeLine: 3 });

    for (let j = l; j < r; j++) {
      steps.push({ state: snap(pivot, i, j, [l, r], `比较 arr[${j}]=${arr[j]} 与 pivot=${pivot}`), description: `比较 j=${j}`, codeLine: 5 });
      if (arr[j] < pivot) {
        if (i !== j) {
          steps.push({ state: snap(pivot, i, j, [l, r], `${arr[j]} < ${pivot}，交换 arr[${i}] 与 arr[${j}]`), description: `交换 ${i}↔${j}`, codeLine: 6 });
          swap(i, j);
        }
        i++;
      }
    }

    steps.push({ state: snap(pivot, i, r, [l, r], `将 pivot 交换到位置 ${i}，左段全 < pivot，右段全 ≥ pivot`), description: `归位 pivot`, codeLine: 8 });
    swap(i, r);
    sorted[i] = true;

    steps.push({ state: snap(null, -1, -1, [l, r], `pivot ${pivot} 已就位于索引 ${i}`), description: `pivot 就位`, codeLine: 9 });
    quickSort(l, i - 1);
    quickSort(i + 1, r);
  }

  quickSort(0, arr.length - 1);
  for (let k = 0; k < sorted.length; k++) sorted[k] = true;
  steps.push({ state: snap(null, -1, -1, null, `✅ 排序完成：[${arr.join(', ')}]`), description: '排序完成', codeLine: 10 });
  return steps;
}

export function QuickSortPanel() {
  const [seed, setSeed] = useState<number[]>([64, 34, 25, 12, 22, 11, 90, 8]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: QuickState = { array: [...seed], pivot: null, i: -1, j: -1, range: null, sorted: new Array(seed.length).fill(false), message: '' };

  return (
    <Stepper<QuickState>
      steps={steps}
      initialState={initial}
      codeLines={quickSortCode}
      codeTitle="快速排序 Quick Sort"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const p = e.target.value.split(',').map((s) => Number(s.trim())).filter(Number.isFinite).slice(0, 20);
              if (p.length >= 2) setSeed(p);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="逗号分隔，最多 20 个"
          />
        </>
      }
      render={(state) => {
        // 按当前数组的 [min, max] 归一化柱高，防止负数 / 极大值撑爆布局
        const values = state.array;
        const lo = Math.min(...values);
        const hi = Math.max(...values);
        const span = hi - lo || 1;
        const MAX_BAR = 120;
        const barHeight = (v: number) => 20 + ((v - lo) / span) * (MAX_BAR - 20);
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">红色=pivot，紫色=i 指针，黄色=j 比较，绿色=已就位</div>
            <div className="flex gap-1.5 flex-wrap justify-center min-h-20 items-end">
              {state.array.map((v, idx) => {
                const isPivot = state.pivot !== null && idx === state.range?.[1] && v === state.pivot;
                const isI = idx === state.i;
                const isJ = idx === state.j;
                const isSorted = state.sorted[idx];
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={clsx(
                        'w-10 flex items-center justify-center rounded-t text-xs font-mono border transition-all',
                        isPivot ? 'bg-red-500/30 border-red-400 text-red-200'
                          : isJ ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200'
                            : isI ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                              : isSorted ? 'bg-green-500/20 border-green-500/60 text-green-300'
                                : 'bg-surface-2 border-edge-2 text-gray-400',
                      )}
                      style={{ height: `${barHeight(v)}px` }}
                    >
                      {v}
                    </div>
                    <div className="text-[9px] text-gray-600">{idx}</div>
                  </div>
                );
              })}
            </div>
            {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
          </div>
        );
      }}
    />
  );
}
