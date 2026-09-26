# 动态规划：从入门到精通




## 一、什么是动态规划

```mermaid
graph LR
  A[原问题] --> B[重叠子问题]
  B --> C[最优子结构]
  C --> D[状态+转移]
  D --> E[记忆化/打表]
```

**动态规划（Dynamic Programming, DP）** 是将复杂问题分解为**重叠子问题**，把每个子问题的解**记忆化**存储，从而把指数级暴力搜索降到多项式级别的算法思想。

它与分治的区别在于：**子问题是否重复**。如果子问题互不重叠（如归并排序），那是分治；如果子问题大量重叠，必须用 DP。

## 二、DP 三要素

任何 DP 问题都可以从以下三个维度建模：

1. **状态（State）**：描述子问题的变量。常见维度有位置、容量、次数、是否使用、奇偶、前缀等。
2. **转移方程（Transition）**：状态之间如何推导。
3. **边界（Base Case）**：最小子问题的答案。

| 维度 | 思考问题 |
|------|----------|
| 状态 | 我需要记住哪些信息才能继续推导？ |
| 转移 | 当前状态可以由哪些**更小的**状态推出来？ |
| 边界 | 最小的问题（不能再分的）答案是什么？ |
| 顺序 | 状态之间有拓扑序吗？按照什么顺序遍历？ |

## 三、典型模型

### 3.1 线性 DP

> 状态沿数组下标线性展开。

**例 1：最长上升子序列（LIS）**

```java tab
public int lengthOfLIS(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    int ans = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        ans = Math.max(ans, dp[i]);
    }
    return ans;
}
```

```typescript tab
function lengthOfLIS(nums: number[]): number {
    const n = nums.length;
    const dp = new Array(n).fill(1);
    let ans = 1;
    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
        }
        ans = Math.max(ans, dp[i]);
    }
    return ans;
}
```

```python tab
def length_of_lis(nums: list[int]) -> int:
    if not nums: return 0
    n = len(nums)
    dp = [1] * n
    ans = 1
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        ans = max(ans, dp[i])
    return ans
```

- **时间**：O(n²)，**空间**：O(n)
- **优化**：维护 `tails[k] = 长度为 k+1 的递增子序列的最小尾值`，用二分达到 O(n log n)

**例 2：最长公共子序列（LCS）**

求两个字符串的最长公共子序列长度。

```java tab
public int longestCommonSubsequence(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[][] dp = new int[m + 1][n + 1];   // dp[i][j] = s1[0..i) 与 s2[0..j) 的 LCS 长度
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}
```

```typescript tab
function longestCommonSubsequence(s1: string, s2: string): number {
    const m = s1.length, n = s2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}
```

```python tab
def longest_common_subsequence(s1: str, s2: str) -> int:
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]
```

- **时间 / 空间**：O(m × n)
- **空间优化**：滚动数组 `int[] dp = new int[n + 1]`

### 3.2 背包 DP

> 状态 = `dp[i][j]` = 前 i 个物品在容量 j 下的最优解。

**0/1 背包**（每件物品最多选一次）：

```java tab
// n 件物品，weights[i] 重量，values[i] 价值，容量 W
public int knapsack01(int[] weights, int[] values, int W) {
    int n = weights.length;
    int[] dp = new int[W + 1];                       // 滚动数组
    for (int i = 0; i < n; i++) {
        for (int j = W; j >= weights[i]; j--) {     // ⚠️ 倒序：避免重复选
            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    return dp[W];
}
```

```typescript tab
// n 件物品，weights[i] 重量，values[i] 价值，容量 W
function knapsack01(weights: number[], values: number[], W: number): number {
    const n = weights.length;
    const dp = new Array(W + 1).fill(0);             // 滚动数组
    for (let i = 0; i < n; i++) {
        for (let j = W; j >= weights[i]; j--) {     // ⚠️ 倒序：避免重复选
            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    return dp[W];
}
```

```python tab
# n 件物品，weights[i] 重量，values[i] 价值，容量 W
def knapsack01(weights: list[int], values: list[int], W: int) -> int:
    n = len(weights)
    dp = [0] * (W + 1)                               # 滚动数组
    for i in range(n):
        for j in range(W, weights[i] - 1, -1):      # ⚠️ 倒序：避免重复选
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    return dp[W]
```

