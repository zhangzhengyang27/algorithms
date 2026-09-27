'use client';

import { useMemo } from 'react';
import { Stepper, type VizStep } from './stepper';

const lazySegCode = [
  'function apply(node, l, r, val) {',
  '  tree[node] += val * (r - l + 1); lazy[node] += val;',
  '}',
  'function pushDown(node, l, r) {',
  '  if (lazy[node] === 0) return;',
  '  const m = (l + r) >> 1;',
  '  apply(node*2+1, l, m, lazy[node]);',
  '  apply(node*2+2, m+1, r, lazy[node]);',
  '  lazy[node] = 0;',
  '}',
  'function update(node, l, r, qL, qR, val) {',
  '  if (qL <= l && r <= qR) { apply(node, l, r, val); return; }',
  '  pushDown(node, l, r);',
  '  const m = (l + r) >> 1;',
  '  if (qL <= m) update(node*2+1, l, m, qL, qR, val);',
  '  if (qR > m) update(node*2+2, m+1, r, qL, qR, val);',
  '  tree[node] = tree[node*2+1] + tree[node*2+2];',
  '}',
  'function query(node, l, r, qL, qR) {',
  '  if (qL <= l && r <= qR) return tree[node];',
  '  pushDown(node, l, r);',
  '  const m = (l + r) >> 1; let res = 0;',
  '  if (qL <= m) res += query(node*2+1, l, m, qL, qR);',
  '  if (qR > m) res += query(node*2+2, m+1, r, qL, qR);',
  '  return res;',
  '}',
];

const NUMS = [2, 5, 1, 4, 3, 6];
const N = 6;

interface SegNodeInfo { idx: number; l: number; r: number; depth: number; }

function collectSegNodes(l: number, r: number, idx: number, depth: number, out: SegNodeInfo[]) {
  out.push({ idx, l, r, depth });
  if (l === r) return;
  const m = (l + r) >> 1;
  collectSegNodes(l, m, 2 * idx + 1, depth + 1, out);
  collectSegNodes(m + 1, r, 2 * idx + 2, depth + 1, out);
}

const SEG_NODES: SegNodeInfo[] = [];
collectSegNodes(0, N - 1, 0, 0, SEG_NODES);

interface LazyState {
  tree: number[];
  lazy: number[];
  active: number;
  tagged: number[]; // 本次操作被打上懒标记的节点
  pushed: number[]; // 本次操作中刚下推过标记的节点
  opRange: [number, number] | null;
  opVal: number | null;
  opType: 'update' | 'query' | null;
  result: number | null;
  phase: 'build' | 'update' | 'query' | 'done';
  message: string;
}

type LazyOp = { type: 'update'; l: number; r: number; val: number } | { type: 'query'; l: number; r: number };
const DEFAULT_OPS: LazyOp[] = [
  { type: 'update', l: 1, r: 4, val: 2 },
  { type: 'query', l: 0, r: 3 },
  { type: 'update', l: 0, r: 2, val: 1 },
  { type: 'query', l: 2, r: 5 },
];

