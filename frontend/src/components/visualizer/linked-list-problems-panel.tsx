'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const linkedListCode = [
  'function hasCycle(head) {',
  '  let slow = head, fast = head;',
  '  while (fast && fast.next) {',
  '    slow = slow.next;',
  '    fast = fast.next.next;',
  '    if (slow === fast) return true;',
  '  }',
  '  return false;',
  '}',
  'function detectCycle(head) {',
  '  let slow = head, fast = head;',
  '  while (fast && fast.next) {',
  '    slow = slow.next; fast = fast.next.next;',
  '    if (slow === fast) {',
  '      let p = head;',
  '      while (p !== slow) { p = p.next; slow = slow.next; }',
  '      return p;',
  '    }',
  '  }',
  '  return null;',
  '}',
  'function mergeTwoLists(a, b) {',
  '  const dummy = new ListNode(0);',
  '  let cur = dummy;',
  '  while (a && b) {',
  '    if (a.val <= b.val) { cur.next = a; a = a.next; }',
  '    else { cur.next = b; b = b.next; }',
  '    cur = cur.next;',
  '  }',
  '  cur.next = a || b;',
  '  return dummy.next;',
  '}',
  'function removeNthFromEnd(head, n) {',
  '  const dummy = new ListNode(0, head);',
  '  let fast = dummy, slow = dummy;',
  '  for (let i = 0; i < n; i++) fast = fast.next;',
  '  while (fast.next) { fast = fast.next; slow = slow.next; }',
  '  slow.next = slow.next.next;',
  '  return dummy.next;',
  '}',
];

type LLPhase = 'cycle' | 'entry' | 'merge' | 'remove';

interface LLState {
  phase: LLPhase;
  nodes: number[];
  cycleAt: number;
  slow: number;
  fast: number;
  met: boolean;
  p: number;
  entry: number;
  listA: number[];
  listB: number[];
  ptrA: number;
  ptrB: number;
  merged: number[];
  mergedFrom: ('A' | 'B')[];
  rNodes: number[];
  k: number;
  rFast: number;
  rSlow: number;
  removed: number;
  message: string;
}

const CYCLE_NODES = [3, 2, 0, -4];
const CYCLE_AT = 1;
const REMOVE_NODES = [1, 2, 3, 4, 5];

