'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const memoCode = [
  'function fibNaive(n) {',
  '  if (n <= 1) return n;',
  '  return fibNaive(n - 1) + fibNaive(n - 2);',
  '}',
  'const memo = new Map();',
  'function fibMemo(n) {',
  '  if (n <= 1) return n;',
  '  if (memo.has(n)) return memo.get(n);',
  '  const res = fibMemo(n - 1) + fibMemo(n - 2);',
  '  memo.set(n, res);',
  '  return res;',
  '}',
];

export interface MNode {
  id: number;
  k: number;
  depth: number;
  px: number;
  py: number;
  children: MNode[];
  duplicate: boolean;
  hit: boolean;
  value: number;
}

function fibVal(k: number): number {
  let a = 0, b = 1;
  for (let i = 0; i < k; i++) [a, b] = [b, a + b];
  return a;
}

export function buildNaiveTree(n: number): { root: MNode; nodes: MNode[] } {
  let nextId = 0;
  const nodes: MNode[] = [];
  function gen(k: number, depth: number): MNode {
    const node: MNode = { id: nextId++, k, depth, px: 0, py: 0, children: [], duplicate: false, hit: false, value: fibVal(k) };
    nodes.push(node);
    if (k >= 2) {
      node.children.push(gen(k - 1, depth + 1));
      node.children.push(gen(k - 2, depth + 1));
    }
    return node;
  }
  const root = gen(n, 0);
  // mark duplicates by preorder first-occurrence
  const seen = new Set<number>();
  (function mark(node: MNode) {
    if (seen.has(node.k)) node.duplicate = true;
    else seen.add(node.k);
    node.children.forEach(mark);
  })(root);
  return { root, nodes };
}

export function buildMemoTree(n: number): { root: MNode; nodes: MNode[] } {
  let nextId = 0;
  const nodes: MNode[] = [];
  const memoSet = new Set<number>();
  function gen(k: number, depth: number): MNode {
    const isHit = memoSet.has(k);
    const node: MNode = { id: nextId++, k, depth, px: 0, py: 0, children: [], duplicate: false, hit: isHit, value: fibVal(k) };
    nodes.push(node);
    if (isHit) return node;
    if (k >= 2) {
      node.children.push(gen(k - 1, depth + 1));
      node.children.push(gen(k - 2, depth + 1));
    }
    memoSet.add(k);
    return node;
  }
  const root = gen(n, 0);
  return { root, nodes };
}

