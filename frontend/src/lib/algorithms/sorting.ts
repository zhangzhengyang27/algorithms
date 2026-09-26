export type SortAlgorithm = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge' | 'heap';

export interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  description: string;
  codeLine: number;
}

export function generateRandomArray(size: number, max = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
}

export function* bubbleSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      yield {
        array: [...array],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        description: `比较 arr[${j}]=${array[j]} 和 arr[${j + 1}]=${array[j + 1]}`,
        codeLine: 7,
      };

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapped = true;
        yield {
          array: [...array],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          description: `交换 arr[${j}] 和 arr[${j + 1}]`,
          codeLine: 9,
        };
      }
    }
    if (!swapped) {
      yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        description: '本轮无交换，提前结束',
        codeLine: 14,
      };
      break;
    }
    sorted.unshift(n - 1 - i);
  }
  sorted.unshift(0);

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    description: '排序完成',
    codeLine: 16,
  };
}

export function* selectionSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      yield {
        array: [...array],
        comparing: [minIdx, j],
        swapping: [],
        sorted: [...sorted],
        description: `寻找最小值: 比较 arr[${minIdx}]=${array[minIdx]} 和 arr[${j}]=${array[j]}`,
        codeLine: 7,
      };

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      yield {
        array: [...array],
        comparing: [],
        swapping: [i, minIdx],
        sorted: [...sorted],
        description: `交换 arr[${i}] 和 arr[${minIdx}]`,
        codeLine: 11,
      };
    }

    sorted.push(i);
  }
  sorted.push(n - 1);

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    description: '排序完成',
    codeLine: 14,
  };
}

export function* insertionSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted = [0];

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    yield {
      array: [...array],
      comparing: [i],
      swapping: [],
      sorted: [...sorted],
      description: `将 arr[${i}]=${key} 插入已排序部分`,
      codeLine: 4,
    };

    while (j >= 0 && array[j] > key) {
      yield {
        array: [...array],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        description: `移动 arr[${j}]=${array[j]} 到位置 ${j + 1}`,
        codeLine: 7,
      };

      array[j + 1] = array[j];
      j--;
    }

    if (j + 1 !== i) {
      array[j + 1] = key;
      yield {
        array: [...array],
        comparing: [],
        swapping: [j + 1],
        sorted: [...sorted],
        description: `将 ${key} 插入位置 ${j + 1}`,
        codeLine: 10,
      };
    }

    sorted.push(i);
  }

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    description: '排序完成',
    codeLine: 12,
  };
}

export function* quickSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted: Set<number> = new Set();

  function* partition(low: number, high: number): Generator<SortStep | number> {
    const pivotValue = array[high];

    yield {
      array: [...array],
      comparing: [high],
      swapping: [],
      sorted: Array.from(sorted),
      description: `选择 pivot: arr[${high}]=${pivotValue}`,
      codeLine: 12,
    };

    if (high !== low) {
      [array[low], array[high]] = [array[high], array[low]];
      yield {
        array: [...array],
        comparing: [],
        swapping: [low, high],
        sorted: Array.from(sorted),
        description: `将 pivot 放到起始位置`,
        codeLine: 12,
      };
    }

    let i = low;
    for (let j = low + 1; j <= high; j++) {
      yield {
        array: [...array],
        comparing: [j, low],
        swapping: [],
        sorted: Array.from(sorted),
        description: `比较 arr[${j}]=${array[j]} 和 pivot=${pivotValue}`,
        codeLine: 15,
      };

      if (array[j] < pivotValue) {
        i++;
        if (i !== j) {
          [array[i], array[j]] = [array[j], array[i]];
          yield {
            array: [...array],
            comparing: [],
            swapping: [i, j],
            sorted: Array.from(sorted),
            description: `交换 arr[${i}] 和 arr[${j}]`,
            codeLine: 17,
          };
        }
      }
    }

    if (i !== low) {
      [array[low], array[i]] = [array[i], array[low]];
      yield {
        array: [...array],
        comparing: [],
        swapping: [low, i],
        sorted: Array.from(sorted),
        description: `将 pivot 放到正确位置`,
        codeLine: 21,
      };
    }

    sorted.add(i);
    yield i;
  }

  function* quickSortHelper(low: number, high: number): Generator<SortStep> {
    if (low < high) {
      let pivotIdx: number | undefined;
      
      for (const step of partition(low, high)) {
        if (typeof step === 'number') {
          pivotIdx = step;
        } else {
          yield step;
        }
      }

      if (pivotIdx !== undefined) {
        yield* quickSortHelper(low, pivotIdx - 1);
        yield* quickSortHelper(pivotIdx + 1, high);
      }
    } else if (low === high) {
      sorted.add(low);
    }
  }

  if (n > 0) {
    yield* quickSortHelper(0, n - 1);
  }

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    description: '排序完成',
    codeLine: 24,
  };
}

