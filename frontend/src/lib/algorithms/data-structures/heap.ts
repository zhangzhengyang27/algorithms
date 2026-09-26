/**
 * 堆与优先队列 (Heap & Priority Queue)
 * 最大堆、最小堆、优先队列、堆排序
 * 移植自 Java DSA 项目 heap/
 */

/** 最大堆：父节点 >= 子节点 */
export class MaxHeap<T> {
  private data: T[];
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.data = [];
    // 默认数字比较：a > b 返回正数
    this.compareFn = compareFn ?? ((a, b) => (a as unknown as number) - (b as unknown as number));
  }

  get size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  /** 从数组构建堆（heapify），O(n) */
  static fromArray<T>(arr: T[], compareFn?: (a: T, b: T) => number): MaxHeap<T> {
    const heap = new MaxHeap<T>(compareFn);
    heap.data = [...arr];
    // 从最后一个非叶子节点开始下沉
    for (let i = heap.parent(arr.length - 1); i >= 0; i--) {
      heap.siftDown(i);
    }
    return heap;
  }

  /** 添加元素，O(log n) */
  add(value: T): void {
    this.data.push(value);
    this.siftUp(this.data.length - 1);
  }

  /** 查看堆顶（最大值） */
  findMax(): T {
    if (this.isEmpty()) throw new Error('Heap is empty');
    return this.data[0];
  }

  /** 取出堆顶（最大值），O(log n) */
  extractMax(): T {
    const ret = this.findMax();
    this.swap(0, this.data.length - 1);
    this.data.pop();
    if (this.data.length > 0) {
      this.siftDown(0);
    }
    return ret;
  }

  /** 取出堆顶并替换为新元素（一次 O(log n)，比 extract + add 快） */
  replace(value: T): T {
    const ret = this.findMax();
    this.data[0] = value;
    this.siftDown(0);
    return ret;
  }

  toArray(): T[] {
    return [...this.data];
  }

  /** 上浮：新元素与父节点比较 */
  private siftUp(k: number): void {
    while (k > 0 && this.compareFn(this.data[this.parent(k)], this.data[k]) < 0) {
      this.swap(k, this.parent(k));
      k = this.parent(k);
    }
  }

  /** 下沉：与较大子节点比较 */
  private siftDown(k: number): void {
    while (this.leftChild(k) < this.data.length) {
      let j = this.leftChild(k);
      // 选择较大的子节点
      if (j + 1 < this.data.length && this.compareFn(this.data[j + 1], this.data[j]) > 0) {
        j++;
      }
      // 如果当前节点 >= 较大子节点，满足堆序
      if (this.compareFn(this.data[k], this.data[j]) >= 0) break;
      this.swap(k, j);
      k = j;
    }
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number): number {
    return index * 2 + 1;
  }

  private swap(i: number, j: number): void {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
  }
}

/** 最小堆：父节点 <= 子节点 */
export class MinHeap<T> {
  private heap: MaxHeap<T>;

  constructor(compareFn?: (a: T, b: T) => number) {
    // 反转比较函数即可将最大堆变为最小堆
    const reversed = compareFn
      ? (a: T, b: T) => -compareFn(a, b)
      : (a: T, b: T) => (b as unknown as number) - (a as unknown as number);
    this.heap = new MaxHeap<T>(reversed);
  }

  get size(): number {
    return this.heap.size;
  }

  isEmpty(): boolean {
    return this.heap.isEmpty();
  }

  add(value: T): void {
    this.heap.add(value);
  }

  findMin(): T {
    return this.heap.findMax();
  }

  extractMin(): T {
    return this.heap.extractMax();
  }

  replace(value: T): T {
    return this.heap.replace(value);
  }

  toArray(): T[] {
    return this.heap.toArray();
  }
}

/**
 * 优先队列：基于最大堆实现
 * 优先级高的先出队（compareFn 返回越大优先级越高）
 */
export class PriorityQueue<T> {
  private heap: MaxHeap<T>;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.heap = new MaxHeap<T>(compareFn);
  }

  get size(): number {
    return this.heap.size;
  }

  isEmpty(): boolean {
    return this.heap.isEmpty();
  }

  enqueue(value: T): void {
    this.heap.add(value);
  }

  dequeue(): T {
    return this.heap.extractMax();
  }

  getFront(): T {
    return this.heap.findMax();
  }
}

/**
 * 堆排序，O(n log n)
 * 利用最大堆，每次取出最大值放到数组末尾
 */
export function heapSort(arr: number[]): number[] {
  const result = [...arr];
  const heap = MaxHeap.fromArray(result);
  for (let i = result.length - 1; i >= 0; i--) {
    result[i] = heap.extractMax();
  }
  return result;
}

/**
 * TopK 问题：找出数组中最小的 k 个数
 * 维护大小为 k 的最大堆，O(n log k)
 */
export function getLeastNumbers(arr: number[], k: number): number[] {
  if (k === 0 || arr.length === 0) return [];
  const heap = new MaxHeap<number>();
  for (let i = 0; i < k; i++) {
    heap.add(arr[i]);
  }
  for (let i = k; i < arr.length; i++) {
    if (arr[i] < heap.findMax()) {
      heap.replace(arr[i]);
    }
  }
  return heap.toArray();
}
