'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

const caesarCode = [
  'function shift(str, k) {',
  '  return str.toLowerCase().split("").map((ch) => {',
  '    const idx = alphabet.indexOf(ch);',
  '    if (idx < 0) return ch;',
  '    return alphabet[(idx + k) % 26];',
  '  }).join("");',
  '}',
];

interface CaesarState {
  input: string;
  result: string[];
  k: number;
  current: number;
  message: string;
}

function caesar(input: string, k: number): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => {
      const idx = alphabet.indexOf(ch);
      if (idx < 0) return ch;
      return alphabet[(idx + k) % alphabet.length];
    })
    .join('');
}

export function buildSteps(input: string, k: number): VizStep<CaesarState>[] {
  const steps: VizStep<CaesarState>[] = [];
  const chars = input.toLowerCase().split('');
  const result: string[] = [];

  const snapshot = (current: number, message: string, codeLine: number): VizStep<CaesarState> => ({
    state: { input: chars.join(''), result: [...result], k, current, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, `凯撒密码：每个字母循环右移 ${k} 位`, 1));

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const idx = alphabet.indexOf(ch);
    if (idx < 0) {
      result.push(ch);
      steps.push(snapshot(i, `字符 '${ch}' 非字母，保持原样`, 4));
    } else {
      const enc = alphabet[(idx + k) % alphabet.length];
      result.push(enc);
      steps.push(snapshot(i, `'${ch}' (${idx}) → '${enc}'`, 5));
    }
  }

  steps.push(snapshot(-1, `密文：${result.join('')}`, 6));
  return steps;
}

function render(state: CaesarState) {
  const { input, result, k, current, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {input.split('').map((ch, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center border border-edge rounded px-2 py-1 w-9 ${
              idx === current ? 'bg-amber-300 text-black' : 'bg-surface-2'
            }`}
          >
            <span className="text-[10px] text-gray-400">{ch}</span>
            <span className="font-mono">{result[idx] ?? '·'}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
      <p className="text-xs text-gray-500">移位数 k = {k}（解密用 -{k}）</p>
    </div>
  );
}

export function CaesarCipherPanel() {
  const [input, setInput] = useState('hello');
  const [k, setK] = useState(3);
  const steps = useMemo(() => buildSteps(input || '', k), [input, k]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">明文:</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48 font-mono"
        />
        <span className="text-sm text-gray-400">移位数 k:</span>
        <input
          type="number"
          value={k}
          min={0}
          max={25}
          onChange={(e) => setK(Math.max(0, Math.min(25, Number(e.target.value) || 0)))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
        />
      </div>
      <Stepper steps={steps} codeLines={caesarCode} render={render} />
    </div>
  );
}
