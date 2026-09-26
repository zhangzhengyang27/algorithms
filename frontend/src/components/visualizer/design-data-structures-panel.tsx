'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const circularQueueCode = [
  'class MyCircularQueue {',
  '  constructor(k) {',
  '    this.arr = new Array(k).fill(null);',
  '    this.front = 0; this.rear = -1; this.size = 0;',
  '  }',
  '  enQueue(value) {',
  '    if (this.isFull()) return false;',
  '    this.rear = (this.rear + 1) % this.arr.length;',
  '    this.arr[this.rear] = value; this.size++;',
  '    return true;',
  '  }',
  '  deQueue() {',
  '    if (this.isEmpty()) return false;',
  '    this.arr[this.front] = null;',
  '    this.front = (this.front + 1) % this.arr.length;',
  '    this.size--; return true;',
  '  }',
  '  isEmpty() { return this.size === 0; }',
  '  isFull() { return this.size === this.arr.length; }',
  '}',
];

interface CQState {
  arr: (number | null)[];
  front: number;
  rear: number;
  size: number;
  opIdx: number;
  highlightIdx: number;
  highlightType: 'enq' | 'deq' | 'none';
  message: string;
  result: string | null;
}

type Op = { type: 'enq'; value: number } | { type: 'deq' };

function buildSteps(capacity: number, ops: Op[]): VizStep<CQState>[] {
  const steps: VizStep<CQState>[] = [];
  const arr: (number | null)[] = new Array(capacity).fill(null);
  let front = 0;
  let rear = -1;
  let size = 0;

  const snap = (opIdx: number, highlightIdx: number, highlightType: 'enq' | 'deq' | 'none', message: string, result: string | null): CQState => ({
    arr: [...arr],
    front,
    rear,
    size,
    opIdx,
    highlightIdx,
    highlightType,
    message,
    result,
  });

  steps.push({
    state: snap(-1, -1, 'none', `创建容量为 ${capacity} 的循环队列：front=0, rear=-1, size=0`, null),
    description: '初始化队列',
    codeLine: 3,
  });

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (op.type === 'enq') {
      steps.push({
        state: snap(i, -1, 'none', `执行 enQueue(${op.value})，先检查 isFull()：size=${size} ${size === capacity ? '== capacity，已满！' : `< ${capacity}，未满`}`, null),
        description: `enQueue(${op.value}) 检查`,
        codeLine: 6,
      });
      if (size === capacity) {
        steps.push({
          state: snap(i, -1, 'none', `队列已满 (size=${size}=capacity)，enQueue(${op.value}) 失败，返回 false`, 'false'),
          description: `入队失败(满)`,
          codeLine: 6,
        });
        continue;
      }
      const oldRear = rear;
      rear = (rear + 1) % capacity;
      steps.push({
        state: snap(i, rear, 'enq', `rear = (${oldRear} + 1) % ${capacity} = ${rear}（取模实现循环）`, null),
        description: `rear→${rear}`,
        codeLine: 7,
      });
      arr[rear] = op.value;
      size++;
      steps.push({
        state: snap(i, rear, 'enq', `arr[${rear}] = ${op.value}，size++ → ${size}，入队成功`, 'true'),
        description: `${op.value} 入队成功`,
        codeLine: 8,
      });
    } else {
      steps.push({
        state: snap(i, -1, 'none', `执行 deQueue()，先检查 isEmpty()：size=${size} ${size === 0 ? '== 0，为空！' : '> 0，非空'}`, null),
        description: 'deQueue 检查',
        codeLine: 12,
      });
      if (size === 0) {
        steps.push({
          state: snap(i, -1, 'none', '队列为空，deQueue() 失败，返回 false', 'false'),
          description: '出队失败(空)',
          codeLine: 12,
        });
        continue;
      }
      const oldFront = front;
      const val = arr[front];
      arr[front] = null;
      steps.push({
        state: snap(i, oldFront, 'deq', `取出 arr[${oldFront}] = ${val}，置为 null 释放位置`, null),
        description: `取出 ${val}`,
        codeLine: 13,
      });
      front = (front + 1) % capacity;
      size--;
      steps.push({
        state: snap(i, oldFront, 'deq', `front = (${oldFront} + 1) % ${capacity} = ${front}，size-- → ${size}，出队成功`, 'true'),
        description: `front→${front}`,
        codeLine: 14,
      });
    }
  }

  steps.push({
    state: snap(-1, -1, 'none', `所有操作完成。最终状态：size=${size}，队列${size === 0 ? '为空' : size === capacity ? '已满' : `有 ${size} 个元素`}`, null),
    description: '操作完成',
    codeLine: 19,
  });

  return steps;
}

