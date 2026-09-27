'use client';

import { useMemo, useState } from 'react';
import { Stepper, type VizStep } from './stepper';

const dpTreeCode = [
  'function maxParty(happy, children) {',
  '  const n = happy.length;',
  '  const dp = Array.from({ length: n }, () => [0, 0]);',
  '  function dfs(u) {',
  '    dp[u][1] = happy[u];',
  '    for (const v of children[u]) {',
  '      dfs(v);',
  '      dp[u][0] += Math.max(dp[v][0], dp[v][1]);',
  '      dp[u][1] += dp[v][0];',
  '    }',
  '  }',
  '  dfs(0);',
  '  return Math.max(dp[0][0], dp[0][1]);',
  '}',
];

const DEFAULT_HAPPY = [1, 2, 3, 4, 5, 6, 7];
const DEFAULT_CHILDREN: number[][] = [[1, 2, 3], [4, 5], [], [6], [], [], []];

interface DpTreeState {
  happy: number[];
  children: number[][];
  dp: [number, number][];
  current: number;
  child: number;
  order: number[];
  phase: 'init' | 'dfs' | 'done';
  result: number | null;
  message: string;
}

export function buildSteps(happy: number[], children: number[][]): VizStep<DpTreeState>[] {
  const steps: VizStep<DpTreeState>[] = [];
  const dp: [number, number][] = Array.from({ length: happy.length }, () => [0, 0]);
  const order: number[] = [];
  const snap = () => dp.map((d) => [d[0], d[1]] as [number, number]);

  steps.push({
    state: { happy, children, dp: snap(), current: -1, child: -1, order: [], phase: 'init', result: null, message: '树形 DP：后序遍历，先算完所有子节点，再汇总到父节点' },
    description: '初始化',
    codeLine: 2,
  });

  function dfs(u: number) {
    dp[u][1] = happy[u];
    steps.push({
      state: { happy, children, dp: snap(), current: u, child: -1, order: [...order], phase: 'dfs', result: null, message: `访问节点 ${u}：若选择 ${u}，dp[${u}][选] 初始 = happy[${u}] = ${happy[u]}` },
      description: `访问${u}`,
      codeLine: 4,
    });
    for (const v of children[u]) {
      steps.push({
        state: { happy, children, dp: snap(), current: u, child: v, order: [...order], phase: 'dfs', result: null, message: `递归处理子节点 ${v}` },
        description: `递归${v}`,
        codeLine: 6,
      });
      dfs(v);
      dp[u][0] += Math.max(dp[v][0], dp[v][1]);
      dp[u][1] += dp[v][0];
      steps.push({
        state: { happy, children, dp: snap(), current: u, child: v, order: [...order], phase: 'dfs', result: null, message: `合并 ${v}：dp[${u}][不选] += max(${dp[v][0]}, ${dp[v][1]})；dp[${u}][选] += dp[${v}][不选] = ${dp[v][0]}` },
        description: `合并${v}`,
        codeLine: 7,
      });
    }
    order.push(u);
    steps.push({
      state: { happy, children, dp: snap(), current: u, child: -1, order: [...order], phase: 'dfs', result: null, message: `节点 ${u} 完成：dp[${u}] = [不选=${dp[u][0]}, 选=${dp[u][1]}]` },
      description: `完成${u}`,
      codeLine: 9,
    });
  }

  dfs(0);
  const result = Math.max(dp[0][0], dp[0][1]);
  steps.push({
    state: { happy, children, dp: snap(), current: 0, child: -1, order: [...order], phase: 'done', result, message: `最大快乐值 = max(dp[0][不选], dp[0][选]) = max(${dp[0][0]}, ${dp[0][1]}) = ${result}` },
    description: `结果=${result}`,
    codeLine: 12,
  });
  return steps;
}

