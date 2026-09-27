'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const dpDigitCode = [
  'function countDigitOne(n) {',
  "  const digits = String(n).split('').map(Number);",
  '  const memo = new Map();',
  '  function dfs(pos, cnt, limit) {',
  '    if (pos === digits.length) return cnt;',
  "    const key = pos + ',' + cnt + ',' + limit;",
  '    if (!limit && memo.has(key)) return memo.get(key);',
  '    const up = limit ? digits[pos] : 9;',
  '    let res = 0;',
  '    for (let d = 0; d <= up; d++)',
  '      res += dfs(pos + 1, cnt + (d === 1 ? 1 : 0), limit && d === up);',
  '    if (!limit) memo.set(key, res);',
  '    return res;',
  '  }',
  '  return dfs(0, 0, true);',
  '}',
];

interface MemoEntry { pos: number; cnt: number; value: number }
interface Frame { pos: number; cnt: number; limit: boolean }

interface DpDigitState {
  n: number;
  digits: number[];
  pos: number;
  cnt: number;
  limit: boolean;
  up: number;
  currentDigit: number;
  memoEntries: MemoEntry[];
  callStack: Frame[];
  phase: 'init' | 'dfs' | 'memo' | 'done';
  result: number | null;
  message: string;
}

export function buildSteps(n: number): VizStep<DpDigitState>[] {
  const digits = String(n).split('').map(Number);
  const steps: VizStep<DpDigitState>[] = [];
  const memo = new Map<string, number>();
  const memoList: MemoEntry[] = [];
  const callStack: Frame[] = [];

  const st = (partial: Partial<DpDigitState> & { message: string }): DpDigitState => ({
    n, digits, memoEntries: [...memoList], callStack: [...callStack],
    pos: -1, cnt: 0, limit: false, up: -1, currentDigit: -1,
    phase: 'dfs', result: null,
    ...partial,
  });

  steps.push({
    state: st({ phase: 'init', message: `分解 n=${n} → digits=[${digits.join(', ')}]，从最高位 pos=0 开始记忆化搜索` }),
    description: '数位分解',
    codeLine: 1,
  });

  function dfsSilent(pos: number, cnt: number): number {
    if (pos === digits.length) return cnt;
    const key = pos + ',' + cnt + ',false';
    if (memo.has(key)) return memo.get(key)!;
    let res = 0;
    for (let d = 0; d <= 9; d++) res += dfsSilent(pos + 1, cnt + (d === 1 ? 1 : 0));
    memo.set(key, res);
    memoList.push({ pos, cnt, value: res });
    return res;
  }

  function dfs(pos: number, cnt: number, limit: boolean): number {
    if (pos === digits.length) return cnt;
    const key = pos + ',' + cnt + ',' + limit;
    callStack.push({ pos, cnt, limit });

    if (!limit && memo.has(key)) {
      const v = memo.get(key)!;
      steps.push({
        state: st({ pos, cnt, limit, phase: 'memo', message: `记忆化命中 dfs(${pos}, ${cnt}, free) = ${v}，直接返回，跳过重复子树` }),
        description: `记忆化=${v}`,
        codeLine: 6,
      });
      callStack.pop();
      return v;
    }

    const up = limit ? digits[pos] : 9;

    if (!limit) {
      let res = 0;
      for (let d = 0; d <= up; d++) res += dfsSilent(pos + 1, cnt + (d === 1 ? 1 : 0));
      memo.set(key, res);
      memoList.push({ pos, cnt, value: res });
      steps.push({
        state: st({ pos, cnt, limit, up, message: `自由状态 dfs(${pos}, ${cnt}, free)：d 可取 0~9，累加结果 = ${res}，写入记忆化` }),
        description: `free(${pos},${cnt})=${res}`,
        codeLine: 11,
      });
      callStack.pop();
      return res;
    }

    steps.push({
      state: st({ pos, cnt, limit, up, message: `受限状态 dfs(${pos}, ${cnt}, limit)：d 最大 = digits[${pos}] = ${up}` }),
      description: `dfs(${pos},${cnt},lim)`,
      codeLine: 7,
    });

    let res = 0;
    for (let d = 0; d <= up; d++) {
      const nextCnt = cnt + (d === 1 ? 1 : 0);
      const nextLimit = limit && d === up;
      if (pos + 1 === digits.length) {
        steps.push({
          state: st({ pos: pos + 1, cnt: nextCnt, limit: nextLimit, currentDigit: d, message: `d=${d} → 到达末位，返回 cnt=${nextCnt}` }),
          description: `末位=${nextCnt}`,
          codeLine: 4,
        });
        res += nextCnt;
      } else {
        steps.push({
          state: st({ pos, cnt, limit, currentDigit: d, message: `枚举 d=${d}，递归 dfs(${pos + 1}, ${nextCnt}, ${nextLimit ? 'limit' : 'free'})` }),
          description: `d=${d}`,
          codeLine: 10,
        });
        res += dfs(pos + 1, nextCnt, nextLimit);
      }
    }

    steps.push({
      state: st({ pos, cnt, limit, message: `dfs(${pos}, ${cnt}, limit) 汇总返回 ${res}` }),
      description: `返回=${res}`,
      codeLine: 12,
    });
    callStack.pop();
    return res;
  }

  const result = dfs(0, 0, true);
  steps.push({
    state: st({ phase: 'done', result, message: `1 ~ ${n} 中数字 1 出现的总次数 = ${result}` }),
    description: `结果=${result}`,
    codeLine: 14,
  });

  return steps;
}

