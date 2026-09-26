# 链表 Linked List




## 一、什么是链表？

**链表（Linked List）** 是一种线性数据结构，由若干节点组成，每个节点包含**数据**和**指向下一个节点的指针**。

```mermaid
graph LR
  N1([1 | ·]) -- next --> N2([2 | ·])
  N2 -- next --> N3([3 | ·])
  N3 -- next --> N4([4 | ·])
  N4 -.-> NULL((null))
```

特点：
- **不连续存储**——节点可散落在内存各处。
- **动态大小**——无需预先分配容量。
- **插入删除 O(1)**——只需修改指针（已知位置时）。

## 二、链表 vs 数组

| 操作 | 数组 | 链表 |
|------|------|------|
| 随机访问 | **O(1)** | O(n) |
| 头部插入 | O(n) | **O(1)** |
| 尾部插入 | O(1) 均摊 | O(n) / O(1)（带尾指针）|
| 中间插入 | O(n) | O(n)（需先遍历）|
| 内存连续 | ✅ | ❌ |
| 缓存友好 | ✅ | ❌ |
| 额外空间 | 无 | 每节点额外指针 |

> **选择**：随机访问多 → 数组；插入删除多 → 链表。

## 三、链表分类

### 3.1 单链表

```text
head → A → B → C → D → null
```

只能**从头到尾**遍历，每个节点含一个 next 指针。

### 3.2 双链表

```text
null ← A ⇄ B ⇄ C ⇄ D → null
```

每个节点含 prev 和 next 两个指针，可**双向遍历**。Java 的 `LinkedList` 就是双链表。

### 3.3 循环链表

尾节点的 next 指向 head，构成环。

**用途**：约瑟夫问题、循环调度。

## 四、单链表实现（Java）

### 4.1 节点定义

```java tab
class ListNode {
    int val;
    ListNode next;
    ListNode(int v) { val = v; }
}
```
```typescript tab
class ListNode {
    val: number;
    next: ListNode | null;
    constructor(v: number) { this.val = v; this.next = null; }
}
```
```python tab
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

### 4.2 虚拟头结点（dummy head）

> 简化边界处理，统一所有位置的插入/删除逻辑。

```java tab
public class LinkedListR<E> {
    private Node<E> dummyHead;
    private int size;

    public LinkedListR() {
        dummyHead = new Node<>(null);
        size = 0;
    }

    public int getSize() { return size; }
    public boolean isEmpty() { return size == 0; }

    public void add(int index, E e) {
        if (index < 0 || index > size) throw new IllegalArgumentException();
        Node<E> prev = dummyHead;
        for (int i = 0; i < index; i++) prev = prev.next;
        prev.next = new Node<>(e, prev.next);
        size++;
    }

    public void addFirst(E e) { add(0, e); }
    public void addLast(E e) { add(size, e); }

    public E get(int index) {
        if (index < 0 || index >= size) throw new IllegalArgumentException();
        Node<E> cur = dummyHead.next;
        for (int i = 0; i < index; i++) cur = cur.next;
        return cur.val;
    }

    public E remove(int index) {
        if (index < 0 || index >= size) throw new IllegalArgumentException();
        Node<E> prev = dummyHead;
        for (int i = 0; i < index; i++) prev = prev.next;
        Node<E> ret = prev.next;
        prev.next = ret.next;
        ret.next = null;
        size--;
        return ret.val;
    }
}
```
```typescript tab
class LinkedListR<T> {
    private dummyHead: { val: T | null; next: any };
    private size = 0;

    constructor() { this.dummyHead = { val: null, next: null }; }

    getSize(): number { return this.size; }
    isEmpty(): boolean { return this.size === 0; }

    add(index: number, e: T): void {
        if (index < 0 || index > this.size) throw new RangeError();
        let prev = this.dummyHead;
        for (let i = 0; i < index; i++) prev = prev.next;
        prev.next = { val: e, next: prev.next };
        this.size++;
    }

    addFirst(e: T): void { this.add(0, e); }
    addLast(e: T): void { this.add(this.size, e); }

    get(index: number): T {
        if (index < 0 || index >= this.size) throw new RangeError();
        let cur = this.dummyHead.next;
        for (let i = 0; i < index; i++) cur = cur.next;
        return cur.val;
    }

