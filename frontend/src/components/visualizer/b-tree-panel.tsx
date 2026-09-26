'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const bTreeCode = [
  'function bTreeInsert(root, key, t = 2) {',
  '  if (root.keys.length === 2 * t - 1) {',
  '    const newRoot = { keys: [], children: [root] };',
  '    splitChild(newRoot, 0, t);',
  '    root = newRoot;',
  '  }',
  '  insertNonFull(root, key, t);',
  '  return root;',
  '}',
  'function splitChild(parent, i, t) {',
  '  const full = parent.children[i];',
  '  const mid = full.keys[t - 1];',
  '  const right = { keys: full.keys.slice(t), children: full.children.slice(t) };',
  '  full.keys = full.keys.slice(0, t - 1);',
  '  full.children = full.children.slice(0, t);',
  '  parent.keys.splice(i, 0, mid);',
  '  parent.children.splice(i + 1, 0, right);',
  '}',
  'function insertNonFull(node, key, t) {',
  '  if (node.children.length === 0) {',
  '    node.keys.push(key);',
  '    node.keys.sort((a, b) => a - b);',
  '    return;',
  '  }',
  '  let i = node.keys.findIndex((k) => key < k);',
  '  if (i === -1) i = node.keys.length;',
  '  if (node.children[i].keys.length === 2 * t - 1) {',
  '    splitChild(node, i, t);',
  '    if (key > node.keys[i]) i++;',
  '  }',
  '  insertNonFull(node.children[i], key, t);',
  '}',
];

interface BTNode {
  id: number;
  keys: number[];
  childIds: number[];
}

interface BTreeState {
  nodes: BTNode[];
  rootId: number;
  activeId: number;
  splitIds: number[];
  promotedKey: number | null;
  insertedKey: number | null;
  message: string;
}

function buildSteps(insertKeys: number[], t: number): VizStep<BTreeState>[] {
  const steps: VizStep<BTreeState>[] = [];
  const nodes: BTNode[] = [{ id: 0, keys: [], childIds: [] }];
  let rootId = 0;
  let nextId = 1;
  const maxKeys = 2 * t - 1;

  const snap = (activeId: number, splitIds: number[], promotedKey: number | null, insertedKey: number | null, msg: string): BTreeState => ({
    nodes: nodes.map((n) => ({ ...n, keys: [...n.keys], childIds: [...n.childIds] })),
    rootId,
    activeId,
    splitIds,
    promotedKey,
    insertedKey,
    message: msg,
  });

  function splitChild(parentId: number, idx: number) {
    const parent = nodes[parentId];
    const fullId = parent.childIds[idx];
    const full = nodes[fullId];
    const midKey = full.keys[t - 1];
    const rightId = nextId++;
    nodes.push({ id: rightId, keys: full.keys.slice(t), childIds: full.childIds.slice(t) });
    full.keys = full.keys.slice(0, t - 1);
    full.childIds = full.childIds.slice(0, t);
    parent.keys.splice(idx, 0, midKey);
    parent.childIds.splice(idx + 1, 0, rightId);
    steps.push({
      state: snap(parentId, [fullId, rightId], midKey, null, `节点 ${fullId} 已满 ${maxKeys} 个关键字，分裂！中间键 ${midKey} 上移到父节点，右半部成为新节点 ${rightId}`),
      description: `分裂，${midKey} 上移`,
      codeLine: 15,
    });
  }

  function insertNonFull(nodeId: number, key: number) {
    const node = nodes[nodeId];
    if (node.childIds.length === 0) {
      node.keys.push(key);
      node.keys.sort((a, b) => a - b);
      steps.push({
        state: snap(nodeId, [], null, key, `叶子节点 ${nodeId} 插入 ${key} → [${node.keys.join(', ')}]`),
        description: `叶子插入 ${key}`,
        codeLine: 20,
      });
      return;
    }
    let i = node.keys.findIndex((k) => key < k);
    if (i === -1) i = node.keys.length;
    steps.push({
      state: snap(nodeId, [], null, key, `在节点 ${nodeId} [${node.keys.join(', ')}] 中定位：${key} 应进入第 ${i} 个子节点`),
      description: `定位子节点 ${i}`,
      codeLine: 24,
    });
    if (nodes[node.childIds[i]].keys.length === maxKeys) {
      steps.push({
        state: snap(node.childIds[i], [], null, key, `子节点 ${node.childIds[i]} 已满（${maxKeys} 个关键字），先分裂再插入`),
        description: '子节点已满',
        codeLine: 26,
      });
      splitChild(nodeId, i);
      if (key > nodes[nodeId].keys[i]) i++;
    }
    insertNonFull(node.childIds[i], key);
  }

  steps.push({
    state: snap(0, [], null, null, `B 树最小度数 t=${t}：每个节点最多 ${maxKeys} 个关键字、最少 ${t - 1} 个。依次插入 [${insertKeys.join(', ')}]`),
    description: '初始化',
    codeLine: 0,
  });

  for (const key of insertKeys) {
    if (nodes[rootId].keys.length === maxKeys) {
      steps.push({
        state: snap(rootId, [], null, key, `根节点 ${rootId} 已满 ${maxKeys} 个关键字，需要先分裂根`),
        description: '根节点已满',
        codeLine: 1,
      });
      const newRootId = nextId++;
      nodes.push({ id: newRootId, keys: [], childIds: [rootId] });
      steps.push({
        state: snap(newRootId, [], null, key, `创建新根节点 ${newRootId}，原根 ${rootId} 成为其唯一子节点`),
        description: '创建新根',
        codeLine: 2,
      });
      rootId = newRootId;
      splitChild(newRootId, 0);
      steps.push({
        state: snap(newRootId, [], null, key, 'root = newRoot，树高度 +1，继续插入'),
        description: '树高 +1',
        codeLine: 4,
      });
    }
    insertNonFull(rootId, key);
  }

  steps.push({
    state: snap(rootId, [], null, null, `✅ 全部插入完成，最终 B 树共 ${nodes.length} 个节点`),
    description: '插入完成',
    codeLine: 7,
  });

  return steps;
}

