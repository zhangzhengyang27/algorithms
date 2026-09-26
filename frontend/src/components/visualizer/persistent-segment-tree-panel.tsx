'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const pstCode = [
  'function build(l, r) {',
  '  const id = nodes.length;',
  '  nodes.push({ sum: 0, l: -1, r: -1 });',
  '  if (l < r) { const m = (l+r)>>1;',
  '    nodes[id].l = build(l, m); nodes[id].r = build(m+1, r); }',
  '  return id;',
  '}',
  'function update(prev, l, r, pos) { // 路径复制',
  '  const id = nodes.length;',
  '  nodes.push({ ...nodes[prev], sum: nodes[prev].sum + 1 });',
  '  if (l < r) { const m = (l+r)>>1;',
  '    if (pos <= m) nodes[id].l = update(nodes[prev].l, l, m, pos);',
  '    else nodes[id].r = update(nodes[prev].r, m+1, r, pos); }',
  '  return id;',
  '}',
  'function query(u, v, l, r, k) { // 第 k 小',
  '  if (l === r) return l;',
  '  const m = (l+r)>>1;',
  '  const cnt = nodes[nodes[v].l].sum - nodes[nodes[u].l].sum;',
  '  if (k <= cnt) return query(nodes[u].l, nodes[v].l, l, m, k);',
  '  return query(nodes[u].r, nodes[v].r, m+1, r, k - cnt);',
  '}',
];

const NUMS = [3, 1, 4, 2];
const MAXV = 4; // 值域 [1, 4]

interface PSTNode { sum: number; l: number; r: number; ver: number; }

interface PSTState {
  nodes: PSTNode[];
  roots: number[];
  insertIdx: number;
  currentRoot: number;
  newPath: number[];
  queryL: number; queryR: number; queryK: number;
  uNode: number; vNode: number;
  queryRange: [number, number] | null;
  cnt: number | null;
  result: number | null;
  phase: 'build' | 'insert' | 'query' | 'done';
  message: string;
}

function buildSteps(): VizStep<PSTState>[] {
  const steps: VizStep<PSTState>[] = [];
  const nodes: PSTNode[] = [];
  const roots: number[] = [];

  const snap = (over: Partial<PSTState>): PSTState => ({
    nodes: nodes.map((n) => ({ ...n })),
    roots: [...roots],
    insertIdx: -1, currentRoot: roots.length > 0 ? roots[roots.length - 1] : -1,
    newPath: [], queryL: -1, queryR: -1, queryK: -1, uNode: -1, vNode: -1,
    queryRange: null, cnt: null, result: null, phase: 'build', message: '',
    ...over,
  });

  const build = (l: number, r: number): number => {
    const id = nodes.length;
    nodes.push({ sum: 0, l: -1, r: -1, ver: 0 });
    if (l < r) {
      const m = (l + r) >> 1;
      nodes[id].l = build(l, m);
      nodes[id].r = build(m + 1, r);
    }
    return id;
  };

  const update = (prev: number, l: number, r: number, pos: number, ver: number, path: number[]): number => {
    const id = nodes.length;
    nodes.push({ ...nodes[prev], sum: nodes[prev].sum + 1, ver });
    path.push(id);
    if (l < r) {
      const m = (l + r) >> 1;
      if (pos <= m) nodes[id].l = update(nodes[prev].l, l, m, pos, ver, path);
      else nodes[id].r = update(nodes[prev].r, m + 1, r, pos, ver, path);
    }
    return id;
  };

  const r0 = build(1, MAXV);
  roots.push(r0);
  steps.push({
    state: snap({ message: `值域 [1, ${MAXV}]，构建空线段树作为版本 0（共 ${nodes.length} 个节点，sum 全 0）` }),
    description: '版本 0',
    codeLine: 2,
  });

  NUMS.forEach((x, i) => {
    const path: number[] = [];
    const ri = update(roots[i], 1, MAXV, x, i + 1, path);
    roots.push(ri);
    const shared = 7 - path.length;
    steps.push({
      state: snap({
        insertIdx: i, currentRoot: ri, newPath: [...path], phase: 'insert',
        message: `插入 nums[${i}]=${x} 得版本 ${i + 1}：仅复制根到叶子的 ${path.length} 个节点（黄色），其余 ${shared} 个节点与旧版本共享`,
      }),
      description: `插入 ${x} → v${i + 1}`,
      codeLine: 9,
    });
  });

  // 查询 nums[1..3] = [1,4,2] 的第 2 小
  const qL = 1, qR = 3, qK = 2;
  steps.push({
    state: snap({ phase: 'query', queryL: qL, queryR: qR, queryK: qK, currentRoot: roots[qR + 1], message: `查询 nums[${qL}..${qR}] = [1,4,2] 的第 ${qK} 小：u=根v${qL}，v=根v${qR + 1}，两版本做差` }),
    description: '查询第 k 小',
    codeLine: 15,
  });

  const query = (u: number, v: number, l: number, r: number, k: number): number => {
    if (l === r) {
      steps.push({
        state: snap({ phase: 'query', queryL: qL, queryR: qR, queryK: qK, currentRoot: roots[qR + 1], uNode: u, vNode: v, queryRange: [l, r], result: l, message: `✅ 到达叶子 [${l},${r}]，第 ${qK} 小 = ${l}` }),
        description: `答案 = ${l}`,
        codeLine: 16,
      });
      return l;
    }
    const m = (l + r) >> 1;
    const cnt = nodes[nodes[v].l].sum - nodes[nodes[u].l].sum;
    const goLeft = k <= cnt;
    steps.push({
      state: snap({ phase: 'query', queryL: qL, queryR: qR, queryK: qK, currentRoot: roots[qR + 1], uNode: u, vNode: v, queryRange: [l, r], cnt, message: `区间 [${l},${r}]：左子树出现次数 cnt = v.sum(${nodes[nodes[v].l].sum}) − u.sum(${nodes[nodes[u].l].sum}) = ${cnt}，k=${k} ${goLeft ? '≤' : '>'} cnt → 走${goLeft ? '左' : '右'}子树` }),
      description: `cnt=${cnt} 走${goLeft ? '左' : '右'}`,
      codeLine: goLeft ? 19 : 20,
    });
    if (goLeft) return query(nodes[u].l, nodes[v].l, l, m, k);
    return query(nodes[u].r, nodes[v].r, m + 1, r, k - cnt);
  };

  const ans = query(roots[qL], roots[qR + 1], 1, MAXV, qK);
  steps.push({
    state: snap({ phase: 'done', queryL: qL, queryR: qR, queryK: qK, currentRoot: roots[qR + 1], result: ans, message: `✅ nums[${qL}..${qR}] 排序后 [1,2,4]，第 ${qK} 小 = ${ans}。每次插入只新建 O(log n) 节点` }),
    description: '完成',
    codeLine: 16,
  });

  return steps;
}

