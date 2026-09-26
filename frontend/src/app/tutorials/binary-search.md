# 二分查找详解




## 一、什么是二分查找？

**二分查找（Binary Search）** 是一种在**有序数组**中查找目标元素的搜索算法。它通过每一步将搜索区间缩小一半，达到 **O(log n)** 的时间复杂度。

它是分治思想最纯粹的体现：**每次排除一半**。

```mermaid
graph TD
  S[候选区间 L..R] --> M[取中点 mid]
  M --> C{arr[mid] ? target}
  C -->|==| F[找到]
  C -->|<|R[收缩左界 L=mid+1]
  C -->|>|L[收缩右界 R=mid-1]
  R --> M
  L --> M
```

## 二、算法思想

假设在有序数组 `arr[0..n-1]` 中查找 `target`：

1. 取区间中点 `mid`。
2. 若 `arr[mid] == target`，查找成功。
3. 若 `arr[mid] < target`，目标在右半边。
4. 若 `arr[mid] > target`，目标在左半边。
5. 区间为空则未找到。

## 三、为什么高效？

| 查找方法 | 时间复杂度 | n=1e6 比较次数 |
|----------|-----------|----------------|
| 线性查找 | O(n) | 1,000,000 |
| **二分查找** | **O(log n)** | **20** |

每比较一次，区间大小减半。**n 次比较**能定位到 2ⁿ 个元素中的任意位置。

## 四、代码实现（基础版）

### 4.1 迭代实现

```java tab
public static int search(int[] arr, int target) {
    int left = 0;
    int right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```
```typescript tab
function search(arr: number[], target: number): number {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```
```python tab
def search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```

### 4.2 递归实现

```java tab
public static int searchRecursive(int[] arr, int target, int left, int right) {
    if (left > right) return -1;
    int mid = left + (right - left) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return searchRecursive(arr, target, mid + 1, right);
    return searchRecursive(arr, target, left, mid - 1);
}
```
```typescript tab
function searchRecursive(arr: number[], target: number, left: number, right: number): number {
    if (left > right) return -1;
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) return searchRecursive(arr, target, mid + 1, right);
    return searchRecursive(arr, target, left, mid - 1);
}
```
```python tab
def search_recursive(arr: list[int], target: int, left: int, right: int) -> int:
    if left > right:
        return -1
    mid = left + (right - left) // 2
    if arr[mid] == target:
        return mid
    if arr[mid] < target:
        return search_recursive(arr, target, mid + 1, right)
    return search_recursive(arr, target, left, mid - 1)
```

## 五、模板与变种（核心）

> **模板化是面试拿分的关键**。以下四个模板覆盖 90% 二分题。

### 5.1 模板 1：标准查找

```java tab
while (left <= right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] == target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
}
return -1;
```
```typescript tab
while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
}
return -1;
```
```python tab
while left <= right:
    mid = left + (right - left) // 2
    if arr[mid] == target: return mid
    elif arr[mid] < target: left = mid + 1
    else: right = mid - 1
return -1
```

### 5.2 模板 2：左边界（第一个 ≥ target）

```java tab
while (left < right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] < target) left = mid + 1;
    else right = mid;
}
return left;  // 第一个 >= target 的位置
```
```typescript tab
while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] < target) left = mid + 1;
    else right = mid;
}
return left;
```
```python tab
while left < right:
    mid = left + (right - left) // 2
    if arr[mid] < target: left = mid + 1
    else: right = mid
return left
```

### 5.3 模板 3：右边界（最后一个 ≤ target）

```java tab
while (left < right) {
    int mid = left + (right - left + 1) / 2;  // 上中点
    if (arr[mid] > target) right = mid - 1;
    else left = mid;
}
return left;
```
```typescript tab
while (left < right) {
    const mid = left + Math.floor((right - left + 1) / 2);
    if (arr[mid] > target) right = mid - 1;
    else left = mid;
}
return left;
```
```python tab
while left < right:
    mid = left + (right - left + 1) // 2
    if arr[mid] > target: right = mid - 1
    else: left = mid
return left
```

### 5.4 模板 4：寻找插入位置

```java tab
while (left < right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] < target) left = mid + 1;
    else right = mid;
}
return left;  // 插入后仍有序
```
```typescript tab
while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] < target) left = mid + 1;
    else right = mid;
}
return left;
```
```python tab
while left < right:
    mid = left + (right - left) // 2
    if arr[mid] < target: left = mid + 1
    else: right = mid
return left
```

## 六、边界条件详解

> **这是面试最常栽的地方**。

### 6.1 循环条件 `left <= right` vs `left < right`

| 条件 | 区间定义 | 退出时 |
|------|---------|--------|
| `left <= right` | 闭区间 [left, right] | left > right，区间为空 |
| `left < right` | 半开区间 [left, right) | left == right，区间还有 1 个 |

### 6.2 中点计算

| 写法 | 行为 |
|------|------|
| `(left + right) / 2` | 整数可能溢出 |
| `left + (right - left) / 2` | ✅ 推荐，下中点 |
| `left + (right - left + 1) / 2` | 上中点（用于模板 3）|

