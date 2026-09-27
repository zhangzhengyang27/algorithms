'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const monotonicQueueCode = [
  'function maxSlidingWindow(nums, k) {',
  '  const deque = [], result = [];',
  '  for (let i = 0; i < nums.length; i++) {',
  '    while (deque.length && deque[0] < i - k + 1) deque.shift();',
  '    while (deque.length && nums[deque.at(-1)] <= nums[i]) deque.pop();',
  '    deque.push(i);',
  '    if (i >= k - 1) result.push(nums[deque[0]]);',
  '  }',
  '  return result;',
  '}',
];

interface MQState {
  nums: number[];
  deque: number[]; // indices in nums
  windowL: number;
  windowR: number;
  k: number;
  current: number;
  results: number[];
  message: string;
}

export function buildSteps(nums: number[], k: number): VizStep<MQState>[] {
  const steps: VizStep<MQState>[] = [];
  const deque: number[] = [];
  const results: number[] = [];

  const snap = (wL: number, wR: number, cur: number, msg: string): MQState => ({
    nums, deque: [...deque], windowL: wL, windowR: wR, k, current: cur, results: [...results], message: msg,
  });

  steps.push({ state: snap(0, -1, -1, `滑动窗口最大值：数组 [${nums.join(', ')}]，窗口大小 k=${k}`), description: '初始化', codeLine: 2 });

  for (let i = 0; i < nums.length; i++) {
    // Remove out-of-window elements from front
    while (deque.length > 0 && deque[0] < i - k + 1) {
      const removed = deque.shift()!;
      steps.push({ state: snap(i - k + 1, i, i, `队首 index=${removed} 超出窗口 [${i - k + 1},${i}]，弹出`), description: `弹出过期 ${removed}`, codeLine: 4 });
    }

    // Remove smaller elements from back
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      const removed = deque.pop()!;
      steps.push({ state: snap(Math.max(0, i - k + 1), i, i, `nums[${removed}]=${nums[removed]} ≤ nums[${i}]=${nums[i]}，从队尾弹出`), description: `弹出 ${nums[removed]}`, codeLine: 5 });
    }

    deque.push(i);
    steps.push({ state: snap(Math.max(0, i - k + 1), i, i, `index=${i} 入队，当前队列 [${deque.map((d) => nums[d]).join(', ')}]`), description: `${nums[i]} 入队`, codeLine: 6 });

    // Window formed
    if (i >= k - 1) {
      results.push(nums[deque[0]]);
      steps.push({ state: snap(i - k + 1, i, i, `窗口 [${i - k + 1},${i}] 最大值 = nums[${deque[0]}] = ${nums[deque[0]]}`), description: `max=${nums[deque[0]]}`, codeLine: 7 });
    }
  }

  steps.push({ state: snap(nums.length - k, nums.length - 1, -1, `✅ 完成！各窗口最大值：[${results.join(', ')}]`), description: '完成', codeLine: 9 });
  return steps;
}

export function MonotonicQueuePanel() {
  const [seed, setSeed] = useState<number[]>([1, 3, -1, -3, 5, 3, 6, 7]);
  const [k, setK] = useState(3);
  const steps = useMemo(() => buildSteps(seed, k), [seed, k]);
  const initial: MQState = { nums: seed, deque: [], windowL: 0, windowR: -1, k, current: -1, results: [], message: '' };

  return (
    <Stepper<MQState>
      steps={steps}
      initialState={initial}
      codeLines={monotonicQueueCode}
      codeTitle="单调队列 Monotonic Queue"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input type="text" value={seed.join(',')} onChange={(e) => { const p = e.target.value.split(',').map((s) => Number(s.trim())).filter(Number.isFinite); if (p.length >= 2) setSeed(p); }} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-52" placeholder="逗号分隔" />
          <span className="text-sm text-gray-400">k:</span>
          <input type="number" value={k} onChange={(e) => setK(Math.max(1, Math.min(seed.length, Number(e.target.value))))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-12" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">蓝色=窗口范围，黄色=当前元素，绿色=队首（窗口最大值）</div>

          {/* Array with window */}
          <div className="flex gap-1 flex-wrap justify-center">
            {state.nums.map((v, i) => {
              const inWindow = i >= state.windowL && i <= state.windowR;
              const isCurrent = i === state.current;
              const isDequeFront = state.deque.length > 0 && state.deque[0] === i;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={clsx('w-10 h-10 flex items-center justify-center rounded text-xs font-mono border-2 transition-all', isCurrent ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105' : isDequeFront ? 'bg-green-500/20 border-green-500 text-green-300' : inWindow ? 'bg-blue-500/10 border-blue-500/50 text-blue-200' : 'bg-bg border-edge text-gray-600')}>{v}</div>
                  <div className="text-[9px] text-gray-600">{i}</div>
                </div>
              );
            })}
          </div>

          {/* Deque */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500">单调递减队列（存索引）:</span>
            <div className="flex gap-1 items-center justify-center min-h-[40px]">
              <span className="text-[10px] text-gray-600">front</span>
              {state.deque.map((idx, i) => (
                <div key={idx} className={clsx('px-2.5 py-1.5 rounded text-xs font-mono border', i === 0 ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-surface-2 border-edge-2 text-gray-400')}>
                  {state.nums[idx]}<span className="text-[9px] text-gray-600 ml-0.5">({idx})</span>
                </div>
              ))}
              <span className="text-[10px] text-gray-600">back</span>
            </div>
          </div>

          {/* Results */}
          {state.results.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-gray-500">结果:</span>
              <span className="font-mono text-sm text-green-300">[{state.results.join(', ')}]</span>
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
