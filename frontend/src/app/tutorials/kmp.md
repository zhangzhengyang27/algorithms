# KMP 算法

KMP（Knuth-Morris-Pratt）算法通过预处理模式串的"前缀函数"（next 数组），在匹配失败时跳过不必要的比较，实现 O(n+m) 的字符串匹配。

## 一、暴力匹配的问题

```mermaid
graph LR
  A[模式串] --> B[前缀函数 next]
  B --> C[失配跳过比较]
  C --> D["O(n+m) 匹配"]
```

```java tab
// O(n*m) 暴力
for (int i = 0; i <= n - m; i++) {
    int j = 0;
    while (j < m && text[i + j] == pattern[j]) j++;
    if (j == m) return i; // 匹配成功
}
```

```typescript tab
// O(n*m) 暴力
for (let i = 0; i <= n - m; i++) {
    let j = 0;
    while (j < m && text[i + j] === pattern[j]) j++;
    if (j === m) return i; // 匹配成功
}
```

```python tab
# O(n*m) 暴力
for i in range(n - m + 1):
    j = 0
    while j < m and text[i + j] == pattern[j]:
        j += 1
    if j == m:
        return i  # 匹配成功
```

失败时 i 回退 → 大量重复比较。

**暴力 vs KMP 的关键差异**：

```
text:    a b a b c a b a b d
pattern: a b a b d

暴力法在 i=0 匹配到第5个字符失败后：
  i 回退到 1，j 回到 0，从头比较 → 已比较的 "abab" 信息全部丢弃

KMP 的想法：
  已经匹配了 "abab"，pattern 中 "ab" 既是前缀又是后缀
  → 模式串右移 2 位，让已知的公共前后缀对齐
  → i 不动，j 从 2 继续比较

text:    a b a b c a b a b d
pattern:     a b a b d        ← 右移后，j=2 从 'a' 继续
              ↑ j=next[4]=2
```

## 二、前缀函数（next 数组）

`next[i]` = `pattern[0..i]` 的最长相等前后缀长度（真前缀，不含自身）。

```
pattern: a b a b a c
下标:    0 1 2 3 4 5
next:    0 0 1 2 3 0

逐步推导：
i=0: "a"      → 无真前后缀 → 0
i=1: "ab"     → 前缀{a} 后缀{b} 无交集 → 0
i=2: "aba"    → 前缀{a,ab} 后缀{a,ba} → "a" 匹配 → 1
i=3: "abab"   → 前缀{a,ab,aba} 后缀{b,ab,bab} → "ab" 匹配 → 2
i=4: "ababa"  → 在 next[3]=2 基础上，p[4]='a'==p[2]='a' → 3
i=5: "ababac" → p[5]='c'≠p[3]='b'，回退 k=next[2]=1，
                p[5]≠p[1]，回退 k=next[0]=0，p[5]≠p[0] → 0
```

含义：当 `pattern[j]` 失配时，j 跳到 `next[j-1]`，因为前缀已经匹配过了。

### 构建 next 数组

```java tab
int[] buildNext(String p) {
    int m = p.length();
    int[] next = new int[m];
    next[0] = 0;
    int k = 0; // 当前最长前后缀长度
    for (int i = 1; i < m; i++) {
        while (k > 0 && p.charAt(i) != p.charAt(k)) {
            k = next[k - 1]; // 回退
        }
        if (p.charAt(i) == p.charAt(k)) k++;
        next[i] = k;
    }
    return next;
}
```

```typescript tab
function buildNext(p: string): number[] {
    const m = p.length;
    const next = new Array(m).fill(0);
    let k = 0; // 当前最长前后缀长度
    for (let i = 1; i < m; i++) {
        while (k > 0 && p[i] !== p[k]) {
            k = next[k - 1]; // 回退
        }
        if (p[i] === p[k]) k++;
        next[i] = k;
    }
    return next;
}
```

```python tab
def build_next(p: str) -> list:
    m = len(p)
    nxt = [0] * m
    k = 0  # 当前最长前后缀长度
    for i in range(1, m):
        while k > 0 and p[i] != p[k]:
            k = nxt[k - 1]  # 回退
        if p[i] == p[k]:
            k += 1
        nxt[i] = k
    return nxt
```