function buildSteps(listA: number[], listB: number[], k: number): VizStep<LLState>[] {
  const steps: VizStep<LLState>[] = [];
  const nodes = CYCLE_NODES;
  const cycleAt = CYCLE_AT;
  const rNodes = REMOVE_NODES;
  const base: LLState = {
    phase: 'cycle', nodes, cycleAt, slow: -1, fast: -1, met: false, p: -1, entry: -1,
    listA, listB, ptrA: 0, ptrB: 0, merged: [], mergedFrom: [],
    rNodes, k, rFast: -1, rSlow: -1, removed: -1, message: '',
  };
  const nxt = (i: number) => (i < nodes.length - 1 ? i + 1 : cycleAt);

  // ---- 1. Floyd cycle detection ----
  let slow = 0;
  let fast = 0;
  steps.push({
    state: { ...base, slow, fast, message: `链表 [${nodes.join(' → ')}]，尾节点连回节点 ${cycleAt} 成环。slow、fast 同从头部出发` },
    description: '快慢指针初始化',
    codeLine: 1,
  });
  for (let t = 0; t < nodes.length + 2; t++) {
    slow = nxt(slow);
    fast = nxt(nxt(fast));
    const met = slow === fast;
    steps.push({
      state: { ...base, slow, fast, met, message: met ? `slow 走一步到节点 ${slow}，fast 走两步到节点 ${fast} —— 快指针追上慢指针，链表中存在环！return true` : `slow 走一步到节点 ${slow}，fast 走两步到节点 ${fast}，尚未相遇` },
      description: met ? '快慢指针相遇' : `slow=${slow} fast=${fast}`,
      codeLine: 5,
    });
    if (met) break;
  }

  // ---- 2. find cycle entry ----
  let p = 0;
  steps.push({
    state: { ...base, phase: 'entry', slow, fast, met: true, p: 0, message: `相遇后：p 回到头部（节点 0），slow 留在相遇点 ${slow}，两者每次各走一步，再次相遇处即环入口` },
    description: 'p 指向头节点',
    codeLine: 14,
  });
  while (p !== slow) {
    p = nxt(p);
    slow = nxt(slow);
    steps.push({
      state: { ...base, phase: 'entry', slow, fast, met: true, p, message: p === slow ? `p 与 slow 在节点 ${p} 相遇 —— 该点就是环入口！` : `p → 节点 ${p}，slow → 节点 ${slow}，继续同步前进` },
      description: `p=${p} slow=${slow}`,
      codeLine: 15,
    });
  }
  steps.push({
    state: { ...base, phase: 'entry', slow, fast, met: true, p, entry: p, message: `return p：环入口为节点 ${p}（值 ${nodes[p]}）。原理：头到入口距离 = 相遇点绕环到入口距离` },
    description: `环入口 = 节点${p}`,
    codeLine: 16,
  });

  // ---- 3. merge two sorted lists ----
  let ptrA = 0;
  let ptrB = 0;
  const merged: number[] = [];
  const mergedFrom: ('A' | 'B')[] = [];
  steps.push({
    state: { ...base, phase: 'merge', message: `合并有序链表 A=[${listA.join(', ')}] 与 B=[${listB.join(', ')}]：dummy 哑节点开头，cur 指向结果尾部` },
    description: '初始化 dummy',
    codeLine: 23,
  });
  while (ptrA < listA.length && ptrB < listB.length) {
    if (listA[ptrA] <= listB[ptrB]) {
      merged.push(listA[ptrA]);
      mergedFrom.push('A');
      ptrA++;
      steps.push({
        state: { ...base, phase: 'merge', ptrA, ptrB, merged: [...merged], mergedFrom: [...mergedFrom], message: `A 头 ${merged[merged.length - 1]} ≤ B 头 ${listB[ptrB]}，接上 A 的节点，a 右移` },
        description: `取 A(${merged[merged.length - 1]})`,
        codeLine: 25,
      });
    } else {
      merged.push(listB[ptrB]);
      mergedFrom.push('B');
      ptrB++;
      steps.push({
        state: { ...base, phase: 'merge', ptrA, ptrB, merged: [...merged], mergedFrom: [...mergedFrom], message: `B 头 ${merged[merged.length - 1]} < A 头 ${listA[ptrA]}，接上 B 的节点，b 右移` },
        description: `取 B(${merged[merged.length - 1]})`,
        codeLine: 26,
      });
    }
  }
  while (ptrA < listA.length) { merged.push(listA[ptrA]); mergedFrom.push('A'); ptrA++; }
  while (ptrB < listB.length) { merged.push(listB[ptrB]); mergedFrom.push('B'); ptrB++; }
  steps.push({
    state: { ...base, phase: 'merge', ptrA, ptrB, merged: [...merged], mergedFrom: [...mergedFrom], message: `一方已耗尽，cur.next 直接接上另一方剩余节点：[${merged.join(' → ')}]` },
    description: '拼接剩余',
    codeLine: 29,
  });
  steps.push({
    state: { ...base, phase: 'merge', ptrA, ptrB, merged: [...merged], mergedFrom: [...mergedFrom], message: `合并完成，返回 dummy.next。共 ${merged.length} 个节点，时间 O(m+n)` },
    description: '合并完成',
    codeLine: 30,
  });

  // ---- 4. remove nth from end ----
  let rFast = -1;
  let rSlow = -1;
  steps.push({
    state: { ...base, phase: 'remove', message: `删除倒数第 ${k} 个节点：fast、slow 从 dummy 出发，fast 先走 ${k} 步，之后同步前进` },
    description: 'fast、slow=dummy',
    codeLine: 34,
  });
  for (let i = 0; i < k; i++) {
    rFast++;
    steps.push({
      state: { ...base, phase: 'remove', rFast, rSlow, message: `fast 先走第 ${i + 1} 步，到达节点 ${rFast}（值 ${rNodes[rFast]}）` },
      description: `fast→${rFast}`,
      codeLine: 35,
    });
  }
  while (rFast < rNodes.length - 1) {
    rFast++;
    rSlow++;
    steps.push({
      state: { ...base, phase: 'remove', rFast, rSlow, message: `fast 未到尾部，同步前进：fast → 节点 ${rFast}，slow → ${rSlow >= 0 ? `节点 ${rSlow}` : 'dummy'}` },
      description: `fast=${rFast} slow=${rSlow}`,
      codeLine: 36,
    });
  }
  const rm = rSlow + 1;
  const result = rNodes.filter((_, i) => i !== rm);
  steps.push({
    state: { ...base, phase: 'remove', rFast, rSlow, removed: rm, message: `slow 停在节点 ${rSlow}（值 ${rNodes[rSlow]}），它的下一个正是倒数第 ${k} 个 —— 节点 ${rm}（值 ${rNodes[rm]}），执行 slow.next = slow.next.next 跳过它` },
    description: `删除节点${rm}`,
    codeLine: 37,
  });
  steps.push({
    state: { ...base, phase: 'remove', rFast, rSlow, removed: rm, message: `删除完成：[${result.join(' → ')}]。fast 先行 k 步使 slow 恰好停在待删节点前一个` },
    description: '删除完成',
    codeLine: 38,
  });

  return steps;
}

