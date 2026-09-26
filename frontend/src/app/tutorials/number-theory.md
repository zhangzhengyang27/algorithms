# 数论算法：GCD、素数与模运算




## 一、为什么学数论？

数论是算法竞赛和面试中的常见考点，涉及：
- **最大公约数 / 最小公倍数**
- **素数判定与筛法**
- **快速幂与模运算**
- **组合数学基础**

> 掌握这几个工具，能解决大量看似复杂的数学问题。

## 二、最大公约数（GCD）

### 2.1 辗转相除法（欧几里得算法）

```java tab
public int gcd(int a, int b) {
    while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
```

```typescript tab
function gcd(a: number, b: number): number {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}
```

```python tab
def gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a
```

- **时间**：O(log(min(a, b)))
- **原理**：`gcd(a, b) = gcd(b, a % b)`

### 2.2 最小公倍数（LCM）

```java tab
public int lcm(int a, int b) {
    return a / gcd(a, b) * b;   // 先除后乘防溢出
}
```

```typescript tab
function lcm(a: number, b: number): number {
    return (a / gcd(a, b)) * b;   // 先除后乘防溢出
}
```

```python tab
def lcm(a: int, b: int) -> int:
    return a // gcd(a, b) * b  # 先除后乘防溢出
```

### 2.3 应用

| 场景 | 用法 |
|------|------|
| 分数约分 | 分子分母同除 GCD |
| 周期问题 | 多个周期的公共周期 = LCM |
| 水壶问题 | 能否量出 z 升水 → z % gcd(x,y) == 0 |

## 三、素数（质数）

### 3.1 素数判定

```java tab
public boolean isPrime(int n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (int i = 5; (long) i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}
```

```typescript tab
function isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}
```

```python tab
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True
```

- **时间**：O(√n)
- **优化**：只检查 6k±1 形式的因子

### 3.2 埃拉托斯特尼筛法（Sieve）

求 [2, n] 内所有素数：

```java tab
public List<Integer> sieve(int n) {
    boolean[] isComposite = new boolean[n + 1];
    List<Integer> primes = new ArrayList<>();
    for (int i = 2; i <= n; i++) {
        if (!isComposite[i]) {
            primes.add(i);
            for (long j = (long) i * i; j <= n; j += i) {
                isComposite[(int) j] = true;
            }
        }
    }
    return primes;
}
```

```typescript tab
function sieve(n: number): number[] {
    const isComposite = new Array(n + 1).fill(false);
    const primes: number[] = [];
    for (let i = 2; i <= n; i++) {
        if (!isComposite[i]) {
            primes.push(i);
            for (let j = i * i; j <= n; j += i) {
                isComposite[j] = true;
            }
        }
    }
    return primes;
}
```

```python tab
def sieve(n: int) -> list:
    is_composite = [False] * (n + 1)
    primes = []
    for i in range(2, n + 1):
        if not is_composite[i]:
            primes.append(i)
            for j in range(i * i, n + 1, i):
                is_composite[j] = True
    return primes
```

- **时间**：O(n log log n)，**空间**：O(n)

### 3.3 线性筛（欧拉筛）

每个合数只被其最小质因子筛一次，严格 O(n)：

```java tab
public List<Integer> linearSieve(int n) {
    boolean[] isComposite = new boolean[n + 1];
    List<Integer> primes = new ArrayList<>();
    for (int i = 2; i <= n; i++) {
        if (!isComposite[i]) primes.add(i);
        for (int p : primes) {
            if ((long) i * p > n) break;
            isComposite[i * p] = true;
            if (i % p == 0) break;   // 关键：保证最小质因子
        }
    }
    return primes;
}
```

```typescript tab
function linearSieve(n: number): number[] {
    const isComposite = new Array(n + 1).fill(false);
    const primes: number[] = [];
    for (let i = 2; i <= n; i++) {
        if (!isComposite[i]) primes.push(i);
        for (const p of primes) {
            if (i * p > n) break;
            isComposite[i * p] = true;
            if (i % p === 0) break;   // 关键：保证最小质因子
        }
    }
    return primes;
}
```

```python tab
def linear_sieve(n: int) -> list:
    is_composite = [False] * (n + 1)
    primes = []
    for i in range(2, n + 1):
        if not is_composite[i]:
            primes.append(i)
        for p in primes:
            if i * p > n:
                break
            is_composite[i * p] = True
            if i % p == 0:
                break  # 关键：保证最小质因子
    return primes
```

## 四、快速幂

### 4.1 原理

将指数用二进制表示，逐位处理：

```text
x^13 = x^(1101) = x^8 · x^4 · x^1
```

### 4.2 模板

