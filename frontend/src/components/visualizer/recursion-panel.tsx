'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const recursionCode = [
  'function factorial(n) {',
  '  if (n === 0) return 1;  // 基准条件',
  '  return n * factorial(n - 1);',
  '}',
  '',
  'function fib(n) {',
  '  if (n <= 1) return n;  // 基准条件',
  '  return fib(n - 1) + fib(n - 2);',
  '}',
];

interface CallFrame {
  id: number;
  label: string;
  n: number;
  status: 'active' | 'waiting' | 'returned';
  returnValue: number | null;
}

interface RecursionState {
  stack: CallFrame[];
  message: string;
  finalResult: number | null;
}

type Mode = 'factorial' | 'fibonacci';

export function buildFactorialSteps(n: number): VizStep<RecursionState>[] {
  const steps: VizStep<RecursionState>[] = [];
  let frameId = 0;

  steps.push({
    state: { stack: [], message: `计算 ${n}!`, finalResult: null },
    description: `开始计算 factorial(${n})`,
    codeLine: 1,
  });

  // Build call stack going down
  for (let i = n; i >= 0; i--) {
    const stack: CallFrame[] = [];
    for (let j = n; j > i; j--) {
      stack.push({ id: frameId - (n - j) - 1, label: `f(${j})`, n: j, status: 'waiting', returnValue: null });
    }
    stack.push({ id: frameId, label: `f(${i})`, n: i, status: 'active', returnValue: null });
    frameId++;

    if (i === 0) {
      steps.push({
        state: { stack: [...stack], message: `f(0) = 1（基准条件）`, finalResult: null },
        description: '到达基准条件 f(0) = 1',
        codeLine: 2,
      });
    } else {
      steps.push({
        state: { stack: [...stack], message: `调用 f(${i})，等待 f(${i - 1}) 的结果`, finalResult: null },
        description: `调用 f(${i})`,
        codeLine: 3,
      });
    }
  }

  // Unwind
  let result = 1;
  for (let i = 0; i <= n; i++) {
    if (i > 0) result *= i;
    const stack: CallFrame[] = [];
    for (let j = n; j > i; j--) {
      const val = j <= i ? undefined : undefined;
      stack.push({ id: j, label: `f(${j})`, n: j, status: 'waiting', returnValue: null });
    }
    // Returned frames
    for (let j = i; j >= 0; j--) {
      let rv = 1;
      for (let k = 1; k <= j; k++) rv *= k;
      stack.push({ id: j, label: `f(${j})`, n: j, status: 'returned', returnValue: rv });
    }

    steps.push({
      state: {
        stack,
        message: i === n ? `f(${i}) 返回 ${result}，计算完成！` : `f(${i}) 返回 ${result}`,
        finalResult: i === n ? result : null,
      },
      description: `f(${i}) = ${result}，返回上一层`,
      codeLine: 3,
    });
  }

  return steps;
}

