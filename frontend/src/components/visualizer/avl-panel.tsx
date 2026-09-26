'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const avlCode = [
  'function insert(node, val) {',
  '  if (!node) return new Node(val);',
  '  if (val < node.val) node.left = insert(node.left, val);',
  '  else node.right = insert(node.right, val);',
  '  node.height = 1 + Math.max(height(node.left), height(node.right));',
  '  const bf = height(node.left) - height(node.right);',
  '  if (bf > 1 && val < node.left.val) return rotateRight(node); // LL',
  '  if (bf < -1 && val > node.right.val) return rotateLeft(node); // RR',
  '  if (bf > 1 && val > node.left.val) { node.left = rotateLeft(node.left); return rotateRight(node); } // LR',
  '  if (bf < -1 && val < node.right.val) { node.right = rotateRight(node.right); return rotateLeft(node); } // RL',
  '  return node;',
  '}',
];

interface AVLNode {
  val: number;
  left: number; // index into nodes array, -1 = null
  right: number;
  height: number;
}

interface AVLState {
  nodes: AVLNode[];
  root: number;
  activeNode: number;
  rotateNodes: number[];
  message: string;
  insertedVal: number;
}

function height(nodes: AVLNode[], idx: number): number {
  return idx === -1 ? 0 : nodes[idx].height;
}

function updateHeight(nodes: AVLNode[], idx: number) {
  if (idx === -1) return;
  nodes[idx].height = 1 + Math.max(height(nodes, nodes[idx].left), height(nodes, nodes[idx].right));
}

function cloneNodes(nodes: AVLNode[]): AVLNode[] {
  return nodes.map((n) => ({ ...n }));
}

function buildSteps(values: number[]): VizStep<AVLState>[] {
  const steps: VizStep<AVLState>[] = [];
  let nodes: AVLNode[] = [];
  let root = -1;

  const snap = (active: number, rotate: number[], msg: string, insVal: number): AVLState => ({
    nodes: cloneNodes(nodes), root, activeNode: active, rotateNodes: rotate, message: msg, insertedVal: insVal,
  });

  steps.push({ state: snap(-1, [], '初始化空 AVL 树', -1), description: '初始化', codeLine: 1 });

  function rotateRight(y: number): number {
    const x = nodes[y].left;
    const t2 = nodes[x].right;
    nodes[x].right = y;
    nodes[y].left = t2;
    updateHeight(nodes, y);
    updateHeight(nodes, x);
    return x;
  }

  function rotateLeft(x: number): number {
    const y = nodes[x].right;
    const t2 = nodes[y].left;
    nodes[y].left = x;
    nodes[x].right = t2;
    updateHeight(nodes, x);
    updateHeight(nodes, y);
    return y;
  }

  function insert(idx: number, val: number, insVal: number): number {
    if (idx === -1) {
      const newIdx = nodes.length;
      nodes.push({ val, left: -1, right: -1, height: 1 });
      steps.push({ state: snap(newIdx, [], `插入节点 ${val}`, insVal), description: `插入 ${val}`, codeLine: 2 });
      return newIdx;
    }

    if (val < nodes[idx].val) {
      nodes[idx].left = insert(nodes[idx].left, val, insVal);
    } else if (val > nodes[idx].val) {
      nodes[idx].right = insert(nodes[idx].right, val, insVal);
    } else {
      return idx;
    }

    updateHeight(nodes, idx);
    const balance = height(nodes, nodes[idx].left) - height(nodes, nodes[idx].right);

    if (balance > 1 && val < nodes[nodes[idx].left].val) {
      steps.push({ state: snap(idx, [idx, nodes[idx].left], `节点 ${nodes[idx].val} 失衡 (BF=${balance})，LL 型 → 右旋`, insVal), description: `LL 右旋 @${nodes[idx].val}`, codeLine: 7 });
      return rotateRight(idx);
    }
    if (balance < -1 && val > nodes[nodes[idx].right].val) {
      steps.push({ state: snap(idx, [idx, nodes[idx].right], `节点 ${nodes[idx].val} 失衡 (BF=${balance})，RR 型 → 左旋`, insVal), description: `RR 左旋 @${nodes[idx].val}`, codeLine: 8 });
      return rotateLeft(idx);
    }
    if (balance > 1 && val > nodes[nodes[idx].left].val) {
      steps.push({ state: snap(idx, [idx, nodes[idx].left, nodes[nodes[idx].left].right], `节点 ${nodes[idx].val} 失衡 (BF=${balance})，LR 型 → 先左旋再右旋`, insVal), description: `LR 双旋 @${nodes[idx].val}`, codeLine: 9 });
      nodes[idx].left = rotateLeft(nodes[idx].left);
      return rotateRight(idx);
    }
    if (balance < -1 && val < nodes[nodes[idx].right].val) {
      steps.push({ state: snap(idx, [idx, nodes[idx].right, nodes[nodes[idx].right].left], `节点 ${nodes[idx].val} 失衡 (BF=${balance})，RL 型 → 先右旋再左旋`, insVal), description: `RL 双旋 @${nodes[idx].val}`, codeLine: 10 });
      nodes[idx].right = rotateRight(nodes[idx].right);
      return rotateLeft(idx);
    }

    return idx;
  }

  for (const v of values) {
    root = insert(root, v, v);
    steps.push({ state: snap(root, [], `插入 ${v} 完成，树高 ${height(nodes, root)}`, v), description: `${v} 插入完成`, codeLine: 11 });
  }

  return steps;
}

function TreeView({ nodes, root, activeNode, rotateNodes }: { nodes: AVLNode[]; root: number; activeNode: number; rotateNodes: number[] }) {
  if (root === -1) return <div className="text-gray-600 text-sm py-8 text-center">空树</div>;

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
              const bf = height(nodes, nodes[p.idx].left) - height(nodes, nodes[p.idx].right);
              return (
                <div key={p.idx} className="flex flex-col items-center">
                  <div className={clsx('w-10 h-10 flex items-center justify-center rounded-full text-xs font-mono border-2 transition-all', isActive ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110' : isRotate ? 'bg-red-500/30 border-red-400 text-red-200' : 'bg-surface-2 border-edge-2 text-gray-300')}>
                    {nodes[p.idx].val}
                  </div>
                  <div className={clsx('text-[9px] font-mono', Math.abs(bf) > 1 ? 'text-red-400' : 'text-gray-600')}>bf={bf}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function AVLPanel() {
  const [seed, setSeed] = useState<number[]>([10, 20, 30, 40, 50, 25, 5, 15]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: AVLState = { nodes: [], root: -1, activeNode: -1, rotateNodes: [], message: '', insertedVal: -1 };

  return (
    <Stepper<AVLState>
      steps={steps}
      initialState={initial}
      codeLines={avlCode}
      codeTitle="AVL 树旋转"
      headerActions={
        <>
          <span className="text-sm text-gray-400">插入序列:</span>
          <input type="text" value={seed.join(',')} onChange={(e) => { const p = e.target.value.split(',').map((s) => Number(s.trim())).filter(Number.isFinite); if (p.length >= 1) setSeed(p); }} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-52" placeholder="逗号分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-4">
          <div className="text-xs text-gray-500">黄色=当前节点，红色=旋转涉及节点，bf=平衡因子</div>
          <TreeView nodes={state.nodes} root={state.root} activeNode={state.activeNode} rotateNodes={state.rotateNodes} />
          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
