'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const bipartiteCode = [
  'function bipartiteMatch(n, edges) {',
  '  const adj = Array.from({ length: n }, () => []);',
  '  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }',
  '  const color = new Array(n).fill(0);   // 0未染色 1/2两色',
  '  for (let s = 0; s < n; s++) {',
  '    if (color[s]) continue;',
  '    color[s] = 1;',
  '    const q = [s];',
  '    while (q.length) {',
  '      const u = q.shift();',
  '      for (const v of adj[u]) {',
  '        if (!color[v]) { color[v] = 3 - color[u]; q.push(v); }',
  '        else if (color[v] === color[u]) return false;  // 不是二分图',
  '      }',
  '    }',
  '  }',
  '  // 匈牙利算法求最大匹配（左集 = 颜色1）',
  '  const matchR = new Array(n).fill(-1);',
  '  const dfs = (u, seen) => {',
  '    for (const v of adj[u]) {',
  '      if (seen[v]) continue;',
  '      seen[v] = true;',
  '      if (matchR[v] === -1 || dfs(matchR[v], seen)) { matchR[v] = u; return true; }',
  '    }',
  '    return false;',
  '  };',
  '  let matching = 0;',
  '  for (let u = 0; u < n; u++) {',
  '    if (color[u] !== 1) continue;',
  '    if (dfs(u, new Array(n).fill(false))) matching++;',
  '  }',
  '  return matching;',
  '}',
];

const LEFT = [0, 1, 2];
const RIGHT = [3, 4, 5];
const DEFAULT_EDGES: [number, number][] = [[0, 3], [0, 4], [1, 3], [1, 5], [2, 4], [2, 5]];

interface BipartiteState {
  n: number;
  edges: [number, number][];
  color: number[];
  queue: number[];
  current: number;
  matchR: number[];
  augmentPath: number[];
  currentLeft: number;
  phase: 'init' | 'color' | 'bipartite' | 'match' | 'done';
  matchingCount: number;
  message: string;
}

function buildSteps(n: number, edges: [number, number][]): VizStep<BipartiteState>[] {
  const steps: VizStep<BipartiteState>[] = [];
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const color = new Array(n).fill(0);
  const queue: number[] = [];
  const matchR = new Array(n).fill(-1);
  let matchingCount = 0;

  const snap = (extra: Partial<BipartiteState> & { message: string }): BipartiteState => ({
    n, edges,
    color: [...color], queue: [...queue], current: -1,
    matchR: [...matchR], augmentPath: [], currentLeft: -1,
    phase: 'init', matchingCount,
    ...extra,
  });

  steps.push({
    state: snap({ message: '建图，所有节点初始未染色（0）。下面用 BFS 染色法判定二分图' }),
    description: '初始化',
    codeLine: 3,
  });

  for (let s = 0; s < n; s++) {
    if (color[s]) continue;
    color[s] = 1;
    queue.push(s);
    steps.push({
      state: snap({ current: s, phase: 'color', message: `从节点 ${s} 开始 BFS，染颜色 1，入队` }),
      description: `BFS起点${s}`,
      codeLine: 6,
    });
    while (queue.length) {
      const u = queue.shift()!;
      const actions: string[] = [];
      for (const v of adj[u]) {
        if (!color[v]) {
          color[v] = 3 - color[u];
          queue.push(v);
          actions.push(`邻居 ${v} 染颜色 ${color[v]} 入队`);
        } else if (color[v] === color[u]) {
          actions.push(`邻居 ${v} 同色 → 冲突！`);
        } else {
          actions.push(`邻居 ${v} 已染异色，合法`);
        }
      }
      steps.push({
        state: snap({ current: u, phase: 'color', message: `处理 u=${u}（颜色${color[u]}）：${actions.join('；')}` }),
        description: `染色${u}`,
        codeLine: 11,
      });
    }
  }

  const leftNodes = color.map((c, i) => (c === 1 ? i : -1)).filter((i) => i >= 0);
  steps.push({
    state: snap({ phase: 'bipartite', message: `染色完成无冲突，是二分图。左集 = {${leftNodes.join(',')}}（颜色1），右集 = 颜色2` }),
    description: '是二分图',
    codeLine: 16,
  });

  steps.push({
    state: snap({ phase: 'match', message: '匈牙利算法：依次为每个左集节点寻找增广路径' }),
    description: '开始匹配',
    codeLine: 17,
  });

  function dfs(u: number, seen: boolean[], path: number[]): boolean {
    for (const v of adj[u]) {
      if (seen[v]) continue;
      seen[v] = true;
      path.push(u, v);
      if (matchR[v] === -1 || dfs(matchR[v], seen, path)) {
        matchR[v] = u;
        return true;
      }
      path.pop();
      path.pop();
    }
    return false;
  }

  for (const u of leftNodes) {
    const seen = new Array(n).fill(false);
    const path: number[] = [];
    const oldMatch = [...matchR];
    const found = dfs(u, seen, path);
    if (found) {
      matchingCount++;
      steps.push({
        state: snap({ matchR: oldMatch, currentLeft: u, augmentPath: [...path], phase: 'match', message: `为 ${u} 找到增广路径：${path.join(' → ')}` }),
        description: `增广${u}`,
        codeLine: 22,
      });
      steps.push({
        state: snap({ currentLeft: u, augmentPath: [...path], phase: 'match', message: `沿增广路径翻转匹配边，匹配数 = ${matchingCount}` }),
        description: `匹配=${matchingCount}`,
        codeLine: 22,
      });
    } else {
      steps.push({
        state: snap({ currentLeft: u, phase: 'match', message: `节点 ${u} 无法找到增广路径，跳过` }),
        description: `${u}失败`,
        codeLine: 24,
      });
    }
  }

  steps.push({
    state: snap({ phase: 'done', message: `最大匹配 = ${matchingCount}，匹配边：${matchR.map((u, v) => (u !== -1 ? `${u}-${v}` : null)).filter(Boolean).join(', ')}` }),
    description: `结果=${matchingCount}`,
    codeLine: 31,
  });
  return steps;
}

