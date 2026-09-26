'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const countingSortCode = [
  'function countingSort(arr, k) {',
  '  const count = new Array(k + 1).fill(0);',
  '  for (const x of arr) count[x]++;',
  '  for (let i = 1; i <= k; i++) count[i] += count[i - 1];',
  '  const out = new Array(arr.length);',
  '  for (let i = arr.length - 1; i >= 0; i--) {',
  '    out[--count[arr[i]]] = arr[i];',
  '  }',
  '  return out;',
  '}',
];

interface CountingState {
  array: number[];
  count: number[];
  output: (number | null)[];
  max: number;
  activeValue: number | null;
  message: string;
}

function buildSteps(input: number[]): VizStep<CountingState>[] {
  const steps: VizStep<CountingState>[] = [];
  const arr = [...input];
  const max = Math.max(...arr);

  const snap = (count: number[], output: (number | null)[], activeValue: number | null, msg: string, codeLine: number): VizStep<CountingState> => ({
    state: { array: [...arr], count: [...count], output: [...output], max, activeValue, message: msg },
    description: msg,
    codeLine,
  });

  const count = new Array(max + 1).fill(0);
  const output: (number | null)[] = new Array(arr.length).fill(null);

  steps.push(snap(count, output, null, `计数排序：值域 [0, ${max}]，统计每个值的出现次数`, 1));

  for (const x of arr) {
    count[x]++;
    steps.push(snap(count, output, x, `遇到 ${x}，count[${x}] = ${count[x]}`, 3));
  }

  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
    steps.push(snap(count, output, i, `前缀和：count[${i}] = ${count[i]}（≤${i} 的元素个数）`, 4));
  }

  for (let i = arr.length - 1; i >= 0; i--) {
    const x = arr[i];
    const pos = --count[x];
    output[pos] = x;
    steps.push(snap(count, output, x, `反向放置 ${x} 到位置 ${pos}`, 7));
  }

  steps.push(snap(count, output, null, `✅ 排序完成：[${output.join(', ')}]`, 8));
  return steps;
}

export function CountingSortPanel() {
  const [seed, setSeed] = useState<number[]>([4, 2, 2, 8, 3, 3, 1]);
  const [maxInput, setMaxInput] = useState(8);

  const steps = useMemo(() => {
    const valid = seed.filter((x) => Number.isInteger(x) && x >= 0 && x <= maxInput);
    if (valid.length < 2) {
      return [{
        state: { array: seed, count: [], output: [], max: maxInput, activeValue: null, message: '⚠️ 仅支持 0~' + maxInput + ' 的非负整数' },
        description: '输入非法', codeLine: 1,
      }] as VizStep<CountingState>[];
    }
    return buildSteps(valid);
  }, [seed, maxInput]);

  const initial: CountingState = { array: [...seed], count: [], output: [], max: maxInput, activeValue: null, message: '' };

  return (
    <Stepper<CountingState>
      steps={steps}
      initialState={initial}
      codeLines={countingSortCode}
      codeTitle="计数排序 Counting Sort"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => setSeed(e.target.value.split(',').map((s) => Number(s.trim())).filter(Number.isFinite))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="非负整数"
          />
          <span className="text-sm text-gray-400">最大值:</span>
          <input
            type="number"
            value={maxInput}
            onChange={(e) => setMaxInput(Math.max(1, Math.min(99, Number(e.target.value))))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">黄色=当前处理的值，蓝色=计数/输出栏</div>
          <div className="flex gap-1.5 flex-wrap justify-center min-h-15 items-end">
            {state.array.map((v, i) => (
              <div
                key={i}
                className={clsx(
                  'w-9 flex items-center justify-center rounded-t text-xs font-mono border',
                  state.activeValue === v ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200' : 'bg-surface-2 border-edge-2 text-gray-400',
                )}
                style={{ height: `${Math.max(20, v * 6 + 16)}px` }}
              >
                {v}
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">计数 count[]:</div>
            <div className="flex gap-1 flex-wrap justify-center">
              {state.count.map((c, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={clsx('w-8 h-8 flex items-center justify-center rounded text-xs font-mono border', state.activeValue === i ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200' : 'bg-blue-500/15 border-blue-500/40 text-blue-200')}>{c}</div>
                  <div className="text-[9px] text-gray-600">{i}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">输出 output[]:</div>
            <div className="flex gap-1 flex-wrap justify-center min-h-10 items-end">
              {state.output.map((v, i) => (
                <div key={i} className="w-9 h-9 flex items-center justify-center rounded text-xs font-mono border border-green-500/40 bg-green-500/15 text-green-300">{v ?? '·'}</div>
              ))}
            </div>
          </div>

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
