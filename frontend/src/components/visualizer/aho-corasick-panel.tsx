'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const acCode = [
  'function buildTrie(patterns) {',
  '  const trie = [{ next: {}, fail: 0, out: [] }];',
  '  for (const p of patterns) {',
  '    let cur = 0;',
  '    for (const ch of p) {',
  '      if (trie[cur].next[ch] === undefined)',
  '        trie.push({ next: {}, fail: 0, out: [] }), (trie[cur].next[ch] = trie.length - 1);',
  '      cur = trie[cur].next[ch];',
  '    }',
  '    trie[cur].out.push(p);',
  '  }',
  '  return trie;',
  '}',
  'function buildFail(trie) {',
  '  const queue = [0];',
  '  while (queue.length) {',
  '    const u = queue.shift();',
  '    for (const [ch, v] of Object.entries(trie[u].next)) {',
  '      let f = trie[u].fail;',
  '      while (f && trie[f].next[ch] === undefined) f = trie[f].fail;',
  '      trie[v].fail = u === 0 ? 0 : trie[f].next[ch] ?? 0;',
  '      trie[v].out = trie[v].out.concat(trie[trie[v].fail].out);',
  '      queue.push(v);',
  '    }',
  '  }',
  '}',
  'function acMatch(trie, text) {',
  '  let cur = 0;',
  '  const res = [];',
  '  for (let i = 0; i < text.length; i++) {',
  '    const ch = text[i];',
  '    while (cur && trie[cur].next[ch] === undefined) cur = trie[cur].fail;',
  '    if (trie[cur].next[ch] !== undefined) cur = trie[cur].next[ch];',
  '    for (const p of trie[cur].out) res.push({ pattern: p, end: i });',
  '  }',
  '  return res;',
  '}',
];

interface ACNodeData {
  id: number;
  ch: string;
  next: Record<string, number>;
  fail: number;
  out: string[];
}

interface ACState {
  nodes: ACNodeData[];
  activeNode: number;
  failTarget: number;
  phase: 'trie' | 'fail' | 'match';
  textIdx: number;
  matches: { pattern: string; end: number }[];
  patterns: string[];
  text: string;
  message: string;
}

