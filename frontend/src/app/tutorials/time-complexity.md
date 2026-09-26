# 时间复杂度与空间复杂度：算法分析的基石




## 一、什么是复杂度分析？

复杂度分析是对算法**资源消耗**的数学度量。  
- **时间复杂度**：执行基本操作的次数随输入规模增长的量级。  
- **空间复杂度**：算法额外占用内存随输入规模增长的量级。

为什么重要？
1. **预测性能**：代码还没跑，先知道它会"卡"在哪里。
2. **指导优化**：找到瓶颈，针对性改进。
3. **面试必考**：大厂面试 95% 必问复杂度。

## 二、大 O 表示法

**定义**：若存在正常数 `c` 和 `n₀`，使当 `n ≥ n₀` 时 `f(n) ≤ c·g(n)`，则 `f(n) = O(g(n))`。

通俗地讲：**O 表示上界**，刻画的是**最坏情况**下的渐进增长率。

### 2.1 常见复杂度量级（从快到慢）

| 复杂度 | 名称 | 举例 |
|--------|------|------|
| O(1) | 常数 | 哈希表查找 |
| O(log n) | 对数 | 二分查找 |
| O(n) | 线性 | 数组遍历 |
| O(n log n) | 线性对数 | 归并排序 |
| O(n²) | 平方 | 冒泡排序、暴力枚举 |
| O(n³) | 立方 | Floyd-Warshall |
| O(2ⁿ) | 指数 | 斐波那契递归 |
| O(n!) | 阶乘 | 全排列 |

### 2.2 图示

| n | O(1) | O(log n) | O(n) | O(n log n) | O(n²) | O(2ⁿ) |
|---|------|---------|------|-----------|-------|-------|
| 10 | 1 | 3 | 10 | 33 | 100 | 1024 |
| 100 | 1 | 7 | 100 | 664 | 10000 | 1.27e30 |
| 1000 | 1 | 10 | 1000 | 9966 | 1e6 | ∞ |

> **1s 时间能处理的数据规模粗略估计**：
> - O(n) → 1e7 ~ 1e8
> - O(n log n) → 1e6 ~ 1e7
> - O(n²) → 1e3 ~ 1e4
> - O(2ⁿ) → 20 ~ 25

## 三、时间复杂度分析

### 3.1 几条规则

1. **顺序执行**：复杂度相加，取最大。`O(f) + O(g) = O(max(f, g))`
2. **循环**：循环体内复杂度 × 循环次数。
3. **分支**：取最大分支。
4. **递归**：主定理（Master Theorem）。

### 3.2 例：常见代码片段

```java tab
// O(1) — 常数
int x = arr[0] + arr[1];

// O(log n) — 每次规模减半
while (n > 1) n /= 2;

// O(n) — 单层循环
for (int i = 0; i < n; i++) sum += arr[i];

// O(n log n) — 二分循环 / 排序
for (int i = 0; i < n; i++) binarySearch(arr, target);

// O(n²) — 双层循环
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        sum += arr[i][j];

// O(log² n) — 二分套二分
while (lo < hi) {
    int mid = (lo + hi) / 2;
    binarySearch(arr, mid);
}
```

```typescript tab
// O(1) — 常数
const x = arr[0] + arr[1];

// O(log n) — 每次规模减半
while (n > 1) n = Math.floor(n / 2);

// O(n) — 单层循环
for (let i = 0; i < n; i++) sum += arr[i];

// O(n log n) — 二分循环 / 排序
for (let i = 0; i < n; i++) binarySearch(arr, target);

// O(n²) — 双层循环
for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
        sum += arr[i][j];

// O(log² n) — 二分套二分
while (lo < hi) {
    const mid = (lo + hi) >> 1;
    binarySearch(arr, mid);
}
```

```python tab
# O(1) — 常数
x = arr[0] + arr[1]

# O(log n) — 每次规模减半
while n > 1:
    n //= 2

# O(n) — 单层循环
for i in range(n):
    total += arr[i]

# O(n log n) — 二分循环 / 排序
for i in range(n):
    binary_search(arr, target)

# O(n²) — 双层循环
for i in range(n):
    for j in range(n):
        total += arr[i][j]

# O(log² n) — 二分套二分
while lo < hi:
    mid = (lo + hi) // 2
    binary_search(arr, mid)
```

### 3.3 主定理（Master Theorem）

对于 `T(n) = a·T(n/b) + O(nᵈ)`：

| 关系 | 复杂度 |
|------|--------|
| `d > log_b(a)` | O(nᵈ) |
| `d = log_b(a)` | O(nᵈ log n) |
| `d < log_b(a)` | O(n^(log_b a)) |

**举例**：
- 归并排序：`T(n) = 2T(n/2) + O(n)` → O(n log n)
- 二分查找：`T(n) = T(n/2) + O(1)` → O(log n)

## 四、空间复杂度

### 4.1 组成部分

- **输入占用**：通常不计入复杂度（除非题目特殊说明）。
- **辅助空间**：算法使用的额外内存。
- **栈空间**：递归调用产生的栈。

### 4.2 常见量级

| 复杂度 | 例子 |
|--------|------|
| O(1) | 原地交换、双指针 |
| O(log n) | 递归深度为 log n（二分） |
| O(n) | 哈希表、数组、单调栈 |
| O(n²) | 二维 dp、邻接矩阵 |

### 4.3 递归栈的隐藏代价

```java tab
// 时间 O(2ⁿ)，空间 O(n) — 看起来只是常数
int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}
```

