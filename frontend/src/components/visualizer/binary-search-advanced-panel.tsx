'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const binarySearchAdvCode = [
  '// 左闭右闭 [left, right]：查找第一个 == target',
  'function searchFirst(nums, target) {',
  '  let left = 0, right = nums.length - 1;',
  '  while (left <= right) {',
  '    const mid = left + ((right - left) >> 1);',
  '    if (nums[mid] < target) left = mid + 1;',
  '    else right = mid - 1;',
  '  }',
  '  return left < nums.length && nums[left] === target ? left : -1;',
  '}',
  '// 左闭右开 [left, right)：查找最后一个 == target',
  'function searchLast(nums, target) {',
  '  let left = 0, right = nums.length;',
  '  while (left < right) {',
  '    const mid = left + ((right - left) >> 1);',
  '    if (nums[mid] <= target) left = mid + 1;',
  '    else right = mid;',
  '  }',
  '  return left > 0 && nums[left - 1] === target ? left - 1 : -1;',
  '}',
  '// 死循环陷阱：left = mid 导致区间不收缩',
  'function deadLoop(nums, target) {',
  '  let left = 0, right = nums.length - 1;',
  '  while (left <= right) {',
  '    const mid = (left + right) >> 1;',
  '    if (nums[mid] < target) left = mid; // BUG: 应为 mid + 1',
  '    else right = mid - 1;',
  '  }',
  '  return left;',
  '}',
];

type BSMode = 'first' | 'last' | 'deadloop';

interface BSState {
  nums: number[];
  target: number;
  left: number;
  right: number;
  mid: number;
  iteration: number;
  found: number | null;
  eliminated: boolean[];
  message: string;
  mode: BSMode;
  deadLoopDetected: boolean;
}

export function buildFirstSteps(nums: number[], target: number): VizStep<BSState>[] {
  const steps: VizStep<BSState>[] = [];
  const n = nums.length;
  let left = 0;
  let right = n - 1;
  let iteration = 0;

  const elim = () => {
    const e = new Array(n).fill(false);
    for (let i = 0; i < n; i++) if (i < left || i > right) e[i] = true;
    return e;
  };

  steps.push({
    state: { nums, target, left, right, mid: -1, iteration, found: null, eliminated: elim(), message: `左闭右闭 [${left}, ${right}]：循环条件 left <= right，收缩时 ±1`, mode: 'first', deadLoopDetected: false },
    description: '初始化 [0,n-1]',
    codeLine: 2,
  });

  while (left <= right) {
    iteration++;
    const mid = left + ((right - left) >> 1);
    steps.push({
      state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `第${iteration}轮：mid = ${left} + ((${right}-${left})>>1) = ${mid}，nums[${mid}]=${nums[mid]}`, mode: 'first', deadLoopDetected: false },
      description: `mid=${mid}`,
      codeLine: 4,
    });
    if (nums[mid] < target) {
      left = mid + 1;
      steps.push({
        state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `nums[${mid}]=${nums[mid]} < ${target} → left = mid+1 = ${left}（mid 及左侧全部排除）`, mode: 'first', deadLoopDetected: false },
        description: `left→${left}`,
        codeLine: 5,
      });
    } else {
      right = mid - 1;
      steps.push({
        state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `nums[${mid}]=${nums[mid]} ≥ ${target} → right = mid-1 = ${right}（第一个等于的位置在 mid 或其左侧）`, mode: 'first', deadLoopDetected: false },
        description: `right→${right}`,
        codeLine: 6,
      });
    }
  }

  const found = left < n && nums[left] === target ? left : null;
  steps.push({
    state: { nums, target, left, right, mid: -1, iteration, found, eliminated: elim(), message: found !== null ? `循环结束 left=${left}，nums[${left}]=${nums[left]} == ${target} → 第一个等于 target 的下标是 ${left}` : `循环结束 left=${left}，${left >= n ? '越界' : `nums[${left}]=${nums[left]} ≠ ${target}`} → 不存在，返回 -1`, mode: 'first', deadLoopDetected: false },
    description: found !== null ? `找到 @${left}` : '未找到 -1',
    codeLine: 8,
  });

  return steps;
}

