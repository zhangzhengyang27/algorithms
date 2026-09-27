'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const ufCode = [
  'const parent = [0,1,2,3,4], dist = [0,0,0,0,0];',
  'function find(x) {',
  '  if (parent[x] !== x) {',
  '    const p = parent[x];',
  '    const root = find(p);',
  '    dist[x] += dist[p]; // 累加到根的距离',
  '    parent[x] = root;   // 路径压缩',
  '  }',
  '  return parent[x];',
  '}',
  'function union(a, b, w) { // 断言 d[a] - d[b] = w',
  '  const ra = find(a), rb = find(b);',
  '  if (ra === rb) return;',
  '  parent[ra] = rb;',
  '  dist[ra] = w + dist[b] - dist[a]; // 权值推导',
  '}',
  'function query(a, b) {',
  '  const ra = find(a), rb = find(b);',
  '  if (ra !== rb) return null; // 关系未知',
  '  return dist[a] - dist[b]; // d[a] - d[b]',
  '}',
];

const N = 5;

interface UFState {
  parent: number[];
  dist: number[];
  opA: number; opB: number; opW: number;
  opType: 'union' | 'query' | null;
  findPath: number[];
  compressed: number[];
  rootA: number; rootB: number;
  queryResult: number | null;
  phase: 'init' | 'union' | 'query' | 'done';
  message: string;
}

type UFOp = { type: 'union'; a: number; b: number; w: number } | { type: 'query'; a: number; b: number };
const DEFAULT_OPS: UFOp[] = [
  { type: 'union', a: 0, b: 1, w: -1 },
  { type: 'union', a: 1, b: 2, w: -1 },
  { type: 'query', a: 0, b: 2 },
  { type: 'union', a: 3, b: 0, w: 2 },
  { type: 'query', a: 3, b: 1 },
];

