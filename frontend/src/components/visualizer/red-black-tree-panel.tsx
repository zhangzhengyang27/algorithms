'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const rbtCode = [
  'function insert(root, val) {',
  '  const z = bstInsert(root, val); // 新节点着红色',
  '  return insertFixup(root, z);',
  '}',
  'function insertFixup(root, z) {',
  '  while (z.parent && z.parent.red) {',
  '    const gp = z.parent.parent;',
  '    if (uncle && uncle.red) {',
  '      // 情况1: 父叔皆红 → 重着色，z 上移',
  '      parent.red = false; uncle.red = false;',
  '      gp.red = true; z = gp;',
  '    } else {',
  '      // 情况2/3: 先转成同侧，再旋转祖父',
  '      if (外侧) { z = z.parent; rotate(z); }',
  '      parent.red = false; gp.red = true; rotate(gp);',
  '    }',
  '  }',
  '  root.red = false; // 根始终为黑',
  '  return root;',
  '}',
];

interface RBNode {
  value: number;
  red: boolean;
  left: RBNode | null;
  right: RBNode | null;
  parent: RBNode | null;
}

interface FlatNode {
  value: number;
  red: boolean;
  depth: number;
  pos: number;
}

interface RBTState {
  nodes: FlatNode[];
  highlightValue: number | null;
  insertedValue: number | null;
  lastAction: string;
  message: string;
}

function flatten(root: RBNode | null): FlatNode[] {
  const result: FlatNode[] = [];
  function walk(node: RBNode | null, depth: number, pos: number) {
    if (!node) return;
    result.push({ value: node.value, red: node.red, depth, pos });
    walk(node.left, depth + 1, pos * 2);
    walk(node.right, depth + 1, pos * 2 + 1);
  }
  walk(root, 0, 0);
  return result.sort((a, b) => a.depth - b.depth || a.pos - b.pos);
}

function rotateLeft(root: RBNode, x: RBNode): RBNode {
  const y = x.right!;
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) return y;
  if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
  return root;
}

function rotateRight(root: RBNode, y: RBNode): RBNode {
  const x = y.left!;
  y.left = x.right;
  if (x.right) x.right.parent = y;
  x.parent = y.parent;
  if (!y.parent) return x;
  if (y === y.parent.left) y.parent.left = x;
  else y.parent.right = x;
  x.right = y;
  y.parent = x;
  return root;
}

function bstInsert(root: RBNode | null, value: number): { root: RBNode; node: RBNode } {
  const z: RBNode = { value, red: true, left: null, right: null, parent: null };
  if (!root) return { root: z, node: z };
  let cur: RBNode | null = root;
  let parent: RBNode | null = null;
  while (cur) {
    parent = cur;
    cur = value < cur.value ? cur.left : cur.right;
  }
  z.parent = parent;
  if (value < parent!.value) parent!.left = z;
  else parent!.right = z;
  return { root, node: z };
}

