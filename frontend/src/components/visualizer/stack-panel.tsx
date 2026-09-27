'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Stepper, PlusMinusInput, type VizStep } from './stepper';

const stackCode = [
  'class Stack {',
  '  constructor(maxSize = 10) {',
  '    this.items = [];',
  '    this.maxSize = maxSize;',
  '  }',
  '',
  '  push(value) {',
  '    if (this.items.length >= this.maxSize) {',
  '      throw new Error("Stack overflow");',
  '    }',
  '    this.items.push(value);',
  '  }',
  '',
  '  pop() {',
  '    if (this.items.length === 0) {',
  '      throw new Error("Stack underflow");',
  '    }',
  '    return this.items.pop();',
  '  }',
  '',
  '  peek() {',
  '    return this.items[this.items.length - 1];',
  '  }',
  '}',
];

interface StackState {
  items: number[];
  highlightTop: boolean;
  error: string | null;
}

function push(state: StackState, value: number): VizStep<StackState> {
  if (state.items.length >= 10) {
    return {
      state: { ...state, error: '栈已满 (max 10)' },
      description: `无法入栈 ${value}：栈已满`,
      codeLine: 8,
    };
  }
  return {
    state: { items: [...state.items, value], highlightTop: true, error: null },
    description: `入栈 ${value}`,
    highlights: ['top'],
    codeLine: 11,
  };
}

function pop(state: StackState): VizStep<StackState> {
  if (state.items.length === 0) {
    return {
      state: { ...state, error: '栈为空' },
      description: '无法出栈：栈为空',
      codeLine: 15,
    };
  }
  const items = state.items.slice(0, -1);
  return {
    state: { items, highlightTop: items.length > 0, error: null },
    description: `出栈 ${state.items[state.items.length - 1]}`,
    highlights: ['top'],
    codeLine: 18,
  };
}

export function buildSteps(seed: number[]): VizStep<StackState>[] {
  const steps: VizStep<StackState>[] = [];
  let state: StackState = { items: [], highlightTop: false, error: null };
  steps.push({ state, description: '初始化空栈', codeLine: 3 });
  for (const v of seed) {
    // 原来这里写的是 push({ items: [], ... }, v)：拿一个**空栈**去算中间帧，
    // 于是在已有 [1] 之后再 push 2 时，会出现一帧只显示 [2] 的画面（把已入栈的元素弄丢了），
    // 下一帧又跳回 [1,2]。queue-panel 用的是正确写法，这里与它对齐。
    const step = push(state, v);
    state = step.state;
    steps.push(step);
    steps.push({ state, description: `入栈 ${v} → 栈顶 = ${v}`, codeLine: 11 });
  }
  while (state.items.length > 0) {
    const before = state;
    const step = pop(before);
    state = step.state;
    steps.push(step);
    steps.push({ state, description: `出栈后栈大小 = ${state.items.length}`, codeLine: 18 });
  }
  return steps;
}

export function StackPanel() {
  const [seed, setSeed] = useState<number[]>([5, 8, 3, 9, 1]);
  const [steps, setSteps] = useState(() => buildSteps(seed));
  const initial: StackState = { items: [], highlightTop: false, error: null };

  const rebuild = (next: number[]) => {
    setSeed(next);
    setSteps(buildSteps(next));
  };

  return (
    <Stepper<StackState>
      steps={steps}
      initialState={initial}
      codeLines={stackCode}
      codeTitle="栈 Stack"
      headerActions={
        <>
          <span className="text-sm text-gray-400">演示数据:</span>
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
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40"
            placeholder="逗号分隔"
          />
          <PlusMinusInput
            value={seed.length}
            onChange={(n) => rebuild([...seed, Math.ceil(Math.random() * 99)])}
            ariaLabel="入栈"
          />
        </>
      }
      render={(state) => (
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-500 mb-2">栈顶 ↑</div>
          <div className="flex flex-col-reverse gap-1 items-center min-h-[180px]">
            {state.items.length === 0 && (
              <div className="text-gray-600 text-sm py-6">空栈</div>
            )}
            {state.items.map((v, i) => (
              <div
                key={`${i}-${v}`}
                className={clsx(
                  'w-32 px-3 py-2 rounded text-center text-sm font-medium transition-all',
                  i === state.items.length - 1 && state.highlightTop
                    ? 'bg-blue-500/20 border border-blue-500 text-blue-300'
                    : 'bg-surface-2 border border-edge text-gray-200',
                )}
              >
                {v}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">栈底 ↓</div>
          {state.error && (
            <div className="mt-3 text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded">
              {state.error}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-3">
            大小: <span className="text-white">{state.items.length}</span> / 10
          </div>
        </div>
      )}
    />
  );
}