```java tab
public long fastPow(long base, long exp, long mod) {
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

- **时间**：O(log exp)

### 4.3 应用

| 场景 | 说明 |
|------|------|
| 大数取模 | `a^b % m` |
| 矩阵快速幂 | 加速递推（如斐波那契第 n 项） |
| 模逆元 | 费马小定理：`a^(p-2) % p`（p 为素数） |

## 五、模运算

### 5.1 基本性质

```text
(a + b) % m = ((a % m) + (b % m)) % m
(a * b) % m = ((a % m) * (b % m)) % m
(a - b) % m = ((a % m) - (b % m) + m) % m   // 防负数
```

> **注意**：除法不能直接取模！需要用**模逆元**。

### 5.2 模逆元（费马小定理）

当 p 为素数且 gcd(a, p) = 1 时：

```text
a^(-1) ≡ a^(p-2) (mod p)
```

```java tab
// 求 a 关于 mod 的逆元（mod 为素数）
long inv = fastPow(a, mod - 2, mod);
// 则 (b / a) % mod = (b * inv) % mod
```

```typescript tab
// 求 a 关于 mod 的逆元（mod 为素数）
const inv = fastPow(a, mod - 2, mod);
// 则 (b / a) % mod = (b * inv) % mod
```

```python tab
# 求 a 关于 mod 的逆元（mod 为素数）
inv = fast_pow(a, mod - 2, mod)
# 则 (b / a) % mod = (b * inv) % mod
```

### 5.3 组合数取模

```java tab
// 预处理阶乘和逆元
long[] fact = new long[n + 1];
long[] invFact = new long[n + 1];
fact[0] = 1;
for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
invFact[n] = fastPow(fact[n], MOD - 2, MOD);
for (int i = n - 1; i >= 0; i--) invFact[i] = invFact[i + 1] * (i + 1) % MOD;

// C(n, k) = fact[n] * invFact[k] * invFact[n-k] % MOD
long comb = fact[n] * invFact[k] % MOD * invFact[n - k] % MOD;
```

```typescript tab
// 预处理阶乘和逆元
const fact = new Array(n + 1).fill(0n);
const invFact = new Array(n + 1).fill(0n);
const MOD = 1000000007n;
fact[0] = 1n;
for (let i = 1; i <= n; i++) fact[i] = fact[i - 1] * BigInt(i) % MOD;
invFact[n] = fastPowBig(fact[n], MOD - 2n, MOD);
for (let i = n - 1; i >= 0; i--) invFact[i] = invFact[i + 1] * BigInt(i + 1) % MOD;

// C(n, k) = fact[n] * invFact[k] * invFact[n-k] % MOD
const comb = fact[n] * invFact[k] % MOD * invFact[n - k] % MOD;
```

```python tab
# 预处理阶乘和逆元
MOD = 10**9 + 7
fact = [0] * (n + 1)
inv_fact = [0] * (n + 1)
fact[0] = 1
for i in range(1, n + 1):
    fact[i] = fact[i - 1] * i % MOD
inv_fact[n] = fast_pow(fact[n], MOD - 2, MOD)
for i in range(n - 1, -1, -1):
    inv_fact[i] = inv_fact[i + 1] * (i + 1) % MOD

# C(n, k) = fact[n] * inv_fact[k] * inv_fact[n-k] % MOD
comb = fact[n] * inv_fact[k] % MOD * inv_fact[n - k] % MOD
```

## 六、其他数论工具

| 工具 | 用途 | 复杂度 |
|------|------|--------|
| 扩展欧几里得 | 求 ax + by = gcd(a,b) 的解 | O(log n) |
| 中国剩余定理 | 解同余方程组 | O(n log n) |
| 欧拉函数 φ(n) | 计数 [1,n] 中与 n 互质的数 | O(√n) |
| 分解质因数 | 将 n 写成质数之积 | O(√n) |

### 分解质因数

```java tab
public Map<Integer, Integer> factorize(int n) {
    Map<Integer, Integer> factors = new HashMap<>();
    for (int i = 2; (long) i * i <= n; i++) {
        while (n % i == 0) {
            factors.merge(i, 1, Integer::sum);
            n /= i;
        }
    }
    if (n > 1) factors.merge(n, 1, Integer::sum);
    return factors;
}
```

```typescript tab
function factorize(n: number): Map<number, number> {
    const factors = new Map<number, number>();
    for (let i = 2; i * i <= n; i++) {
        while (n % i === 0) {
            factors.set(i, (factors.get(i) || 0) + 1);
            n = Math.floor(n / i);
        }
    }
    if (n > 1) factors.set(n, (factors.get(n) || 0) + 1);
    return factors;
}
```

```python tab
def factorize(n: int) -> dict:
    factors = {}
    i = 2
    while i * i <= n:
        while n % i == 0:
            factors[i] = factors.get(i, 0) + 1
            n //= i
        i += 1
    if n > 1:
        factors[n] = factors.get(n, 0) + 1
    return factors
```

## 七、面试常见题

- 🟢 最大公约数、计数质数、2 的幂
- 🟡 超级丑数、第 N 个丑数、阶乘后的零
- 🟠 大数加法/乘法、Pow(x,n)、超级次方
- 🔴 求组合数、矩阵快速幂、密码学相关

## 八、调试技巧

1. **溢出**：乘法前先取模，或用 `long`。
2. **负数取模**：Java 中 `-7 % 3 = -1`，需要 `+ mod` 修正。
3. **边界**：`n = 0`、`n = 1` 时 GCD/素数判定的特殊处理。
4. **筛法上界**：`i * i <= n` 用 long 防溢出。
