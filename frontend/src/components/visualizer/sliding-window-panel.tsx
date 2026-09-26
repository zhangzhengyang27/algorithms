'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, PlusMinusInput, type VizStep } from './stepper';

const slidingWindowCode = [
  'function lengthOfLongestSubstring(s) {',
  '  const set = new Set();',
  '  let left = 0, best = 0;',
  '  for (let right = 0; right < s.length; right++) {',
  '    while (set.has(s[right])) {',
  '      set.delete(s[left]);',
  '      left++;',
  '    }',
  '    set.add(s[right]);',
  '    best = Math.max(best, right - left + 1);',
  '  }',
  '  return best;',
  '}',
];

interface WindowState {
  s: string;
  left: number;
  right: number;          // 下一个将检查的位置
  window: string;         // s[left..right-1] 的字符串
  set: string[];          // 当前窗口内出现过的字符
  best: number;
  bestWindow: [number, number];
  duplicateRight: boolean;
}

export function buildSteps(s: string): VizStep<WindowState>[] {
  const steps: VizStep<WindowState>[] = [];

  steps.push({
    state: {
      s,
      left: 0,
      right: 0,
      window: '',
      set: [],
      best: 0,
      bestWindow: [0, 0],
      duplicateRight: false,
    },
    description: '初始化：left=0, right=0, 窗口为空',
    codeLine: 3,
  });

  let left = 0;
  let best = 0;
  let bestWindow: [number, number] = [0, 0];
  const set: string[] = [];

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    const inSet = set.includes(c);

    steps.push({
      state: {
        s,
        left,
        right,
        window: s.slice(left, right),
        set: [...set],
        best,
        bestWindow,
        duplicateRight: inSet,
      },
      description: `考察右端字符 s[${right}]='${c}'${inSet ? `（已在窗口内，需要收缩）` : '（未在窗口内，可以扩展）'}`,
      codeLine: 4,
    });

    while (set.includes(c)) {
      const out = s[left];
      set.splice(set.indexOf(out), 1);
      left++;
      steps.push({
        state: {
          s,
          left,
          right,
          window: s.slice(left, right),
          set: [...set],
          best,
          bestWindow,
          duplicateRight: set.includes(c),
        },
        description: `左端字符 s[${left - 1}]='${out}' 在重复集合中，左指针推进 → left=${left}`,
        codeLine: 7,
      });
    }

    set.push(c);
    steps.push({
      state: {
        s,
        left,
        right: right + 1,
        window: s.slice(left, right + 1),
        set: [...set],
        best,
        bestWindow,
        duplicateRight: false,
      },
      description: `把 '${c}' 加入窗口，窗口为 "${s.slice(left, right + 1)}"，长度 ${right + 1 - left}`,
      codeLine: 9,
    });

    const len = right + 1 - left;
    if (len > best) {
      best = len;
      bestWindow = [left, right + 1];
      steps.push({
        state: {
          s,
          left,
          right: right + 1,
          window: s.slice(left, right + 1),
          set: [...set],
          best,
          bestWindow,
          duplicateRight: false,
        },
        description: `✨ 更新最优：best = ${best}（窗口下标 [${left}, ${right}])`,
        codeLine: 10,
      });
    }
  }

  steps.push({
    state: {
      s,
      left,
      right: s.length,
      window: s.slice(left, s.length),
      set: [...set],
      best,
      bestWindow,
      duplicateRight: false,
    },
    description: `遍历完成。最长无重复子串长度 = ${best}`,
    codeLine: 12,
  });

  return steps;
}

interface Props {
  defaultString?: string;
  title?: string;
}

