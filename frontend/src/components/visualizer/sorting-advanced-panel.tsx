'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const sortingAdvCode = [
  '// ===== 计数排序 =====',
  'function countingSort(nums) {',
  '  const max = Math.max(...nums);',
  '  const count = new Array(max + 1).fill(0);',
  '  for (const x of nums) count[x]++;',
  '  for (let i = 1; i <= max; i++) count[i] += count[i - 1];',
  '  const out = new Array(nums.length);',
  '  for (let i = nums.length - 1; i >= 0; i--)',
  '    out[--count[nums[i]]] = nums[i];',
  '  return out;',
  '}',
  '// ===== 桶排序 =====',
  'function bucketSort(nums, bucketSize) {',
  '  const min = Math.min(...nums), max = Math.max(...nums);',
  '  const n = Math.floor((max - min) / bucketSize) + 1;',
  '  const buckets = Array.from({ length: n }, () => []);',
  '  for (const x of nums)',
  '    buckets[Math.floor((x - min) / bucketSize)].push(x);',
  '  const out = [];',
  '  for (const b of buckets)',
  '    out.push(...b.sort((a, b) => a - b));',
  '  return out;',
  '}',
  '// ===== 基数排序 (LSD) =====',
  'function radixSort(nums) {',
  '  const max = Math.max(...nums);',
  '  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {',
  '    const count = new Array(10).fill(0);',
  '    for (const x of nums) count[Math.floor(x / exp) % 10]++;',
  '    for (let i = 1; i < 10; i++) count[i] += count[i - 1];',
  '    const out = new Array(nums.length);',
  '    for (let i = nums.length - 1; i >= 0; i--)',
  '      out[--count[Math.floor(nums[i] / exp) % 10]] = nums[i];',
  '    nums = out;',
  '  }',
  '  return nums;',
  '}',
];

type SortMode = 'counting' | 'bucket' | 'radix';

interface SortState {
  nums: number[];
  mode: SortMode;
  count: number[];
  countIdx: number;
  buckets: number[][];
  activeBucket: number;
  exp: number;
  digitCounts: number[];
  output: number[];
  outIdx: number;
  srcIdx: number;
  message: string;
  done: boolean;
}

function buildCountingSteps(nums: number[]): VizStep<SortState>[] {
  const steps: VizStep<SortState>[] = [];
  const snap0 = (msg: string): SortState => ({
    nums: [...nums], mode: 'counting', count: [], countIdx: -1, buckets: [], activeBucket: -1, exp: 0, digitCounts: [], output: [], outIdx: -1, srcIdx: -1, message: msg, done: false,
  });

  for (const x of nums) {
    if (!Number.isInteger(x) || x < 0) {
      steps.push({ state: snap0(`⚠️ 计数排序仅支持非负整数，但发现 ${x}`), description: '不支持的输入', codeLine: 3 });
      return steps;
    }
  }

  let max = nums[0];
  for (let i = 1; i < nums.length; i++) if (nums[i] > max) max = nums[i];
  const count = new Array(max + 1).fill(0);
  const output: number[] = new Array(nums.length).fill(-1);

  const snap = (countIdx: number, outIdx: number, srcIdx: number, message: string, done = false): SortState => ({
    nums: [...nums], mode: 'counting', count: [...count], countIdx, buckets: [], activeBucket: -1, exp: 0, digitCounts: [], output: [...output], outIdx, srcIdx, message, done,
  });

  steps.push({ state: snap(-1, -1, -1, `max=${max}，创建计数数组 count[0..${max}]`), description: '初始化 count', codeLine: 3 });

  for (let i = 0; i < nums.length; i++) {
    count[nums[i]]++;
    steps.push({ state: snap(nums[i], -1, i, `nums[${i}]=${nums[i]} → count[${nums[i]}]++ = ${count[nums[i]]}`), description: `count[${nums[i]}]=${count[nums[i]]}`, codeLine: 4 });
  }

  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
    steps.push({ state: snap(i, -1, -1, `count[${i}] += count[${i - 1}] → ${count[i]}（前缀和 = ≤${i} 的元素个数）`), description: `前缀和 count[${i}]=${count[i]}`, codeLine: 5 });
  }

  for (let i = nums.length - 1; i >= 0; i--) {
    const pos = --count[nums[i]];
    output[pos] = nums[i];
    steps.push({ state: snap(nums[i], pos, i, `从后往前：nums[${i}]=${nums[i]}，--count[${nums[i]}]=${pos} → out[${pos}]=${nums[i]}（保证稳定性）`), description: `out[${pos}]=${nums[i]}`, codeLine: 8 });
  }

  steps.push({ state: snap(-1, -1, -1, `排序完成：[${output.join(', ')}]`, true), description: '完成', codeLine: 9 });
  return steps;
}

