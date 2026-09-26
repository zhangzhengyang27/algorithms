# 快速幂与矩阵快速幂

快速幂将 O(n) 的幂运算优化为 O(log n)。矩阵快速幂进一步将线性递推的 O(n) 求解优化为 O(k³ log n)，是竞赛和面试中的高频技巧。

## 一、快速幂

```mermaid
graph LR
  A[幂运算] --> B[二进制分解]
  B --> C["O(log n) 快速幂"]
  C --> D[矩阵版: 线性递推]
```

### 原理

利用二进制分解指数：

```
a^13 = a^(1101₂) = a^8 × a^4 × a^1
```

### 实现

```java tab
long fastPow(long base, long exp, long mod) {
    long result = 1;
    base %= mod;
    while (exp > 0) {
        if ((exp & 1) == 1) {
            result = result * base % mod;
        }
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}
```

```typescript tab
function fastPow(base: number, exp: number, mod: number): number {
    let result = 1n;
    let b = BigInt(base) % BigInt(mod);
    let e = BigInt(exp);
    const m = BigInt(mod);
    while (e > 0n) {
        if (e & 1n) result = result * b % m;
        b = b * b % m;
        e >>= 1n;
    }
    return Number(result);
}
```

```python tab
def fast_pow(base: int, exp: int, mod: int) -> int:
    result = 1
    base %= mod
    while exp > 0:
        if exp & 1:
            result = result * base % mod
        base = base * base % mod
        exp >>= 1
    return result
```

### 应用

- 模幂运算：`a^b mod p`
- 模逆元：`a^(p-2) mod p`（费马小定理，p 为质数）
- 快速计算大数幂

## 二、矩阵快速幂

### 适用场景

线性递推：f(n) = c₁f(n-1) + c₂f(n-2) + ... + cₖf(n-k)

构造转移矩阵 A，使：

```
[f(n)]       [f(n-1)]
[f(n-1)] = A × [f(n-2)]
[...  ]       [...  ]
```

则 f(n) = A^(n-k) × [f(k), f(k-1), ..., f(1)]ᵀ

### 矩阵乘法

```java tab
long[][] multiply(long[][] A, long[][] B, long mod) {
    int n = A.length;
    long[][] C = new long[n][n];
    for (int i = 0; i < n; i++)
        for (int k = 0; k < n; k++) {
            if (A[i][k] == 0) continue;
            for (int j = 0; j < n; j++) {
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % mod;
            }
        }
    return C;
}
```

```typescript tab
function multiply(A: bigint[][], B: bigint[][], mod: bigint): bigint[][] {
    const n = A.length;
    const C: bigint[][] = Array.from({ length: n }, () => new Array(n).fill(0n));
    for (let i = 0; i < n; i++)
        for (let k = 0; k < n; k++) {
            if (A[i][k] === 0n) continue;
            for (let j = 0; j < n; j++) {
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % mod;
            }
        }
    return C;
}
```

```python tab
def multiply(A: list, B: list, mod: int) -> list:
    n = len(A)
    C = [[0] * n for _ in range(n)]
    for i in range(n):
        for k in range(n):
            if A[i][k] == 0:
                continue
            for j in range(n):
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % mod
    return C
```

### 矩阵快速幂

```java tab
long[][] matPow(long[][] base, long exp, long mod) {
    int n = base.length;
    long[][] result = new long[n][n];
    for (int i = 0; i < n; i++) result[i][i] = 1; // 单位矩阵

    while (exp > 0) {
        if ((exp & 1) == 1) result = multiply(result, base, mod);
        base = multiply(base, base, mod);
        exp >>= 1;
    }
    return result;
}
```

```typescript tab
function matPow(base: bigint[][], exp: bigint, mod: bigint): bigint[][] {
    const n = base.length;
    let result: bigint[][] = Array.from({ length: n }, () => new Array(n).fill(0n));
    for (let i = 0; i < n; i++) result[i][i] = 1n; // 单位矩阵

    let b = base;
    let e = exp;
    while (e > 0n) {
        if (e & 1n) result = multiply(result, b, mod);
        b = multiply(b, b, mod);
        e >>= 1n;
    }
    return result;
}
```

```python tab
def mat_pow(base: list, exp: int, mod: int) -> list:
    n = len(base)
    result = [[0] * n for _ in range(n)]
    for i in range(n):
        result[i][i] = 1  # 单位矩阵

    while exp > 0:
        if exp & 1:
            result = multiply(result, base, mod)
        base = multiply(base, base, mod)
        exp >>= 1
    return result
```

## 三、经典例题

