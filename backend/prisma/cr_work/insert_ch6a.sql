-- INSERT ch6 第一批 5 题。幂等可重跑。
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '玉米田（Corn Field）', 'cr-cornfield', 'MEDIUM',
  $crbBDAe5Cf$# 玉米田（Corn Field）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 6 Advanced Dynamic Programming（高级动态规划）。难度：MEDIUM。标签：dp, state-compression, matrix。

## 题目描述
农场主有一块 $m \times n$ 的玉米地，每个格子肥沃（1）或贫瘠（0）。他要在**肥沃**的格子上种玉米，且**任意两个种玉米的格子不能上下或左右相邻**（共边即冲突）。求有多少种种植方案（可以不种），结果对 $10^8$ 取模。

## 输入格式
第一行两个整数 $m, n$；
接下来 $m$ 行，每行 $n$ 个整数（$0$ 或 $1$，$1$ 为肥沃）。

## 输出格式
一行一个整数：方案数 $\bmod 10^8$。

## 数据范围
$1 \le m \le 12$，$1 \le n \le 12$。

## 思路提示
- 状态压缩 DP：每行用一个 $n$ 位二进制串表示「哪些列种了」，预处理所有**无相邻 1** 的状态。
- 转移：本行状态不能与贫瘠位重叠，也不能与上一行状态有同一列（上下相邻）。
$crbBDAe5Cf$,
  $cr0A3E1e62$[{"input": "8 8\n1 1 1 1 1 1 1 1\n0 1 1 0 1 1 1 1\n1 1 0 1 0 1 1 1\n0 1 1 1 1 1 1 0\n1 0 1 1 1 1 1 1\n1 1 1 1 1 1 0 1\n1 1 1 1 0 0 1 1\n0 1 1 0 1 1 1 0", "output": "1284128"}]$cr0A3E1e62$::jsonb,
  $crDbE5056D${"typescript": "// 玉米田：状压 DP。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const m = data[0], n = data[1];\n  const field: number[] = [];\n  let idx = 2;\n  for (let r = 0; r < m; r++) {\n    let row = 0;\n    for (let j = 0; j < n; j++) { row = (row << 1) + (1 - data[idx++]); }\n    field.push(row);\n  }\n  const MOD = 100000000;\n  const states: number[] = [];\n  for (let s = 0; s < (1 << n); s++) if (!(s & (s << 1))) states.push(s);\n  const f: number[][] = Array.from({ length: m }, () => new Array(1 << n).fill(0));\n  for (const s of states) if (!(s & field[0])) f[0][s] = 1;\n  for (let r = 1; r < m; r++) {\n    for (const sj of states) {\n      if (f[r - 1][sj]) {\n        for (const sk of states) {\n          if ((sk & sj) || (sk & field[r])) continue;\n          f[r][sk] = (f[r][sk] + f[r - 1][sj]) % MOD;\n        }\n      }\n    }\n  }\n  let res = 0;\n  for (const s of states) res = (res + f[m - 1][s]) % MOD;\n  return String(res);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 玉米田：状压 DP 方案数（无相邻、不种贫瘠），MOD=1e8。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    m, n = int(data[0]), int(data[1])\n    field = []\n    idx = 2\n    for _ in range(m):\n        row = 0\n        for j in range(n):\n            v = int(data[idx]); idx += 1\n            row = (row << 1) + (1 - v)\n        field.append(row)\n    MOD = 100000000\n    states = [s for s in range(1 << n) if not (s & (s << 1))]\n    f = [[0] * (1 << n) for _ in range(m)]\n    for s in states:\n        if not (s & field[0]):\n            f[0][s] = 1\n    for r in range(1, m):\n        for sj in states:\n            if f[r - 1][sj]:\n                for sk in states:\n                    if (sk & sj) or (sk & field[r]):\n                        continue\n                    f[r][sk] = (f[r][sk] + f[r - 1][sj]) % MOD\n    print(sum(f[m - 1][s] for s in states) % MOD)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int m = sc.nextInt(), n = sc.nextInt();\n        int[] field = new int[m];\n        for (int r = 0; r < m; r++) {\n            int row = 0;\n            for (int j = 0; j < n; j++) row = (row << 1) + (1 - sc.nextInt());\n            field[r] = row;\n        }\n        final int MOD = 100000000;\n        List<Integer> states = new ArrayList<>();\n        for (int s = 0; s < (1 << n); s++) if ((s & (s << 1)) == 0) states.add(s);\n        int[][] f = new int[m][1 << n];\n        for (int s : states) if ((s & field[0]) == 0) f[0][s] = 1;\n        for (int r = 1; r < m; r++)\n            for (int sj : states) {\n                if (f[r - 1][sj] == 0) continue;\n                for (int sk : states) {\n                    if ((sk & sj) != 0 || (sk & field[r]) != 0) continue;\n                    f[r][sk] = (f[r][sk] + f[r - 1][sj]) % MOD;\n                }\n            }\n        int res = 0;\n        for (int s : states) res = (res + f[m - 1][s]) % MOD;\n        System.out.println(res);\n    }\n}\n"}$crDbE5056D$::jsonb,
  $cr4FaDDF61$[{"input": "8 8\n1 0 0 1 1 1 1 1\n1 1 1 1 1 1 1 1\n0 1 1 0 1 1 1 1\n1 0 0 0 1 1 1 1\n1 0 0 1 1 1 1 1\n1 1 1 0 0 1 1 1\n1 1 1 1 1 0 0 1\n1 1 1 0 1 1 1 0", "expected": "22044448"}, {"input": "8 8\n1 1 1 1 1 1 1 0\n1 0 0 1 0 0 1 1\n1 1 1 1 1 1 1 1\n1 1 1 1 1 1 1 1\n1 1 1 1 1 1 1 1\n1 1 0 1 1 1 1 1\n1 1 1 1 1 1 1 1\n1 1 1 1 0 1 1 0", "expected": "33565164"}, {"input": "8 8\n1 1 1 1 1 1 1 1\n0 1 0 1 0 1 0 1\n1 1 1 1 1 0 1 1\n1 0 1 1 1 1 0 0\n1 1 1 1 1 0 1 1\n1 1 1 1 1 1 0 1\n1 1 1 1 1 0 1 0\n0 1 0 1 0 1 0 1", "expected": "93481920"}]$cr4FaDDF61$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crF1dC041E$["dp", "state-compression", "matrix"]$crF1dC041E$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '字符串压缩（String Compression）', 'cr-compression', 'HARD',
  $crdEa01eD7$# 字符串压缩（String Compression）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 6 Advanced Dynamic Programming（高级动态规划）。难度：HARD。标签：dp, interval-dp, string。

