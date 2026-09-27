'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const matExpCode = [
  'function matMul(A, B) {',
  '  const n = A.length;',
  '  const C = Array.from({ length: n }, () => new Array(n).fill(0));',
  '  for (let i = 0; i < n; i++)',
  '    for (let j = 0; j < n; j++)',
  '      for (let k = 0; k < n; k++)',
  '        C[i][j] += A[i][k] * B[k][j];',
  '  return C;',
  '}',
  'function fibByMatrix(n) {',
  '  let result = [[1, 0], [0, 1]];',
  '  let base = [[1, 1], [1, 0]];',
  '  while (n > 0) {',
  '    if (n & 1) result = matMul(result, base);',
  '    base = matMul(base, base);',
  '    n >>= 1;',
  '  }',
  '  return result[0][1];',
  '}',
];

type Matrix = number[][];

interface MatExpState {
  nOriginal: number;
  nCurrent: number;
  bitIdx: number;
  base: Matrix;
  result: Matrix;
  mulA: Matrix | null;
  mulB: Matrix | null;
  mulC: Matrix | null;
  mulCell: [number, number] | null;
  mulFormula: string;
  mulTarget: 'result' | 'base' | null;
  answer: number | null;
  phase: 'init' | 'loop' | 'mul' | 'done';
  message: string;
}

function matMulWithCellSteps(A: Matrix, B: Matrix) {
  const n = A.length;
  const C: Matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  const cells: { i: number; j: number; formula: string; value: number }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      const terms: string[] = [];
      for (let k = 0; k < n; k++) {
        sum += A[i][k] * B[k][j];
        terms.push(`${A[i][k]}×${B[k][j]}`);
      }
      C[i][j] = sum;
      cells.push({ i, j, formula: `C[${i}][${j}] = ${terms.join(' + ')} = ${sum}`, value: sum });
    }
  }
  return { C, cells };
}

export function buildSteps(nInput: number): VizStep<MatExpState>[] {
  const steps: VizStep<MatExpState>[] = [];
  let n = nInput;
  let result: Matrix = [[1, 0], [0, 1]];
  let base: Matrix = [[1, 1], [1, 0]];
  let bitIdx = 0;

  const snap = (partial: Partial<MatExpState> & { message: string }): MatExpState => ({
    nOriginal: nInput,
    nCurrent: n,
    bitIdx,
    base: base.map((r) => [...r]),
    result: result.map((r) => [...r]),
    mulA: null,
    mulB: null,
    mulC: null,
    mulCell: null,
    mulFormula: '',
    mulTarget: null,
    answer: null,
    phase: 'loop',
    ...partial,
  });

  steps.push({
    state: snap({ phase: 'init', message: `n = ${nInput}，二进制 = ${(nInput).toString(2)}。result = 单位矩阵 I，base = [[1,1],[1,0]]` }),
    description: '初始化',
    codeLine: 11,
  });

  while (n > 0) {
    const bit = n & 1;
    steps.push({
      state: snap({
        message: bit === 1
          ? `第 ${bitIdx} 位为 1（n & 1 = 1）：result = result × base`
          : `第 ${bitIdx} 位为 0（n & 1 = 0）：跳过乘法`,
      }),
      description: `bit${bitIdx}=${bit}`,
      codeLine: 13,
    });

    if (bit === 1) {
      const { C, cells } = matMulWithCellSteps(result, base);
      const partial: Matrix = [[0, 0], [0, 0]];
      for (const cell of cells) {
        partial[cell.i][cell.j] = cell.value;
        steps.push({
          state: snap({
            mulA: result.map((r) => [...r]),
            mulB: base.map((r) => [...r]),
            mulC: partial.map((r) => [...r]),
            mulCell: [cell.i, cell.j],
            mulFormula: cell.formula,
            mulTarget: 'result',
            phase: 'mul',
            message: `result × base：${cell.formula}`,
          }),
          description: `result[${cell.i}][${cell.j}]=${cell.value}`,
          codeLine: 6,
        });
      }
      result = C;
      steps.push({
        state: snap({ message: 'result 更新完成' }),
        description: 'result 更新',
        codeLine: 7,
      });
    }

    // squaring
    const { C: sqC, cells: sqCells } = matMulWithCellSteps(base, base);
    const partialSq: Matrix = [[0, 0], [0, 0]];
    steps.push({
      state: snap({ message: 'base = base × base（平方）' }),
      description: 'base 平方',
      codeLine: 14,
    });
    for (const cell of sqCells) {
      partialSq[cell.i][cell.j] = cell.value;
      steps.push({
        state: snap({
          mulA: base.map((r) => [...r]),
          mulB: base.map((r) => [...r]),
          mulC: partialSq.map((r) => [...r]),
          mulCell: [cell.i, cell.j],
          mulFormula: cell.formula,
          mulTarget: 'base',
          phase: 'mul',
          message: `base × base：${cell.formula}`,
        }),
        description: `base²[${cell.i}][${cell.j}]=${cell.value}`,
        codeLine: 6,
      });
    }
    base = sqC;

    n >>= 1;
    bitIdx++;
    steps.push({
      state: snap({ message: `n >>= 1，n = ${n}${n > 0 ? `（二进制 ${(n).toString(2)}）` : '，循环结束'}` }),
      description: `n=${n}`,
      codeLine: 15,
    });
  }

  const answer = result[0][1];
  steps.push({
    state: snap({ answer, phase: 'done', message: `F(${nInput}) = result[0][1] = ${answer}` }),
    description: `F(${nInput})=${answer}`,
    codeLine: 17,
  });

  return steps;
}

