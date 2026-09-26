'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const blockListCode = [
  'const S = 3;                       // 块容量上限（实际取 ⌈√n⌉）',
  'function insert(v) {               // 追加到尾部',
  '  const [bi, off] = locate(length);',
  '  blocks[bi].items.splice(off, 0, v);',
  '  if (blocks[bi].items.length > S)',
  '    splitBlock(bi);                // 超过容量则从中点分裂',
  '}',
];

interface Block { items: number[]; }

interface BlockListState {
  blocks: Block[];
  activeBlock: number;
  activeItem: number;
  message: string;
  insertedVal: number;
}

function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map((b) => ({ items: [...b.items] }));
}

function buildSteps(values: number[], S: number): VizStep<BlockListState>[] {
  const steps: VizStep<BlockListState>[] = [];
  let blocks: Block[] = [];

  const snap = (activeBlock: number, activeItem: number, msg: string, insVal: number): BlockListState => ({
    blocks: cloneBlocks(blocks), activeBlock, activeItem, message: msg, insertedVal: insVal,
  });

  steps.push({ state: snap(-1, -1, `初始化空块状链表（块容量上限 S=${S}）`, -1), description: '初始化', codeLine: 1 });

  for (const v of values) {
    // 定位插入位置 = 当前总长度（尾部追加）
    let pos = 0;
    for (const b of blocks) pos += b.items.length;
    if (blocks.length === 0) blocks.push({ items: [] });
    let bi = 0;
    let acc = 0;
    while (bi < blocks.length - 1 && acc + blocks[bi].items.length < pos) {
      acc += blocks[bi].items.length;
      bi++;
    }
    const off = pos - acc;
    blocks[bi].items.splice(off, 0, v);
    steps.push({ state: snap(bi, off, `在块 #${bi} 位置 ${off} 插入 ${v}`, v), description: `插入 ${v}`, codeLine: 3 });

    if (blocks[bi].items.length > S) {
      const k = Math.ceil(blocks[bi].items.length / 2);
      const left = blocks[bi].items.slice(0, k);
      const right = blocks[bi].items.slice(k);
      blocks[bi] = { items: left };
      blocks.splice(bi + 1, 0, { items: right });
      steps.push({ state: snap(bi, -1, `块 #${bi} 超过容量 ${S}，从中点分裂为两块`, v), description: `分裂 @${bi}`, codeLine: 5 });
    }
  }

  return steps;
}

function BlockListView({ blocks, activeBlock, activeItem }: { blocks: Block[]; activeBlock: number; activeItem: number }) {
  if (blocks.length === 0) return <div className="text-ink-3 text-sm py-8 text-center">空链表</div>;
  return (
    <div className="flex flex-col items-center gap-3 min-h-[120px]">
      {blocks.map((b, bi) => (
        <div key={bi} className="flex items-center gap-2">
          <span className={clsx('text-xs font-mono w-10 text-right', bi === activeBlock ? 'text-warn' : 'text-ink-3')}>#{bi}</span>
          <div className={clsx('flex items-center gap-1 rounded-lg border-2 px-2 py-1 transition-all',
            bi === activeBlock ? 'border-warn bg-warn/20' : 'border-edge-2 bg-surface-2')}>
            {b.items.map((val, i) => (
              <span key={i} className={clsx('w-8 h-8 flex items-center justify-center rounded text-xs font-mono border',
                bi === activeBlock && i === activeItem ? 'bg-warn/40 border-warn text-warn'
                  : 'bg-surface border-edge text-ink-3')}>
                {val}
              </span>
            ))}
            {b.items.length === 0 && <span className="text-ink-3 text-xs px-2">空</span>}
          </div>
          {bi < blocks.length - 1 && <span className="text-ink-3 text-lg">→</span>}
        </div>
      ))}
    </div>
  );
}

export function BlockListPanel() {
  const S = 3;
  const [seed, setSeed] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const steps = useMemo(() => buildSteps(seed, S), [seed]);
  const initial: BlockListState = { blocks: [], activeBlock: -1, activeItem: -1, message: '', insertedVal: -1 };

  return (
    <Stepper<BlockListState>
      steps={steps}
      initialState={initial}
      codeLines={blockListCode}
      codeTitle="块状链表插入"
      headerActions={
        <>
          <span className="text-sm text-gray-400">插入序列:</span>
          <input type="text" value={seed.join(',')} onChange={(e) => { const p = e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n)); if (p.length >= 1) setSeed(p); }} className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-52" placeholder="逗号分隔" />
        </>
      }
      render={(state) => (
        <div className="space-y-4">
          <div className="text-xs text-ink-3">每个块容量上限 S=3；琥珀块=当前操作块，琥珀格子=刚插入元素；块超容量会从中点分裂</div>
          <BlockListView blocks={state.blocks} activeBlock={state.activeBlock} activeItem={state.activeItem} />
          {state.message && <div className="text-center text-sm text-ink-3">{state.message}</div>}
        </div>
      )}
    />
  );
}
