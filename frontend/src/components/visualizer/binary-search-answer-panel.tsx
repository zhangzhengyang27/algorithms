'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const bsAnswerCode = [
  'function maxCutLength(woods, k) {',
  '  let lo = 1, hi = Math.max(...woods);',
  '  while (lo <= hi) {',
  '    const mid = (lo + hi) >> 1;',
  '    if (canCut(woods, mid, k)) lo = mid + 1;',
  '    else hi = mid - 1;',
  '  }',
  '  return hi;',
  '}',
  'function canCut(woods, len, k) {',
  '  return woods.reduce((s, w) => s + Math.floor(w / len), 0) >= k;',
  '}',
];

interface BsaState {
  woods: number[];
  k: number;
  lo: number;
  hi: number;
  mid: number;
  pieces: number | null;
  checkResult: boolean | null;
  answer: number | null;
  phase: 'init' | 'search' | 'done';
  message: string;
}

export function buildSteps(woods: number[], k: number): VizStep<BsaState>[] {
  const steps: VizStep<BsaState>[] = [];
  const maxLen = Math.max(...woods);

  const snap = (lo: number, hi: number, mid: number, pieces: number | null, checkResult: boolean | null, answer: number | null, phase: BsaState['phase'], msg: string): BsaState => ({
    woods, k, lo, hi, mid, pieces, checkResult, answer, phase, message: msg,
  });

  steps.push({
    state: snap(1, maxLen, -1, null, null, null, 'init', `木材 [${woods.join(', ')}]，需要至少 ${k} 段。答案范围 [1, ${maxLen}]，对答案二分`),
    description: '初始化区间',
    codeLine: 1,
  });

  let lo = 1, hi = maxLen;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    steps.push({
      state: snap(lo, hi, mid, null, null, null, 'search', `取 mid = ⌊(${lo}+${hi})/2⌋ = ${mid}，检验每段长度 ${mid} 是否可行`),
      description: `mid=${mid}`,
      codeLine: 3,
    });

    const pieces = woods.reduce((s, w) => s + Math.floor(w / mid), 0);
    const ok = pieces >= k;
    steps.push({
      state: snap(lo, hi, mid, pieces, ok, null, 'search', `check(${mid})：共可切 ${woods.map((w) => `⌊${w}/${mid}⌋`).join('+')} = ${pieces} 段 ${ok ? '≥' : '<'} ${k}，${ok ? '可行 ✓' : '不可行 ✗'}`),
      description: `check=${pieces}段${ok ? '✓' : '✗'}`,
      codeLine: 10,
    });

    if (ok) {
      lo = mid + 1;
      steps.push({
        state: snap(lo, hi, mid, pieces, ok, null, 'search', `可行 → 答案可以更大，lo = mid+1 = ${lo}`),
        description: `lo→${lo}`,
        codeLine: 4,
      });
    } else {
      hi = mid - 1;
      steps.push({
        state: snap(lo, hi, mid, pieces, ok, null, 'search', `不可行 → 答案需缩小，hi = mid-1 = ${hi}`),
        description: `hi→${hi}`,
        codeLine: 5,
      });
    }
  }

  steps.push({
    state: snap(lo, hi, -1, null, null, hi, 'done', `✅ 搜索结束（lo=${lo} > hi=${hi}），最大可行长度 = hi = ${hi}`),
    description: `答案=${hi}`,
    codeLine: 7,
  });

  return steps;
}

export function BinarySearchAnswerPanel() {
  const [woodsText, setWoodsText] = useState('8,5,6');
  const [kValue, setKValue] = useState(7);

  const woods = useMemo(() => {
    return woodsText.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
  }, [woodsText]);

  const steps = useMemo(() => buildSteps(woods, kValue), [woods, kValue]);
  const initial: BsaState = {
    woods, k: kValue, lo: 1, hi: Math.max(...woods), mid: -1, pieces: null,
    checkResult: null, answer: null, phase: 'init', message: '',
  };

  const maxLen = Math.max(...woods);

  return (
    <Stepper<BsaState>
      steps={steps}
      initialState={initial}
      codeLines={bsAnswerCode}
      codeTitle="二分答案 Binary Search on Answer"
      headerActions={
        <>
          <span className="text-sm text-gray-400">木材:</span>
          <input
            type="text"
            value={woodsText}
            onChange={(e) => setWoodsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-28"
            placeholder="如 8,5,6"
          />
          <span className="text-sm text-gray-400">需要段数 k:</span>
          <input
            type="number"
            value={kValue}
            onChange={(e) => setKValue(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            绿色=可行区间 [lo,hi]，黄色=mid 检验点，红色=被排除区域
          </div>

          {/* Woods visualization */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">木材（每格 1 单位长度）:</div>
            {state.woods.map((w, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-xs text-gray-500 w-6 font-mono">{w}</span>
                <div className="flex gap-px">
                  {Array.from({ length: w }, (_, j) => (
                    <div
                      key={j}
                      className={clsx(
                        'w-4 h-5 rounded-sm border transition-all',
                        state.mid > 0 && j < w
                          ? j % state.mid < state.mid - 1 || (Math.floor(j / state.mid) < Math.floor(w / state.mid))
                            ? 'bg-amber-700/60 border-amber-600/60'
                            : 'bg-surface-2 border-edge-2'
                          : 'bg-amber-700/60 border-amber-600/60',
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Number line */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">答案空间 [1, {maxLen}]:</div>
            <div className="flex gap-px flex-wrap items-end">
              {Array.from({ length: maxLen }, (_, i) => {
                const v = i + 1;
                const isMid = v === state.mid;
                const inRange = v >= state.lo && v <= state.hi;
                const isAnswer = state.phase === 'done' && v === state.answer;
                return (
                  <div key={v} className="flex flex-col items-center">
                    <div
                      className={clsx(
                        'w-6 h-8 flex items-center justify-center rounded text-[10px] font-mono border transition-all',
                        isAnswer
                          ? 'bg-green-500/30 border-green-400 text-green-200 scale-110'
                          : isMid
                            ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                            : inRange
                              ? 'bg-blue-500/10 border-blue-800 text-blue-300'
                              : 'bg-surface border-edge text-ink-3',
                      )}
                    >
                      {v}
                    </div>
                    <div className="h-4 text-[9px] font-mono flex items-center">
                      {v === state.lo && <span className="text-blue-400">lo</span>}
                      {v === state.hi && <span className="text-blue-400">{v === state.lo ? 'lo/hi' : 'hi'}</span>}
                      {v === state.mid && state.lo !== state.mid && state.hi !== state.mid && <span className="text-yellow-400">mid</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Check result */}
          {state.pieces !== null && (
            <div className={clsx(
              'text-center p-2 rounded-lg border font-mono text-sm',
              state.checkResult ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-red-900/20 border-red-800 text-red-300',
            )}>
              check(mid={state.mid})：可切 {state.pieces} 段 {state.checkResult ? '≥' : '<'} {state.k} → {state.checkResult ? '可行，尝试更大' : '不可行，缩小范围'}
            </div>
          )}

          {/* Final answer */}
          {state.phase === 'done' && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                ✅ 最大切割长度 = {state.answer}
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