export function buildSteps(n: number = N, ops: UFOp[] = DEFAULT_OPS): VizStep<UFState>[] {
  const steps: VizStep<UFState>[] = [];
  const parent = Array.from({ length: n }, (_, i) => i);
  const dist = new Array(n).fill(0);

  const snap = (over: Partial<UFState>): UFState => ({
    parent: [...parent], dist: [...dist], opA: -1, opB: -1, opW: 0, opType: null,
    findPath: [], compressed: [], rootA: -1, rootB: -1, queryResult: null,
    phase: 'init', message: '',
    ...over,
  });

  const tracePath = (x: number): number[] => {
    const path = [x];
    let cur = x;
    while (parent[cur] !== cur) { cur = parent[cur]; path.push(cur); }
    return path;
  };

  const find = (x: number): number => {
    if (parent[x] !== x) {
      const p = parent[x];
      const root = find(p);
      dist[x] += dist[p];
      parent[x] = root;
    }
    return parent[x];
  };

  // 带可视化的 find：先展示路径，再展示压缩
  const detailedFind = (x: number): number => {
    const path = tracePath(x);
    if (path.length > 2) {
      steps.push({
        state: snap({ opType: 'query', findPath: [...path], phase: 'query', message: `find(${x}) 沿父指针上溯：${path.join(' → ')}（当前 dist 是到父节点的距离）` }),
        description: `find(${x}) 路径`,
        codeLine: 4,
      });
    }
    const root = find(x);
    if (path.length > 2) {
      steps.push({
        state: snap({ opType: 'query', findPath: [...path], compressed: [x], rootA: root, phase: 'query', message: `路径压缩：${x} 直接指向根 ${root}，dist[${x}] 累加为到根的总距离 = ${dist[x]}` }),
        description: `压缩 ${x}→${root}`,
        codeLine: 6,
      });
    }
    return root;
  };

  const unionOp = (a: number, b: number, w: number) => {
    const ra = find(a), rb = find(b);
    const da = dist[a]; // d[a] - d[ra]
    const db = dist[b]; // d[b] - d[rb]
    steps.push({
      state: snap({ opA: a, opB: b, opW: w, opType: 'union', rootA: ra, rootB: rb, phase: 'union', message: `union(${a}, ${b}, ${w})：断言 d[${a}] − d[${b}] = ${w}。find(${a})=${ra}（d[${a}]−d[${ra}]=${da}），find(${b})=${rb}（d[${b}]−d[${rb}]=${db}）` }),
      description: `union(${a},${b},${w})`,
      codeLine: 11,
    });
    if (ra === rb) return;
    parent[ra] = rb;
    dist[ra] = w + db - da;
    steps.push({
      state: snap({ opA: a, opB: b, opW: w, opType: 'union', rootA: ra, rootB: rb, compressed: [ra], phase: 'union', message: `合并：parent[${ra}]=${rb}，权值推导 dist[${ra}] = w + dist[${b}] − dist[${a}] = ${w} + ${db} − ${da} = ${dist[ra]}` }),
      description: `合并 ${ra}→${rb}`,
      codeLine: 14,
    });
  };

  const queryOp = (a: number, b: number) => {
    steps.push({
      state: snap({ opA: a, opB: b, opType: 'query', phase: 'query', message: `query(${a}, ${b})：求 d[${a}] − d[${b}]，先各自 find 到根` }),
      description: `query(${a},${b})`,
      codeLine: 17,
    });
    const ra = detailedFind(a);
    const da = dist[a];
    const rb = detailedFind(b);
    const db = dist[b];
    if (ra !== rb) {
      steps.push({
        state: snap({ opA: a, opB: b, opType: 'query', rootA: ra, rootB: rb, phase: 'query', message: `find(${a})=${ra}，find(${b})=${rb}，不同根 → 关系未知` }),
        description: '关系未知',
        codeLine: 18,
      });
      return;
    }
    const res = da - db;
    steps.push({
      state: snap({ opA: a, opB: b, opType: 'query', rootA: ra, rootB: rb, queryResult: res, phase: 'query', message: `✅ 同根 ${ra}：d[${a}] − d[${b}] = dist[${a}] − dist[${b}] = ${da} − ${db} = ${res}（${a} 比 ${b} ${res >= 0 ? '重' : '轻'} ${Math.abs(res)}）` }),
      description: `结果 = ${res}`,
      codeLine: 19,
    });
  };

  steps.push({
    state: snap({ message: '带权并查集：dist[x] 维护 x 到父节点的距离（权值），find 时路径压缩并累加，union 时推导新权值' }),
    description: '初始化',
    codeLine: 0,
  });

  for (const op of ops) {
    if (op.type === 'union') unionOp(op.a, op.b, op.w);
    else queryOp(op.a, op.b);
  }

  steps.push({
    state: snap({ phase: 'done', message: '完成：路径压缩保证近似 O(α(n)) 查询，权值在压缩时自动累加到根' }),
    description: '完成',
    codeLine: 5,
  });

  return steps;
}

