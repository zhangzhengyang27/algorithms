'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const treapCode = [
  'function insert(v) {',
  '  // 1. 按二叉搜索树规则插入，并赋予随机 priority',
  '  const x = bstInsert(v);',
  '  // 2. 若父节点 priority < 本节点，旋转上浮（维持最大堆）',
  '  while (parent(x) && priority(parent(x)) < priority(x))',
  '    rotate(x);',
  '}',
];

interface TreapNode {
  val: number;
  pri: number;
  left: number; // index into nodes array, -1 = null
  right: number;
}

interface TreapState {
  nodes: TreapNode[];
  root: number;
  activeNode: number;
  rotateNodes: number[];
  message: string;
  insertedVal: number;
}

function cloneNodes(nodes: TreapNode[]): TreapNode[] {
  return nodes.map((n) => ({ ...n }));
}

export function buildSteps(values: number[]): VizStep<TreapState>[] {
  const steps: VizStep<TreapState>[] = [];
  let nodes: TreapNode[] = [];
  let parent: number[] = []; // 辅助：节点 -> 父索引，-1 表示根
  let root = -1;

  const snap = (active: number, rotate: number[], msg: string, insVal: number): TreapState => ({
    nodes: cloneNodes(nodes), root, activeNode: active, rotateNodes: rotate, message: msg, insertedVal: insVal,
  });

  steps.push({ state: snap(-1, [], '初始化空 Treap（随机 priority 维持平衡）', -1), description: '初始化', codeLine: 1 });

  function rotateRight(y: number): number {
    const x = nodes[y].left;
    const t2 = nodes[x].right;
    nodes[x].right = y;
    nodes[y].left = t2;
    const py = parent[y];
    parent[x] = py;
    parent[y] = x;
    if (t2 !== -1) parent[t2] = y;
    if (py === -1) root = x;
    else if (nodes[py].left === y) nodes[py].left = x;
    else nodes[py].right = x;
    return x;
  }

  function rotateLeft(x: number): number {
    const y = nodes[x].right;
    const t2 = nodes[y].left;
    nodes[y].left = x;
    nodes[x].right = t2;
    const px = parent[x];
    parent[y] = px;
    parent[x] = y;
    if (t2 !== -1) parent[t2] = x;
    if (px === -1) root = y;
    else if (nodes[px].left === x) nodes[px].left = y;
    else nodes[px].right = y;
    return y;
  }

  // 把 x 向上旋转一层
  function rotateUp(x: number) {
    const p = parent[x];
    if (p === -1) return;
    if (nodes[p].left === x) rotateRight(p);
    else rotateLeft(p);
  }

  function bstInsert(v: number): number {
    if (root === -1) {
      const i = nodes.length;
      nodes.push({ val: v, pri: Math.floor(Math.random() * 1000), left: -1, right: -1 });
      parent.push(-1);
      root = i;
      return i;
    }
    let cur = root;
    while (true) {
      if (v < nodes[cur].val) {
        if (nodes[cur].left === -1) {
          const i = nodes.length;
          nodes.push({ val: v, pri: Math.floor(Math.random() * 1000), left: -1, right: -1 });
          parent.push(cur);
          nodes[cur].left = i;
          return i;
        }
        cur = nodes[cur].left;
      } else {
        if (nodes[cur].right === -1) {
          const i = nodes.length;
          nodes.push({ val: v, pri: Math.floor(Math.random() * 1000), left: -1, right: -1 });
          parent.push(cur);
          nodes[cur].right = i;
          return i;
        }
        cur = nodes[cur].right;
      }
    }
  }

  for (const v of values) {
    const idx = bstInsert(v);
    steps.push({ state: snap(idx, [], `BST 插入 ${v}（priority=${nodes[idx].pri}）`, v), description: `插入 ${v}`, codeLine: 2 });
    // 按 priority 上浮旋转，维持最大堆性质
    let x = idx;
    while (parent[x] !== -1 && nodes[parent[x]].pri < nodes[x].pri) {
      const p = parent[x];
      rotateUp(x);
      steps.push({ state: snap(x, [x, p], `上浮：父 priority ${nodes[p].pri} < 本 ${nodes[x].pri}，旋转`, v), description: `上浮 @${nodes[x].val}`, codeLine: 5 });
    }
    steps.push({ state: snap(root, [], `插入 ${v} 完成，当前根=${nodes[root].val}`, v), description: `${v} 完成`, codeLine: 6 });
  }

  return steps;
}

function TreeView({ nodes, root, activeNode, rotateNodes }: { nodes: TreapNode[]; root: number; activeNode: number; rotateNodes: number[] }) {
  if (root === -1) return <div className="text-ink-3 text-sm py-8 text-center">空树</div>;

  interface Pos { idx: number; depth: number; x: number; }
  const positions: Pos[] = [];
  let xCounter = 0;

  function inorder(idx: number, depth: number) {
    if (idx === -1) return;
    inorder(nodes[idx].left, depth + 1);
    positions.push({ idx, depth, x: xCounter++ });
    inorder(nodes[idx].right, depth + 1);
  }
  inorder(root, 0);

  const maxDepth = Math.max(...positions.map((p) => p.depth), 0);

  return (
    <div className="flex flex-col items-center gap-2 min-h-[120px]">
      {Array.from({ length: maxDepth + 1 }, (_, d) => {
        const levelNodes = positions.filter((p) => p.depth === d);
        return (
          <div key={d} className="flex items-center justify-center gap-2">
            {levelNodes.map((p) => {
              const isActive = p.idx === activeNode;
              const isRotate = rotateNodes.includes(p.idx);
              return (
                <div key={p.idx} className="flex flex-col items-center">
                  <div className={clsx('w-10 h-10 flex items-center justify-center rounded-full text-xs font-mono border-2 transition-all',
                    isActive ? 'bg-warn/25 border-warn text-warn scale-110 ring-2 ring-warn/40'
                      : isRotate ? 'bg-brand/25 border-brand text-brand ring-2 ring-brand/30'
                        : 'bg-surface-2 border-edge-2 text-ink-3')}>
                    {nodes[p.idx].val}
                  </div>
                  <div className="text-[9px] font-mono text-ink-3">p={nodes[p.idx].pri}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function TreapPanel() {
  const [seed, setSeed] = useState<number[]>([10, 20, 30, 40, 50, 25, 5]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: TreapState = { nodes: [], root: -1, activeNode: -1, rotateNodes: [], message: '', insertedVal: -1 };

  return (
    <Stepper<TreapState>
      steps={steps}
      initialState={initial}
      codeLines={treapCode}
      codeTitle="Treap 插入（上浮旋转）"
      headerActions={
        <>
          <span className="text-sm text-gray-400">插入序列:</span>
          <input type="text" value={seed.join(',')} onChange={(e) => { const p = e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)); if (p.length >= 1) setSeed(p); }} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-52" placeholder="逗号分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-4">
          <div className="text-xs text-ink-3">琥珀=当前节点，蓝色=本次旋转涉及的节点，p=priority（随机，越大越靠近根）</div>
          <TreeView nodes={state.nodes} root={state.root} activeNode={state.activeNode} rotateNodes={state.rotateNodes} />
          {state.message && <div className="text-center text-sm text-ink-3">{state.message}</div>}
        </div>
      )}
    />
  );
}