export function SlidingWindowPanel({
  defaultString = 'abcabcbb',
  title,
}: Props) {
  const [s, setS] = useState<string>(defaultString);
  const steps = useMemo(() => buildSteps(s), [s]);
  const initial: WindowState = {
    s,
    left: 0,
    right: 0,
    window: '',
    set: [],
    best: 0,
    bestWindow: [0, 0],
    duplicateRight: false,
  };

  const updateText = (txt: string) => {
    const cleaned = txt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
    if (cleaned.length > 0) setS(cleaned);
  };

  return (
    <Stepper<WindowState>
      steps={steps}
      initialState={initial}
      codeLines={slidingWindowCode}
      codeTitle="滑动窗口 Sliding Window"
      headerActions={
        <>
          <span className="text-sm text-gray-400">输入字符串:</span>
          <input
            type="text"
            value={s}
            onChange={(e) => updateText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="字母/数字"
          />
          <PlusMinusInput
            value={s.length}
            onChange={(n) => {
              if (n > s.length) {
                const letters = 'abcde';
                const next = s + letters[n % letters.length];
                setS(next.slice(0, 20));
              } else if (n >= 1) {
                setS(s.slice(0, n));
              }
            }}
            min={1}
            max={20}
            ariaLabel="长度"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          {title && <div className="text-sm text-gray-400">{title}</div>}

          <div>
            <div className="text-xs text-gray-500 mb-2">
              字符串（左指针 blue，右指针 purple，窗口内 yellow，最优窗口 dashed）
            </div>
            <div className="flex gap-1 flex-wrap font-mono text-sm">
              {state.s.split('').map((c, i) => {
                const inWin = i >= state.left && i < state.right;
                const isLeft = i === state.left;
                const isRight = i === state.right;
                const inBest =
                  i >= state.bestWindow[0] && i < state.bestWindow[1] && state.best > 0;
                return (
                  <div
                    key={i}
                    className={clsx(
                      'relative w-9 h-10 flex items-center justify-center rounded',
                      isLeft
                        ? 'bg-blue-500/30 border-2 border-blue-400 text-white'
                        : isRight
                          ? 'bg-purple-500/30 border-2 border-purple-400 text-white'
                          : inWin
                            ? 'bg-yellow-500/15 border border-yellow-500/70 text-yellow-100'
                            : inBest
                              ? 'border border-dashed border-green-500 text-green-200'
                              : 'bg-surface-2 border border-edge text-gray-400',
                    )}
                  >
                    {c}
                    <div className="absolute -bottom-5 left-0 right-0 text-center text-[10px] text-gray-500">
                      {i}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-surface border border-edge rounded-lg">
              <div className="text-xs text-gray-500 mb-1">左指针 left</div>
              <div className="text-white font-mono">{state.left}</div>
            </div>
            <div className="p-3 bg-surface border border-edge rounded-lg">
              <div className="text-xs text-gray-500 mb-1">右指针 right</div>
              <div className="text-white font-mono">{state.right}</div>
            </div>
            <div className="p-3 bg-surface border border-edge rounded-lg">
              <div className="text-xs text-gray-500 mb-1">当前窗口</div>
              <div className="text-yellow-200 font-mono">
                {state.window || <span className="text-gray-500">空</span>}
              </div>
              <div className="text-[11px] text-gray-500 mt-1">长度 {state.window.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-surface border border-edge rounded-lg">
              <div className="text-xs text-gray-500 mb-1">窗口内字符集合</div>
              <div className="flex gap-1 flex-wrap">
                {state.set.length === 0 && <span className="text-gray-500">空</span>}
                {state.set.map((x, i) => (
                  <span
                    key={i}
                    className={clsx(
                      'w-7 h-7 flex items-center justify-center rounded border text-xs font-mono',
                      x === state.s[state.right] && state.duplicateRight
                        ? 'border-red-500 bg-red-500/15 text-red-200'
                        : 'border-edge-2 bg-surface-2 text-gray-200',
                    )}
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3 bg-surface border border-edge rounded-lg">
              <div className="text-xs text-gray-500 mb-1">目前最优</div>
              <div className="text-green-300 font-mono">
                {state.best > 0
                  ? `长度 ${state.best}，下标 [${state.bestWindow[0]}, ${state.bestWindow[1]})`
                  : '尚未找到'}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500">
            口诀：<strong className="text-gray-300">右端前进扩窗口</strong>，
            <strong className="text-gray-300">遇到重复收缩左端</strong>，
            <strong className="text-gray-300">合法后更新答案</strong>。
          </div>
        </div>
      )}
    />
  );
}
