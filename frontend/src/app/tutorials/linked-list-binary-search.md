# 链表二分：中点定位与链表上的分治

## 一、为什么链表需要"二分"

```mermaid
graph LR
  A[链表] --> B[快慢指针]
  B --> C[定位中点]
  C --> D[链表分治/归并]
```

数组可以 O(1) 随机访问，直接 `mid = (lo + hi) / 2`。链表不行——但**快慢指针**提供了链表的"二分定位"能力：

| 数组二分 | 链表等价 |
|----------|----------|
| `mid = (lo+hi)/2` | 快慢指针找中点 |
| 分治递归 | 中点断开 → 递归两半 |
| O(log n) 定位 | O(n) 定位（但总复杂度不变） |

**核心模式**：找中点 → 断开 → 递归处理两半 → 合并。这是链表上所有分治算法的骨架。

## 二、基础：找中点并断开

```typescript tab
function splitInHalf(head: ListNode): [ListNode, ListNode] {
    let slow = head, fast = head.next;  // fast 从 head.next 出发
    while (fast && fast.next) {
        slow = slow!.next;
        fast = fast.next.next;
    }
    const second = slow!.next;
    slow!.next = null;  // 断开
    return [head, second!];
}
```

```java tab
ListNode[] splitInHalf(ListNode head) {
    ListNode slow = head, fast = head.next;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    ListNode second = slow.next;
    slow.next = null;
    return new ListNode[]{head, second};
}
```

**fast 从 head.next 出发的原因**：偶数个节点时，slow 停在**前半段末尾**（保证前半段 ≥ 后半段），避免无限递归。

## 三、LC 148：排序链表（链表归并排序）

### 3.1 思路

对链表做归并排序：找中点断开 → 递归排序两半 → 合并两个有序链表。

### 3.2 完整实现

```java tab
public ListNode sortList(ListNode head) {
    if (head == null || head.next == null) return head;

    // 找中点断开
    ListNode slow = head, fast = head.next;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    ListNode second = slow.next;
    slow.next = null;

    // 递归排序 + 合并
    ListNode left = sortList(head);
    ListNode right = sortList(second);
    return merge(left, right);
}

private ListNode merge(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode cur = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }
        else { cur.next = l2; l2 = l2.next; }
        cur = cur.next;
    }
    cur.next = l1 != null ? l1 : l2;
    return dummy.next;
}
```

```typescript tab
function sortList(head: ListNode | null): ListNode | null {
    if (!head || !head.next) return head;

    let slow = head, fast: ListNode | null = head.next;
    while (fast && fast.next) {
        slow = slow!.next;
        fast = fast.next.next;
    }
    const second = slow!.next;
    slow!.next = null;

    const left = sortList(head);
    const right = sortList(second);
    return merge(left, right);
}

function merge(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const dummy = new ListNode(0);
    let cur = dummy;
    while (l1 && l2) {
        if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }
        else { cur.next = l2; l2 = l2.next; }
        cur = cur.next;
    }
    cur.next = l1 ?? l2;
    return dummy.next;
}
```

```python tab
def sortList(head: ListNode) -> ListNode:
    if not head or not head.next:
        return head

    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None

    left = sortList(head)
    right = sortList(second)
    return merge(left, right)

def merge(l1: ListNode, l2: ListNode) -> ListNode:
    dummy = cur = ListNode(0)
    while l1 and l2:
        if l1.val <= l2.val:
            cur.next, l1 = l1, l1.next
        else:
            cur.next, l2 = l2, l2.next
        cur = cur.next
    cur.next = l1 or l2
    return dummy.next
```

**复杂度**：时间 O(n log n)，空间 O(log n) 递归栈。

**进阶**：O(1) 空间的自底向上归并（按长度 1, 2, 4, ... 逐轮合并），面试中递归版足够。

## 四、LC 109：有序链表转换二叉搜索树

### 4.1 思路

BST 的中序遍历是有序序列。反过来：有序链表的**中点**就是 BST 的根，左半段建左子树，右半段建右子树。

### 4.2 完整实现

```java tab
public TreeNode sortedListToBST(ListNode head) {
    if (head == null) return null;
    if (head.next == null) return new TreeNode(head.val);

    // 快慢指针找中点（prev 用于断开）
    ListNode slow = head, fast = head, prev = null;
    while (fast != null && fast.next != null) {
        prev = slow;
        slow = slow.next;
        fast = fast.next.next;
    }
    prev.next = null;  // 断开左半段

    TreeNode root = new TreeNode(slow.val);
    root.left = sortedListToBST(head);
    root.right = sortedListToBST(slow.next);
    return root;
}
```

