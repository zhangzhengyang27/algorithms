'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const twoSatCode = [
  'function twoSat(n, clauses) {',
  '  const g = buildImplicationGraph(n, clauses);',
  '  const sccId = tarjanSCC(2 * n, g);',
  '  for (let i = 0; i < n; i++) {',
  '    if (sccId[2*i] === sccId[2*i+1]) return null;',
  '  }',
  '  // Tarjan 编号小 = 缩点后拓扑序靠后（汇点侧），赋 true',
  '  return Array.from({length: n}, (_, i) => sccId[2*i] < sccId[2*i+1]);',
  '}',
];

// Literal encoding: node 2i = x_i, node 2i+1 = ¬x_i
interface Clause { a: number; b: number; }
interface ImpEdge { from: number; to: number; }

interface TwoSatState {
  n: number;
  clauses: Clause[];
  impEdges: ImpEdge[];
  currentClause: number;
  currentEdge: number;
  sccIds: number[];
  sccCount: number;
  checkVar: number;
  assignment: (boolean | null)[];
  sat: boolean | null;
  phase: 'clauses' | 'build' | 'tarjan' | 'check' | 'done';
  message: string;
}

function litName(lit: number): string {
  const v = lit >> 1;
  return lit % 2 === 0 ? `x${v}` : `¬x${v}`;
}

function clauseName(c: Clause): string {
  return `(${litName(c.a)} ∨ ${litName(c.b)})`;
}

function buildSteps(n: number, clauses: Clause[]): VizStep<TwoSatState>[] {
  const steps: VizStep<TwoSatState>[] = [];
  const impEdges: ImpEdge[] = [];
  const sccIds = new Array(2 * n).fill(-1);
  const assignment: (boolean | null)[] = new Array(n).fill(null);
  let sccCount = 0;

  const snap = (currentClause: number, currentEdge: number, checkVar: number, sat: boolean | null, phase: TwoSatState['phase'], msg: string): TwoSatState => ({
    n, clauses, impEdges: [...impEdges], currentClause, currentEdge,
    sccIds: [...sccIds], sccCount, checkVar, assignment: [...assignment], sat, phase, message: msg,
  });

  steps.push({
    state: snap(-1, -1, -1, null, 'clauses', `2-SAT 实例：${n} 个变量，${clauses.length} 个子句：${clauses.map(clauseName).join(' ∧ ')}`),
    description: '子句列表',
    codeLine: 0,
  });

  // Build implication graph
  for (let ci = 0; ci < clauses.length; ci++) {
    const { a, b } = clauses[ci];
    const na = a % 2 === 0 ? a + 1 : a - 1; // ¬a
    const nb = b % 2 === 0 ? b + 1 : b - 1; // ¬b

    impEdges.push({ from: na, to: b });
    steps.push({
      state: snap(ci, impEdges.length - 1, -1, null, 'build', `子句 ${clauseName(clauses[ci])}：若 ${litName(a)} 为假则 ${litName(b)} 必为真 → 加边 ${litName(na)} → ${litName(b)}`),
      description: `边 ${litName(na)}→${litName(b)}`,
      codeLine: 1,
    });

    impEdges.push({ from: nb, to: a });
    steps.push({
      state: snap(ci, impEdges.length - 1, -1, null, 'build', `子句 ${clauseName(clauses[ci])}：若 ${litName(b)} 为假则 ${litName(a)} 必为真 → 加边 ${litName(nb)} → ${litName(a)}`),
      description: `边 ${litName(nb)}→${litName(a)}`,
      codeLine: 1,
    });
  }

  steps.push({
    state: snap(-1, -1, -1, null, 'build', `蕴含图构建完成，共 ${impEdges.length} 条边。接下来 Tarjan 求强连通分量`),
    description: '蕴含图完成',
    codeLine: 1,
  });

  // Tarjan SCC
  const adj: number[][] = Array.from({ length: 2 * n }, () => []);
  for (const e of impEdges) adj[e.from].push(e.to);

  const dfn = new Array(2 * n).fill(-1);
  const low = new Array(2 * n).fill(-1);
  const onStack = new Array(2 * n).fill(false);
  const stk: number[] = [];
  let timer = 0;

  function tarjan(u: number) {
    dfn[u] = low[u] = timer++;
    stk.push(u);
    onStack[u] = true;
    for (const v of adj[u]) {
      if (dfn[v] === -1) {
        tarjan(v);
        low[u] = Math.min(low[u], low[v]);
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], dfn[v]);
      }
    }
    if (dfn[u] === low[u]) {
      const members: number[] = [];
      let v: number;
      do {
        v = stk.pop()!;
        onStack[v] = false;
        sccIds[v] = sccCount;
        members.push(v);
      } while (v !== u);
      sccCount++;
      steps.push({
        state: snap(-1, -1, -1, null, 'tarjan', `发现 SCC #${sccCount - 1}：{ ${members.map(litName).join(', ')} }`),
        description: `SCC {${members.map(litName).join(',')}}`,
        codeLine: 2,
      });
    }
  }

  for (let i = 0; i < 2 * n; i++) {
    if (dfn[i] === -1) tarjan(i);
  }

  // Check conflicts
  let satisfiable = true;
  for (let i = 0; i < n; i++) {
    const conflict = sccIds[2 * i] === sccIds[2 * i + 1];
    if (conflict) satisfiable = false;
    steps.push({
      state: snap(-1, -1, i, conflict ? false : null, conflict ? 'done' : 'check',
        conflict
          ? `❌ x${i} 与 ¬x${i} 在同一 SCC（id=${sccIds[2 * i]}）→ 矛盾，不可满足`
          : `x${i}(scc=${sccIds[2 * i]}) 与 ¬x${i}(scc=${sccIds[2 * i + 1]}) 不在同一 SCC ✓`),
      description: conflict ? `x${i} 矛盾!` : `检查 x${i} ✓`,
      codeLine: 4,
    });
    if (conflict) {
      steps.push({
        state: snap(-1, -1, i, false, 'done', `❌ 不可满足：存在变量 x${i} 使得 x${i} 与 ¬x${i} 强连通`),
        description: 'UNSAT',
        codeLine: 4,
      });
      return steps;
    }
  }

  // Assign by topological order
  for (let i = 0; i < n; i++) {
    assignment[i] = sccIds[2 * i] < sccIds[2 * i + 1];
    steps.push({
      state: snap(-1, -1, i, null, 'check', `赋值：scc(x${i})=${sccIds[2 * i]} < scc(¬x${i})=${sccIds[2 * i + 1]} → x${i} = ${assignment[i] ? 'true' : 'false'}`),
      description: `x${i}=${assignment[i]}`,
      codeLine: 7,
    });
  }

  steps.push({
    state: snap(-1, -1, -1, true, 'done', `✅ 可满足！赋值：${assignment.map((v, i) => `x${i}=${v ? 'T' : 'F'}`).join('，')}`),
    description: 'SAT!',
    codeLine: 7,
  });

  return steps;
}