export function* mergeSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted: Set<number> = new Set();

  function* mergeSortHelper(left: number, right: number): Generator<SortStep> {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);

    yield* mergeSortHelper(left, mid);
    yield* mergeSortHelper(mid + 1, right);

    yield {
      array: [...array],
      comparing: [],
      swapping: [],
      sorted: Array.from(sorted),
      description: `合并区间 [${left}, ${mid}] 和 [${mid + 1}, ${right}]`,
      codeLine: 12,
    };

    const temp: number[] = [];
    let i = left,
      j = mid + 1;

    while (i <= mid && j <= right) {
      yield {
        array: [...array],
        comparing: [i, j],
        swapping: [],
        sorted: Array.from(sorted),
        description: `比较 arr[${i}]=${array[i]} 和 arr[${j}]=${array[j]}`,
        codeLine: 15,
      };

      if (array[i] <= array[j]) {
        temp.push(array[i++]);
      } else {
        temp.push(array[j++]);
      }
    }

    while (i <= mid) temp.push(array[i++]);
    while (j <= right) temp.push(array[j++]);

    for (let k = 0; k < temp.length; k++) {
      array[left + k] = temp[k];
    }

    yield {
      array: [...array],
      comparing: [],
      swapping: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      sorted: Array.from(sorted),
      description: `复制回数组`,
      codeLine: 20,
    };
  }

  yield* mergeSortHelper(0, n - 1);

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    description: '排序完成',
    codeLine: 23,
  };
}

export function* heapSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sorted: number[] = [];

  function* heapify(size: number, root: number): Generator<SortStep> {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < size) {
      yield {
        array: [...array],
        comparing: [largest, left],
        swapping: [],
        sorted: [...sorted],
        description: `比较 arr[${largest}]=${array[largest]} 和左子节点 arr[${left}]=${array[left]}`,
        codeLine: 12,
      };
      if (array[left] > array[largest]) {
        largest = left;
      }
    }

    if (right < size) {
      yield {
        array: [...array],
        comparing: [largest, right],
        swapping: [],
        sorted: [...sorted],
        description: `比较 arr[${largest}]=${array[largest]} 和右子节点 arr[${right}]=${array[right]}`,
        codeLine: 16,
      };
      if (array[right] > array[largest]) {
        largest = right;
      }
    }

    if (largest !== root) {
      [array[root], array[largest]] = [array[largest], array[root]];
      yield {
        array: [...array],
        comparing: [],
        swapping: [root, largest],
        sorted: [...sorted],
        description: `交换 arr[${root}] 和 arr[${largest}]`,
        codeLine: 21,
      };
      yield* heapify(size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    yield {
      array: [...array],
      comparing: [],
      swapping: [0, i],
      sorted: [...sorted, i],
      description: `将最大元素 arr[0] 移到位置 ${i}`,
      codeLine: 27,
    };
    sorted.unshift(i);
    yield* heapify(i, 0);
  }
  sorted.unshift(0);

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    description: '排序完成',
    codeLine: 30,
  };
}

export function generateSortSteps(
  array: number[],
  algorithm: SortAlgorithm
): SortStep[] {
  const algorithms: Record<SortAlgorithm, (arr: number[]) => Generator<SortStep>> = {
    bubble: bubbleSort,
    selection: selectionSort,
    insertion: insertionSort,
    quick: quickSort,
    merge: mergeSort,
    heap: heapSort,
  };

  const gen = algorithms[algorithm];
  const steps: SortStep[] = [];

  for (const step of gen(array)) {
    steps.push(step);
  }

  return steps;
}

