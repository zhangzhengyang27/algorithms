'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const binarySearchCode = [
  'function binarySearch(arr, target) {',
  '  let left = 0, right = arr.length - 1;',
  '  while (left <= right) {',
  '    const mid = Math.floor((left + right) / 2);',
  '    if (arr[mid] === target) return mid;',
  '    else if (arr[mid] < target) left = mid + 1;',
  '    else right = mid - 1;',
  '  }',
  '  return -1;',
  '}',
];

interface BinSearchState {
  array: number[];
  left: number;
  right: number;
  mid: number;
  target: number;
  found: boolean;
  eliminated: number[];
  message: string;
}

export function buildSteps(array: number[], target: number): VizStep<BinSearchState>[] {
  const steps: VizStep<BinSearchState>[] = [];
  const sorted = [...array].sort((a, b) => a - b);
  let left = 0;
  let right = sorted.length - 1;
  const eliminated: number[] = [];

  steps.push({
    state: { array: sorted, left, right, mid: -1, target, found: false, eliminated: [], message: `在有序数组中查找 ${target}，left=0, right=${right}` },
    description: '初始化',
    codeLine: 2,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    steps.push({
      state: { array: sorted, left, right, mid, target, found: false, eliminated: [...eliminated], message: `mid = ⌊(${left}+${right})/2⌋ = ${mid}，arr[${mid}] = ${sorted[mid]}` },
      description: `计算 mid=${mid}`,
      codeLine: 4,
    });

    if (sorted[mid] === target) {
      steps.push({
        state: { array: sorted, left, right, mid, target, found: true, eliminated: [...eliminated], message: `✅ arr[${mid}] = ${sorted[mid]} = target，找到目标！` },
        description: `找到 ${target}！`,
        codeLine: 5,
      });
      return steps;
    } else if (sorted[mid] < target) {
      steps.push({
        state: { array: sorted, left, right, mid, target, found: false, eliminated: [...eliminated], message: `arr[${mid}]=${sorted[mid]} < ${target}，目标在右半部分，left = mid+1` },
        description: `${sorted[mid]} < ${target}，搜右半`,
        codeLine: 6,
      });
      for (let i = left; i <= mid; i++) eliminated.push(i);
      left = mid + 1;
    } else {
      steps.push({
        state: { array: sorted, left, right, mid, target, found: false, eliminated: [...eliminated], message: `arr[${mid}]=${sorted[mid]} > ${target}，目标在左半部分，right = mid-1` },
        description: `${sorted[mid]} > ${target}，搜左半`,
        codeLine: 7,
      });
      for (let i = mid; i <= right; i++) eliminated.push(i);
      right = mid - 1;
    }

    steps.push({
      state: { array: sorted, left, right, mid: -1, target, found: false, eliminated: [...eliminated], message: `更新搜索范围：left=${left}, right=${right}` },
      description: `范围 [${left}, ${right}]`,
      codeLine: 3,
    });
  }

  steps.push({
    state: { array: sorted, left, right, mid: -1, target, found: false, eliminated: [...eliminated], message: `❌ left > right，搜索范围为空，${target} 不存在` },
    description: '未找到',
    codeLine: 9,
  });

  return steps;
}

export function BinarySearchPanel() {
  const [seed, setSeed] = useState<number[]>([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
  const [target, setTarget] = useState(7);
  const steps = useMemo(() => buildSteps(seed, target), [seed, target]);
  const sorted = useMemo(() => [...seed].sort((a, b) => a - b), [seed]);
  const initial: BinSearchState = {
    array: sorted,
    left: 0,
    right: sorted.length - 1,
    mid: -1,
    target,
    found: false,
    eliminated: [],
    message: '',
  };

  return (
    <Stepper<BinSearchState>
      steps={steps}
      initialState={initial}
      codeLines={binarySearchCode}
      codeTitle="二分查找 Binary Search"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
              if (parsed.length >= 2) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-52"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">目标:</span>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            蓝色=left，紫色=right，黄色=mid，绿色=找到，暗色=已排除
          </div>

          <div className="flex gap-1.5 flex-wrap justify-center font-mono text-sm">
            {state.array.map((v, i) => {
              const isLeft = i === state.left;
              const isRight = i === state.right;
              const isMid = i === state.mid;
              const isFound = state.found && isMid;
              const isEliminated = state.eliminated.includes(i);
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      'w-10 h-10 flex items-center justify-center rounded transition-all border',
                      isFound
                        ? 'bg-green-500/30 border-2 border-green-400 text-green-200 scale-110'
                        : isMid
                          ? 'bg-yellow-500/30 border-2 border-yellow-400 text-yellow-200'
                          : isEliminated
                            ? 'bg-bg border border-edge text-gray-700'
                            : isLeft
                              ? 'bg-blue-500/20 border-2 border-blue-400 text-blue-200'
                              : isRight
                                ? 'bg-purple-500/20 border-2 border-purple-400 text-purple-200'
                                : 'bg-surface-2 border border-edge-2 text-gray-300',
                    )}
                  >
                    {v}
                  </div>
                  <div className="text-[9px] text-gray-600">{i}</div>
                  <div className="text-[9px] h-3 flex gap-0.5">
                    {isLeft && <span className="text-blue-400">L</span>}
                    {isMid && <span className="text-yellow-400">M</span>}
                    {isRight && <span className="text-purple-400">R</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm max-w-xs mx-auto">
            <div className="p-2 bg-surface border border-edge rounded text-center">
              <div className="text-[10px] text-gray-500">left</div>
              <div className="text-blue-300 font-mono">{state.left}</div>
            </div>
            <div className="p-2 bg-surface border border-edge rounded text-center">
              <div className="text-[10px] text-gray-500">mid</div>
              <div className="text-yellow-300 font-mono">{state.mid >= 0 ? state.mid : '—'}</div>
            </div>
            <div className="p-2 bg-surface border border-edge rounded text-center">
              <div className="text-[10px] text-gray-500">right</div>
              <div className="text-purple-300 font-mono">{state.right}</div>
            </div>
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