// 返回 range("l-r") -> nodeId 的映射
function collectTree(rootId: number, nodes: PSTNode[]): Map<string, number> {
  const map = new Map<string, number>();
  const walk = (id: number, l: number, r: number) => {
    if (id < 0 || id >= nodes.length) return;
    map.set(`${l}-${r}`, id);
    if (l < r) {
      const m = (l + r) >> 1;
      walk(nodes[id].l, l, m);
      walk(nodes[id].r, m + 1, r);
    }
  };
  walk(rootId, 1, MAXV);
  return map;
}

function allRanges(l: number, r: number): [number, number][] {
  if (l === r) return [[l, r]];
  const m = (l + r) >> 1;
  return [[l, r], ...allRanges(l, m), ...allRanges(m + 1, r)];
}

const RANGES = allRanges(1, MAXV);
const depthOf = (l: number, r: number) => {
  let d = 0, span = MAXV;
  while (span > r - l + 1) { span >>= 1; d++; }
  return d;
};
const xPos = (l: number, r: number) => ((l + r) / 2) * 92 + 70;
const yPos = (l: number, r: number) => depthOf(l, r) * 92 + 46;

export function PersistentSegmentTreePanel() {
  const steps = useMemo(() => buildSteps(), []);

  const initial: PSTState = {
    nodes: [], roots: [], insertIdx: -1, currentRoot: -1, newPath: [],
    queryL: -1, queryR: -1, queryK: -1, uNode: -1, vNode: -1,
    queryRange: null, cnt: null, result: null, phase: 'build', message: '',
  };

  const width = MAXV * 92 + 110;
  const height = 3 * 92 + 70;

  return (
    <Stepper<PSTState>
      steps={steps}
      initialState={initial}
      codeLines={pstCode}
      codeTitle="主席树 Persistent Segment Tree"
      render={(state) => {
        const isQuery = state.phase === 'query' || state.phase === 'done';
        const vMap = state.currentRoot >= 0 ? collectTree(state.currentRoot, state.nodes) : new Map<string, number>();
        const uMap = isQuery && state.queryL >= 0 ? collectTree(state.roots[state.queryL], state.nodes) : null;

        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">
              黄色=本次新建节点（路径复制），暗色=与历史版本共享的节点；查询时蓝=u 版本、紫=v 版本
            </div>

            {/* nums 数组 */}
            <div className="flex items-center gap-1 justify-center">
              <span className="text-xs text-gray-500 mr-2">nums:</span>
              {NUMS.map((v, i) => (
                <div key={i} className={clsx('w-9 h-9 flex items-center justify-center rounded text-xs font-mono border', isQuery && i >= state.queryL && i <= state.queryR ? 'bg-blue-500/20 border-blue-400 text-blue-200' : state.insertIdx === i ? 'bg-yellow-500/25 border-yellow-400 text-yellow-200' : 'bg-surface-2 border-edge-2 text-ink-3')}>{v}</div>
              ))}
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl mx-auto">
              {/* edges */}
              {RANGES.map(([l, r]) => {
                if (l === r) return null;
                const m = (l + r) >> 1;
                const pid = vMap.get(`${l}-${r}`);
                const lid = vMap.get(`${l}-${m}`);
                const rid = vMap.get(`${m + 1}-${r}`);
                if (pid === undefined) return null;
                const isNew = state.newPath.includes(pid);
                return (
                  <g key={`e${l}-${r}`}>
                    {lid !== undefined && (
                      <line x1={xPos(l, r)} y1={yPos(l, r) + 24} x2={xPos(l, m)} y2={yPos(l, m) - 24} stroke={isNew ? '#eab308' : '#333'} strokeWidth={isNew ? 2 : 1.2} />
                    )}
                    {rid !== undefined && (
                      <line x1={xPos(l, r)} y1={yPos(l, r) + 24} x2={xPos(m + 1, r)} y2={yPos(m + 1, r) - 24} stroke={isNew ? '#eab308' : '#333'} strokeWidth={isNew ? 2 : 1.2} />
                    )}
                  </g>
                );
              })}
              {/* nodes */}
              {RANGES.map(([l, r]) => {
                const vid = vMap.get(`${l}-${r}`);
                if (vid === undefined) return null;
                const node = state.nodes[vid];
                const uid = uMap ? uMap.get(`${l}-${r}`) : undefined;
                const uNode = uid !== undefined ? state.nodes[uid] : null;
                const isNew = state.newPath.includes(vid);
                const isCurV = state.vNode === vid;
                const isCurU = state.uNode === uid;
                const inQueryRange = state.queryRange && state.queryRange[0] === l && state.queryRange[1] === r;
                const x = xPos(l, r), y = yPos(l, r);
                const stroke = isCurV ? '#a855f7' : isCurU ? '#3b82f6' : isNew ? '#eab308' : inQueryRange ? '#22c55e' : '#3d3d3d';
                const fill = isNew ? '#eab30826' : isCurV ? '#a855f726' : isCurU ? '#3b82f626' : '#161616';
                return (
                  <g key={`n${l}-${r}`}>
                    <rect x={x - 33} y={y - 24} width={66} height={48} rx={8} fill={fill} stroke={stroke} strokeWidth={isNew || isCurV || isCurU ? 2.5 : 1.5} />
                    <text x={x} y={y - 4} textAnchor="middle" fontSize="14" fontWeight="bold" fill={isNew ? '#fde047' : '#e5e7eb'}>{node.sum}</text>
                    <text x={x} y={y + 12} textAnchor="middle" fontSize="9" fill="#9ca3af">[{l},{r}]</text>
                    <text x={x + 26} y={y - 14} textAnchor="middle" fontSize="8" fill="#6b7280">v{node.ver}</text>
                    {uMap && uNode && (
                      <text x={x} y={y + 34} textAnchor="middle" fontSize="9" fill="#93c5fd">u:{uNode.sum} v:{node.sum}</text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* 版本历史 */}
            <div className="flex flex-wrap items-center gap-2 justify-center text-xs font-mono">
              <span className="text-gray-500">历史版本根节点:</span>
              {state.roots.map((rid, i) => (
                <span key={i} className={clsx('px-2 py-1 rounded border', state.currentRoot === rid ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200' : 'bg-surface-2 border-edge-2 text-ink-3')}>
                  v{i} → #{rid}
                </span>
              ))}
            </div>

            {state.phase === 'done' && state.result !== null && (
              <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <span className="text-green-300 font-mono text-sm">nums[{state.queryL}..{state.queryR}] 第 {state.queryK} 小 = {state.result}</span>
              </div>
            )}

            {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
          </div>
        );
      }}
    />
  );
}
