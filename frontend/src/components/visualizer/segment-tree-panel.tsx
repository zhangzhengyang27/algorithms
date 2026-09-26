'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const segmentTreeCode = [
  'function build(node, l, r) {',
  '  if (l === r) { tree[node] = nums[l]; return; }',
  '  const mid = (l + r) >> 1;',
  '  build(node*2+1, l, mid);',
  '  build(node*2+2, mid+1, r);',
  '  tree[node] = tree[node*2+1] + tree[node*2+2];',
  '}',
  'function query(node, l, r, qL, qR) {',
  '  if (qL <= l && r <= qR) return tree[node];',
  '  const mid = (l + r) >> 1; let sum = 0;',
  '  if (qL <= mid) sum += query(node*2+1, l, mid, qL, qR);',
  '  if (qR > mid) sum += query(node*2+2, mid+1, r, qL, qR);',
  '  return sum;',
  '}',
];

interface SegState {
  tree: number[];
  n: number;
  nums: number[];
  activeNode: number;
  range: [number, number];
  queryRange: [number, number] | null;
  queryResult: number;
  phase: 'build' | 'query';
  message: string;
}

function buildSteps(nums: number[], qL: number, qR: number): VizStep<SegState>[] {
  const steps: VizStep<SegState>[] = [];
  const n = nums.length;
  const tree = new Array(4 * n).fill(0);

  const snap = (active: number, range: [number, number], qr: [number, number] | null, res: number, phase: 'build' | 'query', msg: string): SegState => ({
    tree: [...tree], n, nums, activeNode: active, range, queryRange: qr, queryResult: res, phase, message: msg,
  });

  steps.push({ state: snap(-1, [0, n - 1], null, 0, 'build', `原数组 [${nums.join(', ')}]，构建线段树（区间求和）`), description: '初始化', codeLine: 1 });

  function build(node: number, l: number, r: number) {
    if (l === r) {
      tree[node] = nums[l];
      steps.push({ state: snap(node, [l, r], null, 0, 'build', `叶子节点 [${l},${l}]：tree[${node}] = nums[${l}] = ${nums[l]}`), description: `叶子 [${l}]`, codeLine: 2 });
      return;
    }
    const mid = Math.floor((l + r) / 2);
    steps.push({ state: snap(node, [l, r], null, 0, 'build', `构建节点 [${l},${r}]，mid=${mid}，分左右子树`), description: `节点 [${l},${r}]`, codeLine: 3 });
    build(2 * node + 1, l, mid);
    build(2 * node + 2, mid + 1, r);
    tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    steps.push({ state: snap(node, [l, r], null, 0, 'build', `回溯：tree[${node}] = ${tree[2 * node + 1]} + ${tree[2 * node + 2]} = ${tree[node]}`), description: `合并 [${l},${r}]=${tree[node]}`, codeLine: 6 });
  }

  build(0, 0, n - 1);
  steps.push({ state: snap(-1, [0, n - 1], null, 0, 'build', '线段树构建完成'), description: '构建完成', codeLine: 6 });

  // Query phase
  steps.push({ state: snap(-1, [0, n - 1], [qL, qR], 0, 'query', `查询区间 [${qL},${qR}] 的和`), description: `查询 [${qL},${qR}]`, codeLine: 8 });

  function query(node: number, l: number, r: number): number {
    if (qL <= l && r <= qR) {
      steps.push({ state: snap(node, [l, r], [qL, qR], tree[node], 'query', `[${l},${r}] 完全包含在查询内，直接返回 ${tree[node]}`), description: `完全包含 → ${tree[node]}`, codeLine: 9 });
      return tree[node];
    }
    const mid = Math.floor((l + r) / 2);
    let sum = 0;
    if (qL <= mid) {
      steps.push({ state: snap(node, [l, r], [qL, qR], 0, 'query', `[${l},${r}] 部分重叠，向左子树 [${l},${mid}] 查询`), description: `搜左 [${l},${mid}]`, codeLine: 11 });
      sum += query(2 * node + 1, l, mid);
    }
    if (qR > mid) {
      steps.push({ state: snap(node, [l, r], [qL, qR], 0, 'query', `[${l},${r}] 部分重叠，向右子树 [${mid + 1},${r}] 查询`), description: `搜右 [${mid + 1},${r}]`, codeLine: 12 });
      sum += query(2 * node + 2, mid + 1, r);
    }
    return sum;
  }

  const result = query(0, 0, n - 1);
  steps.push({ state: snap(-1, [0, n - 1], [qL, qR], result, 'query', `✅ 查询结果：sum[${qL}..${qR}] = ${result}`), description: `结果 = ${result}`, codeLine: 13 });

  return steps;
}

export function SegmentTreePanel() {
  const [seed, setSeed] = useState<number[]>([2, 5, 1, 4, 3, 6]);
  const [qL, setQL] = useState(1);
  const [qR, setQR] = useState(4);
  const steps = useMemo(() => buildSteps(seed, qL, qR), [seed, qL, qR]);
  const initial: SegState = { tree: [], n: seed.length, nums: seed, activeNode: -1, range: [0, seed.length - 1], queryRange: null, queryResult: 0, phase: 'build', message: '' };

  return (
    <Stepper<SegState>
      steps={steps}
      initialState={initial}
      codeLines={segmentTreeCode}
      codeTitle="线段树 Segment Tree"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input type="text" value={seed.join(',')} onChange={(e) => { const p = e.target.value.split(',').map((s) => Number(s.trim())).filter(Number.isFinite); if (p.length >= 2) setSeed(p); }} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40" placeholder="逗号分隔" />
          <span className="text-sm text-gray-400">查询:</span>
          <input type="number" value={qL} onChange={(e) => setQL(Math.max(0, Number(e.target.value)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-12" />
          <span className="text-gray-500">~</span>
          <input type="number" value={qR} onChange={(e) => setQR(Math.min(seed.length - 1, Number(e.target.value)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-12" />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">黄色=当前节点，蓝色=查询范围，绿色=结果</div>

          {/* Original array */}
          <div className="flex items-center gap-1 justify-center">
            <span className="text-xs text-gray-500 mr-2">nums:</span>
            {state.nums.map((v, i) => (
              <div key={i} className={clsx('w-9 h-9 flex items-center justify-center rounded text-xs font-mono border', state.queryRange && i >= state.queryRange[0] && i <= state.queryRange[1] ? 'bg-blue-500/20 border-blue-400 text-blue-200' : 'bg-surface-2 border-edge-2 text-gray-400')}>{v}</div>
            ))}
          </div>

          {/* Tree array view */}
          <div className="space-y-1">
            <span className="text-xs text-gray-500">tree[] (数组表示):</span>
            <div className="flex gap-1 flex-wrap">
              {state.tree.slice(0, 4 * state.n).map((v, i) => (
                <div key={i} className={clsx('w-8 h-8 flex items-center justify-center rounded text-[10px] font-mono border', i === state.activeNode ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110' : v !== 0 ? 'bg-surface-2 border-edge-2 text-gray-300' : 'bg-bg border-edge text-gray-700')}>{v || '·'}</div>
              ))}
            </div>
          </div>

          {state.phase === 'query' && state.queryResult > 0 && (
            <div className="text-center p-2 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">sum[{state.queryRange?.[0]}..{state.queryRange?.[1]}] = {state.queryResult}</span>
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
