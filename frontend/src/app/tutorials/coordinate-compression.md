# 离散化与坐标压缩

离散化（Coordinate Compression）将大范围的值域映射到连续的小范围整数，使得原本无法开数组的数据可以用线段树、树状数组等结构处理。

## 一、为什么需要离散化？

```mermaid
graph LR
  A[大值域坐标] --> B[排序去重]
  B --> C[映射到 1..n]
  C --> D[线段树/BIT 可用]
```

- 值域很大（如坐标 10⁹），但实际出现的值只有 n 个
- 线段树/BIT 需要连续下标
- 只关心相对大小关系，不关心绝对值

## 二、基本方法

### 排序 + 二分

```java tab
// 离散化：将 arr 中的值映射到 [0, m-1]
int[] compress(int[] arr) {
    int n = arr.length;
    int[] sorted = arr.clone();
    Arrays.sort(sorted);
    // 去重
    int m = 0;
    for (int i = 0; i < n; i++) {
        if (i == 0 || sorted[i] != sorted[i-1]) {
            sorted[m++] = sorted[i];
        }
    }
    // 映射
    int[] result = new int[n];
    for (int i = 0; i < n; i++) {
        result[i] = lowerBound(sorted, m, arr[i]);
    }
    return result; // 值域 [0, m-1]
}

int lowerBound(int[] arr, int n, int target) {
    int lo = 0, hi = n;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
```

```typescript tab
// 离散化：将 arr 中的值映射到 [0, m-1]
function compress(arr: number[]): number[] {
    const n = arr.length;
    const sorted = [...new Set([...arr])].sort((a, b) => a - b);
    const m = sorted.length;
    // 映射
    const result = new Array(n);
    for (let i = 0; i < n; i++) {
        result[i] = lowerBound(sorted, m, arr[i]);
    }
    return result; // 值域 [0, m-1]
}

function lowerBound(arr: number[], n: number, target: number): number {
    let lo = 0, hi = n;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
```

```python tab
# 离散化：将 arr 中的值映射到 [0, m-1]
def compress(arr: list) -> list:
    n = len(arr)
    sorted_vals = sorted(set(arr))
    m = len(sorted_vals)
    # 映射
    result = [lower_bound(sorted_vals, m, x) for x in arr]
    return result  # 值域 [0, m-1]

def lower_bound(arr: list, n: int, target: int) -> int:
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo
```

### Java 简洁写法

```java tab
// 利用 TreeSet 去重 + HashMap 映射
TreeSet<Integer> set = new TreeSet<>(Arrays.stream(arr).boxed().collect(Collectors.toList()));
Map<Integer, Integer> rankMap = new HashMap<>();
int rank = 0;
for (int val : set) rankMap.put(val, rank++);
// arr[i] → rankMap.get(arr[i])
```

```typescript tab
// 利用 Set 去重 + Map 映射
const set = new Set(arr);
const sorted = [...set].sort((a, b) => a - b);
const rankMap = new Map<number, number>();
let rank = 0;
for (const val of sorted) rankMap.set(val, rank++);
// arr[i] → rankMap.get(arr[i])
```

```python tab
# 利用 set 去重 + dict 映射
rank_map = {}
for rank, val in enumerate(sorted(set(arr))):
    rank_map[val] = rank
# arr[i] → rank_map[arr[i]]
```

## 三、经典应用

### 1. 树状数组求逆序对

```java tab
// 值域太大 → 离散化后用 BIT
int countInversions(int[] arr) {
    int[] compressed = compress(arr); // [0, m-1]
    int m = max(compressed) + 1;
    BIT bit = new BIT(m);
    int inversions = 0;
    for (int i = arr.length - 1; i >= 0; i--) {
        inversions += bit.query(compressed[i]); // 比它小的已插入个数
        bit.add(compressed[i] + 1, 1);
    }
    return inversions;
}
```

```typescript tab
// 值域太大 → 离散化后用 BIT
function countInversions(arr: number[]): number {
    const compressed = compress(arr); // [0, m-1]
    const m = Math.max(...compressed) + 1;
    const bit = new BIT(m);
    let inversions = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
        inversions += bit.query(compressed[i]); // 比它小的已插入个数
        bit.add(compressed[i] + 1, 1);
    }
    return inversions;
}
```