```typescript tab
function sortedListToBST(head: ListNode | null): TreeNode | null {
    if (!head) return null;
    if (!head.next) return new TreeNode(head.val);

    let slow = head, fast: ListNode | null = head, prev: ListNode | null = null;
    while (fast && fast.next) {
        prev = slow;
        slow = slow!.next;
        fast = fast.next.next;
    }
    prev!.next = null;

    const root = new TreeNode(slow!.val);
    root.left = sortedListToBST(head);
    root.right = sortedListToBST(slow!.next);
    return root;
}
```

```python tab
def sortedListToBST(head: ListNode) -> TreeNode:
    if not head:
        return None
    if not head.next:
        return TreeNode(head.val)

    slow, fast, prev = head, head, None
    while fast and fast.next:
        prev = slow
        slow = slow.next
        fast = fast.next.next
    prev.next = None

    root = TreeNode(slow.val)
    root.left = sortedListToBST(head)
    root.right = sortedListToBST(slow.next)
    return root
```

**复杂度**：时间 O(n log n)（每层 O(n) 找中点，共 log n 层），空间 O(log n)。

**优化**：先转数组再递归建 BST，时间 O(n)，空间 O(n)——空间换时间。

## 五、LC 143：重排链表

`L0→L1→…→Ln-1→Ln` 变为 `L0→Ln→L1→Ln-1→…`

### 5.1 三步法

1. 快慢指针找中点，断开
2. 反转后半段
3. 交替合并两半

```typescript tab
function reorderList(head: ListNode | null): void {
    if (!head || !head.next) return;

    // 1. 找中点
    let slow = head, fast: ListNode | null = head;
    while (fast && fast.next) {
        slow = slow!.next;
        fast = fast.next.next;
    }

    // 2. 反转后半段
    let prev: ListNode | null = null;
    let cur = slow!.next;
    slow!.next = null;
    while (cur) {
        const next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }

    // 3. 交替合并
    let first: ListNode | null = head, second: ListNode | null = prev;
    while (second) {
        const t1 = first!.next, t2 = second.next;
        first!.next = second;
        second.next = t1;
        first = t1;
        second = t2;
    }
}
```

```java tab
public void reorderList(ListNode head) {
    if (head == null || head.next == null) return;

    // 1. 找中点
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }

    // 2. 反转后半段
    ListNode prev = null, cur = slow.next;
    slow.next = null;
    while (cur != null) {
        ListNode next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }

    // 3. 交替合并
    ListNode first = head, second = prev;
    while (second != null) {
        ListNode t1 = first.next, t2 = second.next;
        first.next = second;
        second.next = t1;
        first = t1;
        second = t2;
    }
}
```

## 六、LC 234：回文链表

找中点 → 反转后半段 → 逐一比较：

```typescript tab
function isPalindrome(head: ListNode | null): boolean {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow!.next;
        fast = fast.next.next;
    }

    // 反转后半段
    let prev: ListNode | null = null;
    while (slow) {
        const next = slow.next;
        slow.next = prev;
        prev = slow;
        slow = next;
    }

    // 比较
    let left = head, right = prev;
    while (right) {
        if (left!.val !== right.val) return false;
        left = left!.next;
        right = right.next;
    }
    return true;
}
```

**注意**：此写法会修改原链表。面试中说明可以 O(n) 额外空间恢复，或先问是否允许修改。

## 七、模式总结

| 题目 | 中点用法 | 后续操作 |
|------|----------|----------|
| 排序链表 | 断开两半 | 递归 + 归并 |
| 有序链表→BST | 中点为根 | 递归建左右子树 |
| 重排链表 | 断开两半 | 反转 + 交替合并 |
| 回文链表 | 定位后半段起点 | 反转 + 比较 |

**统一骨架**：

```text
1. slow/fast 找中点
2. 断开（slow.next = null 或 prev.next = null）
3. 对两半分别处理
4. 合并结果
```

## 八、面试常见题

- 🟡 LC 148. 排序链表（高频）
- 🟡 LC 109. 有序链表转换二叉搜索树
- 🟡 LC 143. 重排链表（高频）
- 🟢 LC 234. 回文链表（超高频）
- 🟢 LC 876. 链表的中间结点
- 🟡 LC 25. K 个一组翻转链表（分段处理的推广）

## 九、易错点

1. **fast 起点选择**：`fast = head` vs `fast = head.next` 影响偶数时中点归属，归并排序必须用后者。
2. **断开时机**：忘记 `slow.next = null` 导致无限递归。
3. **单节点/空链表边界**：递归基必须检查 `!head || !head.next`。
4. **反转后丢失引用**：反转前先保存 `slow.next`（后半段头节点）。

## 十、心法口诀

> **链表二分靠快慢，中点断开成两半；**
> **归并建树加重排，反转比较回文判。**
