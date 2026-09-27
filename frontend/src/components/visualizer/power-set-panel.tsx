'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const powerSetCode = [
  'function powerSet(set) {',
  '  allSubsets = [[]];',
  '  for (pos = 0; pos < set.length; pos++) {',
  '    subset.push(set[pos]);',
  '    allSubsets.push([...subset]);',
  '    recurse(pos + 1);',
  '    subset.pop(); // 回溯',
  '  }',
  '}',
];

interface PowerSetState {
  set: string[];
  subset: string[];
  position: number;
  allSubsets: string[][];
  message: string;
}

export function buildSteps(set: string[]): VizStep<PowerSetState>[] {
  const steps: VizStep<PowerSetState>[] = [];
  const allSubsets: string[][] = [[]];
  const subset: string[] = [];

  const snapshot = (position: number, message: string, codeLine: number): VizStep<PowerSetState> => ({
    state: { set, subset: [...subset], position, allSubsets: allSubsets.map((s) => [...s]), message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, `幂集：集合 ${set.join(',')} 的所有子集（含空集），共 ${2 ** set.length} 个`, 1));

  function recurse(startAt: number) {
    for (let pos = startAt; pos < set.length; pos++) {
      subset.push(set[pos]);
      steps.push(snapshot(pos, `加入 '${set[pos]}'，当前子集 = {${subset.join(',')}}`, 4));
      allSubsets.push([...subset]);
      steps.push(snapshot(pos, `记录子集 {${subset.join(',')}}（已 ${allSubsets.length} 个）`, 5));
      recurse(pos + 1);
      subset.pop();
      steps.push(snapshot(pos, `回溯：移除 '${set[pos]}'`, 7));
    }
  }

  recurse(0);
  steps.push(snapshot(-1, `幂集构建完成，共 ${allSubsets.length} 个子集`, 8));
  return steps;
}

function render(state: PowerSetState) {
  const { set, subset, position, allSubsets, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {set.map((x, idx) => (
          <span
            key={idx}
            className={`px-2 py-1 rounded border border-edge text-sm ${
              idx === position ? 'bg-amber-300 text-black' : 'bg-surface-2'
            }`}
          >
            {x}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-300">当前子集：{`{${subset.join(',')}}`}</p>
      <div className="flex flex-wrap gap-1">
        {allSubsets.map((s, idx) => (
          <span key={idx} className="px-2 py-1 rounded bg-surface-2 border border-edge text-xs font-mono">
            {`{${s.join(',')}}`}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
}

export function PowerSetPanel() {
  const [input, setInput] = useState('a,b,c');
  const set = input.split(',').map((s) => s.trim()).filter((s) => s.length > 0).slice(0, 6);
  const steps = useMemo(() => buildSteps(set), [set]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">集合(逗号分隔):</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48 font-mono"
        />
        <span className="text-xs text-gray-500">（≤6 个元素）</span>
      </div>
      <Stepper steps={steps} codeLines={powerSetCode} render={render} />
    </div>
  );
}