function parseOps(text: string): Op[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      const m = tok.match(/^enq\((\d+)\)$/i);
      if (m) return { type: 'enq' as const, value: Number(m[1]) };
      if (/^deq$/i.test(tok)) return { type: 'deq' as const };
      const num = Number(tok);
      if (Number.isFinite(num)) return { type: 'enq' as const, value: num };
      return null;
    })
    .filter((o): o is Op => o !== null);
}

export function DesignDataStructuresPanel() {
  const [capacity, setCapacity] = useState(5);
  const [opsText, setOpsText] = useState('enq(1) enq(2) enq(3) deq enq(4) enq(5) enq(6) deq deq enq(7)');

  const ops = useMemo(() => parseOps(opsText), [opsText]);
  const steps = useMemo(() => buildSteps(capacity, ops), [capacity, ops]);

  const initial: CQState = {
    arr: new Array(capacity).fill(null),
    front: 0,
    rear: -1,
    size: 0,
    opIdx: -1,
    highlightIdx: -1,
    highlightType: 'none',
    message: '',
    result: null,
  };

  return (
    <Stepper<CQState>
      steps={steps}
      initialState={initial}
      codeLines={circularQueueCode}
      codeTitle="循环队列 Circular Queue"
      headerActions={
        <>
          <span className="text-sm text-gray-400">容量:</span>
          <input
            type="number"
            value={capacity}
            min={2}
            max={8}
            onChange={(e) => setCapacity(Math.max(2, Math.min(8, Number(e.target.value) || 2)))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
          <span className="text-sm text-gray-400">操作序列:</span>
          <input
            type="text"
            value={opsText}
            onChange={(e) => setOpsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-72"
            placeholder="如 enq(1) enq(2) deq"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            绿色=入队位置，红色=出队位置，蓝色=front 指针，黄色=rear 指针
          </div>

          {/* Operation sequence */}
          <div className="flex gap-1 flex-wrap items-center">
            <span className="text-xs text-gray-500 mr-1">操作:</span>
            {ops.map((op, i) => (
              <span
                key={i}
                className={clsx(
                  'px-2 py-0.5 rounded text-xs font-mono border transition-all',
                  i === state.opIdx
                    ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
                    : i < state.opIdx
                      ? 'bg-surface-2 border-edge-2 text-ink-3'
                      : 'bg-surface-2 border-edge-2 text-ink-2',
                )}
              >
                {op.type === 'enq' ? `enq(${op.value})` : 'deq'}
              </span>
            ))}
          </div>

          {/* Circular queue array */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">底层数组 arr[] (容量 {capacity}):</div>
            <div className="flex gap-2 flex-wrap">
              {state.arr.map((v, i) => {
                const isFront = i === state.front && state.size > 0;
                const isRear = i === state.rear && state.size > 0;
                const isHighlight = i === state.highlightIdx;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={clsx(
                        'w-12 h-12 flex items-center justify-center rounded text-sm font-mono border-2 transition-all',
                        isHighlight && state.highlightType === 'enq'
                          ? 'bg-green-500/30 border-green-400 text-green-200 scale-110'
                          : isHighlight && state.highlightType === 'deq'
                            ? 'bg-red-500/30 border-red-400 text-red-200 scale-110'
                            : v !== null
                              ? 'bg-blue-500/10 border-blue-800 text-blue-200'
                              : 'bg-surface-2 border-edge-2 text-ink-3',
                      )}
                    >
                      {v !== null ? v : '∅'}
                    </div>
                    <div className="text-[9px] text-gray-600">{i}</div>
                    <div className="flex gap-0.5 h-4">
                      {isFront && (
                        <span className="text-[9px] px-1 rounded bg-blue-500/30 text-blue-300 font-bold">F</span>
                      )}
                      {isRear && (
                        <span className="text-[9px] px-1 rounded bg-yellow-500/30 text-yellow-300 font-bold">R</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex gap-3 text-sm font-mono">
              <span className="text-blue-300">front = {state.front}</span>
              <span className="text-yellow-300">rear = {state.rear}</span>
              <span className="text-gray-300">size = {state.size}/{capacity}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className={clsx('px-2 py-0.5 rounded border', state.size === 0 ? 'border-red-500 text-red-300 bg-red-500/10' : 'border-edge-2 text-gray-500')}>
                isEmpty: {String(state.size === 0)}
              </span>
              <span className={clsx('px-2 py-0.5 rounded border', state.size === capacity ? 'border-orange-500 text-orange-300 bg-orange-500/10' : 'border-edge-2 text-gray-500')}>
                isFull: {String(state.size === capacity)}
              </span>
            </div>
            {state.result !== null && (
              <span className={clsx('px-2 py-0.5 rounded text-sm font-mono', state.result === 'true' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300')}>
                返回 {state.result}
              </span>
            )}
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
