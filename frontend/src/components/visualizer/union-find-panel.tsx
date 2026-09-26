'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const unionFindCode = [
  'class UnionFind {',
  '  constructor(n) {',
  '    this.parent = Array.from({length: n}, (_, i) => i);',
  '    this.rank = new Array(n).fill(0);',
  '  }',
  '  find(x) {',
  '    while (this.parent[x] !== x) x = this.parent[x];',
  '    return x;',
  '  }',
  '  union(a, b) {',
  '    const ra = this.find(a), rb = this.find(b);',
  '    if (ra === rb) return;',
  '    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;',
  '    else { this.parent[rb] = ra; if (this.rank[ra] === this.rank[rb]) this.rank[ra]++; }',
  '  }',
  '}',
];

interface UFState {
  parent: number[];
  rank: number[];
  highlightA: number;
  highlightB: number;
  rootA: number;
  rootB: number;
  message: string;
}

interface UnionOp {
  a: number;
  b: number;
}

function find(parent: number[], x: number): number {
  while (parent[x] !== x) x = parent[x];
  return x;
}

export function buildSteps(n: number, ops: UnionOp[]): VizStep<UFState>[] {
  const steps: VizStep<UFState>[] = [];
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);

  const snap = (hA: number, hB: number, rA: number, rB: number, msg: string): UFState => ({
    parent: [...parent],
    rank: [...rank],
    highlightA: hA,
    highlightB: hB,
    rootA: rA,
    rootB: rB,
    message: msg,
  });

  steps.push({
    state: snap(-1, -1, -1, -1, `初始化 ${n} 个元素，各自为独立集合`),
    description: '初始化',
    codeLine: 3,
  });

  for (const { a, b } of ops) {
    // Find root of a
    let ra = a;
    const pathA: number[] = [a];
    while (parent[ra] !== ra) {
      ra = parent[ra];
      pathA.push(ra);
    }
    steps.push({
      state: snap(a, b, ra, -1, `find(${a})：沿路径 ${pathA.join('→')} 找到根 ${ra}`),
      description: `find(${a}) = ${ra}`,
      codeLine: 7,
    });

    // Find root of b
    let rb = b;
    const pathB: number[] = [b];
    while (parent[rb] !== rb) {
      rb = parent[rb];
      pathB.push(rb);
    }
    steps.push({
      state: snap(a, b, ra, rb, `find(${b})：沿路径 ${pathB.join('→')} 找到根 ${rb}`),
      description: `find(${b}) = ${rb}`,
      codeLine: 7,
    });

    if (ra === rb) {
      steps.push({
        state: snap(a, b, ra, rb, `根相同（${ra}），${a} 和 ${b} 已在同一集合，无需合并`),
        description: `union(${a},${b})：已连通`,
        codeLine: 12,
      });
    } else {
      // Union by rank
      if (rank[ra] < rank[rb]) {
        parent[ra] = rb;
        steps.push({
          state: snap(a, b, ra, rb, `rank[${ra}]=${rank[ra]} < rank[${rb}]=${rank[rb]}，将 ${ra} 挂到 ${rb} 下`),
          description: `union：${ra} → ${rb}`,
          codeLine: 13,
        });
      } else if (rank[ra] > rank[rb]) {
        parent[rb] = ra;
        steps.push({
          state: snap(a, b, ra, rb, `rank[${ra}]=${rank[ra]} > rank[${rb}]=${rank[rb]}，将 ${rb} 挂到 ${ra} 下`),
          description: `union：${rb} → ${ra}`,
          codeLine: 14,
        });
      } else {
        parent[rb] = ra;
        rank[ra]++;
        steps.push({
          state: snap(a, b, ra, rb, `rank 相同，将 ${rb} 挂到 ${ra} 下，rank[${ra}] 升为 ${rank[ra]}`),
          description: `union：${rb} → ${ra}，rank++`,
          codeLine: 14,
        });
      }
    }
  }

  return steps;
}

export function UnionFindPanel() {
  const [size, setSize] = useState(8);
  const [opsText, setOpsText] = useState('0,1 1,2 3,4 5,6 2,5 0,6');
  const ops = useMemo<UnionOp[]>(() => {
    return opsText
      .split(/\s+/)
      .map((s) => s.split(',').map(Number))
      .filter((p) => p.length === 2 && p.every(Number.isFinite))
      .map(([a, b]) => ({ a, b }));
  }, [opsText]);

  const steps = useMemo(() => buildSteps(size, ops), [size, ops]);
  const initial: UFState = {
    parent: Array.from({ length: size }, (_, i) => i),
    rank: new Array(size).fill(0),
    highlightA: -1,
    highlightB: -1,
    rootA: -1,
    rootB: -1,
    message: '',
  };

  return (
    <Stepper<UFState>
      steps={steps}
      initialState={initial}
      codeLines={unionFindCode}
      codeTitle="并查集 Union-Find"
      headerActions={
        <>
          <span className="text-sm text-gray-400">操作(a,b):</span>
          <input
            type="text"
            value={opsText}
            onChange={(e) => setOpsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="空格分隔，如 0,1 2,3"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            蓝色=操作元素A，紫色=操作元素B，绿色=根节点，数字下方=rank
          </div>

          {/* Node view */}
          <div className="flex items-end justify-center gap-3 flex-wrap min-h-[120px]">
            {state.parent.map((p, i) => {
              const isRoot = p === i;
              const isA = i === state.highlightA;
              const isB = i === state.highlightB;
              const isRootA = i === state.rootA;
              const isRootB = i === state.rootB;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      'w-11 h-11 flex items-center justify-center rounded-lg text-sm font-mono border-2 transition-all',
                      isA
                        ? 'bg-blue-500/30 border-blue-400 text-blue-200'
                        : isB
                          ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                          : isRootA || isRootB
                            ? 'bg-green-500/20 border-green-500 text-green-300'
                            : isRoot
                              ? 'bg-surface-2 border-green-800 text-gray-300'
                              : 'bg-surface-2 border-edge-2 text-gray-400',
                    )}
                  >
                    {i}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    p={p}{isRoot ? ' ★' : ''}
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono">
                    r={state.rank[i]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Parent array */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <span className="text-xs text-gray-500 mr-2">parent[]:</span>
            {state.parent.map((p, i) => (
              <span
                key={i}
                className={clsx(
                  'px-2 py-0.5 rounded text-xs font-mono',
                  p === i ? 'bg-green-900/40 text-green-300' : 'bg-surface-2 text-gray-400',
                )}
              >
                {p}
              </span>
            ))}
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