const PHASE_LABEL: Record<LLPhase, string> = {
  cycle: '① 判断有环',
  entry: '② 环入口',
  merge: '③ 合并链表',
  remove: '④ 删倒数第k个',
};

// ---- cycle list SVG ----
function CycleListSVG({ state }: { state: LLState }) {
  const nodeW = 56;
  const nodeH = 40;
  const gap = 26;
  const x0 = 14;
  const y0 = 46;
  const n = state.nodes.length;
  const width = x0 * 2 + n * nodeW + (n - 1) * gap;
  const cx = (i: number) => x0 + i * (nodeW + gap) + nodeW / 2;

  const labelsAt = (i: number) => {
    const ls: { t: string; c: string }[] = [];
    if (state.slow === i) ls.push({ t: 'slow', c: '#4ade80' });
    if (state.phase === 'cycle' && state.fast === i) ls.push({ t: 'fast', c: '#f87171' });
    if (state.phase === 'entry' && state.p === i) ls.push({ t: 'p', c: '#c084fc' });
    return ls;
  };

  return (
    <svg viewBox={`0 0 ${width} 138`} className="w-full max-w-[440px] bg-bg rounded-lg border border-edge">
      <defs>
        <marker id="ll-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#666" />
        </marker>
        <marker id="ll-arrow-cycle" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
        </marker>
      </defs>

      {/* next arrows */}
      {state.nodes.map((_, i) =>
        i < n - 1 ? (
          <line
            key={`a${i}`}
            x1={x0 + i * (nodeW + gap) + nodeW + 1}
            y1={y0 + nodeH / 2}
            x2={x0 + (i + 1) * (nodeW + gap) - 5}
            y2={y0 + nodeH / 2}
            stroke="#666"
            strokeWidth={1.5}
            markerEnd="url(#ll-arrow)"
          />
        ) : null,
      )}

      {/* cycle curve: tail -> cycleAt */}
      <path
        d={`M ${cx(n - 1)} ${y0 + nodeH} C ${cx(n - 1)} ${y0 + nodeH + 46}, ${cx(state.cycleAt)} ${y0 + nodeH + 46}, ${cx(state.cycleAt)} ${y0 + nodeH + 6}`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={1.5}
        strokeDasharray="5 3"
        markerEnd="url(#ll-arrow-cycle)"
      />
      <text x={(cx(n - 1) + cx(state.cycleAt)) / 2} y={y0 + nodeH + 42} textAnchor="middle" fontSize={9} fill="#f59e0b">
        环
      </text>

      {/* nodes */}
      {state.nodes.map((v, i) => {
        const isMeet = state.met && state.slow === i && state.phase === 'cycle';
        const isEntry = state.entry === i;
        const ls = labelsAt(i);
        return (
          <g key={`n${i}`}>
            <rect
              x={x0 + i * (nodeW + gap)}
              y={y0}
              width={nodeW}
              height={nodeH}
              rx={6}
              fill={isEntry ? '#14532d' : isMeet ? '#422006' : '#1a1a1a'}
              stroke={isEntry ? '#4ade80' : isMeet ? '#facc15' : '#444'}
              strokeWidth={2}
            />
            <text x={cx(i)} y={y0 + nodeH / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill={isEntry ? '#bbf7d0' : '#e5e5e5'}>
              {v}
            </text>
            {ls.map((l, li) => (
              <text key={l.t} x={cx(i)} y={14 + li * 13} textAnchor="middle" fontSize={10} fontWeight={700} fill={l.c}>
                {l.t}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function LinkedListProblemsPanel() {
  const [listA, setListA] = useState<number[]>([1, 3, 5]);
  const [listB, setListB] = useState<number[]>([2, 4, 6]);
  const [k, setK] = useState(2);

  const steps = useMemo(() => buildSteps(listA, listB, k), [listA, listB, k]);
  const initial: LLState = {
    phase: 'cycle', nodes: CYCLE_NODES, cycleAt: CYCLE_AT, slow: -1, fast: -1, met: false, p: -1, entry: -1,
    listA, listB, ptrA: 0, ptrB: 0, merged: [], mergedFrom: [],
    rNodes: REMOVE_NODES, k, rFast: -1, rSlow: -1, removed: -1, message: '',
  };

  return (
    <Stepper<LLState>
      steps={steps}
      initialState={initial}
      codeLines={linkedListCode}
      codeTitle="链表经典问题 Linked List Problems"
      headerActions={
        <>
          <span className="text-sm text-gray-400">A:</span>
          <input
            type="text"
            value={listA.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((v) => Number(v.trim())).filter((v) => Number.isFinite(v));
              if (parsed.length >= 1) setListA(parsed.slice(0, 6).sort((a, b) => a - b));
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-24"
          />
          <span className="text-sm text-gray-400">B:</span>
          <input
            type="text"
            value={listB.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((v) => Number(v.trim())).filter((v) => Number.isFinite(v));
              if (parsed.length >= 1) setListB(parsed.slice(0, 6).sort((a, b) => a - b));
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-24"
          />
          <span className="text-sm text-gray-400">k:</span>
          <input
            type="number"
            min={1}
            max={REMOVE_NODES.length}
            value={k}
            onChange={(e) => setK(Math.min(REMOVE_NODES.length, Math.max(1, Number(e.target.value) || 1)))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {(Object.keys(PHASE_LABEL) as LLPhase[]).map((ph) => (
              <span key={ph} className={clsx('px-2 py-0.5 rounded border', state.phase === ph ? 'border-blue-500 text-blue-300 bg-blue-500/10' : 'border-edge')}>
                {PHASE_LABEL[ph]}
              </span>
            ))}
          </div>

          {(state.phase === 'cycle' || state.phase === 'entry') && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                绿色=slow，红色=fast，紫色=p；橙色虚线=尾节点指向节点 {state.cycleAt} 的环边
              </div>
              <CycleListSVG state={state} />
              {state.met && state.phase === 'cycle' && (
                <div className="text-center p-2 bg-yellow-900/20 border border-yellow-800 rounded-lg text-yellow-300 text-sm font-mono">
                  slow === fast → 链表有环，return true
                </div>
              )}
              {state.entry >= 0 && (
                <div className="text-center p-2 bg-green-900/20 border border-green-800 rounded-lg text-green-300 text-sm font-mono">
                  环入口 = 节点 {state.entry}（值 {state.nodes[state.entry]}）
                </div>
              )}
            </div>
          )}

          {state.phase === 'merge' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500">蓝=A 链表，紫=B 链表；黄色=当前比较的头节点，灰色=已接走</div>
              {([['a →', state.listA, state.ptrA, 'A'], ['b →', state.listB, state.ptrB, 'B']] as const).map(([label, list, ptr, src]) => (
                <div key={src} className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-mono w-8">{label}</span>
                  {list.map((v, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'w-9 h-9 flex items-center justify-center rounded text-sm font-mono border transition-all',
                        i === ptr
                          ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                          : i < ptr
                            ? 'bg-bg border-edge text-ink-3'
                            : src === 'A'
                              ? 'bg-blue-500/10 border-blue-800 text-blue-300'
                              : 'bg-purple-500/10 border-purple-800 text-purple-300',
                      )}
                    >
                      {v}
                    </div>
                  ))}
                  {ptr >= list.length && <span className="text-[10px] text-gray-600 font-mono">已耗尽</span>}
                </div>
              ))}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-500 font-mono w-8">结果</span>
                {state.merged.length === 0 && <span className="text-gray-700 text-sm font-mono">dummy → ∅</span>}
                {state.merged.map((v, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-9 h-9 flex items-center justify-center rounded text-sm font-mono border transition-all',
                      i === state.merged.length - 1 ? 'scale-105' : '',
                      state.mergedFrom[i] === 'A'
                        ? 'bg-blue-500/15 border-blue-600 text-blue-200'
                        : 'bg-purple-500/15 border-purple-600 text-purple-200',
                    )}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.phase === 'remove' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500">
                红色=fast，绿色=slow；fast 先走 k={state.k} 步后两者同步，slow 恰好停在待删节点前
              </div>
              <div className="flex items-start gap-1 flex-wrap">
                {Array.from({ length: state.rNodes.length + 1 }, (_, idx) => idx - 1).map((i) => {
                  const isDummy = i === -1;
                  const isRemoved = state.removed === i;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="h-4 text-[10px] font-mono text-center whitespace-nowrap">
                        {state.rFast === i && state.rSlow === i ? (
                          <span><span className="text-red-400 font-bold">fast</span><span className="text-green-400 font-bold">·slow</span></span>
                        ) : (
                          <>
                            {state.rFast === i && <span className="text-red-400 font-bold">fast</span>}
                            {state.rSlow === i && <span className="text-green-400 font-bold">slow</span>}
                          </>
                        )}
                      </div>
                      <div
                        className={clsx(
                          'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
                          isRemoved
                            ? 'bg-red-500/20 border-red-500 text-red-300 line-through opacity-60'
                            : isDummy
                              ? 'bg-bg border-dashed border-edge-2 text-ink-3'
                              : 'bg-surface-2 border-edge-2 text-ink-2',
                        )}
                      >
                        {isDummy ? 'D' : state.rNodes[i]}
                      </div>
                      <div className="text-[9px] text-gray-600 text-center">{isDummy ? 'dummy' : i}</div>
                    </div>
                  );
                })}
              </div>
              {state.removed >= 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-mono mr-1">结果:</span>
                  {state.rNodes.filter((_, i) => i !== state.removed).map((v, i) => (
                    <div key={i} className="w-9 h-9 flex items-center justify-center rounded text-sm font-mono border border-green-700 bg-green-500/15 text-green-300">
                      {v}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
