'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const knapsackCode = [
  'function knapsack(items, W, type) {',
  '  // type: "01"=上一行(倒序) "complete"=本行(正序) "multiple"=拆分后按01',
  '  const n = items.length;',
  '  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));',
  '  for (let i = 1; i <= n; i++)',
  '    for (let j = 0; j <= W; j++) {',
  '      dp[i][j] = dp[i - 1][j]; // 不选第 i 件',
  '      if (j >= items[i - 1].w) {',
  '        const ref = type === "complete"',
  '          ? dp[i][j - items[i - 1].w]      // 本行 → 可重复选',
  '          : dp[i - 1][j - items[i - 1].w]; // 上一行 → 只选一次',
  '        dp[i][j] = Math.max(dp[i][j], ref + items[i - 1].v);',
  '      }',
  '    }',
  '  return dp[n][W];',
  '}',
];

type Mode = '01' | 'complete' | 'multiple';

interface Item {
  w: number;
  v: number;
}

interface KnapsackState {
  items: Item[];
  W: number;
  dp: number[][];
  curI: number;
  curJ: number;
  refCell: [number, number] | null;
  aboveCell: [number, number] | null;
  tookItem: boolean | null;
  phase: 'fill' | 'trace' | 'done';
  traceI: number;
  traceJ: number;
  chosenRows: number[];
  message: string;
  mode: Mode;
}

function binarySplit(w: number, v: number, count: number): Item[] {
  const result: Item[] = [];
  let k = 1;
  let remain = count;
  while (remain >= k) {
    result.push({ w: w * k, v: v * k });
    remain -= k;
    k *= 2;
  }
  if (remain > 0) result.push({ w: w * remain, v: v * remain });
  return result;
}

