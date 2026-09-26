# Manacher 算法：O(n) 求最长回文子串

Manacher 算法（马拉车算法）能在 **O(n)** 时间内求出字符串中每个位置的最长回文半径，从而找到最长回文子串。相比中心扩展的 O(n²)，它是回文问题的终极解法。

## 一、核心思想

```mermaid
graph LR
  A[字符串] --> B[插#统一奇偶]
  B --> C[利用对称半径]
  C --> D["O(n) 求所有回文"]
```

1. **预处理**：在字符间插入分隔符 `#`，统一奇偶长度回文
   - `"aba"` → `"#a#b#a#"`（长度 2n+1）
2. **维护最右回文边界 R 及其中心 C**
3. **利用已知回文的对称性**跳过重复比较

## 二、算法步骤

对于位置 i：
- 若 `i < R`：利用对称点 `mirror = 2*C - i` 的已知半径初始化
- 从初始化半径开始向两边扩展
- 若扩展后超过 R，更新 `C = i, R = i + p[i]`

```java tab
public class Manacher {

    public static String longestPalindrome(String s) {
        // 1. 预处理：插入分隔符
        StringBuilder sb = new StringBuilder("^#");
        for (char c : s.toCharArray()) {
            sb.append(c).append('#');
        }
        sb.append('$');
        char[] t = sb.toString().toCharArray();
        int n = t.length;
        int[] p = new int[n]; // p[i] = 以 i 为中心的回文半径

        int C = 0, R = 0; // 当前最右回文的中心和右边界

        for (int i = 1; i < n - 1; i++) {
            int mirror = 2 * C - i;

            // 利用对称性初始化
            if (i < R) {
                p[i] = Math.min(R - i, p[mirror]);
            }

            // 尝试扩展
            while (t[i + p[i] + 1] == t[i - p[i] - 1]) {
                p[i]++;
            }

            // 更新最右边界
            if (i + p[i] > R) {
                C = i;
                R = i + p[i];
            }
        }

        // 找最大回文半径
        int maxLen = 0, center = 0;
        for (int i = 1; i < n - 1; i++) {
            if (p[i] > maxLen) {
                maxLen = p[i];
                center = i;
            }
        }

        // 映射回原字符串
        int start = (center - maxLen) / 2;
        return s.substring(start, start + maxLen);
    }

    public static void main(String[] args) {
        System.out.println(longestPalindrome("babad")); // "bab" 或 "aba"
        System.out.println(longestPalindrome("cbbd"));  // "bb"
    }
}
```

```typescript tab
function longestPalindrome(s: string): string {
    // 1. 预处理：插入分隔符
    let t = "^#";
    for (const c of s) {
        t += c + "#";
    }
    t += "$";
    const n = t.length;
    const p = new Array(n).fill(0); // p[i] = 以 i 为中心的回文半径

    let C = 0, R = 0; // 当前最右回文的中心和右边界

    for (let i = 1; i < n - 1; i++) {
        const mirror = 2 * C - i;

        // 利用对称性初始化
        if (i < R) {
            p[i] = Math.min(R - i, p[mirror]);
        }

        // 尝试扩展
        while (t[i + p[i] + 1] === t[i - p[i] - 1]) {
            p[i]++;
        }

        // 更新最右边界
        if (i + p[i] > R) {
            C = i;
            R = i + p[i];
        }
    }

    // 找最大回文半径
    let maxLen = 0, center = 0;
    for (let i = 1; i < n - 1; i++) {
        if (p[i] > maxLen) {
            maxLen = p[i];
            center = i;
        }
    }

    // 映射回原字符串
    const start = Math.floor((center - maxLen) / 2);
    return s.slice(start, start + maxLen);
}

console.log(longestPalindrome("babad")); // "bab" 或 "aba"
console.log(longestPalindrome("cbbd"));  // "bb"
```

```python tab
def longest_palindrome(s: str) -> str:
    # 1. 预处理：插入分隔符
    t = "^#" + "#".join(s) + "#$"
    n = len(t)
    p = [0] * n  # p[i] = 以 i 为中心的回文半径

    C, R = 0, 0  # 当前最右回文的中心和右边界

    for i in range(1, n - 1):
        mirror = 2 * C - i

        # 利用对称性初始化
        if i < R:
            p[i] = min(R - i, p[mirror])

        # 尝试扩展
        while t[i + p[i] + 1] == t[i - p[i] - 1]:
            p[i] += 1

        # 更新最右边界
        if i + p[i] > R:
            C = i
            R = i + p[i]

    # 找最大回文半径
    max_len, center = 0, 0
    for i in range(1, n - 1):
        if p[i] > max_len:
            max_len = p[i]
            center = i

    # 映射回原字符串
    start = (center - max_len) // 2
    return s[start:start + max_len]

print(longest_palindrome("babad"))  # "bab" 或 "aba"
print(longest_palindrome("cbbd"))   # "bb"
```

