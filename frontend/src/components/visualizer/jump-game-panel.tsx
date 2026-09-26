'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const jumpGameCode = [
  'function jumpGame(nums) {',
  '  let goal = nums.length - 1;',
  '  for (let i = nums.length - 2; i >= 0; i--) {',
  '    if (i + nums[i] >= goal) goal = i;',
  '  }',
  '  return goal === 0;',
  '}',
];

interface JumpGameState {
  nums: number[];
  goal: number;
  i: number;
  reachable: boolean[];
  message: string;
}

function buildSteps(nums: number[]): VizStep<JumpGameState>[] {
  const steps: VizStep<JumpGameState>[] = [];
  const reachable = new Array(nums.length).fill(false);
  let goal = nums.length - 1;
  reachable[goal] = true;

  const snapshot = (i: number, message: string, codeLine: number): VizStep<JumpGameState> => ({
    state: { nums, goal, i, reachable: [...reachable], message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, `目标：能否从下标 0 跳到末尾（下标 ${nums.length - 1}）`, 1));

  for (let i = nums.length - 2; i >= 0; i--) {
    const canReach = i + nums[i] >= goal;
    steps.push(snapshot(i, `i=${i}，nums[${i}]=${nums[i]}，最远到 ${i + nums[i]}，目标=${goal}`, 3));
    if (canReach) {
      goal = i;
      reachable[i] = true;
      steps.push(snapshot(i, `可到达目标，更新目标为 ${i}`, 4));
    }
  }

  const ok = goal === 0;
  steps.push(snapshot(-1, ok ? '✅ 可达：从下标 0 能跳到末尾' : '❌ 不可达：下标 0 无法到达末尾', 6));
  return steps;
}

function render(state: JumpGameState) {
  const { nums, goal, i, reachable, message } = state;
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {nums.map((v, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center border border-edge rounded px-2 py-1 min-w-11 ${
              i === idx ? 'bg-amber-300 text-black' : reachable[idx] ? 'bg-emerald-500/30' : 'bg-surface-2'
            }`}
          >
            <span className="text-[10px] text-gray-400">[{idx}]</span>
            <span className="text-lg font-mono">{v}</span>
            {idx === goal && <span className="text-[10px] text-emerald-400">目标</span>}
            {reachable[idx] && idx !== goal && <span className="text-[10px] text-emerald-400">可达</span>}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
    </div>
  );
}

export function JumpGamePanel() {
  const [nums, setNums] = useState<number[]>([2, 3, 1, 1, 4]);
  const text = nums.join(',');
  const steps = useMemo(() => buildSteps(nums), [nums]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">跳跃长度:</span>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const arr = e.target.value.split(',').map((s) => parseInt(s.trim(), 10)).filter((x) => !Number.isNaN(x) && x >= 0);
            if (arr.length >= 2 && arr.length <= 15) setNums(arr);
          }}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-72 font-mono"
        />
      </div>
      <Stepper steps={steps} codeLines={jumpGameCode} render={render} />
    </div>
  );
}
