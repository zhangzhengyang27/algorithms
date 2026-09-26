'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const rainTerracesCode = [
  'function trap(heights) {',
  '  let water = 0;',
  '  for (let i = 0; i < heights.length; i++) {',
  '    const left = Math.max(...heights.slice(0, i + 1));',
  '    const right = Math.max(...heights.slice(i));',
  '    const level = Math.min(left, right);',
  '    if (level > heights[i]) water += level - heights[i];',
  '  }',
  '  return water;',
  '}',
];

interface RainTerracesState {
  heights: number[];
  water: number[];
  current: number;
  leftMax: number;
  rightMax: number;
  message: string;
}

function buildSteps(heights: number[]): VizStep<RainTerracesState>[] {
  const steps: VizStep<RainTerracesState>[] = [];
  const water = new Array(heights.length).fill(0);
  let total = 0;

  const snapshot = (current: number, leftMax: number, rightMax: number, message: string, codeLine: number): VizStep<RainTerracesState> => ({
    state: { heights, water: [...water], current, leftMax, rightMax, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(-1, 0, 0, `接雨水：计算每根柱子上方能接住的雨水量`, 1));

  for (let i = 0; i < heights.length; i++) {
    let leftMax = heights[0];
    for (let j = 1; j <= i; j++) leftMax = Math.max(leftMax, heights[j]);
    let rightMax = heights[heights.length - 1];
    for (let j = heights.length - 2; j >= i; j--) rightMax = Math.max(rightMax, heights[j]);
    const level = Math.min(leftMax, rightMax);
    if (level > heights[i]) {
      water[i] = level - heights[i];
      total += water[i];
    }
    steps.push(
      snapshot(
        i,
        leftMax,
        rightMax,
        `位置 ${i}：左最高 ${leftMax}，右最高 ${rightMax}，水面 ${level}，接水 ${water[i]}`,
        6,
      ),
    );
  }

  steps.push(snapshot(-1, 0, 0, `总接水量 = ${total}`, 8));
  return steps;
}

function render(state: RainTerracesState) {
  const { heights, water, current, leftMax, rightMax, message } = state;
  const maxH = Math.max(...heights, ...water.map((w, i) => heights[i] + w), 1);
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1 h-48">
        {heights.map((h, i) => (
          <div key={i} className="flex flex-col-reverse items-center" style={{ width: 28 }}>
            <div
              className="w-full bg-sky-400/70 border border-sky-300"
              style={{ height: `${(water[i] / maxH) * 180}px` }}
              title={water[i] > 0 ? `水 ${water[i]}` : ''}
            />
            <div
              className={`w-full border border-edge ${i === current ? 'bg-amber-300' : 'bg-slate-400'}`}
              style={{ height: `${(h / maxH) * 180}px` }}
            >
              <div className="text-[10px] text-center text-black leading-none">{h}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
      <p className="text-xs text-gray-500">
        当前位置左最高 {leftMax}，右最高 {rightMax}（蓝色为可接住的雨水）
      </p>
    </div>
  );
}

export function RainTerracesPanel() {
  const [heights, setHeights] = useState<number[]>([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]);
  const text = heights.join(',');
  const steps = useMemo(() => buildSteps(heights), [heights]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">柱子高度:</span>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const arr = e.target.value.split(',').map((s) => parseInt(s.trim(), 10)).filter((x) => !Number.isNaN(x));
            if (arr.length >= 2 && arr.length <= 20) setHeights(arr);
          }}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-72 font-mono"
        />
      </div>
      <Stepper steps={steps} codeLines={rainTerracesCode} render={render} />
    </div>
  );
}