### 斐波那契数列（O(log n)）

```
f(n) = f(n-1) + f(n-2)

转移矩阵:
A = |1 1|
    |1 0|

[f(n)  ] = A^(n-1) × [f(1)]
[f(n-1)]              [f(0)]
```

```java tab
long fib(long n, long mod) {
    if (n <= 1) return n;
    long[][] A = {{1, 1}, {1, 0}};
    long[][] An = matPow(A, n - 1, mod);
    return An[0][0]; // f(1)=1, f(0)=0
}
```

```typescript tab
function fib(n: number, mod: bigint): bigint {
    if (n <= 1) return BigInt(n);
    const A: bigint[][] = [[1n, 1n], [1n, 0n]];
    const An = matPow(A, BigInt(n - 1), mod);
    return An[0][0]; // f(1)=1, f(0)=0
}
```

```python tab
def fib(n: int, mod: int) -> int:
    if n <= 1:
        return n
    A = [[1, 1], [1, 0]]
    An = mat_pow(A, n - 1, mod)
    return An[0][0]  # f(1)=1, f(0)=0
```

### 爬楼梯变体

f(n) = f(n-1) + f(n-2) + f(n-3)，构造 3×3 矩阵。

### 矩阵加速 DP

状态转移是线性的 → 矩阵快速幂。

## 四、复杂度

| 操作 | 时间 |
|------|------|
| 快速幂 | O(log n) |
| k×k 矩阵乘法 | O(k³) |
| 矩阵快速幂 | O(k³ log n) |
| 斐波那契 | O(log n)（k=2） |

## 五、注意事项

1. **取模**：每步乘法后取模，防溢出
2. **long 溢出**：两个 10⁹ 相乘超 int，用 long
3. **单位矩阵**：矩阵快速幂的初始值
4. **n=0 边界**：A⁰ = I（单位矩阵）

## 六、面试要点

1. **快速幂模板**：必须 O(log n) 秒写
2. **矩阵构造**：递推式 → 转移矩阵
3. **费马小定理**：a^(p-2) ≡ a⁻¹ (mod p)
4. **LeetCode**：50（Pow(x,n)）、372（超级次方）、1137（第 N 个泰波那契数）、509（斐波那契数）

## 七、矩阵快速幂求斐波那契模拟

求 F(10)，转移矩阵 `A = [[1,1],[1,0]]`，初始向量 `[F(1), F(0)] = [1, 0]`：

```
递推关系：[F(n+1)]   [1 1] [F(n)  ]
          [F(n)  ] = [1 0] [F(n-1)]

∴ [F(n+1), F(n)]ᵀ = Aⁿ × [F(1), F(0)]ᵀ = Aⁿ × [1, 0]ᵀ

快速幂计算 A¹⁰（n=10 = 二进制 1010）：
  result = I, base = A
  10 = 1010₂:
    位0=0: base = A²
    位1=1: result = A², base = A⁴
    位2=0: base = A⁸
    位3=1: result = A² × A⁸ = A¹⁰

共 log₂(10) ≈ 4 次矩阵乘法，而非递推的 10 次
当 n = 10¹⁸ 时，递推不可行，矩阵快速幂仅需 ~60 次乘法

A¹⁰ = [[89, 55], [55, 34]]
F(10) = A¹⁰[0][0]*F(1) + A¹⁰[0][1]*F(0) = 89*1 + 55*0 = 55 ✓
```

**从递推式到转移矩阵的通用方法**：

```
递推：f(n) = c₁f(n-1) + c₂f(n-2) + … + cₖf(n-k)

转移矩阵（k×k，友矩阵）：
  [c₁ c₂ c₃ … cₖ]
  [1  0  0  … 0 ]
  [0  1  0  … 0 ]
  […………………]
  [0  0  … 1  0 ]

例：泰波那契 f(n)=f(n-1)+f(n-2)+f(n-3)
  → [[1,1,1],[1,0,0],[0,1,0]]
```

## 八、思考题

1. 为什么矩阵快速幂能把 O(n) 递推优化到 O(k³ log n)？k 是什么？（提示：k 是转移矩阵的阶数）
2. 如果递推式带常数项（如 f(n) = 2f(n-1) + 1），如何构造转移矩阵？（提示：增加一维存常数 1）
3. LC 372 超级次方要求 a^b mod 1337，b 以数组形式给出，为什么不能先算出 b 再快速幂？（提示：b 可能超过任何整数类型）

> 练习推荐：先掌握 [数论基础](/tutorials/number-theory) 中的快速幂模板，再挑战 LC 1137。
