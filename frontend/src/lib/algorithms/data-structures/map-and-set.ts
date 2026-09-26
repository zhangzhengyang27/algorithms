/**
 * 映射与集合 (Map & Set)
 * 基于 BST 和链表的两种实现
 * 移植自 Java DSA 项目 map/ 和 set/
 */
import { BST } from './bst';

// ==================== Map ====================

export interface Map<K, V> {
  size: number;
  isEmpty(): boolean;
  add(key: K, value: V): void;
  remove(key: K): V | undefined;
  contains(key: K): boolean;
  get(key: K): V | undefined;
  set(key: K, value: V): void;
}

/** 基于 BST 的映射（键需要可比较） */
export class BSTMap<K, V> implements Map<K, V> {
  private keys: K[] = [];
  private values: V[] = [];
  private compareFn: (a: K, b: K) => number;

  constructor(compareFn?: (a: K, b: K) => number) {
    this.compareFn = compareFn ?? ((a, b) => (a as unknown as number) - (b as unknown as number));
  }

  get size(): number {
    return this.keys.length;
  }

  isEmpty(): boolean {
    return this.keys.length === 0;
  }

  add(key: K, value: V): void {
    const idx = this.findIndex(key);
    if (idx !== -1) {
      this.values[idx] = value;
    } else {
      this.keys.push(key);
      this.values.push(value);
    }
  }

  remove(key: K): V | undefined {
    const idx = this.findIndex(key);
    if (idx === -1) return undefined;
    const val = this.values[idx];
    this.keys.splice(idx, 1);
    this.values.splice(idx, 1);
    return val;
  }

  contains(key: K): boolean {
    return this.findIndex(key) !== -1;
  }

  get(key: K): V | undefined {
    const idx = this.findIndex(key);
    return idx === -1 ? undefined : this.values[idx];
  }

  set(key: K, value: V): void {
    const idx = this.findIndex(key);
    if (idx === -1) throw new Error(`Key not found: ${key}`);
    this.values[idx] = value;
  }

  private findIndex(key: K): number {
    return this.keys.findIndex((k) => this.compareFn(k, key) === 0);
  }
}

/** 基于链表的映射（无需键可比较） */
export class LinkedListMap<K, V> implements Map<K, V> {
  private entries: { key: K; value: V }[] = [];

  get size(): number {
    return this.entries.length;
  }

  isEmpty(): boolean {
    return this.entries.length === 0;
  }

  add(key: K, value: V): void {
    const entry = this.entries.find((e) => e.key === key);
    if (entry) {
      entry.value = value;
    } else {
      this.entries.push({ key, value });
    }
  }

  remove(key: K): V | undefined {
    const idx = this.entries.findIndex((e) => e.key === key);
    if (idx === -1) return undefined;
    return this.entries.splice(idx, 1)[0].value;
  }

  contains(key: K): boolean {
    return this.entries.some((e) => e.key === key);
  }

  get(key: K): V | undefined {
    return this.entries.find((e) => e.key === key)?.value;
  }

  set(key: K, value: V): void {
    const entry = this.entries.find((e) => e.key === key);
    if (!entry) throw new Error(`Key not found: ${key}`);
    entry.value = value;
  }
}

// ==================== Set ====================

export interface Set<T> {
  size: number;
  isEmpty(): boolean;
  add(value: T): void;
  remove(value: T): boolean;
  contains(value: T): boolean;
}

/** 基于 BST 的集合（自动去重、有序） */
export class BSTSet<T> implements Set<T> {
  private bst: BST<T>;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.bst = new BST<T>(compareFn);
  }

  get size(): number {
    return this.bst.size;
  }

  isEmpty(): boolean {
    return this.bst.isEmpty();
  }

  add(value: T): void {
    this.bst.add(value);
  }

  remove(value: T): boolean {
    return this.bst.remove(value);
  }

  contains(value: T): boolean {
    return this.bst.contains(value);
  }

  /** 中序遍历得到有序元素 */
  toArray(): T[] {
    return this.bst.inOrder();
  }
}

/** 基于链表的集合（无需元素可比较） */
export class LinkedListSet<T> implements Set<T> {
  private items: T[] = [];

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  add(value: T): void {
    if (!this.contains(value)) {
      this.items.push(value);
    }
  }

  remove(value: T): boolean {
    const idx = this.items.indexOf(value);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }

  contains(value: T): boolean {
    return this.items.includes(value);
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// ==================== LeetCode 应用 ====================

/**
 * LeetCode 349: 两个数组的交集（使用 Set）
 */
export function intersection(nums1: number[], nums2: number[]): number[] {
  const set1 = new BSTSet<number>();
  nums1.forEach((n) => set1.add(n));
  const result = new BSTSet<number>();
  nums2.forEach((n) => {
    if (set1.contains(n)) result.add(n);
  });
  return result.toArray();
}

/**
 * LeetCode 350: 两个数组的交集 II（使用 Map 记录频率）
 */
export function intersect(nums1: number[], nums2: number[]): number[] {
  const freqMap = new LinkedListMap<number, number>();
  for (const n of nums1) {
    freqMap.add(n, (freqMap.get(n) ?? 0) + 1);
  }
  const result: number[] = [];
  for (const n of nums2) {
    const freq = freqMap.get(n) ?? 0;
    if (freq > 0) {
      result.push(n);
      freqMap.add(n, freq - 1);
    }
  }
  return result;
}
