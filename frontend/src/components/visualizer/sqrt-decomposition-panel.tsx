'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const sqrtCode = [
  'function sqrtDecompose(nums) {',
  '  const n = nums.length, size = Math.ceil(Math.sqrt(n));',
  '  const blocks = new Array(Math.ceil(n / size)).fill(0);',
  '  for (let i = 0; i < n; i++) blocks[Math.floor(i / size)] += nums[i];',
  '  return { nums, blocks, size };',
  '}',
  'function querySum(st, l, r) {',
  '  let sum = 0;',
  '  for (let i = l; i <= r; i++) {',
  '    if (i % st.size === 0 && i + st.size - 1 <= r) {',
  '      sum += st.blocks[i / st.size];',
  '      i += st.size - 1;',
  '    } else {',
  '      sum += st.nums[i];',
  '    }',
  '  }',
  '  return sum;',
  '}',
  'function update(st, i, val) {',
  '  const b = Math.floor(i / st.size);',
  '  st.blocks[b] += val - st.nums[i];',
  '  st.nums[i] = val;',
  '}',
];

interface SqrtState {
  nums: number[];
  blocks: number[];
  size: number;
  queryL: number;
  queryR: number;
  scanIdx: number;
  partialSum: number;
  wholeBlocks: number[];
  scatterIdxs: number[];
  updateIdx: number;
  updateVal: number | null;
  buildBlock: number;
  phase: 'build' | 'query' | 'update' | 'done';
  message: string;
}

export function buildSteps(numsInput: number[], queryL: number, queryR: number, updIdx: number, updVal: number): VizStep<SqrtState>[] {
  const steps: VizStep<SqrtState>[] = [];
  const nums = [...numsInput];
  const n = nums.length;
  const size = Math.ceil(Math.sqrt(n));
  const numBlocks = Math.ceil(n / size);
  const blocks = new Array(numBlocks).fill(0);

  const snap = (partial: Partial<SqrtState> & { message: string }): SqrtState => ({
    nums: [...nums],
    blocks: [...blocks],
    size,
    queryL: -1,
    queryR: -1,
    scanIdx: -1,
    partialSum: 0,
    wholeBlocks: [],
    scatterIdxs: [],
    updateIdx: -1,
    updateVal: null,
    buildBlock: -1,
    phase: 'build',
    ...partial,
  });

  steps.push({
    state: snap({ message: `数组长度 ${n}，块大小 = ⌈√${n}⌉ = ${size}，共 ${numBlocks} 块` }),
    description: '确定块大小',
    codeLine: 1,
  });

  for (let i = 0; i < n; i++) {
    const b = Math.floor(i / size);
    const before = blocks[b];
    blocks[b] += nums[i];
    steps.push({
      state: snap({ buildBlock: b, message: `blocks[${b}] += nums[${i}]：${before} + ${nums[i]} = ${blocks[b]}` }),
      description: `blocks[${b}]=${blocks[b]}`,
      codeLine: 3,
    });
  }

  steps.push({
    state: snap({ message: `分块完成，每块维护和：[${blocks.join(', ')}]` }),
    description: '分块完成',
    codeLine: 4,
  });

  // Query
  const l = queryL;
  const r = Math.min(queryR, n - 1);
  let sum = 0;
  const wholeBlocks: number[] = [];
  const scatterIdxs: number[] = [];

  steps.push({
    state: snap({ queryL: l, queryR: r, phase: 'query', message: `查询区间 [${l}, ${r}] 的和` }),
    description: `查询 [${l},${r}]`,
    codeLine: 7,
  });

  for (let i = l; i <= r; i++) {
    if (i % size === 0 && i + size - 1 <= r) {
      const b = i / size;
      sum += blocks[b];
      wholeBlocks.push(b);
      steps.push({
        state: snap({
          queryL: l, queryR: r, scanIdx: i, partialSum: sum,
          wholeBlocks: [...wholeBlocks], scatterIdxs: [...scatterIdxs], phase: 'query',
          message: `索引 ${i} 是块 ${b} 起点且整块被覆盖：sum += blocks[${b}] = ${blocks[b]}，跳过整块`,
        }),
        description: `整块${b} +${blocks[b]}`,
        codeLine: 10,
      });
      i += size - 1;
    } else {
      sum += nums[i];
      scatterIdxs.push(i);
      steps.push({
        state: snap({
          queryL: l, queryR: r, scanIdx: i, partialSum: sum,
          wholeBlocks: [...wholeBlocks], scatterIdxs: [...scatterIdxs], phase: 'query',
          message: `索引 ${i} 为零散元素：sum += nums[${i}] = ${nums[i]}`,
        }),
        description: `零散 +${nums[i]}`,
        codeLine: 13,
      });
    }
  }

  steps.push({
    state: snap({
      queryL: l, queryR: r, partialSum: sum,
      wholeBlocks: [...wholeBlocks], scatterIdxs: [...scatterIdxs], phase: 'query',
      message: `查询完成：sum[${l}..${r}] = ${sum}（整块 ${wholeBlocks.length} 个 + 零散 ${scatterIdxs.length} 个）`,
    }),
    description: `结果 = ${sum}`,
    codeLine: 16,
  });

  // Update
  const b = Math.floor(updIdx / size);
  const delta = updVal - nums[updIdx];
  steps.push({
    state: snap({ updateIdx: updIdx, updateVal: updVal, phase: 'update', message: `单点修改：nums[${updIdx}] = ${updVal}，所在块 ${b}` }),
    description: `修改 [${updIdx}]`,
    codeLine: 19,
  });

  blocks[b] += delta;
  steps.push({
    state: snap({ updateIdx: updIdx, updateVal: updVal, phase: 'update', message: `blocks[${b}] += ${updVal} - ${nums[updIdx]} = ${delta}，块和更新为 ${blocks[b]}` }),
    description: `blocks[${b}]=${blocks[b]}`,
    codeLine: 20,
  });

  nums[updIdx] = updVal;
  steps.push({
    state: snap({ updateIdx: updIdx, updateVal: updVal, phase: 'done', message: `nums[${updIdx}] 更新为 ${updVal}，修改完成（O(1)）` }),
    description: '更新完成',
    codeLine: 21,
  });

  return steps;
}

