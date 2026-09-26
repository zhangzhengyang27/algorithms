'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const heapCode = [
  'class MaxHeap {',
  '  insert(val) {',
  '    this.heap.push(val);',
  '    this.siftUp(this.heap.length - 1);',
  '  }',
  '  siftUp(i) {',
  '    while (i > 0) {',
  '      const parent = Math.floor((i - 1) / 2);',
  '      if (this.heap[i] <= this.heap[parent]) break;',
  '      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];',
  '      i = parent;',
  '    }',
  '  }',
  '  extractMax() {',
  '    const max = this.heap[0];',
  '    this.heap[0] = this.heap.pop();',
  '    this.siftDown(0);',
  '    return max;',
  '  }',
  '}',
];

interface HeapState {
  heap: number[];
  highlightIndices: number[];
  swapIndices: [number, number] | null;
  message: string;
}

export function buildSteps(values: number[]): VizStep<HeapState>[] {
  const steps: VizStep<HeapState>[] = [];
  const heap: number[] = [];

  steps.push({
    state: { heap: [], highlightIndices: [], swapIndices: null, message: '初始化空最大堆' },
    description: '初始化空堆',
    codeLine: 1,
  });

  // Insert phase - sift up
  for (const v of values) {
    heap.push(v);
    const insertIdx = heap.length - 1;
    steps.push({
      state: { heap: [...heap], highlightIndices: [insertIdx], swapIndices: null, message: `插入 ${v} 到末尾 (index=${insertIdx})` },
      description: `插入 ${v}，开始上浮`,
      codeLine: 3,
    });

    let i = insertIdx;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[i] > heap[parent]) {
        steps.push({
          state: { heap: [...heap], highlightIndices: [i, parent], swapIndices: [i, parent], message: `${heap[i]} > ${heap[parent]}（父），交换上浮` },
          description: `比较 ${heap[i]} 与父节点 ${heap[parent]}，交换`,
          codeLine: 10,
        });
        [heap[i], heap[parent]] = [heap[parent], heap[i]];
        steps.push({
          state: { heap: [...heap], highlightIndices: [parent], swapIndices: null, message: `交换后 ${v} 上浮到 index=${parent}` },
          description: `${v} 上浮到 index=${parent}`,
          codeLine: 11,
        });
        i = parent;
      } else {
        steps.push({
          state: { heap: [...heap], highlightIndices: [i, parent], swapIndices: null, message: `${heap[i]} ≤ ${heap[parent]}（父），停止上浮` },
          description: `${heap[i]} ≤ 父节点 ${heap[parent]}，堆序满足`,
          codeLine: 9,
        });
        break;
      }
    }
  }

  // Extract max phase - sift down
  steps.push({
    state: { heap: [...heap], highlightIndices: [0], swapIndices: null, message: '开始提取最大值（堆顶）' },
    description: '提取最大值',
    codeLine: 14,
  });

  while (heap.length > 1) {
    const max = heap[0];
    heap[0] = heap[heap.length - 1];
    heap.pop();
    steps.push({
      state: { heap: [...heap], highlightIndices: [0], swapIndices: null, message: `取出 ${max}，末尾元素 ${heap[0]} 放到堆顶` },
      description: `取出最大值 ${max}，末尾放到堆顶`,
      codeLine: 16,
    });

    let i = 0;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let largest = i;
      if (left < heap.length && heap[left] > heap[largest]) largest = left;
      if (right < heap.length && heap[right] > heap[largest]) largest = right;
      if (largest === i) {
        steps.push({
          state: { heap: [...heap], highlightIndices: [i], swapIndices: null, message: i === 0 ? `堆顶 ${heap[i]} 已满足堆序，下沉结束` : `下标 ${i} 的 ${heap[i]} 已满足堆序，下沉结束` },
          description: '下沉结束，堆序恢复',
          codeLine: 17,
        });
        break;
      }
      steps.push({
        state: { heap: [...heap], highlightIndices: [i, largest], swapIndices: [i, largest], message: `${heap[i]} < ${heap[largest]}（子），交换下沉` },
        description: `比较后与子节点 ${heap[largest]} 交换`,
        codeLine: 10,
      });
      [heap[i], heap[largest]] = [heap[largest], heap[i]];
      steps.push({
        state: { heap: [...heap], highlightIndices: [largest], swapIndices: null, message: `下沉到 index=${largest}` },
        description: `下沉到 index=${largest}`,
        codeLine: 11,
      });
      i = largest;
    }
  }

  if (heap.length === 1) {
    steps.push({
      state: { heap: [...heap], highlightIndices: [0], swapIndices: null, message: `取出最后一个元素 ${heap[0]}` },
      description: `取出最后一个元素 ${heap[0]}`,
      codeLine: 18,
    });
  }

  return steps;
}

export function HeapPanel() {
  const [seed, setSeed] = useState<number[]>([4, 10, 3, 5, 1, 8, 7]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: HeapState = { heap: [], highlightIndices: [], swapIndices: null, message: '' };

  return (
    <Stepper<HeapState>
      steps={steps}
      initialState={initial}
      codeLines={heapCode}
      codeTitle="堆 Heap"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数据:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value
                .split(',')
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n));
              if (parsed.length >= 1) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="逗号分隔"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500 mb-2">
            最大堆（高亮黄色，交换红色）
          </div>

          {/* Tree view */}
          <div className="min-h-[160px] flex flex-col items-center justify-center gap-1">
            {state.heap.length === 0 && (
              <div className="text-gray-600 text-sm py-8">空堆</div>
            )}
            {(() => {
              const levels: number[][] = [];
              let start = 0;
              let size = 1;
              while (start < state.heap.length) {
                levels.push(state.heap.slice(start, start + size));
                start += size;
                size *= 2;
              }
              return levels.map((level, li) => (
                <div key={li} className="flex items-center justify-center gap-2">
                  {level.map((v, ni) => {
                    const idx = (2 ** li - 1) + ni;
                    const isHighlight = state.highlightIndices.includes(idx);
                    const isSwap = state.swapIndices !== null &&
                      (state.swapIndices[0] === idx || state.swapIndices[1] === idx);
                    return (
                      <div
                        key={idx}
                        className={clsx(
                          'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all border',
                          isSwap
                            ? 'bg-red-500/30 border-red-400 text-red-200'
                            : isHighlight
                              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200'
                              : 'bg-surface-2 border-edge-2 text-gray-300',
                        )}
                      >
                        {v}
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>

          {/* Array view */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <span className="text-xs text-gray-500 mr-2">数组:</span>
            {state.heap.map((v, i) => (
              <span
                key={i}
                className={clsx(
                  'px-2 py-1 rounded text-xs font-mono',
                  state.highlightIndices.includes(i)
                    ? 'bg-yellow-500/20 text-yellow-200'
                    : 'bg-surface-2 text-gray-400',
                )}
              >
                {v}
              </span>
            ))}
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