const NODE_POS: Record<number, { x: number; y: number }> = {
  0: { x: 80, y: 60 }, 1: { x: 80, y: 150 }, 2: { x: 80, y: 240 },
  3: { x: 340, y: 60 }, 4: { x: 340, y: 150 }, 5: { x: 340, y: 240 },
};

export function BipartiteGraphPanel() {
  const n = 6;
  const edges = DEFAULT_EDGES;
  const steps = useMemo(() => buildSteps(n, edges), [n, edges]);

  const initial: BipartiteState = {
    n, edges, color: new Array(n).fill(0), queue: [], current: -1,
    matchR: new Array(n).fill(-1), augmentPath: [], currentLeft: -1,
    phase: 'init', matchingCount: 0, message: '',
  };

  const colorStyle = (c: number) =>
    c === 1 ? { fill: '#3b82f62e', stroke: '#3b82f6', text: '#93c5fd' }
      : c === 2 ? { fill: '#f973162e', stroke: '#f97316', text: '#fdba74' }
        : { fill: '#1a1a1a', stroke: '#444', text: '#9ca3af' };

  return (
    <Stepper<BipartiteState>
      steps={steps}
      initialState={initial}
      codeLines={bipartiteCode}
      codeTitle="二分图 Bipartite Graph"
      render={(state) => {
        const augmentKeys = new Set<string>();
        for (let i = 0; i + 1 < state.augmentPath.length; i += 2) {
          augmentKeys.add(`${state.augmentPath[i]}-${state.augmentPath[i + 1]}`);
        }
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">
              蓝色=颜色1（左集），橙色=颜色2（右集），绿色粗边=匹配边，黄色虚线=增广路径
            </div>

            <svg viewBox="0 0 420 300" className="w-full max-w-md mx-auto">
              <text x={80} y={20} textAnchor="middle" fontSize="11" fill="#6b7280">左集</text>
              <text x={340} y={20} textAnchor="middle" fontSize="11" fill="#6b7280">右集</text>
              {state.edges.map(([u, v], i) => {
                const a = NODE_POS[u], b = NODE_POS[v];
                const key = `${u}-${v}`;
                const isMatch = state.matchR[v] === u;
                const isAug = augmentKeys.has(key);
                return (
                  <line
                    key={i}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={isAug ? '#eab308' : isMatch ? '#16a34a' : '#444'}
                    strokeWidth={isMatch || isAug ? 3 : 1.5}
                    strokeDasharray={isAug && !isMatch ? '5 4' : undefined}
                  />
                );
              })}
              {Array.from({ length: state.n }, (_, i) => i).map((i) => {
                const p = NODE_POS[i];
                const cs = colorStyle(state.color[i]);
                const isCurrent = i === state.current || i === state.currentLeft;
                return (
                  <g key={i}>
                    <circle
                      cx={p.x} cy={p.y} r={18}
                      fill={cs.fill} stroke={cs.stroke} strokeWidth={2}
                      className={isCurrent ? 'ring-2' : ''}
                    />
                    {isCurrent && <circle cx={p.x} cy={p.y} r={23} fill="none" stroke="#eab308" strokeWidth={2} />}
                    <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="13" fontWeight="bold" fill={cs.text}>{i}</text>
                  </g>
                );
              })}
            </svg>

            <div className="flex flex-wrap gap-3 text-xs font-mono">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">color:</span>
                {state.color.map((c, i) => (
                  <span key={i} className={clsx('px-1.5 py-0.5 rounded border', c === 1 ? 'bg-blue-500/15 border-blue-500/50 text-blue-200' : c === 2 ? 'bg-orange-500/15 border-orange-500/50 text-orange-200' : 'bg-surface-2 border-edge-2 text-ink-3')}>{c}</span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">匹配数:</span>
                <span className="text-green-300">{state.matchingCount}</span>
              </div>
              {state.augmentPath.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">增广路径:</span>
                  <span className="text-yellow-300">{state.augmentPath.join(' → ')}</span>
                </div>
              )}
            </div>

            {state.phase === 'done' && (
              <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <span className="text-green-300 font-mono text-sm">最大匹配 = {state.matchingCount}</span>
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
