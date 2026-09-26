/**
 * 队列 (Queue)
 * 包含数组队列、循环队列、链表队列、双端队列
 * 移植自 Java DSA 项目 DataStructure/queues
 */

export interface Queue<T> {
  size: number;
  isEmpty(): boolean;
  enqueue(value: T): void;
  dequeue(): T;
  peek(): T;
}

/** 基于数组的队列（出队 O(n)，教学用） */
export class ArrayQueue<T> implements Queue<T> {
  private data: T[] = [];

  get size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  enqueue(value: T): void {
    this.data.push(value);
  }

  dequeue(): T {
    if (this.isEmpty()) throw new Error('Cannot dequeue from empty queue');
    return this.data.shift()!;
  }

  peek(): T {
    if (this.isEmpty()) throw new Error('Queue is empty');
    return this.data[0];
  }

  toArray(): T[] {
    return [...this.data];
  }
}

/**
 * 循环队列（推荐实现）
 * 出队入队均 O(1)，通过 front/tail 指针 + 取模实现环形
 */
export class LoopQueue<T> implements Queue<T> {
  private data: (T | undefined)[];
  private front: number;
  private tail: number;
  private _size: number;

  constructor(capacity = 10) {
    // 有意浪费一个空间来区分队满和队空
    this.data = new Array(capacity + 1);
    this.front = 0;
    this.tail = 0;
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }

  get capacity(): number {
    return this.data.length - 1;
  }

  isEmpty(): boolean {
    return this.front === this.tail;
  }

  enqueue(value: T): void {
    // 队满扩容
    if ((this.tail + 1) % this.data.length === this.front) {
      this.resize(this.capacity * 2);
    }
    this.data[this.tail] = value;
    this.tail = (this.tail + 1) % this.data.length;
    this._size++;
  }

  dequeue(): T {
    if (this.isEmpty()) throw new Error('Cannot dequeue from empty queue');
    const ret = this.data[this.front] as T;
    this.data[this.front] = undefined;
    this.front = (this.front + 1) % this.data.length;
    this._size--;
    // 缩容
    if (this._size === Math.floor(this.capacity / 4) && this.capacity / 2 !== 0) {
      this.resize(Math.floor(this.capacity / 2));
    }
    return ret;
  }

  peek(): T {
    if (this.isEmpty()) throw new Error('Queue is empty');
    return this.data[this.front] as T;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this.data[(this.front + i) % this.data.length] as T);
    }
    return result;
  }

  private resize(newCapacity: number): void {
    const newData = new Array(newCapacity + 1);
    for (let i = 0; i < this._size; i++) {
      newData[i] = this.data[(this.front + i) % this.data.length];
    }
    this.data = newData;
    this.front = 0;
    this.tail = this._size;
  }
}

/** 基于链表的队列（头出尾入，O(1)） */
export class LinkedListQueue<T> implements Queue<T> {
  private head: { value: T; next: unknown } | null;
  private tail: { value: T; next: unknown } | null;
  private _size: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  enqueue(value: T): void {
    const node = { value, next: null };
    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this._size++;
  }

  dequeue(): T {
    if (this.isEmpty()) throw new Error('Cannot dequeue from empty queue');
    const node = this.head!;
    this.head = node.next as typeof this.head;
    if (this.head === null) this.tail = null;
    this._size--;
    return node.value;
  }

  peek(): T {
    if (this.isEmpty()) throw new Error('Queue is empty');
    return this.head!.value;
  }

  toArray(): T[] {
    const result: T[] = [];
    let cur = this.head;
    while (cur !== null) {
      result.push(cur.value);
      cur = cur.next as typeof cur;
    }
    return result;
  }
}

/** 双端队列 (Deque)：两端均可入队出队 */
export class Deque<T> {
  private data: T[] = [];

  get size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  addFirst(value: T): void {
    this.data.unshift(value);
  }

  addLast(value: T): void {
    this.data.push(value);
  }

  removeFirst(): T {
    if (this.isEmpty()) throw new Error('Deque is empty');
    return this.data.shift()!;
  }

  removeLast(): T {
    if (this.isEmpty()) throw new Error('Deque is empty');
    return this.data.pop()!;
  }

  peekFirst(): T {
    if (this.isEmpty()) throw new Error('Deque is empty');
    return this.data[0];
  }

  peekLast(): T {
    if (this.isEmpty()) throw new Error('Deque is empty');
    return this.data[this.data.length - 1];
  }

  toArray(): T[] {
    return [...this.data];
  }
}
