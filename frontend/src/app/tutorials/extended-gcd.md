# 扩展欧几里得与模逆元

扩展欧几里得算法（exgcd）在求 GCD 的同时得到贝祖系数 x, y 使 ax + by = gcd(a,b)。它是求解模逆元、线性同余方程的基础工具。

## 一、贝祖定理

对任意整数 a, b，存在整数 x, y 使得：

```
ax + by = gcd(a, b)
```

## 二、扩展欧几里得算法

### 递归推导

```
gcd(a, b) = gcd(b, a mod b)

设 bx' + (a mod b)y' = gcd(b, a mod b)
   bx' + (a - ⌊a/b⌋·b)y' = gcd
   ay' + b(x' - ⌊a/b⌋·y') = gcd

所以: x = y', y = x' - ⌊a/b⌋·y'
```

### 实现

```java tab
// 返回 gcd(a, b)，同时 x, y 满足 ax + by = gcd(a,b)
long[] exgcd(long a, long b) {
    if (b == 0) return new long[]{a, 1, 0}; // gcd=a, x=1, y=0
    long[] res = exgcd(b, a % b);
    long gcd = res[0], x1 = res[1], y1 = res[2];
    long x = y1;
    long y = x1 - (a / b) * y1;
    return new long[]{gcd, x, y};
}
```

```typescript tab
// 返回 [gcd, x, y]，满足 ax + by = gcd(a,b)
function exgcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
    if (b === 0n) return [a, 1n, 0n]; // gcd=a, x=1, y=0
    const [g, x1, y1] = exgcd(b, a % b);
    const x = y1;
    const y = x1 - (a / b) * y1;
    return [g, x, y];
}
```

```python tab
# 返回 (gcd, x, y)，满足 ax + by = gcd(a,b)
def exgcd(a: int, b: int) -> tuple:
    if b == 0:
        return a, 1, 0  # gcd=a, x=1, y=0
    g, x1, y1 = exgcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return g, x, y
```

### 迭代版本

```java tab
long[] exgcdIter(long a, long b) {
    long x0 = 1, y0 = 0, x1 = 0, y1 = 1;
    while (b != 0) {
        long q = a / b;
        long tmp = a % b; a = b; b = tmp;
        tmp = x0 - q * x1; x0 = x1; x1 = tmp;
        tmp = y0 - q * y1; y0 = y1; y1 = tmp;
    }
    return new long[]{a, x0, y0};
}
```

```typescript tab
function exgcdIter(a: bigint, b: bigint): [bigint, bigint, bigint] {
    let x0 = 1n, y0 = 0n, x1 = 0n, y1 = 1n;
    while (b !== 0n) {
        const q = a / b;
        [a, b] = [b, a % b];
        [x0, x1] = [x1, x0 - q * x1];
        [y0, y1] = [y1, y0 - q * y1];
    }
    return [a, x0, y0];
}
```

```python tab
def exgcd_iter(a: int, b: int) -> tuple:
    x0, y0, x1, y1 = 1, 0, 0, 1
    while b != 0:
        q = a // b
        a, b = b, a % b
        x0, x1 = x1, x0 - q * x1
        y0, y1 = y1, y0 - q * y1
    return a, x0, y0
```

## 三、模逆元

### 定义

a 关于模 m 的逆元 a⁻¹ 满足：a × a⁻¹ ≡ 1 (mod m)

### 存在条件

gcd(a, m) = 1（a 和 m 互质）

### 求法

**方法一：exgcd**

```java tab
long modInverse(long a, long m) {
    long[] res = exgcd(a, m);
    // res[0] = gcd = 1
    long x = res[1];
    return (x % m + m) % m; // 确保正数
}
```

```typescript tab
function modInverse(a: bigint, m: bigint): bigint {
    const [g, x] = exgcd(a, m);
    // g = 1
    return (x % m + m) % m; // 确保正数
}
```

```python tab
def mod_inverse(a: int, m: int) -> int:
    g, x, y = exgcd(a, m)
    # g = 1
    return (x % m + m) % m  # 确保正数
```

**方法二：费马小定理（m 为质数）**

```java tab
long modInverse(long a, long p) {
    return fastPow(a, p - 2, p); // a^(p-2) mod p
}
```

```typescript tab
function modInverse(a: bigint, p: bigint): bigint {
    return fastPow(a, p - 2n, p); // a^(p-2) mod p
}
```

```python tab
def mod_inverse(a: int, p: int) -> int:
    return fast_pow(a, p - 2, p)  # a^(p-2) mod p
```

### 对比

| 方法 | 条件 | 时间 |
|------|------|------|
| exgcd | gcd(a,m)=1 | O(log min(a,m)) |
| 费马小定理 | m 为质数 | O(log m) |
| 欧拉定理 | gcd(a,m)=1 | O(log φ(m)) |

## 四、线性同余方程