function buildSteps(patterns: string[], text: string): VizStep<ACState>[] {
  const steps: VizStep<ACState>[] = [];
  const nodes: ACNodeData[] = [{ id: 0, ch: '●', next: {}, fail: 0, out: [] }];
  const matches: { pattern: string; end: number }[] = [];

  const snap = (activeNode: number, failTarget: number, phase: ACState['phase'], textIdx: number, msg: string): ACState => ({
    nodes: nodes.map((n) => ({ ...n, next: { ...n.next }, out: [...n.out] })),
    activeNode,
    failTarget,
    phase,
    textIdx,
    matches: matches.map((m) => ({ ...m })),
    patterns,
    text,
    message: msg,
  });

  steps.push({
    state: snap(0, -1, 'trie', -1, `模式串集合 {${patterns.map((p) => `"${p}"`).join(', ')}}，文本 "${text}"。第一步：构建 Trie`),
    description: '初始化',
    codeLine: 1,
  });

  // Phase 1: build trie
  for (const p of patterns) {
    let cur = 0;
    steps.push({
      state: snap(0, -1, 'trie', -1, `插入模式串 "${p}"，从根节点出发`),
      description: `插入 "${p}"`,
      codeLine: 3,
    });
    for (const ch of p) {
      if (nodes[cur].next[ch] === undefined) {
        const newId = nodes.length;
        nodes.push({ id: newId, ch, next: {}, fail: 0, out: [] });
        nodes[cur].next[ch] = newId;
        steps.push({
          state: snap(newId, -1, 'trie', -1, `新建节点 ${newId}（边 '${ch}'）`),
          description: `新建 '${ch}'→${newId}`,
          codeLine: 6,
        });
        cur = newId;
      } else {
        cur = nodes[cur].next[ch];
        steps.push({
          state: snap(cur, -1, 'trie', -1, `字符 '${ch}' 已存在，走向节点 ${cur}`),
          description: `'${ch}'→${cur}`,
          codeLine: 7,
        });
      }
    }
    nodes[cur].out.push(p);
    steps.push({
      state: snap(cur, -1, 'trie', -1, `标记节点 ${cur} 输出 "${p}"`),
      description: `out[${cur}]="${p}"`,
      codeLine: 9,
    });
  }

  // Phase 2: build fail pointers (BFS)
  steps.push({
    state: snap(0, -1, 'fail', -1, 'Trie 构建完成，开始 BFS 计算 fail 指针（失配时跳转的最长真后缀）'),
    description: '计算 fail 指针',
    codeLine: 14,
  });
  const queue: number[] = [0];
  while (queue.length > 0) {
    const u = queue.shift()!;
    for (const [ch, v] of Object.entries(nodes[u].next).sort(([a], [b]) => a.localeCompare(b))) {
      let f = nodes[u].fail;
      while (f && nodes[f].next[ch] === undefined) f = nodes[f].fail;
      const failVal = u === 0 ? 0 : nodes[f].next[ch] ?? 0;
      nodes[v].fail = failVal;
      nodes[v].out = nodes[v].out.concat(nodes[failVal].out);
      steps.push({
        state: snap(u, v, 'fail', -1, `节点 ${v}('${nodes[v].ch}') 的 fail 指针 → ${failVal}${nodes[v].out.length > 0 ? `，继承输出 {${nodes[v].out.join(',')}}` : ''}`),
        description: `fail[${v}]=${failVal}`,
        codeLine: 20,
      });
      queue.push(v);
    }
  }

  // Phase 3: match
  steps.push({
    state: snap(0, -1, 'match', -1, `fail 指针构建完成，开始在文本 "${text}" 上匹配`),
    description: '开始匹配',
    codeLine: 27,
  });
  let cur = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    let jumped = false;
    while (cur && nodes[cur].next[ch] === undefined) {
      cur = nodes[cur].fail;
      jumped = true;
    }
    if (nodes[cur].next[ch] !== undefined) {
      cur = nodes[cur].next[ch];
      steps.push({
        state: snap(cur, -1, 'match', i, `读入 text[${i}]='${ch}'${jumped ? '，沿 fail 指针回退后' : ''} 转移到节点 ${cur}`),
        description: `'${ch}' → 节点 ${cur}`,
        codeLine: 32,
      });
    } else {
      steps.push({
        state: snap(0, -1, 'match', i, `读入 text[${i}]='${ch}'，无匹配转移，回到根节点`),
        description: `'${ch}' → 根`,
        codeLine: 31,
      });
    }
    if (nodes[cur].out.length > 0) {
      for (const p of nodes[cur].out) matches.push({ pattern: p, end: i });
      steps.push({
        state: snap(cur, -1, 'match', i, `🎯 节点 ${cur} 命中输出：${nodes[cur].out.map((p) => `"${p}"`).join(', ')}（结束于位置 ${i}）`),
        description: `命中 ${nodes[cur].out.join(',')}`,
        codeLine: 33,
      });
    }
  }

  steps.push({
    state: snap(cur, -1, 'match', text.length, `✅ 匹配结束，共找到 ${matches.length} 个匹配：${matches.map((m) => `"${m.pattern}"@${m.end}`).join(', ') || '无'}`),
    description: `共 ${matches.length} 个匹配`,
    codeLine: 35,
  });

  return steps;
}

