'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const bstCode = [
  'function insert(root, val) {',
  '  if (!root) return new Node(val);',
  '  if (val < root.val) root.left = insert(root.left, val);',
  '  else root.right = insert(root.right, val);',
  '  return root;',
  '}',
  'function search(root, target) {',
  '  if (!root || root.val === target) return root;',
  '  if (target < root.val) return search(root.left, target);',
  '  return search(root.right, target);',
  '}',
];

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface BSTState {
  tree: TreeNode | null;
  highlightPath: number[];
  insertedValue: number | null;
  foundValue: number | null;
  message: string;
}

function insertNode(root: TreeNode | null, value: number): TreeNode {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) root.left = insertNode(root.left, value);
  else if (value > root.value) root.right = insertNode(root.right, value);
  return root;
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return { value: node.value, left: cloneTree(node.left), right: cloneTree(node.right) };
}

function getSearchPath(root: TreeNode | null, target: number): number[] {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.value);
    if (target === cur.value) break;
    cur = target < cur.value ? cur.left : cur.right;
  }
  return path;
}

function treeToFlat(node: TreeNode | null, depth: number, pos: number, result: { value: number; depth: number; pos: number }[]) {
  if (!node) return;
  result.push({ value: node.value, depth, pos });
  treeToFlat(node.left, depth + 1, pos * 2, result);
  treeToFlat(node.right, depth + 1, pos * 2 + 1, result);
}

export function buildSteps(values: number[]): VizStep<BSTState>[] {
  const steps: VizStep<BSTState>[] = [];
  let tree: TreeNode | null = null;

  steps.push({
    state: { tree: null, highlightPath: [], insertedValue: null, foundValue: null, message: '初始化空 BST' },
    description: '初始化空二叉搜索树',
    codeLine: 2,
  });

  // Insert phase
  for (const v of values) {
    const path = getSearchPath(tree, v);
    steps.push({
      state: { tree: cloneTree(tree), highlightPath: path, insertedValue: null, foundValue: null, message: `查找插入位置：${v}` },
      description: `搜索 ${v} 的插入位置，路径: [${path.join(' → ')}]`,
      codeLine: 3,
    });
    tree = insertNode(cloneTree(tree), v);
    steps.push({
      state: { tree: cloneTree(tree), highlightPath: [v], insertedValue: v, foundValue: null, message: `插入 ${v}` },
      description: `插入节点 ${v}`,
      codeLine: 2,
    });
  }

  // Search phase
  const searchTarget = values[Math.floor(values.length / 2)];
  const searchPath = getSearchPath(tree, searchTarget);
  for (let i = 0; i < searchPath.length; i++) {
    steps.push({
      state: { tree: cloneTree(tree), highlightPath: searchPath.slice(0, i + 1), insertedValue: null, foundValue: null, message: `搜索 ${searchTarget}：比较 ${searchPath[i]}` },
      description: `搜索 ${searchTarget}：访问节点 ${searchPath[i]}${searchPath[i] === searchTarget ? ' → 找到！' : searchTarget < searchPath[i] ? ' → 往左' : ' → 往右'}`,
      codeLine: 9,
    });
  }
  steps.push({
    state: { tree: cloneTree(tree), highlightPath: searchPath, insertedValue: null, foundValue: searchTarget, message: `✅ 找到 ${searchTarget}` },
    description: `搜索完成，找到 ${searchTarget}`,
    codeLine: 8,
  });

  return steps;
}

function TreeRenderer({ tree, highlightPath, insertedValue, foundValue }: {
  tree: TreeNode | null;
  highlightPath: number[];
  insertedValue: number | null;
  foundValue: number | null;
}) {
  if (!tree) return <div className="text-gray-600 text-sm text-center py-8">空树</div>;

  const nodes: { value: number; depth: number; pos: number }[] = [];
  treeToFlat(tree, 0, 0, nodes);
  const maxDepth = Math.max(...nodes.map((n) => n.depth));

  return (
    <div className="flex flex-col items-center gap-1">
      {Array.from({ length: maxDepth + 1 }).map((_, depth) => {
        const levelNodes = nodes.filter((n) => n.depth === depth);
        return (
          <div key={depth} className="flex items-center justify-center gap-2">
            {levelNodes.map((n) => {
              const inPath = highlightPath.includes(n.value);
              const isInserted = insertedValue === n.value;
              const isFound = foundValue === n.value;
              return (
                <div
                  key={`${depth}-${n.pos}-${n.value}`}
                  className={clsx(
                    'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all border',
                    isFound
                      ? 'bg-green-500/30 border-green-400 text-green-200'
                      : isInserted
                        ? 'bg-blue-500/30 border-blue-400 text-blue-200'
                        : inPath
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200'
                          : 'bg-surface-2 border-edge-2 text-gray-300',
                  )}
                >
                  {n.value}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function BSTPanel() {
  const [seed, setSeed] = useState<number[]>([8, 3, 10, 1, 6, 14, 4, 7]);
  const steps = useMemo(() => buildSteps(seed), [seed]);
  const initial: BSTState = { tree: null, highlightPath: [], insertedValue: null, foundValue: null, message: '' };

  return (
    <Stepper<BSTState>
      steps={steps}
      initialState={initial}
      codeLines={bstCode}
      codeTitle="二叉搜索树 BST"
      headerActions={
        <>
          <span className="text-sm text-gray-400">插入序列:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value
                .split(',')
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n));
              if (parsed.length >= 1) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="逗号分隔"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 mb-2">
            二叉搜索树（路径黄色，新插入蓝色，找到绿色）
          </div>
          <div className="min-h-[200px] flex items-center justify-center">
            <TreeRenderer
              tree={state.tree}
              highlightPath={state.highlightPath}
              insertedValue={state.insertedValue}
              foundValue={state.foundValue}
            />
          </div>
          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
