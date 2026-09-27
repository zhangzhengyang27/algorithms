import {
  bubbleSort,
  selectionSort,
  insertionSort,
  quickSort,
  mergeSort,
  heapSort,
  generateSortSteps,
  generateRandomArray,
  type SortStep,
} from './sorting';

type SortFn = (arr: number[]) => Generator<SortStep>;

function drainSteps(gen: Generator<SortStep>): SortStep[] {
  const out: SortStep[] = [];
  for (const step of gen) out.push(step);
  return out;
}

function finalArrayFromSteps(steps: SortStep[]): number[] {
  return steps[steps.length - 1].array;
}

const ALGORITHMS: ReadonlyArray<readonly [string, SortFn]> = [
  ['bubble', bubbleSort],
  ['selection', selectionSort],
  ['insertion', insertionSort],
  ['quick', quickSort],
  ['merge', mergeSort],
  ['heap', heapSort],
];

describe('sorting algorithms', () => {
  for (const [name, algo] of ALGORITHMS) {
    describe(name, () => {
      it('produces a sorted array', () => {
        const input = [5, 2, 8, 1, 9, 3, 7, 4, 6];
        const expected = [...input].sort((a, b) => a - b);
        const steps = drainSteps(algo(input));
        expect(finalArrayFromSteps(steps)).toEqual(expected);
      });

      it('handles empty input', () => {
        expect(finalArrayFromSteps(drainSteps(algo([])))).toEqual([]);
      });

      it('handles single element', () => {
        expect(finalArrayFromSteps(drainSteps(algo([42])))).toEqual([42]);
      });

      it('handles already sorted input', () => {
        const input = [1, 2, 3, 4, 5];
        expect(finalArrayFromSteps(drainSteps(algo(input)))).toEqual(input);
      });

      it('handles reverse sorted input', () => {
        expect(finalArrayFromSteps(drainSteps(algo([5, 4, 3, 2, 1])))).toEqual([1, 2, 3, 4, 5]);
      });

      it('handles duplicates', () => {
        expect(finalArrayFromSteps(drainSteps(algo([3, 1, 3, 2, 3, 1])))).toEqual([1, 1, 2, 3, 3, 3]);
      });
    });
  }
});

describe('generateSortSteps（sorting-panel 实际调用的那层封装）', () => {
  const ALGOS = ['bubble', 'selection', 'insertion', 'quick', 'merge', 'heap'] as const;
  for (const algorithm of ALGOS) {
    for (const input of [[5, 2, 8, 1, 9, 2], [], [4, 4, 1], [1, 2, 3]]) {
      it(`${algorithm}：末步数组等于排序结果、元素守恒，且不改动调用方的数组`, () => {
        const pristine = [...input];
        const steps = generateSortSteps(input, algorithm);
        if (input.length > 1) expect(steps.length).toBeGreaterThan(0);
        if (steps.length) {
          const want = [...pristine].sort((a, b) => a - b);
          const last = steps[steps.length - 1].array;
          expect([...last].sort((a, b) => a - b)).toEqual(want);
          if (input.length) expect([...last]).toEqual(want);
        }
        expect(input).toEqual(pristine);
      });
    }
  }
});

describe('generateRandomArray', () => {
  for (const size of [0, 1, 12]) {
    it(`长度等于 size 且元素落在 [1, max]`, () => {
      const arr = generateRandomArray(size, 20);
      expect(arr.length).toBe(size);
      arr.forEach((v) => {
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(20);
      });
    });
  }
});
