'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const bitCode = [
  'function lowbit(x) { return x & (-x); }',
  'function update(tree, n, i, delta) {',
  '  while (i <= n) {',
  '    tree[i] += delta;',
  '    i += lowbit(i);',
  '  }',
  '}',
  'function query(tree, i) {',
  '  let sum = 0;',
  '  while (i > 0) {',
  '    sum += tree[i];',
  '    i -= lowbit(i);',
  '  }',
  '  return sum;',
  '}',
];

interface BITState {
  nums: number[];
  tree: number[];
  activeIdx: number; // 1-based index being updated/queried
  path: number[]; // indices visited so far
  pathDone: number[]; // indices already accumulated
  queryTarget: number;
  querySum: number;
  phase: 'build' | 'update' | 'query';
  message: string;
}

function lowbit(x: number): number {
  return x & -x;
}

export function buildSteps(nums: number[], queryTarget: number): VizStep<BITState>[] {
  const steps: VizStep<BITState>[] = [];
  const n = nums.length;
  const tree = new Array(n + 1).fill(0);

  const snap = (
    active: number,
    path: number[],
    pathDone: number[],
    qTarget: number,
    qSum: number,
    phase: 'build' | 'update' | 'query',
    msg: string,
  ): BITState => ({
    nums,
    tree: [...tree],
    activeIdx: active,
    path: [...path],
    pathDone: [...pathDone],
    queryTarget: qTarget,
    querySum: qSum,
    phase,
    message: msg,
  });

  steps.push({
    state: snap(-1, [], [], -1, 0, 'build', `原数组 [${nums.join(', ')}]，tree[1..${n}] 初始为 0，通过 update 逐个建树`),
    description: '初始化',
    codeLine: 1,
  });

  // Build phase: update each element
  for (let i = 0; i < n; i++) {
    const oneIdx = i + 1;
    const fullPath: number[] = [];
    for (let j = oneIdx; j <= n; j += lowbit(j)) fullPath.push(j);

    steps.push({
      state: snap(oneIdx, [], [], -1, 0, 'build', `update(${oneIdx}, ${nums[i]})：从下标 ${oneIdx} 开始，沿 i += lowbit(i) 向上更新`),
      description: `update(${oneIdx}, ${nums[i]})`,
      codeLine: 2,
    });

    const visited: number[] = [];
    for (const idx of fullPath) {
      tree[idx] += nums[i];
      visited.push(idx);
      steps.push({
        state: snap(oneIdx, visited, visited, -1, 0, 'build', `tree[${idx}] += ${nums[i]} → ${tree[idx]}（${idx} 的二进制 lowbit=${lowbit(idx)}，管辖 [${idx - lowbit(idx) + 1}..${idx}]），下一站 ${idx + lowbit(idx) <= n ? idx + lowbit(idx) : '结束'}`),
        description: `tree[${idx}]=${tree[idx]}`,
        codeLine: 4,
      });
    }
  }

  steps.push({
    state: snap(-1, [], [], -1, 0, 'build', `建树完成：tree = [${tree.join(', ')}]`),
    description: '建树完成',
    codeLine: 6,
  });

  // Query phase: prefix sum [1..queryTarget]
  const qt = Math.min(Math.max(1, queryTarget), n);
  steps.push({
    state: snap(-1, [], [], qt, 0, 'query', `query(${qt})：求前缀和 sum[1..${qt}]，从下标 ${qt} 开始，沿 i -= lowbit(i) 向下跳`),
    description: `query(${qt})`,
    codeLine: 8,
  });

  let sum = 0;
  const qPath: number[] = [];
  let cur = qt;
  while (cur > 0) {
    qPath.push(cur);
    sum += tree[cur];
    steps.push({
      state: snap(cur, qPath, qPath, qt, sum, 'query', `sum += tree[${cur}] → ${sum}（覆盖区间 [${cur - lowbit(cur) + 1}..${cur}]），跳到 ${cur} - lowbit(${cur}) = ${cur - lowbit(cur)}`),
      description: `sum+=tree[${cur}]`,
      codeLine: 11,
    });
    cur -= lowbit(cur);
  }

  steps.push({
    state: snap(-1, qPath, qPath, qt, sum, 'query', `✅ sum[1..${qt}] = ${sum}`),
    description: `结果 = ${sum}`,
    codeLine: 14,
  });

  return steps;
}

