'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const hashingCode = [
  'const BASE = 131, MOD = 1000003;',
  'function buildHash(s) {',
  '  const h = [0], pw = [1];',
  '  for (let i = 0; i < s.length; i++) {',
  '    h[i+1] = (h[i] * BASE + s.charCodeAt(i)) % MOD;',
  '    pw[i+1] = (pw[i] * BASE) % MOD;',
  '  }',
  '  return { h, pw };',
  '}',
  'function subHash(h, pw, l, r) { // 子串 s[l..r] 哈希',
  '  return ((h[r+1] - h[l] * pw[r-l+1]) % MOD + MOD) % MOD;',
  '}',
  'function rabinKarp(s, pat) {',
  '  const { h, pw } = buildHash(s);',
  '  const patHash = buildHash(pat).h[pat.length];',
  '  for (let i = 0; i + pat.length <= s.length; i++)',
  '    if (subHash(h, pw, i, i + pat.length - 1) === patHash)',
  '      matches.push(i); // 哈希相等则可能匹配',
  '}',
];

const BASE = 131;
const MOD = 1000003;

interface HashState {
  s: string;
  pattern: string;
  h: number[];
  buildIdx: number;
  windowL: number;
  windowR: number;
  patternHash: number | null;
  windowHash: number | null;
  compareResult: 'match' | 'mismatch' | null;
  matches: number[];
  phase: 'build' | 'match' | 'result';
  message: string;
}

function buildHashArr(s: string): number[] {
  const h = [0];
  for (let i = 0; i < s.length; i++) {
    h.push((h[i] * BASE + s.charCodeAt(i)) % MOD);
  }
  return h;
}

function pwArr(len: number): number[] {
  const pw = [1];
  for (let i = 1; i <= len; i++) pw.push((pw[i - 1] * BASE) % MOD);
  return pw;
}

function subHash(h: number[], pw: number[], l: number, r: number): number {
  return ((h[r + 1] - h[l] * pw[r - l + 1]) % MOD + MOD) % MOD;
}

export function buildSteps(s: string, pattern: string): VizStep<HashState>[] {
  const steps: VizStep<HashState>[] = [];
  const h = [0];
  const pw = pwArr(Math.max(s.length, pattern.length));

  const snap = (
    buildIdx: number,
    wl: number,
    wr: number,
    patHash: number | null,
    winHash: number | null,
    cmp: 'match' | 'mismatch' | null,
    matches: number[],
    phase: 'build' | 'match' | 'result',
    msg: string,
  ): HashState => ({
    s,
    pattern,
    h: [...h],
    buildIdx,
    windowL: wl,
    windowR: wr,
    patternHash: patHash,
    windowHash: winHash,
    compareResult: cmp,
    matches: [...matches],
    phase,
    message: msg,
  });

  steps.push({
    state: snap(-1, -1, -1, null, null, null, [], 'build', `字符串 "${s}"，BASE=${BASE}，MOD=${MOD}，h[0]=0`),
    description: '初始化',
    codeLine: 3,
  });

  for (let i = 0; i < s.length; i++) {
    h.push((h[i] * BASE + s.charCodeAt(i)) % MOD);
    steps.push({
      state: snap(i + 1, -1, -1, null, null, null, [], 'build',
        `h[${i + 1}] = (h[${i}]×${BASE} + code('${s[i]}'=${s.charCodeAt(i)})) % MOD = ${h[i + 1]}`),
      description: `h[${i + 1}]=${h[i + 1]}`,
      codeLine: 5,
    });
  }

  const patHash = buildHashArr(pattern)[pattern.length];
  steps.push({
    state: snap(-1, -1, -1, patHash, null, null, [], 'match', `模式串 "${pattern}" 的哈希 patHash = ${patHash}`),
    description: `patHash=${patHash}`,
    codeLine: 15,
  });

  const matches: number[] = [];
  const m = pattern.length;
  for (let i = 0; i + m <= s.length; i++) {
    const wh = subHash(h, pw, i, i + m - 1);
    const isMatch = wh === patHash;
    if (isMatch) matches.push(i);
    steps.push({
      state: snap(-1, i, i + m - 1, patHash, wh, isMatch ? 'match' : 'mismatch', matches, 'match',
        `窗口 [${i}..${i + m - 1}]="${s.substring(i, i + m)}" 哈希 = ${wh} ${isMatch ? '= patHash ✓ 匹配！' : '≠ patHash ✗'}`),
      description: isMatch ? `匹配 @${i}` : `窗口 @${i}`,
      codeLine: isMatch ? 18 : 17,
    });
  }

  steps.push({
    state: snap(-1, -1, -1, patHash, null, null, matches, 'result',
      `✅ 匹配完成：模式 "${pattern}" 出现在下标 [${matches.join(', ')}]（O(n) 预处理 + O(1) 比较）`),
    description: `匹配位置 [${matches.join(',')}]`,
    codeLine: 18,
  });

  return steps;
}