    remove(index: number): T {
        if (index < 0 || index >= this.size) throw new RangeError();
        let prev = this.dummyHead;
        for (let i = 0; i < index; i++) prev = prev.next;
        const ret = prev.next;
        prev.next = ret.next;
        this.size--;
        return ret.val;
    }
}
```
```python tab
class LinkedListR:
    def __init__(self):
        self._dummy = {'val': None, 'next': None}
        self._size = 0

    def get_size(self): return self._size
    def is_empty(self): return self._size == 0

    def add(self, index: int, e):
        if index < 0 or index > self._size:
            raise IndexError()
        prev = self._dummy
        for _ in range(index):
            prev = prev['next']
        prev['next'] = {'val': e, 'next': prev['next']}
        self._size += 1

    def add_first(self, e): self.add(0, e)
    def add_last(self, e): self.add(self._size, e)

    def get(self, index: int):
        if index < 0 or index >= self._size:
            raise IndexError()
        cur = self._dummy['next']
        for _ in range(index):
            cur = cur['next']
        return cur['val']

    def remove(self, index: int):
        if index < 0 or index >= self._size:
            raise IndexError()
        prev = self._dummy
        for _ in range(index):
            prev = prev['next']
        ret = prev['next']
        prev['next'] = ret['next']
        self._size -= 1
        return ret['val']
```

### 4.3 链表的递归实现

```java tab
private Node<E> add(Node<E> node, int index, E e) {
    if (index == 0) return new Node<>(e, node);
    node.next = add(node.next, index - 1, e);
    return node;
}
```
```typescript tab
private add(node: any, index: number, e: T): any {
    if (index === 0) return { val: e, next: node };
    node.next = this.add(node.next, index - 1, e);
    return node;
}
```
```python tab
def _add(self, node, index, e):
    if index == 0:
        return {'val': e, 'next': node}
    node['next'] = self._add(node['next'], index - 1, e)
    return node