// Code templates for each algorithm (used by CodePanel)
export const sortCodeTemplates: Record<SortAlgorithm, string[]> = {
  bubble: [
    'function bubbleSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = 0; i < n - 1; i++) {',
    '    let swapped = false;',
    '    for (let j = 0; j < n - i - 1; j++) {',
    '      // 比较相邻元素',
    '      if (arr[j] > arr[j + 1]) {',
    '        // 交换元素',
    '        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];',
    '        swapped = true;',
    '      }',
    '    }',
    '    // 如果没有交换操作，数组已排序完成',
    '    if (!swapped) break;',
    '  }',
    '  return arr;',
    '}',
  ],
  selection: [
    'function selectionSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = 0; i < n - 1; i++) {',
    '    let minIdx = i;',
    '    for (let j = i + 1; j < n; j++) {',
    '      // 寻找未排序部分的最小值',
    '      if (arr[j] < arr[minIdx]) {',
    '        minIdx = j;',
    '      }',
    '    }',
    '    // 将最小值交换到已排序部分末尾',
    '    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
    '  }',
    '  return arr;',
    '}',
  ],
  insertion: [
    'function insertionSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = 1; i < n; i++) {',
    '    const key = arr[i];',
    '    let j = i - 1;',
    '    // 将大于 key 的元素后移',
    '    while (j >= 0 && arr[j] > key) {',
    '      arr[j + 1] = arr[j];',
    '      j--;',
    '    }',
    '    arr[j + 1] = key;',
    '  }',
    '  return arr;',
    '}',
  ],
  quick: [
    'function quickSort(arr, low = 0, high = arr.length - 1) {',
    '  if (low < high) {',
    '    const pivotIdx = partition(arr, low, high);',
    '    quickSort(arr, low, pivotIdx - 1);',
    '    quickSort(arr, pivotIdx + 1, high);',
    '  }',
    '  return arr;',
    '}',
    '',
    'function partition(arr, low, high) {',
    '  const pivot = arr[high];',
    '  let i = low - 1;',
    '  for (let j = low; j < high; j++) {',
    '    // 将小于 pivot 的元素放到左边',
    '    if (arr[j] < pivot) {',
    '      i++;',
    '      [arr[i], arr[j]] = [arr[j], arr[i]];',
    '    }',
    '  }',
    '  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];',
    '  return i + 1;',
    '}',
  ],
  merge: [
    'function mergeSort(arr) {',
    '  if (arr.length <= 1) return arr;',
    '  const mid = Math.floor(arr.length / 2);',
    '  const left = mergeSort(arr.slice(0, mid));',
    '  const right = mergeSort(arr.slice(mid));',
    '  return merge(left, right);',
    '}',
    '',
    'function merge(left, right) {',
    '  const result = [];',
    '  let i = 0, j = 0;',
    '  // 比较两个子数组的头部元素',
    '  while (i < left.length && j < right.length) {',
    '    if (left[i] <= right[j]) {',
    '      result.push(left[i++]);',
    '    } else {',
    '      result.push(right[j++]);',
    '    }',
    '  }',
    '  // 将剩余元素复制回数组',
    '  return [...result, ...left.slice(i), ...right.slice(j)];',
    '}',
  ],
  heap: [
    'function heapSort(arr) {',
    '  const n = arr.length;',
    '  // 构建最大堆',
    '  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {',
    '    heapify(arr, n, i);',
    '  }',
    '  // 逐个提取最大元素',
    '  for (let i = n - 1; i > 0; i--) {',
    '    [arr[0], arr[i]] = [arr[i], arr[0]];',
    '    heapify(arr, i, 0);',
    '  }',
    '  return arr;',
    '}',
    '',
    'function heapify(arr, size, root) {',
    '  let largest = root;',
    '  const left = 2 * root + 1;',
    '  const right = 2 * root + 2;',
    '  // 比较左子节点',
    '  if (left < size && arr[left] > arr[largest]) {',
    '    largest = left;',
    '  }',
    '  // 比较右子节点',
    '  if (right < size && arr[right] > arr[largest]) {',
    '    largest = right;',
    '  }',
    '  // 如果最大值不是根节点，交换并递归',
    '  if (largest !== root) {',
    '    [arr[root], arr[largest]] = [arr[largest], arr[root]];',
    '    heapify(arr, size, largest);',
    '  }',
    '}',
  ],
};
