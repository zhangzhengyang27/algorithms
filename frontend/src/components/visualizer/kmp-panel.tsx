'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const kmpCode = [
  'function buildNext(pattern) {',
  '  const next = new Array(pattern.length).fill(0);',
  '  for (let i = 1, j = 0; i < pattern.length; i++) {',
  '    while (j > 0 && pattern[i] !== pattern[j]) j = next[j - 1];',
  '    if (pattern[i] === pattern[j]) j++;',
  '    next[i] = j;',
  '  }',
  '  return next;',
  '}',
  'function kmpSearch(text, pattern) {',
  '  const next = buildNext(pattern);',
  '  for (let i = 0, j = 0; i < text.length; i++) {',
  '    while (j > 0 && text[i] !== pattern[j]) j = next[j - 1];',
  '    if (text[i] === pattern[j]) j++;',
  '    if (j === pattern.length) return i - j + 1;',
  '  }',
  '  return -1;',
  '}',
];

interface KMPState {
  text: string;
  pattern: string;
  next: number[];
  i: number; // text pointer
  j: number; // pattern pointer
  phase: 'build' | 'match';
  buildIdx: number;
  matched: boolean;
  matchStart: number;
  message: string;
}

export function buildSteps(text: string, pattern: string): VizStep<KMPState>[] {
  const steps: VizStep<KMPState>[] = [];
  const m = pattern.length;
  const next = new Array(m).fill(0);

  const snap = (i: number, j: number, phase: 'build' | 'match', buildIdx: number, matched: boolean, matchStart: number, msg: string): KMPState => ({
    text, pattern, next: [...next], i, j, phase, buildIdx, matched, matchStart, message: msg,
  });

  // Build next array
  steps.push({ state: snap(-1, -1, 'build', -1, false, -1, `构建 next 数组（前缀函数），模式串 "${pattern}"`), description: '构建 next[]', codeLine: 2 });

  let j = 0;
  for (let i = 1; i < m; i++) {
    while (j > 0 && pattern[i] !== pattern[j]) {
      steps.push({ state: snap(-1, j, 'build', i, false, -1, `next 构建：pattern[${i}]='${pattern[i]}' ≠ pattern[${j}]='${pattern[j]}'，回退 j=next[${j - 1}]=${next[j - 1]}`), description: `回退 j→${next[j - 1]}`, codeLine: 4 });
      j = next[j - 1];
    }
    if (pattern[i] === pattern[j]) {
      j++;
      steps.push({ state: snap(-1, j, 'build', i, false, -1, `pattern[${i}]='${pattern[i]}' = pattern[${j - 1}]='${pattern[j - 1]}'，next[${i}]=${j}`), description: `next[${i}]=${j}`, codeLine: 5 });
    } else {
      steps.push({ state: snap(-1, j, 'build', i, false, -1, `pattern[${i}]='${pattern[i]}' ≠ pattern[${j}]='${pattern[j]}'，next[${i}]=${j}`), description: `next[${i}]=${j}`, codeLine: 6 });
    }
    next[i] = j;
  }

  steps.push({ state: snap(-1, -1, 'build', -1, false, -1, `next 数组构建完成：[${next.join(', ')}]`), description: 'next[] 完成', codeLine: 8 });

  // Match phase
  steps.push({ state: snap(0, 0, 'match', -1, false, -1, `开始在 "${text}" 中匹配 "${pattern}"`), description: '开始匹配', codeLine: 12 });

  j = 0;
  for (let i = 0; i < text.length; i++) {
    while (j > 0 && text[i] !== pattern[j]) {
      steps.push({ state: snap(i, j, 'match', -1, false, -1, `text[${i}]='${text[i]}' ≠ pattern[${j}]='${pattern[j]}'，回退 j=next[${j - 1}]=${next[j - 1]}`), description: `失配，j→${next[j - 1]}`, codeLine: 14 });
      j = next[j - 1];
    }
    if (text[i] === pattern[j]) {
      steps.push({ state: snap(i, j, 'match', -1, false, -1, `text[${i}]='${text[i]}' = pattern[${j}]='${pattern[j]}' ✓，j++`), description: `匹配 i=${i},j=${j}`, codeLine: 15 });
      j++;
    } else {
      steps.push({ state: snap(i, j, 'match', -1, false, -1, `text[${i}]='${text[i]}' ≠ pattern[${j}]='${pattern[j]}'，j=0 继续`), description: `失配 i=${i}`, codeLine: 14 });
    }
    if (j === m) {
      const start = i - m + 1;
      steps.push({ state: snap(i, j, 'match', -1, true, start, `✅ 找到匹配！起始位置 = ${start}`), description: `匹配成功 @${start}`, codeLine: 16 });
      return steps;
    }
  }

  steps.push({ state: snap(text.length - 1, j, 'match', -1, false, -1, `❌ 未找到匹配`), description: '未找到', codeLine: 18 });
  return steps;
}

export function KMPPanel() {
  const [text, setText] = useState('ababcababababc');
  const [pattern, setPattern] = useState('abab');
  const steps = useMemo(() => buildSteps(text, pattern), [text, pattern]);
  const initial: KMPState = { text, pattern, next: new Array(pattern.length).fill(0), i: -1, j: -1, phase: 'build', buildIdx: -1, matched: false, matchStart: -1, message: '' };

  return (
    <Stepper<KMPState>
      steps={steps}
      initialState={initial}
      codeLines={kmpCode}
      codeTitle="KMP 字符串匹配"
      headerActions={
        <>
          <span className="text-sm text-gray-400">文本:</span>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40" />
          <span className="text-sm text-gray-400">模式:</span>
          <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-24" />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">黄色=当前比较，绿色=匹配成功，红色=失配回退</div>

          {/* Text */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500">text:</span>
            <div className="flex gap-0.5 flex-wrap">
              {state.text.split('').map((ch, i) => (
                <div key={i} className={clsx('w-7 h-7 flex items-center justify-center rounded text-xs font-mono border', state.matched && i >= state.matchStart && i < state.matchStart + state.pattern.length ? 'bg-green-500/30 border-green-400 text-green-200' : i === state.i ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200' : 'bg-surface-2 border-edge-2 text-gray-400')}>{ch}</div>
              ))}
            </div>
          </div>

          {/* Pattern */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500">pattern:</span>
            <div className="flex gap-0.5 flex-wrap">
              {state.pattern.split('').map((ch, i) => (
                <div key={i} className={clsx('w-7 h-7 flex items-center justify-center rounded text-xs font-mono border', i === state.j && state.phase === 'match' ? 'bg-blue-500/30 border-blue-400 text-blue-200' : i === state.buildIdx ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200' : 'bg-surface-2 border-edge-2 text-gray-400')}>{ch}</div>
              ))}
            </div>
          </div>

          {/* Next array */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500">next[]:</span>
            <div className="flex gap-0.5">
              {state.next.map((v, i) => (
                <div key={i} className={clsx('w-7 h-7 flex items-center justify-center rounded text-[10px] font-mono border', i === state.buildIdx ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' : 'bg-surface-2 border-edge-2 text-gray-500')}>{v}</div>
              ))}
            </div>
          </div>

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
