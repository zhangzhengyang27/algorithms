'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const topKCode = [
  'function topK(nums, k) {',
  '  const heap = []; // 小顶堆，维护 k 个最大元素',
  '  const siftUp = (i) => {',
  '    while (i > 0 && heap[(i-1)>>1] > heap[i]) {',
  '      [heap[(i-1)>>1], heap[i]] = [heap[i], heap[(i-1)>>1]];',
  '      i = (i - 1) >> 1;',
  '    }',
  '  };',
  '  const siftDown = (i) => {',
  '    const n = heap.length;',
  '    while (2*i+1 < n) {',
  '      let c = 2*i+1;',
  '      if (c+1 < n && heap[c+1] < heap[c]) c++;',
  '      if (heap[i] <= heap[c]) break;',
  '      [heap[i], heap[c]] = [heap[c], heap[i]];',
  '      i = c;',
  '    }',
  '  };',
  '  for (const x of nums) {',
  '    if (heap.length < k) {',
  '      heap.push(x); siftUp(heap.length - 1);',
  '    } else if (x > heap[0]) {',
  '      heap[0] = x; siftDown(0);',
  '    }',
  '  }',
  '  return heap.sort((a, b) => b - a);',
  '}',
];

interface PQState {
  heap: number[];
  k: number;
  streamIdx: number;
  currentVal: number | null;
  action: 'push' | 'replace' | 'skip' | 'none';
  swapPair: [number, number] | null;
  message: string;
  result: number[] | null;
}

function buildSteps(nums: number[], k: number): VizStep<PQState>[] {
  const steps: VizStep<PQState>[] = [];
  const heap: number[] = [];

  const siftUp = (start: number) => {
    let i = start;
    while (i > 0 && heap[(i - 1) >> 1] > heap[i]) {
      const p = (i - 1) >> 1;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      steps.push({
        state: { heap: [...heap], k, streamIdx: -1, currentVal: null, action: 'push', swapPair: [p, i], message: `siftUp: heap[${p}]=${heap[p]} 与 heap[${i}]=${heap[i]} 交换，上浮`, result: null },
        description: `上浮 ${i}→${p}`,
        codeLine: 4,
      });
      i = p;
    }
  };

  const siftDown = (start: number) => {
    let i = start;
    const n = heap.length;
    while (2 * i + 1 < n) {
      let c = 2 * i + 1;
      if (c + 1 < n && heap[c + 1] < heap[c]) c++;
      if (heap[i] <= heap[c]) break;
      [heap[i], heap[c]] = [heap[c], heap[i]];
      steps.push({
        state: { heap: [...heap], k, streamIdx: -1, currentVal: null, action: 'replace', swapPair: [i, c], message: `siftDown: heap[${i}]=${heap[i]} 与 heap[${c}]=${heap[c]} 交换，下沉`, result: null },
        description: `下沉 ${i}→${c}`,
        codeLine: 14,
      });
      i = c;
    }
  };

  steps.push({
    state: { heap: [], k, streamIdx: -1, currentVal: null, action: 'none', swapPair: null, message: `目标：从数据流中找出最大的 ${k} 个元素，用小顶堆维护（堆顶是 K 个候选中的最小值）`, result: null },
    description: '初始化',
    codeLine: 1,
  });

  for (let idx = 0; idx < nums.length; idx++) {
    const x = nums[idx];
    if (heap.length < k) {
      steps.push({
        state: { heap: [...heap], k, streamIdx: idx, currentVal: x, action: 'push', swapPair: null, message: `x=${x}，堆大小 ${heap.length} < k=${k}，直接入堆`, result: null },
        description: `读入 ${x} → 入堆`,
        codeLine: 20,
      });
      heap.push(x);
      siftUp(heap.length - 1);
      steps.push({
        state: { heap: [...heap], k, streamIdx: idx, currentVal: x, action: 'push', swapPair: null, message: `插入完成，堆: [${heap.join(', ')}]，堆顶=${heap[0]}`, result: null },
        description: `堆=[${heap.join(',')}]`,
        codeLine: 20,
      });
    } else if (x > heap[0]) {
      steps.push({
        state: { heap: [...heap], k, streamIdx: idx, currentVal: x, action: 'replace', swapPair: null, message: `x=${x} > 堆顶 ${heap[0]}，替换堆顶（淘汰当前最小候选）`, result: null },
        description: `${x} > 堆顶${heap[0]} 替换`,
        codeLine: 21,
      });
      heap[0] = x;
      steps.push({
        state: { heap: [...heap], k, streamIdx: idx, currentVal: x, action: 'replace', swapPair: null, message: `堆顶替换为 ${x}，执行 siftDown 恢复堆性质`, result: null },
        description: '替换堆顶',
        codeLine: 22,
      });
      siftDown(0);
      steps.push({
        state: { heap: [...heap], k, streamIdx: idx, currentVal: x, action: 'replace', swapPair: null, message: `调整完成，堆: [${heap.join(', ')}]，堆顶=${heap[0]}`, result: null },
        description: `堆=[${heap.join(',')}]`,
        codeLine: 22,
      });
    } else {
      steps.push({
        state: { heap: [...heap], k, streamIdx: idx, currentVal: x, action: 'skip', swapPair: null, message: `x=${x} ≤ 堆顶 ${heap[0]}，不可能进入 Top${k}，跳过`, result: null },
        description: `${x} ≤ 堆顶 跳过`,
        codeLine: 23,
      });
    }
  }

  const result = [...heap].sort((a, b) => b - a);
  steps.push({
    state: { heap: [...heap], k, streamIdx: -1, currentVal: null, action: 'none', swapPair: null, message: `遍历结束，堆中 ${k} 个元素即为最大的 ${k} 个：[${result.join(', ')}]`, result },
    description: `TopK = [${result.join(',')}]`,
    codeLine: 25,
  });

  return steps;
}

