'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const hashCode = [
  'const M = 7; // table length',
  'const h1 = (key) => key % M;',
  '// Method 1: open addressing (linear probing)',
  'function insertLinear(table, key) {',
  '  let i = h1(key);',
  '  while (table[i] !== null) i = (i + 1) % M;',
  '  table[i] = key;',
  '  return i;',
  '}',
  '// Method 2: chaining',
  'function insertChain(table, key) {',
  '  table[h1(key)].push(key);',
  '}',
  '// Method 3: rehashing (double hashing)',
  'const h2 = (key) => 5 - (key % 5);',
  'function insertDouble(table, key) {',
  '  let i = h1(key), step = h2(key), k = 0;',
  '  while (table[i] !== null) { k++; i = (h1(key) + k * step) % M; }',
  '  table[i] = key;',
  '  return i;',
  '}',
];

const M = 7;
type HPhase = 'linear' | 'chain' | 'double';

interface HashState {
  phase: HPhase;
  keys: number[];
  keyIdx: number;
  linearTable: (number | null)[];
  chainTable: number[][];
  doubleTable: (number | null)[];
  probeIdx: number | null;
  homeIdx: number | null;
  collision: boolean;
  message: string;
}

function buildSteps(keys: number[]): VizStep<HashState>[] {
  const steps: VizStep<HashState>[] = [];
  const linear: (number | null)[] = new Array(M).fill(null);
  const chain: number[][] = Array.from({ length: M }, () => []);
  const double: (number | null)[] = new Array(M).fill(null);

  const base = (phase: HPhase): HashState => ({
    phase, keys, keyIdx: -1,
    linearTable: [...linear],
    chainTable: chain.map((c) => [...c]),
    doubleTable: [...double],
    probeIdx: null, homeIdx: null, collision: false, message: '',
  });

  steps.push({
    state: { ...base('linear'), message: `哈希函数 h(key) = key % ${M}，表长 ${M}。依次插入 [${keys.join(', ')}]，观察三种冲突解决策略` },
    description: '哈希表 M=7',
    codeLine: 1,
  });

  // ---- linear probing ----
  steps.push({
    state: { ...base('linear'), message: '方法① 开放寻址（线性探测）：冲突时向后逐个检查下一个槽位，直到找到空位' },
    description: '① 线性探测',
    codeLine: 3,
  });
  keys.forEach((key, idx) => {
    const home = key % M;
    steps.push({
      state: { ...base('linear'), keyIdx: idx, homeIdx: home, probeIdx: home, message: `h(${key}) = ${key} % 7 = ${home}` },
      description: `h(${key})=${home}`,
      codeLine: 4,
    });
    let i = home;
    let collision = false;
    while (linear[i] !== null) {
      collision = true;
      const prev = i;
      i = (i + 1) % M;
      steps.push({
        state: { ...base('linear'), keyIdx: idx, homeIdx: home, probeIdx: i, collision, message: `槽 ${prev} 已被 ${linear[prev]} 占用 → 冲突！线性探测下一槽 ${i}` },
        description: `冲突 → 探测 ${i}`,
        codeLine: 5,
      });
    }
    linear[i] = key;
    steps.push({
      state: { ...base('linear'), keyIdx: idx, homeIdx: home, probeIdx: i, collision, message: collision ? `槽 ${i} 为空，${key} 落位（从家乡 ${home} 偏移 ${i >= home ? i - home : i + M - home} 位）` : `槽 ${i} 为空，${key} 直接落位` },
      description: `落位 ${i}`,
      codeLine: 6,
    });
  });

  // ---- chaining ----
  steps.push({
    state: { ...base('chain'), message: '方法② 链地址法：每个槽挂一条链表，哈希相同的键全部追加到链尾，永不探查别的槽' },
    description: '② 链地址法',
    codeLine: 10,
  });
  keys.forEach((key, idx) => {
    const home = key % M;
    const isCol = chain[home].length > 0;
    chain[home].push(key);
    steps.push({
      state: { ...base('chain'), keyIdx: idx, homeIdx: home, collision: isCol, message: isCol ? `h(${key})=${home}，桶 ${home} 已有 [${chain[home].slice(0, -1).join(', ')}] → 冲突！${key} 追加到链尾` : `h(${key})=${home}，桶 ${home} 为空，${key} 直接入桶` },
      description: isCol ? `冲突 → 桶${home}链尾` : `入桶 ${home}`,
      codeLine: 11,
    });
  });

  // ---- double hashing ----
  steps.push({
    state: { ...base('double'), message: '方法③ 再哈希（双重哈希）：冲突时按步长 h₂(key) = 5 - key%5 跳跃探查，避免一次聚集' },
    description: '③ 双重哈希',
    codeLine: 14,
  });
  keys.forEach((key, idx) => {
    const home = key % M;
    const step = 5 - (key % 5);
    steps.push({
      state: { ...base('double'), keyIdx: idx, homeIdx: home, probeIdx: home, message: `h₁(${key}) = ${home}，h₂(${key}) = ${step}，探查序列从 ${home} 开始每次跳 ${step}` },
      description: `h₁=${home} h₂=${step}`,
      codeLine: 16,
    });
    let i = home;
    let k = 0;
    let collision = false;
    while (double[i] !== null) {
      collision = true;
      const prev = i;
      k++;
      i = (home + k * step) % M;
      steps.push({
        state: { ...base('double'), keyIdx: idx, homeIdx: home, probeIdx: i, collision, message: `槽 ${prev} 被 ${double[prev]} 占用 → 第 ${k} 次再哈希：i = (${home} + ${k}×${step}) % 7 = ${i}` },
        description: `再哈希 → ${i}`,
        codeLine: 17,
      });
    }
    double[i] = key;
    steps.push({
      state: { ...base('double'), keyIdx: idx, homeIdx: home, probeIdx: i, collision, message: `槽 ${i} 为空，${key} 落位${collision ? `（共再哈希 ${k} 次）` : ''}` },
      description: `落位 ${i}`,
      codeLine: 18,
    });
  });

  steps.push({
    state: { ...base('double'), message: '对比：线性探测会产生一次聚集；链地址实现简单、删除方便；双重哈希分布均匀但计算两次哈希' },
    description: '三法对比',
    codeLine: 19,
  });

  return steps;
}

