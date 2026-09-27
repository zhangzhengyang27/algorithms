'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const maxSubarrayCode = [
  'let maxSum = -Infinity, curSum = 0;',
  'for (const x of nums) {',
  '  curSum += x;',
  '  if (maxSum < curSum) maxSum = curSum;',
  '  if (curSum < 0) curSum = 0;',
  '}',
  'return maxSum;',
];

interface MaxSubarrayState {
  nums: number[];
  i: number;
  curSum: number;
  maxSum: number;
  range: [number, number] | null;
  message: string;
}

export function buildSteps(nums: number[]): VizStep<MaxSubarrayState>[] {
  const steps: VizStep<MaxSubarrayState>[] = [];
  // 空输入（输入框解析非数字文本时会得到 []）会让循环不进，末帧文案成
  // 「最大子数组和 = -Infinity」。这里按「空集之和为 0」给一帧。
  if (nums.length === 0) {
    return [{
      state: { nums: [], i: -1, curSum: 0, maxSum: 0, range: null, message: '输入为空：请在上方文本框填入逗号分隔的整数' },
      description: '空输入',
      codeLine: 1,
    }];
  }
  let maxSum = -Infinity;
  let curSum = 0;
  let maxStart = 0;
  let curStart = 0;
  let maxEnd = 0;

  const snapshot = (i: number, message: string, codeLine: number): VizStep<MaxSubarrayState> => ({
    state: {
      nums,
      i,
      curSum,
      maxSum,
      range: maxSum === -Infinity ? null : [maxStart, maxEnd],
      message,
    },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, `Kadane 算法：找和最大的连续子数组`, 1));

  nums.forEach((x, i) => {
    curSum += x;
    steps.push(snapshot(i, `加入 ${x}，curSum = ${curSum}`, 3));
    if (maxSum < curSum) {
      maxSum = curSum;
      maxEnd = i;
      maxStart = curStart;
      steps.push(snapshot(i, `刷新 maxSum = ${maxSum}（区间 [${maxStart}, ${maxEnd}]）`, 4));
    }
    if (curSum < 0) {
      curSum = 0;
      curStart = i + 1;
      steps.push(snapshot(i, `curSum < 0，重置为 0，下一段从 ${curStart} 开始`, 5));
    }
  });

  steps.push(snapshot(-1, `最大子数组和 = ${maxSum}`, 7));
  return steps;
}

function render(state: MaxSubarrayState) {
  const { nums, i, curSum, maxSum, range, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {nums.map((v, idx) => {
          const inRange = range && idx >= range[0] && idx <= range[1];
          return (
            <div
              key={idx}
              className={`flex flex-col items-center border border-edge rounded px-2 py-1 min-w-10 ${
                idx === i ? 'bg-amber-300 text-black' : inRange ? 'bg-emerald-500/30' : 'bg-surface-2'
              }`}
            >
              <span className="text-[10px] text-gray-400">[{idx}]</span>
              <span className="font-mono">{v}</span>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
      <p className="text-xs text-gray-500">curSum = {curSum}，maxSum = {maxSum}</p>
    </div>
  );
}

export function MaximumSubarrayPanel() {
  const [nums, setNums] = useState<number[]>([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
  const text = nums.join(',');
  const steps = useMemo(() => buildSteps(nums), [nums]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">数组:</span>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const arr = e.target.value.split(',').map((s) => parseInt(s.trim(), 10)).filter((x) => !Number.isNaN(x));
            if (arr.length >= 1 && arr.length <= 20) setNums(arr);
          }}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-72 font-mono"
        />
      </div>
      <Stepper steps={steps} codeLines={maxSubarrayCode} render={render} />
    </div>
  );
}