export function SqrtDecompositionPanel() {
  const [nums] = useState([3, 1, 4, 1, 5, 9, 2, 6, 7, 4]);
  const [queryText, setQueryText] = useState('1,8');
  const [updateText, setUpdateText] = useState('5,3');

  const [queryL, queryR] = useMemo(() => {
    const p = queryText.split(',').map((s) => Number(s.trim()));
    return p.length === 2 && p.every(Number.isFinite) ? [Math.max(0, p[0]), Math.min(nums.length - 1, p[1])] : [1, 8];
  }, [queryText, nums.length]);

  const [updIdx, updVal] = useMemo(() => {
    const p = updateText.split(',').map((s) => Number(s.trim()));
    return p.length === 2 && p.every(Number.isFinite) ? [Math.max(0, Math.min(nums.length - 1, p[0])), p[1]] : [5, 3];
  }, [updateText, nums.length]);

  const steps = useMemo(() => buildSteps(nums, queryL, queryR, updIdx, updVal), [nums, queryL, queryR, updIdx, updVal]);

  const size = Math.ceil(Math.sqrt(nums.length));
  const numBlocks = Math.ceil(nums.length / size);

  const initial: SqrtState = {
    nums,
    blocks: new Array(numBlocks).fill(0),
    size,
    queryL: -1,
    queryR: -1,
    scanIdx: -1,
    partialSum: 0,
    wholeBlocks: [],
    scatterIdxs: [],
    updateIdx: -1,
    updateVal: null,
    buildBlock: -1,
    phase: 'build',
    message: '',
  };

  return (
    <Stepper<SqrtState>
      steps={steps}
      initialState={initial}
      codeLines={sqrtCode}
      codeTitle="分块 Sqrt Decomposition"
      headerActions={
        <>
          <span className="text-sm text-gray-400">查询(l,r):</span>
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-20"
            placeholder="如 1,8"
          />
          <span className="text-sm text-gray-400">更新(i,val):</span>
          <input
            type="text"
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-20"
            placeholder="如 5,3"
          />
        </>
      }
      render={(state) => {
        const blockOf = (i: number) => Math.floor(i / state.size);
        return (
          <div className="space-y-5">
            <div className="text-xs text-gray-500">
              黄色=当前扫描，绿色=整块贡献，蓝色=零散元素，紫色=单点修改
            </div>

            {/* Blocks row */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">blocks[]（块和）:</div>
              <div className="flex gap-2 flex-wrap">
                {state.blocks.map((bv, b) => {
                  const isWhole = state.wholeBlocks.includes(b);
                  const isBuilding = state.buildBlock === b;
                  const isUpdated = state.phase === 'update' && blockOf(state.updateIdx) === b;
                  return (
                    <div
                      key={b}
                      className={clsx(
                        'px-3 py-2 rounded-lg border text-center transition-all',
                        isWhole
                          ? 'bg-green-500/20 border-green-500'
                          : isUpdated
                            ? 'bg-purple-500/20 border-purple-500'
                            : isBuilding
                              ? 'bg-yellow-500/20 border-yellow-500'
                              : 'bg-surface-2 border-edge-2',
                      )}
                    >
                      <div className="text-[9px] text-gray-500">块 {b}</div>
                      <div className={clsx('text-sm font-mono font-bold', isWhole ? 'text-green-300' : isUpdated ? 'text-purple-300' : 'text-gray-300')}>
                        {bv}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nums row grouped by block */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">nums[]:</div>
              <div className="flex gap-2 flex-wrap">
                {state.blocks.map((_, b) => (
                  <div key={b} className="flex gap-0.5 border border-edge rounded p-0.5">
                    {state.nums.map((v, i) => {
                      if (blockOf(i) !== b) return null;
                      const inQuery = state.phase === 'query' && i >= state.queryL && i <= state.queryR;
                      const isScan = i === state.scanIdx;
                      const isScatter = state.scatterIdxs.includes(i);
                      const isWholeCell = state.wholeBlocks.includes(b) && inQuery;
                      const isUpdate = i === state.updateIdx && (state.phase === 'update' || state.phase === 'done');
                      return (
                        <div
                          key={i}
                          className={clsx(
                            'w-9 h-9 flex items-center justify-center rounded text-xs font-mono border transition-all',
                            isScan
                              ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                              : isUpdate
                                ? 'bg-purple-500/25 border-purple-400 text-purple-200'
                                : isWholeCell
                                  ? 'bg-green-500/20 border-green-600 text-green-300'
                                  : isScatter
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                    : inQuery
                                      ? 'bg-blue-500/10 border-blue-900 text-blue-200'
                                      : 'bg-surface-2 border-edge-2 text-gray-400',
                          )}
                        >
                          {v}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {state.nums.map((_, i) => (
                  <div key={i} className="w-9 text-center text-[9px] text-gray-600">{i}</div>
                ))}
              </div>
            </div>

            {/* Partial sum */}
            {state.phase === 'query' && (
              <div className="text-center text-sm font-mono">
                <span className="text-gray-400">当前累计: </span>
                <span className="text-green-300 font-bold">{state.partialSum}</span>
              </div>
            )}

            {state.message && (
              <div className="text-center text-sm text-gray-300">{state.message}</div>
            )}
          </div>
        );
      }}
    />
  );
}
