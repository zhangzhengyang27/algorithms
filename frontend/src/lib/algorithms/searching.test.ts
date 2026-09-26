import { generateBinarySearchSteps, generateSortedArray } from './searching';

describe('generateBinarySearchSteps', () => {
  it('finds an existing target', () => {
    const arr = [1, 3, 5, 7, 9, 11, 13];
    const steps = generateBinarySearchSteps(arr, 7);
    const last = steps[steps.length - 1];
    expect(last.found).toBe(true);
    expect(last.mid).toBe(3);
  });

  it('returns not-found steps for missing target', () => {
    const arr = [1, 3, 5, 7, 9];
    const steps = generateBinarySearchSteps(arr, 4);
    const last = steps[steps.length - 1];
    expect(last.found).toBe(false);
  });

  it('handles empty input', () => {
    const arr: number[] = [];
    const steps = generateBinarySearchSteps(arr, 5);
    const last = steps[steps.length - 1];
    expect(last.found).toBe(false);
  });
});

describe('generateSortedArray', () => {
  it('produces a sorted array of requested size', () => {
    const arr = generateSortedArray(20, 100);
    expect(arr).toHaveLength(20);
    for (let i = 1; i < arr.length; i++) {
      expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]);
    }
  });

  it('handles size=0', () => {
    expect(generateSortedArray(0)).toEqual([]);
  });
});
