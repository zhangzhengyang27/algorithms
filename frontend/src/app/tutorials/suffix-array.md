# 后缀数组

后缀数组（Suffix Array）将字符串的所有后缀按字典序排列，配合 LCP（最长公共前缀）数组，可以高效解决大量字符串问题。

## 一、基本概念

```mermaid
graph TD
  A[字符串所有后缀] --> B[字典序排序]
  B --> C[sa[] + rank[]]
  C --> D[配合 height[] 解子串问题]
```

对字符串 s = "banana"，其后缀按字典序排列：

```
后缀        起始下标    排名
a           5          0
ana         3          1
anana       1          2
banana      0          3
na          4          4
nana        2          5
```

- **sa[i]**：排名第 i 的后缀的起始位置
- **rank[i]**：起始位置为 i 的后缀的排名
- **height[i]**：sa[i] 和 sa[i-1] 对应后缀的 LCP 长度

## 二、O(n log n) 构建（倍增法）

```java tab
int[] buildSuffixArray(String s) {
    int n = s.length();
    int[] sa = new int[n], rank = new int[n], tmp = new int[n];

    // 初始：按单字符排序
    for (int i = 0; i < n; i++) { sa[i] = i; rank[i] = s.charAt(i); }

    for (int k = 1; k < n; k <<= 1) {
        int finalK = k;
        // 按 (rank[i], rank[i+k]) 排序
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> {
            if (rank[a] != rank[b]) return rank[a] - rank[b];
            int ra = a + finalK < n ? rank[a + finalK] : -1;
            int rb = b + finalK < n ? rank[b + finalK] : -1;
            return ra - rb;
        });
        for (int i = 0; i < n; i++) sa[i] = order[i];

        // 重新编号
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; i++) {
            tmp[sa[i]] = tmp[sa[i-1]];
            if (rank[sa[i]] != rank[sa[i-1]] ||
                (sa[i]+k < n ? rank[sa[i]+k] : -1) != (sa[i-1]+k < n ? rank[sa[i-1]+k] : -1)) {
                tmp[sa[i]]++;
            }
        }
        int[] swap = rank; rank = tmp; tmp = swap;
        if (rank[sa[n-1]] == n - 1) break; // 所有排名不同
    }
    return sa;
}
```

```typescript tab
function buildSuffixArray(s: string): number[] {
    const n = s.length;
    const sa = new Array(n), rank = new Array(n), tmp = new Array(n);

    // 初始：按单字符排序
    for (let i = 0; i < n; i++) { sa[i] = i; rank[i] = s.charCodeAt(i); }

    for (let k = 1; k < n; k <<= 1) {
        // 按 (rank[i], rank[i+k]) 排序
        const order = Array.from({ length: n }, (_, i) => i);
        order.sort((a, b) => {
            if (rank[a] !== rank[b]) return rank[a] - rank[b];
            const ra = a + k < n ? rank[a + k] : -1;
            const rb = b + k < n ? rank[b + k] : -1;
            return ra - rb;
        });
        for (let i = 0; i < n; i++) sa[i] = order[i];

        // 重新编号
        tmp[sa[0]] = 0;
        for (let i = 1; i < n; i++) {
            tmp[sa[i]] = tmp[sa[i - 1]];
            if (rank[sa[i]] !== rank[sa[i - 1]] ||
                (sa[i] + k < n ? rank[sa[i] + k] : -1) !== (sa[i - 1] + k < n ? rank[sa[i - 1] + k] : -1)) {
                tmp[sa[i]]++;
            }
        }
        for (let i = 0; i < n; i++) rank[i] = tmp[i];
        if (rank[sa[n - 1]] === n - 1) break; // 所有排名不同
    }
    return sa;
}
```

```python tab
def build_suffix_array(s: str) -> list:
    n = len(s)
    sa = list(range(n))
    rank = [ord(c) for c in s]
    tmp = [0] * n

    k = 1
    while k < n:
        # 按 (rank[i], rank[i+k]) 排序
        sa.sort(key=lambda i: (rank[i], rank[i + k] if i + k < n else -1))

        # 重新编号
        tmp[sa[0]] = 0
        for i in range(1, n):
            tmp[sa[i]] = tmp[sa[i - 1]]
            prev_r = rank[sa[i - 1]]
            curr_r = rank[sa[i]]
            prev_rk = rank[sa[i - 1] + k] if sa[i - 1] + k < n else -1
            curr_rk = rank[sa[i] + k] if sa[i] + k < n else -1
            if curr_r != prev_r or curr_rk != prev_rk:
                tmp[sa[i]] += 1
        rank, tmp = tmp, rank
        if rank[sa[n - 1]] == n - 1:
            break  # 所有排名不同
        k <<= 1
    return sa
```

## 三、Height 数组（LCP）

```java tab
int[] buildHeight(String s, int[] sa) {
    int n = s.length();
    int[] rank = new int[n], height = new int[n];
    for (int i = 0; i < n; i++) rank[sa[i]] = i;

    int h = 0;
    for (int i = 0; i < n; i++) {
        if (rank[i] > 0) {
            int j = sa[rank[i] - 1];
            while (i + h < n && j + h < n && s.charAt(i+h) == s.charAt(j+h)) h++;
            height[rank[i]] = h;
            if (h > 0) h--;
        } else {
            h = 0;
        }
    }
    return height;
}
```

