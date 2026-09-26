'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const BASE = 37;
const MODULUS = 101;

const polyHashCode = [
  'function hash(word) {',
  '  let h = 0;',
  '  for (ch of word) {',
  '    h = (h * BASE + code(ch)) % MOD;',
  '  }',
  '  return h;',
  '}',
];

interface PolyHashState {
  word: string;
  i: number;
  h: number;
  message: string;
}

function buildSteps(word: string): VizStep<PolyHashState>[] {
  const steps: VizStep<PolyHashState>[] = [];
  let h = 0;

  const snapshot = (i: number, message: string, codeLine: number): VizStep<PolyHashState> => ({
    state: { word, i, h, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, `多项式滚动哈希：h = (h*${BASE} + code)%${MODULUS}`, 1));

  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const code = ch.codePointAt(0) ?? 0;
    h = (h * BASE + code) % MODULUS;
    steps.push(snapshot(i, `h = (${h} * ${BASE} + ${code}) % ${MODULUS} = ${h}`, 4));
  }

  steps.push(snapshot(word.length, `哈希值 = ${h}`, 6));
  return steps;
}

function render(state: PolyHashState) {
  const { word, i, h, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {word.split('').map((ch, idx) => (
          <span
            key={idx}
            className={`px-2 py-1 rounded border border-edge text-sm ${idx === i ? 'bg-amber-300 text-black' : 'bg-surface-2'}`}
          >
            {ch}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
      <p className="text-xs text-gray-500">当前 h = {h}</p>
    </div>
  );
}

export function PolynomialHashPanel() {
  const [word, setWord] = useState('algorithms');
  const steps = useMemo(() => buildSteps(word || 'a'), [word]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">字符串:</span>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48 font-mono"
        />
      </div>
      <Stepper steps={steps} codeLines={polyHashCode} render={render} />
    </div>
  );
}
