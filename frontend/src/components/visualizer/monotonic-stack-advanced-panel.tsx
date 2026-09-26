'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const monoStackCode = [
  'function largestRectangleArea(heights) {',
  '  const stack = []; // 单调递增栈，存下标',
  '  let maxArea = 0;',
  '  for (let i = 0; i <= heights.length; i++) {',
  '    const h = i === heights.length ? 0 : heights[i];',
  '    while (stack.length && heights[stack.at(-1)] > h) {',
  '      const height = heights[stack.pop()];',
  '      const width = stack.length ? i - stack.at(-1) - 1 : i;',
  '      maxArea = Math.max(maxArea, height * width);',
  '    }',
  '    stack.push(i);',
  '  }',
  '  return maxArea;',
  '}',
];

interface MonoStackState {
  heights: number[];
  stack: number[];
  current: number;
  poppedIdx: number;
  rectLeft: number;
  rectRight: number;
  rectHeight: number;
  maxArea: number;
  bestLeft: number;
  bestRight: number;
  bestHeight: number;
  message: string;
  done: boolean;
}

function buildSteps(heights: number[]): VizStep<MonoStackState>[] {
  const steps: VizStep<MonoStackState>[] = [];
  const stack: number[] = [];
  let maxArea = 0;
  let bestLeft = -1;
  let bestRight = -1;
  let bestHeight = 0;

  const snap = (current: number, poppedIdx: number, rectLeft: number, rectRight: number, rectHeight: number, message: string, done = false): MonoStackState => ({
    heights: [...heights],
    stack: [...stack],
    current,
    poppedIdx,
    rectLeft,
    rectRight,
    rectHeight,
    maxArea,
    bestLeft,
    bestRight,
    bestHeight,
    message,
    done,
  });

  steps.push({
    state: snap(-1, -1, -1, -1, 0, '单调递增栈：栈中存下标，对应高度从栈底到栈顶递增。遇到更矮的柱子就弹出计算面积。'),
    description: '初始化',
    codeLine: 1,
  });

  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];

    steps.push({
      state: snap(i, -1, -1, -1, 0, i === heights.length ? '遍历结束，用哨兵高度 0 清空栈中剩余柱子' : `当前柱子 heights[${i}]=${h}，与栈顶比较`),
      description: i === heights.length ? '哨兵 h=0' : `i=${i}, h=${h}`,
      codeLine: 4,
    });

    while (stack.length && heights[stack[stack.length - 1]] > h) {
      const top = stack[stack.length - 1];
      steps.push({
        state: snap(i, top, -1, -1, 0, `heights[${top}]=${heights[top]} > ${h}，弹出栈顶 ${top}，计算以 ${heights[top]} 为高的最大矩形`),
        description: `弹出 ${top}`,
        codeLine: 6,
      });
      stack.pop();
      const height = heights[top];
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      const right = i - 1;
      const area = height * width;
      const updated = area > maxArea;
      if (updated) {
        maxArea = area;
        bestLeft = left;
        bestRight = right;
        bestHeight = height;
      }
      steps.push({
        state: snap(i, top, left, right, height, `宽度 = ${stack.length ? `${i} - ${stack[stack.length - 1]} - 1` : i} = ${width}，面积 = ${height} × ${width} = ${area}${updated ? ' ★ 更新最大面积！' : ` ≤ ${maxArea} 不更新`}`),
        description: `面积=${area}${updated ? '★' : ''}`,
        codeLine: 8,
      });
    }

    stack.push(i);
    if (i < heights.length) {
      steps.push({
        state: snap(i, -1, -1, -1, 0, `${i} 入栈，栈: [${stack.join(', ')}]（保持高度递增）`),
        description: `${i} 入栈`,
        codeLine: 10,
      });
    }
  }

  steps.push({
    state: snap(-1, -1, bestLeft, bestRight, bestHeight, `最大矩形面积 = ${maxArea}（高度 ${bestHeight}，范围 [${bestLeft}, ${bestRight}]）`, true),
    description: `结果 = ${maxArea}`,
    codeLine: 12,
  });

  return steps;
}

