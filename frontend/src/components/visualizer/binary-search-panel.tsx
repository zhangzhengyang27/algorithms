'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Search } from 'lucide-react';
import { generateBinarySearchSteps, generateSortedArray, SearchStep } from '@/lib/algorithms/searching';
import clsx from 'clsx';
import { CodePanel } from './code-panel';

const binarySearchPanelCode = [
  'function binarySearch(arr, target) {',
  '  let low = 0, high = arr.length - 1;',
  '  while (low <= high) {',
  '    const mid = Math.floor((low + high) / 2);',
  '    if (arr[mid] === target) {',
  '      return mid; // 找到目标',
  '    } else if (arr[mid] < target) {',
  '      low = mid + 1; // 搜索右半部分',
  '    } else {',
  '      high = mid - 1; // 搜索左半部分',
  '    }',
  '  }',
  '  return -1; // 未找到',
  '}',
];

interface VisualizationState {
  array: number[];
  low: number;
  high: number;
  mid: number;
  comparing: number[];
  found: boolean;
  description: string;
}

export function BinarySearchPanel() {
  const [arraySize, setArraySize] = useState(15);
  const [target, setTarget] = useState(42);
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [state, setState] = useState<VisualizationState | null>(null);

  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const generateNewSearch = useCallback(() => {
    const array = generateSortedArray(arraySize, 100);
    const targetValue = array[Math.floor(Math.random() * array.length)];
    setTarget(targetValue);
    const newSteps = generateBinarySearchSteps(array, targetValue);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
    if (newSteps.length > 0) {
      setState({
        array: newSteps[0].array,
        low: newSteps[0].low,
        high: newSteps[0].high,
        mid: newSteps[0].mid,
        comparing: newSteps[0].comparing,
        found: newSteps[0].found,
        description: newSteps[0].description,
      });
    }
  }, [arraySize]);

  useEffect(() => {
    generateNewSearch();
  }, [generateNewSearch]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 800);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length]);

  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      setState({
        array: step.array,
        low: step.low,
        high: step.high,
        mid: step.mid,
        comparing: step.comparing,
        found: step.found,
        description: step.description,
      });
    }
  }, [currentStep, steps]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getBarColor = (index: number) => {
    if (index === state?.mid) {
      return state.found ? 'bg-green-500' : 'bg-yellow-400';
    }
    if (index >= state!.low && index <= state!.high) {
      return 'bg-blue-400';
    }
    return 'bg-gray-600';
  };

  const currentCodeLine = (() => {
    const desc = state?.description || '';
    if (desc.includes('初始化') || desc.includes('开始')) return 2;
    if (desc.includes('mid') || desc.includes('中间')) return 4;
    if (desc.includes('找到') || desc.includes('相等')) return 6;
    if (desc.includes('右') || desc.includes('大于')) return 8;
    if (desc.includes('左') || desc.includes('小于')) return 10;
    if (desc.includes('未找到')) return 13;
    return 3;
  })();

  if (!state) {
    return <div className="h-80 flex items-center justify-center text-gray-400">加载中...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: '480px' }}>
      <div className="lg:col-span-3 space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">数组大小:</span>
          <input
            type="range"
            min="5"
            max="25"
            value={arraySize}
            onChange={(e) => {
              setArraySize(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-32 accent-blue-500"
          />
          <span className="text-sm text-gray-400 w-8">{arraySize}</span>
        </div>

        <div className="flex items-center gap-2">
          <Search size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">目标值: {target}</span>
        </div>

        <button
          onClick={generateNewSearch}
          className="flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-edge rounded-lg text-sm transition-colors"
        >
          <RefreshCw size={16} />
          新数组
        </button>
      </div>

      {/* Visualization */}
      <div className="h-64 bg-surface rounded-xl border border-edge p-4">
        {/* Range indicator */}
        <div className="text-center text-sm text-gray-400 mb-2">
          搜索范围: [{state.low}, {state.high}]
        </div>

        {/* Bars */}
        <div className="flex items-end justify-center gap-1 h-48 overflow-x-auto pb-1">
          {state.array.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-6 rounded-t transition-all duration-300 flex items-end justify-center pb-1 text-xs font-medium',
                  getBarColor(index)
                )}
                style={{ height: `${(value / Math.max(...state.array)) * 100}%` }}
              >
                {value}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">{index}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="text-center text-gray-300 text-sm min-h-[1.5rem]">
        {state.description}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded" />
          <span className="text-gray-400">搜索范围</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded" />
          <span className="text-gray-400">当前检查</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-400">找到</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={handleReset} className="p-2 text-gray-400 hover:text-white transition-colors">
          <RefreshCw size={20} />
        </button>

        <button onClick={handlePrev} disabled={currentStep === 0} className="p-2 text-gray-400 hover:text-white disabled:opacity-30">
          <SkipBack size={20} />
        </button>

        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className={clsx(
            'p-3 rounded-full transition-colors',
            isPlaying ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
          )}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button onClick={handleNext} disabled={currentStep >= steps.length - 1} className="p-2 text-gray-400 hover:text-white disabled:opacity-30">
          <SkipForward size={20} />
        </button>

        <div className="ml-4 text-sm text-gray-400">
          {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Step Slider */}
      <div className="px-4">
        <input
          type="range"
          min="0"
          max={Math.max(0, steps.length - 1)}
          value={currentStep}
          onChange={(e) => setCurrentStep(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>
      </div>
      <div className="lg:col-span-2 min-h-[480px]">
        <CodePanel
          codeLines={binarySearchPanelCode}
          highlightLine={currentCodeLine}
          description={state?.description || ''}
          title="二分查找"
        />
      </div>
    </div>
  );
}
