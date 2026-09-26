'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const skipListCode = [
  'function search(head, maxLevel, target) {',
  '  let cur = head;',
  '  for (let i = maxLevel - 1; i >= 0; i--)',
  '    while (cur.forward[i] && cur.forward[i].value < target)',
  '      cur = cur.forward[i]; // 同层右移',
  '  // i-- 即下降一层',
  '  return cur.forward[0] && cur.forward[0].value === target;',
  '}',
  'function insert(head, maxLevel, val) {',
  '  const update = searchPredecessors(head, maxLevel, val);',
  '  const lvl = randomLevel(); // 几何分布：约 1/2 晋升',
  '  const node = { value: val, forward: [] };',
  '  for (let i = 0; i < lvl; i++) {',
  '    node.forward[i] = update[i].forward[i];',
  '    update[i].forward[i] = node; // 各层插入',
  '  }',
  '}',
];

interface SNode {
  value: number | null;
  forward: (SNode | null)[];
}

interface SkipListState {
  levels: (number | null)[][]; // levels[0]=最底层，每行 [0]=null(HEAD)
  path: { level: number; value: number | null }[];
  currentLevel: number;
  newValue: number | null;
  newLevel: number;
  target: number | null;
  found: boolean | null;
  phase: 'insert' | 'search';
  message: string;
}

function snapshotLevels(head: SNode, maxLevel: number): (number | null)[][] {
  const levels: (number | null)[][] = [];
  for (let i = 0; i < maxLevel; i++) {
    const row: (number | null)[] = [null];
    let cur = head.forward[i];
    while (cur) {
      row.push(cur.value);
      cur = cur.forward[i];
    }
    levels.push(row);
  }
  return levels;
}

function levelFor(order: number, maxLevel: number): number {
  let lvl = 1;
  let x = order;
  while (x % 2 === 0 && lvl < maxLevel) {
    lvl++;
    x /= 2;
  }
  return lvl;
}

function buildSteps(values: number[], maxLevel: number, target: number): VizStep<SkipListState>[] {
  const steps: VizStep<SkipListState>[] = [];
  const head: SNode = { value: null, forward: new Array(maxLevel).fill(null) };
  let order = 0;

  const snap = (
    path: { level: number; value: number | null }[],
    currentLevel: number,
    newValue: number | null,
    newLevel: number,
    tgt: number | null,
    found: boolean | null,
    phase: 'insert' | 'search',
    msg: string,
  ): SkipListState => ({
    levels: snapshotLevels(head, maxLevel),
    path: path.map((p) => ({ ...p })),
    currentLevel,
    newValue,
    newLevel,
    target: tgt,
    found,
    phase,
    message: msg,
  });

  steps.push({
    state: snap([], -1, null, 0, null, null, 'insert', `初始化空跳表，最高层级 L${maxLevel - 1}，每层以 HEAD(-∞) 开头`),
    description: '初始化',
    codeLine: 2,
  });

  for (const v of values) {
    order++;
    const lvl = levelFor(order, maxLevel);

    // search predecessors, level by level
    const path: { level: number; value: number | null }[] = [];
    const update: SNode[] = new Array(maxLevel).fill(head);
    let cur = head;
    for (let i = maxLevel - 1; i >= 0; i--) {
      path.push({ level: i, value: cur.value });
      let moved = false;
      while (cur.forward[i] && cur.forward[i]!.value! < v) {
        cur = cur.forward[i]!;
        path.push({ level: i, value: cur.value });
        moved = true;
      }
      update[i] = cur;
      const next = cur.forward[i];
      steps.push({
        state: snap(path, i, null, 0, null, null, 'insert',
          `L${i} 层查找 ${v}：${moved ? `右移到 ${cur.value}` : '停留在 ' + (cur.value === null ? 'HEAD' : cur.value)}，${next && next.value! < v ? '继续' : next ? `下一个 ${next.value} ≥ ${v}` : '已到末尾'}${i > 0 ? '，下降一层' : ''}`),
        description: `L${i} 查找`,
        codeLine: 4,
      });
    }

    steps.push({
      state: snap(path, -1, v, lvl, null, null, 'insert', `随机晋升：${v} 出现在 L0~L${lvl - 1} 共 ${lvl} 层（概率约 1/2^k）`),
      description: `${v} 晋升 ${lvl} 层`,
      codeLine: 11,
    });

    const node: SNode = { value: v, forward: new Array(lvl).fill(null) };
    for (let i = 0; i < lvl; i++) {
      node.forward[i] = update[i].forward[i];
      update[i].forward[i] = node;
      steps.push({
        state: snap(path, i, v, lvl, null, null, 'insert', `在 L${i} 层插入 ${v}：接在 ${update[i].value === null ? 'HEAD' : update[i].value} 之后`),
        description: `L${i} 插入 ${v}`,
        codeLine: 15,
      });
    }
  }

  // final search
  const path: { level: number; value: number | null }[] = [];
  let cur = head;
  steps.push({
    state: snap([], -1, null, 0, target, null, 'search', `查找目标 ${target}：从最高层 HEAD 出发`),
    description: `查找 ${target}`,
    codeLine: 2,
  });
  for (let i = maxLevel - 1; i >= 0; i--) {
    path.push({ level: i, value: cur.value });
    while (cur.forward[i] && cur.forward[i]!.value! < target) {
      cur = cur.forward[i]!;
      path.push({ level: i, value: cur.value });
    }
    steps.push({
      state: snap(path, i, null, 0, target, null, 'search', `L${i} 层：走到 ${cur.value === null ? 'HEAD' : cur.value}${i > 0 ? '，下降' : ''}`),
      description: `L${i} 定位`,
      codeLine: 4,
    });
  }
  const foundNode = cur.forward[0];
  const found = !!foundNode && foundNode.value === target;
  if (found) path.push({ level: 0, value: target });
  steps.push({
    state: snap(path, -1, null, 0, target, found, 'search', found ? `✅ 在 L0 层找到 ${target}（O(log n)）` : `✗ 未找到 ${target}`),
    description: found ? `找到 ${target}` : '未找到',
    codeLine: 7,
  });

  return steps;
}