## 三、为什么是 O(n)？

虽然有两层循环（外层遍历 + 内层扩展），但：
- 每次成功扩展都会推进 R（最右边界）
- R 只会单调递增，最多到 n
- 所以内层扩展的**总次数**不超过 n

**均摊 O(n)**。

## 四、复杂度

| 指标 | 值 |
|------|-----|
| 时间 | O(n) |
| 空间 | O(n)（p 数组 + 预处理字符串） |

## 五、与其他方法对比

| 方法 | 时间 | 空间 | 适用场景 |
|------|------|------|---------|
| 暴力枚举 | O(n³) | O(1) | 不推荐 |
| 中心扩展 | O(n²) | O(1) | 面试首选，代码简洁 |
| 动态规划 | O(n²) | O(n²) | 需要所有子串信息 |
| Manacher | O(n) | O(n) | 竞赛/超长字符串 |

## 六、面试要点

1. **面试中**：中心扩展法（O(n²)）通常足够，代码简洁不易出错
2. **Manacher 的适用场景**：字符串长度 > 10⁴ 且需要所有回文信息
3. **预处理的目的**：消除奇偶分类讨论
4. **LeetCode**：5（最长回文子串）、647（回文子串计数）、131（分割回文串）

## 七、p 数组计算模拟

以 s = "babab" 为例，预处理后 t = "#b#a#b#a#b#"：

```
t:    #  b  #  a  #  b  #  a  #  d  #
i:    0  1  2  3  4  5  6  7  8  9  10
p[i]: 0  1  0  3  0  5  0  3  0  1  0

关键步骤（维护 center=5, right=10 后）：

i=6: i < right，镜像 j = 2*5-6 = 4，p[4]=0
     从 p[6]=0 开始扩展：t[5]='b' vs t[7]='a' 不等 → p[6]=0

i=7: i < right，镜像 j = 3，p[3]=3
     但 right - i = 3 = p[3]，不能直接取 → 从 p[7]=3 继续扩展
     t[4]='#' vs t[10]='#' 相等 → p[7]=4? 不对，t[3]... 
     实际：p[7] 先取 min(p[3], right-i)=3，再尝试扩展

核心规则：
  i < right:  p[i] = min(p[2*center - i], right - i)，然后尝试继续扩展
  i >= right: p[i] = 0，直接扩展
  扩展后若 i + p[i] > right，更新 center=i, right=i+p[i]
```

**p[i] 的含义**：以 t[i] 为中心的回文半径。原串中以 i 为中心的最长回文长度 = p[i]。

## 八、面试真题

| 题目 | 难度 | 核心思路 |
|------|------|----------|
| 最长回文子串（LC 5） | 🟡 Medium | 中心扩展 or Manacher |
| 回文子串计数（LC 647） | 🟡 Medium | 中心扩展计数 or p数组求和 |
| 分割回文串（LC 131） | 🟡 Medium | 回溯 + 回文判断 |
| 最短回文串（LC 214） | 🔴 Hard | KMP 前缀函数 or Manacher |
| 最长回文子序列（LC 516） | 🟡 Medium | 区间 DP（非 Manacher） |

## 九、易错点分析

**1. 预处理插入分隔符的原因**

```
"aba" (奇数长) 和 "abba" (偶数长) 的回文中心不同：
奇数：中心在字符上；偶数：中心在两字符之间
插入 '#' 后统一为奇数长度："#a#b#a#" 中心总在某个字符上
```

**2. 镜像回文超出左边界的情况**

```p[i] = min(p[mirror], right - i) 中的 right - i 是关键：
如果镜像回文超出了当前大回文的左边界，
超出部分无法保证对称，必须逐字符重新验证
```

**3. 下标转换错误**

```java
// t 中下标 i → 原串下标 (i - p[i]) / 2
// 最长回文子串起始位置 = (center - p[center]) / 2
```

## 十、思考题

1. 为什么 Manacher 是 O(n)？尽管有“扩展”操作，但 right 只增不减——这和 KMP 的均摎分析有什么相似之处？
2. 如果只用中心扩展法，最坏情况是什么输入？（提示：全相同字符）
3. 能否用 Manacher 的 p 数组解决“最长回文子序列”？为什么？（提示：子序列 vs 子串）

> 练习推荐：先用中心扩展法完成 [LC 5]，理解后再实现 Manacher 版本对比性能。