function buildBucketSteps(nums: number[], bucketSize: number): VizStep<SortState>[] {
  const steps: VizStep<SortState>[] = [];
  const snap0 = (msg: string): SortState => ({
    nums: [...nums], mode: 'bucket', count: [], countIdx: -1, buckets: [], activeBucket: -1, exp: 0, digitCounts: [], output: [], outIdx: -1, srcIdx: -1, message: msg, done: false,
  });

  for (const x of nums) {
    if (!Number.isInteger(x)) {
      steps.push({ state: snap0(`⚠️ 桶排序仅支持整数，但发现 ${x}`), description: '不支持的输入', codeLine: 15 });
      return steps;
    }
  }

  let min = nums[0];
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] < min) min = nums[i];
    if (nums[i] > max) max = nums[i];
  }
  const n = Math.floor((max - min) / bucketSize) + 1;
  const buckets: number[][] = Array.from({ length: n }, () => []);
  const output: number[] = [];

  const snap = (activeBucket: number, srcIdx: number, message: string, done = false): SortState => ({
    nums: [...nums], mode: 'bucket', count: [], countIdx: -1, buckets: buckets.map((b) => [...b]), activeBucket, exp: 0, digitCounts: [], output: [...output], outIdx: -1, srcIdx, message, done,
  });

  steps.push({ state: snap(-1, -1, `min=${min}, max=${max}, bucketSize=${bucketSize} → 桶数 = ⌊(${max}-${min})/${bucketSize}⌋+1 = ${n}`), description: `创建 ${n} 个桶`, codeLine: 15 });

  for (let i = 0; i < nums.length; i++) {
    const bi = Math.floor((nums[i] - min) / bucketSize);
    buckets[bi].push(nums[i]);
    steps.push({ state: snap(bi, i, `nums[${i}]=${nums[i]} → 桶 ⌊(${nums[i]}-${min})/${bucketSize}⌋ = ${bi}`), description: `${nums[i]}→桶${bi}`, codeLine: 17 });
  }

  for (let bi = 0; bi < n; bi++) {
    buckets[bi].sort((a, b) => a - b);
    output.push(...buckets[bi]);
    steps.push({ state: snap(bi, -1, `桶${bi} 排序后 [${buckets[bi].join(', ')}]${buckets[bi].length ? '，收集到结果' : '（空桶，跳过）'}`), description: `收集桶${bi}`, codeLine: 20 });
  }

  steps.push({ state: snap(-1, -1, `排序完成：[${output.join(', ')}]`, true), description: '完成', codeLine: 21 });
  return steps;
}

