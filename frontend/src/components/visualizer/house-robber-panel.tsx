'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const houseRobberCode = [
  'function rob(nums) {',
  '  let prev = 0, cur = 0;',
  '  for (const x of nums) {',
  '    const next = Math.max(cur, prev + x);',
  '    prev = cur;',
  '    cur = next;',
  '  }',
  '  return cur;',
  '}',
];

interface HRState {
  nums: number[];
  i: number;
  prev: number;
  cur: number;
  pick: boolean[];
  message: string;
}

export function buildSteps(nums: number[]): VizStep<HRState>[] {
  const steps: VizStep<HRState>[] = [];
  const pick = new Array(nums.length).fill(false);
  let prev = 0;
  let cur = 0;

  const snap = (i: number, msg: string, cl: number): VizStep<HRState> => ({
    state: { nums: [...nums], i, prev, cur, pick: [...pick], message: msg },
    description: msg,
    codeLine: cl,
  });

  steps.push(snap(-1, `打家劫舍：相邻房屋不能同抢，求能偷到的最大金额`, 1));

  nums.forEach((x, idx) => {
    const next = Math.max(cur, prev + x);
    steps.push(snap(idx, `房屋 ${idx} 价值 ${x}：偷→${prev}+${x}=${prev + x}，不偷→${cur}，取 max=${next}`, 4));
    if (next === prev + x && next !== cur) pick[idx] = true;
    prev = cur;
    cur = next;
  });

  steps.push(snap(nums.length, `✅ 最大可偷金额 = ${cur}`, 7));
  return steps;
}

export function HouseRobberPanel() {
  const [seed, setSeed] = useState<number[]>([2, 7, 9, 3, 1]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: HRState = { nums: [...seed], i: -1, prev: 0, cur: 0, pick: new Array(seed.length).fill(false), message: '' };

  return (
    <Stepper<HRState>
      steps={steps}
      initialState={initial}
      codeLines={houseRobberCode}
      codeTitle="打家劫舍 House Robber"
      headerActions={
        <>
          <span className="text-sm text-gray-400">房屋价值:</span>
          <input type="text" value={seed.join(',')} onChange={(e) => { const p = e.target.value.split(',').map((s) => Number(s.trim())).filter(Number.isFinite); if (p.length >= 2) setSeed(p); }} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56" placeholder="逗号分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">绿色=选择偷的房子，灰色=跳过的房子，底部显示当前 prev/cur 状态</div>
          <div className="flex gap-2 flex-wrap justify-center min-h-22.5 items-end">
            {state.nums.map((v, idx) => (
              <div key={idx} className={clsx('w-14 flex flex-col items-center rounded-t border-2 transition-all', state.pick[idx] ? 'bg-green-500/25 border-green-500 text-green-200' : 'bg-surface-2 border-edge-2 text-gray-400')}>
                <span className="text-[10px] text-gray-500 mt-1">房{idx}</span>
                <span className="text-lg font-mono py-2">{v}</span>
                <span className="text-[10px] mb-1">{state.pick[idx] ? '偷 ✓' : '—'}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 text-sm font-mono">
            <span className="text-gray-400">prev = <span className="text-blue-300">{state.prev}</span></span>
            <span className="text-gray-400">cur = <span className="text-yellow-300">{state.cur}</span></span>
          </div>
          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