export function MonotonicStackAdvancedPanel() {
  const [heightsText, setHeightsText] = useState('2, 1, 5, 6, 2, 3');

  const heights = useMemo(
    () => heightsText.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n >= 0),
    [heightsText],
  );

  const steps = useMemo(() => buildSteps(heights), [heights]);

  const initial: MonoStackState = {
    heights,
    stack: [],
    current: -1,
    poppedIdx: -1,
    rectLeft: -1,
    rectRight: -1,
    rectHeight: 0,
    maxArea: 0,
    bestLeft: -1,
    bestRight: -1,
    bestHeight: 0,
    message: '',
    done: false,
  };

  const maxH = Math.max(...heights, 1);

  return (
    <Stepper<MonoStackState>
      steps={steps}
      initialState={initial}
      codeLines={monoStackCode}
      codeTitle="柱状图最大矩形 Largest Rectangle"
      headerActions={
        <>
          <span className="text-sm text-gray-400">柱高:</span>
          <input
            type="text"
            value={heightsText}
            onChange={(e) => setHeightsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="逗号分隔，如 2,1,5,6,2,3"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前扫描位置，红色=弹出的柱子，蓝色区域=当前计算的矩形，绿色区域=历史最大矩形
          </div>

          {/* Histogram */}
          <div className="flex items-end justify-center gap-1" style={{ height: 160 }}>
            {state.heights.map((h, i) => {
              const isCurrent = i === state.current;
              const isPopped = i === state.poppedIdx;
              const inRect = state.rectLeft >= 0 && i >= state.rectLeft && i <= state.rectRight;
              const inBest = state.bestLeft >= 0 && i >= state.bestLeft && i <= state.bestRight;
              const barColor = isPopped
                ? 'bg-red-500/60 border-red-400'
                : isCurrent
                  ? 'bg-yellow-500/50 border-yellow-400'
                  : inRect
                    ? 'bg-blue-500/40 border-blue-400'
                    : inBest
                      ? 'bg-green-500/30 border-green-500'
                      : 'bg-edge border-edge-2';
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-gray-500 font-mono">{h}</span>
                  <div
                    className={clsx('w-10 rounded-t border transition-all', barColor)}
                    style={{ height: Math.max(4, (h / maxH) * 120) }}
                  />
                  <span className={clsx('text-[9px] font-mono', isCurrent ? 'text-yellow-300' : 'text-gray-600')}>{i}</span>
                </div>
              );
            })}
            {/* Sentinel position */}
            {state.current === state.heights.length && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[9px] text-red-300 font-mono">0</span>
                <div className="w-10 rounded-t border bg-red-500/20 border-red-400" style={{ height: 4 }} />
                <span className="text-[9px] font-mono text-red-300">哨兵</span>
              </div>
            )}
          </div>

          {/* Stack */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">栈 (下标，高度递增):</div>
            <div className="flex gap-1 items-center min-h-[40px]">
              {state.stack.length === 0 ? (
                <span className="text-gray-600 text-sm">空</span>
              ) : (
                state.stack.map((idx, si) => (
                  <div key={si} className="flex items-center gap-1">
                    <div
                      className={clsx(
                        'w-9 h-9 flex items-center justify-center rounded text-xs font-mono border transition-all',
                        si === state.stack.length - 1
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200'
                          : 'bg-surface-2 border-edge-2 text-ink-2',
                      )}
                    >
                      {idx}
                      <span className="text-[8px] text-gray-500 ml-0.5">({state.heights[idx] ?? 0})</span>
                    </div>
                    {si < state.stack.length - 1 && <span className="text-gray-600 text-xs">→</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Max area display */}
          <div className="flex items-center gap-4 justify-center">
            <span className="text-sm font-mono text-gray-300">maxArea = <span className="text-green-300 font-bold">{state.maxArea}</span></span>
            {state.bestLeft >= 0 && (
              <span className="text-xs text-gray-500">
                (高 {state.bestHeight} × 宽 {state.bestRight - state.bestLeft + 1}，范围 [{state.bestLeft},{state.bestRight}])
              </span>
            )}
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
