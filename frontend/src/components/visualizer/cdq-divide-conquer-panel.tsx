'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const cdqCode = [
  '// 前置：点已按第一维 a 排序',
  'function cdq(l, r) {',
  '  if (l >= r) return;',
  '  const mid = (l + r) >> 1;',
  '  cdq(l, mid); cdq(mid + 1, r);',
  '  const L = pts.slice(l, mid+1).sort((x,y) => x.b - y.b);',
  '  const R = pts.slice(mid+1, r+1).sort((x,y) => x.b - y.b);',
  '  let i = 0;',
  '  for (const p of R) {',
  '    while (i < L.length && L[i].b <= p.b) bitAdd(L[i++].c, 1);',
  '    ans[p.id] += bitQuery(p.c); // 统计 c ≤ p.c 的个数',
  '  }',
  '  for (let j = 0; j < i; j++) bitAdd(L[j].c, -1); // 清空 BIT',
  '}',
];

interface Point { a: number; b: number; c: number; id: number; }

const PTS: Point[] = [
  { a: 1, b: 5, c: 3, id: 0 },
  { a: 2, b: 3, c: 1, id: 1 },
  { a: 3, b: 4, c: 5, id: 2 },
  { a: 4, b: 1, c: 2, id: 3 },
  { a: 5, b: 2, c: 4, id: 4 },
  { a: 6, b: 6, c: 6, id: 5 },
];
const NP = PTS.length;
const MAXC = 6;

interface CDQState {
  ans: number[];
  bit: number[];
  rangeL: number; rangeR: number; mid: number;
  leftIds: number[];
  rightIds: number[];
  addedIds: number[];
  curRightId: number;
  phase: 'init' | 'divide' | 'merge' | 'done';
  message: string;
}

export function buildSteps(pts: Point[] = PTS, maxC: number = MAXC): VizStep<CDQState>[] {

  const np = pts.length;

  const steps: VizStep<CDQState>[] = [];
  const ans = new Array(np).fill(0);
  const bit = new Array(maxC + 1).fill(0);

  const bitAdd = (c: number, delta: number) => { for (let i = c; i <= maxC; i += i & -i) bit[i] += delta; };
  const bitQuery = (c: number) => { let s = 0; for (let i = c; i > 0; i -= i & -i) s += bit[i]; return s; };

  const snap = (over: Partial<CDQState>): CDQState => ({
    ans: [...ans], bit: [...bit], rangeL: -1, rangeR: -1, mid: -1,
    leftIds: [], rightIds: [], addedIds: [], curRightId: -1,
    phase: 'init', message: '',
    ...over,
  });

  steps.push({
    state: snap({ message: '三维偏序：对每个点统计 a、b、c 均不超过它的点的个数。已按第一维 a 排序，CDQ 分治处理 b、c' }),
    description: '初始化',
    codeLine: 0,
  });

  const cdq = (l: number, r: number) => {
    if (l >= r) return;
    const mid = (l + r) >> 1;
    steps.push({
      state: snap({ rangeL: l, rangeR: r, mid, phase: 'divide', message: `cdq(${l}, ${r})：mid=${mid}，递归分治 [${l}, ${mid}] 与 [${mid + 1}, ${r}]（左半 a 均 ≤ 右半）` }),
      description: `分治 [${l},${r}]`,
      codeLine: 4,
    });
    cdq(l, mid);
    cdq(mid + 1, r);

    const L = pts.slice(l, mid + 1).sort((x, y) => x.b - y.b);
    const R = pts.slice(mid + 1, r + 1).sort((x, y) => x.b - y.b);
    steps.push({
      state: snap({ rangeL: l, rangeR: r, mid, leftIds: L.map((p) => p.id), rightIds: R.map((p) => p.id), phase: 'merge', message: `归并 [${l}, ${r}]：左半按 b 排序 [${L.map((p) => `p${p.id}(b${p.b})`).join(' ')}]，右半 [${R.map((p) => `p${p.id}(b${p.b})`).join(' ')}]` }),
      description: `归并 [${l},${r}]`,
      codeLine: 6,
    });

    let i = 0;
    const addedIds: number[] = [];
    for (const p of R) {
      while (i < L.length && L[i].b <= p.b) {
        bitAdd(L[i].c, 1);
        addedIds.push(L[i].id);
        i++;
      }
      const cnt = bitQuery(p.c);
      ans[p.id] += cnt;
      steps.push({
        state: snap({ rangeL: l, rangeR: r, mid, leftIds: L.map((pp) => pp.id), rightIds: R.map((pp) => pp.id), addedIds: [...addedIds], curRightId: p.id, phase: 'merge', message: `处理 p${p.id}(b=${p.b}, c=${p.c})：把 b≤${p.b} 的左半点加入 BIT，查询 c≤${p.c} 得 ${cnt}，ans[${p.id}] += ${cnt}` }),
        description: `p${p.id} +${cnt}`,
        codeLine: 10,
      });
    }
    for (let j = 0; j < i; j++) bitAdd(L[j].c, -1);
  };

  cdq(0, np - 1);

  steps.push({
    state: snap({ phase: 'done', message: `✅ 完成：ans = [${ans.join(', ')}]。CDQ 分治把三维偏序降为 O(n log² n)` }),
    description: '完成',
    codeLine: 10,
  });

  return steps;
}