export function SkipListPanel() {
  const [seed, setSeed] = useState<number[]>([3, 6, 9, 1, 12, 5, 8, 10]);
  const [target, setTarget] = useState(5);
  const maxLevel = 4;

  const steps = useMemo(() => buildSteps(seed, maxLevel, target), [seed, target]);
  const initial: SkipListState = {
    levels: Array.from({ length: maxLevel }, () => [null]),
    path: [],
    currentLevel: -1,
    newValue: null,
    newLevel: 0,
    target: null,
    found: null,
    phase: 'insert',
    message: '',
  };

  return (
    <Stepper<SkipListState>
      steps={steps}
      initialState={initial}
      codeLines={skipListCode}
      codeTitle="跳表 Skip List"
      headerActions={
        <>
          <span className="text-sm text-gray-400">插入序列:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((num) => Number.isFinite(num));
              if (parsed.length >= 1 && parsed.length <= 12) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-48"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">查找:</span>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => {
        const cols = state.levels[0] ?? [null];
        const inPath = (level: number, value: number | null) =>
          state.path.some((p) => p.level === level && p.value === value);
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">
              黄色=查找路径，蓝色=新插入节点，绿色=找到目标。高层是低层的"快速通道"
            </div>

            <div className="space-y-2 overflow-x-auto">
              {Array.from({ length: maxLevel }).map((_, rev) => {
                const level = maxLevel - 1 - rev; // 顶层在上
                const row = state.levels[level] ?? [null];
                const presentIdx = new Set<number>();
                cols.forEach((c, idx) => { if (row.includes(c)) presentIdx.add(idx); });
                const maxPresent = presentIdx.size ? Math.max(...presentIdx) : 0;
                return (
                  <div key={level} className="flex items-center gap-1">
                    <div className="w-8 text-[10px] text-gray-500 font-mono shrink-0">L{level}</div>
                    {cols.map((c, idx) => {
                      const isPresent = row.includes(c);
                      const isNew = state.newValue !== null && c === state.newValue && level < state.newLevel;
                      const isFound = state.found === true && c === state.target && level === 0;
                      const onPath = inPath(level, c);
                      if (!isPresent) {
                        const isLink = idx > 0 && idx < maxPresent;
                        return (
                          <div key={idx} className="w-12 h-9 flex items-center justify-center text-gray-700 text-xs shrink-0">
                            {isLink ? '———' : ''}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={idx}
                          className={clsx(
                            'w-12 h-9 flex items-center justify-center rounded text-xs font-mono border transition-all shrink-0',
                            c === null
                              ? 'bg-surface border-edge-2 text-gray-500'
                              : isFound
                                ? 'bg-green-500/30 border-green-400 text-green-200 scale-105'
                                : isNew
                                  ? 'bg-blue-500/30 border-blue-400 text-blue-200 scale-105'
                                  : onPath
                                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
                                    : 'bg-surface-2 border-edge-2 text-gray-300',
                          )}
                        >
                          {c === null ? 'HEAD' : c}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {state.found !== null && (
              <div className={clsx(
                'text-center p-3 rounded-lg border',
                state.found ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800',
              )}
              >
                <span className={clsx('font-mono text-sm', state.found ? 'text-green-300' : 'text-red-300')}>
                  {state.found ? `找到 ${state.target}` : `未找到 ${state.target}`}
                </span>
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
