'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const backtrackingCode = [
  'function permute(nums) {',
  '  const res = [], path = [], used = Array(nums.length).fill(false);',
  '  function backtrack() {',
  '    if (path.length === nums.length) { res.push([...path]); return; }',
  '    for (let i = 0; i < nums.length; i++) {',
  '      if (used[i]) continue;',
  '      used[i] = true; path.push(nums[i]);',
  '      backtrack();',
  '      path.pop(); used[i] = false;',
  '    }',
  '  }',
  '  backtrack();',
  '  return res;',
  '}',
];

interface BacktrackState {
  nums: number[];
  path: number[];
  used: boolean[];
  results: number[][];
  currentLevel: number;
  tryingIndex: number | null;
  backtracking: boolean;
  message: string;
}

export function buildSteps(nums: number[]): VizStep<BacktrackState>[] {
  const steps: VizStep<BacktrackState>[] = [];
  const n = nums.length;
  const used = Array(n).fill(false);
  const path: number[] = [];
  const results: number[][] = [];

  steps.push({
    state: { nums, path: [], used: [...used], results: [], currentLevel: 0, tryingIndex: null, backtracking: false, message: `开始全排列 [${nums.join(', ')}]` },
    description: '初始化，开始回溯',
    codeLine: 2,
  });

  function backtrack(level: number) {
    if (level === n) {
      results.push([...path]);
      steps.push({
        state: { nums, path: [...path], used: [...used], results: results.map((r) => [...r]), currentLevel: level, tryingIndex: null, backtracking: false, message: `✅ 找到排列 [${path.join(', ')}]（第 ${results.length} 个）` },
        description: `找到排列 [${path.join(', ')}]`,
        codeLine: 4,
      });
      return;
    }

    for (let i = 0; i < n; i++) {
      if (used[i]) {
        steps.push({
          state: { nums, path: [...path], used: [...used], results: results.map((r) => [...r]), currentLevel: level, tryingIndex: i, backtracking: false, message: `第${level + 1}层：nums[${i}]=${nums[i]} 已使用，跳过` },
          description: `跳过已使用的 ${nums[i]}`,
          codeLine: 6,
        });
        continue;
      }

      steps.push({
        state: { nums, path: [...path], used: [...used], results: results.map((r) => [...r]), currentLevel: level, tryingIndex: i, backtracking: false, message: `第${level + 1}层：选择 nums[${i}]=${nums[i]}` },
        description: `选择 ${nums[i]}`,
        codeLine: 7,
      });

      used[i] = true;
      path.push(nums[i]);

      steps.push({
        state: { nums, path: [...path], used: [...used], results: results.map((r) => [...r]), currentLevel: level, tryingIndex: i, backtracking: false, message: `路径 → [${path.join(', ')}]，进入第${level + 2}层` },
        description: `路径 [${path.join(', ')}]`,
        codeLine: 8,
      });

      backtrack(level + 1);

      path.pop();
      used[i] = false;

      steps.push({
        state: { nums, path: [...path], used: [...used], results: results.map((r) => [...r]), currentLevel: level, tryingIndex: i, backtracking: true, message: `回溯：撤销选择 ${nums[i]}，路径 → [${path.join(', ')}]` },
        description: `回溯，撤销 ${nums[i]}`,
        codeLine: 9,
      });
    }
  }

  backtrack(0);

  steps.push({
    state: { nums, path: [], used: Array(n).fill(false), results: results.map((r) => [...r]), currentLevel: 0, tryingIndex: null, backtracking: false, message: `🎉 完成！共 ${results.length} 个排列` },
    description: `完成，共 ${results.length} 个排列`,
    codeLine: 13,
  });

  return steps;
}

export function BacktrackingPanel() {
  const [seed, setSeed] = useState<number[]>([1, 2, 3]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: BacktrackState = {
    nums: seed,
    path: [],
    used: Array(seed.length).fill(false),
    results: [],
    currentLevel: 0,
    tryingIndex: null,
    backtracking: false,
    message: '',
  };

  return (
    <Stepper<BacktrackState>
      steps={steps}
      initialState={initial}
      codeLines={backtrackingCode}
      codeTitle="回溯全排列 Backtracking"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value
                .split(',')
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n));
              if (parsed.length >= 2 && parsed.length <= 5) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-32"
            placeholder="2~5个数"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          {/* Source array */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500">nums:</span>
            {state.nums.map((v, i) => (
              <div
                key={i}
                className={clsx(
                  'w-10 h-10 flex items-center justify-center rounded text-sm font-medium border transition-all',
                  state.used[i]
                    ? 'bg-gray-700/50 border-gray-600 text-gray-500 line-through'
                    : state.tryingIndex === i
                      ? state.backtracking
                        ? 'bg-red-500/20 border-red-400 text-red-200'
                        : 'bg-blue-500/30 border-blue-400 text-blue-200'
                      : 'bg-surface-2 border-edge-2 text-gray-200',
                )}
              >
                {v}
              </div>
            ))}
          </div>

          {/* Current path */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500">路径:</span>
            {state.path.length === 0 && <span className="text-gray-600 text-sm">空</span>}
            {state.path.map((v, i) => (
              <div
                key={i}
                className="w-10 h-10 flex items-center justify-center rounded bg-green-500/20 border border-green-500 text-green-200 text-sm font-medium"
              >
                {v}
              </div>
            ))}
            <span className="text-xs text-gray-500 ml-2">深度 {state.currentLevel}</span>
          </div>

          {/* Results */}
          <div className="p-3 bg-surface border border-edge rounded-lg">
            <div className="text-xs text-gray-500 mb-2">
              已找到排列 ({state.results.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {state.results.length === 0 && <span className="text-gray-600 text-xs">暂无</span>}
              {state.results.map((r, i) => (
                <span
                  key={i}
                  className={clsx(
                    'px-2 py-1 rounded text-xs font-mono',
                    i === state.results.length - 1
                      ? 'bg-green-500/20 text-green-200 border border-green-500/50'
                      : 'bg-surface-2 text-gray-400 border border-edge-2',
                  )}
                >
                  [{r.join(',')}]
                </span>
              ))}
            </div>
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}

          <div className="text-[11px] text-gray-500 text-center">
            回溯模板：<strong className="text-gray-300">选择 → 递归 → 撤销选择</strong>
          </div>
        </div>
      )}
    />
  );
}
