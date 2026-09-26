'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const linkedListCode = [
  'class LinkedList {',
  '  constructor() {',
  '    this.head = null;',
  '  }',
  '',
  '  insertHead(value) {',
  '    const node = { value, next: this.head };',
  '    this.head = node;',
  '  }',
  '',
  '  traverse() {',
  '    let cur = this.head;',
  '    while (cur !== null) {',
  '      // visit cur.value',
  '      cur = cur.next;',
  '    }',
  '  }',
  '',
  '  delete(value) {',
  '    let prev = null, cur = this.head;',
  '    while (cur !== null) {',
  '      if (cur.value === value) {',
  '        if (prev === null) this.head = cur.next;',
  '        else prev.next = cur.next;',
  '        return;',
  '      }',
  '      prev = cur;',
  '      cur = cur.next;',
  '    }',
  '  }',
  '',
  '  reverse() {',
  '    let prev = null, cur = this.head;',
  '    while (cur !== null) {',
  '      const next = cur.next;',
  '      cur.next = prev;',
  '      prev = cur;',
  '      cur = next;',
  '    }',
  '    this.head = prev;',
  '  }',
  '}',
];

interface Node {
  id: number;
  value: number;
  nextId: number | null;
}

interface ListState {
  nodes: Node[];
  headId: number | null;
  highlightIds: number[];
  error: string | null;
}

function buildState(values: number[]): ListState {
  const nodes: Node[] = values.map((v, i) => ({
    id: i,
    value: v,
    nextId: i + 1 < values.length ? i + 1 : null,
  }));
  return {
    nodes,
    headId: values.length > 0 ? 0 : null,
    highlightIds: [],
    error: null,
  };
}

function insertHead(state: ListState, value: number, nextId: number | null): ListState {
  const newId = state.nodes.length;
  const nodes = [...state.nodes, { id: newId, value, nextId }];
  return { nodes, headId: newId, highlightIds: [newId], error: null };
}

function deleteValue(state: ListState, value: number): ListState {
  if (state.headId === null) {
    return { ...state, error: '链表为空' };
  }
  const nodes = state.nodes.map((n) => ({ ...n }));
  let prev: number | null = null;
  let cur: number | null = state.headId;
  while (cur !== null) {
    const node: Node = nodes[cur];
    if (node.value === value) {
      if (prev === null) {
        return { ...state, nodes, headId: node.nextId, highlightIds: [node.id], error: null };
      }
      const prevNode = nodes[prev];
      prevNode.nextId = node.nextId;
      return { nodes, headId: state.headId, highlightIds: [node.id], error: null };
    }
    prev = cur;
    cur = node.nextId;
  }
  return { ...state, error: `未找到 ${value}` };
}

function reverse(state: ListState): ListState {
  if (state.headId === null) return state;
  const nodes = state.nodes.map((n) => ({ ...n }));
  let prev: number | null = null;
  let cur: number | null = state.headId;
  while (cur !== null) {
    const node: Node = nodes[cur];
    const next: number | null = node.nextId;
    node.nextId = prev;
    prev = cur;
    cur = next;
  }
  return { ...state, nodes, headId: prev, highlightIds: [] };
}

function buildSteps(seed: number[]): VizStep<ListState>[] {
  const steps: VizStep<ListState>[] = [];
  let state = buildState(seed);
  steps.push({ state, description: '初始化链表', codeLine: 3 });

  const newVal = 0;
  state = insertHead(state, newVal, state.headId);
  steps.push({ state, description: `在头部插入 ${newVal}`, codeLine: 7 });

  let cur: number | null = state.headId;
  while (cur !== null) {
    state = { ...state, highlightIds: [cur] };
    steps.push({ state, description: `遍历访问节点 ${state.nodes[cur].value}`, codeLine: 14 });
    cur = state.nodes[cur].nextId;
  }
  state = { ...state, highlightIds: [] };

  const target = seed[Math.floor(seed.length / 2)];
  state = deleteValue(state, target);
  steps.push({ state, description: `删除值 ${target}`, codeLine: 24 });

  state = reverse(state);
  steps.push({ state, description: '反转链表', codeLine: 36 });

  return steps;
}

export function LinkedListPanel() {
  const [seed, setSeed] = useState<number[]>([5, 8, 3, 9, 1]);
  const [steps, setSteps] = useState(() => buildSteps(seed));
  const initial = buildState([]);

  const rebuild = (next: number[]) => {
    setSeed(next);
    setSteps(buildSteps(next));
  };

  return (
    <Stepper<ListState>
      steps={steps}
      initialState={initial}
      codeLines={linkedListCode}
      codeTitle="链表 Linked List"
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
      render={(state) => {
        const order: number[] = [];
        let cur = state.headId;
        const visited = new Set<number>();
        while (cur !== null && !visited.has(cur)) {
          order.push(cur);
          visited.add(cur);
          cur = state.nodes[cur]?.nextId ?? null;
        }
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap justify-center min-h-[60px]">
              {order.length === 0 && <div className="text-gray-600 text-sm">空链表</div>}
              {order.map((id, i) => {
                const node = state.nodes[id];
                if (!node) return null;
                const highlighted = state.highlightIds.includes(id);
                return (
                  <div key={id} className="flex items-center gap-2">
                    {i === 0 && state.headId !== null && (
                      <span className="text-xs text-gray-500 mr-1">head →</span>
                    )}
                    <div
                      className={clsx(
                        'px-3 py-2 rounded text-sm font-medium min-w-[44px] text-center transition-all',
                        highlighted
                          ? 'bg-blue-500/20 border border-blue-500 text-blue-300'
                          : 'bg-surface-2 border border-edge text-gray-200',
                      )}
                    >
                      {node.value}
                    </div>
                    {node.nextId !== null && (
                      <span className="text-gray-500 text-xs">→</span>
                    )}
                  </div>
                );
              })}
            </div>
            {state.error && (
              <div className="text-center text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded inline-block">
                {state.error}
              </div>
            )}
            <div className="text-center text-xs text-gray-400">
              节点数: <span className="text-white">{order.length}</span>
            </div>
          </div>
        );
      }}
    />
  );
}
