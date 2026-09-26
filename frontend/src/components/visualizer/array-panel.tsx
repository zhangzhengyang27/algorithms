'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const arrayCode = [
  'function access(arr, i) {',
  '  return arr[i];',
  '}',
  'function traverse(arr) {',
  '  for (let i = 0; i < arr.length; i++) visit(arr[i]);',
  '}',
  'function insert(arr, pos, val) {',
  '  for (let i = arr.length - 1; i >= pos; i--)',
  '    arr[i + 1] = arr[i];',
  '  arr[pos] = val;',
  '}',
  'function remove(arr, pos) {',
  '  for (let i = pos + 1; i < arr.length; i++)',
  '    arr[i - 1] = arr[i];',
  '  arr.length--;',
  '}',
];

const BASE_ADDR = 0x1000;
const ELEM_SIZE = 4;

interface ArrayState {
  cells: (number | null)[];
  length: number;
  ptr: number;
  moving: { from: number; to: number } | null;
  highlightIdx: number;
  phase: 'init' | 'access' | 'traverse' | 'insert' | 'delete' | 'done';
  message: string;
}

function buildSteps(init: number[], insPos: number, insVal: number, delPos: number): VizStep<ArrayState>[] {
  const steps: VizStep<ArrayState>[] = [];
  const capacity = init.length + 3;
  const cells: (number | null)[] = new Array(capacity).fill(null);
  init.forEach((v, i) => { cells[i] = v; });
  let length = init.length;

  const snap = (partial: Partial<ArrayState> & { message: string }): ArrayState => ({
    cells: [...cells],
    length,
    ptr: -1,
    moving: null,
    highlightIdx: -1,
    phase: 'init',
    ...partial,
  });

  steps.push({
    state: snap({ message: `数组在内存中连续存放，基址 0x${BASE_ADDR.toString(16).toUpperCase()}，每个元素占 ${ELEM_SIZE} 字节` }),
    description: '连续内存',
    codeLine: 1,
  });

  // Random access
  const ai = Math.min(3, length - 1);
  const addr = BASE_ADDR + ai * ELEM_SIZE;
  steps.push({
    state: snap({ ptr: ai, highlightIdx: ai, phase: 'access', message: `随机访问 arr[${ai}]：地址 = 基址 + ${ai}×${ELEM_SIZE} = 0x${addr.toString(16).toUpperCase()}，O(1) 直接定位` }),
    description: `访问 arr[${ai}]`,
    codeLine: 1,
  });

  // Traverse
  for (let i = 0; i < length; i++) {
    steps.push({
      state: snap({ ptr: i, phase: 'traverse', message: `顺序遍历：访问 arr[${i}] = ${cells[i]}` }),
      description: `遍历 [${i}]`,
      codeLine: 4,
    });
  }

  // Insert
  const pos = Math.max(0, Math.min(insPos, length));
  steps.push({
    state: snap({ highlightIdx: pos, phase: 'insert', message: `在位置 ${pos} 插入 ${insVal}：先将末尾元素逐个后移腾出空位` }),
    description: `插入 @${pos}`,
    codeLine: 7,
  });
  for (let i = length - 1; i >= pos; i--) {
    cells[i + 1] = cells[i];
    steps.push({
      state: snap({ moving: { from: i, to: i + 1 }, phase: 'insert', message: `arr[${i + 1}] = arr[${i}]：元素 ${cells[i]} 后移一位` }),
      description: `后移 [${i}]→[${i + 1}]`,
      codeLine: 8,
    });
  }
  cells[pos] = insVal;
  length++;
  steps.push({
    state: snap({ highlightIdx: pos, phase: 'insert', message: `arr[${pos}] = ${insVal}，插入完成，长度变为 ${length}（最坏 O(n)）` }),
    description: `arr[${pos}]=${insVal}`,
    codeLine: 9,
  });

  // Delete
  const dpos = Math.max(0, Math.min(delPos, length - 1));
  const removedVal = cells[dpos];
  steps.push({
    state: snap({ highlightIdx: dpos, phase: 'delete', message: `删除位置 ${dpos} 的元素 ${removedVal}：将其后元素逐个前移` }),
    description: `删除 @${dpos}`,
    codeLine: 12,
  });
  for (let i = dpos + 1; i < length; i++) {
    cells[i - 1] = cells[i];
    steps.push({
      state: snap({ moving: { from: i, to: i - 1 }, phase: 'delete', message: `arr[${i - 1}] = arr[${i}]：元素 ${cells[i]} 前移一位` }),
      description: `前移 [${i}]→[${i - 1}]`,
      codeLine: 13,
    });
  }
  cells[length - 1] = null;
  length--;
  steps.push({
    state: snap({ phase: 'delete', message: `length--，删除完成，长度变为 ${length}（最坏 O(n)）` }),
    description: '长度 -1',
    codeLine: 14,
  });

  steps.push({
    state: snap({ phase: 'done', message: '数组：随机访问 O(1)，插入/删除需移动元素 O(n)' }),
    description: '总结',
    codeLine: 1,
  });

  return steps;
}

