'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const queueCode = [
  'class Queue {',
  '  constructor(maxSize = 10) {',
  '    this.items = [];',
  '    this.maxSize = maxSize;',
  '  }',
  '',
  '  enqueue(value) {',
  '    if (this.items.length >= this.maxSize) {',
  '      throw new Error("Queue full");',
  '    }',
  '    this.items.push(value);',
  '  }',
  '',
  '  dequeue() {',
  '    if (this.items.length === 0) {',
  '      throw new Error("Queue empty");',
  '    }',
  '    return this.items.shift();',
  '  }',
  '}',
];

interface QueueState {
  items: number[];
  error: string | null;
}

function enqueue(state: QueueState, value: number): VizStep<QueueState> {
  if (state.items.length >= 10) {
    return { state: { ...state, error: '队列已满' }, description: `无法入队 ${value}`, codeLine: 8 };
  }
  return {
    state: { items: [...state.items, value], error: null },
    description: `入队 ${value}`,
    codeLine: 11,
  };
}

function dequeue(state: QueueState): VizStep<QueueState> {
  if (state.items.length === 0) {
    return { state: { ...state, error: '队列为空' }, description: '无法出队', codeLine: 15 };
  }
  const removed = state.items[0];
  return {
    state: { items: state.items.slice(1), error: null },
    description: `出队 ${removed}`,
    codeLine: 18,
  };
}

export function buildSteps(seed: number[]): VizStep<QueueState>[] {
  const steps: VizStep<QueueState>[] = [];
  let state: QueueState = { items: [], error: null };
  steps.push({ state, description: '初始化空队列', codeLine: 3 });
  for (const v of seed) {
    const step = enqueue(state, v);
    state = step.state;
    steps.push(step);
  }
  while (state.items.length > 0) {
    const step = dequeue(state);
    state = step.state;
    steps.push(step);
  }
  return steps;
}

export function QueuePanel() {
  const [seed, setSeed] = useState<number[]>([7, 4, 6, 2, 9]);
  const [steps, setSteps] = useState(() => buildSteps(seed));
  const initial: QueueState = { items: [], error: null };

  const rebuild = (next: number[]) => {
    setSeed(next);
    setSteps(buildSteps(next));
  };

  return (
    <Stepper<QueueState>
      steps={steps}
      initialState={initial}
      codeLines={queueCode}
      codeTitle="队列 Queue"
      headerActions={
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
      }
      render={(state) => (
        <div className="space-y-4">
          <div className="flex items-center gap-2 justify-center min-h-[60px]">
            {state.items.length === 0 && (
              <div className="text-gray-600 text-sm">空队列</div>
            )}
            {state.items.map((v, i) => (
              <div
                key={`${i}-${v}`}
                className={clsx(
                  'min-w-[44px] px-3 py-2 rounded text-center text-sm font-medium transition-all',
                  i === 0
                    ? 'bg-red-500/20 border border-red-500 text-red-300'
                    : i === state.items.length - 1
                    ? 'bg-blue-500/20 border border-blue-500 text-blue-300'
                    : 'bg-surface-2 border border-edge text-gray-200',
                )}
              >
                {v}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-4">
            <span>← 出队 (front)</span>
            <span>入队 (rear) →</span>
          </div>
          {state.error && (
            <div className="text-center text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded inline-block">
              {state.error}
            </div>
          )}
          <div className="text-center text-xs text-gray-400">
            大小: <span className="text-white">{state.items.length}</span> / 10
          </div>
        </div>
      )}
    />
  );
}
