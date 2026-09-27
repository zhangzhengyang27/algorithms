'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const stringCode = [
  'function traverse(s) {',
  '  for (let i = 0; i < s.length; i++)',
  '    console.log(i, s[i]);',
  '}',
  'function reverseString(s) {',
  '  let rev = "";',
  '  for (let i = s.length - 1; i >= 0; i--)',
  '    rev += s[i];',
  '  return rev;',
  '}',
  'function isPalindrome(s) {',
  '  let l = 0, r = s.length - 1;',
  '  while (l < r) {',
  '    if (s[l] !== s[r]) return false;',
  '    l++; r--;',
  '  }',
  '  return true;',
  '}',
  'function indexOf(str, pat) {',
  '  for (let i = 0; i <= str.length - pat.length; i++) {',
  '    let j = 0;',
  '    while (j < pat.length && str[i + j] === pat[j]) j++;',
  '    if (j === pat.length) return i;',
  '  }',
  '  return -1;',
  '}',
  'function countChars(s) {',
  '  const cnt = {};',
  '  for (const ch of s)',
  '    cnt[ch] = (cnt[ch] || 0) + 1;',
  '  return cnt;',
  '}',
];

type Phase = 'traverse' | 'reverse' | 'palindrome' | 'search' | 'count';

interface StringState {
  s: string;
  phase: Phase;
  idx: number;
  rev: string;
  l: number;
  r: number;
  palinResult: boolean | null;
  pat: string;
  searchI: number;
  searchJ: number;
  found: number; // -2 searching, -1 not found, >=0 found
  counts: Record<string, number>;
  message: string;
}

export function buildSteps(s: string, pat: string): VizStep<StringState>[] {
  const steps: VizStep<StringState>[] = [];
  const base: StringState = {
    s, phase: 'traverse', idx: -1, rev: '', l: -1, r: -1, palinResult: null,
    pat, searchI: -1, searchJ: 0, found: -2, counts: {}, message: '',
  };

  // ---- 1. traverse ----
  steps.push({
    state: { ...base, message: `字符串 "${s}"（长度 ${s.length}），从下标 0 开始逐个访问字符` },
    description: '准备遍历',
    codeLine: 1,
  });
  for (let i = 0; i < s.length; i++) {
    steps.push({
      state: { ...base, idx: i, message: `访问 s[${i}] = '${s[i]}'` },
      description: `s[${i}]='${s[i]}'`,
      codeLine: 2,
    });
  }

  // ---- 2. reverse ----
  let rev = '';
  steps.push({
    state: { ...base, phase: 'reverse', message: '反转：从最后一个字符开始，依次追加到结果串' },
    description: '准备反转',
    codeLine: 5,
  });
  for (let i = s.length - 1; i >= 0; i--) {
    rev += s[i];
    steps.push({
      state: { ...base, phase: 'reverse', idx: i, rev, message: `取 s[${i}]='${s[i]}'，rev = "${rev}"` },
      description: `rev="${rev}"`,
      codeLine: 7,
    });
  }
  steps.push({
    state: { ...base, phase: 'reverse', rev, message: `反转完成："${s}" → "${rev}"` },
    description: '反转完成',
    codeLine: 8,
  });

  // ---- 3. palindrome ----
  let l = 0;
  let r = s.length - 1;
  steps.push({
    state: { ...base, phase: 'palindrome', l, r, message: `回文判断：双指针 l=0, r=${r} 向中间收拢，比较对称字符` },
    description: '双指针初始化',
    codeLine: 11,
  });
  let palinResult: boolean | null = null;
  while (l < r) {
    if (s[l] !== s[r]) {
      palinResult = false;
      steps.push({
        state: { ...base, phase: 'palindrome', l, r, palinResult, message: `s[${l}]='${s[l]}' ≠ s[${r}]='${s[r]}'，不是回文，提前返回 false` },
        description: `不相等 → false`,
        codeLine: 13,
      });
      break;
    }
    steps.push({
      state: { ...base, phase: 'palindrome', l, r, message: `s[${l}]='${s[l]}' = s[${r}]='${s[r]}'，对称相等，指针收拢` },
      description: `s[${l}]=s[${r}] ✓`,
      codeLine: 13,
    });
    l++; r--;
    steps.push({
      state: { ...base, phase: 'palindrome', l, r, message: l < r ? `l=${l}, r=${r}，继续比较` : '指针相遇/交错，比较结束' },
      description: `l=${l}, r=${r}`,
      codeLine: 14,
    });
  }
  if (palinResult === null) palinResult = true;
  steps.push({
    state: { ...base, phase: 'palindrome', l, r, palinResult, message: palinResult ? `"${s}" 是回文串` : `"${s}" 不是回文串` },
    description: palinResult ? '是回文' : '非回文',
    codeLine: palinResult ? 16 : 13,
  });

  // ---- 4. substring search ----
  steps.push({
    state: { ...base, phase: 'search', message: `子串查找：在 "${s}" 中查找模式串 "${pat}"，逐个起点尝试匹配` },
    description: '准备查找',
    codeLine: 19,
  });
  let found = -1;
  outer:
  for (let i = 0; i <= s.length - pat.length; i++) {
    let j = 0;
    steps.push({
      state: { ...base, phase: 'search', searchI: i, searchJ: 0, message: `起点 i=${i}，开始逐字符比较` },
      description: `起点 i=${i}`,
      codeLine: 20,
    });
    while (j < pat.length) {
      if (s[i + j] === pat[j]) {
        j++;
        steps.push({
          state: { ...base, phase: 'search', searchI: i, searchJ: j, message: `s[${i + j}]='${s[i + j]}' = pat[${j - 1}]='${pat[j - 1]}'，已匹配 ${j}/${pat.length}` },
          description: `匹配 ${j}/${pat.length}`,
          codeLine: 21,
        });
      } else {
        steps.push({
          state: { ...base, phase: 'search', searchI: i, searchJ: j, message: `s[${i + j}]='${s[i + j]}' ≠ pat[${j}]='${pat[j]}'，该起点失败，i 右移` },
          description: `i=${i} 失配`,
          codeLine: 21,
        });
        continue outer;
      }
    }
    found = i;
    steps.push({
      state: { ...base, phase: 'search', searchI: i, searchJ: j, found: i, message: `模式串全部匹配！"${pat}" 出现在下标 ${i}` },
      description: `找到 @${i}`,
      codeLine: 22,
    });
    break;
  }
  if (found === -1) {
    steps.push({
      state: { ...base, phase: 'search', searchI: -1, found: -1, message: `所有起点都尝试完毕，"${pat}" 不在 "${s}" 中，返回 -1` },
      description: '未找到 → -1',
      codeLine: 24,
    });
  }

  // ---- 5. char count ----
  const counts: Record<string, number> = {};
  steps.push({
    state: { ...base, phase: 'count', message: '字符统计：遍历每个字符，用哈希表记录出现次数' },
    description: '准备统计',
    codeLine: 27,
  });
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    counts[ch] = (counts[ch] || 0) + 1;
    steps.push({
      state: { ...base, phase: 'count', idx: i, counts: { ...counts }, message: `cnt['${ch}'] = ${counts[ch]}` },
      description: `cnt['${ch}']=${counts[ch]}`,
      codeLine: 29,
    });
  }
  steps.push({
    state: { ...base, phase: 'count', counts: { ...counts }, message: `统计完成，共 ${Object.keys(counts).length} 种不同字符` },
    description: '统计完成',
    codeLine: 30,
  });

  return steps;
}