export function StringHashingPanel() {
  const [seed, setSeed] = useState('abracadabra');
  const [pattern, setPattern] = useState('abra');

  const steps = useMemo(() => buildSteps(seed, pattern), [seed, pattern]);
  const initial: HashState = {
    s: seed,
    pattern,
    h: [0],
    buildIdx: -1,
    windowL: -1,
    windowR: -1,
    patternHash: null,
    windowHash: null,
    compareResult: null,
    matches: [],
    phase: 'build',
    message: '',
  };

  return (
    <Stepper<HashState>
      steps={steps}
      initialState={initial}
      codeLines={hashingCode}
      codeTitle="字符串哈希 String Hashing"
      headerActions={
        <>
          <span className="text-sm text-gray-400">文本:</span>
          <input
            type="text"
            value={seed}
            onChange={(e) => { if (e.target.value.length >= 2 && e.target.value.length <= 16) setSeed(e.target.value); }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40"
            placeholder="文本串"
          />
          <span className="text-sm text-gray-400">模式:</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => { if (e.target.value.length >= 1 && e.target.value.length <= 6) setPattern(e.target.value); }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-24"
            placeholder="模式串"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=构建位置，蓝色=比较窗口，绿色=匹配，红色=不匹配。多项式滚动哈希 O(1) 比较子串
          </div>

          {/* Text string */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">文本 s[]:</div>
            <div className="flex gap-1 flex-wrap">
              {state.s.split('').map((ch, i) => {
                const isBuild = i + 1 === state.buildIdx;
                const inWindow = i >= state.windowL && i <= state.windowR && state.windowL >= 0;
                const isMatched = state.matches.some((mStart) => i >= mStart && i < mStart + state.pattern.length);
                return (
                  <div
                    key={i}
                    className={clsx(
                      'w-8 h-9 flex items-center justify-center rounded text-sm font-mono border transition-all',
                      isBuild
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                        : inWindow
                          ? state.compareResult === 'match'
                            ? 'bg-green-500/30 border-green-400 text-green-200 scale-105'
                            : 'bg-blue-500/20 border-blue-400 text-blue-200'
                          : isMatched
                            ? 'bg-green-500/20 border-green-500 text-green-300'
                            : 'bg-surface-2 border-edge-2 text-gray-300',
                    )}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
            {/* h array */}
            <div className="flex gap-1 flex-wrap">
              {state.h.map((v, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-8 h-7 flex items-center justify-center rounded text-[8px] font-mono border',
                    i === state.buildIdx
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
                      : 'bg-surface border-edge text-gray-500',
                  )}
                >
                  {v}
                </div>
              ))}
            </div>
            <div className="text-[9px] text-gray-600">h[] (前缀哈希)</div>
          </div>

          {/* Pattern + hash comparison */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">模式:</span>
              {state.pattern.split('').map((ch, i) => (
                <div key={i} className="w-8 h-9 flex items-center justify-center rounded text-sm font-mono border bg-purple-500/20 border-purple-400 text-purple-200">
                  {ch}
                </div>
              ))}
              {state.patternHash !== null && (
                <span className="ml-2 text-xs font-mono text-purple-300">hash={state.patternHash}</span>
              )}
            </div>
            {state.windowHash !== null && (
              <div className={clsx(
                'px-3 py-1.5 rounded-lg border font-mono text-sm',
                state.compareResult === 'match'
                  ? 'bg-green-900/30 border-green-700 text-green-300'
                  : 'bg-red-900/30 border-red-700 text-red-300',
              )}
              >
                窗口 hash={state.windowHash} {state.compareResult === 'match' ? '=' : '≠'} {state.patternHash}
              </div>
            )}
          </div>

          {/* Matches */}
          {state.matches.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">匹配位置:</span>
              {state.matches.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded bg-green-900/30 border border-green-700 text-green-300 text-xs font-mono">
                  {m}
                </span>
              ))}
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