**完全背包**（每件物品可无限次）：

```java tab
public int knapsackComplete(int[] weights, int[] values, int W) {
    int n = weights.length;
    int[] dp = new int[W + 1];
    for (int i = 0; i < n; i++) {
        for (int j = weights[i]; j <= W; j++) {     // ✅ 正序：允许重复
            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    return dp[W];
}
```

```typescript tab
function knapsackComplete(weights: number[], values: number[], W: number): number {
    const n = weights.length;
    const dp = new Array(W + 1).fill(0);
    for (let i = 0; i < n; i++) {
        for (let j = weights[i]; j <= W; j++) {     // ✅ 正序：允许重复
            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }
    return dp[W];
}
```

```python tab
def knapsack_complete(weights: list[int], values: list[int], W: int) -> int:
    n = len(weights)
    dp = [0] * (W + 1)
    for i in range(n):
        for j in range(weights[i], W + 1):           # ✅ 正序：允许重复
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    return dp[W]
```

**关键区别**：
- 0/1 背包：内层倒序，每件物品只选一次。
- 完全背包：内层正序，每件物品可选多次。

**多重背包**（每件物品最多 k 次）：用二进制拆分 + 0/1 背包，或单调队列优化。

### 3.3 区间 DP

> 子问题的范围是一个区间，状态用 `dp[l][r]` 表示 `[l, r]` 上的最优解。

经典模板（戳气球 / 矩阵链乘 / 最优三角剖分）：

```java tab
for (int len = 2; len <= n; len++) {           // 区间长度
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        dp[l][r] = Integer.MAX_VALUE;
        for (int k = l; k < r; k++) {           // 分割点
            dp[l][r] = Math.min(dp[l][r], dp[l][k] + dp[k+1][r] + cost(l, r, k));
        }
    }
}
```

```typescript tab
for (let len = 2; len <= n; len++) {           // 区间长度
    for (let l = 0; l + len - 1 < n; l++) {
        const r = l + len - 1;
        dp[l][r] = Infinity;
        for (let k = l; k < r; k++) {           // 分割点
            dp[l][r] = Math.min(dp[l][r], dp[l][k] + dp[k + 1][r] + cost(l, r, k));
        }
    }
}
```

```python tab
for length in range(2, n + 1):                  # 区间长度
    for l in range(n - length + 1):
        r = l + length - 1
        dp[l][r] = float('inf')
        for k in range(l, r):                   # 分割点
            dp[l][r] = min(dp[l][r], dp[l][k] + dp[k + 1][r] + cost(l, r, k))
```

**例：最长回文子序列**

```java tab
public int longestPalindromeSubseq(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++) {
        for (int l = 0; l + len - 1 < n; l++) {
            int r = l + len - 1;
            if (s.charAt(l) == s.charAt(r)) {
                dp[l][r] = dp[l + 1][r - 1] + 2;
            } else {
                dp[l][r] = Math.max(dp[l + 1][r], dp[l][r - 1]);
            }
        }
    }
    return dp[0][n - 1];
}
```

```typescript tab
function longestPalindromeSubseq(s: string): number {
    const n = s.length;
    const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) dp[i][i] = 1;
    for (let len = 2; len <= n; len++) {
        for (let l = 0; l + len - 1 < n; l++) {
            const r = l + len - 1;
            if (s[l] === s[r]) {
                dp[l][r] = dp[l + 1][r - 1] + 2;
            } else {
                dp[l][r] = Math.max(dp[l + 1][r], dp[l][r - 1]);
            }
        }
    }
    return dp[0][n - 1];
}
```

```python tab
def longest_palindrome_subseq(s: str) -> int:
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = 1
    for length in range(2, n + 1):
        for l in range(n - length + 1):
            r = l + length - 1
            if s[l] == s[r]:
                dp[l][r] = dp[l + 1][r - 1] + 2
            else:
                dp[l][r] = max(dp[l + 1][r], dp[l][r - 1])
    return dp[0][n - 1]
```

### 3.4 状态机 DP

把"在 / 不在 / 是否使用过"等布尔信息编进状态。常见于：
- 股票买卖系列（冷冻期、手续费、限次数）
- 打家劫舍系列

