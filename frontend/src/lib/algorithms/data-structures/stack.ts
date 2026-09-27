/**
 * 栈 (Stack)
 * 包含数组栈和链表栈两种实现，LIFO
 * 移植自 Java DSA 项目 DataStructure/stacks
 */
import { DynamicArray } from './dynamic-array';

export interface Stack<T> {
  size: number;
  isEmpty(): boolean;
  push(value: T): void;
  pop(): T;
  peek(): T;
}

/** 基于动态数组的栈 */
export class ArrayStack<T> implements Stack<T> {
  private data: DynamicArray<T>;

  constructor(capacity = 10) {
    this.data = new DynamicArray<T>(capacity);
  }

  get size(): number {
    return this.data.size;
  }

  isEmpty(): boolean {
    return this.data.isEmpty();
  }

  push(value: T): void {
    this.data.addLast(value);
  }

  pop(): T {
    return this.data.removeLast();
  }

  peek(): T {
    return this.data.get(this.data.size - 1);
  }

  /**
   * 自顶向底返回，与 pop() 的观察顺序一致，也与 LinkedListStack 对齐。
   * 之前这里返回的是 DynamicArray 的自底向顶顺序，导致同一个 Stack<T> 接口的两个
   * 实现给出相反方向（见 PROJECT_MAP.md §8 第 18 项）。
   */
  toArray(): T[] {
    return this.data.toArray().reverse();
  }

  toString(): string {
    return `Stack: top -> [${this.toArray().join(', ')}]`;
  }
}

/** 基于链表的栈 */
export class LinkedListStack<T> implements Stack<T> {
  private top: { value: T; next: unknown } | null;
  private _size: number;

  constructor() {
    this.top = null;
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  push(value: T): void {
    this.top = { value, next: this.top };
    this._size++;
  }

  pop(): T {
    if (this.isEmpty()) throw new Error('Cannot pop from empty stack');
    const node = this.top!;
    this.top = node.next as typeof this.top;
    this._size--;
    return node.value;
  }

  peek(): T {
    if (this.isEmpty()) throw new Error('Cannot peek from empty stack');
    return this.top!.value;
  }

  toArray(): T[] {
    const result: T[] = [];
    let cur = this.top;
    while (cur !== null) {
      result.push(cur.value);
      cur = cur.next as typeof cur;
    }
    return result;
  }

  toString(): string {
    return `Stack: ${this.toArray().join(' -> ')} -> NULL`;
  }
}

/**
 * 经典应用：括号匹配 (LeetCode 20)
 */
export function isValidParentheses(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack[stack.length - 1] !== pairs[ch]) {
        return false;
      }
      stack.pop();
    }
  }
  return stack.length === 0;
}
