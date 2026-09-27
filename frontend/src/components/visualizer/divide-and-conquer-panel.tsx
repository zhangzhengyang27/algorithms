'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const dcCode = [
  'function mergeSortCount(nums, lo, hi, tmp) {',
  '  if (hi - lo <= 1) return 0;',
  '  const mid = (lo + hi) >> 1;',
  '  let inv = mergeSortCount(nums, lo, mid, tmp);',
  '  inv += mergeSortCount(nums, mid, hi, tmp);',
  '  let i = lo, j = mid, k = lo;',
  '  while (i < mid && j < hi) {',
  '    if (nums[i] <= nums[j]) tmp[k++] = nums[i++];',
  '    else { tmp[k++] = nums[j++]; inv += mid - i; }',
  '  }',
  '  while (i < mid) tmp[k++] = nums[i++];',
  '  while (j < hi) tmp[k++] = nums[j++];',
  '  for (let p = lo; p < hi; p++) nums[p] = tmp[p];',
  '  return inv;',
  '}',
];

interface DCState {
  nums: number[];
  lo: number;
  hi: number;
  mid: number;
  mergeI: number;
  mergeJ: number;
  tmpSegment: number[];
  invStep: number;
  totalInv: number;
  depth: number;
  phase: 'init' | 'split' | 'merge' | 'writeback' | 'done';
  message: string;
}

export function buildSteps(input: number[]): VizStep<DCState>[] {
  const steps: VizStep<DCState>[] = [];
  const nums = [...input];
  const n = nums.length;
  let totalInv = 0;

  const snap = (partial: Partial<DCState> & { message: string }): DCState => ({
    nums: [...nums],
    lo: -1,
    hi: -1,
    mid: -1,
    mergeI: -1,
    mergeJ: -1,
    tmpSegment: [],
    invStep: 0,
    totalInv,
    depth: 0,
    phase: 'init',
    ...partial,
  });

  steps.push({
    state: snap({ message: `数组 [${nums.join(', ')}]，用归并排序统计逆序对` }),
    description: '初始化',
    codeLine: 0,
  });

  function rec(lo: number, hi: number, depth: number): number {
    if (hi - lo <= 1) return 0;
    const mid = (lo + hi) >> 1;

    steps.push({
      state: snap({ lo, hi, mid, depth, phase: 'split', message: `分解：[${lo},${hi}) 从中间 ${mid} 分成 [${lo},${mid}) 和 [${mid},${hi})` }),
      description: `分解 [${lo},${hi})`,
      codeLine: 2,
    });

    let inv = rec(lo, mid, depth + 1);
    inv += rec(mid, hi, depth + 1);

    // merge
    const tmp: number[] = [];
    let i = lo, j = mid;
    while (i < mid && j < hi) {
      if (nums[i] <= nums[j]) {
        tmp.push(nums[i]);
        steps.push({
          state: snap({ lo, hi, mid, depth, phase: 'merge', mergeI: i, mergeJ: j, tmpSegment: [...tmp], message: `nums[${i}]=${nums[i]} ≤ nums[${j}]=${nums[j]}，取左半元素` }),
          description: `取 ${nums[i]}`,
          codeLine: 7,
        });
        i++;
      } else {
        const add = mid - i;
        tmp.push(nums[j]);
        inv += add;
        totalInv += add;
        steps.push({
          state: snap({ lo, hi, mid, depth, phase: 'merge', mergeI: i, mergeJ: j, tmpSegment: [...tmp], invStep: add, message: `nums[${i}]=${nums[i]} > nums[${j}]=${nums[j]}，取右半元素，逆序对 +${add}（左半还有 ${add} 个比 ${nums[j]} 大）` }),
          description: `逆序 +${add}`,
          codeLine: 8,
        });
        j++;
      }
    }
    if (i < mid) {
      while (i < mid) { tmp.push(nums[i]); i++; }
      steps.push({
        state: snap({ lo, hi, mid, depth, phase: 'merge', mergeI: mid - 1, mergeJ: j, tmpSegment: [...tmp], message: '复制左半剩余元素' }),
        description: '左半剩余',
        codeLine: 10,
      });
    }
    if (j < hi) {
      while (j < hi) { tmp.push(nums[j]); j++; }
      steps.push({
        state: snap({ lo, hi, mid, depth, phase: 'merge', mergeI: i, mergeJ: hi - 1, tmpSegment: [...tmp], message: '复制右半剩余元素' }),
        description: '右半剩余',
        codeLine: 11,
      });
    }

    for (let p = lo; p < hi; p++) nums[p] = tmp[p - lo];
    steps.push({
      state: snap({ lo, hi, mid, depth, phase: 'writeback', message: `合并完成，写回 [${lo},${hi})，该区间已有序，本段累计逆序对 ${inv}` }),
      description: `写回 [${lo},${hi})`,
      codeLine: 12,
    });

    return inv;
  }

  rec(0, n, 0);

  steps.push({
    state: snap({ phase: 'done', message: `排序完成，总逆序对数 = ${totalInv}` }),
    description: `逆序对 = ${totalInv}`,
    codeLine: 13,
  });

  return steps;
}