export function buildLastSteps(nums: number[], target: number): VizStep<BSState>[] {
  const steps: VizStep<BSState>[] = [];
  const n = nums.length;
  let left = 0;
  let right = n;
  let iteration = 0;

  const elim = () => {
    const e = new Array(n).fill(false);
    for (let i = 0; i < n; i++) if (i < left || i >= right) e[i] = true;
    return e;
  };

  steps.push({
    state: { nums, target, left, right, mid: -1, iteration, found: null, eliminated: elim(), message: `左闭右开 [${left}, ${right})：循环条件 left < right，right 收缩到 mid（不减1）`, mode: 'last', deadLoopDetected: false },
    description: '初始化 [0,n)',
    codeLine: 12,
  });

  while (left < right) {
    iteration++;
    const mid = left + ((right - left) >> 1);
    steps.push({
      state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `第${iteration}轮：mid = ${mid}，nums[${mid}]=${nums[mid]}`, mode: 'last', deadLoopDetected: false },
      description: `mid=${mid}`,
      codeLine: 14,
    });
    if (nums[mid] <= target) {
      left = mid + 1;
      steps.push({
        state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `nums[${mid}]=${nums[mid]} ≤ ${target} → left = mid+1 = ${left}（最后一个等于的位置在 mid 右侧）`, mode: 'last', deadLoopDetected: false },
        description: `left→${left}`,
        codeLine: 15,
      });
    } else {
      right = mid;
      steps.push({
        state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `nums[${mid}]=${nums[mid]} > ${target} → right = mid = ${right}（注意：右开区间不减1）`, mode: 'last', deadLoopDetected: false },
        description: `right→${right}`,
        codeLine: 16,
      });
    }
  }

  const found = left > 0 && nums[left - 1] === target ? left - 1 : null;
  steps.push({
    state: { nums, target, left, right, mid: -1, iteration, found, eliminated: elim(), message: found !== null ? `循环结束 left=${left}，检查 nums[left-1]=nums[${found}]=${nums[found]} == ${target} → 最后一个等于 target 的下标是 ${found}` : `循环结束 left=${left}，${left === 0 ? 'left=0 无左侧元素' : `nums[${left - 1}]=${nums[left - 1]} ≠ ${target}`} → 不存在，返回 -1`, mode: 'last', deadLoopDetected: false },
    description: found !== null ? `找到 @${found}` : '未找到 -1',
    codeLine: 18,
  });

  return steps;
}

export function buildDeadLoopSteps(nums: number[], target: number): VizStep<BSState>[] {
  const steps: VizStep<BSState>[] = [];
  const n = nums.length;
  let left = 0;
  let right = n - 1;
  let iteration = 0;
  const seen = new Set<string>();
  let dead = false;

  const elim = () => {
    const e = new Array(n).fill(false);
    for (let i = 0; i < n; i++) if (i < left || i > right) e[i] = true;
    return e;
  };

  steps.push({
    state: { nums, target, left, right, mid: -1, iteration, found: null, eliminated: elim(), message: '错误写法：left = mid（而非 mid+1）。观察区间如何不再收缩...', mode: 'deadloop', deadLoopDetected: false },
    description: 'BUG 版本启动',
    codeLine: 22,
  });

  while (left <= right && iteration < 30) {
    iteration++;
    const mid = (left + right) >> 1;
    const key = `${left},${right},${mid}`;
    if (seen.has(key)) {
      dead = true;
      steps.push({
        state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `状态 (left=${left}, right=${right}, mid=${mid}) 重复出现 → 区间永不收缩，死循环！原因：left=mid 且 mid=(left+right)>>1 向下取整，当 right=left+1 时 mid=left，left 永远不动`, mode: 'deadloop', deadLoopDetected: true },
        description: '检测到死循环!',
        codeLine: 25,
      });
      break;
    }
    seen.add(key);
    steps.push({
      state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `第${iteration}轮：mid = (${left}+${right})>>1 = ${mid}，nums[${mid}]=${nums[mid]}`, mode: 'deadloop', deadLoopDetected: false },
      description: `mid=${mid}`,
      codeLine: 24,
    });
    if (nums[mid] < target) {
      const oldLeft = left;
      left = mid;
      steps.push({
        state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `nums[${mid}]=${nums[mid]} < ${target} → left = mid = ${left}${left === oldLeft ? '（left 没有前进！区间 [' + left + ',' + right + '] 不变或震荡）' : ''}`, mode: 'deadloop', deadLoopDetected: false },
        description: `left→${left}${left === oldLeft ? '(未动!)' : ''}`,
        codeLine: 25,
      });
    } else {
      right = mid - 1;
      steps.push({
        state: { nums, target, left, right, mid, iteration, found: null, eliminated: elim(), message: `nums[${mid}]=${nums[mid]} ≥ ${target} → right = mid-1 = ${right}`, mode: 'deadloop', deadLoopDetected: false },
        description: `right→${right}`,
        codeLine: 26,
      });
    }
  }

  if (!dead) {
    steps.push({
      state: { nums, target, left, right, mid: -1, iteration, found: null, eliminated: elim(), message: '此输入恰好收敛（未触发死循环），但写法仍有风险', mode: 'deadloop', deadLoopDetected: false },
      description: '本次未死循环',
      codeLine: 28,
    });
  }

  return steps;
}