function layoutTree(children: number[][]) {
  const depth = new Map<number, number>();
  const pos = new Map<number, { x: number; y: number }>();
  let leaf = 0;
  const setDepth = (u: number, d: number) => {
    depth.set(u, d);
    for (const v of children[u]) setDepth(v, d + 1);
  };
  setDepth(0, 0);
  const inorder = (u: number) => {
    if (children[u].length === 0) {
      pos.set(u, { x: leaf++, y: depth.get(u)! });
      return;
    }
    for (const v of children[u]) inorder(v);
    const xs = children[u].map((c) => pos.get(c)!.x);
    pos.set(u, { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: depth.get(u)! });
  };
  inorder(0);
  return { pos, maxDepth: Math.max(...Array.from(depth.values())) };
}

export function DpTreePanel() {
  const [happy, setHappy] = useState<number[]>(DEFAULT_HAPPY);
  const children = DEFAULT_CHILDREN;

  const steps = useMemo(() => buildSteps(happy, children), [happy, children]);
  const { pos, maxDepth } = useMemo(() => layoutTree(children), [children]);

  const initial: DpTreeState = {
    happy, children,
    dp: Array.from({ length: happy.length }, () => [0, 0] as [number, number]),
    current: -1, child: -1, order: [], phase: 'init', result: null, message: '',
  };

  const X = 78, Y = 92, R = 21, PAD = 30;
  const width = (Math.max(...Array.from(pos.values()).map((p) => p.x)) + 1) * X + PAD;
  const height = (maxDepth + 1) * Y + PAD + 30;

  const nodeColor = (u: number, state: DpTreeState) => {
    if (state.current === u) return { fill: '#eab30833', stroke: '#eab308', text: '#fde047' };
    if (state.child === u) return { fill: '#a855f733', stroke: '#a855f7', text: '#d8b4fe' };
    if (state.order.includes(u)) return { fill: '#16a34a2e', stroke: '#16a34a', text: '#86efac' };
    return { fill: '#1a1a1a', stroke: '#333', text: '#9ca3af' };
  };

  return (
    <Stepper<DpTreeState>
      steps={steps}
      initialState={initial}
      codeLines={dpTreeCode}
      codeTitle="树形DP·没有上司的舞会 Tree DP"
      headerActions={
        <>
          <span className="text-sm text-gray-400">快乐值:</span>
          <input
            type="text"
            value={happy.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((v) => Number.isFinite(v));
              if (parsed.length === DEFAULT_HAPPY.length) setHappy(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-44"
            placeholder="7个逗号分隔"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            黄色=当前节点，紫色=正在合并的子节点，绿色=已完成。每个节点显示 dp[不选 / 选]
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl mx-auto">
            {/* edges */}
            {children.map((kids, u) =>
              kids.map((v) => {
                const a = pos.get(u)!, b = pos.get(v)!;
                const active = state.current === u && state.child === v;
                return (
                  <line
                    key={`${u}-${v}`}
                    x1={a.x * X + PAD} y1={a.y * Y + PAD}
                    x2={b.x * X + PAD} y2={b.y * Y + PAD}
                    stroke={active ? '#a855f7' : '#333'}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                );
              }),
            )}
            {/* nodes */}
            {Array.from(pos.entries()).map(([u, p]) => {
              const c = nodeColor(u, state);
              const cx = p.x * X + PAD, cy = p.y * Y + PAD;
              return (
                <g key={u}>
                  <circle cx={cx} cy={cy} r={R} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
                  <text x={cx} y={cy - 2} textAnchor="middle" fontSize="12" fontWeight="bold" fill={c.text}>{u}</text>
                  <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9" fill={c.text}>h={state.happy[u]}</text>
                  <text x={cx} y={cy + R + 13} textAnchor="middle" fontSize="9" fill="#9ca3af">
                    {state.dp[u][0]}/{state.dp[u][1]}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-gray-500">后序遍历顺序:</span>
            {state.order.map((u, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-green-900/30 border border-green-800 text-green-300">{u}</span>
            ))}
            {state.order.length === 0 && <span className="text-gray-600">（暂无）</span>}
          </div>

          {state.phase === 'done' && state.result !== null && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">最大快乐值 = {state.result}</span>
            </div>
          )}

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
