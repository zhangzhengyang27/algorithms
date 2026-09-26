'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const combinationsCode = [
  'function combine(options, len) {',
  '  if (len === 1) return options.map(o => [o]);',
  '  const res = [];',
  '  options.forEach((cur, i) => {',
  '    const smaller = combine(options.slice(i+1), len-1);',
  '    smaller.forEach(s => res.push([cur, ...s]));',
  '  });',
  '  return res;',
  '}',
];

interface CombinationsState {
  options: string[];
  length: number;
  i: number;
  results: string[][];
  message: string;
}

function buildSteps(options: string[], length: number): VizStep<CombinationsState>[] {
  const steps: VizStep<CombinationsState>[] = [];
  const results: string[][] = [];

  const snapshot = (i: number, message: string, codeLine: number): VizStep<CombinationsState> => ({
    state: { options, length, i, results: results.map((r) => [...r]), message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, `组合：从 [${options.join(',')}] 取 ${length} 个（不重复、无序）`, 1));

  function combine(opts: string[], len: number, prefix: string[] = []): string[][] {
    if (len === 1) {
      const res = opts.map((o) => [...prefix, o]);
      res.forEach((r) => {
        results.push(r);
      });
      steps.push(snapshot(prefix.length, `得到组合 [${[...prefix, opts[0]].join(',')}]…（共 ${results.length}）`, 3));
      return res;
    }
    const res: string[][] = [];
    opts.forEach((cur, i) => {
      steps.push(snapshot(i, `取 ${cur}，在剩余 [${opts.slice(i + 1).join(',')}] 中取 ${len - 1} 个`, 5));
      const smaller = combine(opts.slice(i + 1), len - 1, [...prefix, cur]);
      smaller.forEach((s) => res.push(s));
    });
    return res;
  }

  combine(options, length);
  steps.push(snapshot(-1, `组合完成，共 ${results.length} 个`, 8));
  return steps;
}

function render(state: CombinationsState) {
  const { length, results, message } = state;
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-300">选取长度：{length}</p>
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

export function CombinationsPanel() {
  const [input, setInput] = useState('a,b,c,d');
  const [length, setLength] = useState(2);
  const options = useMemo(
    () => input.split(',').map((s) => s.trim()).filter((s) => s.length > 0).slice(0, 8),
    [input],
  );
  const steps = useMemo(() => buildSteps(options, length), [options, length]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">元素(逗号分隔):</span>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40 font-mono" />
        <span className="text-sm text-gray-400">长度:</span>
        <input type="number" value={length} min={1} max={Math.max(1, options.length - 1)} onChange={(e) => setLength(Math.max(1, Number(e.target.value) || 1))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14" />
      </div>
      <Stepper steps={steps} codeLines={combinationsCode} render={render} />
    </div>
  );
}
