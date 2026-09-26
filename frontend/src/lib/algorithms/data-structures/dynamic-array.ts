/**
 * 动态数组 (Dynamic Array)
 * 支持自动扩容/缩容的泛型数组，均摊 O(1) 添加元素
 * 移植自 Java DSA 项目 DataStructure/arrays
 */
export class DynamicArray<T> {
  private data: (T | undefined)[];
  private _size: number;

  constructor(capacity = 10) {
    this.data = new Array(capacity);
    this._size = 0;
  }

  /** 获取元素个数 */
  get size(): number {
    return this._size;
  }

  /** 获取容量 */
  get capacity(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  /** 获取 index 位置的元素 */
  get(index: number): T {
    this.checkIndex(index);
    return this.data[index] as T;
  }

  /** 设置 index 位置的元素 */
  set(index: number, value: T): void {
    this.checkIndex(index);
    this.data[index] = value;
  }

  /** 在 index 位置插入元素 */
  add(index: number, value: T): void {
    if (index < 0 || index > this._size) {
      throw new Error(`Add failed. Require index >= 0 and index <= size, got ${index}`);
    }
    // 扩容：容量满时翻倍
    if (this._size === this.data.length) {
      this.resize(this.data.length * 2);
    }
    // 从后向前移动元素
    for (let i = this._size - 1; i >= index; i--) {
      this.data[i + 1] = this.data[i];
    }
    this.data[index] = value;
    this._size++;
  }

  /** 在末尾添加 */
  addLast(value: T): void {
    this.add(this._size, value);
  }

  /** 在头部添加 */
  addFirst(value: T): void {
    this.add(0, value);
  }

  /** 删除 index 位置的元素，返回被删除的元素 */
  remove(index: number): T {
    this.checkIndex(index);
    const ret = this.data[index] as T;
    for (let i = index + 1; i < this._size; i++) {
      this.data[i - 1] = this.data[i];
    }
    this._size--;
    this.data[this._size] = undefined;
    // 缩容：元素个数为容量的 1/4 时缩容（避免复杂度震荡）
    if (this._size === Math.floor(this.data.length / 4) && this.data.length / 2 !== 0) {
      this.resize(Math.floor(this.data.length / 2));
    }
    return ret;
  }

  removeFirst(): T {
    return this.remove(0);
  }

  removeLast(): T {
    return this.remove(this._size - 1);
  }

  /** 删除第一个值为 value 的元素 */
  removeElement(value: T): boolean {
    const index = this.indexOf(value);
    if (index !== -1) {
      this.remove(index);
      return true;
    }
    return false;
  }

  /** 查找元素是否存在 */
  contains(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  /** 查找元素索引，不存在返回 -1 */
  indexOf(value: T): number {
    for (let i = 0; i < this._size; i++) {
      if (this.data[i] === value) return i;
    }
    return -1;
  }

  /** 交换两个位置的元素 */
  swap(i: number, j: number): void {
    this.checkIndex(i);
    this.checkIndex(j);
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
  }

  /** 转为普通数组 */
  toArray(): T[] {
    return this.data.slice(0, this._size) as T[];
  }

  private resize(newCapacity: number): void {
    const newData = new Array(newCapacity);
    for (let i = 0; i < this._size; i++) {
      newData[i] = this.data[i];
    }
    this.data = newData;
  }

  private checkIndex(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new Error(`Index ${index} out of bounds for size ${this._size}`);
    }
  }

  toString(): string {
    return `[${this.toArray().join(', ')}] size=${this._size}, capacity=${this.capacity}`;
  }
}