export function DpDigitPanel() {
  const [n, setN] = useState(321);

  const steps = useMemo(() => buildSteps(n), [n]);
  const initial: DpDigitState = {
    n, digits: String(n).split('').map(Number),
    pos: -1, cnt: 0, limit: false, up: -1, currentDigit: -1,
    memoEntries: [], callStack: [],
    phase: 'init', result: null, message: '',
  };

  return (
    <Stepper<DpDigitState>
      steps={steps}
      initialState={initial}
      codeLines={dpDigitCode}
      codeTitle="数位DP·数字1的个数 Digit DP"
      headerActions={
        <>
          <span className="text-sm text-gray-400">n:</span>
          <input
            type="number"
            value={n}
            min={1}
            max={99999}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v >= 1 && v <= 99999) setN(v);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-28"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前处理数位，紫色=当前枚举的d，蓝色=记忆化表，绿色=已处理
          </div>

          {/* Digits */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">n = {state.n} 的数位分解:</div>
            <div className="flex gap-1 flex-wrap">
              {state.digits.map((d, i) => {
                const isCurrent = i === state.pos;
                const isDone = state.pos >= 0 && i < state.pos;
                return (
                  <div
                    key={i}
                    className={clsx(
                      'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                      isCurrent
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                        : isDone
                          ? 'bg-green-900/30 border-green-800 text-green-300'
                          : 'bg-surface-2 border-edge-2 text-gray-300',
                    )}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 flex-wrap">
              {state.digits.map((_, i) => (
                <div key={i} className="w-10 text-center text-[9px] text-gray-600">pos={i}</div>
              ))}
            </div>
          </div>

          {/* Current DFS state */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-surface-2 border border-edge-2 text-gray-300">pos = {state.pos}</span>
            <span className="px-2 py-1 rounded bg-surface-2 border border-edge-2 text-gray-300">cnt(已放1的个数) = {state.cnt}</span>
            <span className={clsx('px-2 py-1 rounded border', state.limit ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-green-500/20 border-green-600 text-green-300')}>
              {state.limit ? 'limit 受限' : 'free 自由'}
            </span>
            {state.up >= 0 && <span className="px-2 py-1 rounded bg-surface-2 border border-edge-2 text-gray-300">d 上界 = {state.up}</span>}
            {state.currentDigit >= 0 && <span className="px-2 py-1 rounded bg-purple-500/20 border-purple-400 text-purple-200">当前 d = {state.currentDigit}</span>}
          </div>

          {/* Call stack */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">递归调用栈:</div>
            <div className="flex flex-wrap gap-1">
              {state.callStack.length === 0 && <span className="text-xs text-gray-600">（空）</span>}
              {state.callStack.map((f, i) => (
                <span
                  key={i}
                  className={clsx(
                    'px-2 py-1 rounded text-xs font-mono border',
                    i === state.callStack.length - 1
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200'
                      : 'bg-surface-2 border-edge-2 text-gray-400',
                  )}
                >
                  dfs({f.pos},{f.cnt},{f.limit ? 'lim' : 'free'})
                </span>
              ))}
            </div>
          </div>

          {/* Memo table */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">记忆化表 memo（自由状态）:</div>
            <div className="flex flex-wrap gap-1">
              {state.memoEntries.length === 0 && <span className="text-xs text-gray-600">（暂无）</span>}
              {state.memoEntries.map((m, i) => (
                <span key={i} className="px-2 py-1 rounded text-xs font-mono bg-blue-500/15 border border-blue-500/50 text-blue-200">
                  ({m.pos},{m.cnt}) → {m.value}
                </span>
              ))}
            </div>
          </div>

          {state.phase === 'done' && state.result !== null && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">1 ~ {state.n} 中数字 1 出现 {state.result} 次</span>
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
