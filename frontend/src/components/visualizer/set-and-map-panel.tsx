'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const setMapCode = [
  'const set = new Set();',
  'const map = new Map();',
  '',
  'set.add(5);            // 添加元素',
  'set.has(3);            // 查询是否存在 → true/false',
  'set.delete(3);         // 删除元素',
  '',
  'map.set("a", 1);       // 写入键值对',
  'map.get("a");          // 读取 → 值或 undefined',
  'map.delete("a");       // 删除键',
  '',
  'for (const v of set) console.log(v);',
  'set.size;              // 大小 O(1)',
];

type Op =
  | { type: 'set-add'; value: number }
  | { type: 'set-has'; value: number }
  | { type: 'set-delete'; value: number }
  | { type: 'map-set'; key: string; value: number }
  | { type: 'map-get'; key: string }
  | { type: 'map-delete'; key: string };

const SCRIPT: Op[] = [
  { type: 'set-add', value: 5 },
  { type: 'set-add', value: 3 },
  { type: 'set-add', value: 9 },
  { type: 'set-add', value: 3 },
  { type: 'set-has', value: 3 },
  { type: 'set-has', value: 7 },
  { type: 'set-delete', value: 3 },
  { type: 'map-set', key: 'apple', value: 3 },
  { type: 'map-set', key: 'banana', value: 5 },
  { type: 'map-set', key: 'cherry', value: 7 },
  { type: 'map-get', key: 'banana' },
  { type: 'map-get', key: 'durian' },
  { type: 'map-delete', key: 'apple' },
  { type: 'set-add', value: 7 },
];

interface SetMapState {
  setItems: number[];
  mapEntries: { key: string; value: number }[];
  opType: string;
  opKey: string;
  opValue: number | null;
  opResult: string;
  highlightSet: number | null;
  highlightMapKey: string | null;
  message: string;
}

function buildSteps(): VizStep<SetMapState>[] {
  const steps: VizStep<SetMapState>[] = [];
  const set = new Set<number>();
  const map = new Map<string, number>();

  const snap = (extra: Partial<SetMapState> & { message: string }): SetMapState => ({
    setItems: [...set],
    mapEntries: [...map.entries()].map(([key, value]) => ({ key, value })),
    opType: '', opKey: '', opValue: null, opResult: '',
    highlightSet: null, highlightMapKey: null,
    ...extra,
  });

  steps.push({ state: snap({ message: '初始：空 Set 与空 Map' }), description: '初始化', codeLine: 0 });

  for (const op of SCRIPT) {
    if (op.type === 'set-add') {
      const existed = set.has(op.value);
      set.add(op.value);
      steps.push({
        state: snap({ opType: 'add', opValue: op.value, highlightSet: op.value, message: existed ? `set.add(${op.value})：${op.value} 已存在，自动去重，size 不变 = ${set.size}` : `set.add(${op.value})：插入成功，size = ${set.size}` }),
        description: `add(${op.value})`,
        codeLine: 3,
      });
    } else if (op.type === 'set-has') {
      const r = set.has(op.value);
      steps.push({
        state: snap({ opType: 'has', opValue: op.value, highlightSet: r ? op.value : null, opResult: String(r), message: `set.has(${op.value}) → ${r}（平均 O(1)）` }),
        description: `has(${op.value})=${r}`,
        codeLine: 4,
      });
    } else if (op.type === 'set-delete') {
      const r = set.delete(op.value);
      steps.push({
        state: snap({ opType: 'delete', opValue: op.value, opResult: String(r), message: `set.delete(${op.value}) → ${r}，size = ${set.size}` }),
        description: `delete(${op.value})`,
        codeLine: 5,
      });
    } else if (op.type === 'map-set') {
      const existed = map.has(op.key);
      map.set(op.key, op.value);
      steps.push({
        state: snap({ opType: 'map-set', opKey: op.key, opValue: op.value, highlightMapKey: op.key, message: existed ? `map.set("${op.key}", ${op.value})：键已存在，覆盖旧值` : `map.set("${op.key}", ${op.value})：新增键值对，size = ${map.size}` }),
        description: `set(${op.key})`,
        codeLine: 7,
      });
    } else if (op.type === 'map-get') {
      const r = map.get(op.key);
      steps.push({
        state: snap({ opType: 'map-get', opKey: op.key, highlightMapKey: map.has(op.key) ? op.key : null, opResult: r === undefined ? 'undefined' : String(r), message: `map.get("${op.key}") → ${r === undefined ? 'undefined（键不存在）' : r}` }),
        description: `get(${op.key})`,
        codeLine: 8,
      });
    } else {
      const r = map.delete(op.key);
      steps.push({
        state: snap({ opType: 'map-delete', opKey: op.key, opResult: String(r), message: `map.delete("${op.key}") → ${r}，size = ${map.size}` }),
        description: `delete(${op.key})`,
        codeLine: 9,
      });
    }
  }

  steps.push({
    state: snap({ message: `最终：Set = {${[...set].join(', ')}}，Map = {${[...map.entries()].map(([k, v]) => `${k}→${v}`).join(', ')}}` }),
    description: '完成',
    codeLine: 12,
  });
  return steps;
}

