'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const splayCode = [
  'function splay(x) {',
  '  while (x 不是根) {',
  '    p = parent(x);',
  '    if (p 是根) { rotate(x); }                       // zig',
  '    else if (x 与 p 同为左/右孩子) { rotate(p); rotate(x); }  // zig-zig',
  '    else { rotate(x); rotate(x); }                   // zig-zag',
  '  }',
  '}',
  'function insert(v) {',
  '  bstInsert(v);            // 先按二叉搜索树插入',
  '  splay(新节点);           // 再把新节点转到根',
  '}',
];

interface SplayNode {
  val: number;
  left: number; // index into nodes array, -1 = null
  right: number;
}

interface SplayState {
  nodes: SplayNode[];
  root: number;
  activeNode: number;
  pathNodes: number[];
  message: string;
  insertedVal: number;
}

function cloneNodes(nodes: SplayNode[]): SplayNode[] {
  return nodes.map((n) => ({ ...n }));
}

export function buildSteps(values: number[]): VizStep<SplayState>[] {
  const steps: VizStep<SplayState>[] = [];
  let nodes: SplayNode[] = [];
  let parent: number[] = []; // 辅助数组：节点 -> 父索引，-1 表示根
  let root = -1;

  const snap = (active: number, path: number[], msg: string, insVal: number): SplayState => ({
    nodes: cloneNodes(nodes), root, activeNode: active, pathNodes: [...path], message: msg, insertedVal: insVal,
  });

  steps.push({ state: snap(-1, [], '初始化空 Splay 树', -1), description: '初始化', codeLine: 9 });

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

  function splay(x: number, path: number[]) {
    while (parent[x] !== -1) {
      const p = parent[x];
      if (parent[p] === -1) {
        rotateUp(x);
        steps.push({ state: snap(x, path, `zig：将 ${nodes[x].val} 单旋到根`, -1), description: `zig @${nodes[x].val}`, codeLine: 3 });
      } else {
        const g = parent[p];
        const xLeft = nodes[p].left === x;
        const pLeft = nodes[g].left === p;
        if (xLeft === pLeft) {
          rotateUp(p);
          rotateUp(x);
          steps.push({ state: snap(x, path, `zig-zig：先旋 ${nodes[p].val} 再旋 ${nodes[x].val}`, -1), description: `zig-zig @${nodes[x].val}`, codeLine: 4 });
        } else {
          rotateUp(x);
          rotateUp(x);
          steps.push({ state: snap(x, path, `zig-zag：连续两次旋 ${nodes[x].val}`, -1), description: `zig-zag @${nodes[x].val}`, codeLine: 5 });
        }
      }
    }
  }

  function bstInsert(v: number): number {
    if (root === -1) {
      const i = nodes.length;
      nodes.push({ val: v, left: -1, right: -1 });
      parent.push(-1);
      root = i;
      return i;
    }
    let cur = root;
    while (true) {
      if (v < nodes[cur].val) {
        if (nodes[cur].left === -1) {
          const i = nodes.length;
          nodes.push({ val: v, left: -1, right: -1 });
          parent.push(cur);
          nodes[cur].left = i;
          return i;
        }
        cur = nodes[cur].left;
      } else if (v > nodes[cur].val) {
        if (nodes[cur].right === -1) {
          const i = nodes.length;
          nodes.push({ val: v, left: -1, right: -1 });
          parent.push(cur);
          nodes[cur].right = i;
          return i;
        }
        cur = nodes[cur].right;
      } else {
        return cur; // 重复值不插入
      }
    }
  }

  for (const v of values) {
    const idx = bstInsert(v);
    steps.push({ state: snap(idx, [], `BST 插入 ${v}`, v), description: `插入 ${v}`, codeLine: 9 });
    const path: number[] = [];
    { let t = idx; while (t !== -1) { path.push(t); t = parent[t]; } }
    splay(idx, path);
    steps.push({ state: snap(root, path, `插入 ${v} 完成，已 splay 到根，当前根=${nodes[root].val}`, v), description: `${v} 完成`, codeLine: 10 });
  }

  return steps;
}

function TreeView({ nodes, root, activeNode, pathNodes }: { nodes: SplayNode[]; root: number; activeNode: number; pathNodes: number[] }) {
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
              const isPath = pathNodes.includes(p.idx);
              return (
                <div key={p.idx} className="flex flex-col items-center">
                  <div className={clsx('w-10 h-10 flex items-center justify-center rounded-full text-xs font-mono border-2 transition-all',
                    isActive ? 'bg-warn/25 border-warn text-warn scale-110 ring-2 ring-warn/40'
                      : isPath ? 'bg-brand/25 border-brand text-brand ring-2 ring-brand/30'
                        : 'bg-surface-2 border-edge-2 text-ink-3')}>
                    {nodes[p.idx].val}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function SplayPanel() {
  const [seed, setSeed] = useState<number[]>([10, 20, 30, 40, 50, 25, 5]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: SplayState = { nodes: [], root: -1, activeNode: -1, pathNodes: [], message: '', insertedVal: -1 };

  return (
    <Stepper<SplayState>
      steps={steps}
      initialState={initial}
      codeLines={splayCode}
      codeTitle="Splay 树旋转"
      headerActions={
        <>
          <span className="text-sm text-gray-400">插入序列:</span>
          <input type="text" value={seed.join(',')} onChange={(e) => { const p = e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)); if (p.length >= 1) setSeed(p); }} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-52" placeholder="逗号分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-4">
          <div className="text-xs text-ink-3">琥珀=当前旋转节点，蓝色=Splay 路径，每次插入后新节点被转到根</div>
          <TreeView nodes={state.nodes} root={state.root} activeNode={state.activeNode} pathNodes={state.pathNodes} />
          {state.message && <div className="text-center text-sm text-ink-3">{state.message}</div>}
        </div>
      )}
    />
  );
}
