'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const dpCode = [
  'function knapsack(items, capacity) {',
  '  const n = items.length;',
  '  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));',
  '  for (let i = 1; i <= n; i++) {',
  '    for (let w = 1; w <= capacity; w++) {',
  '      if (items[i-1].weight > w)',
  '        dp[i][w] = dp[i-1][w];',
  '      else',
  '        dp[i][w] = Math.max(dp[i-1][w],',
  '          dp[i-1][w - items[i-1].weight] + items[i-1].value);',
  '    }',
  '  }',
  '  return dp[n][capacity];',
  '}',
];

interface DPState {
  table: number[][];
  items: { weight: number; value: number }[];
  capacity: number;
  currentCell: [number, number] | null;
  compareCells: [number, number][];
  filled: boolean[][];
  message: string;
}

function buildSteps(
  items: { weight: number; value: number }[],
  capacity: number,
): VizStep<DPState>[] {
  const steps: VizStep<DPState>[] = [];
  const n = items.length;
  const table: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  const filled: boolean[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(false));

  // Mark first row and column as filled (base case)
  for (let w = 0; w <= capacity; w++) filled[0][w] = true;
  for (let i = 0; i <= n; i++) filled[i][0] = true;

  steps.push({
    state: {
      table: table.map((r) => [...r]),
      items,
      capacity,
      currentCell: null,
      compareCells: [],
      filled: filled.map((r) => [...r]),
      message: `初始化 DP 表：${n} 个物品，背包容量 ${capacity}`,
    },
    description: '初始化：dp[0][*]=0, dp[*][0]=0',
    codeLine: 3,
  });

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 1; w <= capacity; w++) {
      const compare: [number, number][] = [[i - 1, w]];
      let newVal: number;
      let msg: string;

      if (weight > w) {
        newVal = table[i - 1][w];
        msg = `物品${i}(重${weight}) > 容量${w}，不能选 → dp[${i}][${w}] = dp[${i - 1}][${w}] = ${newVal}`;
      } else {
        compare.push([i - 1, w - weight]);
        const notTake = table[i - 1][w];
        const take = table[i - 1][w - weight] + value;
        newVal = Math.max(notTake, take);
        msg = take > notTake
          ? `选物品${i}(值${value})：dp[${i - 1}][${w - weight}]+${value}=${take} > dp[${i - 1}][${w}]=${notTake} → ${newVal}`
          : `不选物品${i}：dp[${i - 1}][${w}]=${notTake} ≥ dp[${i - 1}][${w - weight}]+${value}=${take} → ${newVal}`;
      }

      table[i][w] = newVal;
      filled[i][w] = true;

      steps.push({
        state: {
          table: table.map((r) => [...r]),
          items,
          capacity,
          currentCell: [i, w],
          compareCells: compare,
          filled: filled.map((r) => [...r]),
          message: msg,
        },
        description: msg,
        codeLine: weight > w ? 7 : 10,
      });
    }
  }

  steps.push({
    state: {
      table: table.map((r) => [...r]),
      items,
      capacity,
      currentCell: [n, capacity],
      compareCells: [],
      filled: filled.map((r) => [...r]),
      message: `✅ 最大价值 = dp[${n}][${capacity}] = ${table[n][capacity]}`,
    },
    description: `完成！最大价值 = ${table[n][capacity]}`,
    codeLine: 13,
  });

  return steps;
}

export function DPPanel() {
  const [items, setItems] = useState<{ weight: number; value: number }[]>([
    { weight: 2, value: 3 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
    { weight: 5, value: 6 },
  ]);
  const [capacity, setCapacity] = useState(8);
  const steps = useMemo(() => buildSteps(items, capacity), [items, capacity]);
  const initial: DPState = {
    table: [],
    items,
    capacity,
    currentCell: null,
    compareCells: [],
    filled: [],
    message: '',
  };

  const presets = [
    { label: '4物品/容量8', items: [{ weight: 2, value: 3 }, { weight: 3, value: 4 }, { weight: 4, value: 5 }, { weight: 5, value: 6 }], cap: 8 },
    { label: '3物品/容量5', items: [{ weight: 1, value: 1 }, { weight: 3, value: 4 }, { weight: 4, value: 5 }], cap: 5 },
    { label: '5物品/容量10', items: [{ weight: 2, value: 6 }, { weight: 2, value: 3 }, { weight: 6, value: 5 }, { weight: 5, value: 4 }, { weight: 4, value: 6 }], cap: 10 },
  ];

  return (
    <Stepper<DPState>
      steps={steps}
      initialState={initial}
      codeLines={dpCode}
      codeTitle="0/1 背包 Knapsack"
      headerActions={
        <>
          <span className="text-sm text-gray-400">预设:</span>
          <select
            onChange={(e) => {
              const p = presets[Number(e.target.value)];
              setItems(p.items);
              setCapacity(p.cap);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm"
            defaultValue="0"
          >
            {presets.map((p, i) => (
              <option key={i} value={i}>{p.label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400">容量:</span>
          <input
            type="number"
            value={capacity}
            min={1}
            max={12}
            onChange={(e) => setCapacity(Math.min(12, Math.max(1, Number(e.target.value))))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-4">
          {/* Items info */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <span className="text-gray-500">物品:</span>
            {state.items.map((item, i) => (
              <span key={i} className="px-2 py-1 bg-surface-2 border border-edge-2 rounded text-gray-300">
                #{i + 1} (重{item.weight}, 值{item.value})
              </span>
            ))}
          </div>

          {/* DP Table */}
          {state.table.length > 0 && (
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs font-mono mx-auto">
                <thead>
                  <tr>
                    <th className="p-1 text-gray-500 border border-edge">i\w</th>
                    {Array.from({ length: state.capacity + 1 }).map((_, w) => (
                      <th key={w} className="p-1 text-gray-500 border border-edge w-8">{w}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.table.map((row, i) => (
                    <tr key={i}>
                      <td className="p-1 text-gray-500 border border-edge text-center">{i}</td>
                      {row.map((val, w) => {
                        const isCurrent = state.currentCell?.[0] === i && state.currentCell?.[1] === w;
                        const isCompare = state.compareCells.some(([r, c]) => r === i && c === w);
                        const isFilled = state.filled[i]?.[w];
                        return (
                          <td
                            key={w}
                            className={clsx(
                              'p-1 border border-edge text-center w-8 transition-all',
                              isCurrent
                                ? 'bg-blue-500/30 text-blue-200 font-bold'
                                : isCompare
                                  ? 'bg-yellow-500/20 text-yellow-200'
                                  : isFilled
                                    ? 'text-gray-300'
                                    : 'text-gray-600',
                            )}
                          >
                            {isFilled || isCurrent ? val : '·'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}

          <div className="text-[11px] text-gray-500 text-center">
            状态转移：dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])
          </div>
        </div>
      )}
    />
  );
}