**构建过程本质**：模式串与自身的匹配——把 pattern 同时当作 text 和 pattern，求每个前缀的后缀与前缀的最长公共部分。

## 三、KMP 匹配

```java tab
int kmpSearch(String text, String pattern) {
    int n = text.length(), m = pattern.length();
    if (m == 0) return 0;
    int[] next = buildNext(pattern);
    int j = 0; // pattern 中已匹配的字符数
    for (int i = 0; i < n; i++) {
        while (j > 0 && text.charAt(i) != pattern.charAt(j)) {
            j = next[j - 1]; // 利用 next 跳转
        }
        if (text.charAt(i) == pattern.charAt(j)) j++;
        if (j == m) {
            return i - m + 1; // 找到匹配
            // j = next[j - 1]; // 继续找下一个匹配
        }
    }
    return -1;
}
```

```typescript tab
function kmpSearch(text: string, pattern: string): number {
    const n = text.length, m = pattern.length;
    if (m === 0) return 0;
    const next = buildNext(pattern);
    let j = 0; // pattern 中已匹配的字符数
    for (let i = 0; i < n; i++) {
        while (j > 0 && text[i] !== pattern[j]) {
            j = next[j - 1]; // 利用 next 跳转
        }
        if (text[i] === pattern[j]) j++;
        if (j === m) {
            return i - m + 1; // 找到匹配
            // j = next[j - 1]; // 继续找下一个匹配
        }
    }
    return -1;
}
```

```python tab
def kmp_search(text: str, pattern: str) -> int:
    n, m = len(text), len(pattern)
    if m == 0:
        return 0
    nxt = build_next(pattern)
    j = 0  # pattern 中已匹配的字符数
    for i in range(n):
        while j > 0 and text[i] != pattern[j]:
            j = nxt[j - 1]  # 利用 next 跳转
        if text[i] == pattern[j]:
            j += 1
        if j == m:
            return i - m + 1  # 找到匹配
            # j = nxt[j - 1]  # 继续找下一个匹配
    return -1
```

### 完整匹配过程模拟

```
text = "ababcababa", pattern = "ababa", next = [0,0,1,2,3]

i=0: a==a j=1    i=1: b==b j=2    i=2: a==a j=3
i=3: b==b j=4    i=4: c≠a → j=next[3]=2 → c≠a → j=next[1]=0 → c≠a → j=0
i=5: a==a j=1    i=6: b==b j=2    i=7: a==a j=3
i=8: b==b j=4    i=9: a==a j=5 → j==m! 匹配位置 = 9-5+1 = 5

text:    a b a b c | a b a b a
pattern: a b a b a |
             失配↗  |     a b a b a  ← 匹配成功
                    |          ↑ 起始位置5

i 从未回退，总共只比较了 13 次（暴力法需要 ~20 次）
```

## 四、为什么是 O(n+m)？

- 构建 next：O(m)（k 最多增 m 次、减 m 次）
- 匹配：O(n)（j 最多增 n 次、减 n 次）
- 总计：O(n + m)

关键：i 永远不回退，j 的回退总次数也是 O(n)。

**均摊分析（势能法）**：定义势能 Φ = j（当前已匹配长度）。每次 i 前进 1，j 最多 +1；每次回退 j 至少 -1 且势能 ≥ 0。所以回退总次数 ≤ 前进总次数 = n。

## 五、next 数组的应用

### 1. 最短循环节

```java tab
// 字符串 s 的最短循环节长度
int len = n - next[n - 1];
if (n % len == 0) return len; // 由循环节重复构成
else return n; // 无完整循环
```

```typescript tab
// 字符串 s 的最短循环节长度
const len = n - next[n - 1];
if (n % len === 0) return len; // 由循环节重复构成
else return n; // 无完整循环
```

```python tab
# 字符串 s 的最短循环节长度
length = n - nxt[n - 1]
if n % length == 0:
    return length  # 由循环节重复构成
else:
    return n  # 无完整循环
```

