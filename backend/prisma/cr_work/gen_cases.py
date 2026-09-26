# -*- coding: utf-8 -*-
"""为 37 题生成中等规模、确定性的测试输入（按 slug 播种）。
格式严格对齐 cr_ref 各 solve_* 的解析器。generate_input(type, seed) -> input_text。"""
import random, sys, os, subprocess, tempfile, json

def _seed(slug):
    s = 0
    for i, c in enumerate(slug):
        s = (s * 131 + ord(c) + i) & 0x7fffffff
    return s

def generate_input(t, slug):
    rnd = random.Random(_seed(slug))
    if t == 'heap':
        n = 1500
        a = [rnd.randint(0, 10**9) for _ in range(n)]
        return f"{n}\n" + ' '.join(map(str, a))
    if t == 'almost-bst':
        n = 1500
        a = random.Random(_seed(slug) + 1).sample(range(1, 10**9), n)
        return f"{n}\n" + ' '.join(map(str, a))
    if t == 'pseudobst':
        rng = 4000; m = 1500
        lines = [f"{rng} {m}"]
        for _ in range(m):
            ct = rnd.randint(1, 3)
            if ct == 3:
                x = rnd.randint(0, rng); y = rnd.randint(0, rng)
                if x > y: x, y = y, x
                lines.append(f"3 {x} {y}")
            else:
                x = rnd.randint(0, rng)
                lines.append(f"{ct} {x}")
        return '\n'.join(lines)
    if t == 'segtree':
        n = 4000; m = 1500
        lines = [f"{n} {m}"]
        for _ in range(m):
            op = rnd.randint(1, 4)
            x = rnd.randint(0, n - 1); y = rnd.randint(x + 1, n)
            lines.append(f"{op} {x} {y}")
        return '\n'.join(lines)
    if t in ('trie', 'triepractice'):
        n = 1500
        lines = [f"{n}"]
        alpha = 'abcdefghijklmnopqrstuvwxyz'
        for _ in range(n):
            op = rnd.choice([1, 1, 2, 3, 4] if t == 'triepractice' else [1, 1, 2, 3])
            L = rnd.randint(1, 8)
            w = ''.join(rnd.choice(alpha) for _ in range(L))
            lines.append(f"{op} {w}")
        return '\n'.join(lines)
    if t == 'blocklist':
        n = 1500; m = 1500
        init = [rnd.randint(-(10**9), 10**9) for _ in range(n)]
        lines = [f"{n}", ' '.join(map(str, init)), f"{m}"]
        L = n
        for _ in range(m):
            r = rnd.random()
            if r < 0.45 and L >= 1:           # op1 get
                p = rnd.randint(1, L)
                lines.append(f"1 {p}")
            elif r < 0.8:                      # op2 insert
                p = rnd.randint(1, L + 1); k = rnd.randint(1, 5)
                vals = ' '.join(str(rnd.randint(-(10**9), 10**9)) for _ in range(k))
                lines.append(f"2 {p} {k} {vals}"); L += k
            else:                              # op3 delete
                if L < 1:
                    p = rnd.randint(1, L + 1); k = rnd.randint(1, 3)
                    vals = ' '.join(str(rnd.randint(-(10**9), 10**9)) for _ in range(k))
                    lines.append(f"2 {p} {k} {vals}"); L += k; continue
                p = rnd.randint(1, L); q = rnd.randint(p, L)
                lines.append(f"3 {p} {q}"); L -= (q - p + 1)
        return '\n'.join(lines)
    if t == 'skiplist':
        n = 4000; m = 4000
        lines = [f"{n} {m}"]
        for _ in range(m):
            op = rnd.choice([1, 2, 3])
            x = rnd.randint(0, 10**9)
            lines.append(f"{op} {x}")
        return '\n'.join(lines)
    if t == 'ufs':
        n = 5000; m = 4000
        lines = [f"{n} {m}"]
        for _ in range(m):
            op = rnd.choice([1, 2])
            a = rnd.randint(0, n - 1); b = rnd.randint(0, n - 1)
            lines.append(f"{op} {a} {b}")
        return '\n'.join(lines)
    if t == 'balanced-bst':
        n = 1500
        a = random.Random(_seed(slug) + 7).sample(range(1, 10**9), n)
        return f"{n}\n" + ' '.join(map(str, a))
    if t == 'transport':
        N = 30; M = 80
        nodes = list(range(N))
        edges = []
        # 保证连通：链 0-1-2-...-N-1
        for i in range(N - 1):
            edges.append((i, i + 1))
        while len(edges) < M:
            f = rnd.randint(0, N - 1); to = rnd.randint(0, N - 1)
            if f != to:
                edges.append((f, to))
        edges = edges[:M]
        path_type = rnd.randint(1, 4)
        budget = round(rnd.uniform(50, 500), 2)
        def hm():
            h = rnd.randint(0, 23); mm = rnd.randint(0, 59)
            return f"{h:02d}:{mm:02d}"
        lines = [f"{N} {M} 0 {N-1} {path_type} {budget:.2f}"]
        lines.append(hm())
        for f, to in edges:
            length = rnd.randint(1, 100); speed = rnd.randint(30, 120)
            toll = round(rnd.uniform(0, 50), 2)
            win = f"{hm()}~{hm()}"
            lines.append(f"{f} {to} {length} {speed} {toll:.2f} {win}")
        return '\n'.join(lines)
    if t == 'eight-puzzle':
        # 从目标态随机游走 K 步生成可解起始态（K 由 slug 播种，25~50 步）
        r2 = random.Random(_seed(slug) * 7919 + 13)
        state = [1, 2, 3, 4, 5, 6, 7, 8, 0]
        K = 25 + r2.randint(0, 25)
        for _ in range(K):
            z = state.index(0); r, c = divmod(z, 3)
            cand = []
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < 3 and 0 <= nc < 3:
                    cand.append(nr * 3 + nc)
            nz = r2.choice(cand)
            state[z], state[nz] = state[nz], state[z]
        return ' '.join(map(str, state))
    if t == 'fifteen-puzzle':
        # 从目标态随机游走 20~30 步（浅混乱，保证 IDA* 求解轻量）
        r2 = random.Random(_seed(slug) * 104729 + 17)
        state = list(range(1, 16)) + [0]
        K = 20 + r2.randint(0, 10)
        for _ in range(K):
            z = state.index(0); r, c = divmod(z, 4)
            cand = []
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < 4 and 0 <= nc < 4:
                    cand.append(nr * 4 + nc)
            nz = r2.choice(cand)
            state[z], state[nz] = state[nz], state[z]
        return ' '.join(map(str, state))
    if t == 'stick':
        # 构造 K 根等长 L 的原始棒，每根含一段 >L/2 的「大段」→ 答案确定为 L
        r2 = random.Random(_seed(slug) * 65537 + 29)
        L = r2.randint(10, 30)
        K = r2.randint(3, 6)
        segs = []
        for _ in range(K):
            big = r2.randint(L // 2 + 1, L - 1)
            rest = L - big
            parts = [big]
            if rest >= 2:
                x1 = r2.randint(1, rest - 1)
                parts.append(x1); parts.append(rest - x1)
            else:
                parts.append(rest)
            segs.extend(parts)
        r2.shuffle(segs)
        return f"{len(segs)}\n" + ' '.join(map(str, segs))
    if t in ('knapsack01', 'knapsackmulti'):
        maxc = 500; n = 30
        lines = [f"{maxc} {n}"]
        for _ in range(n):
            c = rnd.randint(1, 100); w = rnd.randint(1, 100)
            lines.append(f"{c} {w}")
        return '\n'.join(lines)
    if t == 'numbercombine':
        n = 30
        a = [rnd.randint(1, 100) for _ in range(n)]
        return f"{n}\n" + ' '.join(map(str, a))
    if t == 'jump':
        n = 40; k = n // 3
        # 随机采样禁止位置，但保证不出现连续 3 个（步长最大 3，3 连会阻断 DP）。
        # n 控制在 40：方案数约 10^10，TS number / Java long 均不溢出。
        cand = list(range(1, n))
        r2 = random.Random(_seed(slug) * 31 + 7)
        r2.shuffle(cand)
        bset = set()
        for x in cand:
            if len(bset) >= k:
                break
            # 双向检查：x 加入后不得在任何 3 连窗口 (x-2,x-1,x / x-1,x,x+1 / x,x+1,x+2) 内
            if (x - 1 in bset and x - 2 in bset) or (x - 1 in bset and x + 1 in bset) or (x + 1 in bset and x + 2 in bset):
                continue
            bset.add(x)
        banned = sorted(bset)
        return f"{n} {len(banned)}\n" + ' '.join(map(str, banned))
    if t == 'maxsquare':
        n = 25; m = 30
        rows = [' '.join(str(rnd.randint(0, 1)) for _ in range(m)) for _ in range(n)]
        return f"{n} {m}\n" + '\n'.join(rows)
    if t == 'divisible':
        m = 3
        lines = [f"{m}"]
        for _ in range(m):
            n = 20; k = rnd.randint(3, 12)
            nums = [rnd.randint(-100, 100) for _ in range(n)]
            lines.append(f"{n} {k}")
            lines.append(' '.join(map(str, nums)))
        return '\n'.join(lines)
    if t == 'wordbreak':
        # 自定义 stdin：s / n / 词表。随机拼词表词（80% 可拆），或替换中间词为随机串（20% 不可拆）
        alpha = 'abcdefghijklmnopqrstuvwxyz'
        n_words = rnd.randint(5, 8)
        words = [''.join(rnd.choice(alpha) for _ in range(rnd.randint(1, 6))) for _ in range(n_words)]
        k = rnd.randint(2, 4)
        s = ''.join(rnd.choice(words) for _ in range(k))
        if rnd.random() < 0.2:
            pos = rnd.randint(1, len(s) - 2)
            s = s[:pos] + ''.join(rnd.choice(alpha) for _ in range(3)) + s[pos + 3:]
        lines = [s, str(n_words)] + words
        return '\n'.join(lines)
    if t == 'changevolume':
        n = 20; begin = 50; maxl = 100
        c = [rnd.randint(1, 30) for _ in range(n)]
        return f"{n} {begin} {maxl}\n" + ' '.join(map(str, c))
    if t == 'stonejump':
        l = 10000; n = 25; m = rnd.randint(2, 8)
        d = sorted(rnd.sample(range(1, l), n))
        return f"{l} {n} {m}\n" + '\n'.join(map(str, d))
    if t == 'sortthree':
        n = 40
        a = [rnd.choice([1, 2, 3]) for _ in range(n)]
        return f"{n}\n" + ' '.join(map(str, a))
    if t == 'machinefactory':
        n = 30; s = 5
        lines = [f"{n} {s}"]
        for _ in range(n):
            p = rnd.randint(10, 100); y = rnd.randint(1, 50)
            lines.append(f"{p} {y}")
        return '\n'.join(lines)
    if t == 'segmentation':
        n = 30; m = rnd.randint(3, 10)
        a = [rnd.randint(1, 100) for _ in range(n)]
        return f"{n} {m}\n" + ' '.join(map(str, a))
    if t == 'islandescape':
        m = rnd.randint(0, 400); s = rnd.randint(100, 2000); tt = rnd.randint(10, 50)
        return f"{m} {s} {tt}"
    if t == 'bookcopy':
        m = 30; k = rnd.randint(3, 8)
        b = [rnd.randint(1, 100) for _ in range(m)]
        return f"{m} {k}\n" + ' '.join(map(str, b))
    if t == 'buyinghay':
        n = 20; h = 300
        lines = [f"{n} {h}"]
        for _ in range(n):
            p = rnd.randint(10, 80); c = rnd.randint(5, 200)
            lines.append(f"{p} {c}")
        return '\n'.join(lines)
    if t in ('disease', 'disease2'):
        n = 15; m = 3
        lines = [f"{n} {m}"]
        for v in range(1, n + 1):
            # 随机 0~4 个邻居（无重、无自环），保证简单图
            deg = rnd.randint(0, 4)
            nbs = rnd.sample([x for x in range(1, n + 1) if x != v], min(deg, n - 1))
            lines.append((str(len(nbs)) + ('' if not nbs else ' ' + ' '.join(map(str, nbs)))))
        init = rnd.sample(range(1, n + 1), m)
        lines.extend(map(str, init))
        return '\n'.join(lines)
    if t == 'div13':
        # 随机计数使总个数 ≤ 7，且至少一个 1-9 的计数 > 0（保证首位可选）
        a = [0] * 10
        total = 0
        while total < 1:
            a = [0] * 10
            for _ in range(rnd.randint(1, 7)):
                a[rnd.randint(1, 9)] += 1   # 只给 1-9 计数，避免全 0
            total = sum(a)
        return ' '.join(map(str, a))
    if t == 'graphtraversal':
        n = 8
        # 保证连通：先建 0-1-2-...-7 链，再随机加边
        edges = set()
        for i in range(n - 1):
            edges.add((min(i, i + 1), max(i, i + 1)))
        extra = rnd.randint(0, 6)
        for _ in range(extra):
            x = rnd.randint(0, n - 1); y = rnd.randint(0, n - 1)
            if x != y:
                edges.add((min(x, y), max(x, y)))
        lines = [f"{n} {len(edges)}"]
        for x, y in sorted(edges):
            lines.append(f"{x} {y}")
        return '\n'.join(lines)
    if t == 'lights':
        # 从全亮状态反向随机按灯生成可达初始态
        st = [1] * 9
        r2 = random.Random(_seed(slug) * 977 + 41)
        for _ in range(r2.randint(0, 12)):
            op = r2.randint(0, 8)
            st[op] = 1 - st[op]
            if op % 3 != 0: st[op - 1] = 1 - st[op - 1]
            if op % 3 != 2: st[op + 1] = 1 - st[op + 1]
            if op > 2: st[op - 3] = 1 - st[op - 3]
            if op < 6: st[op + 3] = 1 - st[op + 3]
        return '\n'.join(' '.join(map(str, st[i:i + 3])) for i in range(0, 9, 3))
    if t == 'linecover':
        m = rnd.randint(4, 7); n = rnd.randint(4, 7)
        point = [1]
        for _ in range(m - 1):
            point.append(point[-1] + rnd.randint(2, 8))
        length = [rnd.randint(3, 15) for _ in range(n)]
        return f"{m} {n}\n" + ' '.join(map(str, point)) + '\n' + ' '.join(map(str, length))
    if t == 'permutation':
        return str(rnd.randint(2, 6))
    if t == 'wordsequence':
        # 生成一条「每步加一个字符」的覆盖链 + 若干随机干扰词
        n_words = rnd.randint(6, 10)
        chain_len = rnd.randint(3, min(6, n_words))
        cur = [rnd.choice('abcde') for _ in range(rnd.randint(2, 3))]
        chain = [''.join(cur)]
        for _ in range(chain_len - 1):
            ch = rnd.choice('abcde')
            cur.insert(rnd.randint(0, len(cur)), ch)
            chain.append(''.join(cur))
        words = chain[:]
        while len(words) < n_words:
            w = ''.join(rnd.choice('abcdef') for _ in range(rnd.randint(1, 5)))
            words.append(w)
        rnd.shuffle(words)
        return '\n'.join(words)
    if t == 'cornfield':
        m = 8; n = 8
        rows = [' '.join('1' if rnd.random() < 0.8 else '0' for _ in range(n)) for _ in range(m)]
        return f"{m} {n}\n" + '\n'.join(rows)
    if t == 'compression':
        # 构造含循环重复块的字符串（保证有压缩空间）
        parts = []
        for _ in range(rnd.randint(2, 4)):
            unit = ''.join(rnd.choice('abc') for _ in range(rnd.randint(1, 3)))
            parts.append(unit * rnd.randint(2, 4))
        s = ''.join(parts)
        return s
    if t == 'uniquechar':
        n = rnd.randint(20, 50)
        return ''.join(rnd.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(n))
    if t == 'regexp':
        # 构造 s（相同字符块拼接），p 按块生成可匹配模式（块长>1 必须用 c*）
        blocks = []
        s = ''
        for _ in range(rnd.randint(3, 5)):
            ch = rnd.choice('abc')
            cnt = rnd.randint(1, 3)
            s += ch * cnt
            blocks.append((ch, cnt))
        p = ''
        for ch, cnt in blocks:
            mode = rnd.random()
            if mode < 0.5 or cnt > 1:
                p += ch + '*'
            elif rnd.random() < 0.3:
                p += '.'
            else:
                p += ch
        if rnd.random() < 0.2:
            # 破坏：插入不匹配的模式
            pos = rnd.randint(0, len(p))
            p = p[:pos] + (rnd.choice('xyz') + '*') + p[pos:]
        return s + '\n' + p
    if t == 'frog':
        # 递增石头：60% 从起点构造可达序列，40% 随机（可能不可达）
        if rnd.random() < 0.6:
            stones = [0]
            k = 1
            while len(stones) < 12:
                nk = k + rnd.choice([-1, 0, 1])
                if nk <= 0:
                    nk = 1
                k = nk
                stones.append(stones[-1] + k)
            n = len(stones)
        else:
            n = rnd.randint(6, 12)
            stones = [0]
            for _ in range(n - 1):
                stones.append(stones[-1] + rnd.randint(1, 10))
        return f"{n}\n" + ' '.join(map(str, stones))
    if t == 'barnpainting':
        n = 20; k = 3
        lines = [f"{n} {k}"]
        for v in range(2, n + 1):
            parent = rnd.randint(1, v - 1)
            lines.append(f"{parent} {v}")
        nodes = rnd.sample(range(1, n + 1), k)
        for x in nodes:
            lines.append(f"{x} {rnd.randint(1, 3)}")
        return '\n'.join(lines)
    if t == 'caterpillar':
        n = 30
        lines = [f"{n} {n - 1}"]
        for v in range(2, n + 1):
            parent = rnd.randint(1, v - 1)
            lines.append(f"{parent} {v}")
        return '\n'.join(lines)
    if t == 'chocolate':
        n = 15; m = 15
        rows = [' '.join('0' if rnd.random() < 0.3 else str(rnd.randint(-50, 100)) for _ in range(m)) for _ in range(n)]
        return f"{n} {m}\n" + '\n'.join(rows)
    if t == 'invader':
        total = 2
        lines = [f"{total}"]
        for _ in range(total):
            n = 8
            lines.append(f"{n}")
            for _ in range(n):
                a = rnd.randint(0, 550); b = rnd.randint(a + 1, 600)
                d = rnd.randint(1, 100)
                lines.append(f"{a} {b} {d}")
        return '\n'.join(lines)
    if t == 'king':
        n = rnd.randint(3, 5); k = rnd.randint(2, 6)
        return f"{n} {k}"
    if t == 'palinpath':
        n = rnd.randint(6, 10)
        if rnd.random() < 0.7:
            # 全同字符 → 保证回文路径丰富（expected 非 0）
            ch = rnd.choice('ABCD')
            lines = [str(n)] + [ch * n for _ in range(n)]
        else:
            lines = [str(n)] + [''.join(rnd.choice('ABCD') for _ in range(n)) for _ in range(n)]
        return '\n'.join(lines)
    if t == 'stonegamev':
        n = rnd.randint(10, 18)
        return ' '.join(str(rnd.randint(1, 100)) for _ in range(n))
    raise ValueError("unknown type " + t)

# ---------- 自验（run as script）----------
if __name__ == '__main__':
    sys.path.insert(0, os.path.dirname(__file__))
    import cr_ref as R
    import cr_solutions as S
    PY = '/Users/xiaoye/.workbuddy/binaries/python/versions/3.13.12/bin/python3'
    draft = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'coderepo-problems.draft.json'), encoding='utf-8'))
    from collections import Counter
    fails = []
    for p in draft:
        slug = p['slug']; t = R.type_of(slug)
        inp = generate_input(t, slug)
        try:
            exp = R.solve(slug, inp)
        except Exception as e:
            fails.append(('GEN/cr_ref', slug, repr(e)[:120])); continue
        with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False, encoding='utf-8') as f:
            f.write(S.SOL_PY[t]); fp = f.name
        try:
            r = subprocess.run([PY, fp], input=inp, capture_output=True, text=True, timeout=60)
            got = r.stdout
            if r.returncode != 0: got = 'ERR:' + r.stderr[:120]
        except subprocess.TimeoutExpired:
            got = 'TIMEOUT'
        os.unlink(fp)
        if got.strip() != exp.strip():
            fails.append(('SOL_PY', slug, got[:60], exp[:60]))
    print("generated+verified:", len(draft) - len(fails), "/", len(draft))
    for f in fails:
        print("FAIL", f)
