'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const graphCode = [
  'const graph = {',
  '  0: [1, 2], 1: [0, 3, 4],',
  '  2: [0, 4], 3: [1, 4], 4: [1, 2, 3],',
  '};',
  'function bfs(start) {',
  '  const visited = new Set([start]);',
  '  const queue = [start], order = [];',
  '  while (queue.length) {',
  '    const u = queue.shift();',
  '    order.push(u);',
  '    for (const v of graph[u])',
  '      if (!visited.has(v)) {',
  '        visited.add(v);',
  '        queue.push(v);',
  '      }',
  '  }',
  '  return order;',
  '}',
  'function dfs(u, visited = new Set(), order = []) {',
  '  visited.add(u);',
  '  order.push(u);',
  '  for (const v of graph[u])',
  '    if (!visited.has(v)) dfs(v, visited, order);',
  '  return order;',
  '}',
];

const N = 5;
const EDGES: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [3, 4]];
const ADJ: number[][] = [[1, 2], [0, 3, 4], [0, 4], [1, 4], [1, 2, 3]];
const POS: [number, number][] = [[150, 36], [52, 110], [248, 110], [82, 210], [218, 210]];

const edgeKey = (u: number, v: number) => `${Math.min(u, v)}-${Math.max(u, v)}`;

type GPhase = 'storage' | 'bfs' | 'dfs';

interface GraphState {
  phase: GPhase;
  builtEdges: number;
  visited: number[];
  queue: number[];
  stack: number[];
  order: number[];
  current: number | null;
  activeEdge: string | null;
  message: string;
}

function snap(
  phase: GPhase, builtEdges: number, visited: Set<number>, queue: number[],
  stack: number[], order: number[], current: number | null, activeEdge: string | null, message: string,
): GraphState {
  return { phase, builtEdges, visited: [...visited], queue: [...queue], stack: [...stack], order: [...order], current, activeEdge, message };
}

export function buildSteps(start: number): VizStep<GraphState>[] {
  const steps: VizStep<GraphState>[] = [];
  const empty = new Set<number>();

  // ---- storage ----
  steps.push({
    state: snap('storage', 0, empty, [], [], [], null, null, `无向图 G 有 ${N} 个顶点、${EDGES.length} 条边，下面用邻接矩阵和邻接表两种方式存储`),
    description: '两种存储方式',
    codeLine: 0,
  });
  EDGES.forEach(([u, v], k) => {
    steps.push({
      state: snap('storage', k + 1, empty, [], [], [], null, edgeKey(u, v), `加入边 (${u},${v})：矩阵 matrix[${u}][${v}] = matrix[${v}][${u}] = 1；邻接表 adj[${u}] 追加 ${v}、adj[${v}] 追加 ${u}`),
      description: `存储边 (${u},${v})`,
      codeLine: u <= 1 ? 1 : 2,
    });
  });

  // ---- BFS ----
  const visited = new Set<number>([start]);
  const queue: number[] = [start];
  const order: number[] = [];
  steps.push({
    state: snap('bfs', EDGES.length, visited, queue, [], order, start, null, `BFS 从 ${start} 出发：起点入队并标记已访问，queue = [${queue}]`),
    description: 'BFS 起点入队',
    codeLine: 6,
  });
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    steps.push({
      state: snap('bfs', EDGES.length, visited, queue, [], order, u, null, `队首 ${u} 出队并访问，order = [${order}]`),
      description: `出队访问 ${u}`,
      codeLine: 9,
    });
    const fresh: number[] = [];
    const skipped: number[] = [];
    for (const v of ADJ[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
        fresh.push(v);
        steps.push({
          state: snap('bfs', EDGES.length, visited, queue, [], order, u, edgeKey(u, v), `邻居 ${v} 未访问过：标记并入队，queue = [${queue}]`),
          description: `${v} 入队`,
          codeLine: 13,
        });
      } else {
        skipped.push(v);
      }
    }
    if (skipped.length && !fresh.length) {
      steps.push({
        state: snap('bfs', EDGES.length, visited, queue, [], order, u, null, `${u} 的邻居 [${ADJ[u]}] 均已访问，跳过`),
        description: `${u} 邻居已访问`,
        codeLine: 11,
      });
    }
  }
  steps.push({
    state: snap('bfs', EDGES.length, visited, queue, [], order, null, null, `队列为空，BFS 结束，遍历序列 = [${order}]（按层扩散）`),
    description: 'BFS 完成',
    codeLine: 16,
  });

  // ---- DFS ----
  const dVisited = new Set<number>();
  const dStack: number[] = [];
  const dOrder: number[] = [];
  const walk = (u: number, parent: number | null) => {
    dVisited.add(u);
    dStack.push(u);
    dOrder.push(u);
    steps.push({
      state: snap('dfs', EDGES.length, dVisited, [], dStack, dOrder, u, parent !== null ? edgeKey(parent, u) : null, `递归进入 dfs(${u})：访问 ${u}，压入递归栈，stack = [${dStack}]`),
      description: `访问 ${u}`,
      codeLine: 20,
    });
    for (const v of ADJ[u]) {
      if (!dVisited.has(v)) {
        walk(v, u);
      }
    }
    dStack.pop();
    steps.push({
      state: snap('dfs', EDGES.length, dVisited, [], dStack, dOrder, dStack[dStack.length - 1] ?? null, null, `${u} 的所有邻居处理完毕，递归返回${dStack.length ? `，回到 ${dStack[dStack.length - 1]}` : '，栈空'}`),
      description: `${u} 返回`,
      codeLine: 23,
    });
  };
  walk(start, null);
  steps.push({
    state: snap('dfs', EDGES.length, dVisited, [], dStack, dOrder, null, null, `DFS 结束，遍历序列 = [${dOrder}]（一条路走到底再回溯）`),
    description: 'DFS 完成',
    codeLine: 23,
  });

  return steps;
}