export function BinaryIndexedTreePanel() {
  const [seed, setSeed] = useState<number[]>([3, 1, 4, 1, 5, 9, 2, 6]);
  const [queryTarget, setQueryTarget] = useState(6);

  const steps = useMemo(() => buildSteps(seed, queryTarget), [seed, queryTarget]);
  const initial: BITState = {
    nums: seed,
    tree: new Array(seed.length + 1).fill(0),
    activeIdx: -1,
    path: [],
    pathDone: [],
    queryTarget: -1,
    querySum: 0,
    phase: 'build',
    message: '',
  };

  return (
    <Stepper<BITState>
      steps={steps}
      initialState={initial}
      codeLines={bitCode}
      codeTitle="树状数组 Binary Indexed Tree"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((num) => Number.isFinite(num));
              if (parsed.length >= 2 && parsed.length <= 16) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">query(i):</span>
          <input
            type="number"
            value={queryTarget}
            onChange={(e) => setQueryTarget(Math.max(1, Math.min(seed.length, Number(e.target.value))))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前操作下标，蓝色=访问路径，绿色=查询累加。tree[i] 管辖原数组区间 [i-lowbit(i)+1, i]
          </div>

          {/* Original array */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">nums[] (1-based):</div>
            <div className="flex gap-1 flex-wrap">
              {state.nums.map((v, i) => {
                const oneIdx = i + 1;
                const isActive = state.activeIdx === oneIdx;
                const covered = state.phase === 'query' && state.path.length > 0 &&
                  state.path.some((p) => oneIdx >= p - lowbit(p) + 1 && oneIdx <= p);
                return (
                  <div
                    key={i}
                    className={clsx(
                      'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                      isActive
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                        : covered
                          ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                          : 'bg-surface-2 border-edge-2 text-gray-300',
                    )}
                  >
                    {v}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 flex-wrap">
              {state.nums.map((_, i) => (
                <div key={i} className="w-10 text-center text-[9px] text-gray-600">{i + 1}</div>
              ))}
            </div>
          </div>

          {/* BIT tree array with coverage ranges */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">tree[] (每个 tree[i] 覆盖 lowbit(i) 个元素):</div>
            <div className="flex gap-1 flex-wrap items-end">
              {state.tree.slice(1).map((v, i) => {
                const oneIdx = i + 1;
                const lb = lowbit(oneIdx);
                const isActive = state.activeIdx === oneIdx;
                const inPath = state.path.includes(oneIdx);
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={clsx(
                        'flex items-center justify-center rounded text-sm font-mono border transition-all',
                        lb >= 4 ? 'w-12 h-12' : 'w-10 h-10',
                        isActive
                          ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                          : inPath
                            ? state.phase === 'query'
                              ? 'bg-green-500/20 border-green-500 text-green-300'
                              : 'bg-blue-500/20 border-blue-400 text-blue-200'
                            : 'bg-surface-2 border-edge-2 text-gray-400',
                      )}
                    >
                      {v}
                    </div>
                    <div className="text-[9px] text-gray-600 font-mono">
                      [{oneIdx - lb + 1}..{oneIdx}]
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 flex-wrap">
              {state.tree.slice(1).map((_, i) => (
                <div key={i} className={clsx('text-center text-[9px] text-gray-600', lowbit(i + 1) >= 4 ? 'w-12' : 'w-10')}>{i + 1}</div>
              ))}
            </div>
          </div>

          {/* Query result */}
          {state.phase === 'query' && state.queryTarget > 0 && state.querySum > 0 && state.activeIdx === -1 && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                sum[1..{state.queryTarget}] = {state.querySum}
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