export function buildSteps(rawItems: { w: number; v: number; count: number }[], W: number, mode: Mode): VizStep<KnapsackState>[] {
  const steps: VizStep<KnapsackState>[] = [];

  let items: Item[];
  if (mode === 'multiple') {
    items = rawItems.flatMap((it) => binarySplit(it.w, it.v, it.count));
  } else {
    items = rawItems.map((it) => ({ w: it.w, v: it.v }));
  }

  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  const snap = (curI: number, curJ: number, refCell: [number, number] | null, aboveCell: [number, number] | null, tookItem: boolean | null, phase: 'fill' | 'trace' | 'done', traceI: number, traceJ: number, chosenRows: number[], message: string): KnapsackState => ({
    items: [...items],
    W,
    dp: dp.map((r) => [...r]),
    curI,
    curJ,
    refCell,
    aboveCell,
    tookItem,
    phase,
    traceI,
    traceJ,
    chosenRows: [...chosenRows],
    message,
    mode,
  });

  const modeLabel = mode === '01' ? '0/1 背包' : mode === 'complete' ? '完全背包' : '多重背包(二进制拆分)';

  if (mode === 'multiple') {
    steps.push({
      state: snap(-1, -1, null, null, null, 'fill', -1, -1, [], `${modeLabel}：将物品按 1,2,4,... 拆分成若干组，转化为 0/1 背包。拆分后共 ${n} 组：[${items.map((it, i) => `组${i + 1}(w=${it.w},v=${it.v})`).join('，')}]`),
      description: '二进制拆分',
      codeLine: 1,
    });
  } else {
    steps.push({
      state: snap(-1, -1, null, null, null, 'fill', -1, -1, [], `${modeLabel}：dp[i][j] = 前 i 件物品、容量 j 的最大价值。${mode === 'complete' ? '完全背包参考本行 dp[i][j-w]（正序→可重复选）' : '0/1 背包参考上一行 dp[i-1][j-w]（倒序→只选一次）'}`),
      description: '初始化 dp 表',
      codeLine: 3,
    });
  }

  for (let i = 1; i <= n; i++) {
    const it = items[i - 1];
    steps.push({
      state: snap(i, -1, null, null, null, 'fill', -1, -1, [], `处理第 ${i} 件物品 (w=${it.w}, v=${it.v})，填第 ${i} 行`),
      description: `物品${i} (w=${it.w},v=${it.v})`,
      codeLine: 4,
    });

    for (let j = 0; j <= W; j++) {
      dp[i][j] = dp[i - 1][j];
      if (j >= it.w) {
        const refI = mode === 'complete' ? i : i - 1;
        const refJ = j - it.w;
        const refVal = dp[refI][refJ];
        const take = refVal + it.v;
        const took = take > dp[i][j];
        if (took) dp[i][j] = take;
        steps.push({
          state: snap(i, j, [refI, refJ], [i - 1, j], took, 'fill', -1, -1, [],
            `dp[${i}][${j}]：不选=${dp[i - 1][j]}；选：参考 dp[${refI}][${refJ}]=${refVal} + ${it.v} = ${take}${took ? ` → 取 ${take}（选！参考${mode === 'complete' ? '本行' : '上一行'}）` : ` → 取 ${dp[i][j]}（不选）`}`),
          description: `dp[${i}][${j}]=${dp[i][j]}`,
          codeLine: took ? 11 : 6,
        });
      } else {
        steps.push({
          state: snap(i, j, null, [i - 1, j], false, 'fill', -1, -1, [],
            `dp[${i}][${j}]：j=${j} < w=${it.w}，放不下，继承 dp[${i - 1}][${j}]=${dp[i][j]}`),
          description: `dp[${i}][${j}]=${dp[i][j]}`,
          codeLine: 6,
        });
      }
    }
  }

  steps.push({
    state: snap(-1, -1, null, null, null, 'fill', -1, -1, [], `填表完成，dp[${n}][${W}] = ${dp[n][W]}。开始回溯选取方案...`),
    description: `最优值=${dp[n][W]}`,
    codeLine: 14,
  });

  // Backtracking
  const chosenRows: number[] = [];
  let ti = n;
  let tj = W;
  steps.push({
    state: snap(-1, -1, null, null, null, 'trace', ti, tj, chosenRows, `从 dp[${n}][${W}]=${dp[n][W]} 开始回溯`),
    description: '开始回溯',
    codeLine: 14,
  });

  while (ti > 0 && tj > 0) {
    if (dp[ti][tj] !== dp[ti - 1][tj]) {
      chosenRows.push(ti);
      const it = items[ti - 1];
      const newJ = tj - it.w;
      steps.push({
        state: snap(-1, -1, [ti - 1, newJ], null, true, 'trace', ti, tj, chosenRows,
          `dp[${ti}][${tj}]=${dp[ti][tj]} ≠ dp[${ti - 1}][${tj}]=${dp[ti - 1][tj]} → 选了物品${ti} (w=${it.w},v=${it.v})，跳到 dp[${mode === 'complete' ? ti : ti - 1}][${newJ}]`),
        description: `选了物品${ti}`,
        codeLine: 11,
      });
      tj = newJ;
      if (mode !== 'complete') ti--;
    } else {
      steps.push({
        state: snap(-1, -1, null, null, false, 'trace', ti, tj, chosenRows,
          `dp[${ti}][${tj}]=${dp[ti][tj]} == dp[${ti - 1}][${tj}] → 没选物品${ti}，上移到第 ${ti - 1} 行`),
        description: `没选物品${ti}`,
        codeLine: 6,
      });
      ti--;
    }
  }

  const chosenDesc = chosenRows.length > 0
    ? chosenRows.map((r) => `物品${r}(w=${items[r - 1].w},v=${items[r - 1].v})`).join('、')
    : '无';
  steps.push({
    state: snap(-1, -1, null, null, null, 'done', -1, -1, chosenRows, `回溯完成！选取方案：${chosenDesc}，总价值 = ${dp[n][W]}`),
    description: '回溯完成',
    codeLine: 14,
  });

  return steps;
}

const MODE_LABELS: Record<Mode, string> = {
  '01': '0/1 背包',
  complete: '完全背包',
  multiple: '多重背包',
};