const PHASE_LABEL: Record<Phase, string> = {
  traverse: '① 遍历字符',
  reverse: '② 反转字符串',
  palindrome: '③ 回文判断',
  search: '④ 子串查找',
  count: '⑤ 字符统计',
};

export function StringPanel() {
  const [s, setS] = useState('algorithm');
  const [pat, setPat] = useState('ori');

  const steps = useMemo(() => buildSteps(s, pat.length ? pat : 'x'), [s, pat]);
  const initial: StringState = {
    s, phase: 'traverse', idx: -1, rev: '', l: -1, r: -1, palinResult: null,
    pat, searchI: -1, searchJ: 0, found: -2, counts: {}, message: '',
  };

  return (
    <Stepper<StringState>
      steps={steps}
      initialState={initial}
      codeLines={stringCode}
      codeTitle="字符串基础 String Basics"
      headerActions={
        <>
          <span className="text-sm text-gray-400">字符串:</span>
          <input
            type="text"
            value={s}
            onChange={(e) => { const v = e.target.value.replace(/\s/g, '').slice(0, 12); if (v) setS(v); }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-32 font-mono"
          />
          <span className="text-sm text-gray-400">模式串:</span>
          <input
            type="text"
            value={pat}
            onChange={(e) => { const v = e.target.value.replace(/\s/g, '').slice(0, 5); setPat(v); }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-20 font-mono"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {(Object.keys(PHASE_LABEL) as Phase[]).map((p) => (
              <span key={p} className={clsx('px-2 py-0.5 rounded border', state.phase === p ? 'border-blue-500 text-blue-300 bg-blue-500/10' : 'border-edge')}>
                {PHASE_LABEL[p]}
              </span>
            ))}
          </div>

          {/* main string row */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">s = "{state.s}"</div>
            <div className="flex gap-1 flex-wrap">
              {state.s.split('').map((ch, i) => {
                let style = 'bg-surface-2 border-edge-2 text-ink-2';
                if (state.phase === 'traverse' && i === state.idx) style = 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110';
                if (state.phase === 'reverse' && i === state.idx) style = 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110';
                if (state.phase === 'palindrome' && state.palinResult === null && (i === state.l || i === state.r)) style = 'bg-blue-500/25 border-blue-400 text-blue-200';
                if (state.phase === 'palindrome' && state.palinResult === null && (i < state.l || i > state.r)) style = 'bg-green-500/15 border-green-600 text-green-300';
                if (state.phase === 'palindrome' && state.palinResult === false && (i === state.l || i === state.r)) style = 'bg-red-500/25 border-red-500 text-red-300';
                if (state.phase === 'palindrome' && state.palinResult === true) style = 'bg-green-500/15 border-green-600 text-green-300';
                if (state.phase === 'search' && state.found >= 0 && i >= state.found && i < state.found + state.pat.length) style = 'bg-green-500/25 border-green-500 text-green-200';
                else if (state.phase === 'search' && state.found === -2 && i >= state.searchI && i < state.searchI + state.searchJ) style = 'bg-green-500/20 border-green-600 text-green-300';
                else if (state.phase === 'search' && state.found === -2 && i === state.searchI + state.searchJ && state.searchI >= 0) style = 'bg-red-500/25 border-red-500 text-red-300';
                if (state.phase === 'count' && i === state.idx) style = 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110';
                return (
                  <div key={i} className={clsx('w-9 h-9 flex items-center justify-center rounded text-sm font-mono border transition-all', style)}>
                    {ch}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1 flex-wrap">
              {state.s.split('').map((_, i) => (
                <div key={i} className="w-9 text-center text-[9px] text-gray-600">{i}</div>
              ))}
            </div>
          </div>

          {/* reverse result */}
          {state.phase === 'reverse' && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">rev:</div>
              <div className="flex gap-1">
                {state.rev.split('').map((ch, i) => (
                  <div key={i} className={clsx('w-9 h-9 flex items-center justify-center rounded text-sm font-mono border', i === state.rev.length - 1 ? 'bg-green-500/25 border-green-500 text-green-200' : 'bg-surface-2 border-edge-2 text-ink-2')}>
                    {ch}
                  </div>
                ))}
                {state.rev.length === 0 && <div className="text-sm text-gray-600 font-mono">(空)</div>}
              </div>
            </div>
          )}

          {/* palindrome pointers */}
          {state.phase === 'palindrome' && (
            <div className="flex gap-4 items-center text-sm font-mono">
              <span className="text-blue-300">l = {state.l}</span>
              <span className="text-blue-300">r = {state.r}</span>
              {state.palinResult !== null && (
                <span className={state.palinResult ? 'text-green-300' : 'text-red-300'}>
                  → {state.palinResult ? 'true（是回文）' : 'false（不是回文）'}
                </span>
              )}
            </div>
          )}

          {/* search pattern row */}
          {state.phase === 'search' && state.found === -2 && state.searchI >= 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">pat = "{state.pat}"（对齐到起点 i={state.searchI}）:</div>
              <div className="flex gap-1">
                {Array.from({ length: state.searchI }).map((_, i) => (
                  <div key={i} className="w-9" />
                ))}
                {state.pat.split('').map((ch, j) => (
                  <div key={j} className={clsx('w-9 h-9 flex items-center justify-center rounded text-sm font-mono border', j < state.searchJ ? 'bg-green-500/25 border-green-500 text-green-200' : j === state.searchJ ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-surface-2 border-edge-2 text-ink-3')}>
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          )}
          {state.phase === 'search' && state.found >= 0 && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">indexOf("{state.s}", "{state.pat}") = {state.found}</span>
            </div>
          )}
          {state.phase === 'search' && state.found === -1 && (
            <div className="text-center p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <span className="text-red-300 font-mono text-sm">indexOf("{state.s}", "{state.pat}") = -1</span>
            </div>
          )}

          {/* count table */}
          {state.phase === 'count' && Object.keys(state.counts).length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {Object.entries(state.counts).map(([ch, cnt]) => (
                <div key={ch} className={clsx('px-2 py-1 rounded border text-sm font-mono', state.idx >= 0 && state.s[state.idx] === ch ? 'border-yellow-400 bg-yellow-500/15 text-yellow-200' : 'border-edge-2 bg-surface-2 text-ink-2')}>
                  '{ch}': {cnt}
                </div>
              ))}
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