export function DivideAndConquerPanel() {
  const [seed, setSeed] = useState<number[]>([5, 2, 8, 1, 9, 3, 7, 4]);
  const steps = useMemo(() => buildSteps(seed), [seed]);

  const initial: DCState = {
    nums: seed,
    lo: -1,
    hi: -1,
    mid: -1,
    mergeI: -1,
    mergeJ: -1,
    tmpSegment: [],
    invStep: 0,
    totalInv: 0,
    depth: 0,
    phase: 'init',
    message: '',
  };

  const maxVal = Math.max(...seed, 1);

  return (
    <Stepper<DCState>
      steps={steps}
      initialState={initial}
      codeLines={dcCode}
      codeTitle="分治 Divide & Conquer（归并求逆序对）"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((x) => Number.isFinite(x) && x >= 0 && x <= 20);
              if (parsed.length >= 2 && parsed.length <= 12) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="逗号分隔"
          />
        </>
      }
      render={(state) => {
        const inRange = (i: number) => i >= state.lo && i < state.hi;
        const leftVals = state.mid >= 0 ? state.nums.slice(state.lo, state.mid) : [];
        const rightVals = state.mid >= 0 ? state.nums.slice(state.mid, state.hi) : [];
        return (
          <div className="space-y-5">
            <div className="text-xs text-gray-500">
              蓝色=左半，紫色=右半，黄色=当前比较指针，红色=逆序对产生，绿色=已合并
            </div>

            {/* Array bars */}
            <div className="flex items-end justify-center gap-1.5" style={{ height: 150 }}>
              {state.nums.map((v, i) => {
                const isLeft = inRange(i) && i < state.mid;
                const isRight = inRange(i) && i >= state.mid;
                const isSorted = state.phase === 'writeback' && inRange(i);
                const isDone = state.phase === 'done';
                const isPtr = i === state.mergeI || i === state.mergeJ;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={clsx(
                        'w-8 flex items-end justify-center rounded-t text-[10px] font-mono pb-0.5 transition-all border-b-2',
                        isSorted || isDone
                          ? 'bg-green-500/25 border-green-500 text-green-200'
                          : state.invStep > 0 && isPtr && i === state.mergeJ
                            ? 'bg-red-500/30 border-red-500 text-red-200'
                            : isPtr
                              ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200'
                              : isLeft
                                ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                                : isRight
                                  ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                                  : 'bg-surface-2 border-edge-2 text-gray-400',
                      )}
                      style={{ height: Math.max(18, (v / maxVal) * 110) }}
                    >
                      {v}
                    </div>
                    <div className="text-[9px] text-gray-600">{i}</div>
                  </div>
                );
              })}
            </div>

            {/* Merge workspace */}
            {state.phase === 'merge' && state.mid >= 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  <span className="text-[10px] text-blue-400 w-10">左半:</span>
                  {leftVals.map((v, idx) => {
                    const gi = state.lo + idx;
                    const taken = gi < state.mergeI;
                    const isPtr = gi === state.mergeI;
                    return (
                      <div key={idx} className={clsx('w-8 h-8 flex items-center justify-center rounded text-xs font-mono border', taken ? 'opacity-30 border-edge-2 text-gray-500' : isPtr ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200' : 'bg-blue-500/15 border-blue-600 text-blue-200')}>
                        {v}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  <span className="text-[10px] text-purple-400 w-10">右半:</span>
                  {rightVals.map((v, idx) => {
                    const gj = state.mid + idx;
                    const taken = gj < state.mergeJ;
                    const isPtr = gj === state.mergeJ;
                    const isInv = state.invStep > 0 && isPtr;
                    return (
                      <div key={idx} className={clsx('w-8 h-8 flex items-center justify-center rounded text-xs font-mono border', taken ? 'opacity-30 border-edge-2 text-gray-500' : isInv ? 'bg-red-500/30 border-red-500 text-red-200' : isPtr ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200' : 'bg-purple-500/15 border-purple-600 text-purple-200')}>
                        {v}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  <span className="text-[10px] text-green-400 w-10">tmp:</span>
                  {state.tmpSegment.map((v, idx) => (
                    <div key={idx} className={clsx('w-8 h-8 flex items-center justify-center rounded text-xs font-mono border', idx === state.tmpSegment.length - 1 ? 'bg-green-500/30 border-green-400 text-green-200' : 'bg-green-500/10 border-green-800 text-green-300')}>
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inversion counter */}
            <div className="flex items-center justify-center gap-6 text-sm font-mono">
              <span className="text-gray-400">
                总逆序对: <span className="text-red-400 font-bold">{state.totalInv}</span>
              </span>
              {state.invStep > 0 && (
                <span className="text-red-300">本步 +{state.invStep}</span>
              )}
            </div>

            {state.message && (
              <div className="text-center text-sm text-gray-300">{state.message}</div>
            )}
          </div>
        );
      }}
    />
  );
}