求解 ax ≡ c (mod m)：

1. g = gcd(a, m)
2. 若 c % g ≠ 0 → 无解
3. 否则：(a/g)x ≡ (c/g) (mod m/g)
4. 用 exgcd 求 (a/g) 关于 (m/g) 的逆元

```java tab
// 求 ax ≡ c (mod m) 的最小正整数解
long solveCongruence(long a, long c, long m) {
    long g = gcd(a, m);
    if (c % g != 0) return -1; // 无解
    a /= g; c /= g; m /= g;
    long inv = modInverse(a, m);
    return (c * inv % m + m) % m;
}
```

```typescript tab
// 求 ax ≡ c (mod m) 的最小正整数解
function solveCongruence(a: bigint, c: bigint, m: bigint): bigint {
    const g = gcd(a, m);
    if (c % g !== 0n) return -1n; // 无解
    a /= g; c /= g; m /= g;
    const inv = modInverse(a, m);
    return (c * inv % m + m) % m;
}
```

```python tab
# 求 ax ≡ c (mod m) 的最小正整数解
def solve_congruence(a: int, c: int, m: int) -> int:
    g = gcd(a, m)
    if c % g != 0:
        return -1  # 无解
    a //= g
    c //= g
    m //= g
    inv = mod_inverse(a, m)
    return (c * inv % m + m) % m
```

## 五、应用

| 场景 | 说明 |
|------|------|
| 组合数取模 | C(n,k) = n! / (k!(n-k)!) → 用逆元 |
| 中国剩余定理 | 合并同余方程需要逆元 |
| RSA 加密 | 求私钥 = 公钥的模逆元 |
| 分数取模 | a/b mod p = a × b⁻¹ mod p |

## 六、面试要点

1. **exgcd 模板**：递归三行，必须熟练
2. **逆元存在条件**：gcd(a, m) = 1
3. **费马小定理**：p 为质数时 a^(p-2) ≡ a⁻¹
4. **负数处理**：`(x % m + m) % m`
5. **LeetCode**：无直接题，但组合数取模（118、509 变体）需要

## 七、exgcd 递归过程模拟

以 `exgcd(30, 12)` 求 30x + 12y = gcd(30,12) = 6 为例：

```
exgcd(30, 12):  30 = 12*2 + 6   → 先递归 exgcd(12, 6)
  exgcd(12, 6):  12 = 6*2 + 0    → 先递归 exgcd(6, 0)
    exgcd(6, 0): b=0 → 返回 x=1, y=0   （6*1 + 0*0 = 6）
  回溯：由 6*1 + 0*0 = 6 和 0 = 12 - 6*2
        6 = 30 - 12*2 代入…
        x' = 0, y' = 1 - 2*0 = 1   → 12*0 + 6*1 = 6
回溯：由 12*0 + 6*1 = 6 和 6 = 30 - 12*2
      6 = 30*1 + 12*(-2)
      x = 1, y = 0 - 2*1 = -2

验证：30*1 + 12*(-2) = 30 - 24 = 6 = gcd(30,12) ✓
```

**回溯代换的核心公式**：

```
已知：b*x' + (a mod b)*y' = gcd
而：  a mod b = a - (a/b)*b
代入：b*x' + (a - (a/b)*b)*y' = gcd
整理：a*y' + b*(x' - (a/b)*y') = gcd
∴ x = y',  y = x' - (a/b)*y'
```

## 八、从 exgcd 到逆元

```python tab
# 求 a 关于模 m 的逆元（要求 gcd(a,m)=1）
def mod_inverse(a: int, m: int) -> int:
    g, x, _ = exgcd(a, m)
    assert g == 1, "逆元不存在"
    return (x % m + m) % m  # 调整为最小正整数

# 应用：计算 (b / a) mod m = b * a⁻¹ mod m
# 除法在模意义下转化为乘逆元，这是组合数取模的基础
```

**两种求逆元方式对比**：

| 方式 | 条件 | 复杂度 | 适用 |
|------|------|--------|------|
| exgcd | gcd(a,m)=1（m 不必是质数） | O(log m) | 通用 |
| 费马小定理 a^(p-2) | m 必须是质数 | O(log p) | 竞赛常用（代码短） |

## 九、思考题

1. 为什么 `ax ≡ 1 (mod m)` 有解的充要条件是 gcd(a, m) = 1？如果 gcd(a,m) = d > 1 会怎样？（提示：ax - 1 必须是 m 的倍数）
2. exgcd 求出的 (x, y) 不是唯一的，如何求出 x 的最小正整数解？（提示：x + k*(m/d)）
3. 费马小定理为什么要求模数是质数？对合数模它为什么不成立？（提示：a^(p-1) ≡ 1 依赖欧拉定理）

> 练习推荐：先掌握 [数论基础](/tutorials/number-theory) 中的快速幂，再体会逆元在组合数取模中的应用。