export function buildFibSteps(n: number): VizStep<RecursionState>[] {
  const steps: VizStep<RecursionState>[] = [];
  let frameId = 0;
  const memo: Record<number, number> = {};

  function fib(k: number, depth: number, stackPrefix: CallFrame[]): number {
    const id = frameId++;
    const frame: CallFrame = { id, label: `fib(${k})`, n: k, status: 'active', returnValue: null };
    const currentStack = [...stackPrefix, frame];

    if (k <= 1) {
      steps.push({
        state: { stack: currentStack.map((f) => ({ ...f })), message: `fib(${k}) = ${k}（基准条件）`, finalResult: null },
        description: `fib(${k}) = ${k} 基准条件`,
        codeLine: 7,
      });
      memo[k] = k;
      return k;
    }

    steps.push({
      state: { stack: currentStack.map((f) => ({ ...f })), message: `计算 fib(${k}) = fib(${k - 1}) + fib(${k - 2})`, finalResult: null },
      description: `展开 fib(${k})`,
      codeLine: 8,
    });

    const waitingFrame: CallFrame = { ...frame, status: 'waiting' };
    const left = fib(k - 1, depth + 1, [...stackPrefix, waitingFrame]);
    const right = fib(k - 2, depth + 1, [...stackPrefix, waitingFrame]);
    const result = left + right;
    memo[k] = result;

    const returnedStack = [...stackPrefix, { ...frame, status: 'returned' as const, returnValue: result }];
    steps.push({
      state: { stack: returnedStack.map((f) => ({ ...f })), message: `fib(${k}) = ${left} + ${right} = ${result}`, finalResult: null },
      description: `fib(${k}) = ${result}`,
      codeLine: 8,
    });

    return result;
  }

  steps.push({
    state: { stack: [], message: `计算 fib(${n})`, finalResult: null },
    description: `开始计算 Fibonacci(${n})`,
    codeLine: 6,
  });

  const result = fib(n, 0, []);

  steps.push({
    state: { stack: [], message: `🎉 fib(${n}) = ${result}`, finalResult: result },
    description: `完成！fib(${n}) = ${result}`,
    codeLine: 8,
  });

  return steps;
}

export function RecursionPanel() {
  const [mode, setMode] = useState<Mode>('factorial');
  const [n, setN] = useState(5);
  const steps = useMemo(() => {
    const safeN = mode === 'fibonacci' ? Math.min(n, 7) : Math.min(n, 8);
    return mode === 'factorial' ? buildFactorialSteps(safeN) : buildFibSteps(safeN);
  }, [mode, n]);

  const initial: RecursionState = { stack: [], message: '', finalResult: null };
  const maxN = mode === 'fibonacci' ? 7 : 8;

  return (
    <Stepper<RecursionState>
      steps={steps}
      initialState={initial}
      codeLines={recursionCode}
      codeTitle="递归 Recursion"
      headerActions={
        <>
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as Mode);
              if (e.target.value === 'fibonacci') setN(Math.min(n, 7));
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm"
          >
            <option value="factorial">阶乘 n!</option>
            <option value="fibonacci">斐波那契 fib(n)</option>
          </select>
          <span className="text-sm text-gray-400">n:</span>
          <input
            type="number"
            value={n}
            min={1}
            max={maxN}
            onChange={(e) => setN(Math.min(maxN, Math.max(1, Number(e.target.value))))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500 mb-2">
            调用栈（蓝色=当前，黄色=等待，绿色=已返回）
          </div>

          {/* Call stack visualization */}
          <div className="flex flex-col-reverse items-center gap-1 min-h-[180px] justify-start">
            {state.stack.length === 0 && (
              <div className="text-gray-600 text-sm py-8">
                {state.finalResult !== null ? '计算完成' : '空调用栈'}
              </div>
            )}
            {state.stack.map((frame, i) => (
              <div
                key={`${frame.id}-${i}`}
                className={clsx(
                  'w-56 px-4 py-2.5 rounded-lg text-center text-sm font-mono transition-all border',
                  frame.status === 'active'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                    : frame.status === 'waiting'
                      ? 'bg-yellow-500/10 border-yellow-500/60 text-yellow-200'
                      : 'bg-green-500/15 border-green-500/60 text-green-200',
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{frame.label}</span>
                  {frame.returnValue !== null && (
                    <span className="text-xs text-green-300">→ {frame.returnValue}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stack depth indicator */}
          {state.stack.length > 0 && (
            <div className="text-center text-xs text-gray-500">
              栈深度: <span className="text-white">{state.stack.length}</span>
            </div>
          )}

          {state.message && (
            <div className={clsx(
              'text-center text-sm',
              state.finalResult !== null ? 'text-green-300 font-medium' : 'text-gray-300',
            )}>
              {state.message}
            </div>
          )}

          <div className="text-[11px] text-gray-500 text-center">
            递归三要素：<strong className="text-gray-300">基准条件 + 递推关系 + 收敛性</strong>
          </div>
        </div>
      )}
    />
  );
}
