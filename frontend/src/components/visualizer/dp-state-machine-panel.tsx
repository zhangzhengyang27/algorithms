'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const stateMachineCode = [
  'function maxProfit(prices) {',
  '  let hold = -prices[0], sold = 0, cool = 0;',
  '  for (let i = 1; i < prices.length; i++) {',
  '    const prevHold = hold, prevSold = sold;',
  '    hold = Math.max(prevHold, cool - prices[i]);',
  '    sold = prevHold + prices[i];',
  '    cool = Math.max(cool, prevSold);',
  '  }',
  '  return Math.max(sold, cool);',
  '}',
];

type TransKey = 'hold-hold' | 'cool-hold' | 'hold-sold' | 'sold-cool' | 'cool-cool';

interface DpRow { hold: number; sold: number; cool: number; }

interface SmState {
  prices: number[];
  day: number;
  hold: number;
  sold: number;
  cool: number;
  history: DpRow[];
  activeStates: string[];
  activeTrans: TransKey | null;
  transLabel: string;
  answer: number | null;
  phase: 'init' | 'dp' | 'done';
  message: string;
}

export function buildSteps(prices: number[]): VizStep<SmState>[] {
  const steps: VizStep<SmState>[] = [];
  const history: DpRow[] = [];
  let hold = -prices[0], sold = 0, cool = 0;
  history.push({ hold, sold, cool });

  const snap = (day: number, activeStates: string[], activeTrans: TransKey | null, transLabel: string, answer: number | null, phase: SmState['phase'], msg: string): SmState => ({
    prices, day, hold, sold, cool, history: history.map((r) => ({ ...r })),
    activeStates, activeTrans, transLabel, answer, phase, message: msg,
  });

  steps.push({
    state: snap(0, ['hold'], null, '', null, 'init', `第 0 天：买入股票 hold = -${prices[0]}，sold = 0，cool = 0`),
    description: '第0天初始化',
    codeLine: 1,
  });

  for (let i = 1; i < prices.length; i++) {
    const p = prices[i];
    const prevHold = hold, prevSold = sold, prevCool = cool;

    steps.push({
      state: snap(i, [], null, '', null, 'dp', `第 ${i} 天（价格 ${p}）：记录前一天状态 hold=${prevHold}, sold=${prevSold}, cool=${prevCool}`),
      description: `第${i}天 快照`,
      codeLine: 3,
    });

    const buyOption = prevCool - p;
    const newHold = Math.max(prevHold, buyOption);
    const holdTrans: TransKey = buyOption > prevHold ? 'cool-hold' : 'hold-hold';
    hold = newHold;
    steps.push({
      state: snap(i, ['hold'], holdTrans, buyOption > prevHold ? `买入：cool(${prevCool}) - ${p} = ${buyOption}` : '保持持有', null, 'dp',
        `hold = max(昨持 ${prevHold}, 冷冻后买 ${prevCool}-${p}=${buyOption}) = ${newHold}${buyOption > prevHold ? ' ← 今天买入!' : ' ← 继续持有'}`),
      description: `hold=${newHold}`,
      codeLine: 4,
    });

    const newSold = prevHold + p;
    sold = newSold;
    steps.push({
      state: snap(i, ['sold'], 'hold-sold', `卖出：${prevHold} + ${p} = ${newSold}`, null, 'dp',
        `sold = 昨持 ${prevHold} + ${p} = ${newSold}（卖出进入冷冻期）`),
      description: `sold=${newSold}`,
      codeLine: 5,
    });

    const newCool = Math.max(prevCool, prevSold);
    const coolTrans: TransKey = prevSold >= prevCool ? 'sold-cool' : 'cool-cool';
    cool = newCool;
    steps.push({
      state: snap(i, ['cool'], coolTrans, prevSold >= prevCool ? '昨天卖出 → 今天冷冻' : '继续空仓', null, 'dp',
        `cool = max(昨冷 ${prevCool}, 昨卖 ${prevSold}) = ${newCool}`),
      description: `cool=${newCool}`,
      codeLine: 6,
    });

    history.push({ hold, sold, cool });
  }

  const answer = Math.max(sold, cool);
  steps.push({
    state: snap(prices.length - 1, ['sold', 'cool'], null, '', answer, 'done', `✅ 最大利润 = max(sold=${sold}, cool=${cool}) = ${answer}（最后一天不能持有股票）`),
    description: `答案=${answer}`,
    codeLine: 8,
  });

  return steps;
}