const MODE_NAMES: Record<BSMode, string> = {
  first: '第一个等于 (左闭右闭)',
  last: '最后一个等于 (左闭右开)',
  deadloop: '死循环陷阱对比',
};

export function BinarySearchAdvancedPanel() {
  const [numsText, setNumsText] = useState('1, 2, 3, 3, 3, 5, 7');
  const [target, setTarget] = useState(3);
  const [mode, setMode] = useState<BSMode>('first');

  const nums = useMemo(
    () => numsText.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)),
    [numsText],
  );

  const steps = useMemo(() => {
    if (mode === 'first') return buildFirstSteps(nums, target);
    if (mode === 'last') return buildLastSteps(nums, target);
    return buildDeadLoopSteps(nums, target);
  }, [nums, target, mode]);

  const initial: BSState = {
    nums,
    target,
    left: 0,
    right: nums.length - 1,
    mid: -1,
    iteration: 0,
    found: null,
    eliminated: new Array(nums.length).fill(false),
    message: '',
    mode,
    deadLoopDetected: false,
  };

  return (
    <Stepper<BSState>
      steps={steps}
      initialState={initial}
      codeLines={binarySearchAdvCode}
      codeTitle="高级二分 Binary Search Advanced"
      headerActions={
        <>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as BSMode)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm"
          >
            <option value="first">第一个等于 (左闭右闭)</option>
            <option value="last">最后一个等于 (左闭右开)</option>
            <option value="deadloop">死循环陷阱</option>
          </select>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={numsText}
            onChange={(e) => setNumsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-44"
            placeholder="有序数组，逗号分隔"
          />
          <span className="text-sm text-gray-400">target:</span>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value) || 0)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            蓝色=搜索区间 [left, right]，黄色=mid，绿色=找到位置，灰色=已排除 | 当前模式: {MODE_NAMES[state.mode]}
          </div>

          {/* Array with pointers */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">
              nums[] {state.mode === 'last' && <span className="text-purple-400">(右开: right={state.right} 指向区间外)</span>}
            </div>
            <div className="flex gap-1 flex-wrap items-end">
              {state.nums.map((v, i) => {
                const inRange = state.mode === 'last'
                  ? i >= state.left && i < state.right
                  : i >= state.left && i <= state.right;
                const isMid = i === state.mid;
                const isFound = i === state.found;
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div
                      className={clsx(
                        'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border-2 transition-all',
                        isFound
                          ? 'bg-green-500/30 border-green-400 text-green-200 scale-110'
                          : isMid
                            ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                            : inRange
                              ? 'bg-blue-500/15 border-blue-600 text-blue-200'
                              : 'bg-surface-2 border-edge text-ink-3',
                      )}
                    >
                      {v}
                    </div>
                    <div className="text-[9px] text-gray-600 font-mono">{i}</div>
                    <div className="flex gap-0.5 h-4">
                      {i === state.left && <span className="text-[9px] px-1 rounded bg-blue-500/30 text-blue-300 font-bold">L</span>}
                      {i === state.mid && <span className="text-[9px] px-1 rounded bg-yellow-500/30 text-yellow-300 font-bold">M</span>}
                      {i === state.right && state.mode !== 'last' && <span className="text-[9px] px-1 rounded bg-purple-500/30 text-purple-300 font-bold">R</span>}
                      {state.mode === 'last' && i === state.right && <span className="text-[9px] px-1 rounded bg-purple-500/30 text-purple-300 font-bold">R(开)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Iteration info */}
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <span className="text-sm font-mono text-gray-300">第 <span className="text-yellow-300">{state.iteration}</span> 轮</span>
            <span className="text-sm font-mono text-gray-400">
              区间: [{state.left}, {state.right}{state.mode === 'last' ? ')' : ']'} 宽度={state.mode === 'last' ? Math.max(0, state.right - state.left) : Math.max(0, state.right - state.left + 1)}
            </span>
            <span className="text-sm font-mono text-gray-400">target = <span className="text-blue-300">{state.target}</span></span>
          </div>

          {/* Dead loop warning */}
          {state.deadLoopDetected && (
            <div className="text-center p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <span className="text-red-300 font-mono text-sm">
                ⚠ 死循环！left=mid + 向下取整 → 区间永不收缩。修复：left = mid + 1
              </span>
            </div>
          )}

          {state.found !== null && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                {state.mode === 'first' ? '第一个' : '最后一个'}等于 {state.target} 的位置: {state.found}
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