export function buildSteps(nums: number[] = NUMS, opsInput: LazyOp[] = DEFAULT_OPS): VizStep<LazyState>[] {
  const n = nums.length;
  const steps: VizStep<LazyState>[] = [];
  const tree = new Array(4 * n).fill(0);
  const lazy = new Array(4 * n).fill(0);

  const build = (node: number, l: number, r: number) => {
    if (l === r) { tree[node] = nums[l]; return; }
    const m = (l + r) >> 1;
    build(2 * node + 1, l, m);
    build(2 * node + 2, m + 1, r);
    tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
  };
  build(0, 0, n - 1);

  const snap = (over: Partial<LazyState>): LazyState => ({
    tree: [...tree], lazy: [...lazy], active: -1, tagged: [], pushed: [],
    opRange: null, opVal: null, opType: null, result: null, phase: 'build', message: '',
    ...over,
  });

  steps.push({
    state: snap({ message: `原数组 [${nums.join(', ')}] 构建线段树（区间和）。红色角标 = 懒标记 lazy` }),
    description: '建树',
    codeLine: 16,
  });

  const apply = (node: number, l: number, r: number, val: number) => {
    tree[node] += val * (r - l + 1);
    lazy[node] += val;
  };

  const pushDown = (node: number, l: number, r: number) => {
    if (lazy[node] === 0) return;
    const m = (l + r) >> 1;
    apply(2 * node + 1, l, m, lazy[node]);
    apply(2 * node + 2, m + 1, r, lazy[node]);
    lazy[node] = 0;
  };

  const update = (node: number, l: number, r: number, qL: number, qR: number, val: number, tagged: number[]) => {
    if (qL <= l && r <= qR) {
      apply(node, l, r, val);
      tagged.push(node);
      steps.push({
        state: snap({ active: node, tagged: [...tagged], opRange: [qL, qR], opVal: val, opType: 'update', phase: 'update', message: `[${l},${r}] 完全包含于 [${qL},${qR}]：打懒标记 lazy+=${val}，sum+=${val}×${r - l + 1}=${val * (r - l + 1)}，不再下推（延迟更新）` }),
        description: `节点${node} 打标记`,
        codeLine: 11,
      });
      return;
    }
    if (lazy[node] !== 0) {
      pushDown(node, l, r);
      steps.push({
        state: snap({ active: node, pushed: [node], opRange: [qL, qR], opVal: val, opType: 'update', phase: 'update', message: `进入 [${l},${r}] 前下推懒标记到左右子节点，保证子节点数据正确` }),
        description: `节点${node} 下推`,
        codeLine: 12,
      });
    }
    const m = (l + r) >> 1;
    if (qL <= m) update(2 * node + 1, l, m, qL, qR, val, tagged);
    if (qR > m) update(2 * node + 2, m + 1, r, qL, qR, val, tagged);
    tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
  };

  const query = (node: number, l: number, r: number, qL: number, qR: number, pushed: number[]): number => {
    if (qL <= l && r <= qR) {
      steps.push({
        state: snap({ active: node, pushed: [...pushed], opRange: [qL, qR], opType: 'query', phase: 'query', message: `[${l},${r}] 完全包含于查询区间，直接返回 tree[${node}]=${tree[node]}` }),
        description: `节点${node} → ${tree[node]}`,
        codeLine: 19,
      });
      return tree[node];
    }
    if (lazy[node] !== 0) {
      const pending = lazy[node];
      pushDown(node, l, r);
      pushed.push(node);
      steps.push({
        state: snap({ active: node, pushed: [...pushed], opRange: [qL, qR], opType: 'query', phase: 'query', message: `查询经过 [${l},${r}]：把之前 update 留下的懒标记 lazy=${pending} 按需下推给子节点，然后清空` }),
        description: `节点${node} 下推`,
        codeLine: 20,
      });
    }
    const m = (l + r) >> 1;
    let res = 0;
    if (qL <= m) res += query(2 * node + 1, l, m, qL, qR, pushed);
    if (qR > m) res += query(2 * node + 2, m + 1, r, qL, qR, pushed);
    return res;
  };

  // 操作序列
  const ops = opsInput;

  for (const op of ops) {
    if (op.type === 'update') {
      const tagged: number[] = [];
      steps.push({
        state: snap({ opRange: [op.l, op.r], opVal: op.val, opType: 'update', phase: 'update', message: `区间修改：[${op.l},${op.r}] 每个元素 +${op.val}` }),
        description: `修改 [${op.l},${op.r}]+${op.val}`,
        codeLine: 10,
      });
      update(0, 0, n - 1, op.l, op.r, op.val, tagged);
      steps.push({
        state: snap({ opRange: [op.l, op.r], opVal: op.val, opType: 'update', phase: 'update', tagged: [...tagged], message: `修改完成：共 ${tagged.length} 个节点被打上懒标记，总和 tree[0]=${tree[0]}` }),
        description: '修改完成',
        codeLine: 16,
      });
    } else {
      const pushed: number[] = [];
      steps.push({
        state: snap({ opRange: [op.l, op.r], opType: 'query', phase: 'query', message: `区间查询：sum[${op.l}..${op.r}]` }),
        description: `查询 [${op.l},${op.r}]`,
        codeLine: 18,
      });
      const res = query(0, 0, n - 1, op.l, op.r, pushed);
      steps.push({
        state: snap({ opRange: [op.l, op.r], opType: 'query', phase: 'query', result: res, message: `✅ sum[${op.l}..${op.r}] = ${res}` }),
        description: `结果 = ${res}`,
        codeLine: 24,
      });
    }
  }

  steps.push({
    state: snap({ phase: 'done', message: '懒标记线段树：修改 O(log n) 只打标记，查询时按需下推，避免整棵树更新' }),
    description: '完成',
    codeLine: 8,
  });

  return steps;
}

