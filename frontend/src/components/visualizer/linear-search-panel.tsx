'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const linearSearchCode = [
  'function linearSearch(nums, target) {',
  '  for (let i = 0; i < nums.length; i++) {',
  '    if (nums[i] === target)',
  '      return i;',
  '  }',
  '  return -1;',
  '}',
];

interface LinearSearchState {
  nums: number[];
  target: number;
  i: number;          // current index, -1 = not started
  result: number;     // -2 searching, -1 not found, >=0 found
  checked: number;    // number of elements compared so far
  message: string;
}

export function buildSteps(nums: number[], target: number): VizStep<LinearSearchState>[] {
  const steps: VizStep<LinearSearchState>[] = [];

  steps.push({
    state: { nums, target, i: -1, result: -2, checked: 0, message: `在 [${nums.join(', ')}] 中查找 target = ${target}，从下标 0 开始逐个比较` },
    description: '初始化 i=0',
    codeLine: 1,
  });

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) {
      steps.push({
        state: { nums, target, i, result: -2, checked: i + 1, message: `nums[${i}] = ${nums[i]} === ${target}，命中！返回下标 ${i}` },
        description: `nums[${i}]=${nums[i]} 命中`,
        codeLine: 2,
      });
      steps.push({
        state: { nums, target, i, result: i, checked: i + 1, message: `return ${i}，共比较了 ${i + 1} 次` },
        description: `返回 ${i}`,
        codeLine: 3,
      });
      return steps;
    }
    steps.push({
      state: { nums, target, i, result: -2, checked: i + 1, message: `nums[${i}] = ${nums[i]} ≠ ${target}，不匹配，i 右移` },
      description: `nums[${i}]≠${target}`,
      codeLine: 2,
    });
  }

  steps.push({
    state: { nums, target, i: nums.length, result: -1, checked: nums.length, message: `遍历完全部 ${nums.length} 个元素仍未找到，返回 -1` },
    description: '查找失败 → -1',
    codeLine: 5,
  });

  return steps;
}

export function LinearSearchPanel() {
  const [nums, setNums] = useState<number[]>([5, 8, 2, 9, 1, 7, 3]);
  const [target, setTarget] = useState(7);

  const steps = useMemo(() => buildSteps(nums, target), [nums, target]);
  const initial: LinearSearchState = { nums, target, i: -1, result: -2, checked: 0, message: '' };

  return (
    <Stepper<LinearSearchState>
      steps={steps}
      initialState={initial}
      codeLines={linearSearchCode}
      codeTitle="线性查找 Linear Search"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={nums.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((v) => Number(v.trim())).filter((v) => Number.isFinite(v));
              if (parsed.length >= 2) setNums(parsed.slice(0, 12));
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-44"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">target:</span>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-20"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">
            黄色=正在比较，灰色=已检查（不匹配），绿色=命中；右侧显示查找目标
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <div className="flex gap-1 flex-wrap">
                {state.nums.map((v, i) => {
                  const isCurrent = i === state.i && state.result === -2;
                  const isFound = state.result === i;
                  const isChecked = i < state.i || (state.result === -1);
                  return (
                    <div
                      key={i}
                      className={clsx(
                        'w-11 h-11 flex items-center justify-center rounded text-sm font-mono border transition-all',
                        isFound
                          ? 'bg-green-500/30 border-green-400 text-green-200 scale-110'
                          : isCurrent
                            ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                            : isChecked
                              ? 'bg-bg border-edge text-ink-3'
                              : 'bg-surface-2 border-edge-2 text-ink-2',
                      )}
                    >
                      {v}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-1 flex-wrap">
                {state.nums.map((_, i) => (
                  <div key={i} className="w-11 text-center text-[9px] text-gray-600">{i}</div>
                ))}
              </div>
            </div>

            <div className="px-3 py-2 rounded-lg border border-blue-800 bg-blue-900/20 text-blue-300 font-mono text-sm shrink-0">
              target = {state.target}
            </div>
          </div>

          {/* progress bar */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">比较进度: {state.checked} / {state.nums.length}</div>
            <div className="h-2 rounded-full bg-surface-2 border border-edge overflow-hidden">
              <div
                className={clsx('h-full transition-all', state.result >= 0 ? 'bg-green-500' : 'bg-blue-500')}
                style={{ width: `${(state.checked / state.nums.length) * 100}%` }}
              />
            </div>
          </div>

          {state.result >= 0 && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">找到目标！下标 = {state.result}（最坏 O(n)，平均比较 n/2 次）</span>
            </div>
          )}
          {state.result === -1 && (
            <div className="text-center p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <span className="text-red-300 font-mono text-sm">目标不存在，返回 -1（必须遍历全部 n 个元素）</span>
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