```python tab
# 值域太大 → 离散化后用 BIT
def count_inversions(arr: list) -> int:
    compressed = compress(arr)  # [0, m-1]
    m = max(compressed) + 1
    bit = BIT(m)
    inversions = 0
    for i in range(len(arr) - 1, -1, -1):
        inversions += bit.query(compressed[i])  # 比它小的已插入个数
        bit.add(compressed[i] + 1, 1)
    return inversions
```

### 2. 区间覆盖（坐标离散化）

当区间端点很大但区间数少时：

```java tab
// 收集所有端点 → 排序去重 → 映射
// 原区间 [1, 10^9] → 离散后 [0, m-1]
```

```typescript tab
// 收集所有端点 → 排序去重 → 映射
// 原区间 [1, 10^9] → 离散后 [0, m-1]
```

```python tab
# 收集所有端点 → 排序去重 → 映射
# 原区间 [1, 10^9] → 离散后 [0, m-1]
```

### 3. 主席树（区间第 k 小）

离散化后建权值线段树。

### 4. 扫描线（矩形面积并）

x 坐标离散化 → 线段树维护 y 方向覆盖长度。

## 四、注意事项

| 问题 | 解决 |
|------|------|
| 需要保留"间隙"信息 | 在相邻值之间插入虚拟点 |
| 区间 [l, r] 离散化 | 端点都要加入离散化集合 |
| 在线查询（值未知） | 不能离散化，用动态开点线段树 |
| 多次查询复用 | 一次离散化，全局使用 |

### 区间离散化的陷阱

```
原坐标: [1, 100], [200, 300]
如果只离散端点: 1→0, 100→1, 200→2, 300→3
则 [1,100] 和 [200,300] 看起来"相邻"了！

解决：端点之间插入中间值
1, 100, 101, 200, 300 → 0, 1, 2, 3, 4
```

## 五、复杂度

| 操作 | 时间 |
|------|------|
| 排序 | O(n log n) |
| 二分映射（每个元素） | O(log n) |
| 总计 | O(n log n) |

## 六、面试要点

1. **本质**：保序映射到大值域 → 小值域
2. **排序+去重+二分**：三步走
3. **区间离散化**：注意间隙问题
4. **配合 BIT/线段树**：离散化是前置步骤
5. **LeetCode**：315（计算右侧小于当前元素的个数）、493（翻转对）、218（天际线问题）

## 七、离散化过程模拟

以数组 `[1000000, 5, 999999, 5, 100]` 为例，演示三步走：

```
原数组:     [1000000, 5, 999999, 5, 100]

① 排序:     [5, 5, 100, 999999, 1000000]
② 去重:     [5, 100, 999999, 1000000]   ← 值域从 10⁶ 压缩到 4
③ 二分查排名:
   1000000 → 4
   5       → 1
   999999  → 3
   5       → 1
   100     → 2

离散化后:   [4, 1, 3, 1, 2]

性质：相对大小完全保留
  1000000 > 999999 > 100 > 5  →  4 > 3 > 2 > 1 ✓
  现在可以用这个排名作为 BIT/线段树的下标（只需 4 个位置）
```

**为什么需要它**：BIT/线段树的下标必须是连续小整数。当值域高达 10⁹ 但只有 n 个不同值时，离散化把空间从 O(值域) 降为 O(n)。

## 八、区间离散化的间隙陷阱

对“区间”离散化（如天际线问题）时，相邻坐标之间可能有间隙：

```
区间 [1,3] 和 [5,7]，离散化点 {1,3,5,7}
若直接映射为 [1,2] 和 [3,4]，会丢失 "3 和 5 之间不连续" 的信息

解决：在相邻且不相等的离散点之间插入一个“间隙代表点”
  {1,3,5,7} → {1,2(=3),3(间隙),4(=5),5,6(间隙),7(=7)}
或者：将区间拆为事件点，用扫描线而非连续下标处理
```

## 九、思考题

1. 离散化为什么必须“先去重再二分”？如果不去重，排名会出现什么问题？（提示：相同值应映射到同一下标）
2. LC 315 中值域可能包含负数，离散化是如何自然处理负数的？（提示：排名与具体值无关）
3. 如果题目要求“动态插入新值”（离线不可行），离散化还适用吗？应该改用什么结构？（提示：动态开点线段树或平衡树）

> 练习推荐：在练习题模块完成 [计算右侧小于当前元素的个数](/problems/reverse-pairs) 巩固“离散化+BIT”组合。
