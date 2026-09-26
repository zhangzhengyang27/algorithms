'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const mergeSortCode = [
  'function mergeSort(arr, l, r) {',
  '  if (l >= r) return;',
  '  const mid = Math.floor((l + r) / 2);',
  '  mergeSort(arr, l, mid);',
  '  mergeSort(arr, mid + 1, r);',
  '  const left = arr.slice(l, mid + 1);',
  '  const right = arr.slice(mid + 1, r + 1);',
  '  let i = 0, j = 0, k = l;',
  '  while (i < left.length && j < right.length) {',
  '    arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];',
  '  }',
  '  while (i < left.length) arr[k++] = left[i++];',
  '  while (j < right.length) arr[k++] = right[j++];',
  '}',
];

interface MergeState {
  array: number[];
  activeRange: [number, number] | null;
  comparing: [number, number] | null;
  merged: number[];
  phase: 'split' | 'merge';
  depth: number;
  message: string;
}

function buildSteps(input: number[]): VizStep<MergeState>[] {
  const steps: VizStep<MergeState>[] = [];
  const arr = [...input];

  const snap = (range: [number, number] | null, comparing: [number, number] | null, phase: 'split' | 'merge', depth: number, msg: string): MergeState => ({
    array: [...arr], activeRange: range, comparing, merged: [], phase, depth, message: msg,
  });

  steps.push({ state: snap(null, null, 'split', 0, `归并排序：[${arr.join(', ')}]，分治策略`), description: '初始化', codeLine: 1 });

  function mergeSort(l: number, r: number, depth: number) {
    if (l >= r) {
      steps.push({ state: snap([l, r], null, 'split', depth, `区间 [${l},${r}] 只有一个元素 ${arr[l]}，无需分割`), description: `叶子 [${l}]`, codeLine: 2 });
      return;
    }

    const mid = Math.floor((l + r) / 2);
    steps.push({ state: snap([l, r], null, 'split', depth, `分割 [${l},${r}] → 左 [${l},${mid}] + 右 [${mid + 1},${r}]`), description: `分割 [${l},${r}]`, codeLine: 3 });

    mergeSort(l, mid, depth + 1);
    mergeSort(mid + 1, r, depth + 1);

    // Merge
    const left = arr.slice(l, mid + 1);
    const right = arr.slice(mid + 1, r + 1);
    let i = 0, j = 0, k = l;

    steps.push({ state: snap([l, r], null, 'merge', depth, `合并 [${l},${mid}] 和 [${mid + 1},${r}]：[${left.join(',')}] + [${right.join(',')}]`), description: `合并 [${l},${r}]`, codeLine: 8 });

    while (i < left.length && j < right.length) {
      steps.push({ state: snap([l, r], [l + i, mid + 1 + j], 'merge', depth, `比较 ${left[i]} 和 ${right[j]}`), description: `${left[i]} vs ${right[j]}`, codeLine: 10 });
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      k++;
    }
    while (i < left.length) { arr[k] = left[i]; i++; k++; }
    while (j < right.length) { arr[k] = right[j]; j++; k++; }

    steps.push({ state: snap([l, r], null, 'merge', depth, `合并完成：[${arr.slice(l, r + 1).join(', ')}]`), description: `合并完成 [${l},${r}]`, codeLine: 13 });
  }

  mergeSort(0, arr.length - 1, 0);
  steps.push({ state: snap(null, null, 'merge', 0, `✅ 排序完成：[${arr.join(', ')}]`), description: '排序完成', codeLine: 14 });
  return steps;
}

export function MergeSortPanel() {
  const [seed, setSeed] = useState<number[]>([38, 27, 43, 3, 9, 82, 10]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: MergeState = { array: [...seed], activeRange: null, comparing: null, merged: [], phase: 'split', depth: 0, message: '' };

  return (
    <Stepper<MergeState>
      steps={steps}
      initialState={initial}
      codeLines={mergeSortCode}
      codeTitle="归并排序 Merge Sort"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input type="text" value={seed.join(',')} onChange={(e) => { const p = e.target.value.split(',').map((s) => Number(s.trim())).filter(Number.isFinite); if (p.length >= 2) setSeed(p); }} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56" placeholder="逗号分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">蓝色=当前操作区间，黄色=正在比较，绿色=已归位</div>

          <div className="flex gap-1.5 flex-wrap justify-center min-h-[80px] items-end">
            {state.array.map((v, i) => {
              const inRange = state.activeRange !== null && i >= state.activeRange[0] && i <= state.activeRange[1];
              const isComparing = state.comparing !== null && (i === state.comparing[0] || i === state.comparing[1]);
              const barHeight = Math.max(20, v * 3);
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx('w-10 flex items-center justify-center rounded-t text-xs font-mono border transition-all', isComparing ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200' : inRange ? 'bg-blue-500/20 border-blue-500/60 text-blue-200' : 'bg-surface-2 border-edge-2 text-gray-400')}
                    style={{ height: `${barHeight}px` }}
                  >
                    {v}
                  </div>
                  <div className="text-[9px] text-gray-600">{i}</div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs">
            <span className={clsx('px-2 py-0.5 rounded', state.phase === 'split' ? 'bg-blue-500/20 text-blue-300' : 'bg-surface-2 text-gray-500')}>分割</span>
            <span className={clsx('px-2 py-0.5 rounded', state.phase === 'merge' ? 'bg-green-500/20 text-green-300' : 'bg-surface-2 text-gray-500')}>合并</span>
            <span className="text-gray-500">深度: {state.depth}</span>
          </div>

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
