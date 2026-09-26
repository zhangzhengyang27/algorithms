'use client';

import { useMemo } from 'react';
import { Stepper, type VizStep } from './stepper';

const tdcCode = [
  'function bfs(start, adj) {',
  '  const dist = new Array(adj.length).fill(-1);',
  '  const q = [start]; dist[start] = 0;',
  '  for (let i = 0; i < q.length; i++)',
  '    for (const v of adj[q[i]])',
  '      if (dist[v] < 0) { dist[v] = dist[q[i]] + 1; q.push(v); }',
  '  let best = start;',
  '  for (let u = 0; u < adj.length; u++)',
  '    if (dist[u] > dist[best]) best = u;',
  '  return { best, dist };',
  '}',
  '// 直径：两次 BFS，先找最远点 p，再从 p 找最远点 q',
  'const p = bfs(0, adj).best;',
  'const { best: q, dist: d2 } = bfs(p, adj);',
  'const diameter = d2[q];',
  '// 重心：删除后使最大连通块最小的节点',
  'function dfs(u, fa) {',
  '  size[u] = 1; let maxPart = 0;',
  '  for (const v of adj[u]) {',
  '    if (v === fa) continue;',
  '    dfs(v, u); size[u] += size[v];',
  '    maxPart = Math.max(maxPart, size[v]);',
  '  }',
  '  maxPart = Math.max(maxPart, n - size[u]);',
  '  if (maxPart < bestMax) { bestMax = maxPart; centroid = u; }',
  '}',
];

const CHILDREN: number[][] = [[1, 2], [3, 4], [5], [6, 7], [], [], [], []];
const N = 8;

function buildAdj(children: number[][]): number[][] {
  const adj: number[][] = Array.from({ length: children.length }, () => []);
  children.forEach((kids, u) => kids.forEach((v) => { adj[u].push(v); adj[v].push(u); }));
  return adj;
}

interface TDCState {
  dist: number[];
  bfsSource: number;
  visited: number[];
  current: number;
  farthest: number;
  p: number | null;
  q: number | null;
  diameter: number | null;
  diameterPath: number[];
  size: number[];
  maxPart: number[];
  centroid: number | null;
  bestMax: number | null;
  phase: 'bfs1' | 'bfs2' | 'centroid' | 'done';
  message: string;
}

