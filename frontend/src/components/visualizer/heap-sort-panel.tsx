'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const heapSortCode = [
  'function heapSort(arr) {',
  '  for (let i = n/2-1; i >= 0; i--) heapify(n, i);',
  '  for (let end = n-1; end > 0; end--) {',
  '    swap(0, end);',
  '    heapify(end, 0);',
  '  }',
  '}',
  'function heapify(size, root) {',
  '  let largest = root;',
  '  const l = 2*root+1, r = 2*root+2;',
  '  if (l < size && arr[l] > arr[largest]) largest = l;',
  '  if (r < size && arr[r] > arr[largest]) largest = r;',
  '  if (largest !== root) { swap(root, largest); heapify(size, largest); }',
  '}',
];

interface HeapState {
  array: number[];
  comparing: number[];
  root: number;
  heapSize: number;
  sortedBoundary: number;
  message: string;
}

function buildSteps(input: number[]): VizStep<HeapState>[] {
  const steps: VizStep<HeapState>[] = [];
  const arr = [...input];
  const n = arr.length;

  const snap = (comparing: number[], root: number, heapSize: number, msg: string): HeapState => ({
    array: [...arr], comparing: [...comparing], root, heapSize, sortedBoundary: n - heapSize, message: msg,
  });

  steps.push({ state: snap([], -1, n, `堆排序：先建大顶堆，再反复将堆顶与末尾交换`), description: '初始化', codeLine: 1 });

  function heapify(size: number, root: number) {
    let largest = root;
    const l = 2 * root + 1;
    const r = 2 * root + 2;
    if (l < size) {
      steps.push({ state: snap([root, l], root, size, `heapify(${root})：比较根 ${arr[root]} 与左子 ${arr[l]}`), description: `比较 ${root}↔${l}`, codeLine: 10 });
      if (arr[l] > arr[largest]) largest = l;
    }
    if (r < size) {
      steps.push({ state: snap([largest, r], root, size, `heapify(${root})：比较 ${arr[largest]} 与右子 ${arr[r]}`), description: `比较 ${largest}↔${r}`, codeLine: 11 });
      if (arr[r] > arr[largest]) largest = r;
    }
    if (largest !== root) {
      const tmp = arr[root]; arr[root] = arr[largest]; arr[largest] = tmp;
      steps.push({ state: snap([root, largest], -1, size, `交换 ${tmp} ↔ ${arr[root]}，下沉递归`), description: `交换 ${root}↔${largest}`, codeLine: 12 });
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({ state: snap([i], i, n, `建堆：自底向上 heapify 节点 ${i}`), description: `建堆 ${i}`, codeLine: 2 });
    heapify(n, i);
  }

  for (let end = n - 1; end > 0; end--) {
    const top = arr[0];
    arr[0] = arr[end]; arr[end] = top;
    steps.push({ state: snap([0, end], -1, end + 1, `将堆顶 ${top} 交换到末尾位置 ${end}，已就位`), description: `交换顶↔${end}`, codeLine: 4 });
    steps.push({ state: snap([0], -1, end, `对剩余 ${end} 个元素重新 heapify`), description: `下滤`, codeLine: 5 });
    heapify(end, 0);
  }

  steps.push({ state: snap([], -1, 0, `✅ 排序完成：[${arr.join(', ')}]`), description: '排序完成', codeLine: 6 });
  return steps;
}

export function HeapSortPanel() {
  const [seed, setSeed] = useState<number[]>([64, 34, 25, 12, 22, 11, 90, 8]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: HeapState = { array: [...seed], comparing: [], root: -1, heapSize: seed.length, sortedBoundary: 0, message: '' };

  return (
    <Stepper<HeapState>
      steps={steps}
      initialState={initial}
      codeLines={heapSortCode}
      codeTitle="堆排序 Heap Sort"
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
            <div className="text-xs text-gray-500">黄色=比较节点，绿色=已排序就位（右侧），蓝色=当前堆区</div>
            <div className="flex gap-1.5 flex-wrap justify-center min-h-20 items-end">
              {state.array.map((v, idx) => {
                const isSorted = idx >= state.sortedBoundary && state.heapSize < state.array.length;
                const inHeap = idx < state.heapSize;
                const isComparing = state.comparing.includes(idx);
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={clsx(
                        'w-10 flex items-center justify-center rounded-t text-xs font-mono border transition-all',
                        isComparing ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200'
                          : isSorted ? 'bg-green-500/20 border-green-500/60 text-green-300'
                            : inHeap ? 'bg-blue-500/15 border-blue-500/40 text-blue-200'
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
