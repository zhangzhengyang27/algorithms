'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const lruCode = [
  'class LRUCache {',
  '  constructor(capacity) { this.cap = capacity; this.map = new Map(); }',
  '  get(key) {',
  '    if (!this.map.has(key)) return -1;',
  '    const val = this.map.get(key);',
  '    this.map.delete(key); this.map.set(key, val);',
  '    return val;',
  '  }',
  '  put(key, val) {',
  '    this.map.delete(key);',
  '    if (this.map.size >= this.cap) this.map.delete(this.map.keys().next().value);',
  '    this.map.set(key, val);',
  '  }',
  '}',
];

interface LRUEntry {
  key: number;
  val: number;
}

interface LRUState {
  list: LRUEntry[]; // head = most recent
  capacity: number;
  activeKey: number;
  action: 'get' | 'put' | 'evict' | '';
  evicted: LRUEntry | null;
  message: string;
}

type Op = { type: 'get'; key: number } | { type: 'put'; key: number; val: number };

export function buildSteps(capacity: number, ops: Op[]): VizStep<LRUState>[] {
  const steps: VizStep<LRUState>[] = [];
  let list: LRUEntry[] = [];

  const snap = (active: number, action: LRUState['action'], evicted: LRUEntry | null, msg: string): LRUState => ({
    list: list.map((e) => ({ ...e })), capacity, activeKey: active, action, evicted, message: msg,
  });

  steps.push({ state: snap(-1, '', null, `初始化 LRU 缓存，容量 = ${capacity}`), description: '初始化', codeLine: 2 });

  for (const op of ops) {
    if (op.type === 'get') {
      const idx = list.findIndex((e) => e.key === op.key);
      if (idx === -1) {
        steps.push({ state: snap(op.key, 'get', null, `get(${op.key})：未命中，返回 -1`), description: `get(${op.key}) miss`, codeLine: 4 });
      } else {
        const entry = list.splice(idx, 1)[0];
        list.unshift(entry);
        steps.push({ state: snap(op.key, 'get', null, `get(${op.key})：命中！值=${entry.val}，移到头部`), description: `get(${op.key}) hit`, codeLine: 6 });
      }
    } else {
      const idx = list.findIndex((e) => e.key === op.key);
      if (idx !== -1) {
        list.splice(idx, 1);
        list.unshift({ key: op.key, val: op.val });
        steps.push({ state: snap(op.key, 'put', null, `put(${op.key},${op.val})：已存在，更新值并移到头部`), description: `put(${op.key}) 更新`, codeLine: 10 });
      } else {
        if (list.length >= capacity) {
          const evicted = list.pop()!;
          steps.push({ state: snap(op.key, 'evict', evicted, `容量已满，淘汰尾部 key=${evicted.key}`), description: `淘汰 ${evicted.key}`, codeLine: 11 });
        }
        list.unshift({ key: op.key, val: op.val });
        steps.push({ state: snap(op.key, 'put', null, `put(${op.key},${op.val})：插入头部`), description: `put(${op.key},${op.val})`, codeLine: 12 });
      }
    }
  }

  return steps;
}

export function LRUPanel() {
  const [capacity, setCapacity] = useState(3);
  const [opsText, setOpsText] = useState('put,1,1 put,2,2 put,3,3 get,1 put,4,4 get,2 put,5,5 get,3');

  const ops = useMemo<Op[]>(() => {
    return opsText.split(/\s+/).map((s) => {
      const parts = s.split(',');
      if (parts[0] === 'get') return { type: 'get' as const, key: Number(parts[1]) };
      return { type: 'put' as const, key: Number(parts[1]), val: Number(parts[2]) };
    }).filter((op) => Number.isFinite(op.key));
  }, [opsText]);

  const steps = useMemo(() => buildSteps(capacity, ops), [capacity, ops]);
  const initial: LRUState = { list: [], capacity, activeKey: -1, action: '', evicted: null, message: '' };

  return (
    <Stepper<LRUState>
      steps={steps}
      initialState={initial}
      codeLines={lruCode}
      codeTitle="LRU 缓存"
      headerActions={
        <>
          <span className="text-sm text-gray-400">容量:</span>
          <input type="number" value={capacity} onChange={(e) => setCapacity(Math.max(1, Math.min(8, Number(e.target.value))))} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-12" />
          <span className="text-sm text-gray-400">操作:</span>
          <input type="text" value={opsText} onChange={(e) => setOpsText(e.target.value)} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-80" placeholder="put,1,1 get,2 put,3,3" />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">左=最近使用（头部），右=最久未用（尾部），黄色=当前操作，红色=淘汰</div>

          {/* Doubly linked list view */}
          <div className="flex items-center justify-center gap-1 min-h-[80px] flex-wrap">
            <span className="text-xs text-gray-600 mr-2">HEAD</span>
            {state.list.map((entry, i) => (
              <div key={entry.key} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-600 text-xs">⇄</span>}
                <div className={clsx('flex flex-col items-center px-3 py-2 rounded-lg border-2 transition-all', entry.key === state.activeKey ? 'bg-yellow-500/20 border-yellow-400 scale-105' : state.evicted?.key === entry.key ? 'bg-red-500/20 border-red-400' : 'bg-surface-2 border-edge-2')}>
                  <span className="text-xs font-mono text-gray-300">k={entry.key}</span>
                  <span className="text-[10px] font-mono text-gray-500">v={entry.val}</span>
                </div>
              </div>
            ))}
            <span className="text-xs text-gray-600 ml-2">TAIL</span>
          </div>

          {/* Capacity indicator */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-500">使用量:</span>
            <div className="flex gap-1">
              {Array.from({ length: state.capacity }, (_, i) => (
                <div key={i} className={clsx('w-4 h-4 rounded-sm', i < state.list.length ? 'bg-blue-500/60' : 'bg-surface-2 border border-edge-2')} />
              ))}
            </div>
            <span className="text-xs text-gray-500">{state.list.length}/{state.capacity}</span>
          </div>

          {state.evicted && (
            <div className="text-center text-xs text-red-400">淘汰: key={state.evicted.key}</div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
