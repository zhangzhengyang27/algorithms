'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const twoPointersCode = [
  'function twoSum(nums, target) {',
  '  nums.sort((a, b) => a - b);',
  '  let left = 0, right = nums.length - 1;',
  '  while (left < right) {',
  '    const sum = nums[left] + nums[right];',
  '    if (sum === target) return [left, right];',
  '    else if (sum < target) left++;',
  '    else right--;',
  '  }',
  '  return [];',
  '}',
];

interface TwoPointerState {
  array: number[];
  left: number;
  right: number;
  target: number;
  sum: number;
  found: boolean;
  foundPair: [number, number] | null;
}

function buildSteps(array: number[], target: number): VizStep<TwoPointerState>[] {
  const steps: VizStep<TwoPointerState>[] = [];
  const sorted = [...array].sort((a, b) => a - b);
  let left = 0;
  let right = sorted.length - 1;

  steps.push({
    state: { array: sorted, left, right, target, sum: 0, found: false, foundPair: null },
    description: `初始化：排序数组，target=${target}，left=0, right=${right}`,
    codeLine: 3,
  });

  while (left < right) {
    const sum = sorted[left] + sorted[right];
    if (sum === target) {
      steps.push({
        state: { array: sorted, left, right, target, sum, found: true, foundPair: [left, right] },
        description: `✅ arr[${left}]+arr[${right}] = ${sorted[left]}+${sorted[right]} = ${sum} = target，找到答案！`,
        codeLine: 6,
      });
      break;
    } else if (sum < target) {
      steps.push({
        state: { array: sorted, left, right, target, sum, found: false, foundPair: null },
        description: `arr[${left}]+arr[${right}] = ${sorted[left]}+${sorted[right]} = ${sum} < ${target}，left 右移`,
        codeLine: 7,
      });
      left++;
      steps.push({
        state: { array: sorted, left, right, target, sum, found: false, foundPair: null },
        description: `left → ${left}`,
        codeLine: 7,
      });
    } else {
      steps.push({
        state: { array: sorted, left, right, target, sum, found: false, foundPair: null },
        description: `arr[${left}]+arr[${right}] = ${sorted[left]}+${sorted[right]} = ${sum} > ${target}，right 左移`,
        codeLine: 8,
      });
      right--;
      steps.push({
        state: { array: sorted, left, right, target, sum, found: false, foundPair: null },
        description: `right → ${right}`,
        codeLine: 8,
      });
    }
  }

  if (left >= right && !steps[steps.length - 1].state.found) {
    steps.push({
      state: { array: sorted, left, right, target, sum: 0, found: false, foundPair: null },
      description: `❌ left >= right，未找到和为 ${target} 的配对`,
      codeLine: 10,
    });
  }

  return steps;
}

export function TwoPointersPanel() {
  const [seed, setSeed] = useState<number[]>([2, 7, 11, 15, 3, 6, 8, 1]);
  const [target, setTarget] = useState(9);
  const steps = useMemo(() => buildSteps(seed, target), [seed, target]);
  const sorted = useMemo(() => [...seed].sort((a, b) => a - b), [seed]);
  const initial: TwoPointerState = {
    array: sorted,
    left: 0,
    right: sorted.length - 1,
    target,
    sum: 0,
    found: false,
    foundPair: null,
  };

  return (
    <Stepper<TwoPointerState>
      steps={steps}
      initialState={initial}
      codeLines={twoPointersCode}
      codeTitle="双指针 Two Pointers"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value
                .split(',')
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n));
              if (parsed.length >= 2) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">目标:</span>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-20"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500 mb-2">
            排序后数组（left 蓝色，right 紫色，找到绿色）
          </div>
          <div className="flex gap-1 flex-wrap justify-center font-mono text-sm">
            {state.array.map((v, i) => {
              const isLeft = i === state.left;
              const isRight = i === state.right;
              const isFound = state.foundPair !== null &&
                (i === state.foundPair[0] || i === state.foundPair[1]);
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      'w-11 h-11 flex items-center justify-center rounded transition-all',
                      isFound
                        ? 'bg-green-500/30 border-2 border-green-400 text-green-200'
                        : isLeft
                          ? 'bg-blue-500/30 border-2 border-blue-400 text-blue-200'
                          : isRight
                            ? 'bg-purple-500/30 border-2 border-purple-400 text-purple-200'
                            : 'bg-surface-2 border border-edge text-gray-300',
                    )}
                  >
                    {v}
                  </div>
                  <div className="text-[10px] text-gray-500">{i}</div>
                  <div className="text-[10px] h-4">
                    {isLeft && <span className="text-blue-400">L</span>}
                    {isRight && <span className="text-purple-400">R</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-surface border border-edge rounded-lg text-center">
              <div className="text-xs text-gray-500 mb-1">left</div>
              <div className="text-blue-300 font-mono">{state.left}</div>
            </div>
            <div className="p-3 bg-surface border border-edge rounded-lg text-center">
              <div className="text-xs text-gray-500 mb-1">right</div>
              <div className="text-purple-300 font-mono">{state.right}</div>
            </div>
            <div className="p-3 bg-surface border border-edge rounded-lg text-center">
              <div className="text-xs text-gray-500 mb-1">当前和</div>
              <div className={clsx('font-mono', state.found ? 'text-green-300' : 'text-white')}>
                {state.sum || '—'}
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            口诀：<strong className="text-gray-300">和小左移，和大右移</strong>
          </div>
        </div>
      )}
    />
  );
}
