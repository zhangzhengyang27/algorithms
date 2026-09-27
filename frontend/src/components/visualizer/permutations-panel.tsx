'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const permutationsCode = [
  'function permute(options) {',
  '  if (options.length === 1) return [options];',
  '  const res = [];',
  '  for (i in options) {',
  '    const sub = permute(options without options[i]);',
  '    for (p of sub) insert options[i] at every position of p;',
  '  }',
  '  return res;',
  '}',
];

interface PermutationsState {
  options: string[];
  current: string[];
  i: number;
  results: string[][];
  message: string;
}

export function buildSteps(options: string[]): VizStep<PermutationsState>[] {
  const steps: VizStep<PermutationsState>[] = [];
  const results: string[][] = [];

  const snapshot = (i: number, current: string[], message: string, codeLine: number): VizStep<PermutationsState> => ({
    state: { options, current: [...current], i, results: results.map((r) => [...r]), message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, [], `全排列：元素 ${options.join(',')} 的所有排列顺序`, 1));

  function permute(opts: string[], prefix: string[] = []): string[][] {
    if (opts.length === 1) {
      const p = [...prefix, opts[0]];
      results.push(p);
      steps.push(snapshot(prefix.length, p, `得到排列 [${p.join(',')}]（共 ${results.length}）`, 6));
      return [p];
    }
    const res: string[][] = [];
    for (let i = 0; i < opts.length; i += 1) {
      const rest = opts.slice(0, i).concat(opts.slice(i + 1));
      steps.push(snapshot(prefix.length, [...prefix], `固定前缀 [${prefix.join(',')}]，对子问题 [${rest.join(',')}] 求排列`, 4));
      const sub = permute(rest, [...prefix, opts[i]]);
      for (const p of sub) res.push(p);
    }
    return res;
  }

  permute(options);
  steps.push(snapshot(-1, [], `全排列完成，共 ${results.length} 个`, 8));
  return steps;
}

function render(state: PermutationsState) {
  const { options, results, message } = state;
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-300">元素：{options.join(',')}</p>
      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
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

export function PermutationsPanel() {
  const [input, setInput] = useState('a,b,c');
  const options = useMemo(
    () => input.split(',').map((s) => s.trim()).filter((s) => s.length > 0).slice(0, 6),
    [input],
  );
  const steps = useMemo(() => buildSteps(options), [options]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">元素(逗号分隔):</span>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48 font-mono" />
        <span className="text-xs text-gray-500">（≤6，否则排列爆炸）</span>
      </div>
      <Stepper steps={steps} codeLines={permutationsCode} render={render} />
    </div>
  );
}