export function PriorityQueueAdvancedPanel() {
  const [numsText, setNumsText] = useState('3, 9, 1, 7, 5, 8, 2, 6, 4, 10');
  const [k, setK] = useState(3);

  const nums = useMemo(
    () => numsText.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)),
    [numsText],
  );

  const steps = useMemo(() => buildSteps(nums, Math.min(k, Math.max(1, nums.length))), [nums, k]);

  const initial: PQState = {
    heap: [],
    k,
    streamIdx: -1,
    currentVal: null,
    action: 'none',
    swapPair: null,
    message: '',
    result: null,
  };

  return (
    <Stepper<PQState>
      steps={steps}
      initialState={initial}
      codeLines={topKCode}
      codeTitle="TopK 小顶堆 Min-Heap TopK"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数据流:</span>
          <input
            type="text"
            value={numsText}
            onChange={(e) => setNumsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">K:</span>
          <input
            type="number"
            value={k}
            min={1}
            max={8}
            onChange={(e) => setK(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            绿色=入堆/替换，红色=跳过，黄色=正在交换的节点，蓝色=堆顶（K个候选中的最小值）
          </div>

          {/* Data stream */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">数据流 nums[]:</div>
            <div className="flex gap-1 flex-wrap">
              {nums.map((v, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-9 h-9 flex items-center justify-center rounded text-sm font-mono border transition-all',
                    i === state.streamIdx
                      ? state.action === 'skip'
                        ? 'bg-red-500/30 border-red-400 text-red-200 scale-110'
                        : 'bg-green-500/30 border-green-400 text-green-200 scale-110'
                      : i < state.streamIdx
                        ? 'bg-surface-2 border-edge-2 text-ink-3'
                        : 'bg-surface-2 border-edge-2 text-ink-2',
                  )}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Heap tree visualization */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">小顶堆 (数组视角):</div>
            {state.heap.length === 0 ? (
              <div className="text-sm text-gray-600 py-4 text-center">堆为空</div>
            ) : (
              <div className="space-y-2">
                {/* Render heap as tree levels */}
                {(() => {
                  const levels: number[][] = [];
                  let start = 0;
                  let count = 1;
                  while (start < state.heap.length) {
                    levels.push(state.heap.slice(start, start + count));
                    start += count;
                    count *= 2;
                  }
                  return levels.map((level, li) => (
                    <div key={li} className="flex justify-center gap-2">
                      {level.map((v, j) => {
                        const idx = (1 << li) - 1 + j;
                        const isSwapping = state.swapPair !== null && (state.swapPair[0] === idx || state.swapPair[1] === idx);
                        const isTop = idx === 0;
                        return (
                          <div
                            key={idx}
                            className={clsx(
                              'w-10 h-10 flex items-center justify-center rounded-full text-sm font-mono border-2 transition-all',
                              isSwapping
                                ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                                : isTop
                                  ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                                  : 'bg-surface-2 border-edge-2 text-ink-2',
                            )}
                          >
                            {v}
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}
                <div className="text-center text-xs text-gray-500 font-mono">
                  heap = [{state.heap.join(', ')}] {state.heap.length > 0 && <span className="text-blue-400">堆顶={state.heap[0]}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          {state.result && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                Top{state.k} 最大元素: [{state.result.join(', ')}]
              </span>
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
