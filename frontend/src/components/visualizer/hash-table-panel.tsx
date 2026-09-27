'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const hashCode = [
  'class HashTable {',
  '  constructor(capacity = 5) {',
  '    this.buckets = new Array(capacity).fill(null).map(() => []);',
  '    this.capacity = capacity;',
  '  }',
  '',
  '  hash(key) {',
  '    return ((key % this.capacity) + this.capacity) % this.capacity;',
  '  }',
  '',
  '  put(key) {',
  '    const idx = this.hash(key);',
  '    if (this.buckets[idx].includes(key)) return; // 已存在',
  '    this.buckets[idx].push(key);',
  '  }',
  '',
  '  get(key) {',
  '    const idx = this.hash(key);',
  '    return this.buckets[idx].includes(key) ? key : null;',
  '  }',
  '}',
];

interface HashTableState {
  buckets: number[][];
  capacity: number;
  highlightBucket: number | null;
  highlightKey: number | null;
  error: string | null;
}

function hash(key: number, capacity: number): number {
  return ((key % capacity) + capacity) % capacity;
}

function put(state: HashTableState, key: number): HashTableState {
  if (state.buckets.some((b) => b.includes(key))) {
    return { ...state, error: `${key} 已存在` };
  }
  const buckets = state.buckets.map((b) => b.slice());
  const idx = hash(key, state.capacity);
  buckets[idx] = [...buckets[idx], key];
  return { ...state, buckets, highlightBucket: idx, highlightKey: key, error: null };
}

function get(state: HashTableState, key: number): HashTableState {
  const idx = hash(key, state.capacity);
  const exists = state.buckets[idx].includes(key);
  return {
    ...state,
    highlightBucket: idx,
    highlightKey: key,
    error: exists ? null : `未找到 ${key}`,
  };
}

export function buildSteps(seed: number[]): VizStep<HashTableState>[] {
  const capacity = 5;
  const steps: VizStep<HashTableState>[] = [];
  let state: HashTableState = {
    buckets: Array.from({ length: capacity }, () => []),
    capacity,
    highlightBucket: null,
    highlightKey: null,
    error: null,
  };
  steps.push({ state, description: `初始化 ${capacity} 个桶`, codeLine: 3 });

  for (const v of seed) {
    state = put(state, v);
    steps.push({ state, description: `插入 ${v} → 桶 ${hash(v, capacity)}`, codeLine: 14 });
  }
  const probe = seed[0] + 1;
  state = get(state, probe);
  steps.push({ state, description: `查找 ${probe} → 桶 ${hash(probe, capacity)}`, codeLine: 19 });
  return steps;
}

export function HashTablePanel() {
  const [seed, setSeed] = useState<number[]>([3, 8, 13, 21, 7, 4]);
  const [steps, setSteps] = useState(() => buildSteps(seed));
  const initial: HashTableState = {
    buckets: Array.from({ length: 5 }, () => []),
    capacity: 5,
    highlightBucket: null,
    highlightKey: null,
    error: null,
  };

  const rebuild = (next: number[]) => {
    setSeed(next);
    setSteps(buildSteps(next));
  };

  return (
    <Stepper<HashTableState>
      steps={steps}
      initialState={initial}
      codeLines={hashCode}
      codeTitle="哈希表 Hash Table"
      headerActions={
        <input
          type="text"
          value={seed.join(',')}
          onChange={(e) => {
            const parsed = e.target.value
              .split(',')
              .map((s) => Number(s.trim()))
              .filter((n) => Number.isFinite(n));
            if (parsed.length > 0) rebuild(parsed);
          }}
          className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40"
          placeholder="逗号分隔"
        />
      }
      render={(state) => (
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {state.buckets.map((bucket, i) => {
              const highlighted = state.highlightBucket === i;
              return (
                <div
                  key={i}
                  className={clsx(
                    'p-2 rounded border min-h-[120px] transition-all',
                    highlighted
                      ? 'bg-blue-500/10 border-blue-500'
                      : 'bg-bg border-edge',
                  )}
                >
                  <div className="text-xs text-gray-500 mb-2 text-center">桶 {i}</div>
                  <div className="flex flex-col gap-1 items-center">
                    {bucket.length === 0 && (
                      <div className="text-gray-700 text-xs">—</div>
                    )}
                    {bucket.map((v) => {
                      const isHighlighted = state.highlightKey === v;
                      return (
                        <div
                          key={v}
                          className={clsx(
                            'px-2 py-1 rounded text-sm font-medium w-full text-center',
                            isHighlighted
                              ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-200'
                              : 'bg-surface-2 border border-edge text-gray-200',
                          )}
                        >
                          {v}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {state.error && (
            <div className="text-center text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded inline-block">
              {state.error}
            </div>
          )}
          <div className="text-center text-xs text-gray-500">
            哈希函数: <code className="text-blue-400">key % {state.capacity}</code>
          </div>
        </div>
      )}
    />
  );
}