function buildSteps(values: number[]): VizStep<RBTState>[] {
  const steps: VizStep<RBTState>[] = [];
  let root: RBNode | null = null;

  const snap = (
    highlight: number | null,
    inserted: number | null,
    action: string,
    msg: string,
  ): RBTState => ({
    nodes: flatten(root),
    highlightValue: highlight,
    insertedValue: inserted,
    lastAction: action,
    message: msg,
  });

  const push = (
    highlight: number | null,
    inserted: number | null,
    action: string,
    msg: string,
    description: string,
    codeLine: number,
  ) => {
    steps.push({ state: snap(highlight, inserted, action, msg), description, codeLine });
  };

  push(null, null, '', '初始化空红黑树（根节点为黑色）', '初始化', 1);

  for (const v of values) {
    push(null, null, '', `按 BST 规则查找 ${v} 的插入位置`, `查找 ${v}`, 1);

    const res = bstInsert(root, v);
    root = res.root;
    const z = res.node;
    push(v, v, 'insert', `插入 ${v}，着红色${z.parent && z.parent.red ? '，父节点也是红色 → 违反红黑性质，需调整' : ''}`, `插入 ${v}(红)`, 2);

    // fixup
    let node = z;
    while (node.parent && node.parent.red) {
      const gp = node.parent.parent!;
      if (node.parent === gp.left) {
        const uncle = gp.right;
        if (uncle && uncle.red) {
          node.parent.red = false;
          uncle.red = false;
          gp.red = true;
          push(gp.value, null, 'recolor', `父(${node.parent.value})、叔(${uncle.value})皆红 → 重着色：父叔变黑、祖父(${gp.value})变红，z 上移到祖父`, `重着色 @${gp.value}`, 10);
          node = gp;
        } else {
          if (node === node.parent.right) {
            node = node.parent;
            root = rotateLeft(root, node);
            push(node.value, null, 'rotate-left', `${node.value} 是右子（LR 型）→ 对父左旋，转成 LL 型`, `左旋 @${node.value}`, 14);
          }
          node.parent!.red = false;
          gp.red = true;
          root = rotateRight(root, gp);
          push(node.parent!.value, null, 'rotate-right', `对祖父(${gp.value})右旋：父(${node.parent!.value})变黑、祖父变红`, `右旋 @${gp.value}`, 15);
        }
      } else {
        const uncle = gp.left;
        if (uncle && uncle.red) {
          node.parent.red = false;
          uncle.red = false;
          gp.red = true;
          push(gp.value, null, 'recolor', `父(${node.parent.value})、叔(${uncle.value})皆红 → 重着色：父叔变黑、祖父(${gp.value})变红，z 上移到祖父`, `重着色 @${gp.value}`, 10);
          node = gp;
        } else {
          if (node === node.parent.left) {
            node = node.parent;
            root = rotateRight(root, node);
            push(node.value, null, 'rotate-right', `${node.value} 是左子（RL 型）→ 对父右旋，转成 RR 型`, `右旋 @${node.value}`, 14);
          }
          node.parent!.red = false;
          gp.red = true;
          root = rotateLeft(root, gp);
          push(node.parent!.value, null, 'rotate-left', `对祖父(${gp.value})左旋：父(${node.parent!.value})变黑、祖父变红`, `左旋 @${gp.value}`, 15);
        }
      }
    }
    if (root!.red) {
      root!.red = false;
      push(root!.value, null, 'recolor-root', `根节点 ${root!.value} 变黑（根始终为黑）`, '根变黑', 17);
    }
  }

  push(null, null, 'done', `✅ 插入完成，红黑树保持平衡（最长路径 ≤ 2×最短路径）`, '完成', 18);

  return steps;
}

export function RedBlackTreePanel() {
  const [seed, setSeed] = useState<number[]>([10, 20, 30, 15, 25, 5, 1, 8]);

  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: RBTState = {
    nodes: [],
    highlightValue: null,
    insertedValue: null,
    lastAction: '',
    message: '',
  };

  return (
    <Stepper<RBTState>
      steps={steps}
      initialState={initial}
      codeLines={rbtCode}
      codeTitle="红黑树 Red-Black Tree"
      headerActions={
        <>
          <span className="text-sm text-gray-400">插入序列:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((num) => Number.isFinite(num));
              if (parsed.length >= 1 && parsed.length <= 15) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="逗号分隔"
          />
        </>
      }
      render={(state) => {
        const depths = state.nodes.map((n) => n.depth);
        const levels = depths.length ? Math.max(...depths) + 1 : 0;
        return (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              红圈=红节点，黑圈=黑节点，黄色高亮=当前调整位置。性质：根黑、红节点子必黑、黑高相等
            </div>
            <div className="min-h-[220px] flex items-center justify-center">
              {state.nodes.length === 0 ? (
                <div className="text-gray-600 text-sm">空树</div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {Array.from({ length: levels }).map((_, depth) => (
                    <div key={depth} className="flex items-center justify-center gap-2">
                      {state.nodes.filter((n) => n.depth === depth).map((n) => {
                        const isHighlight = state.highlightValue === n.value;
                        const isInserted = state.insertedValue === n.value;
                        return (
                          <div
                            key={`${depth}-${n.pos}-${n.value}`}
                            className={clsx(
                              'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium border-2 transition-all',
                              n.red
                                ? 'bg-red-600/80 border-red-400 text-white'
                                : 'bg-gray-900 border-gray-500 text-gray-200',
                              isHighlight && 'ring-2 ring-yellow-400 scale-110',
                              isInserted && 'ring-2 ring-blue-400 scale-110',
                            )}
                          >
                            {n.value}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {state.lastAction && (
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-surface-2 border border-edge-2 text-yellow-300">
                  {state.lastAction}
                </span>
              </div>
            )}
            {state.message && (
              <div className="text-center text-sm text-gray-300">{state.message}</div>
            )}
          </div>
        );
      }}
    />
  );
}