export function ArrayPanel() {
  const [seed, setSeed] = useState<number[]>([7, 3, 9, 1, 5, 2, 8]);
  const [insertText, setInsertText] = useState('2,6');
  const [deleteText, setDeleteText] = useState('2');

  const [insPos, insVal] = useMemo(() => {
    const p = insertText.split(',').map((s) => Number(s.trim()));
    return p.length === 2 && p.every(Number.isFinite) ? [Math.max(0, p[0]), p[1]] : [2, 6];
  }, [insertText]);

  const delPos = useMemo(() => {
    const v = Number(deleteText.trim());
    return Number.isFinite(v) ? Math.max(0, v) : 2;
  }, [deleteText]);

  const steps = useMemo(() => buildSteps(seed, insPos, insVal, delPos), [seed, insPos, insVal, delPos]);

  const capacity = seed.length + 3;
  const initialCells: (number | null)[] = new Array(capacity).fill(null);
  seed.forEach((v, i) => { initialCells[i] = v; });

  const initial: ArrayState = {
    cells: initialCells,
    length: seed.length,
    ptr: -1,
    moving: null,
    highlightIdx: -1,
    phase: 'init',
    message: '',
  };

  return (
    <Stepper<ArrayState>
      steps={steps}
      initialState={initial}
      codeLines={arrayCode}
      codeTitle="数组基础 Array Basics"
      headerActions={
        <>
          <span className="text-sm text-gray-400">数组:</span>
          <input
            type="text"
            value={seed.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => Number(s.trim())).filter((x) => Number.isFinite(x));
              if (parsed.length >= 2 && parsed.length <= 9) setSeed(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-40"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">插入(pos,val):</span>
          <input
            type="text"
            value={insertText}
            onChange={(e) => setInsertText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
            placeholder="如 2,6"
          />
          <span className="text-sm text-gray-400">删除(pos):</span>
          <input
            type="text"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-12"
            placeholder="如 2"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">
            黄色=指针/目标位置，红色=移动源，绿色=移动目标/写入，虚线框=空闲槽位
          </div>

          {/* Memory layout */}
          <div className="flex justify-center">
            <div className="flex gap-1 flex-wrap justify-center">
              {state.cells.map((v, i) => {
                const isEmpty = i >= state.length;
                const isPtr = i === state.ptr;
                const isFrom = state.moving?.from === i;
                const isTo = state.moving?.to === i;
                const isHl = i === state.highlightIdx;
                const addr = (BASE_ADDR + i * ELEM_SIZE).toString(16).toUpperCase();
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={clsx('h-5 text-xs leading-5', isPtr ? 'text-yellow-400' : 'text-transparent')}>▼</div>
                    <div
                      className={clsx(
                        'h-12 flex items-center justify-center rounded border font-mono text-sm transition-all',
                        isEmpty
                          ? 'border-dashed border-edge-2 bg-transparent text-gray-700'
                          : isFrom
                            ? 'bg-red-500/25 border-red-500 text-red-200'
                            : isTo
                              ? 'bg-green-500/25 border-green-500 text-green-200 scale-105'
                              : isHl
                                ? 'bg-yellow-500/25 border-yellow-400 text-yellow-200'
                                : isPtr
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                                  : 'bg-surface-2 border-edge-2 text-ink-2',
                      )}
                      style={{ width: 52 }}
                    >
                      {isEmpty ? '' : v}
                    </div>
                    <div className="text-[9px] text-gray-500 mt-0.5">{i}</div>
                    <div className="text-[8px] text-gray-700 font-mono">0x{addr}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Length indicator */}
          <div className="text-center text-xs font-mono text-gray-400">
            length = <span className="text-blue-300 font-bold">{state.length}</span>
            <span className="text-gray-600 ml-3">capacity = {state.cells.length}</span>
          </div>

          {/* Moving arrow */}
          {state.moving && (
            <div className="text-center text-sm font-mono text-yellow-300">
              [{state.moving.from}] → [{state.moving.to}]
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
