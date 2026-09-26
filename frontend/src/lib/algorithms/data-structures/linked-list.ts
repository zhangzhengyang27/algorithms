/**
 * 链表 (Linked List)
 * 带虚拟头结点的单链表实现，支持增删改查
 * 移植自 Java DSA 项目 DataStructure/linkedList
 */

class ListNode<T> {
  value: T;
  next: ListNode<T> | null;

  constructor(value: T, next: ListNode<T> | null = null) {
    this.value = value;
    this.next = next;
  }
}

export class LinkedList<T> {
  private dummyHead: ListNode<T>;
  private _size: number;

  constructor() {
    this.dummyHead = new ListNode<T>(null as unknown as T);
    this._size = 0;
  }

  get size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  /** 在 index 位置插入元素 */
  add(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      throw new Error(`Add failed. Illegal index: ${index}`);
    }
    let prev = this.dummyHead;
    for (let i = 0; i < index; i++) {
      prev = prev.next!;
    }
    prev.next = new ListNode(value, prev.next);
    this._size++;
  }

  addFirst(value: T): void {
    this.add(0, value);
  }

  addLast(value: T): void {
    this.add(this._size, value);
  }

  /** 获取 index 位置的元素 */
  get(index: number): T {
    this.checkIndex(index);
    let cur = this.dummyHead.next!;
    for (let i = 0; i < index; i++) {
      cur = cur.next!;
    }
    return cur.value;
  }

  getFirst(): T {
    return this.get(0);
  }

  getLast(): T {
    return this.get(this._size - 1);
  }

  /** 设置 index 位置的元素 */
  set(index: number, value: T): void {
    this.checkIndex(index);
    let cur = this.dummyHead.next!;
    for (let i = 0; i < index; i++) {
      cur = cur.next!;
    }
    cur.value = value;
  }

  /** 删除 index 位置的元素 */
  remove(index: number): T {
    this.checkIndex(index);
    let prev = this.dummyHead;
    for (let i = 0; i < index; i++) {
      prev = prev.next!;
    }
    const delNode = prev.next!;
    prev.next = delNode.next;
    delNode.next = null;
    this._size--;
    return delNode.value;
  }

  removeFirst(): T {
    return this.remove(0);
  }

  removeLast(): T {
    return this.remove(this._size - 1);
  }

  /** 删除第一个值为 value 的节点 */
  removeElement(value: T): boolean {
    let prev = this.dummyHead;
    while (prev.next !== null) {
      if (prev.next.value === value) {
        const delNode = prev.next;
        prev.next = delNode.next;
        delNode.next = null;
        this._size--;
        return true;
      }
      prev = prev.next;
    }
    return false;
  }

  contains(value: T): boolean {
    let cur = this.dummyHead.next;
    while (cur !== null) {
      if (cur.value === value) return true;
      cur = cur.next;
    }
    return false;
  }

  /** 转为数组 */
  toArray(): T[] {
    const result: T[] = [];
    let cur = this.dummyHead.next;
    while (cur !== null) {
      result.push(cur.value);
      cur = cur.next;
    }
    return result;
  }

  /** 反转链表（迭代） */
  reverse(): void {
    let prev: ListNode<T> | null = null;
    let cur = this.dummyHead.next;
    while (cur !== null) {
      const next = cur.next;
      cur.next = prev;
      prev = cur;
      cur = next;
    }
    this.dummyHead.next = prev;
  }

  private checkIndex(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new Error(`Index ${index} out of bounds for size ${this._size}`);
    }
  }

  toString(): string {
    return `${this.toArray().join(' -> ')} -> NULL`;
  }
}

/**
 * 递归方式操作链表（教学用）
 * 演示递归思维：将链表问题分解为 head + 子链表
 */
export function removeElementsRecursive<T>(
  head: { value: T; next: unknown } | null,
  value: T,
): typeof head {
  if (head === null) return null;
  const res = removeElementsRecursive(head.next as typeof head, value);
  if (head.value === value) return res;
  head.next = res;
  return head;
}