function buildSteps(): VizStep<TDCState>[] {
  const steps: VizStep<TDCState>[] = [];
  const adj = buildAdj(CHILDREN);

  const base = (): TDCState => ({
    dist: new Array(N).fill(-1), bfsSource: -1, visited: [], current: -1, farthest: -1,
    p: null, q: null, diameter: null, diameterPath: [],
    size: new Array(N).fill(0), maxPart: new Array(N).fill(0),
    centroid: null, bestMax: null, phase: 'bfs1', message: '',
  });

  let st = base();
  const snap = (over: Partial<TDCState>): TDCState => ({ ...st, ...over });

  steps.push({
    state: snap({ message: '求树的直径：从任意点(0)出发 BFS 找最远点 p，再从 p 出发找最远点 q，dist(p,q) 即直径' }),
    description: '初始化',
    codeLine: 12,
  });

  // 通用 BFS，返回 {order, dist, parents, best}，并逐步记录 step
  const runBfs = (start: number, phase: 'bfs1' | 'bfs2', codeBase: number) => {
    const dist = new Array(N).fill(-1);
    const parents = new Array(N).fill(-1);
    const queue = [start];
    dist[start] = 0;
    const order: number[] = [];
    for (let i = 0; i < queue.length; i++) {
      const u = queue[i];
      order.push(u);
      for (const v of adj[u]) {
        if (dist[v] < 0) {
          dist[v] = dist[u] + 1;
          parents[v] = u;
          queue.push(v);
        }
      }
      st = { ...st, dist: [...dist], bfsSource: start, visited: [...order], current: u, phase };
      steps.push({
        state: snap({ message: `BFS 从 ${start}：访问 ${u}（dist=${dist[u]}），更新邻居距离` }),
        description: `访问 ${u}`,
        codeLine: codeBase,
      });
    }
    let best = start;
    for (let u = 0; u < N; u++) if (dist[u] > dist[best]) best = u;
    return { order, dist, parents, best };
  };

  // 第一次 BFS
  const r1 = runBfs(0, 'bfs1', 5);
  st = { ...st, farthest: r1.best, p: r1.best };
  steps.push({
    state: snap({ message: `第一次 BFS 结束：距 0 最远的点是 p = ${r1.best}（dist=${r1.dist[r1.best]}）` }),
    description: `最远点 p=${r1.best}`,
    codeLine: 12,
  });

  // 第二次 BFS
  const r2 = runBfs(r1.best, 'bfs2', 5);
  // 重构直径路径 q -> p
  const path: number[] = [];
  for (let x = r2.best; x !== -1; x = r2.parents[x]) path.push(x);
  st = { ...st, farthest: r2.best, q: r2.best, diameter: r2.dist[r2.best], diameterPath: path };
  steps.push({
    state: snap({ message: `第二次 BFS 结束：距 ${r1.best} 最远的点是 q = ${r2.best}，直径 = ${r2.dist[r2.best]}，路径 ${path.slice().reverse().join(' → ')}` }),
    description: `直径 = ${r2.dist[r2.best]}`,
    codeLine: 14,
  });

  // 重心
  st = { ...st, phase: 'centroid', current: -1, visited: [], dist: new Array(N).fill(-1) };
  steps.push({
    state: snap({ message: '求树的重心：DFS 计算子树大小 size[u]，重心是 max(最大子树, n-size[u]) 最小的节点' }),
    description: '开始求重心',
    codeLine: 16,
  });

  const size = new Array(N).fill(0);
  const maxPart = new Array(N).fill(0);
  let centroid = 0, bestMax = N;
  const postorder: number[] = [];
  const dfs = (u: number, fa: number) => {
    size[u] = 1;
    let mp = 0;
    for (const v of adj[u]) {
      if (v === fa) continue;
      dfs(v, u);
      size[u] += size[v];
      mp = Math.max(mp, size[v]);
    }
    mp = Math.max(mp, N - size[u]);
    maxPart[u] = mp;
    const prevBest = bestMax;
    const improved = mp < bestMax;
    if (improved) { bestMax = mp; centroid = u; }
    postorder.push(u);
    st = { ...st, size: [...size], maxPart: [...maxPart], current: u, centroid, bestMax, phase: 'centroid', visited: [...postorder] };
    steps.push({
      state: snap({ message: `节点 ${u}：size=${size[u]}，最大连通块 maxPart=${mp}${improved ? `，优于之前的 ${prevBest}，更新重心为 ${u}` : '，不更新重心'}` }),
      description: `size[${u}]=${size[u]}`,
      codeLine: improved ? 24 : 23,
    });
  };
  dfs(0, -1);

  st = { ...st, phase: 'done', current: -1 };
  steps.push({
    state: snap({ message: `✅ 重心 = ${centroid}（删除后最大连通块仅 ${bestMax} 个节点）；直径 = ${r2.dist[r2.best]}（${path.slice().reverse().join(' → ')}）` }),
    description: `重心 = ${centroid}`,
    codeLine: 24,
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

export function TreeDiameterCentroidPanel() {
  const steps = useMemo(() => buildSteps(), []);
  const { pos, maxDepth } = useMemo(() => layoutTree(CHILDREN), []);

  const initial: TDCState = {
    dist: new Array(N).fill(-1), bfsSource: -1, visited: [], current: -1, farthest: -1,
    p: null, q: null, diameter: null, diameterPath: [],
    size: new Array(N).fill(0), maxPart: new Array(N).fill(0),
    centroid: null, bestMax: null, phase: 'bfs1', message: '',
  };

  const X = 72, Y = 80, R = 18, PAD = 28;
  const width = (Math.max(...Array.from(pos.values()).map((p) => p.x)) + 1) * X + PAD;
  const height = (maxDepth + 1) * Y + PAD + 34;

  const nodeColor = (u: number, s: TDCState) => {
    if (s.phase === 'done' && s.centroid === u) return { fill: '#eab30833', stroke: '#eab308', text: '#fde047' };
    if (s.diameterPath.includes(u) && (s.q !== null)) return { fill: '#16a34a2e', stroke: '#16a34a', text: '#86efac' };
    if (s.centroid === u && s.phase === 'centroid') return { fill: '#eab30822', stroke: '#a16207', text: '#fbbf24' };
    if (s.current === u) return { fill: '#3b82f633', stroke: '#3b82f6', text: '#93c5fd' };
    if (s.farthest === u) return { fill: '#16a34a33', stroke: '#16a34a', text: '#86efac' };
    if (s.visited.includes(u)) return { fill: '#1e293b', stroke: '#475569', text: '#cbd5e1' };
    return { fill: '#1a1a1a', stroke: '#333', text: '#9ca3af' };
  };

  const label = (u: number, s: TDCState): string => {
    if (s.phase === 'centroid' || s.phase === 'done') return s.size[u] > 0 ? `sz=${s.size[u]}` : '';
    return s.dist[u] >= 0 ? `d=${s.dist[u]}` : '';
  };

  return (
    <Stepper<TDCState>
      steps={steps}
      initialState={initial}
      codeLines={tdcCode}
      codeTitle="树的直径与重心 Diameter & Centroid"
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            蓝色=当前访问，绿色=直径路径/最远点，黄色=重心。BFS 阶段显示距离 d，重心阶段显示子树大小 sz
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg mx-auto">
            {CHILDREN.map((kids, u) =>
              kids.map((v) => {
                const a = pos.get(u)!, b = pos.get(v)!;
                const onPath = state.diameterPath.includes(u) && state.diameterPath.includes(v) &&
                  state.diameterPath.indexOf(u) !== -1 && Math.abs(state.diameterPath.indexOf(u) - state.diameterPath.indexOf(v)) === 1;
                return (
                  <line
                    key={`${u}-${v}`}
                    x1={a.x * X + PAD} y1={a.y * Y + PAD}
                    x2={b.x * X + PAD} y2={b.y * Y + PAD}
                    stroke={onPath ? '#16a34a' : '#333'}
                    strokeWidth={onPath ? 3 : 1.5}
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
                  <text x={cx} y={cy + R + 13} textAnchor="middle" fontSize="9" fill="#9ca3af">{label(u, state)}</text>
                </g>
              );
            })}
          </svg>

          <div className="flex flex-wrap items-center gap-3 justify-center text-xs font-mono">
            {state.p !== null && <span className="px-2 py-1 rounded bg-blue-900/30 border border-blue-800 text-blue-300">p = {state.p}</span>}
            {state.q !== null && <span className="px-2 py-1 rounded bg-green-900/30 border border-green-800 text-green-300">q = {state.q}</span>}
            {state.diameter !== null && <span className="px-2 py-1 rounded bg-green-900/30 border border-green-800 text-green-300">直径 = {state.diameter}</span>}
            {state.centroid !== null && <span className="px-2 py-1 rounded bg-yellow-900/30 border border-yellow-800 text-yellow-300">重心 = {state.centroid}（最大块 {state.bestMax}）</span>}
          </div>

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
