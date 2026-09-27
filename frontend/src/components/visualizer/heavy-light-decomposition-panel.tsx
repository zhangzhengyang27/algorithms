'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const hldCode = [
  'function dfs1(u, fa) {',
  '  size[u] = 1; depth[u] = fa < 0 ? 0 : depth[fa] + 1; par[u] = fa;',
  '  for (const v of children[u]) {',
  '    dfs1(v, u); size[u] += size[v];',
  '    if (heavy[u] < 0 || size[v] > size[heavy[u]]) heavy[u] = v;',
  '  }',
  '}',
  'function dfs2(u, topNode) {',
  '  top[u] = topNode; dfn[u] = cnt++;',
  '  if (heavy[u] >= 0) dfs2(heavy[u], topNode); // 先走重儿子，链上 dfn 连续',
  '  for (const v of children[u])',
  '    if (v !== heavy[u]) dfs2(v, v); // 轻儿子新开一条链',
  '}',
  'function pathQuery(u, v) {',
  '  let res = 0;',
  '  while (top[u] !== top[v]) {',
  '    if (depth[top[u]] < depth[top[v]]) [u, v] = [v, u];',
  '    res += segQuery(dfn[top[u]], dfn[u]); // 整条重链一段区间',
  '    u = par[top[u]]; // 跳到链顶的父节点（轻边）',
  '  }',
  '  if (depth[u] > depth[v]) [u, v] = [v, u];',
  '  res += segQuery(dfn[u], dfn[v]); // 同链最后一段',
  '  return res;',
  '}',
];

const CHILDREN: number[][] = [[1, 2, 3], [4, 5], [], [6], [7, 8], [], [9], [], [], [10], []];
const VAL = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
const N = 11;

const CHAIN_COLORS = ['#3b82f6', '#a855f7', '#f97316', '#14b8a6', '#ec4899', '#eab308', '#22c55e', '#ef4444'];

interface HLDState {
  size: number[];
  depth: number[];
  heavy: number[];
  top: number[];
  dfn: number[];
  chainId: number[];
  current: number;
  curU: number;
  curV: number;
  collected: number[];
  segNodes: number[]; // 当前正在收集的重链段节点
  phase: 'dfs1' | 'dfs2' | 'query' | 'done';
  result: number | null;
  message: string;
}

