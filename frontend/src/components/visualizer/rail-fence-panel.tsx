'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const railFenceCode = [
  'function encode(str, rails) {',
  '  const fence = Array(rails).fill().map(() => []);',
  '  let rail = 0, dir = 1;',
  '  for (const ch of str) {',
  '    fence[rail].push(ch);',
  '    rail += dir;',
  '    if (rail === 0 || rail === rails - 1) dir *= -1;',
  '  }',
  '  return fence.flat().join("");',
  '}',
];

interface RailFenceState {
  rails: number;
  fence: string[][];
  rail: number;
  current: number;
  plain: string;
  message: string;
}

function buildSteps(str: string, rails: number): VizStep<RailFenceState>[] {
  const steps: VizStep<RailFenceState>[] = [];
  const fence: string[][] = Array(rails)
    .fill(null)
    .map(() => [] as string[]);
  let rail = 0;
  let dir = 1;

  const snapshot = (current: number, message: string, codeLine: number): VizStep<RailFenceState> => ({
    state: { rails, fence: fence.map((r) => [...r]), rail, current, plain: str, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, `栅栏密码：把明文按之字形写在 ${rails} 条轨道，再逐行读出`, 1));

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    fence[rail].push(ch);
    steps.push(snapshot(i, `字符 '${ch}' 放在第 ${rail} 轨`, 5));
    rail += dir;
    if (rail === 0 || rail === rails - 1) dir *= -1;
    steps.push(snapshot(i, `移动到下一轨：${rail}（方向 ${dir > 0 ? '下' : '上'}）`, 7));
  }

  const cipher = fence.flat().join('');
  steps.push(snapshot(-1, `密文（逐轨拼接）= ${cipher}`, 9));
  return steps;
}

function render(state: RailFenceState) {
  const { rails, fence, rail, current, plain, message } = state;
  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-400">明文：{plain}</div>
      <div className="space-y-1">
        {Array.from({ length: rails }).map((_, r) => (
          <div key={r} className="flex gap-1 items-center">
            <span className="text-[10px] text-gray-500 w-6">R{r}</span>
            <div
              className={`flex gap-1 px-2 py-1 rounded border border-edge min-h-7 ${
                r === rail && current >= 0 ? 'bg-emerald-500/30' : 'bg-surface-2'
              }`}
            >
              {fence[r].map((ch, idx) => (
                <span key={idx} className="font-mono">
                  {ch}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
    </div>
  );
}

export function RailFenceCipherPanel() {
  const [str, setStr] = useState('HELLOWORLD');
  const [rails, setRails] = useState(3);
  const steps = useMemo(() => buildSteps(str || '', rails), [str, rails]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">明文:</span>
        <input
          type="text"
          value={str}
          onChange={(e) => setStr(e.target.value.toUpperCase())}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48 font-mono"
        />
        <span className="text-sm text-gray-400">轨道数:</span>
        <input
          type="number"
          value={rails}
          min={2}
          max={6}
          onChange={(e) => setRails(Math.max(2, Math.min(6, Number(e.target.value) || 2)))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
        />
      </div>
      <Stepper steps={steps} codeLines={railFenceCode} render={render} />
    </div>
  );
}