```typescript tab
// 时间 O(2ⁿ)，空间 O(n) — 看起来只是常数
function fib(n: number): number {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}
```

```python tab
# 时间 O(2ⁿ)，空间 O(n) — 看起来只是常数
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

空间是 **O(n)**（递归栈深度），不是 O(1)。很多新手栽在这里。

## 五、最好 / 最坏 / 平均

| 名称 | 含义 |
|------|------|
| 最好情况 | 输入最有利时的复杂度 |
| 最坏情况 | 输入最不利时的复杂度（最常用） |
| 平均情况 | 期望复杂度（需要概率分布） |

**例：快速排序**
- 最坏：O(n²)（每次选到最大/最小）
- 平均：O(n log n)
- 最好：O(n log n)

## 六、均摊分析（Amortized）

均摊复杂度把"偶尔的高代价操作"分摊到"持续的多次调用"上。

### 6.1 经典例：动态数组 push_back

```java tab
// ArrayList 简化版：容量满时扩容 2 倍
public void pushBack(int x) {
    if (size == capacity) resize(capacity * 2);   // O(n)
    arr[size++] = x;                              // O(1)
}
```

```typescript tab
// 动态数组简化版：容量满时扩容 2 倍
function pushBack(x: number): void {
    if (size === capacity) resize(capacity * 2);   // O(n)
    arr[size++] = x;                              // O(1)
}
```

```python tab
# 动态数组简化版：容量满时扩容 2 倍
def push_back(x: int) -> None:
    global size, capacity
    if size == capacity:
        resize(capacity * 2)  # O(n)
    arr[size] = x
    size += 1                 # O(1)
```

```text
n 次 push：总时间 O(n)，每次均摊 O(1)。
最坏一次扩容 O(n)，倍增扩容约发生 O(log n) 次。
```

**直觉**：扩容是"阶段性"成本，分摊到每次 push 上就是 O(1)。

### 6.2 三种证明方法

| 方法 | 思路 | 适用 |
|------|------|------|
| **聚合分析** | 总成本 ÷ 调用次数 | 简单均摊 |
| **记账法** | 给每次操作"存钱"，贵操作"取钱" | 操作代价不同 |
| **势能法** | 定义势能函数 Φ，证明总代价 + Φ 增量有界 | 操作代价同 |

### 6.3 例：单链表的 push_front（不需要扩容）

```java tab
public void pushFront(Node x) {
    x.next = head;
    head = x;                    // O(1)
}
```

```typescript tab
function pushFront(x: Node): void {
    x.next = head;
    head = x;                    // O(1)
}
```

```python tab
def push_front(x: Node) -> None:
    x.next = head
    head = x                     # O(1)
```

每次都是 O(1)，无均摊问题——但**和动态数组的 push_back 不同**：链表的 O(1) 没有 cache 友好性。

### 6.4 例：单调栈 / 单调队列（重要！）

每个元素最多入栈 / 出栈一次，n 个元素的总体操作 ≤ 2n 次。  
**均摊 O(1) / 操作**，但**单次操作最坏 O(n)**（例如一次弹掉所有元素）。

> 这就是为什么"滑动窗口最大值"是 O(n) 而不是 O(n²)。

### 6.5 例：并查集

```java tab
union(x, y)    // O(α(n)) 路径压缩后
find(x)        // O(α(n))
```

```typescript tab
union(x, y)    // O(α(n)) 路径压缩后
find(x)        // O(α(n))
```

```python tab
union(x, y)    # O(α(n)) 路径压缩后
find(x)        # O(α(n))
```

α 是反 Ackermann 函数，工程上视为**常数 ≤ 5**。  
**没有均摊分析**就无法解释为什么"看起来递归"的 find 是 O(α)。

## 七、常见复杂度速记

| 数据结构 | 查找 | 插入 | 删除 |
|----------|------|------|------|
| 数组 | O(n) | O(n) | O(n) |
| 链表 | O(n) | O(1) | O(1) |
| 哈希表 | O(1) | O(1) | O(1) |
| 二分搜索树（平衡）| O(log n) | O(log n) | O(log n) |
| 跳表 | O(log n) | O(log n) | O(log n) |
| B 树 | O(log n) | O(log n) | O(log n) |

| 算法 | 时间 | 空间 |
|------|------|------|
| 二分查找 | O(log n) | O(1) |
| 归并排序 | O(n log n) | O(n) |
| 快速排序 | O(n log n) | O(log n) |
| 堆排序 | O(n log n) | O(1) |
| Dijkstra | O((V+E) log V) | O(V) |
| Floyd | O(V³) | O(V²) |

## 八、面试实战

### 8.1 必问套路

> "你这个算法的复杂度是多少？能优化到多少？"

**回答模板**：
1. 先说**最坏复杂度**。
2. 说**平均复杂度**（如果好于最坏）。
3. 说**空间复杂度**（包括栈）。
4. 如果不满足，提出**优化方向**。

### 8.2 优化方向

| 现象 | 优化 |
|------|------|
| O(n²) 暴力 | 用哈希表降到 O(n) |
| O(n) 重复扫描 | 用前缀和 / 双指针 |
| O(n log n) 排序 | 计数排序、基数排序 |
| O(n) 空间 | 滚动数组 / 原地 |
| O(2ⁿ) 暴力 | 记忆化 / DP |

## 九、一句话总结

> **时间换空间，空间换时间。**  
> **没有最优的算法，只有最合适的算法。**