function buildRadixSteps(nums: number[]): VizStep<SortState>[] {
  const steps: VizStep<SortState>[] = [];
  const snap0 = (msg: string): SortState => ({
    nums: [...nums], mode: 'radix', count: [], countIdx: -1, buckets: [], activeBucket: -1, exp: 0, digitCounts: [], output: [], outIdx: -1, srcIdx: -1, message: msg, done: false,
  });

  for (const x of nums) {
    if (!Number.isInteger(x) || x < 0) {
      steps.push({ state: snap0(`⚠️ 基数排序(LSD)仅支持非负整数，但发现 ${x}`), description: '不支持的输入', codeLine: 25 });
      return steps;
    }
  }

  let arr = [...nums];
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) if (arr[i] > max) max = arr[i];
  const output: number[] = new Array(arr.length).fill(-1);

  const snap = (exp: number, digitCounts: number[], countIdx: number, outIdx: number, srcIdx: number, message: string, done = false): SortState => ({
    nums: [...arr], mode: 'radix', count: [], countIdx, buckets: [], activeBucket: -1, exp, digitCounts: [...digitCounts], output: [...output], outIdx, srcIdx, message, done,
  });

  steps.push({ state: snap(0, [], -1, -1, -1, `max=${max}，从最低位 (exp=1) 开始按位排序`), description: '初始化', codeLine: 25 });

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const digitCounts = new Array(10).fill(0);
    steps.push({ state: snap(exp, digitCounts, -1, -1, -1, `第 ${exp} 位（${exp === 1 ? '个位' : exp === 10 ? '十位' : '百位'}）：统计各位数字出现次数`), description: `exp=${exp} 计数`, codeLine: 28 });

    for (let i = 0; i < arr.length; i++) {
      const d = Math.floor(arr[i] / exp) % 10;
      digitCounts[d]++;
      steps.push({ state: snap(exp, digitCounts, d, -1, i, `${arr[i]} 的第 ${exp} 位 = ${d} → count[${d}]++ = ${digitCounts[d]}`), description: `${arr[i]}→位${d}`, codeLine: 28 });
    }

    for (let i = 1; i < 10; i++) {
      digitCounts[i] += digitCounts[i - 1];
    }
    steps.push({ state: snap(exp, digitCounts, -1, -1, -1, `前缀和完成：[${digitCounts.join(', ')}]`), description: '前缀和', codeLine: 29 });

    for (let i = arr.length - 1; i >= 0; i--) {
      const d = Math.floor(arr[i] / exp) % 10;
      const pos = --digitCounts[d];
      output[pos] = arr[i];
      steps.push({ state: snap(exp, digitCounts, d, pos, i, `${arr[i]} 的位=${d}，--count[${d}]=${pos} → out[${pos}]=${arr[i]}`), description: `out[${pos}]=${arr[i]}`, codeLine: 32 });
    }

    arr = [...output];
    steps.push({ state: snap(exp, digitCounts, -1, -1, -1, `按第 ${exp} 位排完：[${arr.join(', ')}]`), description: `第${exp}位完成`, codeLine: 33 });
    output.fill(-1);
  }

  steps.push({ state: snap(0, [], -1, -1, -1, `排序完成：[${arr.join(', ')}]`, true), description: '完成', codeLine: 35 });
  return steps;
}

const MODE_NAMES: Record<SortMode, string> = {
  counting: '计数排序',
  bucket: '桶排序',
  radix: '基数排序',
};