const xPos = (l: number, r: number) => ((l + r) / 2) * 82 + 55;
const yPos = (depth: number) => depth * 86 + 44;

export function SegmentTreeAdvancedPanel() {
  const steps = useMemo(() => buildSteps(), []);

  const initial: LazyState = {
    tree: new Array(4 * N).fill(0), lazy: new Array(4 * N).fill(0), active: -1,
    tagged: [], pushed: [], opRange: null, opVal: null, opType: null, result: null,
    phase: 'build', message: '',
  };

  const width = (N - 1) * 82 + 150;
  const height = 3 * 86 + 100;

  const inOpRange = (info: SegNodeInfo, s: LazyState) =>
    s.opRange !== null && info.l >= s.opRange[0] && info.r <= s.opRange[1];

  return (
    <Stepper<LazyState>
      steps={steps}
      initialState={initial}
      codeLines={lazySegCode}
      codeTitle="懒标记线段树 Lazy Propagation"
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前节点，橙色=本次打懒标记，红色角标=懒标记 lazy，蓝色=查询命中节点。节点内为区间和 sum
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl mx-auto">
            {/* edges */}
            {SEG_NODES.filter((n) => n.l !== n.r).map((n) => {
              const lc = SEG_NODES.find((c) => c.idx === 2 * n.idx + 1)!;
              const rc = SEG_NODES.find((c) => c.idx === 2 * n.idx + 2)!;
              return (
                <g key={`e${n.idx}`}>
                  <line x1={xPos(n.l, n.r)} y1={yPos(n.depth) + 24} x2={xPos(lc.l, lc.r)} y2={yPos(lc.depth) - 24} style={{ stroke: 'var(--edge-2)' }} strokeWidth={1.2} />
                  <line x1={xPos(n.l, n.r)} y1={yPos(n.depth) + 24} x2={xPos(rc.l, rc.r)} y2={yPos(rc.depth) - 24} style={{ stroke: 'var(--edge-2)' }} strokeWidth={1.2} />
                </g>
              );
            })}
            {/* nodes */}
            {SEG_NODES.map((n) => {
              const x = xPos(n.l, n.r), y = yPos(n.depth);
              const isActive = state.active === n.idx;
              const isTagged = state.tagged.includes(n.idx);
              const isPushed = state.pushed.includes(n.idx);
              const isQueryHit = state.opType === 'query' && isActive;
              const hasLazy = state.lazy[n.idx] !== 0;
              const stroke = isPushed ? '#ef4444' : isTagged ? '#f97316' : isActive ? (state.opType === 'query' ? '#3b82f6' : '#eab308') : inOpRange(n, state) ? '#475569' : '#333';
              const fill = isPushed ? '#ef444426' : isTagged ? '#f9731626' : isActive ? (state.opType === 'query' ? '#3b82f626' : '#eab30826') : '#161616';
              return (
                <g key={`n${n.idx}`}>
                  <rect x={x - 34} y={y - 24} width={68} height={48} rx={8} fill={fill} stroke={stroke} strokeWidth={isActive || isTagged || isPushed ? 2.5 : 1.5} />
                  <text x={x} y={y - 2} textAnchor="middle" fontSize="13" fontWeight="bold" style={{ fill: isQueryHit ? 'var(--brand)' : '#e5e7eb' }}>{state.tree[n.idx]}</text>
                  <text x={x} y={y + 14} textAnchor="middle" fontSize="9" style={{ fill: 'var(--ink-3)' }}>[{n.l},{n.r}]</text>
                  {hasLazy && (
                    <g>
                      <rect x={x + 18} y={y - 32} width={26} height={16} rx={4} fill="#7f1d1d" stroke="#ef4444" strokeWidth={1} />
                      <text x={x + 31} y={y - 20} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fca5a5">+{state.lazy[n.idx]}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {state.result !== null && state.opType === 'query' && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                sum[{state.opRange?.[0]}..{state.opRange?.[1]}] = {state.result}
              </span>
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
