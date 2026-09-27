'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const bitCode = [
  '// 位运算示例',
  'const a = 12;  // 00001100',
  'const b = 10;  // 00001010',
  'a & b   // 00001000 = 8  (与)',
  'a | b   // 00001110 = 14 (或)',
  'a ^ b   // 00000110 = 6  (异或)',
  '~a      // 11110011      (取反)',
  'a << 1  // 00011000 = 24 (左移)',
  'a >> 1  // 00000110 = 6  (右移)',
];

interface BitState {
  a: number;
  b: number;
  aBits: string;
  bBits: string;
  resultBits: string;
  result: number;
  op: string;
  activeBit: number;
  message: string;
}

const BITS = 8;

function toBits(n: number): string {
  return ((n >>> 0) & 0xFF).toString(2).padStart(BITS, '0');
}

function fromBits(s: string): number {
  return parseInt(s, 2);
}

interface BitOp {
  op: string;
  label: string;
}

const OPS: BitOp[] = [
  { op: '&', label: 'AND' },
  { op: '|', label: 'OR' },
  { op: '^', label: 'XOR' },
  { op: '~', label: 'NOT' },
  { op: '<<', label: '左移' },
  { op: '>>', label: '右移' },
];

function applyOp(op: string, a: number, b: number): number {
  switch (op) {
    case '&': return a & b;
    case '|': return a | b;
    case '^': return a ^ b;
    case '~': return (~a) & 0xFF;
    case '<<': return (a << b) & 0xFF;
    case '>>': return (a >>> b) & 0xFF;
    default: return 0;
  }
}

export function buildSteps(a: number, b: number, op: string): VizStep<BitState>[] {
  const steps: VizStep<BitState>[] = [];
  const aBits = toBits(a);
  const bBits = toBits(b);
  const result = applyOp(op, a, b);
  const resultBits = toBits(result);
  const opLabel = OPS.find((o) => o.op === op)?.label ?? op;

  const snap = (active: number, msg: string): BitState => ({
    a, b, aBits, bBits, resultBits, result, op, activeBit: active, message: msg,
  });

  steps.push({
    state: snap(-1, `${opLabel} 运算：a=${a} (${aBits})，b=${b} (${bBits})`),
    description: '初始化',
    codeLine: 2,
  });

  if (op === '~') {
    for (let i = 0; i < BITS; i++) {
      const flipped = aBits[i] === '0' ? '1' : '0';
      steps.push({
        state: snap(i, `第 ${BITS - 1 - i} 位：~${aBits[i]} = ${flipped}`),
        description: `取反第 ${BITS - 1 - i} 位`,
        codeLine: 7,
      });
    }
  } else if (op === '<<' || op === '>>') {
    steps.push({
      state: snap(-1, `${a} ${op} ${b}：所有位${op === '<<' ? '左' : '右'}移 ${b} 位，${op === '<<' ? '右侧' : '左侧'}补 0`),
      description: `移位 ${b}`,
      codeLine: op === '<<' ? 8 : 9,
    });
    for (let i = 0; i < BITS; i++) {
      steps.push({
        state: snap(i, `第 ${BITS - 1 - i} 位结果 = ${resultBits[i]}`),
        description: `位 ${BITS - 1 - i}`,
        codeLine: op === '<<' ? 8 : 9,
      });
    }
  } else {
    for (let i = 0; i < BITS; i++) {
      const abit = aBits[i];
      const bbit = bBits[i];
      const rbit = resultBits[i];
      steps.push({
        state: snap(i, `第 ${BITS - 1 - i} 位：${abit} ${op} ${bbit} = ${rbit}`),
        description: `${abit} ${op} ${bbit} = ${rbit}`,
        codeLine: op === '&' ? 4 : op === '|' ? 5 : 6,
      });
    }
  }

  steps.push({
    state: snap(-1, `✅ 结果：${resultBits} = ${result}`),
    description: `结果 = ${result}`,
    codeLine: 1,
  });

  return steps;
}

function BitRow({ bits, label, activeBit, color }: { bits: string; label: string; activeBit: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-8 font-mono">{label}</span>
      <div className="flex gap-1">
        {bits.split('').map((bit, i) => (
          <div
            key={i}
            className={clsx(
              'w-8 h-8 flex items-center justify-center rounded text-sm font-mono border transition-all',
              i === activeBit
                ? `${color} scale-110`
                : bit === '1'
                  ? 'bg-surface-2 border-edge-2 text-gray-200'
                  : 'bg-bg border-edge text-gray-600',
            )}
          >
            {bit}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BitManipulationPanel() {
  const [a, setA] = useState(12);
  const [b, setB] = useState(10);
  const [op, setOp] = useState('&');

  const steps = useMemo(() => buildSteps(a, b, op), [a, b, op]);
  const initial: BitState = {
    a, b,
    aBits: toBits(a),
    bBits: toBits(b),
    resultBits: toBits(applyOp(op, a, b)),
    result: applyOp(op, a, b),
    op,
    activeBit: -1,
    message: '',
  };

  return (
    <Stepper<BitState>
      steps={steps}
      initialState={initial}
      codeLines={bitCode}
      codeTitle="位运算 Bit Manipulation"
      headerActions={
        <>
          <span className="text-sm text-gray-400">a:</span>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Math.max(0, Math.min(255, Number(e.target.value))))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
          <select
            value={op}
            onChange={(e) => setOp(e.target.value)}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm"
          >
            {OPS.map((o) => (
              <option key={o.op} value={o.op}>{o.op} {o.label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400">b:</span>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(Math.max(0, Math.min(255, Number(e.target.value))))}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-16"
          />
        </>
      }
      render={(state) => (
        <div className="space-y-6">
          <div className="text-xs text-gray-500">
            8 位二进制表示，高亮=当前处理位
          </div>

          <div className="space-y-3 min-h-[140px] flex flex-col justify-center">
            <BitRow bits={state.aBits} label="a" activeBit={state.activeBit} color="bg-blue-500/30 border-blue-400 text-blue-200" />

            {state.op !== '~' && (
              <BitRow bits={state.bBits} label="b" activeBit={state.activeBit} color="bg-purple-500/30 border-purple-400 text-purple-200" />
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8" />
              <div className="flex gap-1">
                {Array.from({ length: BITS }, (_, i) => (
                  <div key={i} className="w-8 text-center text-xs text-gray-600">{state.op}</div>
                ))}
              </div>
            </div>

            <div className="border-t border-edge-2 pt-2">
              <BitRow bits={state.resultBits} label="结果" activeBit={state.activeBit} color="bg-green-500/30 border-green-400 text-green-200" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm max-w-sm mx-auto">
            <div className="p-2 bg-surface border border-edge rounded text-center">
              <div className="text-[10px] text-gray-500">a (十进制)</div>
              <div className="text-blue-300 font-mono">{state.a}</div>
            </div>
            <div className="p-2 bg-surface border border-edge rounded text-center">
              <div className="text-[10px] text-gray-500">b (十进制)</div>
              <div className="text-purple-300 font-mono">{state.b}</div>
            </div>
            <div className="p-2 bg-surface border border-edge rounded text-center">
              <div className="text-[10px] text-gray-500">结果</div>
              <div className="text-green-300 font-mono">{state.result}</div>
            </div>
          </div>

          {state.message && (
            <div className="text-center text-sm text-gray-300">{state.message}</div>
          )}
        </div>
      )}
    />
  );
}
