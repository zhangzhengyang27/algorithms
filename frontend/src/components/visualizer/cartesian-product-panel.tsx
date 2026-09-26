'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const cartesianCode = [
  'function product(A, B) {',
  '  const res = [];',
  '  for (const a of A)',
  '    for (const b of B)',
  '      res.push([a, b]);',
  '  return res;',
  '}',
];

interface CartesianState {
  A: string[];
  B: string[];
  ia: number;
  ib: number;
  results: [string, string][];
  message: string;
}

function buildSteps(A: string[], B: string[]): VizStep<CartesianState>[] {
  const steps: VizStep<CartesianState>[] = [];
  const results: [string, string][] = [];

  const snapshot = (ia: number, ib: number, message: string, codeLine: number): VizStep<CartesianState> => ({
    state: { A, B, ia, ib, results: results.map((r) => [...r]), message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, -1, `笛卡尔积：A × B 的全部有序对`, 1));

  for (let ia = 0; ia < A.length; ia += 1) {
    for (let ib = 0; ib < B.length; ib += 1) {
      steps.push(snapshot(ia, ib, `取 A[${ia}]='${A[ia]}' 与 B[${ib}]='${B[ib]}'`, 4));
      results.push([A[ia], B[ib]]);
    }
  }

  steps.push(snapshot(-1, -1, `笛卡尔积共 ${results.length} 个有序对`, 6));
  return steps;
}

function render(state: CartesianState) {
  const { A, B, results, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-sm">
        <span>A = [{A.join(', ')}]</span>
        <span>B = [{B.join(', ')}]</span>
      </div>
      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
        {results.map((r, idx) => (
          <span key={idx} className="px-2 py-1 rounded bg-surface-2 border border-edge text-xs font-mono">
            ({r[0]}, {r[1]})
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );
}

export function CartesianProductPanel() {
  const [aText, setAText] = useState('1,2,3');
  const [bText, setBText] = useState('a,b');
  const A = aText.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  const B = bText.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
  const steps = useMemo(() => buildSteps(A, B), [A, B]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400">集合 A:</span>
        <input type="text" value={aText} onChange={(e) => setAText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-32 font-mono" />
        <span className="text-sm text-gray-400">集合 B:</span>
        <input type="text" value={bText} onChange={(e) => setBText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-32 font-mono" />
      </div>
      <Stepper steps={steps} codeLines={cartesianCode} render={render} />
    </div>
  );
}
