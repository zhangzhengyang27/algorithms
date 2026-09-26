'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const prefixSumCode = [
  'function buildPrefixSum(nums) {',
  '  const prefix = new Array(nums.length + 1).fill(0);',
  '  for (let i = 0; i < nums.length; i++)',
  '    prefix[i + 1] = prefix[i] + nums[i];',
  '  return prefix;',
  '}',
  'function rangeSum(prefix, l, r) {',
  '  return prefix[r + 1] - prefix[l];',
  '}',
];

interface PrefixState {
  nums: number[];
  prefix: number[];
  buildIdx: number;
  queryL: number;
  queryR: number;
  queryResult: number | null;
  phase: 'build' | 'query';
  message: string;
}

export function buildSteps(nums: number[], queries: [number, number][]): VizStep<PrefixState>[] {
  const steps: VizStep<PrefixState>[] = [];
  const prefix = new Array(nums.length + 1).fill(0);

  steps.push({
    state: { nums, prefix: [...prefix], buildIdx: -1, queryL: -1, queryR: -1, queryResult: null, phase: 'build', message: `原数组 [${nums.join(', ')}]，构建前缀和 prefix[0]=0` },
    description: '初始化',
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
    steps.push({
      state: { nums, prefix: [...prefix], buildIdx: i + 1, queryL: -1, queryR: -1, queryResult: null, phase: 'build', message: `prefix[${i + 1}] = prefix[${i}] + nums[${i}] = ${prefix[i] - nums[i]} + ${nums[i]} = ${prefix[i + 1]}` },
      description: `prefix[${i + 1}]=${prefix[i + 1]}`,
      codeLine: 4,
    });
  }

  steps.push({
    state: { nums, prefix: [...prefix], buildIdx: -1, queryL: -1, queryR: -1, queryResult: null, phase: 'build', message: `前缀和构建完成：[${prefix.join(', ')}]` },
    description: '构建完成',
    codeLine: 5,
  });

  for (const [l, r] of queries) {
    steps.push({
      state: { nums, prefix: [...prefix], buildIdx: -1, queryL: l, queryR: r, queryResult: null, phase: 'query', message: `查询区间 [${l}, ${r}] 的和` },
      description: `查询 [${l},${r}]`,
      codeLine: 7,
    });

    const result = prefix[r + 1] - prefix[l];
    steps.push({
      state: { nums, prefix: [...prefix], buildIdx: -1, queryL: l, queryR: r, queryResult: result, phase: 'query', message: `sum[${l}..${r}] = prefix[${r + 1}] - prefix[${l}] = ${prefix[r + 1]} - ${prefix[l]} = ${result}` },
      description: `结果 = ${result}`,
      codeLine: 8,
    });
  }

  return steps;
}

export function PrefixSumPanel() {
  const [seed, setSeed] = useState<number[]>([3, 1, 4, 1, 5, 9, 2, 6]);
  const [queriesText, setQueriesText] = useState('0,3 2,5 1,7');

  const queries = useMemo<[number, number][]>(() => {
    return queriesText
      .split(/\s+/)
      .map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 2 && p.every(Number.isFinite))
      .map(([l, r]) => [l, r] as [number, number]);
  }, [queriesText]);

  const steps = useMemo(() => buildSteps(seed, queries), [seed, queries]);
  const initial: PrefixState = {
    nums: seed,
    prefix: new Array(seed.length + 1).fill(0),
    buildIdx: -1,
    queryL: -1,
    queryR: -1,
    queryResult: null,
    phase: 'build',
    message: '',
  };

  return (
    <Stepper<PrefixState>
      steps={steps}
      initialState={initial}
      codeLines={prefixSumCode}
      codeTitle="前缀和 Prefix Sum"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
              if (parsed.length >= 2) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">查询(l,r):</span>
          <input
            type="text"
            value={queriesText}
            onChange={(e) => setQueriesText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40"
            placeholder="如 0,3 2,5"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前构建位置，蓝色=查询区间，绿色=查询结果
          </div>

          {/* Original array */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">nums[]:</div>
            <div className="flex gap-1 flex-wrap">
              {state.nums.map((v, i) => {
                const inQuery = state.phase === 'query' && i >= state.queryL && i <= state.queryR;
                return (
                  <div
                    key={i}
                    className={clsx(
                      'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                      inQuery
                        ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                        : 'bg-surface-2 border-edge-2 text-gray-300',
                    )}
                  >
                    {v}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prefix array */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">prefix[]:</div>
            <div className="flex gap-1 flex-wrap">
              {state.prefix.map((v, i) => {
                const isBuilding = i === state.buildIdx;
                const isQueryEndpoint = state.phase === 'query' && (i === state.queryL || i === state.queryR + 1);
                return (
                  <div
                    key={i}
                    className={clsx(
                      'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                      isBuilding
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                        : isQueryEndpoint
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : 'bg-surface-2 border-edge-2 text-gray-400',
                    )}
                  >
                    {v}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 flex-wrap">
              {state.prefix.map((_, i) => (
                <div key={i} className="w-10 text-center text-[9px] text-gray-600">{i}</div>
              ))}
            </div>
          </div>

          {/* Query result */}
          {state.phase === 'query' && state.queryResult !== null && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                sum[{state.queryL}..{state.queryR}] = {state.queryResult}
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