## 题目描述
给定一个字符串 $s$，可以用「$\text{次数}(\text{内容})$」的形式压缩连续重复片段：若某个子串是基本片段的整数次重复，可写成 `次数(基本片段)`，其中 `次数` 是十进制数字。压缩可以嵌套。

例如 `abcabcabc` 可压缩为 `3(abc)`。求 $s$ 压缩后的**最短长度**。

## 输入格式
一行一个字符串 $s$（小写字母）。

## 输出格式
一行一个整数：最短压缩长度。

## 数据范围
$1 \le |s| \le 100$。

## 思路提示
- 区间 DP：`f[i][j]` = 子串 $s[i..j]$ 的最短压缩长度；先按分割点合并，再尝试整段压缩。
- 判断重复：枚举基本片段端点，验证 $s[i..j]$ 是否为其循环重复；压缩代价 = 基本片段压缩长度 + 括号 2 + 次数位数。
$crdEa01eD7$,
  $crf49b966D$[{"input": "acacacaccacaccaccaccacca", "output": "15"}]$crf49b966D$::jsonb,
  $crbbCE3e3e${"typescript": "// 字符串压缩：区间 DP。\nfunction solve(input: string): string {\n  const s = input.trim().split(/\\s+/)[0];\n  const n = s.length;\n  const f: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let i = 0; i < n; i++) f[i][i] = 1;\n  const isRepeat = (left: number, mid: number, right: number): boolean => {\n    if (mid < Math.floor((left + right + 1) / 2)) {\n      const t = mid + 1 - left;\n      if ((right - mid) % t !== 0) return false;\n      for (let i = 0; i < right - mid; i++) if (s[mid + 1 + i] !== s[left + (i % t)]) return false;\n    } else {\n      const t = right - mid;\n      if ((mid + 1 - left) % t !== 0) return false;\n      for (let i = 0; i <= mid - left; i++) if (s[left + i] !== s[mid + 1 + (i % t)]) return false;\n    }\n    return true;\n  };\n  const calcLen = (left: number, mid: number, right: number): number => {\n    let base: number, times: number;\n    if (mid < Math.floor((left + right + 1) / 2)) {\n      base = f[left][mid];\n      times = Math.floor((right - left + 1) / (mid - left + 1));\n    } else {\n      base = f[mid + 1][right];\n      times = Math.floor((right - left + 1) / (right - mid));\n    }\n    return base + 3 + (times >= 10 ? 1 : 0) + (times >= 100 ? 1 : 0);\n  };\n  for (let len = 1; len < n; len++) {\n    for (let i = 0; i < n - len; i++) {\n      const j = i + len;\n      f[i][j] = len + 1;\n      for (let k = i; k < j; k++) {\n        const v = f[i][k] + f[k + 1][j];\n        if (v < f[i][j]) f[i][j] = v;\n        if (isRepeat(i, k, j)) {\n          const v2 = calcLen(i, k, j);\n          if (v2 < f[i][j]) f[i][j] = v2;\n        }\n      }\n    }\n  }\n  return String(f[0][n - 1]);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 字符串压缩：区间 DP，k(内容) 循环压缩。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    s = data[0]\n    n = len(s)\n    f = [[0] * n for _ in range(n)]\n    for i in range(n):\n        f[i][i] = 1\n    def is_repeat(left, mid, right):\n        if mid < (left + right + 1) // 2:\n            t = mid + 1 - left\n            if (right - mid) % t != 0:\n                return False\n            for i in range(right - mid):\n                if s[mid + 1 + i] != s[left + (i % t)]:\n                    return False\n        else:\n            t = right - mid\n            if (mid + 1 - left) % t != 0:\n                return False\n            for i in range(mid - left + 1):\n                if s[left + i] != s[mid + 1 + (i % t)]:\n                    return False\n        return True\n    def calc_len(left, mid, right):\n        if mid < (left + right + 1) // 2:\n            base = f[left][mid]\n            times = (right - left + 1) // (mid - left + 1)\n        else:\n            base = f[mid + 1][right]\n            times = (right - left + 1) // (right - mid)\n        return base + 3 + (1 if times >= 10 else 0) + (1 if times >= 100 else 0)\n    for length in range(1, n):\n        for i in range(n - length):\n            j = i + length\n            f[i][j] = length + 1\n            for k in range(i, j):\n                v = f[i][k] + f[k + 1][j]\n                if v < f[i][j]:\n                    f[i][j] = v\n                if is_repeat(i, k, j):\n                    v2 = calc_len(i, k, j)\n                    if v2 < f[i][j]:\n                        f[i][j] = v2\n    print(f[0][n - 1])\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    static String s;\n    static int[][] f;\n    static boolean isRepeat(int left, int mid, int right) {\n        if (mid < (left + right + 1) / 2) {\n            int t = mid + 1 - left;\n            if ((right - mid) % t != 0) return false;\n            for (int i = 0; i < right - mid; i++) if (s.charAt(mid + 1 + i) != s.charAt(left + (i % t))) return false;\n        } else {\n            int t = right - mid;\n            if ((mid + 1 - left) % t != 0) return false;\n            for (int i = 0; i <= mid - left; i++) if (s.charAt(left + i) != s.charAt(mid + 1 + (i % t))) return false;\n        }\n        return true;\n    }\n    static int calcLen(int left, int mid, int right) {\n        int base, times;\n        if (mid < (left + right + 1) / 2) {\n            base = f[left][mid];\n            times = (right - left + 1) / (mid - left + 1);\n        } else {\n            base = f[mid + 1][right];\n            times = (right - left + 1) / (right - mid);\n        }\n        return base + 3 + (times >= 10 ? 1 : 0) + (times >= 100 ? 1 : 0);\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        s = sc.next();\n        int n = s.length();\n        f = new int[n][n];\n        for (int i = 0; i < n; i++) f[i][i] = 1;\n        for (int len = 1; len < n; len++) {\n            for (int i = 0; i < n - len; i++) {\n                int j = i + len;\n                f[i][j] = len + 1;\n                for (int k = i; k < j; k++) {\n                    int v = f[i][k] + f[k + 1][j];\n                    if (v < f[i][j]) f[i][j] = v;\n                    if (isRepeat(i, k, j)) {\n                        int v2 = calcLen(i, k, j);\n                        if (v2 < f[i][j]) f[i][j] = v2;\n                    }\n                }\n            }\n        }\n        System.out.println(f[0][n - 1]);\n    }\n}\n"}$crbbCE3e3e$::jsonb,
  $crB3fd4EFe$[{"input": "ccccacacacacccc", "expected": "12"}, {"input": "ccccabaabaaba", "expected": "10"}, {"input": "accaccbabbabbabbabcaacaaaa", "expected": "20"}]$crB3fd4EFe$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crBc103Ea7$["dp", "interval-dp", "string"]$crBc103Ea7$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '唯一字符计数（Unique Letter String）', 'cr-uniquechar', 'MEDIUM',
  $cr50d99B8A$# 唯一字符计数（Unique Letter String）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 6 Advanced Dynamic Programming（高级动态规划）。难度：MEDIUM。标签：dp, contribution, string。

