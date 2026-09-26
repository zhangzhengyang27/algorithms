'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const binaryLiftingCode = [
  'const LOG = 4; // 2^3=8 足够覆盖树深',
  'const fa = Array.from({ length: n }, () => new Array(LOG).fill(-1));',
  'for (let u = 0; u < n; u++) fa[u][0] = parent[u];',
  'for (let k = 1; k < LOG; k++)',
  '  for (let u = 0; u < n; u++)',
  '    fa[u][k] = fa[u][k-1] < 0 ? -1 : fa[fa[u][k-1]][k-1];',
  'function lca(u, v) {',
  '  if (depth[u] < depth[v]) [u, v] = [v, u];',
  '  for (let k = 0, d = depth[u]-depth[v]; d > 0; k++, d >>= 1)',
  '    if (d & 1) u = fa[u][k]; // 二进制分解跳祖先',
  '  if (u === v) return u;',
  '  for (let k = LOG-1; k >= 0; k--)',
  '    if (fa[u][k] !== fa[v][k]) { u = fa[u][k]; v = fa[v][k]; }',
  '  return fa[u][0];',
  '}',
];

// 树结构: children[u] = u 的子节点列表
const CHILDREN: number[][] = [[1, 2], [3, 4], [5], [6], [], [7], [8], [9], [], []];
const PARENT = [-1, 0, 0, 1, 1, 2, 3, 5, 6, 7];
const DEPTH = [0, 1, 1, 2, 2, 2, 3, 3, 4, 4];
const N = 10;
const LOG = 4;

interface BLState {
  fa: number[][];
  fillK: number; // 正在填充的 k 列
  curU: number; // 查询中的 u
  curV: number; // 查询中的 v
  refU: number; // 正在查看的 fa[u][k]
  refV: number;
  refK: number;
  pathU: number[]; // u 跳过的节点
  pathV: number[];
  queryPair: [number, number] | null;
  phase: 'preprocess' | 'query' | 'done';
  result: number | null;
  message: string;
}

function computeFa(): number[][] {
  const fa = Array.from({ length: N }, () => new Array(LOG).fill(-1));
  for (let u = 0; u < N; u++) fa[u][0] = PARENT[u];
  for (let k = 1; k < LOG; k++)
    for (let u = 0; u < N; u++) fa[u][k] = fa[u][k - 1] < 0 ? -1 : fa[fa[u][k - 1]][k - 1];
  return fa;
}

