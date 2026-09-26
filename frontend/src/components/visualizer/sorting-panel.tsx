'use client';

import { useState, useEffect, useMemo } from 'react';
import { SortAlgorithm, generateRandomArray, generateSortSteps, sortCodeTemplates } from '@/lib/algorithms/sorting';
import clsx from 'clsx';
import { Stepper, type VizStep } from './stepper';

const algorithms: { id: SortAlgorithm; name: string; complexity: string }[] = [
  { id: 'bubble', name: '冒泡排序', complexity: 'O(n²)' },
  { id: 'selection', name: '选择排序', complexity: 'O(n²)' },
  { id: 'insertion', name: '插入排序', complexity: 'O(n²)' },
  { id: 'quick', name: '快速排序', complexity: 'O(n log n)' },
  { id: 'merge', name: '归并排序', complexity: 'O(n log n)' },
  { id: 'heap', name: '堆排序', complexity: 'O(n log n)' },
];

interface VisualizationState {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  codeLine: number;
  description: string;
}

function getBarColor(state: VisualizationState, index: number) {
  if (state.sorted.includes(index)) return 'bg-green-500';
  if (state.swapping.includes(index)) return 'bg-red-500';
  if (state.comparing.includes(index)) return 'bg-yellow-400';
  return 'bg-blue-500';
}

export function SortingPanel() {
  const [algorithm, setAlgorithm] = useState<SortAlgorithm>('bubble');
  const [arraySize, setArraySize] = useState(20);
  const [array, setArray] = useState<number[]>([]);

  // 数组大小变化时重新生成随机数组
  useEffect(() => {
    setArray(generateRandomArray(arraySize, 100));
  }, [arraySize]);

  // 统一到通用 Stepper 的帧预计算范式：把排序步骤映射为 VizStep
  const steps = useMemo<VizStep<VisualizationState>[]>(() => {
    return generateSortSteps(array, algorithm).map((s) => ({
      state: {
        array: s.array,
        comparing: s.comparing,
        swapping: s.swapping,
        sorted: s.sorted,
        codeLine: s.codeLine,
        description: s.description,
      },
      description: s.description,
      codeLine: s.codeLine,
    }));
  }, [array, algorithm]);

  const initialState: VisualizationState =
    steps[0]?.state ?? {
      array: [],
      comparing: [],
      swapping: [],
      sorted: [],
      codeLine: 1,
      description: '',
    };

  const maxValue = Math.max(...(array.length ? array : [1]));

  const renderBars = (state: VisualizationState) => (
    <div className="flex-1 h-[340px] bg-surface rounded-xl border border-edge p-4 flex items-end justify-center gap-1">
      {state.array.map((value, index) => (
        <div
          key={index}
          className={clsx(
            'transition-all duration-150 rounded-t',
            getBarColor(state, index),
          )}
          style={{
            height: `${Math.max(2, (value / maxValue) * 100)}%`,
            width: `${Math.max(4, Math.min(40, 600 / arraySize - 4))}px`,
          }}
          title={`值: ${value}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <Stepper
        key={`${algorithm}-${arraySize}`}
        steps={steps}
        initialState={initialState}
        render={renderBars}
        codeLines={sortCodeTemplates[algorithm]}
        codeTitle="算法代码"
        headerActions={
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as SortAlgorithm)}
              className="px-4 py-2 bg-surface-2 border border-edge rounded-lg text-sm focus:outline-none focus:border-brand"
            >
              {algorithms.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name} ({algo.complexity})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">数量:</span>
              <input
                type="range"
                min="5"
                max="50"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="w-32 accent-blue-500"
              />
              <span className="text-sm text-gray-400 w-8">{arraySize}</span>
            </div>
          </div>
        }
      />

      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-gray-400">未排序</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded" />
          <span className="text-gray-400">比较中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-gray-400">交换中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-400">已排序</span>
        </div>
      </div>
    </div>
  );
}