## 题目描述
给定一个由**大写字母**组成的字符串 $s$。对 $s$ 的每个连续子串，统计其中**恰好出现一次**的字符个数，求所有子串的这个统计值之和，结果对 $10^9+7$ 取模。

## 输入格式
一行一个字符串 $s$（大写字母 `A-Z`）。

## 输出格式
一行一个整数：所有子串「唯一字符数」之和 $\bmod 10^9+7$。

## 数据范围
$1 \le |s| \le 10^5$。

## 思路提示
- 贡献法：字符 $c$ 对答案的贡献 = 包含它且它只出现一次的子串数 =（它上次出现位置到它的距离）×（它到下次出现位置的距离）。
- 对每种字符记录所有出现位置，累加即可 $O(n)$。
$cr50d99B8A$,
  $cr623330ac$[{"input": "TDLEVWBFKJZBMJZXDPPICMZYGFEFEMNDB", "output": "3387"}]$cr623330ac$::jsonb,
  $cra3A887B9${"typescript": "// 唯一字符计数：贡献法。\nfunction solve(input: string): string {\n  const s = input.trim().split(/\\s+/)[0];\n  const MOD = 1000000007;\n  const n = s.length;\n  const pos: number[][] = Array.from({ length: 26 }, () => []);\n  for (let i = 0; i < n; i++) pos[s.charCodeAt(i) - 65].push(i);\n  let res = 0;\n  for (const arr of pos) {\n    for (let k = 0; k < arr.length; k++) {\n      const i = arr[k];\n      const left = i - (k > 0 ? arr[k - 1] : -1);\n      const right = (k + 1 < arr.length ? arr[k + 1] : n) - i;\n      res = (res + left * right) % MOD;\n    }\n  }\n  return String(res);\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 唯一字符计数：贡献法（上次/下次出现位置）。\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    s = data[0]\n    MOD = 1000000007\n    n = len(s)\n    pos = [[] for _ in range(26)]\n    for i, ch in enumerate(s):\n        pos[ord(ch) - 65].append(i)\n    res = 0\n    for arr in pos:\n        for k, i in enumerate(arr):\n            left = i - (arr[k - 1] if k > 0 else -1)\n            right = (arr[k + 1] if k + 1 < len(arr) else n) - i\n            res = (res + left * right) % MOD\n    print(res)\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        final int MOD = 1000000007;\n        int n = s.length();\n        List<List<Integer>> pos = new ArrayList<>();\n        for (int i = 0; i < 26; i++) pos.add(new ArrayList<>());\n        for (int i = 0; i < n; i++) pos.get(s.charAt(i) - 'A').add(i);\n        long res = 0;\n        for (List<Integer> arr : pos) {\n            for (int k = 0; k < arr.size(); k++) {\n                int i = arr.get(k);\n                int left = i - (k > 0 ? arr.get(k - 1) : -1);\n                int right = (k + 1 < arr.size() ? arr.get(k + 1) : n) - i;\n                res = (res + (long) left * right) % MOD;\n            }\n        }\n        System.out.println(res);\n    }\n}\n"}$cra3A887B9$::jsonb,
  $crb8fB7d1f$[{"input": "UWJEMHXINBQHZJAGIVFZJVNKFACZVOCOZPXXO", "expected": "4130"}, {"input": "VRZNIXAIZLPEMLFFLBLCRR", "expected": "1164"}, {"input": "GAXYBZOCTXCWTNPYFRQGPCNUWTPEEDJYTVSVKMB", "expected": "5656"}]$crb8fB7d1f$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crc9125aA5$["dp", "contribution", "string"]$crc9125aA5$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '正则匹配（RegExp Match）', 'cr-regexp-match', 'MEDIUM',
  $crB5AfEda1$# 正则匹配（RegExp Match）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 6 Advanced Dynamic Programming（高级动态规划）。难度：MEDIUM。标签：dp, string, regex。