function parseClauses(text: string, maxVars: number): Clause[] {
  const parseLit = (s: string): number | null => {
    const neg = s.startsWith('!');
    const body = neg ? s.slice(1) : s;
    const m = body.match(/^x(\d+)$/);
    if (!m) return null;
    const v = Number(m[1]);
    if (v >= maxVars) return null;
    return neg ? 2 * v + 1 : 2 * v;
  };
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((clause) => {
      const parts = clause.split('|');
      if (parts.length !== 2) return null;
      const a = parseLit(parts[0].trim());
      const b = parseLit(parts[1].trim());
      if (a === null || b === null) return null;
      return { a, b };
    })
    .filter((c): c is Clause => c !== null);
}

const SAT_PRESET = 'x0|x1 !x0|x1 x0|!x1';
const UNSAT_PRESET = 'x0|x0 !x0|!x0';

export function TwoSatPanel() {
  const [varCount, setVarCount] = useState(2);
  const [clausesText, setClausesText] = useState(SAT_PRESET);

  const clauses = useMemo(() => parseClauses(clausesText, varCount), [clausesText, varCount]);

  const steps = useMemo(() => buildSteps(varCount, clauses), [varCount, clauses]);
  const initial: TwoSatState = {
    n: varCount, clauses, impEdges: [], currentClause: -1, currentEdge: -1,
    sccIds: new Array(varCount * 2).fill(-1), sccCount: 0, checkVar: -1,
    assignment: new Array(varCount).fill(null), sat: null, phase: 'clauses', message: '',
  };

  const sccColors = [
    'border-blue-400 bg-blue-500/20 text-blue-200',
    'border-green-400 bg-green-500/20 text-green-200',
    'border-purple-400 bg-purple-500/20 text-purple-200',
    'border-orange-400 bg-orange-500/20 text-orange-200',
    'border-pink-400 bg-pink-500/20 text-pink-200',
    'border-cyan-400 bg-cyan-500/20 text-cyan-200',
  ];

  return (
    <Stepper<TwoSatState>
      steps={steps}
      initialState={initial}
      codeLines={twoSatCode}
      codeTitle="2-SAT 问题"
      headerActions={
        <>
          <span className="text-sm text-gray-400">变量数:</span>
          <input
            type="number"
            value={varCount}
            onChange={(e) => setVarCount(Math.max(1, Math.min(4, Number(e.target.value) || 1)))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-12"
          />
          <span className="text-sm text-gray-400">子句:</span>
          <input
            type="text"
            value={clausesText}
            onChange={(e) => setClausesText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="如 x0|x1 !x0|x1"
          />
          <button
            type="button"
            onClick={() => { setVarCount(2); setClausesText(SAT_PRESET); }}
            className="text-xs px-2 py-1 rounded bg-green-900/30 border border-green-800 text-green-300 hover:bg-green-900/50"
          >
            SAT 示例
          </button>
          <button
            type="button"
            onClick={() => { setVarCount(2); setClausesText(UNSAT_PRESET); }}
            className="text-xs px-2 py-1 rounded bg-red-900/30 border border-red-800 text-red-300 hover:bg-red-900/50"
          >
            UNSAT 示例
          </button>
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            同色节点=同一 SCC，黄色=当前子句/边，红色=矛盾变量
          </div>

          {/* Clauses */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {state.clauses.map((c, i) => (
              <span
                key={i}
                className={clsx(
                  'px-2 py-1 rounded text-xs font-mono border transition-all',
                  i === state.currentClause
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200 scale-105'
                    : 'bg-surface-2 border-edge-2 text-ink-3',
                )}
              >
                {clauseName(c)}
              </span>
            ))}
          </div>

          {/* Implication graph nodes */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {Array.from({ length: state.n * 2 }, (_, i) => {
              const scc = state.sccIds[i];
              const isConflict = state.checkVar >= 0 && (i === 2 * state.checkVar || i === 2 * state.checkVar + 1) && state.sat === false;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      'w-12 h-12 flex items-center justify-center rounded-full text-xs font-mono border-2 transition-all',
                      isConflict
                        ? 'border-red-500 bg-red-500/20 text-red-300'
                        : scc >= 0
                          ? sccColors[scc % sccColors.length]
                          : 'border-edge-2 bg-surface-2 text-ink-3',
                    )}
                  >
                    {litName(i)}
                  </div>
                  <div className="text-[9px] font-mono text-gray-600">
                    {scc >= 0 ? `scc=${scc}` : ''}
                  </div>
                  {state.assignment[i >> 1] !== null && i % 2 === 0 && (
                    <div className={clsx('text-[10px] font-mono', state.assignment[i >> 1] ? 'text-green-300' : 'text-red-300')}>
                      {state.assignment[i >> 1] ? 'T' : 'F'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Implication edges */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">蕴含边:</div>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {state.impEdges.map((e, i) => (
                <span
                  key={i}
                  className={clsx(
                    'px-1.5 py-0.5 rounded text-[11px] font-mono border transition-all',
                    i === state.currentEdge
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200 scale-105'
                      : 'bg-surface-2 border-edge-2 text-ink-3',
                  )}
                >
                  {litName(e.from)}→{litName(e.to)}
                </span>
              ))}
            </div>
          </div>

          {/* Result */}
          {state.sat === true && (
            <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <span className="text-green-300 font-mono text-sm">
                ✅ 可满足：{state.assignment.map((v, i) => `x${i}=${v ? 'true' : 'false'}`).join('，')}
              </span>
            </div>
          )}
          {state.sat === false && (
            <div className="text-center p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <span className="text-red-300 font-mono text-sm">❌ 不可满足（UNSAT）</span>
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