**例：买卖股票的最佳时机含冷冻期**

```java tab
// dp[i][0]=持有，dp[i][1]=不持有且在冷冻期，dp[i][2]=不持有且不在冷冻期
dp[i][0] = max(dp[i-1][0], dp[i-1][2] - prices[i]);
dp[i][1] = dp[i-1][0] + prices[i];
dp[i][2] = max(dp[i-1][1], dp[i-1][2]);
```

```typescript tab
// dp[i][0]=持有，dp[i][1]=不持有且在冷冻期，dp[i][2]=不持有且不在冷冻期
dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][2] - prices[i]);
dp[i][1] = dp[i - 1][0] + prices[i];
dp[i][2] = Math.max(dp[i - 1][1], dp[i - 1][2]);
```

```python tab
# dp[i][0]=持有，dp[i][1]=不持有且在冷冻期，dp[i][2]=不持有且不在冷冻期
dp[i][0] = max(dp[i - 1][0], dp[i - 1][2] - prices[i])
dp[i][1] = dp[i - 1][0] + prices[i]
dp[i][2] = max(dp[i - 1][1], dp[i - 1][2])
```

### 3.5 树形 DP

在树上做后序遍历，状态从子树汇聚上来。

```java tab
int[] dfs(TreeNode u) {
    int[] res = new int[2];    // res[0]=不选u, res[1]=选u
    if (u == null) return res;
    int[] l = dfs(u.left), r = dfs(u.right);
    res[0] = Math.max(l[0], l[1]) + Math.max(r[0], r[1]);
    res[1] = u.val + l[0] + r[0];
    return res;
}
```

```typescript tab
function dfs(u: TreeNode | null): [number, number] {
    const res: [number, number] = [0, 0];    // res[0]=不选u, res[1]=选u
    if (u === null) return res;
    const l = dfs(u.left), r = dfs(u.right);
    res[0] = Math.max(l[0], l[1]) + Math.max(r[0], r[1]);
    res[1] = u.val + l[0] + r[0];
    return res;
}
```

```python tab
def dfs(u: TreeNode | None) -> list[int]:
    res = [0, 0]    # res[0]=不选u, res[1]=选u
    if u is None:
        return res
    l, r = dfs(u.left), dfs(u.right)
    res[0] = max(l[0], l[1]) + max(r[0], r[1])
    res[1] = u.val + l[0] + r[0]
    return res
```

**例**：打家劫舍 III、树的直径、节点最大权和。

### 3.6 字符串编辑 DP（编辑距离）

求把 `word1` 转成 `word2` 的最少操作数（插入 / 删除 / 替换）。

```java tab
public int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;     // 删除 i 次
    for (int j = 0; j <= n; j++) dp[0][j] = j;     // 插入 j 次
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];        // 不需操作
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],                    // 删除 word1[i-1]
                    Math.min(dp[i][j - 1],           // 插入 word2[j-1]
                             dp[i - 1][j - 1])       // 替换
                );
            }
        }
    }
    return dp[m][n];
}
```

```typescript tab
function minDistance(word1: string, word2: string): number {
    const m = word1.length, n = word2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;     // 删除 i 次
    for (let j = 0; j <= n; j++) dp[0][j] = j;     // 插入 j 次
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];        // 不需操作
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],                    // 删除 word1[i-1]
                    dp[i][j - 1],                    // 插入 word2[j-1]
                    dp[i - 1][j - 1]                 // 替换
                );
            }
        }
    }
    return dp[m][n];
}
```

```python tab
def min_distance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i                                 # 删除 i 次
    for j in range(n + 1):
        dp[0][j] = j                                 # 插入 j 次
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]          # 不需操作
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],                    # 删除 word1[i-1]
                    dp[i][j - 1],                    # 插入 word2[j-1]
                    dp[i - 1][j - 1]                 # 替换
                )
    return dp[m][n]
```

- **时间 / 空间**：O(m × n)
- **空间优化**：滚动数组 `int[] dp = new int[n + 1]`

### 3.7 数位 DP

> 统计 `[L, R]` 中满足条件的整数个数，状态是"高位前缀 + 是否贴上界 + 前导零"。

模板：