## 题目描述
实现支持 `.` 和 `*` 的正则表达式匹配，判断字符串 $s$ 是否完全匹配模式 $p$：
- `.` 匹配任意单个字符；
- `*` 匹配它**前面那个字符**出现 $0$ 次或多次（如 `a*` 匹配空、`a`、`aa`…）。

每次出现 `*` 时，它前面必须有一个有效字符；匹配必须覆盖整个 $s$。

## 输入格式
第一行：字符串 $s$；
第二行：模式 $p$。均由小写字母、`.`、`*` 组成。

## 输出格式
一行：`1`（匹配）或 `0`（不匹配）。

## 数据范围
$1 \le |s| \le 20$，$1 \le |p| \le 30$。

## 思路提示
- DP：`f[i][j]` = $s$ 前 $i$ 个字符与 $p$ 前 $j$ 个字符是否匹配；`.` 直接转移，`*` 枚举它重复的字符次数。
$crB5AfEda1$,
  $cr1407ff91$[{"input": "bbbcbc\nb*b*c*b*c", "output": "1"}]$cr1407ff91$::jsonb,
  $crFeDE231a${"typescript": "// 正则匹配：LeetCode 10。\nfunction solve(input: string): string {\n  const lines = input.trim().split(/\\n/);\n  const s = lines[0].trim(), p = lines[1].trim();\n  const m = s.length, n = p.length;\n  const f: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));\n  f[0][0] = true;\n  let i = 1;\n  while (i < n && p[i] === '*') { f[0][i + 1] = true; i += 2; }\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (j < n && p[j] === '*') continue;\n      const c = p[j - 1];\n      if (c === '.') {\n        f[i][j] = f[i - 1][j - 1];\n      } else if (c === '*') {\n        let k = i;\n        while (k >= 0) {\n          if (f[k][j - 2]) { f[i][j] = true; break; }\n          if (k === 0) break;\n          if (p[j - 2] !== '.' && s[k - 1] !== p[j - 2]) break;\n          k--;\n        }\n      } else {\n        f[i][j] = f[i - 1][j - 1] && s[i - 1] === p[j - 1];\n      }\n    }\n  }\n  return f[m][n] ? '1' : '0';\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 正则匹配：LeetCode 10（. 单字符，* 前字符 0+ 次）。\nimport sys\n\ndef main():\n    lines = sys.stdin.read().strip().split('\\n')\n    if len(lines) < 2:\n        return\n    s = lines[0].strip()\n    p = lines[1].strip()\n    m, n = len(s), len(p)\n    f = [[False] * (n + 1) for _ in range(m + 1)]\n    f[0][0] = True\n    i = 1\n    while i < n and p[i] == '*':\n        f[0][i + 1] = True\n        i += 2\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if j < n and p[j] == '*':\n                continue\n            c = p[j - 1]\n            if c == '.':\n                f[i][j] = f[i - 1][j - 1]\n            elif c == '*':\n                k = i\n                while k >= 0:\n                    if f[k][j - 2]:\n                        f[i][j] = True\n                        break\n                    if k == 0:\n                        break\n                    if p[j - 2] != '.' and s[k - 1] != p[j - 2]:\n                        break\n                    k -= 1\n            else:\n                f[i][j] = f[i - 1][j - 1] and (s[i - 1] == p[j - 1])\n    print('1' if f[m][n] else '0')\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        String p = sc.nextLine();\n        int m = s.length(), n = p.length();\n        boolean[][] f = new boolean[m + 1][n + 1];\n        f[0][0] = true;\n        int i = 1;\n        while (i < n && p.charAt(i) == '*') { f[0][i + 1] = true; i += 2; }\n        for (i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (j < n && p.charAt(j) == '*') continue;\n                char c = p.charAt(j - 1);\n                if (c == '.') {\n                    f[i][j] = f[i - 1][j - 1];\n                } else if (c == '*') {\n                    int k = i;\n                    while (k >= 0) {\n                        if (f[k][j - 2]) { f[i][j] = true; break; }\n                        if (k == 0) break;\n                        if (p.charAt(j - 2) != '.' && s.charAt(k - 1) != p.charAt(j - 2)) break;\n                        k--;\n                    }\n                } else {\n                    f[i][j] = f[i - 1][j - 1] && s.charAt(i - 1) == p.charAt(j - 1);\n                }\n            }\n        }\n        System.out.println(f[m][n] ? 1 : 0);\n    }\n}\n"}$crFeDE231a$::jsonb,
  $crE6FfB2C6$[{"input": "bbbc\nb*b*c", "expected": "1"}, {"input": "cbbbbbc\ncb*b*cy*", "expected": "1"}, {"input": "bbbcc\nb*cc", "expected": "1"}]$crE6FfB2C6$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($crd6226cE1$["dp", "string", "regex"]$crd6226cE1$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
INSERT INTO problems
(id, category_id, title, slug, difficulty, description_md, examples, solutions, test_cases, tags,
 time_limit, memory_limit, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'dynamic-programming'),
  '青蛙过河（Frog Crossing）', 'cr-frog', 'MEDIUM',
  $crbCF11bed$# 青蛙过河（Frog Crossing）

> 来源：《算法进阶》配套代码库（coderepo）· Chapter 6 Advanced Dynamic Programming（高级动态规划）。难度：MEDIUM。标签：dp, jump, reachability。

## 题目描述
一只青蛙要跳过一条河，河上有若干块石头（位置坐标严格递增，第一块在 $0$）。青蛙从第 $0$ 块石头出发，**第一步必须跳 1 个单位**；之后若上一次跳了 $k$ 个单位，则下一次只能跳 $k-1$、$k$ 或 $k+1$ 个单位。问能否跳到**最后一块石头**上（必须恰好落在石头上，不能落水）。

## 输入格式
第一行一个整数 $n$（石头数）；
第二行 $n$ 个递增整数：各石头位置（第一个为 $0$）。

## 输出格式
一行：`true` 或 `false`。

## 数据范围
$1 \le n \le 2\times10^3$，位置 $\le 2^{31}$。

## 思路提示
- 记忆化/DP：`dp[位置]` = 到达该石头时的可能跳距集合；每步扩展 $k\pm1, k$，只落回存在的石头。
- 起点 `dp[0] = {0}`；最后看目标石头的集合是否非空。
$crbCF11bed$,
  $crFaAB47c3$[{"input": "6\n0 2 6 10 20 23", "output": "false"}]$crFaAB47c3$::jsonb,
  $cr54f27caA${"typescript": "// 青蛙过河：dp[位置] = 跳距集合。\nfunction solve(input: string): string {\n  const data = input.trim().split(/\\s+/).map(Number);\n  const n = data[0];\n  const stones = data.slice(1, 1 + n);\n  if (n <= 1) return 'true';\n  const stoneSet = new Set<number>(stones);\n  const dp = new Map<number, Set<number>>();\n  dp.set(0, new Set([0]));\n  for (const x of stones) {\n    const ks = dp.get(x);\n    if (!ks) continue;\n    for (const k of ks) {\n      for (const nk of [k - 1, k, k + 1]) {\n        if (nk > 0 && stoneSet.has(x + nk)) {\n          if (!dp.has(x + nk)) dp.set(x + nk, new Set());\n          dp.get(x + nk)!.add(nk);\n        }\n      }\n    }\n  }\n  return dp.has(stones[n - 1]) && dp.get(stones[n - 1])!.size > 0 ? 'true' : 'false';\n}\n\nif (require.main === module) {\n  let buf = '';\n  process.stdin.on('data', d => buf += d);\n  process.stdin.on('end', () => console.log(solve(buf)));\n}\n", "python": "# 青蛙过河：dp[位置] = 可达跳距集合，判断能否到终点。\nimport sys\nfrom collections import defaultdict\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    stones = [int(x) for x in data[1:1 + n]]\n    if n <= 1:\n        print('true')\n        return\n    stone_set = set(stones)\n    dp = defaultdict(set)\n    dp[0] = {0}\n    for x in stones:\n        for k in dp[x]:\n            for nk in (k - 1, k, k + 1):\n                if nk > 0 and (x + nk) in stone_set:\n                    dp[x + nk].add(nk)\n    print('true' if dp[stones[-1]] else 'false')\n\nif __name__ == '__main__':\n    main()\n", "java": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long[] stones = new long[n];\n        for (int i = 0; i < n; i++) stones[i] = sc.nextLong();\n        if (n <= 1) { System.out.println(\"true\"); return; }\n        Set<Long> stoneSet = new HashSet<>();\n        for (long x : stones) stoneSet.add(x);\n        Map<Long, Set<Long>> dp = new HashMap<>();\n        dp.put(0L, new HashSet<>(Collections.singletonList(0L)));\n        for (long x : stones) {\n            Set<Long> ks = dp.get(x);\n            if (ks == null) continue;\n            for (long k : ks) {\n                for (long nk = k - 1; nk <= k + 1; nk++) {\n                    if (nk > 0 && stoneSet.contains(x + nk)) {\n                        dp.computeIfAbsent(x + nk, z -> new HashSet<>()).add(nk);\n                    }\n                }\n            }\n        }\n        Set<Long> t = dp.get(stones[n - 1]);\n        System.out.println(t != null && !t.isEmpty() ? \"true\" : \"false\");\n    }\n}\n"}$cr54f27caA$::jsonb,
  $crcc34DC23$[{"input": "12\n0 2 3 4 5 6 7 8 9 10 11 12", "expected": "false"}, {"input": "12\n0 1 2 3 5 8 10 13 15 18 22 26", "expected": "true"}, {"input": "12\n0 1 2 3 4 5 6 7 8 9 10 11", "expected": "true"}]$crcc34DC23$::jsonb,
  ARRAY(SELECT jsonb_array_elements_text($cr81a4EeAa$["dp", "jump", "reachability"]$cr81a4EeAa$::jsonb)),
  2000, 256, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id, title = EXCLUDED.title, difficulty = EXCLUDED.difficulty,
  description_md = EXCLUDED.description_md, examples = EXCLUDED.examples,
  solutions = EXCLUDED.solutions, test_cases = EXCLUDED.test_cases,
  tags = EXCLUDED.tags, time_limit = EXCLUDED.time_limit, updated_at = CURRENT_TIMESTAMP;