export function DpStateMachinePanel() {
  const [pricesText, setPricesText] = useState('1,2,3,0,2');

  const prices = useMemo(() => {
    return pricesText.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n >= 0);
  }, [pricesText]);

  const safePrices = prices.length >= 1 ? prices : [1, 2];
  const steps = useMemo(() => buildSteps(safePrices), [safePrices]);
  const initial: SmState = {
    prices: safePrices, day: 0, hold: -safePrices[0], sold: 0, cool: 0,
    history: [], activeStates: [], activeTrans: null, transLabel: '', answer: null, phase: 'init', message: '',
  };

  const isActive = (s: string, state: SmState) => state.activeStates.includes(s);

  return (
    <Stepper<SmState>
      steps={steps}
      initialState={initial}
      codeLines={stateMachineCode}
      codeTitle="状态机 DP（股票含冷冻期）"
      headerActions={
        <>
          <span className="text-sm text-gray-400">价格序列:</span>
          <input
            type="text"
            value={pricesText}
            onChange={(e) => setPricesText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40"
            placeholder="如 1,2,3,0,2"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前活跃状态/转移，绿色=最优值
          </div>

          {/* Prices row */}
          <div className="flex gap-1 flex-wrap justify-center">
            {state.prices.map((p, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-[9px] text-gray-600">第{i}天</div>
                <div
                  className={clsx(
                    'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                    i === state.day
                      ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                      : i < state.day
                        ? 'bg-surface-2 border-edge-2 text-ink-3'
                        : 'bg-surface border-edge text-ink-3',
                  )}
                >
                  {p}
                </div>
              </div>
            ))}
          </div>

          {/* State machine diagram */}
          <div className="flex justify-center">
            <svg viewBox="0 0 400 190" className="w-full max-w-[420px]">
              <defs>
                <marker id="arrow-dp" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6" fill="#666" />
                </marker>
                <marker id="arrow-dp-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6" fill="#facc15" />
                </marker>
              </defs>

              {/* hold -> sold (sell) */}
              <path
                d="M 120 62 Q 200 20 272 48"
                fill="none"
                strokeWidth="2"
                className={state.activeTrans === 'hold-sold' ? 'stroke-yellow-400' : 'stroke-[#444]'}
                markerEnd={state.activeTrans === 'hold-sold' ? 'url(#arrow-dp-active)' : 'url(#arrow-dp)'}
              />
              <text x="190" y="28" textAnchor="middle" className={clsx('text-[10px]', state.activeTrans === 'hold-sold' ? 'fill-yellow-300' : 'fill-gray-500')}>卖出 sell</text>

              {/* sold -> cool (cooldown) */}
              <path
                d="M 310 78 L 310 118"
                fill="none"
                strokeWidth="2"
                className={state.activeTrans === 'sold-cool' ? 'stroke-yellow-400' : 'stroke-[#444]'}
                markerEnd={state.activeTrans === 'sold-cool' ? 'url(#arrow-dp-active)' : 'url(#arrow-dp)'}
              />
              <text x="330" y="102" textAnchor="start" className={clsx('text-[10px]', state.activeTrans === 'sold-cool' ? 'fill-yellow-300' : 'fill-gray-500')}>冷冻</text>

              {/* cool -> hold (buy) */}
              <path
                d="M 272 145 Q 200 175 120 130"
                fill="none"
                strokeWidth="2"
                className={state.activeTrans === 'cool-hold' ? 'stroke-yellow-400' : 'stroke-[#444]'}
                markerEnd={state.activeTrans === 'cool-hold' ? 'url(#arrow-dp-active)' : 'url(#arrow-dp)'}
              />
              <text x="190" y="172" textAnchor="middle" className={clsx('text-[10px]', state.activeTrans === 'cool-hold' ? 'fill-yellow-300' : 'fill-gray-500')}>买入 buy</text>

              {/* hold self-loop */}
              <path
                d="M 55 68 Q 20 50 55 40"
                fill="none"
                strokeWidth="1.5"
                className={state.activeTrans === 'hold-hold' ? 'stroke-yellow-400' : 'stroke-[#333]'}
                markerEnd={state.activeTrans === 'hold-hold' ? 'url(#arrow-dp-active)' : 'url(#arrow-dp)'}
              />

              {/* cool self-loop */}
              <path
                d="M 345 120 Q 385 130 345 150"
                fill="none"
                strokeWidth="1.5"
                className={state.activeTrans === 'cool-cool' ? 'stroke-yellow-400' : 'stroke-[#333]'}
                markerEnd={state.activeTrans === 'cool-cool' ? 'url(#arrow-dp-active)' : 'url(#arrow-dp)'}
              />

              {/* hold node */}
              <circle cx="80" cy="95" r="32" className={clsx('transition-all', isActive('hold', state) ? 'fill-yellow-500/20 stroke-yellow-400' : 'fill-[#1a1a1a] stroke-[#444]')} strokeWidth="2" />
              <text x="80" y="92" textAnchor="middle" className={clsx('text-[11px] font-bold', isActive('hold', state) ? 'fill-yellow-200' : 'fill-gray-300')}>持有</text>
              <text x="80" y="106" textAnchor="middle" className={clsx('text-[9px] font-mono', isActive('hold', state) ? 'fill-yellow-300' : 'fill-gray-500')}>{state.history.length > 0 ? state.history[Math.min(state.day, state.history.length - 1)].hold : -state.prices[0]}</text>

              {/* sold node */}
              <circle cx="310" cy="52" r="26" className={clsx('transition-all', isActive('sold', state) ? 'fill-yellow-500/20 stroke-yellow-400' : 'fill-[#1a1a1a] stroke-[#444]')} strokeWidth="2" />
              <text x="310" y="49" textAnchor="middle" className={clsx('text-[11px] font-bold', isActive('sold', state) ? 'fill-yellow-200' : 'fill-gray-300')}>卖出</text>
              <text x="310" y="63" textAnchor="middle" className={clsx('text-[9px] font-mono', isActive('sold', state) ? 'fill-yellow-300' : 'fill-gray-500')}>{state.sold}</text>

              {/* cool node */}
              <circle cx="310" cy="142" r="26" className={clsx('transition-all', isActive('cool', state) ? 'fill-yellow-500/20 stroke-yellow-400' : 'fill-[#1a1a1a] stroke-[#444]')} strokeWidth="2" />
              <text x="310" y="139" textAnchor="middle" className={clsx('text-[11px] font-bold', isActive('cool', state) ? 'fill-yellow-200' : 'fill-gray-300')}>冷冻</text>
              <text x="310" y="153" textAnchor="middle" className={clsx('text-[9px] font-mono', isActive('cool', state) ? 'fill-yellow-300' : 'fill-gray-500')}>{state.cool}</text>
            </svg>
          </div>

          {/* Transition label */}
          {state.transLabel && (
            <div className="text-center text-xs text-yellow-300 font-mono">{state.transLabel}</div>
          )}

          {/* DP table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono text-center">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="py-1 px-2">天</th>
                  <th className="py-1 px-2">价格</th>
                  <th className="py-1 px-2">hold 持有</th>
                  <th className="py-1 px-2">sold 卖出</th>
                  <th className="py-1 px-2">cool 冷冻</th>
                </tr>
              </thead>
              <tbody>
                {state.history.map((row, i) => (
                  <tr key={i} className={clsx('border-t border-edge', i === state.day && 'bg-yellow-500/10')}>
                    <td className="py-1.5 px-2 text-gray-500">{i}</td>
                    <td className="py-1.5 px-2 text-gray-300">{state.prices[i]}</td>
                    <td className="py-1.5 px-2 text-blue-300">{row.hold}</td>
                    <td className="py-1.5 px-2 text-green-300">{row.sold}</td>
                    <td className="py-1.5 px-2 text-purple-300">{row.cool}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Answer */}
          {state.answer !== null && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">✅ 最大利润 = {state.answer}</span>
            </div>
          )}

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