```typescript tab
function buildHeight(s: string, sa: number[]): number[] {
    const n = s.length;
    const rank = new Array(n), height = new Array(n).fill(0);
    for (let i = 0; i < n; i++) rank[sa[i]] = i;

    let h = 0;
    for (let i = 0; i < n; i++) {
        if (rank[i] > 0) {
            const j = sa[rank[i] - 1];
            while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
            height[rank[i]] = h;
            if (h > 0) h--;
        } else {
            h = 0;
        }
    }
    return height;
}
```

```python tab
def build_height(s: str, sa: list) -> list:
    n = len(s)
    rank = [0] * n
    height = [0] * n
    for i in range(n):
        rank[sa[i]] = i

    h = 0
    for i in range(n):
        if rank[i] > 0:
            j = sa[rank[i] - 1]
            while i + h < n and j + h < n and s[i + h] == s[j + h]:
                h += 1
            height[rank[i]] = h
            if h > 0:
                h -= 1
        else:
            h = 0
    return height
```

## 四、应用

### 1. 最长重复子串

= max(height[i])

### 2. 两个后缀的 LCP

= min(height[rank[i]+1], ..., height[rank[j]])（RMQ）

### 3. 模式匹配

二分 sa 数组 + 逐字符比较 → O(m log n)

### 4. 不同子串个数

= n(n+1)/2 - Σheight[i]

## 五、复杂度

| 操作 | 时间 |
|------|------|
| 构建 SA（倍增） | O(n log n) |
| 构建 SA（DC3/SA-IS） | O(n) |
| 构建 Height | O(n) |
| 模式匹配 | O(m log n) |
| LCP 查询（+RMQ） | O(1) |

## 六、后缀数组 vs 后缀自动机 vs Trie

| 结构 | 适用 | 空间 |
|------|------|------|
| 后缀数组 | 静态字符串、排序相关 | O(n) |
| 后缀自动机 | 子串计数、在线匹配 | O(n) |
| Trie/AC | 多模式匹配 | O(总长) |

## 七、面试要点

1. **sa/rank/height 三数组**：互相转换
2. **倍增排序**：每轮按 (rank[i], rank[i+k]) 排
3. **height 性质**：LCP(sa[i], sa[j]) = min(height[i+1..j])
4. **不同子串**：总子串数 - Σheight
5. **LeetCode**：1044（最长重复子串，可用 SA 或哈希）

## 八、倍增法构建过程模拟

以 `s = "banana"` 为例，演示倍增排序的每一轮：

```
后缀： banana, anana, nana, ana, na, a

第1轮（按前 1 个字符排序）：
  a(5) < ana(3) < anana(1) < banana(0) < na(4) < nana(2)
  rank = [b:1, a:0, n:2, a:0, n:2, a:0] → 按首字母分组

第2轮（按前 2 个字符，用 (rank[i], rank[i+1]) 作关键字）：
  a < an < an < ba < na < na

第4轮（按前 4 个字符）：
  a < ana < anan... 逐步细分

直到某一轮所有 rank 互不相同 → 排序完成

最终 sa = [5, 3, 1, 0, 4, 2]
  sa[0]=5 → "a"
  sa[1]=3 → "ana"
  sa[2]=1 → "anana"
  sa[3]=0 → "banana"
  sa[4]=4 → "na"
  sa[5]=2 → "nana"

height[i] = LCP(sa[i-1], sa[i])：
  height[2] = LCP("ana","anana") = 3
  height[5] = LCP("na","nana") = 2
```

**为什么是 O(n log n)**：每轮排序后“有效区分长度”翻倍，最多 log n 轮；每轮用基数排序 O(n)。

## 九、height 数组的妙用

```
性质：任意两个后缀的 LCP = 它们 rank 之间所有 height 的最小值
  LCP(sa[i], sa[j]) = min(height[i+1], ..., height[j])  (i < j)

应用1：最长重复子串 = max(height)
  banana 的 height 最大值 = 3（"ana" 出现两次）

应用2：不同子串个数 = n(n+1)/2 - Σheight[i]
  每个后缀贡献 n-sa[i] 个新子串，减去与前一后缀重复的 height[i] 个
```

## 十、思考题

1. 为什么倍增法每轮可以用基数排序而不是比较排序？这对复杂度有什么影响？（提示：关键字是整数 rank）
2. 求“最长重复子串”为什么等价于求 height 数组的最大值？（提示：重复子串 = 两个后缀的公共前缀）
3. 如果要求“至少出现 k 次的最长子串”，如何在 height 数组上求解？（提示：滑动窗口求长度≥k-1 的 height 区间最小值的最大值）

> 练习推荐：LC 1044 可用后缀数组或“二分+哈希”两种解法，建议先掌握 [字符串哈希](/tutorials/string-hashing) 再对比。
