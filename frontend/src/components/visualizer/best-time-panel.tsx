'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const bestTimeCode = [
  'let lastBuy = -prices[0];',
  'let lastSold = 0;',
  'for (let day = 1; day < n; day++) {',
  '  curBuy = max(lastBuy, lastSold - prices[day]);',
  '  curSold = max(lastSold, lastBuy + prices[day]);',
  '  lastBuy = curBuy; lastSold = curSold;',
  '}',
  'return lastSold;',
];

interface BestTimeState {
  prices: number[];
  day: number;
  lastBuy: number;
  lastSold: number;
  curBuy: number;
  curSold: number;
  message: string;
}

function buildSteps(prices: number[]): VizStep<BestTimeState>[] {
  const steps: VizStep<BestTimeState>[] = [];
  let lastBuy = -prices[0];
  let lastSold = 0;

  const snapshot = (day: number, curBuy: number, curSold: number, message: string, codeLine: number): VizStep<BestTimeState> => ({
    state: { prices, day, lastBuy, lastSold, curBuy, curSold, message },
    description: message,
    codeLine,
  });

  steps.push(snapshot(0, -prices[0], 0, `初始化：第 0 天买入成本 lastBuy = -${prices[0]}，lastSold = 0`, 1));

  for (let day = 1; day < prices.length; day++) {
    const curBuy = Math.max(lastBuy, lastSold - prices[day]);
    const curSold = Math.max(lastSold, lastBuy + prices[day]);
    steps.push(snapshot(day, curBuy, curSold, `第 ${day} 天：价格 ${prices[day]}，curBuy=${curBuy}，curSold=${curSold}`, 4));
    lastBuy = curBuy;
    lastSold = curSold;
    steps.push(snapshot(day, curBuy, curSold, `更新：lastBuy=${lastBuy}，lastSold=${lastSold}`, 6));
  }

  steps.push(snapshot(prices.length - 1, lastBuy, lastSold, `最大利润 = ${lastSold}`, 8));
  return steps;
}

function render(state: BestTimeState) {
  const { prices, day, lastBuy, lastSold, message } = state;
  const max = Math.max(...prices, 1);
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1 h-40">
        {prices.map((p, idx) => (
          <div key={idx} className="flex flex-col items-center" style={{ width: 28 }}>
            <span className="text-[10px]">{p}</span>
            <div
              className={`w-full border border-edge ${idx === day ? 'bg-amber-300' : 'bg-slate-400'}`}
              style={{ height: `${(p / max) * 140}px` }}
            />
            <span className="text-[10px] text-gray-500">{idx}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300">{message}</p>
      <p className="text-xs text-gray-500">lastBuy = {lastBuy}，lastSold = {lastSold}</p>
    </div>
  );
}

export function BestTimePanel() {
  const [prices, setPrices] = useState<number[]>([7, 1, 5, 3, 6, 4]);
  const text = prices.join(',');
  const steps = useMemo(() => buildSteps(prices), [prices]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">价格序列:</span>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            const arr = e.target.value.split(',').map((s) => parseInt(s.trim(), 10)).filter((x) => !Number.isNaN(x));
            if (arr.length >= 2 && arr.length <= 20) setPrices(arr);
          }}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-72 font-mono"
        />
      </div>
      <Stepper steps={steps} codeLines={bestTimeCode} render={render} />
    </div>
  );
}
