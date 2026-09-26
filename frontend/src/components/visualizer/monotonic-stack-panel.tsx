'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, PlusMinusInput, type VizStep } from './stepper';

const monotonicStackCode = [
  'function nextGreaterElement(arr) {',
  '  const ans = new Array(arr.length).fill(-1);',
  '  const stack = []; // 存下标，单调递增',
  '  for (let i = 0; i < arr.length; i++) {',
  '    while (stack.length && arr[stack.at(-1)] < arr[i]) {',
  '      const top = stack.pop();',
  '      ans[top] = arr[i];',
  '    }',
  '    stack.push(i);',
  '  }',
  '  return ans;',
  '}',
];

interface MonotonicState {
  arr: number[];
  stack: number[];                  // 存下标（指向 arr 内位置）
  ans: number[];                    // 下一个更大元素结果，-1 表示不存在
  currentIndex: number;             // 当前遍历到的下标（-1 表示未开始）
  stage: 'init' | 'push' | 'pop-and-fill' | 'advance' | 'done';
  highlight: number[];              // 高亮的 arr 下标
}

export function buildSteps(arr: number[]): VizStep<MonotonicState>[] {
  const steps: VizStep<MonotonicState>[] = [];
  const ans = new Array(arr.length).fill(-1);
  const stack: number[] = [];

  steps.push({
    state: {
      arr: [...arr],
      stack: [],
      ans: [...ans],
      currentIndex: -1,
      stage: 'init',
      highlight: [],
    },
    description: '初始化：单调递增栈（维护下标对应的 arr 元素单调递增）',
    codeLine: 2,
  });

  for (let i = 0; i < arr.length; i++) {
    // 进入 i，准备阶段
    steps.push({
      state: {
        arr: [...arr],
        stack: [...stack],
        ans: [...ans],
        currentIndex: i,
        stage: 'push',
        highlight: [i],
      },
      description: `当前下标 i=${i}, arr[${i}]=${arr[i]}`,
      codeLine: 4,
    });

    // 不断弹出直到栈顶 ≥ 当前元素
    while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
      const top = stack.pop()!;
      ans[top] = arr[i];
      steps.push({
        state: {
          arr: [...arr],
          stack: [...stack],
          ans: [...ans],
          currentIndex: i,
          stage: 'pop-and-fill',
          highlight: [top, i],
        },
        description: `弹出下标 ${top}（arr=${arr[top]}），因为它比 arr[${i}]=${arr[i]} 小 → ans[${top}] = ${arr[i]}`,
        codeLine: 7,
      });
    }

    // 把 i 压栈
    if (stack.length > 0) {
      steps.push({
        state: {
          arr: [...arr],
          stack: [...stack],
          ans: [...ans],
          currentIndex: i,
          stage: 'push',
          highlight: [stack[stack.length - 1], i],
        },
        description: `栈顶 arr[${stack[stack.length - 1]}] = ${arr[stack[stack.length - 1]]} ≥ ${arr[i]}，停止弹出，准备入栈`,
        codeLine: 5,
      });
    }

    stack.push(i);
    steps.push({
      state: {
        arr: [...arr],
        stack: [...stack],
        ans: [...ans],
        currentIndex: i,
        stage: 'push',
        highlight: [i],
      },
      description: `入栈下标 ${i}（arr[${i}]=${arr[i]}），栈保持单调递增`,
      codeLine: 9,
    });
  }

  steps.push({
    state: {
      arr: [...arr],
      stack: [...stack],
      ans: [...ans],
      currentIndex: arr.length - 1,
      stage: 'done',
      highlight: [],
    },
    description: '遍历完成。栈中剩余元素右侧没有更大的数 → ans 保持 -1',
    codeLine: 11,
  });

  return steps;
}

interface Props {
  defaultSeed?: number[];
  title?: string;
}

export function MonotonicStackPanel({ defaultSeed = [3, 1, 4, 1, 5, 9, 2, 6], title }: Props) {
  const [seed, setSeed] = useState<number[]>(defaultSeed);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: MonotonicState = {
    arr: [...seed],
    stack: [],
    ans: new Array(seed.length).fill(-1),
    currentIndex: -1,
    stage: 'init',
    highlight: [],
  };

  const rebuild = (next: number[]) => setSeed(next);

  return (
    <Stepper<MonotonicState>
      steps={steps}
      initialState={initial}
      codeLines={monotonicStackCode}
      codeTitle="单调栈 Monotonic Stack"
      headerActions={
        <>
          <span className="text-sm text-gray-400">输入数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value
                .split(',')
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n));
              if (parsed.length > 0) rebuild(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="逗号分隔"
          />
          <PlusMinusInput
            value={seed.length}
            onChange={(n) => {
              const next = [...seed];
              if (n > next.length) next.push(1 + Math.floor(Math.random() * 9));
              else next.pop();
              if (next.length > 0) rebuild(next);
            }}
            ariaLabel="长度"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          {title && <div className="text-sm text-gray-400">{title}</div>}

          <div>
            <div className="text-xs text-gray-500 mb-2">输入数组 arr</div>
            <div className="flex gap-2 flex-wrap">
              {state.arr.map((v, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={clsx(
                      'w-12 h-12 flex items-center justify-center rounded-lg text-sm font-mono transition-all',
                      state.currentIndex === i
                        ? 'bg-blue-500/30 border-2 border-blue-400 text-white'
                        : state.highlight.includes(i)
                          ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-200'
                          : 'bg-surface-2 border border-edge text-gray-300',
                    )}
                  >
                    {v}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">{i}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-gray-500 mb-2">
                栈（存下标，下往上 = 栈底 → 栈顶）
              </div>
              <div className="flex flex-col-reverse items-start gap-1">
                {state.stack.length === 0 && (
                  <div className="text-gray-600 text-sm py-2">空</div>
                )}
                {state.stack.map((idx, k) => (
                  <div
                    key={k}
                    className={clsx(
                      'w-32 px-3 py-2 rounded text-center text-xs font-mono transition-all',
                      k === state.stack.length - 1
                        ? 'bg-purple-500/20 border border-purple-500 text-purple-200'
                        : 'bg-surface-2 border border-edge text-gray-300',
                    )}
                  >
                    idx={idx} arr={state.arr[idx]}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">下一个更大元素 ans</div>
              <div className="flex gap-1 flex-wrap">
                {state.ans.map((v, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-12 h-10 flex items-center justify-center rounded text-xs font-mono',
                      v === -1
                        ? 'bg-surface-2 border border-edge text-gray-500'
                        : 'bg-green-500/15 border border-green-500/50 text-green-300',
                    )}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500">
            单调性：栈底到栈顶对应 arr 元素 <strong className="text-gray-300">单调递增</strong>。
            当前遇到 arr[i] 时，把栈内所有比它小的"下标"弹出并把 ans 填上 i；剩下 ≥ 它的保持不变。
          </div>
        </div>
      )}
    />
  );
}