function SlotTable({ table, probeIdx, homeIdx, active }: {
  table: (number | null)[]; probeIdx: number | null; homeIdx: number | null; active: boolean;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {table.map((v, i) => (
        <div key={i} className="space-y-0.5">
          <div
            className={clsx(
              'w-10 h-10 flex items-center justify-center rounded text-sm font-mono border transition-all',
              active && i === probeIdx
                ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                : active && i === homeIdx
                  ? 'bg-blue-500/25 border-blue-400 text-blue-200'
                  : v !== null
                    ? 'bg-green-500/15 border-green-700 text-green-300'
                    : 'bg-bg border-edge text-ink-3',
            )}
          >
            {v ?? '·'}
          </div>
          <div className="w-10 text-center text-[9px] text-gray-600">{i}</div>
        </div>
      ))}
    </div>
  );
}

export function HashCollisionPanel() {
  const [keys, setKeys] = useState<number[]>([10, 22, 31, 4, 15, 28]);

  const steps = useMemo(() => buildSteps(keys), [keys]);
  const initial: HashState = {
    phase: 'linear', keys, keyIdx: -1,
    linearTable: new Array(M).fill(null),
    chainTable: Array.from({ length: M }, () => []),
    doubleTable: new Array(M).fill(null),
    probeIdx: null, homeIdx: null, collision: false, message: '',
  };

  return (
    <Stepper<HashState>
      steps={steps}
      initialState={initial}
      codeLines={hashCode}
      codeTitle="哈希冲突 Hash Collision"
      headerActions={
        <>
          <span className="text-sm text-gray-400">键序列(≤6个):</span>
          <input
            type="text"
            value={keys.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((v) => Number(v.trim())).filter((v) => Number.isInteger(v) && v >= 0);
              if (parsed.length >= 1) setKeys(parsed.slice(0, 6));
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40"
            placeholder="逗号分隔"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">
            黄色=正在探查的槽，蓝色=家乡槽 h(key)，绿色=已存放；红色边框=发生冲突
          </div>

          {/* key sequence */}
          <div className="flex gap-1 items-center flex-wrap">
            <span className="text-xs text-gray-500 mr-1">插入序列:</span>
            {state.keys.map((k, i) => (
              <div
                key={i}
                className={clsx(
                  'px-2 h-8 flex items-center justify-center rounded text-sm font-mono border transition-all',
                  i === state.keyIdx
                    ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                    : i < state.keyIdx
                      ? 'bg-green-500/10 border-green-800 text-green-400'
                      : 'bg-surface-2 border-edge-2 text-ink-3',
                )}
              >
                {k}
              </div>
            ))}
            {state.collision && (
              <span className="ml-2 px-2 py-1 rounded border border-red-500 bg-red-500/15 text-red-300 text-xs">冲突!</span>
            )}
          </div>

          {/* three methods */}
          <div className={clsx('space-y-2 p-3 rounded-lg border transition-all', state.phase === 'linear' ? 'border-blue-700 bg-blue-900/10' : 'border-edge opacity-60')}>
            <div className="text-xs text-gray-400">① 开放寻址 · 线性探测 <span className="text-gray-600">i = (i + 1) % M</span></div>
            <SlotTable table={state.linearTable} probeIdx={state.probeIdx} homeIdx={state.homeIdx} active={state.phase === 'linear'} />
          </div>

          <div className={clsx('space-y-2 p-3 rounded-lg border transition-all', state.phase === 'chain' ? 'border-blue-700 bg-blue-900/10' : 'border-edge opacity-60')}>
            <div className="text-xs text-gray-400">② 链地址法 <span className="text-gray-600">bucket[h].push(key)</span></div>
            <div className="space-y-1">
              {state.chainTable.map((bucket, i) => (
                <div key={i} className="flex items-center gap-1 text-xs font-mono">
                  <span className={clsx('w-6 h-6 flex items-center justify-center rounded border', state.phase === 'chain' && state.homeIdx === i ? 'border-blue-400 bg-blue-500/25 text-blue-200' : 'border-edge-2 bg-surface-2 text-ink-3')}>{i}</span>
                  <span className="text-gray-600">→</span>
                  {bucket.length === 0 && <span className="text-gray-700">∅</span>}
                  {bucket.map((v, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <span className={clsx('px-1.5 h-6 flex items-center justify-center rounded border', state.phase === 'chain' && state.homeIdx === i && j === bucket.length - 1 && state.keyIdx >= 0 ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200' : 'border-green-700 bg-green-500/15 text-green-300')}>
                        {v}
                      </span>
                      {j < bucket.length - 1 && <span className="text-gray-600">→</span>}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className={clsx('space-y-2 p-3 rounded-lg border transition-all', state.phase === 'double' ? 'border-blue-700 bg-blue-900/10' : 'border-edge opacity-60')}>
            <div className="text-xs text-gray-400">③ 再哈希 · 双重哈希 <span className="text-gray-600">i = (h₁ + k·h₂) % M</span></div>
            <SlotTable table={state.doubleTable} probeIdx={state.probeIdx} homeIdx={state.homeIdx} active={state.phase === 'double'} />
          </div>

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
