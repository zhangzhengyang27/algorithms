import {
  bubbleSort,
  selectionSort,
  insertionSort,
  quickSort,
  mergeSort,
  heapSort,
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