export function SortingAdvancedPanel() {
  const [mode, setMode] = useState<SortMode>('counting');
  const [numsText, setNumsText] = useState('17, 3, 25, 8, 41, 12, 6, 30');
  const [bucketSize, setBucketSize] = useState(10);

  const nums = useMemo(
    () => numsText.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n >= 0 && n <= 999),
    [numsText],
  );

  const steps = useMemo(() => {
    if (mode === 'counting') return buildCountingSteps(nums);
    if (mode === 'bucket') return buildBucketSteps(nums, bucketSize);
    return buildRadixSteps(nums);
  }, [nums, mode, bucketSize]);

  const initial: SortState = {
    nums, mode, count: [], countIdx: -1, buckets: [], activeBucket: -1, exp: 0, digitCounts: [], output: [], outIdx: -1, srcIdx: -1, message: '', done: false,
  };

  return (
    <Stepper<SortState>
      steps={steps}
      initialState={initial}
      codeLines={sortingAdvCode}
      codeTitle="线性排序 Linear Sorts"
      headerActions={
        <>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as SortMode)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm"
          >
            <option value="counting">计数排序</option>
            <option value="bucket">桶排序</option>
            <option value="radix">基数排序</option>
          </select>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={numsText}
            onChange={(e) => setNumsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-52"
            placeholder="非负整数，逗号分隔"
          />
          {mode === 'bucket' && (
            <>
              <span className="text-sm text-gray-400">桶大小:</span>
              <input
                type="number"
                value={bucketSize}
                min={1}
                max={50}
                onChange={(e) => setBucketSize(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
              />
            </>
          )}
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            当前: {MODE_NAMES[state.mode]} | 黄色=正在处理，蓝色=输出数组，绿色=完成
          </div>

          {/* Source array */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">{state.mode === 'radix' ? '当前轮数组:' : 'nums[]:'}</div>
            <div className="flex gap-1 flex-wrap">
              {state.nums.map((v, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-11 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                    i === state.srcIdx
                      ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                      : state.done
                        ? 'bg-green-500/20 border-green-600 text-green-300'
                        : 'bg-surface-2 border-edge-2 text-ink-2',
                  )}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Counting array / digit counts */}
          {(state.mode === 'counting' || state.mode === 'radix') && (state.count.length > 0 || state.digitCounts.length > 0) && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">
                {state.mode === 'counting' ? 'count[] (值→次数/前缀和):' : `count[0..9] (第 ${state.exp} 位):`}
              </div>
              <div className="flex gap-1 flex-wrap">
                {(state.mode === 'counting' ? state.count : state.digitCounts).map((v, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={clsx(
                        'w-8 h-8 flex items-center justify-center rounded text-xs font-mono border transition-all',
                        i === state.countIdx
                          ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                          : v > 0
                            ? 'bg-blue-500/15 border-blue-700 text-blue-200'
                            : 'bg-surface-2 border-edge text-ink-3',
                      )}
                    >
                      {v}
                    </div>
                    <span className="text-[8px] text-gray-600">{i}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buckets */}
          {state.mode === 'bucket' && state.buckets.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">桶 (每桶范围 bucketSize={bucketSize}):</div>
              <div className="flex gap-2 flex-wrap">
                {state.buckets.map((b, bi) => (
                  <div
                    key={bi}
                    className={clsx(
                      'flex flex-col items-center gap-0.5 rounded border p-1.5 min-w-[48px] transition-all',
                      bi === state.activeBucket ? 'border-yellow-400 bg-yellow-500/10' : 'border-edge-2 bg-surface-2'
                    )}
                  >
                    <span className="text-[9px] text-gray-500">桶{bi}</span>
                    <div className="flex flex-col gap-0.5">
                      {b.length === 0 ? (
                        <span className="text-[9px] text-gray-700">空</span>
                      ) : (
                        b.map((v, vi) => (
                          <span key={vi} className="text-xs font-mono text-blue-200 bg-blue-500/10 rounded px-1 text-center">{v}</span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output array */}
          {(state.mode !== 'bucket') && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">output[]:</div>
              <div className="flex gap-1 flex-wrap">
                {state.output.length === 0 ? (
                  <span className="text-gray-600 text-sm">尚未生成</span>
                ) : (
                  state.output.map((v, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'w-11 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                        i === state.outIdx
                          ? 'bg-blue-500/30 border-blue-400 text-blue-100 scale-105'
                          : v >= 0
                            ? 'bg-blue-500/10 border-blue-800 text-blue-200'
                            : 'bg-surface-2 border-edge text-ink-3',
                      )}
                    >
                      {v >= 0 ? v : '·'}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Bucket collected output */}
          {state.mode === 'bucket' && state.output.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">收集结果 out[]:</div>
              <div className="flex gap-1 flex-wrap">
                {state.output.map((v, i) => (
                  <div key={i} className="w-11 h-10 flex items-center justify-center rounded text-sm font-mono border bg-blue-500/10 border-blue-800 text-blue-200">
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.done && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                {MODE_NAMES[state.mode]}完成: [{(state.mode === 'bucket' ? state.output : state.nums).join(', ')}]
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