const BUCKETS = 4;

export function SetAndMapPanel() {
  const steps = useMemo(() => buildSteps(), []);
  const initial: SetMapState = {
    setItems: [], mapEntries: [], opType: '', opKey: '', opValue: null,
    opResult: '', highlightSet: null, highlightMapKey: null, message: '',
  };

  return (
    <Stepper<SetMapState>
      steps={steps}
      initialState={initial}
      codeLines={setMapCode}
      codeTitle="集合与映射 Set & Map"
      render={(state) => {
        const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
        for (const v of state.setItems) buckets[((v % BUCKETS) + BUCKETS) % BUCKETS].push(v);
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-500">
              Set 按哈希（值 % {BUCKETS}）分布到桶中；黄色=正在操作的元素/键
            </div>

            {/* Set buckets */}
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Set（size = {state.setItems.length}）· 哈希桶:</div>
              <div className="flex gap-3 flex-wrap">
                {buckets.map((b, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="text-[9px] text-gray-600 font-mono">桶{i}</div>
                    <div className="flex flex-col gap-1 min-h-[40px] w-14 p-1 rounded border border-edge-2 bg-surface-2">
                      {b.map((v) => (
                        <div
                          key={v}
                          className={clsx(
                            'h-7 flex items-center justify-center rounded text-xs font-mono border transition-all',
                            state.highlightSet === v
                              ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                              : 'bg-blue-500/15 border-blue-500/50 text-blue-200',
                          )}
                        >
                          {v}
                        </div>
                      ))}
                      {b.length === 0 && <div className="text-[9px] text-gray-700 text-center">空</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map entries */}
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Map（size = {state.mapEntries.length}）· 键值对:</div>
              <div className="flex gap-2 flex-wrap">
                {state.mapEntries.length === 0 && <span className="text-xs text-gray-600">（空）</span>}
                {state.mapEntries.map((e) => (
                  <div
                    key={e.key}
                    className={clsx(
                      'flex items-center gap-1 px-2 py-1.5 rounded border text-xs font-mono transition-all',
                      state.highlightMapKey === e.key
                        ? 'bg-yellow-500/25 border-yellow-400 text-yellow-200 scale-105'
                        : 'bg-surface-2 border-edge-2 text-gray-300',
                    )}
                  >
                    <span className="text-purple-300">&quot;{e.key}&quot;</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-green-300">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operation result */}
            {state.opResult && (
              <div className="text-center p-2 bg-blue-900/20 border border-blue-800 rounded-lg inline-block w-full">
                <span className="text-blue-300 font-mono text-sm">返回值: {state.opResult}</span>
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