```

特点：
- **不需要虚拟头结点**——递归自然处理位置 0。
- **代码简洁**。
- **注意栈溢出**——长链表（> 1e4）改迭代。

## 五、核心技巧

### 5.1 双指针 / 快慢指针

**判环**：

```java tab
boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}
```
```typescript tab
function hasCycle(head: ListNode | null): boolean {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow!.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
}
```
```python tab
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
```

**找环入口**：快慢指针相遇后，一个回 head，一个从相遇点同步走，再次相遇即环入口。

**找链表中点**：

```java tab
ListNode middle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}
```
```typescript tab
function middle(head: ListNode | null): ListNode | null {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow!.next;
        fast = fast.next.next;
    }
    return slow;
}
```
```python tab
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```

### 5.2 哨兵节点（dummy）

> 让"头部插入/删除"和"中间插入/删除"逻辑统一。

```java tab
ListNode removeElements(ListNode head, int val) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode cur = dummy;
    while (cur.next != null) {
        if (cur.next.val == val) cur.next = cur.next.next;
        else cur = cur.next;
    }
    return dummy.next;
}
```
```typescript tab
function removeElements(head: ListNode | null, val: number): ListNode | null {
    const dummy = new ListNode(0);
    dummy.next = head;
    let cur = dummy;
    while (cur.next) {
        if (cur.next.val === val) cur.next = cur.next.next;
        else cur = cur.next;
    }
    return dummy.next;
}
```
```python tab
def remove_elements(head, val):
    dummy = ListNode(0)
    dummy.next = head
    cur = dummy
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return dummy.next
```

### 5.3 反转链表

迭代版：

```java tab
ListNode reverse(ListNode head) {
    ListNode prev = null, cur = head;
    while (cur != null) {
        ListNode next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}
```
```typescript tab
function reverse(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null, cur = head;
    while (cur) {
        const next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}
```
```python tab
def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev
```

递归版：

```java tab
ListNode reverse(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode newHead = reverse(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}
```
```typescript tab
function reverse(head: ListNode | null): ListNode | null {
    if (!head || !head.next) return head;
    const newHead = reverse(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}
```
```python tab
def reverse(head):
    if not head or not head.next:
        return head
    new_head = reverse(head.next)
    head.next.next = head
    head.next = None
    return new_head
```

### 5.4 合并两个有序链表

```java tab
ListNode mergeTwoLists(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else                { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = a != null ? a : b;
    return dummy.next;
}
```
```typescript tab
function mergeTwoLists(a: ListNode | null, b: ListNode | null): ListNode | null {
    const dummy = new ListNode(0);
    let tail = dummy;
    while (a && b) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else                { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = a ?? b;
    return dummy.next;
}
```
```python tab
def merge_two_lists(a, b):
    dummy = ListNode(0)
    tail = dummy
    while a and b:
        if a.val <= b.val:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a if a else b
    return dummy.next
```

## 六、性能分析（深度）

虽然表面上链表头部插入是 O(1)，但**实际常数很大**：

- 每插入一个节点都要 `new Node()`，触发一次堆分配。
- 堆分配涉及系统调用 / GC，比栈 / 数组慢得多。
- **缓存不友好**——每次 `next` 可能跳到任意内存地址，CPU cache 失效。

> **经验**：数据量大时（> 1e5），**动态数组**反而比链表更快，因为 cache locality 优势压过 O(n) 的劣势。

## 七、链表的工程应用

| 场景 | 使用 |
|------|------|
| LRU 缓存 | 双向链表 + 哈希表 |
| Linux 内核任务队列 | 双向链表 |
| 操作系统进程调度 | 双向链表 |
| 数据库事务 undo log | 双向链表 |
| Git 提交历史 | 链表 |
| 编辑器撤销栈 | 链表 |

## 八、易错点（面试高频）

1. **空指针**：`head == null` 或 `head.next == null` 要单独处理。
2. **丢链**：反转链表时，必须先存 `next` 再改指针。
3. **死循环**：环检测没判断 `fast.next == null` 会越界。
4. **找不到前驱**：删除节点需要 prev，没 dummy 时要单独处理头节点。
5. **栈溢出**：递归深度 = 链表长度，长链表改迭代。
6. **值比较**：Java 中链表节点用 `equals` 比较，不要用 `==`（除非 int）。

## 九、链表 vs 其他数据结构

| 场景 | 推荐 |
|------|------|
| 大量随机访问 | 数组 |
| 大量插入删除 | 链表 |
| 既要搜索又要插入 | 跳表 / BST |
| 频繁查最值 | 堆 |
| 范围查询 | 跳表 / B 树 |

## 十、复杂度汇总

| 操作 | 时间（已知位置）| 时间（未知位置）|
|------|----------------|----------------|
| 头部插入 | O(1) | O(1) |
| 尾部插入 | O(1)（带 tail）| O(n) |
| 中间插入 | O(1) | O(n) |
| 头部删除 | O(1) | O(1) |
| 中间删除 | O(1) | O(n) |
| 查找 | O(n) | O(n) |

## 十一、刷题清单

| 难度 | 题目 | 关键 |
|------|------|------|
| 🟢 | 反转链表 | 双指针 |
| 🟢 | 合并两个有序链表 | dummy + 双指针 |
| 🟢 | 删除链表的节点 | dummy |
| 🟡 | 反转链表 II | dummy + 区段反转 |
| 🟡 | 环形链表 II | 快慢指针 |
| 🟡 | 相交链表 | 双指针追及 |
| 🟡 | 删除链表的倒数第 N 个节点 | 快慢指针 |
| 🟡 | 奇偶链表 | 双指针重组 |
| 🟠 | K 个一组翻转链表 | 模拟 |
| 🟠 | 排序链表 | 归并 / 快慢 |
| 🔴 | LRU 缓存 | 哈希 + 双链表 |
| 🔴 | 二叉树展开为链表 | 链表拼接 |

## 十二、心法

> **链表 = 指针的艺术**。  
> 面试链表题，**dummy 节点 + 双指针**能解决 80% 的问题。  
> 写完先**画图**，再**小数据跑通**（n=1, 2, 3），最后**扩规模**。

## 十三、多语言对照：反转链表

```java tab
ListNode reverse(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}
```
```typescript tab
class ListNode { constructor(public val: number, public next: ListNode | null = null) {} }

function reverse(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null;
    let curr = head;
    while (curr) {
        const nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}
```
```python tab
def reverse(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev, curr = curr, nxt
    return prev
```