function buildSteps(): VizStep<BLState>[] {
  const steps: VizStep<BLState>[] = [];
  const full = computeFa();
  const fa = Array.from({ length: N }, () => new Array(LOG).fill(-1));

  const snap = (over: Partial<BLState>): BLState => ({
    fa: fa.map((r) => [...r]),
    fillK: -1, curU: -1, curV: -1, refU: -1, refV: -1, refK: -1,
    pathU: [], pathV: [], queryPair: null, phase: 'preprocess', result: null, message: '',
    ...over,
  });

  steps.push({
    state: snap({ message: '树上 10 个节点，预处理倍增祖先表 fa[u][k] = u 的 2^k 级祖先' }),
    description: '初始化',
    codeLine: 1,
  });

  // k = 0
  for (let u = 0; u < N; u++) fa[u][0] = PARENT[u];
  steps.push({
    state: snap({ fillK: 0, message: 'fa[u][0] = parent[u]：每个节点的 2^0=1 级祖先就是父节点' }),
    description: '填充 k=0',
    codeLine: 2,
  });

  // k = 1..LOG-1
  for (let k = 1; k < LOG; k++) {
    for (let u = 0; u < N; u++) fa[u][k] = full[u][k];
    const example = k === 1 ? 'fa[8][1] = fa[fa[8][0]][0] = fa[6][0] = 3（跳 2 级）' : `fa[u][${k}] = fa[fa[u][${k - 1}]][${k - 1}]：先跳 2^${k - 1} 再跳 2^${k - 1}`;
    steps.push({
      state: snap({ fillK: k, message: `倍增递推：${example}` }),
      description: `填充 k=${k}`,
      codeLine: 5,
    });
  }

  steps.push({
    state: snap({ phase: 'preprocess', message: '祖先表预处理完成，O(n log n)。开始查询 LCA' }),
    description: '预处理完成',
    codeLine: 5,
  });

  // ---- 查询 LCA(8, 9) ----
  const runQuery = (a: number, b: number) => {
    let u = a, v = b;
    steps.push({
      state: snap({ phase: 'query', queryPair: [a, b], curU: u, curV: v, pathU: [u], pathV: [v], message: `查询 LCA(${a}, ${b})：depth[${u}]=${DEPTH[u]}，depth[${v}]=${DEPTH[v]}` }),
      description: `查询 LCA(${a},${b})`,
      codeLine: 6,
    });

    if (DEPTH[u] < DEPTH[v]) {
      [u, v] = [v, u];
      steps.push({
        state: snap({ phase: 'query', queryPair: [a, b], curU: u, curV: v, pathU: [u], pathV: [v], message: `depth[${v}] 更深，交换使 u=${u} 为较深节点` }),
        description: '交换 u/v',
        codeLine: 7,
      });
    }

    let d = DEPTH[u] - DEPTH[v];
    if (d > 0) {
      steps.push({
        state: snap({ phase: 'query', queryPair: [a, b], curU: u, curV: v, pathU: [u], pathV: [v], message: `高度差 d=${d}，二进制分解为 ${d.toString(2)}₂，逐位上跳` }),
        description: `高度差 ${d}`,
        codeLine: 8,
      });
      const pu = [u];
      for (let k = 0; d > 0; k++, d >>= 1) {
        if (d & 1) {
          u = full[u][k];
          pu.push(u);
          steps.push({
            state: snap({ phase: 'query', queryPair: [a, b], curU: u, curV: v, refU: pu[pu.length - 2], refK: k, pathU: [...pu], pathV: [v], message: `d 的第 ${k} 位为 1：u = fa[${pu[pu.length - 2]}][${k}] = ${u}（上跳 2^${k}=${1 << k} 级）` }),
            description: `u 跳 2^${k}`,
            codeLine: 9,
          });
        }
      }
      if (u === v) {
        steps.push({
          state: snap({ phase: 'done', queryPair: [a, b], curU: u, curV: v, pathU: [...pu], pathV: [v], result: u, message: `✅ 对齐后 u === v = ${u}，LCA(${a}, ${b}) = ${u}` }),
          description: `LCA = ${u}`,
          codeLine: 10,
        });
        return;
      }
    }

    const pu = [u], pv = [v];
    steps.push({
      state: snap({ phase: 'query', queryPair: [a, b], curU: u, curV: v, pathU: [...pu], pathV: [...pv], message: `u=${u}、v=${v} 同深但不同点，从大到小尝试同步上跳` }),
      description: '同步上跳',
      codeLine: 11,
    });

    for (let k = LOG - 1; k >= 0; k--) {
      const fu = full[u][k], fv = full[v][k];
      if (fu !== fv) {
        u = fu; v = fv;
        pu.push(u); pv.push(v);
        steps.push({
          state: snap({ phase: 'query', queryPair: [a, b], curU: u, curV: v, refU: pu[pu.length - 2], refV: pv[pv.length - 2], refK: k, pathU: [...pu], pathV: [...pv], message: `fa[${pu[pu.length - 2]}][${k}]=${fu} ≠ fa[${pv[pv.length - 2]}][${k}]=${fv}：同时上跳 2^${k}，u→${u}，v→${v}` }),
          description: `k=${k} 跳`,
          codeLine: 12,
        });
      } else {
        steps.push({
          state: snap({ phase: 'query', queryPair: [a, b], curU: u, curV: v, refU: u, refV: v, refK: k, pathU: [...pu], pathV: [...pv], message: `fa[${u}][${k}]=${fu} = fa[${v}][${k}]=${fv}：祖先相同，跳过（避免跳过 LCA）` }),
          description: `k=${k} 跳过`,
          codeLine: 12,
        });
      }
    }

    const ans = full[u][0];
    steps.push({
      state: snap({ phase: 'done', queryPair: [a, b], curU: u, curV: v, pathU: [...pu], pathV: [...pv], result: ans, message: `✅ u、v 已位于 LCA 正下方：LCA(${a}, ${b}) = fa[${u}][0] = ${ans}` }),
      description: `LCA = ${ans}`,
      codeLine: 13,
    });
  };

  runQuery(8, 9);
  runQuery(9, 5);

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

export function BinaryLiftingPanel() {
  const steps = useMemo(() => buildSteps(), []);
  const { pos, maxDepth } = useMemo(() => layoutTree(CHILDREN), []);

  const initial: BLState = {
    fa: Array.from({ length: N }, () => new Array(LOG).fill(-1)),
    fillK: -1, curU: -1, curV: -1, refU: -1, refV: -1, refK: -1,
    pathU: [], pathV: [], queryPair: null, phase: 'preprocess', result: null, message: '',
  };

  const X = 62, Y = 72, R = 17, PAD = 26;
  const width = (Math.max(...Array.from(pos.values()).map((p) => p.x)) + 1) * X + PAD;
  const height = (maxDepth + 1) * Y + PAD + 20;

  const nodeColor = (u: number, s: BLState) => {
    if (s.curU === u) return { fill: '#3b82f633', stroke: '#3b82f6', text: '#93c5fd' };
    if (s.curV === u) return { fill: '#a855f733', stroke: '#a855f7', text: '#d8b4fe' };
    if (s.pathU.includes(u) || s.pathV.includes(u)) return { fill: '#16a34a2e', stroke: '#16a34a', text: '#86efac' };
    if (s.result === u) return { fill: '#eab30833', stroke: '#eab308', text: '#fde047' };
    return { fill: '#1a1a1a', stroke: '#333', text: '#9ca3af' };
  };

  return (
    <Stepper<BLState>
      steps={steps}
      initialState={initial}
      codeLines={binaryLiftingCode}
      codeTitle="倍增·最近公共祖先 Binary Lifting LCA"
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            蓝色=u 及其路径，紫色=v 及其路径，绿色=已跳过的节点，黄色=LCA 结果
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg mx-auto">
            {CHILDREN.map((kids, u) =>
              kids.map((v) => {
                const a = pos.get(u)!, b = pos.get(v)!;
                const onPath = (state.pathU.includes(u) && state.pathU.includes(v)) || (state.pathV.includes(u) && state.pathV.includes(v));
                return (
                  <line
                    key={`${u}-${v}`}
                    x1={a.x * X + PAD} y1={a.y * Y + PAD}
                    x2={b.x * X + PAD} y2={b.y * Y + PAD}
                    stroke={onPath ? '#16a34a' : '#333'}
                    strokeWidth={onPath ? 2.5 : 1.5}
                  />
                );
              }),
            )}
            {Array.from(pos.entries()).map(([u, p]) => {
              const c = nodeColor(u, state);
              const cx = p.x * X + PAD, cy = p.y * Y + PAD;
              return (
                <g key={u}>
                  <circle cx={cx} cy={cy} r={R} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
                  <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill={c.text}>{u}</text>
                </g>
              );
            })}
          </svg>

          {/* 祖先表 */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">祖先表 fa[u][k]（u 的 2^k 级祖先，-1 表示不存在）:</div>
            <div className="overflow-x-auto">
              <table className="text-xs font-mono border-collapse mx-auto">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-gray-500">u \ k</th>
                    {Array.from({ length: LOG }, (_, k) => (
                      <th key={k} className={clsx('px-2 py-1 border border-edge-2', state.fillK === k || state.refK === k ? 'bg-yellow-500/20 text-yellow-300' : 'bg-surface-2 text-ink-3')}>
                        2^{k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: N }, (_, u) => (
                    <tr key={u}>
                      <td className={clsx('px-2 py-1 border border-edge-2 text-center', state.curU === u ? 'text-blue-300 font-bold' : state.curV === u ? 'text-purple-300 font-bold' : 'text-gray-400')}>{u}</td>
                      {Array.from({ length: LOG }, (_, k) => {
                        const isRef = (state.refU === u && state.refK === k) || (state.refV === u && state.refK === k);
                        const isFill = state.fillK === k;
                        return (
                          <td key={k} className={clsx('px-2 py-1 border border-edge-2 text-center', isRef ? 'bg-yellow-500/30 text-yellow-200 font-bold' : isFill ? 'bg-blue-500/10 text-blue-200' : state.fa[u][k] < 0 ? 'text-gray-600' : 'text-gray-300')}>
                            {state.fa[u][k]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {state.phase === 'done' && state.result !== null && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                LCA({state.queryPair?.[0]}, {state.queryPair?.[1]}) = {state.result}
              </span>
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
