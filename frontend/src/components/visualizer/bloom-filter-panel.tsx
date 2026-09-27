'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const bloomCode = [
  'function hash1(s) { let h = 0; for (c of s) h = (h*31 + c) % m; return h; }',
  'function hash2(s) { let h = 7; for (c of s) h = (h*17 + c) % m; return h; }',
  'function hash3(s) { let h = 0; for (c of s) h = (h*131 + c) % m; return h; }',
  'function add(s) { bits[hash1(s)]=bits[hash2(s)]=bits[hash3(s)]=1; }',
  'function has(s) { return bits[hash1(s)] && bits[hash2(s)] && bits[hash3(s)]; }',
];

interface BloomState {
  m: number;
  bits: number[];
  active: number[];
  inserted: string[];
  query: string | null;
  result: string | null;
  message: string;
}

function hashes(s: string, m: number): number[] {
  const code = (str: string) => str.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const h = (seed: number, mult: number) => {
    let v = code(s) * 0 + seed;
    for (const c of s) v = (v * mult + c.charCodeAt(0)) % m;
    return v;
  };
  return [h(0, 31), h(7, 17), h(0, 131)].map((x) => ((x % m) + m) % m);
}

export function buildSteps(m: number, items: string[], query: string): VizStep<BloomState>[] {
  const steps: VizStep<BloomState>[] = [];
  const bits = new Array(m).fill(0);
  const inserted: string[] = [];

  const snap = (active: number[], q: string | null, result: string | null, msg: string, cl: number): VizStep<BloomState> => ({
    state: { m, bits: [...bits], active: [...active], inserted: [...inserted], query: q, result, message: msg },
    description: msg,
    codeLine: cl,
  });

  steps.push(snap([], null, null, `布隆过滤器：m=${m} 位，3 个哈希函数。插入置位，查询检查是否全为 1`, 1));

  for (const s of items) {
    const hs = hashes(s, m);
    steps.push(snap(hs, s, null, `插入 "${s}"，哈希位 ${hs.join(', ')} 置 1`, 4));
    for (const x of hs) bits[x] = 1;
    inserted.push(s);
  }

  if (query) {
    const hs = hashes(query, m);
    const allSet = hs.every((x) => bits[x] === 1);
    steps.push(snap(hs, query, allSet ? '可能存在' : '一定不存在', `查询 "${query}"：哈希位 ${hs.join(', ')} 均=${hs.every((x) => bits[x] === 1)} → ${allSet ? '可能存在(有误判可能)' : '一定不存在'}`, 5));
  }

  steps.push(snap([], null, null, `✅ 演示完成，已插入 ${inserted.length} 个元素`, 5));
  return steps;
}

export function BloomFilterPanel() {
  const [m, setM] = useState(16);
  const [itemsText, setItemsText] = useState('apple,banana,cherry');
  const [query, setQuery] = useState('apple');

  const items = useMemo(() => itemsText.split(',').map((s) => s.trim()).filter(Boolean), [itemsText]);
  const steps = useMemo(() => buildSteps(m, items, query), [m, items, query]);
  const initial: BloomState = { m, bits: [], active: [], inserted: [], query: null, result: null, message: '' };

  return (
    <Stepper<BloomState>
      steps={steps}
      initialState={initial}
      codeLines={bloomCode}
      codeTitle="布隆过滤器 Bloom Filter"
      headerActions={
        <>
          <span className="text-sm text-gray-400">位数 m:</span>
          <input type="number" value={m} onChange={(e) => setM(Math.max(8, Math.min(64, Number(e.target.value) || 16)))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16" />
          <span className="text-sm text-gray-400">插入:</span>
          <input type="text" value={itemsText} onChange={(e) => setItemsText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40" />
          <span className="text-sm text-gray-400">查询:</span>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-24" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">绿色=已置位的 bit，红色=当前哈希命中位，黄色框=查询结果</div>
          <div className="flex gap-1 flex-wrap justify-center">
            {Array.from({ length: state.m }, (_, i) => (
              <div key={i} className={clsx('w-7 h-7 flex items-center justify-center rounded text-[10px] font-mono border', state.active.includes(i) ? 'bg-red-500/30 border-red-400 text-red-200' : state.bits[i] ? 'bg-green-500/25 border-green-500/50 text-green-300' : 'bg-surface-2 border-edge-2 text-gray-600')}>
                {state.bits[i] ? 1 : 0}
              </div>
            ))}
          </div>
          <div className="text-center text-sm">
            已插入：{state.inserted.length ? state.inserted.map((s) => `"${s}"`).join(', ') : '（无）'}
            {state.query !== null && (
              <span className={clsx('ml-2 px-2 py-0.5 rounded', state.result === '一定不存在' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-200')}>
                查询结果 "{state.query}"：{state.result}
              </span>
            )}
          </div>
          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