**原理图解**（LC 459 重复的子字符串）：

```
s = "abababab" (n=8), next[7] = 6

s:     [a b] a b a b a b
        ↑循环节↑
s的后缀 "ababab" == s的前缀 "ababab"（长度6）
→ 去掉重叠部分，循环节长度 = 8 - 6 = 2 = "ab"
→ 8 % 2 == 0 → s 由 "ab" 重复 4 次构成 ✓
```

### 2. 统计所有出现次数（含重叠）

```python tab
def count_occurrences(text: str, pattern: str) -> int:
    nxt = build_next(pattern)
    count = j = 0
    for i in range(len(text)):
        while j > 0 and text[i] != pattern[j]:
            j = nxt[j - 1]
        if text[i] == pattern[j]:
            j += 1
        if j == len(pattern):
            count += 1
            j = nxt[j - 1]  # 关键：继续匹配，允许重叠
    return count

# "aaaa" 中 "aa" 出现 3 次（重叠计数）
```

### 3. 最长回文前缀/后缀

结合反转串 + KMP：求 s 的最长回文前缀 → 构造 `s + '#' + reverse(s)`，其 next 数组末值即为最长回文前缀长度。

### 4. 多模式匹配

KMP 本身是单模式；多模式 → AC 自动机（Trie + KMP 的 next 思想）。

## 六、KMP vs 其他匹配算法

| 算法 | 时间 | 特点 |
|------|------|------|
| 暴力 | O(nm) | 简单 |
| KMP | O(n+m) | 单模式、无回退 |
| Rabin-Karp | O(n+m) 平均 | 滚动哈希、支持多模式 |
| Boyer-Moore | O(n/m) 最好 | 从右向左、实际最快 |
| AC 自动机 | O(n + 总模式长) | 多模式 |

## 七、面试要点

1. **next 数组含义**：最长相等真前后缀长度
2. **j 的跳转**：`j = next[j-1]`，不是 `j = next[j]`
3. **i 不回退**：这是 KMP 线性的保证
4. **边界**：`next[0] = 0`，空串返回 0
5. **LeetCode**：28（找出字符串中第一个匹配项）、459（重复的子字符串）、686（重复叠加字符串匹配）

### 面试真题

| 题目 | 难度 | 核心思路 |
|------|------|----------|
| 找出字符串中第一个匹配项（LC 28） | 🟢 Easy | KMP 模板题 |
| 重复的子字符串（LC 459） | 🟢 Easy | n - next[n-1] 整除判断 |
| 重复叠加字符串匹配（LC 686） | 🟡 Medium | 拼接后 KMP |
| 最短回文串（LC 214） | 🔴 Hard | 最长回文前缀 + 反转拼接 |
| 最长快乐前缀（LC 1392） | 🟡 Medium | 最长公共前后缀 |

## 八、易错点分析

**1. 跳转公式写错**

```java
// ❌ j = next[j]  （这是另一种定义的 next 数组）
// ✅ 本教程定义：失配时 j = next[j - 1]
while (j > 0 && text[i] != pattern[j]) j = next[j - 1];
```

**2. 忘记 j==m 后继续匹配的处理**

找第一个匹配直接 return；找所有匹配必须 `j = next[j-1]` 继续，否则死循环或漏计重叠出现。

**3. 循环节判断漏掉整除检查**

```java
// ❌ 直接返回 n - next[n-1]
// ✅ 必须检查 n % len == 0
// "ababa" 的 n-next[n-1]=2，但 "ababa" 不是 "ab" 的整数次重复
```

## 九、思考题

1. 为什么构建 next 数组时的回退 `k = next[k-1]` 不会导致死循环？（提示：next 值的严格递减性）
2. 如果模式串是 "aaaaab"，文本串是 "aaaaaaaaaa...a"（百万个a），KMP 的比较次数是多少？暴力法呢？
3. 如何用 KMP 的思想解决"在环形字符串中查找模式串"？（提示：text 拼接自身）

> 练习推荐：先完成 [字符串匹配](/tutorials/string-matching) 中的基础题，再挑战 LC 214。