### 6.3 `mid` 偏向对结果的影响

- **下中点**：left 变大时，区间减半无问题；right 缩小时区间可能"卡住"（不收敛）。
- **上中点**：right 缩小时无问题；left 增大时可能"卡住"。

> **心法**：`right = mid` 时用下中点；`left = mid` 时用上中点。

## 七、二分答案（最难的题型）

把"求最优解"转化为"判断某值是否可行"，再用二分搜索可行解。

**经典例**：分割数组的最大值（LeetCode 410）。

```java tab
public int splitArray(int[] nums, int m) {
    int lo = Arrays.stream(nums).max().getAsInt();
    int hi = Arrays.stream(nums).sum();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (canSplit(nums, m, mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

private boolean canSplit(int[] nums, int m, int max) {
    int sum = 0, count = 1;
    for (int x : nums) {
        if (sum + x > max) { sum = x; count++; }
        else sum += x;
    }
    return count <= m;
}
```
```typescript tab
function splitArray(nums: number[], m: number): number {
    let lo = Math.max(...nums);
    let hi = nums.reduce((a, b) => a + b, 0);
    while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        if (canSplit(nums, m, mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

function canSplit(nums: number[], m: number, max: number): boolean {
    let sum = 0, count = 1;
    for (const x of nums) {
        if (sum + x > max) { sum = x; count++; }
        else sum += x;
    }
    return count <= m;
}
```
```python tab
def split_array(nums: list[int], m: int) -> int:
    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if can_split(nums, m, mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

def can_split(nums: list[int], m: int, max_val: int) -> bool:
    total, count = 0, 1
    for x in nums:
        if total + x > max_val:
            total = x
            count += 1
        else:
            total += x
    return count <= m
```

**识别特征**：
- 求"最大值最小"或"最小值最大"。
- 答案范围明确（`[lo, hi]`）。
- 单调性：阈值越大越容易达成。

## 八、二分查找的常见题型

| 题目 | 模板 | 关键 |
|------|------|------|
| 搜索插入位置 | 标准 | 返回 left |
| 第一个错误版本 | 左边界 | 返回 left |
| 寻找峰值 | 局部 | 比较 mid 与 mid+1 |
| 旋转排序数组搜索 | 分类讨论 | 先判断哪半有序 |
| 寻找两个正序数组中位数 | 转换 | 二分较短数组 |
| 分割数组的最大值 | 二分答案 | canSplit 判可行性 |

## 九、易错点（面试避坑）

1. **死循环**：`left < right` 时必须确保 mid 偏向某一边。
2. **返回值混淆**：模板 2/3 返回的 left/right 含义不同，写完要手动跑 n=1 的情况。
3. **有序性没验证**：题目没说"有序"就别直接二分（除非能证明）。
4. **二分答案**：写不出 canSplit 是 90% 卡题的原因。
5. **浮点二分**：用于求平方根等问题，记得控制迭代次数或误差。

## 十、调试技巧

```java tab
// 在循环里打印中间状态
while (left <= right) {
    int mid = left + (right - left) / 2;
    System.out.printf("left=%d right=%d mid=%d arr[mid]=%d%n", left, right, mid, arr[mid]);
    ...
}
```
```typescript tab
while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    console.log(`left=${left} right=${right} mid=${mid} arr[mid]=${arr[mid]}`);
    ...
}
```
```python tab
while left <= right:
    mid = left + (right - left) // 2
    print(f"left={left} right={right} mid={mid} arr[mid]={arr[mid]}")
    ...
```

或者**手动跑 n=3 的小数组**，验证每一步 left/right/mid 的变化。

## 十一、复杂度

| 维度 | 复杂度 |
|------|--------|
| 时间 | O(log n) |
| 空间 | O(1)（迭代）/ O(log n)（递归栈）|

## 十二、刷题清单

| 难度 | 题目 | 模板 |
|------|------|------|
| 🟢 | 二分查找 | 标准 |
| 🟢 | 搜索插入位置 | 标准 |
| 🟢 | 第一个错误版本 | 左边界 |
| 🟡 | 在排序数组中查找元素的第一个和最后一个位置 | 左 + 右边界 |
| 🟡 | 搜索旋转排序数组 | 分类讨论 |
| 🟡 | 寻找峰值 | 局部 |
| 🟡 | 寻找比目标字母大的最小字母 | 左边界 |
| 🟠 | 分割数组的最大值 | 二分答案 |
| 🟠 | 制作 m 束花所需的最少天数 | 二分答案 |
| 🔴 | 寻找两个正序数组的中位数 | 复杂二分 |

## 十三、心法

> **二分不难，模板固定，难的是"识别出要用二分"。**  
> 看到"有序 + 查找 + O(log n)"三个关键词，99% 是二分题。  
> 看到"最大值最小 / 最小值最大"想二分答案。

## 十四、多语言对照：标准查找

```java tab
public static int search(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```
```typescript tab
function search(arr: number[], target: number): number {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```
```python tab
def search(arr: list[int], target: int) -> int:
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
```
