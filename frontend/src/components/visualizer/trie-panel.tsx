'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const trieCode = [
  'class Trie {',
  '  constructor() { this.root = {}; }',
  '  insert(word) {',
  '    let node = this.root;',
  '    for (const ch of word) {',
  '      if (!node[ch]) node[ch] = {};',
  '      node = node[ch];',
  '    }',
  '    node.isEnd = true;',
  '  }',
  '}',
];

interface TrieNode {
  children: Record<string, number>; // char -> node index
  isEnd: boolean;
}

interface TrieState {
  nodes: TrieNode[];
  activeNode: number;
  activeChar: string;
  path: number[];
  message: string;
  insertedWord: string;
}

export function buildSteps(words: string[]): VizStep<TrieState>[] {
  const steps: VizStep<TrieState>[] = [];
  const nodes: TrieNode[] = [{ children: {}, isEnd: false }]; // root = 0

  steps.push({
    state: { nodes: [{ children: {}, isEnd: false }], activeNode: 0, activeChar: '', path: [0], message: '初始化空 Trie，只有根节点', insertedWord: '' },
    description: '初始化空 Trie',
    codeLine: 2,
  });

  for (const word of words) {
    let cur = 0;
    const path = [0];

    steps.push({
      state: { nodes: nodes.map((n) => ({ ...n, children: { ...n.children } })), activeNode: 0, activeChar: '', path: [...path], message: `开始插入 "${word}"，从根节点出发`, insertedWord: word },
      description: `插入 "${word}"`,
      codeLine: 4,
    });

    for (const ch of word) {
      if (nodes[cur].children[ch] !== undefined) {
        const next = nodes[cur].children[ch];
        path.push(next);
        steps.push({
          state: { nodes: nodes.map((n) => ({ ...n, children: { ...n.children } })), activeNode: next, activeChar: ch, path: [...path], message: `字符 '${ch}' 已存在，走向子节点 ${next}`, insertedWord: word },
          description: `'${ch}' 已存在 → 节点 ${next}`,
          codeLine: 7,
        });
        cur = next;
      } else {
        const newIdx = nodes.length;
        nodes.push({ children: {}, isEnd: false });
        nodes[cur].children[ch] = newIdx;
        path.push(newIdx);
        steps.push({
          state: { nodes: nodes.map((n) => ({ ...n, children: { ...n.children } })), activeNode: newIdx, activeChar: ch, path: [...path], message: `创建新节点 ${newIdx}，字符 '${ch}'`, insertedWord: word },
          description: `新建 '${ch}' → 节点 ${newIdx}`,
          codeLine: 6,
        });
        cur = newIdx;
      }
    }

    nodes[cur].isEnd = true;
    steps.push({
      state: { nodes: nodes.map((n) => ({ ...n, children: { ...n.children } })), activeNode: cur, activeChar: '', path: [...path], message: `标记节点 ${cur} 为单词结尾，"${word}" 插入完成 ✓`, insertedWord: word },
      description: `"${word}" 插入完成`,
      codeLine: 9,
    });
  }

  return steps;
}

function TrieTreeView({ nodes, activeNode, path }: { nodes: TrieNode[]; activeNode: number; path: number[] }) {
  // Build tree layout using BFS
  interface LayoutNode {
    idx: number;
    char: string;
    depth: number;
    x: number;
  }

  const layout: LayoutNode[] = [];
  const queue: { idx: number; char: string; depth: number }[] = [{ idx: 0, char: '●', depth: 0 }];
  const levelCounts: number[] = [];

  while (queue.length > 0) {
    const { idx, char, depth } = queue.shift()!;
    if (!levelCounts[depth]) levelCounts[depth] = 0;
    const x = levelCounts[depth]++;
    layout.push({ idx, char, depth, x });

    const node = nodes[idx];
    const entries = Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b));
    for (const [ch, childIdx] of entries) {
      queue.push({ idx: childIdx, char: ch, depth: depth + 1 });
    }
  }

  const maxDepth = Math.max(...layout.map((n) => n.depth), 0);

  return (
    <div className="flex flex-col items-center gap-3 min-h-[140px]">
      {Array.from({ length: maxDepth + 1 }, (_, d) => {
        const levelNodes = layout.filter((n) => n.depth === d);
        return (
          <div key={d} className="flex items-center justify-center gap-3">
            {levelNodes.map((n) => {
              const isActive = n.idx === activeNode;
              const isPath = path.includes(n.idx);
              const isEnd = nodes[n.idx]?.isEnd;
              return (
                <div
                  key={n.idx}
                  className={clsx(
                    'w-9 h-9 flex items-center justify-center rounded-full text-xs font-mono border transition-all',
                    isActive
                      ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                      : isPath
                        ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                        : isEnd
                          ? 'bg-green-500/20 border-green-500 text-green-300'
                          : 'bg-surface-2 border-edge-2 text-gray-400',
                  )}
                  title={`节点 ${n.idx}${isEnd ? ' (结尾)' : ''}`}
                >
                  {n.char}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function TriePanel() {
  const [words, setWords] = useState<string[]>(['app', 'apple', 'api', 'bat', 'ball']);
  const steps = useMemo(() => buildSteps(words), [words]);
  const initial: TrieState = {
    nodes: [{ children: {}, isEnd: false }],
    activeNode: 0,
    activeChar: '',
    path: [0],
    message: '',
    insertedWord: '',
  };

  return (
    <Stepper<TrieState>
      steps={steps}
      initialState={initial}
      codeLines={trieCode}
      codeTitle="前缀树 Trie"
      headerActions={
        <>
          <span className="text-sm text-gray-400">单词:</span>
          <input
            type="text"
            value={words.join(',')}
            onChange={(e) => {
              const parsed = e.target.value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
              if (parsed.length >= 1) setWords(parsed);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="逗号分隔单词"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-4">
          <div className="text-xs text-gray-500">
            黄色=当前节点，蓝色=路径，绿色=单词结尾，●=根节点
          </div>

          <TrieTreeView nodes={state.nodes} activeNode={state.activeNode} path={state.path} />

          {state.insertedWord && (
            <div className="text-center text-sm">
              <span className="text-gray-500">正在插入：</span>
              <span className="text-brand font-mono font-medium">{state.insertedWord}</span>
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