export function DpKnapsackPanel() {
  const [mode, setMode] = useState<Mode>('complete');
  const [W, setW] = useState(8);
  const [itemsText, setItemsText] = useState('2,3 3,4 4,5');
  const [countsText, setCountsText] = useState('2,2,2');

  const rawItems = useMemo(() => {
    const parsed = itemsText.split(/\s+/).map((s) => s.split(',').map(Number)).filter((p) => p.length === 2 && p.every((x) => Number.isFinite(x) && x > 0));
    return parsed.map(([w, v]) => ({ w, v, count: 1 }));
  }, [itemsText]);

  const itemsWithCounts = useMemo(() => {
    const counts = countsText.split(',').map((s) => Number(s.trim()));
    return rawItems.map((it, i) => ({ ...it, count: Math.max(1, Math.min(5, counts[i] ?? 1)) }));
  }, [rawItems, countsText]);

  const steps = useMemo(
    () => buildSteps(itemsWithCounts.slice(0, 4), Math.min(W, 12), mode),
    [itemsWithCounts, W, mode],
  );

  const initial: KnapsackState = {
    items: [],
    W,
    dp: [],
    curI: -1,
    curJ: -1,
    refCell: null,
    aboveCell: null,
    tookItem: null,
    phase: 'fill',
    traceI: -1,
    traceJ: -1,
    chosenRows: [],
    message: '',
    mode,
  };

  return (
    <Stepper<KnapsackState>
      steps={steps}
      initialState={initial}
      codeLines={knapsackCode}
      codeTitle="背包 DP Knapsack"
      headerActions={
        <>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm"
          >
            <option value="01">0/1 背包</option>
            <option value="complete">完全背包</option>
            <option value="multiple">多重背包</option>
          </select>
          <span className="text-sm text-gray-400">容量W:</span>
          <input
            type="number"
            value={W}
            min={3}
            max={12}
            onChange={(e) => setW(Math.max(3, Math.min(12, Number(e.target.value) || 3)))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-14"
          />
          <span className="text-sm text-gray-400">物品(w,v):</span>
          <input
            type="text"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-36"
            placeholder="如 2,3 3,4"
          />
          {mode === 'multiple' && (
            <>
              <span className="text-sm text-gray-400">数量:</span>
              <input
                type="text"
                value={countsText}
                onChange={(e) => setCountsText(e.target.value)}
                className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-20"
                placeholder="如 2,2,2"
              />
            </>
          )}
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">
            黄色=当前填写格，紫色=转移参考格（{state.mode === 'complete' ? '本行→可重复选' : '上一行→只选一次'}），蓝色=不选继承格，绿色=回溯选中
          </div>

          {/* Items */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-gray-500">
              {MODE_LABELS[state.mode]}{state.mode === 'multiple' ? `（拆分后 ${state.items.length} 组）` : ''}:
            </span>
            {state.items.map((it, i) => (
              <span
                key={i}
                className={clsx(
                  'px-2 py-0.5 rounded text-xs font-mono border',
                  state.curI === i + 1
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
                    : state.chosenRows.includes(i + 1)
                      ? 'bg-green-500/20 border-green-500 text-green-300'
                      : 'bg-surface-2 border-edge-2 text-ink-2',
                )}
              >
                物品{i + 1}: w={it.w} v={it.v}
              </span>
            ))}
          </div>

          {/* DP table */}
          {state.dp.length > 0 && (
            <div className="overflow-x-auto">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="text-[9px] text-gray-600 p-1 font-normal">i\j</th>
                    {Array.from({ length: state.W + 1 }, (_, j) => (
                      <th key={j} className={clsx('text-[9px] p-1 font-mono font-normal min-w-[30px]', j === state.curJ ? 'text-yellow-300' : 'text-gray-600')}>
                        {j}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.dp.map((row, i) => (
                    <tr key={i}>
                      <td className="text-[9px] text-gray-600 p-1 font-mono">
                        {i === 0 ? '∅' : `物${i}`}
                      </td>
                      {row.map((v, j) => {
                        const isCur = i === state.curI && j === state.curJ;
                        const isRef = state.refCell !== null && state.refCell[0] === i && state.refCell[1] === j;
                        const isAbove = state.aboveCell !== null && state.aboveCell[0] === i && state.aboveCell[1] === j;
                        const isTrace = state.phase !== 'fill' && i === state.traceI && j === state.traceJ;
                        const isChosen = state.chosenRows.includes(i) && state.phase !== 'fill' && isRef;
                        return (
                          <td
                            key={j}
                            className={clsx(
                              'p-1 text-center text-xs font-mono border rounded-sm transition-all min-w-[30px]',
                              isCur
                                ? 'bg-yellow-500/30 border-yellow-400 text-yellow-100 font-bold scale-105'
                                : isRef
                                  ? isChosen
                                    ? 'bg-green-500/30 border-green-400 text-green-200'
                                    : 'bg-purple-500/30 border-purple-400 text-purple-200'
                                  : isAbove
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                                    : isTrace
                                      ? 'bg-orange-500/20 border-orange-400 text-orange-200'
                                      : 'bg-surface-2 border-edge text-ink-3',
                            )}
                          >
                            {v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Chosen items summary */}
          {state.phase === 'done' && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                选取：{state.chosenRows.map((r) => `物品${r}`).join(' + ') || '无'} → 最大价值 = {state.dp.length > 0 ? state.dp[state.dp.length - 1][state.W] : 0}
              </span>
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
