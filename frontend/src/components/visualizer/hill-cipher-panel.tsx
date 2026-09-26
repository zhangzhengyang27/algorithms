'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const A = 'A'.charCodeAt(0);
const alphabetSize = 26;

const hillCipherCode = [
  '// 2x2 密钥矩阵 K',
  'function encrypt(pair, K) {',
  '  return [',
  '    (K[0][0]*pair[0] + K[0][1]*pair[1]) % 26,',
  '    (K[1][0]*pair[0] + K[1][1]*pair[1]) % 26,',
  '  ];',
  '}',
];

interface HillCipherState {
  message: string;
  K: number[][];
  index: number;
  pair: [number, number];
  cipherPair: [number, number] | null;
  cipher: string;
  messageText: string;
}

function charToNum(ch: string): number {
  return ch.toUpperCase().charCodeAt(0) - A;
}
function numToChar(n: number): string {
  return String.fromCharCode(((n % alphabetSize) + alphabetSize) % alphabetSize + A);
}

function buildSteps(message: string, K: number[][]): VizStep<HillCipherState>[] {
  const steps: VizStep<HillCipherState>[] = [];
  const clean = message.toUpperCase().replace(/[^A-Z]/g, '');
  let padded = clean;
  if (padded.length % 2 === 1) padded += 'X';
  const cipherChars: string[] = [];

  const snapshot = (index: number, pair: [number, number] | null, cipherPair: [number, number] | null, messageText: string, codeLine: number): VizStep<HillCipherState> => ({
    state: { message: clean, K, index, pair: pair ?? [-1, -1], cipherPair, cipher: cipherChars.join(''), messageText },
    description: messageText,
    codeLine,
  });

  steps.push(snapshot(-1, null, null, `Hill 密码：每 2 个字母一组，乘密钥矩阵 K 后 mod 26`, 1));

  for (let i = 0; i < padded.length; i += 2) {
    const pair: [number, number] = [charToNum(padded[i]), charToNum(padded[i + 1])];
    const cp: [number, number] = [
      (K[0][0] * pair[0] + K[0][1] * pair[1]) % alphabetSize,
      (K[1][0] * pair[0] + K[1][1] * pair[1]) % alphabetSize,
    ];
    steps.push(snapshot(i, pair, null, `取 (${padded[i]}, ${padded[i + 1]}) = (${pair[0]}, ${pair[1]})`, 3));
    cipherChars.push(numToChar(cp[0]), numToChar(cp[1]));
    steps.push(snapshot(i, pair, cp, `加密为 (${numToChar(cp[0])}, ${numToChar(cp[1])}) = (${cp[0]}, ${cp[1]})`, 5));
  }

  steps.push(snapshot(-1, null, null, `密文：${cipherChars.join('')}`, 7));
  return steps;
}

function render(state: HillCipherState) {
  const { K, index, pair, cipherPair, cipher, messageText } = state;
  const highlighted = (r: number, c: number) => cipherPair && pair && pair[r] !== undefined;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">K =</span>
        <table className="border-collapse">
          <tbody>
            {K.map((row, r) => (
              <tr key={r}>
                {row.map((v, c) => (
                  <td key={c} className="border border-edge w-10 h-10 text-center font-mono bg-surface-2">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-300">
        {pair[0] >= 0 && `当前明文对：(${pair[0]}, ${pair[1]})`}
        {cipherPair && ` → 密文对：(${cipherPair[0]}, ${cipherPair[1]})`}
      </p>
      <p className="text-sm text-gray-300">累计密文：{cipher || '（空）'}</p>
      <p className="text-xs text-gray-500">{messageText}</p>
    </div>
  );
}

export function HillCipherPanel() {
  const [message, setMessage] = useState('HELLO');
  const [kText, setKText] = useState('6,24,13,16');
  const K = kText.split(',').map((s) => parseInt(s.trim(), 10)).filter((x) => !Number.isNaN(x));
  const matrix: number[][] = K.length === 4 ? [[K[0], K[1]], [K[2], K[3]]] : [[6, 24], [13, 16]];
  const steps = useMemo(() => buildSteps(message || 'A', matrix), [message, matrix]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">明文:</span>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value.toUpperCase())}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40 font-mono"
        />
        <span className="text-sm text-gray-400">K(2×2 行优先):</span>
        <input
          type="text"
          value={kText}
          onChange={(e) => setKText(e.target.value)}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-32 font-mono"
        />
      </div>
      <Stepper steps={steps} codeLines={hillCipherCode} render={render} />
    </div>
  );
}