```java tab
long dfs(int pos, boolean tight, boolean lead, int... other) {
    if (pos == -1) return (lead ? 0 : 1);  // 取决于定义
    if (!tight && !lead && memo[pos][...] != -1) return memo[pos][...];
    long ans = 0;
    int up = tight ? digits[pos] : 9;
    for (int d = 0; d <= up; d++) {
        ans += dfs(pos - 1, tight && d == up, lead && d == 0, ...);
    }
    if (!tight && !lead) memo[pos][...] = ans;
    return ans;
}
```

```typescript tab
function dfs(pos: number, tight: boolean, lead: boolean, ...other: number[]): number {
    if (pos === -1) return lead ? 0 : 1;  // 取决于定义
    if (!tight && !lead && memo[pos][...] !== -1) return memo[pos][...];
    let ans = 0;
    const up = tight ? digits[pos] : 9;
    for (let d = 0; d <= up; d++) {
        ans += dfs(pos - 1, tight && d === up, lead && d === 0, ...);
    }
    if (!tight && !lead) memo[pos][...] = ans;
    return ans;
}
```

```python tab
def dfs(pos: int, tight: bool, lead: bool, *other) -> int:
    if pos == -1:
        return 0 if lead else 1        # 取决于定义
    if not tight and not lead and memo[pos][...] != -1:
        return memo[pos][...]
    ans = 0
    up = digits[pos] if tight else 9
    for d in range(up + 1):
        ans += dfs(pos - 1, tight and d == up, lead and d == 0, ...)
    if not tight and not lead:
        memo[pos][...] = ans
    return ans
```

## 四、优化技巧

### 4.1 滚动数组
当 `dp[i]` 只依赖 `dp[i-1]` 时，用 1 维数组即可。  
例：斐波那契、爬楼梯、打家劫舍、打字。

### 4.2 状态压缩
当状态是布尔集合（哪几位用过），用位掩码 `int mask`。  
例：最短 Hamilton 路径、状态压缩 TSP。

### 4.3 单调队列 / 单调栈优化
把转移中"区间最值"的部分从 O(n) 降到 O(1)。  
例：滑动窗口最大值、最大子序和（限定长度）。

### 4.4 矩阵快速幂
当转移是**线性递推**（如斐波那契），构造矩阵后用快速幂降到 O(log n)。  
例：爬楼梯、爬楼梯 II（一次最多 k 步）。

## 五、调试与对拍

**4 个最常用调试技巧：**

1. **打印 dp 数组**——很多时候第二维写反或者初始值没赋对，肉眼可见。
2. **先写递归记忆化**——再改成递推。递归版对逻辑、递推版对空间。
3. **打印转移过程**——把 `dp[i]` 由哪个 `dp[j]` 推出打出来，验证依赖关系。
4. **小数据暴力对拍**——写一个 `O(2^n)` 暴力，跟 `O(n²)` DP 在 n≤10 上随机对拍。

## 六、刷题路线（按模型分组）

| 难度 | 题目 | 模型 |
|------|------|------|
| 🟢 | 爬楼梯、打家劫舍、斐波那契 | 入门递推 |
| 🟢 | 最大子序和、乘积最大子数组 | 线性 DP |
| 🟡 | 最长上升子序列、最长公共子序列 | 线性 DP |
| 🟡 | 0/1 背包、完全背包、零钱兑换 | 背包 |
| 🟡 | 最长回文子序列、戳气球 | 区间 DP |
| 🟡 | 编辑距离、不同子序列 | 字符串 DP |
| 🟠 | 买卖股票系列（含冷冻期） | 状态机 |
| 🟠 | 打家劫舍 III、树的直径 | 树形 DP |
| 🔴 | 最短 Hamilton 路径 | 状态压缩 |
| 🔴 | 不含连续 1 的非负整数 | 数位 DP |

## 七、思维框架（万能四步）

1. **观察重复**：哪些子问题被重复求解？
2. **定义状态**：用最少的维度描述子问题。
3. **写转移**：当前状态由哪些**更小的**状态转移而来。
4. **压空间**：能不能滚动数组？能不能用单调结构？

> 当你卡题时，回到第 1 步：**"暴力是什么？暴力在重复算什么？"** 答案是 DP 的状态。