function assignPositions(root: MNode, width: number, topMargin: number, levelH: number) {
  let leafCounter = 0;
  const leaves: MNode[] = [];
  (function collectLeaves(node: MNode) {
    if (node.children.length === 0) leaves.push(node);
    node.children.forEach(collectLeaves);
  })(root);
  const numLeaves = Math.max(1, leaves.length);
  const margin = 26;
  const scaleX = numLeaves > 1 ? (width - 2 * margin) / (numLeaves - 1) : 0;
  (function setX(node: MNode): number {
    if (node.children.length === 0) {
      node.px = margin + leafCounter++ * scaleX;
    } else {
      const xs = node.children.map(setX);
      node.px = (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    node.py = topMargin + node.depth * levelH;
    return node.px;
  })(root);
}

interface MemoState {
  phase: 'naive' | 'memo' | 'done';
  completed: number[];
  active: number;
  memoTable: (number | null)[];
  callCount: number;
  message: string;
}

export function buildSteps(n: number, naive: MNode[], memo: MNode[]): VizStep<MemoState>[] {
  const steps: VizStep<MemoState>[] = [];
  const emptyMemo = () => new Array(n + 1).fill(null);

  // Naive preorder walk
  const naivePreorder: MNode[] = [];
  (function collect(node: MNode) { naivePreorder.push(node); node.children.forEach(collect); })(naive[0]);

  steps.push({
    state: { phase: 'naive', completed: [], active: -1, memoTable: emptyMemo(), callCount: 0, message: `朴素递归 fib(${n})：展开完整递归树` },
    description: '朴素递归',
    codeLine: 2,
  });

  for (let i = 0; i < naivePreorder.length; i++) {
    const node = naivePreorder[i];
    steps.push({
      state: {
        phase: 'naive',
        completed: naivePreorder.slice(0, i).map((nd) => nd.id),
        active: node.id,
        memoTable: emptyMemo(),
        callCount: i + 1,
        message: node.duplicate
          ? `调用 fib(${node.k}) —— 重复计算（之前已算过）`
          : `调用 fib(${node.k})${node.k <= 1 ? ` = ${node.value}（递归出口）` : ''}`,
      },
      description: node.duplicate ? `重复 f(${node.k})` : `f(${node.k})`,
      codeLine: node.k <= 1 ? 1 : 2,
    });
  }

  const dupCount = naivePreorder.filter((nd) => nd.duplicate).length;
  steps.push({
    state: {
      phase: 'naive',
      completed: naivePreorder.map((nd) => nd.id),
      active: -1,
      memoTable: emptyMemo(),
      callCount: naivePreorder.length,
      message: `朴素递归共 ${naivePreorder.length} 次调用，其中 ${dupCount} 次是重复计算，指数级复杂度`,
    },
    description: `${naivePreorder.length} 次调用`,
    codeLine: 2,
  });

  // Memo walk (computation order)
  const memoTable = emptyMemo();
  const memoCompleted: number[] = [];
  interface MemoStepData { nodeId: number; type: 'base' | 'hit' | 'compute'; k: number; value: number; memoAfter: (number | null)[]; completedAfter: number[] }
  const memoStepsData: MemoStepData[] = [];
  (function genSteps(node: MNode) {
    if (node.hit) {
      memoCompleted.push(node.id);
      memoStepsData.push({ nodeId: node.id, type: 'hit', k: node.k, value: node.value, memoAfter: [...memoTable], completedAfter: [...memoCompleted] });
      return;
    }
    node.children.forEach(genSteps);
    memoTable[node.k] = node.value;
    memoCompleted.push(node.id);
    memoStepsData.push({ nodeId: node.id, type: node.k <= 1 ? 'base' : 'compute', k: node.k, value: node.value, memoAfter: [...memoTable], completedAfter: [...memoCompleted] });
  })(memo[0]);

  steps.push({
    state: { phase: 'memo', completed: [], active: -1, memoTable: emptyMemo(), callCount: 0, message: `记忆化搜索 fib(${n})：用 memo 表避免重复计算` },
    description: '记忆化搜索',
    codeLine: 7,
  });

  for (const d of memoStepsData) {
    const msg = d.type === 'hit'
      ? `fib(${d.k}) 命中 memo，直接返回 ${d.value}，O(1)`
      : d.type === 'base'
        ? `基础情况 fib(${d.k}) = ${d.value}，写入 memo`
        : `fib(${d.k}) = fib(${d.k - 1}) + fib(${d.k - 2}) = ${d.value}，写入 memo`;
    steps.push({
      state: {
        phase: 'memo',
        completed: d.completedAfter,
        active: d.nodeId,
        memoTable: d.memoAfter,
        callCount: d.completedAfter.length,
        message: msg,
      },
      description: d.type === 'hit' ? `命中 f(${d.k})` : `f(${d.k})=${d.value}`,
      codeLine: d.type === 'hit' ? 7 : d.type === 'base' ? 6 : 9,
    });
  }

  steps.push({
    state: {
      phase: 'done',
      completed: memo.map((nd) => nd.id),
      active: -1,
      memoTable: [...memoTable],
      callCount: memo.length,
      message: `记忆化后仅需 ${memo.length} 个节点（朴素 ${naivePreorder.length} 个），复杂度降为 O(n)`,
    },
    description: '对比完成',
    codeLine: 9,
  });

  return steps;
}

function TreeSvg({ root, phase, completed, active, width, height }: {
  root: MNode;
  phase: 'naive' | 'memo';
  completed: Set<number>;
  active: number;
  width: number;
  height: number;
}) {
  const completedSet = completed;
  function nodeColor(node: MNode): { fill: string; stroke: string; text: string } {
    if (phase === 'naive') {
      if (node.id === active) return { fill: 'rgba(250,204,21,0.3)', stroke: '#facc15', text: '#fde047' };
      if (node.duplicate) return { fill: 'rgba(239,68,68,0.15)', stroke: '#b91c1c', text: '#f87171' };
      if (completedSet.has(node.id)) return { fill: 'rgba(96,165,250,0.15)', stroke: '#3b82f6', text: '#93c5fd' };
      return { fill: '#1a1a1a', stroke: '#444', text: '#9ca3af' };
    }
    if (node.id === active) return { fill: 'rgba(250,204,21,0.3)', stroke: '#facc15', text: '#fde047' };
    if (node.hit) return { fill: 'rgba(168,85,247,0.2)', stroke: '#a855f7', text: '#c084fc' };
    if (completedSet.has(node.id)) return { fill: 'rgba(74,222,128,0.15)', stroke: '#22c55e', text: '#86efac' };
    return { fill: '#1a1a1a', stroke: '#444', text: '#9ca3af' };
  }
  function renderNode(node: MNode) {
    const c = nodeColor(node);
    const showValue = completedSet.has(node.id) || node.id === active;
    return (
      <g key={node.id}>
        {node.children.map((ch) => (
          <line key={`e${node.id}-${ch.id}`} x1={node.px} y1={node.py} x2={ch.px} y2={ch.py} stroke="#3a3a3a" strokeWidth="1" />
        ))}
        <circle cx={node.px} cy={node.py} r={15} fill={c.fill} stroke={c.stroke} strokeWidth="1.5" />
        <text x={node.px} y={node.py + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontFamily="monospace" fill={c.text}>
          f{node.k}
        </text>
        {showValue && (
          <text x={node.px} y={node.py + 26} textAnchor="middle" fontSize="9" fontFamily="monospace" fill={node.hit ? '#c084fc' : '#86efac'}>
            ={node.value}{node.hit ? '✓' : ''}
          </text>
        )}
        {renderChildren(node)}
      </g>
    );
  }
  function renderChildren(node: MNode) {
    return node.children.map((ch) => renderNode(ch));
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {renderNode(root)}
    </svg>
  );
}

export function MemoizationPanel() {
  const [n, setN] = useState(5);

  const { naiveTree, memoTree, naiveNodes, memoNodes, naiveH, memoH } = useMemo(() => {
    const naive = buildNaiveTree(n);
    const memo = buildMemoTree(n);
    const W = 400;
    const levelH = 52;
    const naiveMaxDepth = n;
    const memoMaxDepth = n;
    assignPositions(naive.root, W, 22, levelH);
    assignPositions(memo.root, W, 22, levelH);
    return {
      naiveTree: naive.root,
      memoTree: memo.root,
      naiveNodes: naive.nodes,
      memoNodes: memo.nodes,
      naiveH: 22 + naiveMaxDepth * levelH + 24,
      memoH: 22 + memoMaxDepth * levelH + 24,
    };
  }, [n]);

  const steps = useMemo(() => buildSteps(n, naiveNodes, memoNodes), [n, naiveNodes, memoNodes]);

  const initial: MemoState = {
    phase: 'naive',
    completed: [],
    active: -1,
    memoTable: new Array(n + 1).fill(null),
    callCount: 0,
    message: '',
  };

  return (
    <Stepper<MemoState>
      steps={steps}
      initialState={initial}
      codeLines={memoCode}
      codeTitle="记忆化搜索 Memoization"
      headerActions={
        <>
          <span className="text-sm text-gray-400">n:</span>
          <input
            type="number"
            min={3}
            max={6}
            value={n}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v >= 3 && v <= 6) setN(v);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => {
        const completedSet = new Set(state.completed);
        return (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              朴素：红色=重复计算；记忆化：紫色=命中 memo，绿色=已计算。黄色=当前节点
            </div>

            {state.phase === 'naive' && (
              <div className="space-y-2">
                <div className="text-center text-sm font-mono text-gray-400">
                  朴素递归树 <span className="text-red-400">（调用次数: {state.callCount}）</span>
                </div>
                <TreeSvg root={naiveTree} phase="naive" completed={completedSet} active={state.active} width={400} height={naiveH} />
              </div>
            )}

            {state.phase === 'memo' && (
              <div className="space-y-3">
                <div className="text-center text-sm font-mono text-gray-400">
                  记忆化递归树 <span className="text-purple-400">（紫色为被剪枝的重复子树）</span>
                </div>
                <TreeSvg root={memoTree} phase="memo" completed={completedSet} active={state.active} width={400} height={memoH} />
                <div className="flex justify-center gap-1.5 flex-wrap">
                  {state.memoTable.map((v, i) => (
                    <div
                      key={i}
                      className={clsx(
                        'px-2 py-1 rounded border text-[10px] font-mono',
                        v !== null ? 'bg-green-500/15 border-green-700 text-green-300' : 'bg-surface-2 border-edge-2 text-gray-600',
                      )}
                    >
                      memo[{i}]={v !== null ? v : '–'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.phase === 'done' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-center text-xs font-mono text-red-400">朴素：{naiveNodes.length} 次调用</div>
                  <TreeSvg root={naiveTree} phase="naive" completed={new Set(naiveNodes.map((nd) => nd.id))} active={-1} width={400} height={naiveH} />
                </div>
                <div className="space-y-1">
                  <div className="text-center text-xs font-mono text-green-400">记忆化：{memoNodes.length} 个节点</div>
                  <TreeSvg root={memoTree} phase="memo" completed={new Set(memoNodes.map((nd) => nd.id))} active={-1} width={400} height={memoH} />
                </div>
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