export function CdqDivideConquerPanel() {
  const steps = useMemo(() => buildSteps(), []);

  const initial: CDQState = {
    ans: new Array(NP).fill(0), bit: new Array(MAXC + 1).fill(0),
    rangeL: -1, rangeR: -1, mid: -1, leftIds: [], rightIds: [], addedIds: [],
    curRightId: -1, phase: 'init', message: '',
  };

  return (
    <Stepper<CDQState>
      steps={steps}
      initialState={initial}
      codeLines={cdqCode}
      codeTitle="CDQ 分治·三维偏序 CDQ Divide & Conquer"
      render={(state) => {
        const cardStyle = (id: number) => {
          const isCur = state.curRightId === id;
          const isAdded = state.addedIds.includes(id);
          const isLeft = state.leftIds.includes(id);
          const isRight = state.rightIds.includes(id);
          if (isCur) return 'border-yellow-400 bg-yellow-500/20 scale-105';
          if (isAdded) return 'border-green-500 bg-green-500/15';
          if (isLeft) return 'border-blue-500 bg-blue-500/10';
          if (isRight) return 'border-purple-500 bg-purple-500/10';
          return 'border-edge-2 bg-surface-2';
        };
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">
              蓝=左半（按 b 排序），紫=右半，绿=已加入 BIT 的左半点，黄=当前处理的右半点。卡片显示 (a, b, c) 与 ans
            </div>

            {/* 点集（按 a 排序） */}
            <div className="flex gap-2 flex-wrap justify-center">
              {PTS.map((p) => (
                <div key={p.id} className={clsx('w-20 rounded-lg border-2 p-2 text-center font-mono text-xs transition-all', cardStyle(p.id))}>
                  <div className="text-gray-400 font-bold">p{p.id}</div>
                  <div className="text-gray-300">a={p.a}</div>
                  <div className="text-blue-300">b={p.b}</div>
                  <div className="text-orange-300">c={p.c}</div>
                  <div className={clsx('mt-1 rounded px-1', state.ans[p.id] > 0 ? 'bg-green-900/40 text-green-300' : 'text-gray-500')}>ans={state.ans[p.id]}</div>
                </div>
              ))}
            </div>

            {/* BIT */}
            <div className="space-y-1">
              <div className="text-xs text-gray-500">树状数组 BIT（按第三维 c 计数，c=1..6）:</div>
              <div className="flex gap-1 justify-center">
                {Array.from({ length: MAXC }, (_, i) => i + 1).map((c) => (
                  <div key={c} className={clsx('w-10 h-10 flex flex-col items-center justify-center rounded text-xs font-mono border', state.bit[c] > 0 ? 'bg-orange-500/20 border-orange-400 text-orange-200' : 'bg-surface-2 border-edge-2 text-ink-3')}>
                    <span className="font-bold">{state.bit[c]}</span>
                    <span className="text-[8px] text-gray-600">c={c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 当前分治范围 */}
            {state.rangeL >= 0 && (
              <div className="flex items-center gap-2 justify-center text-xs font-mono">
                <span className="px-2 py-1 rounded bg-surface-2 border border-edge-2 text-ink-3">
                  cdq([{state.rangeL}, {state.rangeR}]) mid={state.mid}
                </span>
                <span className="text-blue-400">左半 [{state.rangeL}, {state.mid}]</span>
                <span className="text-purple-400">右半 [{state.mid + 1}, {state.rangeR}]</span>
              </div>
            )}

            {/* ans 数组 */}
            <div className="flex items-center gap-1 justify-center">
              <span className="text-xs text-gray-500 mr-2">ans[]:</span>
              {state.ans.map((v, i) => (
                <div key={i} className={clsx('w-9 h-9 flex items-center justify-center rounded text-xs font-mono border', v > 0 ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-surface-2 border-edge-2 text-ink-3')}>{v}</div>
              ))}
            </div>

            {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
          </div>
        );
      }}
    />
  );
}