export function UnionFindAdvancedPanel() {
  const steps = useMemo(() => buildSteps(), []);

  const initial: UFState = {
    parent: Array.from({ length: N }, (_, i) => i), dist: new Array(N).fill(0),
    opA: -1, opB: -1, opW: 0, opType: null, findPath: [], compressed: [],
    rootA: -1, rootB: -1, queryResult: null, phase: 'init', message: '',
  };

  const X = 95, Y = 78, R = 19, PADX = 50, PADY = 40;
  const width = (N - 1) * X + PADX * 2;
  const height = 2 * Y + PADY * 2 + 30;

  const getDepth = (x: number, parent: number[]): number => {
    let d = 0, cur = x;
    while (parent[cur] !== cur) { cur = parent[cur]; d++; }
    return d;
  };

  return (
    <Stepper<UFState>
      steps={steps}
      initialState={initial}
      codeLines={ufCode}
      codeTitle="带权并查集 Weighted Union-Find"
      render={(state) => {
        const pos = new Map<number, { x: number; y: number }>();
        for (let x = 0; x < N; x++) {
          pos.set(x, { x: x * X + PADX, y: getDepth(x, state.parent) * Y + PADY });
        }
        const nodeColor = (x: number) => {
          // 着色态的圆是 15–20% 透明色（浅色主题下=浅底），数字必须跟主题走；
          // 默认态是实心深色圆，数字固定用亮灰
          if (state.compressed.includes(x)) return { fill: '#16a34a2e', stroke: '#16a34a', text: 'var(--ink)' };
          if (state.opA === x) return { fill: '#eab30833', stroke: '#eab308', text: 'var(--ink)' };
          if (state.opB === x) return { fill: '#a855f733', stroke: '#a855f7', text: 'var(--ink)' };
          if (state.findPath.includes(x)) return { fill: '#3b82f626', stroke: '#3b82f6', text: 'var(--ink)' };
          if (state.rootA === x || state.rootB === x) return { fill: '#0ea5e926', stroke: '#0ea5e9', text: 'var(--ink)' };
          return { fill: '#1a1a1a', stroke: '#333', text: '#9ca3af' };
        };
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">
              黄色=a、紫色=b、蓝色=find 路径、绿色=刚压缩/合并的节点。边上的数字 = dist（到父节点的距离）
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl mx-auto">
              {/* edges */}
              {Array.from({ length: N }, (_, x) => x).filter((x) => state.parent[x] !== x).map((x) => {
                const a = pos.get(x)!, b = pos.get(state.parent[x])!;
                const isCompressed = state.compressed.includes(x);
                const inPath = state.findPath.includes(x) && state.findPath.includes(state.parent[x]);
                const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
                return (
                  <g key={`e${x}`}>
                    <line x1={a.x} y1={a.y - R} x2={b.x} y2={b.y + R} stroke={isCompressed ? '#16a34a' : inPath ? '#3b82f6' : '#444'} strokeWidth={isCompressed || inPath ? 2.5 : 1.5} />
                    <rect x={mx - 14} y={my - 9} width={28} height={16} rx={4} fill="#1a1a1a" stroke={isCompressed ? '#16a34a' : '#444'} strokeWidth={1} />
                    <text x={mx} y={my + 3} textAnchor="middle" fontSize="9" fontWeight="bold" fill={isCompressed ? '#86efac' : '#9ca3af'}>{state.dist[x]}</text>
                  </g>
                );
              })}
              {/* nodes */}
              {Array.from({ length: N }, (_, x) => x).map((x) => {
                const p = pos.get(x)!;
                const c = nodeColor(x);
                const isRoot = state.parent[x] === x;
                return (
                  <g key={`n${x}`}>
                    <circle cx={p.x} cy={p.y} r={R} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
                    <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="13" fontWeight="bold" style={{ fill: c.text }}>{x}</text>
                    {isRoot && <text x={p.x} y={p.y - R - 6} textAnchor="middle" fontSize="8" style={{ fill: 'var(--brand)' }}>根</text>}
                  </g>
                );
              })}
            </svg>

            {/* 当前操作 */}
            {state.opType && (
              <div className="flex items-center gap-2 justify-center text-xs font-mono">
                <span className={clsx('px-2 py-1 rounded border', state.opType === 'union' ? 'bg-orange-900/30 border-orange-700 text-orange-300' : 'bg-blue-900/30 border-blue-700 text-blue-300')}>
                  {state.opType === 'union' ? `union(${state.opA}, ${state.opB}, ${state.opW})` : `query(${state.opA}, ${state.opB})`}
                </span>
                {state.opType === 'union' && <span className="text-gray-500">断言 d[{state.opA}] − d[{state.opB}] = {state.opW}</span>}
              </div>
            )}

            {state.queryResult !== null && (
              <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <span className="text-green-300 font-mono text-sm">
                  d[{state.opA}] − d[{state.opB}] = {state.queryResult}
                </span>
              </div>
            )}

            {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
          </div>
        );
      }}
    />
  );
}