function MatrixView({ m, title, highlight, accent }: { m: Matrix; title: string; highlight?: [number, number] | null; accent?: 'yellow' | 'blue' | 'green' }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] text-gray-500">{title}</div>
      <div className="border-l-2 border-r-2 border-gray-500 rounded-sm p-1">
        <div className="grid grid-cols-2 gap-1">
          {m.map((row, i) =>
            row.map((v, j) => {
              const isHl = highlight && highlight[0] === i && highlight[1] === j;
              return (
                <div
                  key={`${i}-${j}`}
                  className={clsx(
                    'w-11 h-11 flex items-center justify-center rounded text-xs font-mono border transition-all',
                    isHl
                      ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200 scale-105'
                      : accent === 'green'
                        ? 'bg-green-500/10 border-green-800 text-green-300'
                        : accent === 'blue'
                          ? 'bg-blue-500/10 border-blue-900 text-blue-300'
                          : 'bg-surface-2 border-edge-2 text-gray-300',
                  )}
                >
                  {v}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

export function MatrixExponentiationPanel() {
  const [n, setN] = useState(10);
  const steps = useMemo(() => buildSteps(n), [n]);

  const initial: MatExpState = {
    nOriginal: n,
    nCurrent: n,
    bitIdx: 0,
    base: [[1, 1], [1, 0]],
    result: [[1, 0], [0, 1]],
    mulA: null,
    mulB: null,
    mulC: null,
    mulCell: null,
    mulFormula: '',
    mulTarget: null,
    answer: null,
    phase: 'init',
    message: '',
  };

  return (
    <Stepper<MatExpState>
      steps={steps}
      initialState={initial}
      codeLines={matExpCode}
      codeTitle="矩阵快速幂 Matrix Exponentiation"
      headerActions={
        <>
          <span className="text-sm text-gray-400">n:</span>
          <input
            type="number"
            min={1}
            max={30}
            value={n}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v >= 1 && v <= 30) setN(v);
            }}
            className="bg-surface-2 border border-edge rounded px-2 py-1 text-sm w-20"
          />
        </>
      }
      render={(state) => {
        const binary = state.nOriginal.toString(2);
        return (
          <div className="space-y-5">
            <div className="text-xs text-gray-500">
              黄色=正在计算的单元格，绿色=result 矩阵，蓝色=base 矩阵
            </div>

            {/* Binary decomposition */}
            <div className="flex items-center justify-center gap-2 text-sm font-mono">
              <span className="text-gray-400">n = {state.nOriginal} → 二进制:</span>
              {[...binary].reverse().map((b, i) => (
                <span
                  key={i}
                  className={clsx(
                    'w-7 h-7 flex items-center justify-center rounded border text-xs',
                    i === state.bitIdx
                      ? 'bg-yellow-500/30 border-yellow-400 text-yellow-200'
                      : b === '1'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-surface-2 border-edge-2 text-gray-500',
                  )}
                >
                  {b}
                </span>
              ))}
              <span className="text-gray-500 text-xs ml-1">（低位在左）</span>
            </div>

            {/* Multiplication view */}
            {state.phase === 'mul' && state.mulA && state.mulB && state.mulC ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <MatrixView m={state.mulA} title={state.mulTarget === 'result' ? 'result' : 'base'} accent="green" />
                  <span className="text-gray-400 text-lg">×</span>
                  <MatrixView m={state.mulB} title="base" accent="blue" />
                  <span className="text-gray-400 text-lg">=</span>
                  <MatrixView m={state.mulC} title={state.mulTarget === 'result' ? '新 result' : '新 base'} highlight={state.mulCell} />
                </div>
                <div className="text-center text-sm font-mono text-yellow-300">{state.mulFormula}</div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <MatrixView m={state.result} title="result" accent="green" />
                <MatrixView m={state.base} title="base" accent="blue" />
              </div>
            )}

            {/* Answer */}
            {state.answer !== null && (
              <div className="text-center p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <span className="text-green-300 font-mono text-sm">F({state.nOriginal}) = {state.answer}</span>
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