function ACGraphView({ nodes, activeNode, failTarget, phase }: { nodes: ACNodeData[]; activeNode: number; failTarget: number; phase: ACState['phase'] }) {
  interface LayoutNode { idx: number; depth: number }
  const layout: LayoutNode[] = [];
  const queue: LayoutNode[] = [{ idx: 0, depth: 0 }];
  while (queue.length > 0) {
    const item = queue.shift()!;
    layout.push(item);
    const node = nodes[item.idx];
    for (const childIdx of Object.entries(node.next).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)) {
      queue.push({ idx: childIdx, depth: item.depth + 1 });
    }
  }
  const maxDepth = Math.max(...layout.map((n) => n.depth), 0);

  return (
    <div className="flex flex-col items-center gap-3 min-h-[140px]">
      {Array.from({ length: maxDepth + 1 }, (_, d) => {
        const levelNodes = layout.filter((n) => n.depth === d);
        return (
          <div key={d} className="flex items-center justify-center gap-3 flex-wrap">
            {levelNodes.map(({ idx }) => {
              const node = nodes[idx];
              const isActive = idx === activeNode;
              const isFailTarget = idx === failTarget;
              const hasOut = node.out.length > 0;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={clsx(
                      'w-9 h-9 flex items-center justify-center rounded-full text-xs font-mono border transition-all',
                      isActive
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                        : isFailTarget
                          ? 'bg-purple-500/30 border-purple-400 text-purple-200 scale-110'
                          : hasOut
                            ? 'bg-green-500/20 border-green-500 text-green-300'
                            : 'bg-surface-2 border-edge-2 text-gray-400',
                    )}
                    title={`节点 ${idx}${hasOut ? ` 输出: ${node.out.join(',')}` : ''}`}
                  >
                    {node.ch}
                  </div>
                  <div className={clsx('text-[9px] font-mono mt-0.5', phase !== 'trie' && node.fail !== 0 ? 'text-purple-400' : 'text-gray-600')}>
                    {idx}{phase !== 'trie' ? ` f→${node.fail}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function AhoCorasickPanel() {
  const [patternsText, setPatternsText] = useState('he,her,his,she,hers');
  const [text, setText] = useState('ushers');

  const patterns = useMemo(
    () => patternsText.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
    [patternsText],
  );

  const steps = useMemo(() => buildSteps(patterns, text.toLowerCase()), [patterns, text]);
  const initial: ACState = {
    nodes: [{ id: 0, ch: '●', next: {}, fail: 0, out: [] }],
    activeNode: 0,
    failTarget: -1,
    phase: 'trie',
    textIdx: -1,
    matches: [],
    patterns,
    text: text.toLowerCase(),
    message: '',
  };

  return (
    <Stepper<ACState>
      steps={steps}
      initialState={initial}
      codeLines={acCode}
      codeTitle="AC 自动机 Aho-Corasick"
      headerActions={
        <>
          <span className="text-sm text-gray-400">模式串:</span>
          <input
            type="text"
            value={patternsText}
            onChange={(e) => setPatternsText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-44"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">文本:</span>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-32"
            placeholder="待匹配文本"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-4">
          <div className="text-xs text-gray-500">
            黄色=当前节点，紫色=正在设置 fail / fail 回退，绿色=有输出的节点，f→x 为 fail 指针
          </div>

          <ACGraphView nodes={state.nodes} activeNode={state.activeNode} failTarget={state.failTarget} phase={state.phase} />

          {state.phase === 'match' && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">文本扫描:</div>
              <div className="flex gap-1 flex-wrap justify-center">
                {state.text.split('').map((ch, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-8 h-8 flex items-center justify-center rounded text-sm font-mono border transition-all',
                      i === state.textIdx
                        ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-110'
                        : i < state.textIdx
                          ? 'bg-surface-2 border-edge-2 text-gray-400'
                          : 'bg-bg border-edge text-gray-600',
                    )}
                  >
                    {ch}
                  </div>
                ))}
              </div>
              {state.matches.length > 0 && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {state.matches.map((m, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-green-900/30 border border-green-800 text-green-300 font-mono">
                      &quot;{m.pattern}&quot; @ {m.end}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