function BTreeView({ nodes, rootId, activeId, splitIds, promotedKey }: { nodes: BTNode[]; rootId: number; activeId: number; splitIds: number[]; promotedKey: number | null }) {
  const levels: number[][] = [];
  const queue: { id: number; depth: number }[] = [{ id: rootId, depth: 0 }];
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(id);
    for (const cid of nodes[id].childIds) queue.push({ id: cid, depth: depth + 1 });
  }

  return (
    <div className="flex flex-col items-center gap-5 min-h-[140px]">
      {levels.map((lvl, d) => (
        <div key={d} className="flex items-center justify-center gap-5 flex-wrap">
          {lvl.map((id) => {
            const node = nodes[id];
            const isActive = id === activeId;
            const isSplit = splitIds.includes(id);
            return (
              <div
                key={id}
                className={clsx(
                  'rounded-lg border px-2 py-1 transition-all',
                  isActive
                    ? 'bg-yellow-500/20 border-yellow-400 scale-105'
                    : isSplit
                      ? 'bg-purple-500/20 border-purple-400'
                      : 'bg-surface-2 border-edge-2',
                )}
                title={`节点 ${id}`}
              >
                <div className="text-[9px] text-gray-600 text-center">#{id}</div>
                <div className="flex items-center divide-x divide-[#333]">
                  {node.keys.length === 0 && <span className="px-2 text-gray-600 text-xs">·</span>}
                  {node.keys.map((k, i) => (
                    <span
                      key={i}
                      className={clsx(
                        'px-2 py-0.5 text-sm font-mono',
                        promotedKey !== null && k === promotedKey && isActive
                          ? 'text-purple-300 font-bold'
                          : isActive
                            ? 'text-yellow-200'
                            : 'text-gray-300',
                      )}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function BTreePanel() {
  const [keysText, setKeysText] = useState('10,20,30,40,50,60,70,80,90,100,110');
  const [degree, setDegree] = useState(2);

  const insertKeys = useMemo(
    () => keysText.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)),
    [keysText],
  );

  const steps = useMemo(() => buildSteps(insertKeys, degree), [insertKeys, degree]);
  const initial: BTreeState = {
    nodes: [{ id: 0, keys: [], childIds: [] }],
    rootId: 0,
    activeId: -1,
    splitIds: [],
    promotedKey: null,
    insertedKey: null,
    message: '',
  };

  return (
    <Stepper<BTreeState>
      steps={steps}
      initialState={initial}
      codeLines={bTreeCode}
      codeTitle="B 树插入 B-Tree Insert"
      headerActions={
        <>
          <span className="text-sm text-gray-400">插入序列:</span>
          <input
            type="text"
            value={keysText}
            onChange={(e) => setKeysText(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-56"
            placeholder="逗号分隔"
          />
          <span className="text-sm text-gray-400">度数 t:</span>
          <select
            value={degree}
            onChange={(e) => setDegree(Number(e.target.value))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm"
          >
            <option value={2}>2 (2-3-4 树)</option>
            <option value={3}>3</option>
          </select>
        </>
      }
      render={(state) => (
        <div className="space-y-5">
          <div className="text-xs text-gray-500">
            黄色=当前访问节点，紫色=分裂相关节点/上移键，每个节点最多 {2 * degree - 1} 个关键字
          </div>

          <BTreeView
            nodes={state.nodes}
            rootId={state.rootId}
            activeId={state.activeId}
            splitIds={state.splitIds}
            promotedKey={state.promotedKey}
          />

          {state.insertedKey !== null && (
            <div className="text-center text-sm">
              <span className="text-gray-500">正在插入：</span>
              <span className="text-blue-300 font-mono font-medium">{state.insertedKey}</span>
            </div>
          )}

          {state.message && <div className="text-center text-sm text-gray-300">{state.message}</div>}
        </div>
      )}
    />
  );
}
