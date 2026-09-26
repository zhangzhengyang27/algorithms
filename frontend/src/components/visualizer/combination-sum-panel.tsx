'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const combinationSumCode = [
  'function combine(cands, remain, start) {',
  '  if (remain === 0) { save([...cur]); return; }',
  '  if (remain < 0) return;',
  '  for (i = start; i < cands.length; i++) {',
  '    cur.push(cands[i]);',
  '    combine(cands, remain - cands[i], i);',
  '    cur.pop(); // 回溯',
  '  }',
  '}',
];

interface CombinationSumState {
  candidates: number[];
  target: number;
  cur: number[];
  index: number;
  remain: number;
  results: number[][];
  message: string;
}

function buildSteps(candidates: number[], target: number): VizStep<CombinationSumState>[] {
  const steps: VizStep<CombinationSumState>[] = [];
  const cur: number[] = [];
  const results: number[][] = [];

  const snapshot = (index: number, remain: number, message: string, codeLine: number): VizStep<CombinationSumState> => ({
    state: { candidates, target, cur: [...cur], index, remain, results: results.map((r) => [...r]), message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, target, `在 [${candidates.join(',')}] 中找出和为 ${target} 的全部组合（可重复选）`, 1));

  function combine(start: number, remain: number) {
    if (remain === 0) {
      results.push([...cur]);
      steps.push(snapshot(-1, 0, `得到组合 [${cur.join(',')}]（已 ${results.length} 个）`, 2));
      return;
    }
    if (remain < 0) {
      steps.push(snapshot(-1, remain, `超过目标，剪枝`, 3));
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      cur.push(candidates[i]);
      steps.push(snapshot(i, remain, `选 ${candidates[i]}，剩余 ${remain - candidates[i]}`, 5));
      combine(i, remain - candidates[i]);
      cur.pop();
      steps.push(snapshot(i, remain, `回溯：移除 ${candidates[i]}`, 7));
    }
  }

  combine(0, target);
  steps.push(snapshot(-1, target, `搜索完成，共 ${results.length} 个组合`, 8));
  return steps;
}

function render(state: CombinationSumState) {
  const { cur, candidates, index, remain, results, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {candidates.map((c, idx) => (
          <span
            key={idx}
            className={`px-2 py-1 rounded border border-edge text-sm ${idx === index ? 'bg-amber-300 text-black' : 'bg-surface-2'}`}
          >
            {c}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-300">当前组合：[{cur.join(',')}]，剩余 {remain}</p>
      <div className="flex flex-wrap gap-1">
        {results.map((r, idx) => (
          <span key={idx} className="px-2 py-1 rounded bg-surface-2 border border-edge text-xs font-mono">
            [{r.join(',')}]
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
}

export function CombinationSumPanel() {
  const [candidatesText, setCandidatesText] = useState('2,3,6,7');
  const [target, setTarget] = useState(7);
  const candidates = useMemo(
    () => candidatesText.split(',').map((s) => parseInt(s.trim(), 10)).filter((x) => !Number.isNaN(x)).sort((a, b) => a - b),
    [candidatesText],
  );
  const steps = useMemo(() => buildSteps(candidates, target), [candidates, target]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">候选数:</span>
        <input
          type="text"
          value={candidatesText}
          onChange={(e) => setCandidatesText(e.target.value)}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40 font-mono"
        />
        <span className="text-sm text-gray-400">目标:</span>
        <input
          type="number"
          value={target}
          min={1}
          max={40}
          onChange={(e) => setTarget(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
        />
      </div>
      <Stepper steps={steps} codeLines={combinationSumCode} render={render} />
    </div>
  );
}