export function buildSteps(children: number[][] = CHILDREN, val: number[] = VAL, queryPair: [number, number] = [8, 10]): VizStep<HLDState>[] {
  const n = children.length;
  const badMsg = (() => {
    if (n === 0 || val.length !== n) return `孩子表长度 ${n} 与权值长度 ${val.length} 不匹配或为空`;
    const parents = new Array(n).fill(0);
    for (const kids of children) for (const v of kids) {
      if (v < 0 || v >= n) return `孩子下标 ${v} 越出 [0, ${n - 1}]`;
      parents[v]++;
    }
    if (parents[0] !== 0) return '根节点 0 出现了父边，不是以 0 为根的树';
    for (let v = 1; v < n; v++) if (parents[v] !== 1) return `节点 ${v} 有 ${parents[v]} 条父边，不是树`;
    const up = new Array(n).fill(-1);
    children.forEach((kids, u) => kids.forEach((v) => { up[v] = u; }));
    for (let v = 0; v < n; v++) {
      let x = v, hops = 0;
      while (x !== 0 && hops++ <= n) x = up[x];
      if (x !== 0) return `节点 ${v} 到不了根 0（存在环或孤立子树）`;
    }
    if (queryPair.some((x) => x < 0 || x >= n)) return `查询对 ${JSON.stringify(queryPair)} 越出节点范围`;
    return null;
  })();
  if (badMsg) {
    return [{
      state: {
        size: new Array(n).fill(0), depth: new Array(n).fill(0), heavy: new Array(n).fill(-1), top: new Array(n).fill(-1),
        dfn: new Array(n).fill(-1), chainId: new Array(n).fill(-1), current: -1, curU: -1, curV: -1,
        collected: [], segNodes: [], phase: 'done', result: null, message: `输入不合法：${badMsg}`,
      },
      description: '输入不合法',
      codeLine: 1,
    }];
  }
  const steps: VizStep<HLDState>[] = [];
  const size = new Array(n).fill(0);
  const depth = new Array(n).fill(0);
  const heavy = new Array(n).fill(-1);
  const top = new Array(n).fill(-1);
  const dfn = new Array(n).fill(-1);
  const par = new Array(n).fill(-1);
  const chainId = new Array(n).fill(-1);
  let cnt = 0;
  let chainCount = 0;

  const snap = (over: Partial<HLDState>): HLDState => ({
    size: [...size], depth: [...depth], heavy: [...heavy], top: [...top], dfn: [...dfn],
    chainId: [...chainId], current: -1, curU: -1, curV: -1, collected: [], segNodes: [],
    phase: 'dfs1', result: null, message: '',
    ...over,
  });

  steps.push({
    state: snap({ message: '树链剖分：dfs1 求子树大小与重儿子，dfs2 划分重链并分配 dfs 序' }),
    description: '初始化',
    codeLine: 1,
  });

  // dfs1
  const dfs1 = (u: number, fa: number) => {
    size[u] = 1; depth[u] = fa < 0 ? 0 : depth[fa] + 1; par[u] = fa;
    for (const v of children[u]) {
      dfs1(v, u);
      size[u] += size[v];
      if (heavy[u] < 0 || size[v] > size[heavy[u]]) heavy[u] = v;
    }
    steps.push({
      state: snap({ current: u, message: `节点 ${u}：size=${size[u]}，重儿子 heavy=${heavy[u] >= 0 ? heavy[u] : '无'}${heavy[u] >= 0 ? `（子树最大 ${size[heavy[u]]}）` : ''}` }),
      description: `size[${u}]=${size[u]}`,
      codeLine: 4,
    });
  };
  dfs1(0, -1);

  steps.push({
    state: snap({ phase: 'dfs2', message: 'dfs1 完成。dfs2：从根出发，优先走重儿子，使每条重链的 dfn 连续' }),
    description: '开始 dfs2',
    codeLine: 8,
  });

  // dfs2
  const dfs2 = (u: number, topNode: number) => {
    top[u] = topNode; dfn[u] = cnt++;
    if (u === topNode) {
      chainId[u] = chainCount++;
    } else {
      chainId[u] = chainId[topNode];
    }
    if (heavy[u] >= 0) dfs2(heavy[u], topNode);
    for (const v of children[u]) if (v !== heavy[u]) dfs2(v, v);
    steps.push({
      state: snap({ phase: 'dfs2', current: u, message: `节点 ${u}：dfn=${dfn[u]}，链顶 top=${top[u]}${top[u] === u ? '（新链起点）' : `（属于链 ${top[u]}）`}` }),
      description: `dfn[${u}]=${dfn[u]}`,
      codeLine: top[u] === u ? 11 : 9,
    });
  };
  dfs2(0, 0);

  steps.push({
    state: snap({ phase: 'dfs2', message: '剖分完成：重链 [0→1→4→7] 与 [3→6→9→10]，其余为单点链。开始路径查询 8 → 10' }),
    description: '剖分完成',
    codeLine: 13,
  });

  // pathQuery(8, 10)
  let u = queryPair[0], v = queryPair[1];
  const collected: number[] = [];
  steps.push({
    state: snap({ phase: 'query', curU: u, curV: v, message: `查询路径 ${u} → ${v} 的节点权值和（val=[${val.join(',')}]）` }),
    description: '路径查询',
    codeLine: 14,
  });

  while (top[u] !== top[v]) {
    if (depth[top[u]] < depth[top[v]]) {
      [u, v] = [v, u];
      steps.push({
        state: snap({ phase: 'query', curU: u, curV: v, collected: [...collected], message: `链顶深度 depth[top[${v}]] 较浅，交换 u=${u}、v=${v}，保证 u 所在链顶更深` }),
        description: '交换 u/v',
        codeLine: 16,
      });
    }
    // 收集链段 top[u] .. u
    const seg: number[] = [];
    for (let x = u; x !== top[u]; x = par[x]) seg.push(x);
    seg.push(top[u]);
    const segSum = seg.reduce((s, x) => s + val[x], 0);
    for (const x of seg) if (!collected.includes(x)) collected.push(x);
    steps.push({
      state: snap({ phase: 'query', curU: u, curV: v, collected: [...collected], segNodes: [...seg], message: `收集重链段 [${top[u]}..${u}]（dfn ${dfn[top[u]]}..${dfn[u]}）：节点 ${seg.slice().reverse().join('→')}，段和=${segSum}` }),
      description: `链段 ${top[u]}→${u}`,
      codeLine: 17,
    });
    const oldU = u;
    u = par[top[u]];
    steps.push({
      state: snap({ phase: 'query', curU: u, curV: v, collected: [...collected], message: `沿轻边上跳：u = par[top[${oldU}]] = par[${top[oldU]}] = ${u}` }),
      description: `u 跳到 ${u}`,
      codeLine: 18,
    });
  }

  if (depth[u] > depth[v]) [u, v] = [v, u];
  const seg: number[] = [];
  for (let x = v; x !== u; x = par[x]) seg.push(x);
  seg.push(u);
  for (const x of seg) if (!collected.includes(x)) collected.push(x);
  const total = collected.reduce((s, x) => s + val[x], 0);
  steps.push({
    state: snap({ phase: 'query', curU: u, curV: v, collected: [...collected], segNodes: [...seg], message: `u=${u}、v=${v} 已在同一条链 ${top[u]} 上，收集最后一段 [${u}..${v}]：节点 ${seg.slice().reverse().join('→')}` }),
    description: `同链段 ${u}→${v}`,
    codeLine: 21,
  });

  steps.push({
    state: snap({ phase: 'done', curU: u, curV: v, collected: [...collected], result: total, message: `✅ 路径 ${u}→${v} 共 ${collected.length} 个节点，权值和 = ${collected.map((x) => val[x]).join('+')} = ${total}` }),
    description: `结果 = ${total}`,
    codeLine: 22,
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

export function HeavyLightDecompositionPanel() {
  const steps = useMemo(() => buildSteps(), []);
  const { pos, maxDepth } = useMemo(() => layoutTree(CHILDREN), []);

  const initial: HLDState = {
    size: new Array(N).fill(0), depth: new Array(N).fill(0), heavy: new Array(N).fill(-1),
    top: new Array(N).fill(-1), dfn: new Array(N).fill(-1), chainId: new Array(N).fill(-1),
    current: -1, curU: -1, curV: -1, collected: [], segNodes: [],
    phase: 'dfs1', result: null, message: '',
  };

  const X = 58, Y = 78, R = 16, PAD = 26;
  const width = (Math.max(...Array.from(pos.values()).map((p) => p.x)) + 1) * X + PAD;
  const height = (maxDepth + 1) * Y + PAD + 30;

  const chainColor = (u: number, s: HLDState) => (s.chainId[u] >= 0 ? CHAIN_COLORS[s.chainId[u] % CHAIN_COLORS.length] : '#333');

  return (
    <Stepper<HLDState>
      steps={steps}
      initialState={initial}
      codeLines={hldCode}
      codeTitle="树链剖分 Heavy-Light Decomposition"
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            粗边=重边（同色为一条重链），细灰边=轻边。查询时蓝色=u、紫色=v、绿色=已收集的路径节点
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl mx-auto">
            {CHILDREN.map((kids, u) =>
              kids.map((v) => {
                const a = pos.get(u)!, b = pos.get(v)!;
                const isHeavy = state.heavy[u] === v;
                const cc = chainColor(v, state);
                return (
                  <line
                    key={`${u}-${v}`}
                    x1={a.x * X + PAD} y1={a.y * Y + PAD}
                    x2={b.x * X + PAD} y2={b.y * Y + PAD}
                    stroke={isHeavy && state.chainId[v] >= 0 ? cc : '#333'}
                    strokeWidth={isHeavy && state.chainId[v] >= 0 ? 3.5 : 1.5}
                  />
                );
              }),
            )}
            {Array.from(pos.entries()).map(([u, p]) => {
              const cx = p.x * X + PAD, cy = p.y * Y + PAD;
              const cc = chainColor(u, state);
              const isU = state.curU === u, isV = state.curV === u;
              const inPath = state.collected.includes(u);
              const inSeg = state.segNodes.includes(u);
              const stroke = isU ? '#3b82f6' : isV ? '#a855f7' : inSeg ? '#22c55e' : state.chainId[u] >= 0 ? cc : '#333';
              const fill = isU ? '#3b82f633' : isV ? '#a855f733' : inPath ? '#16a34a2e' : state.chainId[u] >= 0 ? `${cc}22` : '#1a1a1a';
              return (
                <g key={u}>
                  <circle cx={cx} cy={cy} r={R} fill={fill} stroke={stroke} strokeWidth={inSeg ? 3 : 2} />
                  <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#e5e7eb">{u}</text>
                  <text x={cx} y={cy + R + 12} textAnchor="middle" fontSize="8" fill="#9ca3af">
                    {state.dfn[u] >= 0 ? `dfn=${state.dfn[u]}` : state.size[u] > 0 ? `sz=${state.size[u]}` : ''}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* dfs 序数组 */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">dfs 序（同色=同一条重链，绿色=查询已收集）:</div>
            <div className="flex gap-1 flex-wrap justify-center">
              {Array.from({ length: N }, (_, i) => i)
                .filter((u) => state.dfn[u] >= 0)
                .sort((a, b) => state.dfn[a] - state.dfn[b])
                .map((u) => {
                  const cc = chainColor(u, state);
                  const inPath = state.collected.includes(u);
                  const inSeg = state.segNodes.includes(u);
                  return (
                    <div
                      key={u}
                      className={clsx('w-11 h-12 flex flex-col items-center justify-center rounded text-xs font-mono border transition-all', inSeg ? 'border-green-400 scale-105' : inPath ? 'border-green-700' : 'border-edge-2')}
                      style={{ background: inPath ? '#16a34a2e' : `${cc}1a`, borderColor: inSeg ? undefined : inPath ? undefined : `${cc}66` }}
                    >
                      <span className="text-gray-300 font-bold">{u}</span>
                      <span className="text-[9px] text-gray-500">dfn {state.dfn[u]}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {state.phase === 'done' && state.result !== null && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">路径 8→10 权值和 = {state.result}</span>
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