export function GraphStorageTraversalPanel() {
  const [start, setStart] = useState(0);

  const steps = useMemo(() => buildSteps(start), [start]);
  const initial: GraphState = snap('storage', 0, new Set<number>(), [], [], [], null, null, '');

  return (
    <Stepper<GraphState>
      steps={steps}
      initialState={initial}
      codeLines={graphCode}
      codeTitle="图的存储与遍历 Graph Storage & Traversal"
      headerActions={
        <>
          <span className="text-sm text-gray-400">起点:</span>
          <select
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm"
          >
            {[0, 1, 2, 3, 4].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </>
      }
      render={(state) => {
        const shownEdges = EDGES.slice(0, state.phase === 'storage' ? state.builtEdges : EDGES.length);
        const shownSet = new Set(shownEdges.map(([u, v]) => edgeKey(u, v)));
        const visitedSet = new Set(state.visited);

        return (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              蓝色=已访问，黄色=当前节点，黄色边=正在处理的边；右侧为两种存储结构
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              {/* graph SVG */}
              <svg viewBox="0 0 300 250" className="w-full lg:w-[340px] shrink-0 bg-bg rounded-lg border border-edge">
                {EDGES.map(([u, v]) => {
                  const key = edgeKey(u, v);
                  const shown = shownSet.has(key);
                  const active = state.activeEdge === key;
                  const bothVisited = visitedSet.has(u) && visitedSet.has(v);
                  return (
                    <line
                      key={key}
                      x1={POS[u][0]} y1={POS[u][1]} x2={POS[v][0]} y2={POS[v][1]}
                      stroke={active ? '#facc15' : bothVisited && state.phase !== 'storage' ? '#3b82f6' : shown ? '#555' : '#222'}
                      strokeWidth={active ? 3 : 2}
                      strokeDasharray={shown ? undefined : '4 4'}
                    />
                  );
                })}
                {POS.map(([x, y], i) => {
                  const isCurrent = state.current === i;
                  const isVisited = visitedSet.has(i);
                  return (
                    <g key={i}>
                      <circle
                        cx={x} cy={y} r={17}
                        fill={isCurrent ? '#facc15' : isVisited && state.phase !== 'storage' ? '#3b82f6' : '#1a1a1a'}
                        stroke={isCurrent ? '#fde047' : isVisited && state.phase !== 'storage' ? '#93c5fd' : '#666'}
                        strokeWidth={2}
                      />
                      <text x={x} y={y + 4} textAnchor="middle" fontSize={13} fontWeight={700}
                        fill={isCurrent ? '#111' : isVisited && state.phase !== 'storage' ? '#fff' : '#ccc'}>
                        {i}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* adjacency matrix */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">邻接矩阵 matrix[u][v]:</div>
                  <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${N + 1}, 1.6rem)` }}>
                    <div />
                    {Array.from({ length: N }, (_, j) => (
                      <div key={`c${j}`} className="h-6 flex items-center justify-center text-[10px] text-gray-500 font-mono">{j}</div>
                    ))}
                    {Array.from({ length: N }, (_, i) => (
                      <div key={`r${i}`} className="contents">
                        <div className="h-6 flex items-center justify-center text-[10px] text-gray-500 font-mono">{i}</div>
                        {Array.from({ length: N }, (_, j) => {
                          const has = i !== j && shownSet.has(edgeKey(i, j));
                          const active = state.activeEdge === edgeKey(i, j);
                          return (
                            <div
                              key={`m${i}-${j}`}
                              className={clsx(
                                'h-6 flex items-center justify-center text-[10px] font-mono rounded-sm border transition-all',
                                active
                                  ? 'bg-yellow-500/40 border-yellow-400 text-yellow-100'
                                  : has
                                    ? 'bg-blue-500/20 border-blue-700 text-blue-300'
                                    : 'bg-surface border-edge text-ink-3',
                              )}
                            >
                              {has ? 1 : 0}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* adjacency list */}
                <div className="space-y-1 flex-1">
                  <div className="text-xs text-gray-500">邻接表 adj[u]:</div>
                  <div className="space-y-1">
                    {ADJ.map((neighbors, u) => (
                      <div key={u} className="flex items-center gap-1 text-xs font-mono">
                        <span className={clsx('w-5 h-5 flex items-center justify-center rounded border', state.current === u ? 'border-yellow-400 bg-yellow-500/30 text-yellow-200' : 'border-edge-2 bg-surface-2 text-ink-2')}>{u}</span>
                        <span className="text-gray-600">→</span>
                        {neighbors.filter((v) => shownSet.has(edgeKey(u, v))).map((v) => (
                          <span
                            key={v}
                            className={clsx(
                              'w-5 h-5 flex items-center justify-center rounded border',
                              state.activeEdge === edgeKey(u, v)
                                ? 'border-yellow-400 bg-yellow-500/30 text-yellow-200'
                                : visitedSet.has(v) && state.phase !== 'storage'
                                  ? 'border-blue-700 bg-blue-500/20 text-blue-300'
                                  : 'border-edge-2 bg-surface-2 text-ink-3',
                            )}
                          >
                            {v}
                          </span>
                        ))}
                        {neighbors.filter((v) => shownSet.has(edgeKey(u, v))).length === 0 && (
                          <span className="text-gray-700">∅</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* queue / stack / order */}
            {state.phase !== 'storage' && (
              <div className="flex flex-wrap gap-6 items-start">
                {state.phase === 'bfs' && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">队列 queue（左=队首）:</div>
                    <div className="flex gap-1 items-center min-h-[2.25rem]">
                      {state.queue.length === 0 && <span className="text-gray-700 text-sm font-mono">空</span>}
                      {state.queue.map((v, i) => (
                        <div key={`${v}-${i}`} className={clsx('w-9 h-9 flex items-center justify-center rounded font-mono text-sm border', i === 0 ? 'border-yellow-400 bg-yellow-500/25 text-yellow-200' : 'border-edge-2 bg-surface-2 text-ink-2')}>
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {state.phase === 'dfs' && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">递归栈 stack（右=栈顶）:</div>
                    <div className="flex gap-1 items-center min-h-[2.25rem]">
                      {state.stack.length === 0 && <span className="text-gray-700 text-sm font-mono">空</span>}
                      {state.stack.map((v, i) => (
                        <div key={`${v}-${i}`} className={clsx('w-9 h-9 flex items-center justify-center rounded font-mono text-sm border', i === state.stack.length - 1 ? 'border-yellow-400 bg-yellow-500/25 text-yellow-200' : 'border-edge-2 bg-surface-2 text-ink-2')}>
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">访问序列 order:</div>
                  <div className="flex gap-1 items-center min-h-[2.25rem]">
                    {state.order.length === 0 && <span className="text-gray-700 text-sm font-mono">空</span>}
                    {state.order.map((v, i) => (
                      <div key={`${v}-${i}`} className="w-9 h-9 flex items-center justify-center rounded font-mono text-sm border border-green-700 bg-green-500/15 text-green-300">
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
          </div>
        );
      }}
    />
  );
}
