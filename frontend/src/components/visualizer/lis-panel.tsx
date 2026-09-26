'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const lisCode = [
  'function lis(seq) {',
  '  lengths = Array(n).fill(1);',
  '  for (i = 1..n) for (j = 0..i)',
  '    if (seq[j] < seq[i])',
  '      lengths[i] = max(lengths[i], lengths[j] + 1);',
  '  return max(lengths);',
  '}',
];

interface LisState {
  seq: number[];
  lengths: number[];
  i: number;
  j: number;
  maxLen: number;
  message: string;
}

const MAX_STEPS = 50_000;

export function buildSteps(seq: number[]): VizStep<LisState>[] {
  const steps: VizStep<LisState>[] = [];
  const lengths = Array(seq.length).fill(1);
  let aborted = false;

  const pushStep = (step: VizStep<LisState>) => {
    if (aborted) return;
    if (steps.length >= MAX_STEPS) {
      aborted = true;
      steps.push({
        ...step,
        state: { ...step.state, message: `⚠️ 步骤超过 ${MAX_STEPS.toLocaleString()}，已提前终止。请缩短序列。` },
      });
      return;
    }
    steps.push(step);
  };

  const snapshot = (i: number, j: number, message: string, codeLine: number): VizStep<LisState> => ({
    state: { seq, lengths: [...lengths], i, j, maxLen: lengths.length ? Math.max(...lengths) : 0, message },
    description: message,
    codeLine,
  });

  pushStep(snapshot(-1, -1, `最长递增子序列（LIS）：每个元素自身至少构成长度 1`, 1));

  for (let i = 1; i < seq.length; i += 1) {
    if (aborted) break;
    for (let j = 0; j < i; j += 1) {
      if (aborted) break;
      if (seq[j] < seq[i]) {
        if (lengths[j] + 1 > lengths[i]) lengths[i] = lengths[j] + 1;
        pushStep(snapshot(i, j, `${seq[j]} < ${seq[i]}，可接上，更新 lengths[${i}]`, 4));
      }
    }
  }

  if (!aborted) {
    pushStep(snapshot(-1, -1, `最长递增子序列长度 = ${Math.max(...lengths)}`, 6));
  }
  return steps;
}

function render(state: LisState) {
  const { seq, lengths, i, j, maxLen, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {seq.map((v, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center border border-edge rounded px-2 py-1 min-w-10 ${
              idx === i ? 'bg-amber-300 text-black' : idx === j ? 'bg-emerald-500/40' : 'bg-surface-2'
            }`}
          >
            <span className="text-[10px] text-gray-400">[{idx}]</span>
            <span className="font-mono">{v}</span>
            <span className="text-[10px] text-sky-300">{lengths[idx]}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
      <p className="text-xs text-gray-500">当前最长 = {maxLen}（下标下数字为该位置结尾的 LIS 长度）</p>
    </div>
  );
}

export function LISPanel() {
  const [seqText, setSeqText] = useState('3,1,4,1,5,9,2,6');
  const seq = useMemo(
    () => seqText.split(',').map((s) => parseInt(s.trim(), 10)).filter((x) => !Number.isNaN(x)),
    [seqText],
  );
  const steps = useMemo(() => buildSteps(seq), [seq]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">序列:</span>
        <input type="text" value={seqText} onChange={(e) => setSeqText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-72 font-mono" />
      </div>
      <Stepper steps={steps} codeLines={lisCode} render={render} />
    </div>
  );
}
