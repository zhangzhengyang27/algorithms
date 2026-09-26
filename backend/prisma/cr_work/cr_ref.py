#!/usr/bin/env python3
# 37 题的确定性参考解（与最终写库的 solutions 字段的 Python 版逻辑一致）。
# 每类题型一个 solve 函数：输入 = .in 文本，输出 = .out 文本（即 expected）。
import sys, json
sys.setrecursionlimit(1000000)

# ---------- 1. 堆（小根堆排序 / Heap.cpp）----------
def solve_heap(inp: str) -> str:
    t = inp.split()
    n = int(t[0])
    a = list(map(int, t[1:1 + n]))
    import heapq
    heapq.heapify(a)
    return ' '.join(str(heapq.heappop(a)) for _ in range(n))

# ---------- 2. 近似平衡 BST（中序遍历 = 升序，Ch11 data/1..5）----------
def solve_almost_bst(inp: str) -> str:
    t = inp.split()
    n = int(t[0])
    a = list(map(int, t[1:1 + n]))
    # 中序遍历任意 BST 都是升序，故直接排序等价且确定
    return '\n'.join(str(x) for x in sorted(a))

# ---------- 3. 伪平衡 BST（区间计数 / PseudoBST.cpp）----------
def solve_pseudobst(inp: str) -> str:
    t = inp.split()
    rng = int(t[0]); m = int(t[1]); i = 2
    numberCount = [0] * (rng + 1)
    rangeCount = [0] * (rng + 1)
    out = []
    for _ in range(m):
        ct = int(t[i]); i += 1
        if ct == 1:
            x = int(t[i]); i += 1; numberCount[x] += 1; rangeCount[x] += 1
        elif ct == 2:
            x = int(t[i]); i += 1; numberCount[x] -= 1; rangeCount[x] -= 1
        elif ct == 3:
            x = int(t[i]); y = int(t[i + 1]); i += 2
            def ps(l, r, x, y):
                if l > r: return 0
                mid = (l + r) // 2
                if l == x and r == y: return rangeCount[mid]
                lc = rc = 0
                if x < mid: lc = ps(l, mid - 1, x, min(mid - 1, y))
                if y > mid: rc = ps(mid + 1, r, max(mid + 1, x), y)
                return lc + rc + ((mid >= x and mid <= y) * numberCount[mid])
            out.append(str(ps(0, rng - 1, x, y)))
    return '\n'.join(out)

# ---------- 4. 线段树（SegmentTree.cpp）----------
def solve_segtree(inp: str) -> str:
    t = inp.split()
    n = int(t[0]); m = int(t[1]); i = 2
    def build(l, r):
        node = {'l': l, 'r': r, 'covered': 0, 'count': 0, 'left': None, 'right': None}
        if r - l > 1:
            mid = (l + r) // 2
            node['left'] = build(l, mid); node['right'] = build(mid, r)
        return node
    def recalc(node):
        if node['left'] is None or node['right'] is None:
            node['count'] = node['covered'] * (node['r'] - node['l']); return
        if node['covered'] == 0:
            node['count'] = node['left']['count'] + node['right']['count']
        else:
            node['count'] = node['r'] - node['l']
    def backfill(node):
        if node['left'] is None or node['right'] is None: return
        delta = min(node['left']['covered'], node['right']['covered'])
        if delta:
            node['covered'] += delta
            node['left']['covered'] -= delta; node['right']['covered'] -= delta
            recalc(node['left']); recalc(node['right'])
        recalc(node)
    def insert(node, l, r):
        if l >= r: return
        L, R = node['l'], node['r']
        if L == l and R == r:
            node['covered'] += 1; node['count'] = r - l; return
        mid = (L + R) // 2
        if l < mid: insert(node['left'], l, min(mid, r))
        if r > mid: insert(node['right'], max(mid, l), r)
        backfill(node)
    def search(node, l, r):
        if l >= r: return 0
        L, R = node['l'], node['r']
        if L == l and R == r: return node['covered']
        mid = (L + R) // 2; res = 10**9
        if l < mid: res = min(res, search(node['left'], l, min(mid, r)))
        if r > mid: res = min(res, search(node['right'], max(mid, l), r))
        return res + node['covered']
    def delegate(node):
        node['left']['covered'] += node['covered']; node['right']['covered'] += node['covered']
        if node['covered'] > 0:
            node['left']['count'] = node['left']['r'] - node['left']['l']
            node['right']['count'] = node['right']['r'] - node['right']['l']
        node['covered'] = 0
    def delete(node, l, r):
        if l >= r: return
        L, R = node['l'], node['r']
        if L == l and R == r:
            node['covered'] -= 1
            if node['covered'] == 0:
                if node['left'] and node['right']:
                    node['count'] = node['left']['count'] + node['right']['count']
                else:
                    node['count'] = 0
            return
        delegate(node)
        mid = (L + R) // 2
        if l < mid: delete(node['left'], l, min(mid, r))
        if r > mid: delete(node['right'], max(mid, l), r)
        backfill(node)
    def calc(node, l, r):
        if l >= r: return 0
        L, R = node['l'], node['r']
        if L <= l and R >= r and node['covered'] > 0: return r - l
        if L == l and R == r: return node['count']
        mid = (L + R) // 2; res = 0
        if l < mid: res += calc(node['left'], l, min(mid, r))
        if r > mid: res += calc(node['right'], max(mid, l), r)
        return res
    root = build(0, n); out = []
    for _ in range(m):
        op = int(t[i]); x = int(t[i + 1]); y = int(t[i + 2]); i += 3
        if op == 1: insert(root, x, y)
        elif op == 2: out.append(str(search(root, x, y)))
        elif op == 3:
            if search(root, x, y) > 0: delete(root, x, y)
        elif op == 4: out.append(str(calc(root, x, y)))
    return '\n'.join(out)

# ---------- 5. 字典树（Trie.cpp：1插 2查 3删）----------
def solve_trie(inp: str) -> str:
    t = inp.split(); n = int(t[0]); i = 1; root = {}
    out = []
    for _ in range(n):
        op = int(t[i]); w = t[i + 1]; i += 2
        if op == 1:
            node = root
            for ch in w: node = node.setdefault(ch, {})
            node['#'] = True
        elif op == 2:
            node = root
            for ch in w:
                if ch not in node: node = None; break
                node = node[ch]
            out.append('Yes' if (node and node.get('#')) else 'No')
        elif op == 3:
            node = root; ok = True
            for ch in w:
                if ch not in node: ok = False; break
                node = node[ch]
            if ok and node.get('#'): node['#'] = False
    return '\n'.join(out)

# ---------- 6. 字典树练习（含 op4=前缀计数，重算 expected）----------
def solve_triepractice(inp: str) -> str:
    t = inp.split(); n = int(t[0]); i = 1; root = {}
    # 每个节点记录子树单词数（含自身 isWord）。用保留键避免与字母 'c' 撞键。
    C, W = '\x00', '\x01'
    def add(node, w, delta):
        for ch in w:
            node = node.setdefault(ch, {C: 0})
            node[C] += delta
        node[W] = (delta > 0)
    def count_prefix(w):
        node = root
        for ch in w:
            if ch not in node: return 0
            node = node[ch]
        return node.get(C, 0)
    out = []
    for _ in range(n):
        op = int(t[i]); w = t[i + 1]; i += 2
        if op == 1:
            add(root, w, 1)
        elif op == 2:
            node = root; ok = True
            for ch in w:
                if ch not in node: ok = False; break
                node = node[ch]
            out.append('Yes' if (ok and node.get(W)) else 'No')
        elif op == 3:
            node = root; ok = True
            for ch in w:
                if ch not in node: ok = False; break
                node = node[ch]
            if ok and node.get(W): add(root, w, -1)
        elif op == 4:
            out.append(str(count_prefix(w)))
    return '\n'.join(out)

# ---------- 7. 块状链表（blockList.cpp，O(sqrt n)）----------
def solve_blocklist(inp: str) -> str:
    t = inp.split(); n = int(t[0]); sqrtn = int(n ** 0.5)
    arr = list(map(int, t[1:1 + n])); i = 1 + n
    blocks = [arr[k:k + sqrtn] for k in range(0, n, sqrtn)]
    splitCounter = 0
    def get(pos):  # 1-indexed
        p = pos
        for b in blocks:
            if p <= len(b): return b[p - 1]
            p -= len(b)
        return -1
    def split_at(pos):  # 让“第 pos 个元素”处于某 block 末尾，返回该 block 下标
        p = pos; bi = 0
        for idx, b in enumerate(blocks):
            if p <= len(b): return idx
            p -= len(b); bi = idx
        return len(blocks) - 1
    out = []
    m = int(t[i]); i += 1
    for _ in range(m):
        op = int(t[i]); i += 1
        if op == 1:
            p = int(t[i]); i += 1; out.append(str(get(p)))
        elif op == 2:
            p = int(t[i]); k = int(t[i + 1]); i += 2
            vals = list(map(int, t[i:i + k])); i += k
            bi = split_at(p)            # pos 变成 block bi 末尾
            b = blocks[bi]
            if p > len(b):
                blocks[bi] = b + vals
            else:
                blocks[bi] = b[:p - 1] + vals + b[p - 1:]
            splitCounter += 1
        elif op == 3:
            p = int(t[i]); q = int(t[i + 1]); i += 2
            bi = split_at(p - 1)        # p-1 处于 block bi 末尾
            bj = split_at(q)            # q 处于 block bj 末尾
            del blocks[bi + 1:bj + 1]   # 删除中间 block
            splitCounter += 1
        if splitCounter >= sqrtn:
            nb = [blocks[0]] if blocks else [[]]
            for b in blocks[1:]:
                if nb and len(nb[-1]) + len(b) <= sqrtn: nb[-1] = nb[-1] + b
                else: nb.append(b)
            blocks[:] = nb
            splitCounter = 0
    if not blocks: blocks.append([])
    return '\n'.join(out)

# ---------- 8. 跳表（skipList.cpp，输出 Yes/No；成员关系确定）----------
def solve_skiplist(inp: str) -> str:
    t = inp.split(); n = int(t[0]); m = int(t[1]); i = 2
    s = set(); out = []
    for _ in range(m):
        op = int(t[i]); x = int(t[i + 1]); i += 2
        if op == 1: s.add(x)
        elif op == 2: out.append('Yes' if x in s else 'No')
        elif op == 3: s.discard(x)
    return '\n'.join(out)

# ---------- 9. 并查集（unionFindSet.cpp）----------
def solve_ufs(inp: str) -> str:
    t = inp.split(); n = int(t[0]); rep = list(range(n)); i = 1
    def find(a):
        while rep[a] != a:
            rep[a] = rep[rep[a]]; a = rep[a]
        return a
    out = []
    m = int(t[i]); i += 1
    for _ in range(m):
        op = int(t[i]); a = int(t[i + 1]); b = int(t[i + 2]); i += 3
        if op == 1: rep[find(a)] = find(b)
        elif op == 2: out.append('Yes' if find(a) == find(b) else 'No')
    return '\n'.join(out)

# ---------- 10. 平衡 BST（Ch10，统一为红黑树：中序 `val 颜色 深度` + 树高）----------
class _RB:
    __slots__ = ('val', 'color', 'p', 'l', 'r')
    def __init__(self, v):
        self.val = v; self.color = 1; self.p = self.l = self.r = None  # 1=Red
def _rotate(root, a):
    b = a.p
    if not b: return a
    if a == b.l:
        b.l = a.r
        if a.r: a.r.p = b
        a.r = b
    else:
        b.r = a.l
        if a.l: a.l.p = b
        a.l = b
    if b.p:
        if b == b.p.l: b.p.l = a
        else: b.p.r = a
    a.p = b.p; b.p = a
    return a if root == b else root
def _rb_insert(root, num):
    cur = root; prev = None
    while cur:
        prev = cur
        if cur.val >= num: cur = cur.l
        else: cur = cur.r
    node = _RB(num)
    if not prev: return node
    node.p = prev
    if prev.val >= node.val: prev.l = node
    else: prev.r = node
    return _rebalance(root, node)
def _rebalance(root, node):
    while True:
        parent = node.p
        if not parent: break
        if parent.color == 0: break
        gparent = parent.p
        if gparent is None:
            parent.color = 0; break
        uncle = gparent.r if parent == gparent.l else gparent.l
        if (not uncle) or uncle.color == 0:
            if (parent == gparent.l) ^ (node == parent.l):
                _rotate(root, node); tmp = node; node = parent; parent = tmp
            root = _rotate(root, parent); parent.color = 0; gparent.color = 1; break
        parent.color = 0; uncle.color = 0; gparent.color = 1; node = gparent
    return root
def _inorder(node, depth, out):
    if not node: return
    _inorder(node.l, depth + 1, out)
    out.append((node.val, 1 - node.color, depth))  # 输出：Red=0, Black=1
    _inorder(node.r, depth + 1, out)
def solve_balanced_bst(inp: str) -> str:
    t = inp.split(); n = int(t[0]); nums = list(map(int, t[1:1 + n]))
    root = None
    for v in nums: root = _rb_insert(root, v)
    out = []; _inorder(root, 1, out)
    maxd = max(d for _, _, d in out) if out else 0
    return '\n'.join(f"{v} {c} {d}" for v, c, d in out) + f"\n{maxd + 1}"

# ---------- 11. 工程实战：运输调度（Transport.cpp，A*）----------
def solve_transport(inp: str) -> str:
    lines = inp.strip().split('\n')
    def to_min(s):
        s = s.strip()
        return ((int(s[0]) * 10 + int(s[1])) * 60 + int(s[3]) * 10 + int(s[4]))
    def to_hm(m):
        h = m // 60; mm = m % 60
        return ('0' if h < 10 else '') + str(h) + ':' + ('0' if mm < 10 else '') + str(mm)
    N, M, start, end, path_type, budget = lines[0].split()
    N = int(N); M = int(M); start = int(start); end = int(end); path_type = int(path_type)
    budget = float(budget) * 100
    start_time = to_min(lines[1])
    graph = [[] for _ in range(N)]
    rgraph = [[] for _ in range(N)]
    for li in lines[2:2 + M]:
        f, to, length, speed, toll, win = li.split()
        f = int(f); to = int(to); length = int(length); speed = int(speed)
        toll = int(float(toll) * 100)
        ws, we = win.split('~')
        ps = to_min(ws); pe = to_min(we)
        e = {'from': f, 'to': to, 'length': length, 'speed': speed, 'toll': toll, 'ps': ps, 'pe': pe}
        graph[f].append(e); rgraph[to].append(e)
    MOD = 1440
    level = {}
    from collections import deque
    q = deque([end]); level[end] = 0
    while q:
        x = q.popleft()
        for e in rgraph[x]:
            if e['from'] not in level:
                level[e['from']] = level[x] + 1; q.append(e['from'])
    def next_arr(t, e):
        pt = (t + (e['length'] + 0.0) / e['speed'])
        if int(t) % MOD > e['pe']:
            return (t // MOD + 1) * MOD + e['ps'] + int(pt)
        return t + int(pt)
    import math
    def heur_time(u, arr):
        cur = u; t = arr
        while cur != end:
            best = -1; bt = 10**9
            for e in graph[cur]:
                if level.get(cur, 10**9) - level.get(e['to'], 10**9) == 1:
                    na = next_arr(t, e)
                    if best == -1 or na < bt: best = e['to']; bt = na
            cur = best; t = bt
        return t
    def heur_dist(u, dist):
        cur = u; d = dist
        while cur != end:
            best = -1; bd = 10**9
            for e in graph[cur]:
                if level.get(cur, 10**9) - level.get(e['to'], 10**9) == 1:
                    nd = d + e['length']
                    if best == -1 or nd < bd: best = e['to']; bd = nd
            cur = best; d = bd
        return d
    def heur_cost(u, cost):
        cur = u; c = cost
        while cur != end:
            best = -1; bc = 10**9
            for e in graph[cur]:
                if level.get(cur, 10**9) - level.get(e['to'], 10**9) == 1:
                    nc = c + e['toll']
                    if best == -1 or nc < bc: best = e['to']; bc = nc
            cur = best; c = bc
        return c
    class PN:
        __slots__ = ('point', 'arr', 'dist', 'cost', 'prev', 'ht', 'hd', 'hc')
        def __init__(self, p, arr, d, c, prev):
            self.point = p; self.arr = arr; self.dist = d; self.cost = c; self.prev = prev
            self.ht = self.hd = self.hc = 0
    arch = []
    def attr(pn, e):
        if path_type == 1: return next_arr(pn.arr, e)
        if path_type == 2: return pn.dist + e['length']
        if path_type == 3: return pn.cost + e['toll']
        if path_type == 4: return next_arr(pn.arr, e)
    def less(a, b):
        if path_type == 1: return a.ht > b.ht
        if path_type == 2: return a.hd > b.hd
        if path_type == 3:
            if a.hc > b.hc: return True
            if a.hc == b.hc and a.ht > b.ht: return True
            return False
        if path_type == 4: return a.ht > b.ht
        return False
    init = PN(start, start_time, 0, 0, -1)
    if path_type == 1: init.ht = heur_time(start, start_time)
    elif path_type == 2: init.hd = heur_dist(start, 0)
    elif path_type == 3: init.hc = heur_cost(start, 0); init.ht = heur_time(start, start_time)
    elif path_type == 4: init.ht = heur_time(start, start_time)
    pq = [init]
    def push(item):
        pq.append(item); 
        ci = len(pq) - 1
        while ci > 0:
            pi = (ci - 1) // 2
            if less(pq[ci], pq[pi]): pq[ci], pq[pi] = pq[pi], pq[ci]; ci = pi
            else: break
    def pop():
        top = pq[0]; pq[0] = pq[-1]; pq.pop()
        ci = 0; n = len(pq)
        while True:
            l = 2 * ci + 1; r = l + 1; sm = ci
            if l < n and less(pq[l], pq[sm]): sm = l
            if r < n and less(pq[r], pq[sm]): sm = r
            if sm == ci: break
            pq[ci], pq[sm] = pq[sm], pq[ci]; ci = sm
        return top
    hash_state = {}
    while pq:
        cur = pop(); arch.append(cur)
        if cur.point == end:
            path = [cur]
            while cur.prev != -1:
                cur = arch[cur.prev]; path.append(cur)
            res = []
            res.append(f"{to_hm(path[-1].arr)} {path[-1].dist} {path[-1].cost / 100:.2f}")
            res.append(str(len(path)))
            for nd in reversed(path):
                res.append(f"{nd.point} {to_hm(nd.arr)}")
            return '\n'.join(res)
        for e in graph[cur.point]:
            at = attr(cur, e)
            if e['to'] not in hash_state or hash_state[e['to']] > at:
                nxt = PN(e['to'], next_arr(cur.arr, e), cur.dist + e['length'], cur.cost + e['toll'], len(arch) - 1)
                if path_type == 4 and nxt.cost > budget: continue
                if path_type == 1: nxt.ht = heur_time(nxt.point, nxt.arr)
                elif path_type == 2: nxt.hd = heur_dist(nxt.point, nxt.dist)
                elif path_type == 3: nxt.hc = heur_cost(nxt.point, nxt.cost); nxt.ht = heur_time(nxt.point, nxt.arr)
                elif path_type == 4: nxt.ht = heur_time(nxt.point, nxt.arr)
                push(nxt); hash_state[nxt.point] = at
    return ''

# ---------- 12. 八数码（8Puzzle.cpp，BFS 最少步数；目标固定 123456780）----------
def solve_eight_puzzle(inp: str) -> str:
    t = inp.split()
    start = tuple(int(x) for x in t[:9])
    goal = (1, 2, 3, 4, 5, 6, 7, 8, 0)
    if start == goal:
        return 'Total steps: 0'
    from collections import deque
    q = deque([(start, 0)])
    seen = {start}
    while q:
        st, d = q.popleft()
        z = st.index(0)
        r, c = divmod(z, 3)
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < 3 and 0 <= nc < 3:
                nz = nr * 3 + nc
                lst = list(st)
                lst[z], lst[nz] = lst[nz], lst[z]
                ns = tuple(lst)
                if ns == goal:
                    return f'Total steps: {d + 1}'
                if ns not in seen:
                    seen.add(ns)
                    q.append((ns, d + 1))
    return 'Total steps: -1'

# ---------- 13. 十五数码（15Puzzle-AStar.cpp，IDA* 曼哈顿；目标固定 1..15,0）----------
def solve_fifteen_puzzle(inp: str) -> str:
    t = inp.split()
    start = tuple(int(x) for x in t[:16])
    goal = tuple(range(1, 16)) + (0,)
    if start == goal:
        return 'Total steps: 0'
    # 可解性：逆序对奇偶 与 空格到目标空格的行距差 一致（目标空格在最后一行）
    flat = [x for x in start if x != 0]
    inv = sum(1 for i in range(len(flat)) for j in range(i + 1, len(flat)) if flat[i] > flat[j])
    blank_row = start.index(0) // 4
    if (inv + (3 - blank_row)) % 2 != 0:
        return 'Total steps: -1'
    # 曼哈顿距离表 dist[value][pos]
    dist = [[0] * 16 for _ in range(16)]
    for v in range(16):
        gr, gc = divmod(v - 1 if v != 0 else 15, 4)
        for pos in range(16):
            pr, pc = divmod(pos, 4)
            dist[v][pos] = abs(gr - pr) + abs(gc - pc)
    def h(state):
        return sum(dist[state[i]][i] for i in range(16))
    DR = (-1, 1, 0, 0); DC = (0, 0, -1, 1)
    def ida(state, g, bound, prev):
        f = g + h(state)
        if f > bound:
            return f
        if state == goal:
            return 0  # 找到
        z = state.index(0); r, c = divmod(z, 4)
        minf = 10**9
        for d in range(4):
            if d == (prev ^ 1):
                continue  # 不回退
            nr, nc = r + DR[d], c + DC[d]
            if not (0 <= nr < 4 and 0 <= nc < 4):
                continue
            nz = nr * 4 + nc
            ns = list(state); ns[z], ns[nz] = ns[nz], ns[z]
            res = ida(tuple(ns), g + 1, bound, d)
            if res == 0:
                return 0
            if res < minf:
                minf = res
        return minf
    bound = h(start)
    while True:
        res = ida(start, 0, bound, -1)
        if res == 0:
            return f'Total steps: {bound}'
        bound = res

# ---------- 14. 木棒拼接（Stick-Pruning.cpp，DFS+剪枝求最短原始长度）----------
def solve_stick(inp: str) -> str:
    t = inp.split()
    n = int(t[0])
    a = sorted((int(x) for x in t[1:1 + n]), reverse=True)
    total = sum(a)
    if total == 0:
        return '0'
    def can(L):
        if total % L:
            return False
        K = total // L
        used = [False] * n
        def dfs(done, cur, start):
            if done == K - 1:
                return True
            if cur == L:
                return dfs(done + 1, 0, 0)
            prev = -1
            for i in range(start, n):
                if used[i] or a[i] == prev:
                    continue
                if cur + a[i] > L:
                    continue
                prev = a[i]
                used[i] = True
                if dfs(done, cur + a[i], i + 1):
                    return True
                used[i] = False
                if cur == 0 or cur + a[i] == L:
                    return False
            return False
        return dfs(0, 0, 0)
    for L in range(max(a), total // 2 + 1):
        if can(L):
            return str(L)
    return str(total)

# ---------- 15. 01 背包（Knapsack01.py）----------
def solve_knapsack01(inp: str) -> str:
    t = inp.split()
    maxc, n = int(t[0]), int(t[1])
    f = [-1] * (maxc + 1); f[0] = 0
    i = 2
    for _ in range(n):
        c, w = int(t[i]), int(t[i + 1]); i += 2
        for j in range(maxc - c, -1, -1):
            if f[j] > -1 and f[j] + w > f[j + c]:
                f[j + c] = f[j] + w
    return str(max(f))

# ---------- 16. 完全背包（KnapsackMulti.py，正序 j）----------
def solve_knapsackmulti(inp: str) -> str:
    t = inp.split()
    maxc, n = int(t[0]), int(t[1])
    f = [-1] * (maxc + 1); f[0] = 0
    i = 2
    for _ in range(n):
        c, w = int(t[i]), int(t[i + 1]); i += 2
        for j in range(maxc - c + 1):
            if f[j] > -1 and f[j] + w > f[j + c]:
                f[j + c] = f[j] + w
    return str(max(f))

# ---------- 17. 石子合并（NumberCombine.py，区间 DP）----------
def solve_numbercombine(inp: str) -> str:
    t = inp.split()
    n = int(t[0])
    a = [0] + [int(x) for x in t[1:1 + n]]
    s = [0] * (n + 1)
    for i in range(1, n + 1):
        s[i] = s[i - 1] + a[i]
    INF = 10 ** 18
    f = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            best = INF
            for k in range(i, j):
                v = f[i][k] + f[k + 1][j] + (s[k] - s[i - 1]) * (s[j] - s[k])
                if v < best:
                    best = v
            f[i][j] = best
    return str(f[1][n])

# ---------- 18. 爬楼梯（Jump.py，步长1-3，带禁止点）----------
def solve_jump(inp: str) -> str:
    t = inp.split()
    n = int(t[0])
    f = [0] * (n + 1)
    for x in t[2:]:
        f[int(x)] = -1
    if f[n] == -1:
        return '0'
    f[0] = 1
    for i in range(1, n + 1):
        if f[i] == -1:
            continue
        for j in range(1, 4):
            if i - j >= 0 and f[i - j] != -1:
                f[i] += f[i - j]
    return str(f[n])

# ---------- 19. 最大全1正方形（MaxSquare.cpp，DP）----------
def solve_maxsquare(inp: str) -> str:
    t = inp.split()
    n, m = int(t[0]), int(t[1])
    rect = [list(map(int, t[2 + i * m:2 + (i + 1) * m])) for i in range(n)]
    f = [[0] * (m + 1) for _ in range(n + 1)]
    res = 0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if rect[i - 1][j - 1] == 1:
                f[i][j] = min(f[i - 1][j], f[i][j - 1], f[i - 1][j - 1]) + 1
                if f[i][j] > res:
                    res = f[i][j]
    return str(res)

# ---------- 20. 整除判断（Divisible.cpp，DP 余数可达）----------
def solve_divisible(inp: str) -> str:
    t = inp.split()
    m = int(t[0]); i = 1; out = []
    for _ in range(m):
        n = int(t[i]); k = int(t[i + 1]); i += 2
        nums = [abs(int(x)) % k for x in t[i:i + n]]; i += n
        cur = [False] * k; cur[nums[0]] = True
        for x in nums[1:]:
            nxt = [False] * k
            for j in range(k):
                if cur[j]:
                    nxt[(j + x) % k] = True
                    nxt[(j - x) % k] = True
            cur = nxt
        out.append('Divisible' if cur[0] else 'Not divisible')
    return '\n'.join(out)

# ---------- 21. 单词拆分（WordBreak.cpp，自定义 stdin：s / n / 词表）----------
def solve_wordbreak(inp: str) -> str:
    lines = inp.strip().split('\n')
    s = lines[0].strip()
    n = int(lines[1].strip())
    words = [w.strip() for w in lines[2:2 + n]]
    if not s:
        return '1'
    m = len(s)
    ok = [False] * m
    for i in range(m):
        for w in words:
            t = len(w)
            if t == i + 1 or (t < i + 1 and ok[i - t]):
                if s[i - t + 1:i + 1] == w:
                    ok[i] = True
                    break
    return '1' if ok[m - 1] else '0'

# ---------- 22. 音量调节（ChangeVolume.py，DP 可达音量）----------
def solve_changevolume(inp: str) -> str:
    t = inp.split()
    n, begin, maxl = int(t[0]), int(t[1]), int(t[2])
    c = [int(x) for x in t[3:3 + n]]
    cur = [False] * (maxl + 1); cur[begin] = True
    for x in c:
        nxt = [False] * (maxl + 1)
        for lv in range(maxl + 1):
            if cur[lv]:
                if lv + x <= maxl:
                    nxt[lv + x] = True
                if lv - x >= 0:
                    nxt[lv - x] = True
        cur = nxt
    for lv in range(maxl, -1, -1):
        if cur[lv]:
            return str(lv)
    return '-1'

# ---------- 23. 跳石头（StoneJump.py，二分答案 + 贪心验证）----------
def solve_stonejump(inp: str) -> str:
    t = inp.split()
    l, n, m = int(t[0]), int(t[1]), int(t[2])
    d = [int(x) for x in t[3:3 + n]]
    if n == 0:
        return str(l)
    def cnt(gap):
        count = 0; prev = 0
        for x in d:
            if x - prev < gap:
                count += 1
            else:
                prev = x
        if l - d[-1] < gap:
            count += 1
        return count
    left, right, ans = 1, l, 0
    while left <= right:
        mid = (left + right) // 2
        if cnt(mid) <= m:
            ans = mid; left = mid + 1
        else:
            right = mid - 1
    return str(ans)

# ---------- 24. 三值排序（SortThreeValuedSequence.py，最少交换）----------
def solve_sortthree(inp: str) -> str:
    t = inp.split()
    n = int(t[0])
    a = [int(x) for x in t[1:1 + n]]
    c1 = sum(1 for x in a if x == 1)
    c2 = sum(1 for x in a if x == 2)
    x12 = sum(1 for i in range(c1) if a[i] == 2)
    x13 = sum(1 for i in range(c1) if a[i] == 3)
    x21 = sum(1 for i in range(c1, c1 + c2) if a[i] == 1)
    x23 = sum(1 for i in range(c1, c1 + c2) if a[i] == 3)
    x31 = sum(1 for i in range(c1 + c2, n) if a[i] == 1)
    x32 = sum(1 for i in range(c1 + c2, n) if a[i] == 2)
    direct = min(x12, x21) + min(x13, x31) + min(x23, x32)
    return str(direct + 2 * abs(x12 - x21))

# ---------- 25. 机器工厂（MachineFactory.py，贪心维护最低单价）----------
def solve_machinefactory(inp: str) -> str:
    t = inp.split()
    n, s = int(t[0]), int(t[1])
    total = 0
    min_p = 10 ** 18
    i = 2
    for _ in range(n):
        p, y = int(t[i]), int(t[i + 1]); i += 2
        min_p = min(min_p + s, p)   # 用上轮库存 vs 本周生产
        total += min_p * y
    return str(total)

# ---------- 26. 分段（Segmentation.py，二分最小最大段和）----------
def solve_segmentation(inp: str) -> str:
    t = inp.split()
    n, m = int(t[0]), int(t[1])
    a = [int(x) for x in t[2:2 + n]]
    def seg(ub):
        count = 0; segs = 1
        for x in a:
            if x > ub:
                return 10 ** 18
            if count + x <= ub:
                count += x
            else:
                count = x; segs += 1
        return segs
    l, r = max(a), sum(a)
    while l < r:
        mid = (l + r) // 2
        if seg(mid) <= m:
            r = mid
        else:
            l = mid + 1
    return str(l)

# ---------- 27. 逃离孤岛（IslandEscape.py，贪心模拟）----------
def solve_islandescape(inp: str) -> str:
    t = inp.split()
    m, s, tt = int(t[0]), int(t[1]), int(t[2])
    dis = 0
    for i in range(1, tt + 1):
        if m >= 10:
            dis += 60; m -= 10
        elif (m < 2 and (tt - i < 3 or s - dis <= 102)
              or m < 6 and (tt - i < 2 or s - dis <= 34)
              or (tt - i == 0 or s - dis <= 17)):
            dis += 17
        else:
            m += 4
        if dis >= s:
            return f'Yes\n{i}'
    return f'No\n{dis}'

# ---------- 28. 抄书（BookCopy.py，二分 + 从后往前贪心划分）----------
def solve_bookcopy(inp: str) -> str:
    t = inp.split()
    m, k = int(t[0]), int(t[1])
    b = [int(x) for x in t[2:2 + m]]
    tot = sum(b)
    l, r = tot // k, tot
    resp = [0] * (m + 1)
    best = 10 ** 18
    while l < r:
        mid = (l + r) // 2
        seg = 1; count = 0
        period = [0] * (m + 1)
        ok = True
        for i in range(m - 1, -1, -1):
            if b[i] > mid:
                seg = 10 ** 18; ok = False; break
            if count + b[i] <= mid:
                count += b[i]
            else:
                count = b[i]
                period[seg] = i + 1
                seg += 1
        if seg == k and mid < best:
            best = mid
            resp = period[:]
        if seg <= k:
            r = mid
        else:
            l = mid + 1
    resp[0] = m
    resp[k] = 0
    out = []
    for i in range(k - 1, -1, -1):
        out.append(f"{resp[i + 1] + 1} {resp[i]}")
    return '\n'.join(out)

# ---------- 29. 买干草（BuyingHay.py 原随机 → 确定性完全背包 DP）----------
def solve_buyinghay(inp: str) -> str:
    t = inp.split()
    n, h = int(t[0]), int(t[1])
    ps = []; cs = []
    i = 2
    for _ in range(n):
        ps.append(int(t[i])); cs.append(int(t[i + 1])); i += 2
    maxp = max(ps)
    H = h + maxp - 1
    INF = 10 ** 18
    f = [INF] * (H + 1); f[0] = 0
    for p, c in zip(ps, cs):
        for j in range(H - p + 1):
            if f[j] + c < f[j + p]:
                f[j + p] = f[j] + c
    return str(min(f[h:]))

# ---------- 30. 疾病传播（Disease.py，BFS 全传播）----------
def solve_disease(inp: str) -> str:
    t = inp.split()
    n, m = int(t[0]), int(t[1])
    graph = {}
    i = 2
    for v in range(1, n + 1):
        deg = int(t[i]); i += 1
        graph[v] = [int(x) for x in t[i:i + deg]]; i += deg
    from collections import deque
    infected = [False] * (n + 1)
    q = deque()
    for _ in range(m):
        x = int(t[i]); i += 1
        infected[x] = True; q.append(x)
    while q:
        v = q.popleft()
        for nb in graph[v]:
            if not infected[nb]:
                infected[nb] = True; q.append(nb)
    return '\n'.join(str(x) for x in range(1, n + 1) if infected[x])

# ---------- 31. 疾病传播 II（Disease2.py，BFS 限 2 层）----------
def solve_disease2(inp: str) -> str:
    t = inp.split()
    n, m = int(t[0]), int(t[1])
    graph = {}
    i = 2
    for v in range(1, n + 1):
        deg = int(t[i]); i += 1
        graph[v] = [int(x) for x in t[i:i + deg]]; i += deg
    from collections import deque
    infected = [False] * (n + 1)
    q = deque()
    for _ in range(m):
        x = int(t[i]); i += 1
        infected[x] = True; q.append((x, 0))
    while q:
        v, st = q.popleft()
        if st == 2:
            continue
        for nb in graph[v]:
            if not infected[nb]:
                infected[nb] = True; q.append((nb, st + 1))
    return '\n'.join(str(x) for x in range(1, n + 1) if infected[x])

# ---------- 32. 能被13整除的排列前缀（Div13.py，DFS）----------
def solve_div13(inp: str) -> str:
    a = [int(x) for x in inp.split()[:10]]
    n = sum(a)
    out = []
    b = [0] * n
    def judge(k):
        x = 0
        for i in range(k + 1):
            x = (x * 10 + b[i]) % 13
        if x == 0:
            out.append(''.join(str(v) for v in b[:k + 1]))
    def search(k):
        if k == n:
            return
        for i in range(10):
            if a[i] > 0:
                if k == 0 and i == 0:
                    continue
                a[i] -= 1
                b[k] = i
                judge(k)
                search(k + 1)
                a[i] += 1
    search(0)
    return '\n'.join(out)

# ---------- 33. 图 DFS 遍历（GraphTraversal.py，邻接升序）----------
def solve_graphtraversal(inp: str) -> str:
    t = inp.split()
    n, m = int(t[0]), int(t[1])
    g = [[False] * n for _ in range(n)]
    i = 2
    for _ in range(m):
        x, y = int(t[i]), int(t[i + 1]); i += 2
        g[x][y] = g[y][x] = True
    visited = [False] * n
    order = []
    def dfs(k):
        order.append(k)
        for j in range(n):
            if g[k][j] and not visited[j]:
                visited[j] = True
                dfs(j)
    visited[0] = True
    dfs(0)
    return ' '.join(str(x) for x in order)

# ---------- 34. 点灯（Lights.py，3×3 全亮最少步数）----------
def solve_lights(inp: str) -> str:
    st = tuple(int(x) for x in inp.split()[:9])
    final = (1,) * 9
    if st == final:
        return '0'
    from collections import deque
    q = deque([(st, 0)])
    seen = {st}
    while q:
        state, step = q.popleft()
        for op in range(9):
            tmp = list(state)
            tmp[op] = 1 - tmp[op]
            if op % 3 != 0: tmp[op - 1] = 1 - tmp[op - 1]
            if op % 3 != 2: tmp[op + 1] = 1 - tmp[op + 1]
            if op > 2: tmp[op - 3] = 1 - tmp[op - 3]
            if op < 6: tmp[op + 3] = 1 - tmp[op + 3]
            ns = tuple(tmp)
            if ns == final:
                return str(step + 1)
            if ns not in seen:
                seen.add(ns); q.append((ns, step + 1))
    return '-1'

# ---------- 35. 线段覆盖（LineCover.py，DFS 最少线段数）----------
def solve_linecover(inp: str) -> str:
    t = inp.split()
    m, n = int(t[0]), int(t[1])
    point = [int(x) for x in t[2:2 + m]]
    length = [int(x) for x in t[2 + m:2 + m + n]]
    used = [False] * n
    best = n
    def dfs(k, cnt):
        nonlocal best
        if cnt >= best:
            return
        if k == m - 1:
            best = cnt
            return
        for i in range(n):
            if used[i]:
                continue
            used[i] = True
            r = point[k] + length[i]
            t2 = k + 1
            while t2 < m - 1 and point[t2 + 1] <= r:
                t2 += 1
            dfs(t2, cnt + 1)
            used[i] = False
    dfs(0, 0)
    return str(best)

# ---------- 36. 全排列（Permutation.py，DFS 字典序）----------
def solve_permutation(inp: str) -> str:
    n = int(inp.split()[0])
    out = []
    a = []
    used = [True] * (n + 1)
    def dfs(k):
        if k == n:
            out.append(' '.join(str(x) for x in a))
            return
        for i in range(1, n + 1):
            if used[i]:
                a.append(i); used[i] = False
                dfs(k + 1)
                used[i] = True; a.pop()
    dfs(0)
    return '\n'.join(out)

# ---------- 37. 单词覆盖链（WordSequence.py，DP 最长链）----------
def solve_wordsequence(inp: str) -> str:
    words = [ln.strip() for ln in inp.split('\n') if ln.strip()]
    if not words:
        return ''
    words.sort(key=len)
    n = len(words)
    cc = [[0] * 26 for _ in range(n)]
    for i, w in enumerate(words):
        for ch in w:
            cc[i][ord(ch) - 97] += 1
    f = [1] * n
    pre = list(range(n))
    for i in range(n):
        for j in range(i):
            if all(cc[i][c] >= cc[j][c] for c in range(26)):
                if f[j] + 1 > f[i]:
                    f[i] = f[j] + 1
                    pre[i] = j
    res = 0
    for i in range(n):
        if f[i] > f[res]:
            res = i
    chain = []
    x = res
    while True:
        chain.append(words[x])
        if pre[x] == x:
            break
        x = pre[x]
    chain.reverse()
    return str(len(chain)) + '\n' + '\n'.join(chain)

# ---------- 38. 玉米田（CornField.cpp，状压 DP 方案数 %1e8）----------
def solve_cornfield(inp: str) -> str:
    t = inp.split()
    m, n = int(t[0]), int(t[1])
    field = []
    i = 2
    for _ in range(m):
        row = 0
        for j in range(n):
            v = int(t[i]); i += 1
            row = (row << 1) + (1 - v)   # 1=肥沃 → 位0；位1 = 不可种
        field.append(row)
    MOD = 100000000
    states = [s for s in range(1 << n) if not (s & (s << 1))]
    f = [[0] * (1 << n) for _ in range(m)]
    for s in states:
        if not (s & field[0]):
            f[0][s] = 1
    for r in range(1, m):
        for sj in states:
            if f[r - 1][sj]:
                for sk in states:
                    if (sk & sj) or (sk & field[r]):
                        continue
                    f[r][sk] = (f[r][sk] + f[r - 1][sj]) % MOD
    return str(sum(f[m - 1][s] for s in states) % MOD)

# ---------- 39. 字符串压缩（Compression.cpp，区间 DP）----------
def solve_compression(inp: str) -> str:
    s = inp.strip().split()[0]
    n = len(s)
    f = [[0] * n for _ in range(n)]
    for i in range(n):
        f[i][i] = 1
    def is_repeat(left, mid, right):
        if mid < (left + right + 1) // 2:
            t = mid + 1 - left
            if (right - mid) % t != 0:
                return False
            for i in range(right - mid):
                if s[mid + 1 + i] != s[left + (i % t)]:
                    return False
        else:
            t = right - mid
            if (mid + 1 - left) % t != 0:
                return False
            for i in range(mid - left + 1):
                if s[left + i] != s[mid + 1 + (i % t)]:
                    return False
        return True
    def calc_len(left, mid, right):
        if mid < (left + right + 1) // 2:
            base = f[left][mid]
            times = (right - left + 1) // (mid - left + 1)
        else:
            base = f[mid + 1][right]
            times = (right - left + 1) // (right - mid)
        return base + 3 + (1 if times >= 10 else 0) + (1 if times >= 100 else 0)
    for length in range(1, n):
        for i in range(n - length):
            j = i + length
            f[i][j] = length + 1
            for k in range(i, j):
                v = f[i][k] + f[k + 1][j]
                if v < f[i][j]:
                    f[i][j] = v
                if is_repeat(i, k, j):
                    v2 = calc_len(i, k, j)
                    if v2 < f[i][j]:
                        f[i][j] = v2
    return str(f[0][n - 1])

# ---------- 40. 唯一字符计数（UniqueChar.cpp，贡献法 %1e9+7）----------
def solve_uniquechar(inp: str) -> str:
    s = inp.strip().split()[0]
    MOD = 1000000007
    n = len(s)
    pos = [[] for _ in range(26)]
    for i, ch in enumerate(s):
        pos[ord(ch) - 65].append(i)
    res = 0
    for arr in pos:
        for k, i in enumerate(arr):
            left = i - (arr[k - 1] if k > 0 else -1)
            right = (arr[k + 1] if k + 1 < len(arr) else n) - i
            res = (res + left * right) % MOD
    return str(res)

# ---------- 41. 正则匹配（RegExpMatch.cpp，LeetCode 10：. 单字符，* 前字符0+次）----------
def solve_regexp(inp: str) -> str:
    lines = inp.strip().split('\n')
    s = lines[0].strip()
    p = lines[1].strip()
    m, n = len(s), len(p)
    f = [[False] * (n + 1) for _ in range(m + 1)]
    f[0][0] = True
    i = 1
    while i < n and p[i] == '*':
        f[0][i + 1] = True
        i += 2
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if j < n and p[j] == '*':
                continue
            c = p[j - 1]
            if c == '.':
                f[i][j] = f[i - 1][j - 1]
            elif c == '*':
                k = i
                while k >= 0:
                    if f[k][j - 2]:
                        f[i][j] = True
                        break
                    if k == 0:
                        break
                    if p[j - 2] != '.' and s[k - 1] != p[j - 2]:
                        break
                    k -= 1
            else:
                f[i][j] = f[i - 1][j - 1] and (s[i - 1] == p[j - 1])
    return '1' if f[m][n] else '0'

# ---------- 42. 青蛙过河（Frog.cpp，LeetCode 403 变体）----------
def solve_frog(inp: str) -> str:
    t = inp.split()
    n = int(t[0])
    stones = [int(x) for x in t[1:1 + n]]
    if n <= 1:
        return 'true'
    from collections import defaultdict
    stone_set = set(stones)
    dp = defaultdict(set)
    dp[0] = {0}
    for x in stones:
        for k in dp[x]:
            for nk in (k - 1, k, k + 1):
                if nk > 0 and (x + nk) in stone_set:
                    dp[x + nk].add(nk)
    return 'true' if dp[stones[-1]] else 'false'

# ---------- 43. 谷仓涂色（BarnPainting.cpp，树形 DP 3 色计数 %1e9+7）----------
def solve_barnpainting(inp: str) -> str:
    t = inp.split()
    n, k = int(t[0]), int(t[1])
    adj = [[] for _ in range(n + 1)]
    i = 2
    for _ in range(n - 1):
        x, y = int(t[i]), int(t[i + 1]); i += 2
        adj[x].append(y); adj[y].append(x)
    MOD = 1000000007
    fixed = [-1] * (n + 1)
    for _ in range(k):
        x, y = int(t[i]), int(t[i + 1]); i += 2
        fixed[x] = y - 1
    f = [[0] * 3 for _ in range(n + 1)]
    marked = [False] * (n + 1)
    def dfs(x):
        marked[x] = True
        if fixed[x] > -1:
            f[x][fixed[x]] = 1
        else:
            f[x][0] = f[x][1] = f[x][2] = 1
        for nb in adj[x]:
            if marked[nb]:
                continue
            dfs(nb)
            for c in range(3):
                s = 0
                for c2 in range(3):
                    if c2 != c:
                        s = (s + f[nb][c2]) % MOD
                f[x][c] = f[x][c] * s % MOD
    dfs(1)
    return str((f[1][0] + f[1][1] + f[1][2]) % MOD)

# ---------- 44. 毛毛虫（Caterpillar.cpp，树形 DP 最长毛毛虫）----------
def solve_caterpillar(inp: str) -> str:
    t = inp.split()
    n, m = int(t[0]), int(t[1])
    adj = [[] for _ in range(n + 1)]
    i = 2
    for _ in range(m):
        x, y = int(t[i]), int(t[i + 1]); i += 2
        adj[x].append(y); adj[y].append(x)
    f = [0] * (n + 1)
    res = 0
    def dfs(x):
        nonlocal res
        l1 = l2 = 0; children = 0
        f[x] = 1   # 访问标记
        for nb in adj[x]:
            if f[nb]:
                continue
            children += 1
            dfs(nb)
            if l1 <= f[nb]:
                l2 = l1; l1 = f[nb]
            elif f[nb] > l2:
                l2 = f[nb]
        f[x] = l1 + 1 + max(0, children - 1)
        res = max(res, l1 + l2 + 1 + max(0, len(adj[x]) - 2))
    dfs(1)
    return str(res)

# ---------- 45. 巧克力（Chocolate.cpp，最大子矩阵和，0→-2^25）----------
def solve_chocolate(inp: str) -> str:
    t = inp.split()
    n, m = int(t[0]), int(t[1])
    ZERO = 1 << 25
    f = [[0] * (m + 1) for _ in range(n + 1)]
    idx = 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            v = int(t[idx]); idx += 1
            if v == 0:
                v = -ZERO
            f[i][j] = f[i - 1][j] + v   # 列前缀和
    res = 0
    for i in range(1, n + 1):
        for j in range(1, i + 1):
            count = 0
            for k in range(1, m + 1):
                count += f[i][k] - f[j - 1][k]
                if count > res:
                    res = count
                if count < 0:
                    count = 0
    return str(res)

# ---------- 46. 外星人入侵（Invader.cpp，区间 DP 引爆最大 d）----------
def solve_invader(inp: str) -> str:
    t = inp.split()
    idx = 0
    total = int(t[idx]); idx += 1
    out = []
    for _ in range(total):
        n = int(t[idx]); idx += 1
        a = [0] * n; b = [0] * n; d = [0] * n
        times = [0] * 10001
        for i in range(n):
            a[i] = int(t[idx]); b[i] = int(t[idx + 1]); d[i] = int(t[idx + 2]); idx += 3
            times[a[i]] = 1; times[b[i]] = 1
        timeN = 0
        for i in range(10001):
            if times[i]:
                timeN += 1
                times[i] = timeN
        for i in range(n):
            a[i] = times[a[i]]; b[i] = times[b[i]]
        INF = 10 ** 9
        f = [[0] * (timeN + 2) for _ in range(timeN + 2)]
        for length in range(1, timeN + 1):
            for i in range(1, timeN - length + 1):
                j = i + length
                maxDi = -1
                for di in range(n):
                    if a[di] >= i and b[di] <= j and (maxDi == -1 or d[di] > d[maxDi]):
                        maxDi = di
                if maxDi == -1:
                    continue
                f[i][j] = INF
                for tt in range(a[maxDi], b[maxDi] + 1):
                    tmp = 0
                    if tt - 1 >= i:
                        tmp += f[i][tt - 1]
                    if tt + 1 <= j:
                        tmp += f[tt + 1][j]
                    if tmp + d[maxDi] < f[i][j]:
                        f[i][j] = tmp + d[maxDi]
        out.append(str(f[1][timeN]))
    return '\n'.join(out)

# ---------- 47. 国王（King.cpp，状压棋盘放王方案数）----------
def solve_king(inp: str) -> str:
    t = inp.split()
    n, k = int(t[0]), int(t[1])
    states = []
    def gen(x, s, cnt):
        if x == n:
            states.append((s, cnt))
            return
        gen(x + 1, s, cnt)
        if x == 0 or not (s & 1):
            gen(x + 1, (s << 1) | 1, cnt + 1)
    gen(0, 0, 0)
    sn = len(states)
    f = [[[0] * (1 << n) for _ in range(k + 1)] for _ in range(n)]
    for s, cnt in states:
        if cnt <= k:
            f[0][cnt][s] = 1
    for i in range(1, n):
        for c in range(k + 1):
            for sj, cj in states:
                if f[i - 1][c][sj] > 0:
                    cover = sj | (sj << 1) | (sj >> 1)
                    for sj2, cj2 in states:
                        if (sj2 & cover) or c + cj2 > k:
                            continue
                        f[i][c + cj2][sj2] += f[i - 1][c][sj]
    res = 0
    for s, cnt in states:
        res += f[n - 1][k][s]
    return str(res)

# ---------- 48. 回文路径（PalinPath.cpp，对角 DP %1e9+7）----------
def solve_palinpath(inp: str) -> str:
    lines = inp.strip().split('\n')
    n = int(lines[0].strip())
    grid = [ln.strip() for ln in lines[1:1 + n]]
    MOD = 1000000007
    f = [[[0] * n for _ in range(n)] for _ in range(2)]
    for i in range(n):
        f[0][n - i - 1][n - i - 1] = 1
    for k in range(1, n):
        k1 = k % 2; k2 = (k - 1) % 2
        f[k1] = [[0] * n for _ in range(n)]
        for i in range(n - k):
            iy = n - k - i - 1
            for j in range(k, n):
                jy = n + k - j - 1
                if grid[i][iy] == grid[j][jy]:
                    v = 0
                    v += f[k2][i + 1][j - 1] * (grid[i + 1][iy] == grid[j - 1][jy])
                    v += f[k2][i + 1][j] * (grid[i + 1][iy] == grid[j][jy - 1])
                    v += f[k2][i][j - 1] * (grid[i][iy + 1] == grid[j - 1][jy])
                    v += f[k2][i][j] * (grid[i][iy + 1] == grid[j][jy - 1])
                    f[k1][i][j] = v % MOD
    return str(f[(n - 1) % 2][0][n - 1])

# ---------- 49. 石子游戏 V（StoneGameV.cpp，区间 DP 取小段）----------
def solve_stonegamev(inp: str) -> str:
    stones = [int(x) for x in inp.split()]
    n = len(stones)
    if n == 0:
        return '0'
    s = [0] * (n + 1)
    for i in range(n):
        s[i + 1] = s[i] + stones[i]
    f = [[0] * n for _ in range(n)]
    for k in range(1, n):
        for i in range(n - k):
            j = i + k
            for m in range(i, j):
                sl = s[m + 1] - s[i]
                sr = s[j + 1] - s[m + 1]
                if sl <= sr:
                    v = sl + f[i][m]
                    if v > f[i][j]:
                        f[i][j] = v
                if sl >= sr:
                    v = sr + f[m + 1][j]
                    if v > f[i][j]:
                        f[i][j] = v
    return str(f[0][n - 1])

# ---------- 题型路由 ----------
def type_of(slug: str) -> str:
    if 'balanced-bst' in slug and 'almost' not in slug and 'pseudobst' not in slug:
        return 'balanced-bst'        # Ch10
    if 'pseudobst' in slug: return 'pseudobst'
    if 'almost-balanced-bst' in slug: return 'almost-bst'
    if 'heap-and-modified' in slug: return 'heap'
    if 'segtree' in slug: return 'segtree'
    if 'triepractice' in slug: return 'triepractice'
    if 'trie' in slug: return 'trie'
    if 'blocklist' in slug: return 'blocklist'
    if 'skiplist' in slug: return 'skiplist'
    if 'ufs' in slug: return 'ufs'
    if 'transport' in slug: return 'transport'
    if '8puzzle' in slug: return 'eight-puzzle'
    if '15puzzle' in slug: return 'fifteen-puzzle'
    if 'stick' in slug: return 'stick'
    if 'stonejump' in slug: return 'stonejump'
    if 'jump' in slug: return 'jump'
    if 'knapsackmulti' in slug: return 'knapsackmulti'
    if 'knapsack01' in slug: return 'knapsack01'
    if 'numbercombine' in slug: return 'numbercombine'
    if 'maxsquare' in slug: return 'maxsquare'
    if 'divisible' in slug: return 'divisible'
    if 'wordbreak' in slug: return 'wordbreak'
    if 'changevolume' in slug: return 'changevolume'
    if 'sortthree' in slug: return 'sortthree'
    if 'machinefactory' in slug: return 'machinefactory'
    if 'segmentation' in slug: return 'segmentation'
    if 'islandescape' in slug: return 'islandescape'
    if 'bookcopy' in slug: return 'bookcopy'
    if 'buyinghay' in slug: return 'buyinghay'
    if 'disease2' in slug: return 'disease2'
    if 'disease' in slug: return 'disease'
    if 'div13' in slug: return 'div13'
    if 'graphtraversal' in slug: return 'graphtraversal'
    if 'lights' in slug: return 'lights'
    if 'linecover' in slug: return 'linecover'
    if 'permutation' in slug: return 'permutation'
    if 'wordsequence' in slug: return 'wordsequence'
    if 'cornfield' in slug: return 'cornfield'
    if 'compression' in slug: return 'compression'
    if 'uniquechar' in slug: return 'uniquechar'
    if 'regexp' in slug: return 'regexp'
    if 'frog' in slug: return 'frog'
    if 'barnpainting' in slug: return 'barnpainting'
    if 'caterpillar' in slug: return 'caterpillar'
    if 'chocolate' in slug: return 'chocolate'
    if 'invader' in slug: return 'invader'
    if 'king' in slug: return 'king'
    if 'palinpath' in slug: return 'palinpath'
    if 'stonegamev' in slug: return 'stonegamev'
    return 'unknown'

def solve(slug: str, inp: str) -> str:
    fn = {
        'heap': solve_heap, 'almost-bst': solve_almost_bst, 'pseudobst': solve_pseudobst,
        'segtree': solve_segtree, 'trie': solve_trie, 'triepractice': solve_triepractice,
        'blocklist': solve_blocklist, 'skiplist': solve_skiplist, 'ufs': solve_ufs,
        'balanced-bst': solve_balanced_bst, 'transport': solve_transport,
        'eight-puzzle': solve_eight_puzzle,
        'fifteen-puzzle': solve_fifteen_puzzle, 'stick': solve_stick,
        'knapsack01': solve_knapsack01, 'knapsackmulti': solve_knapsackmulti,
        'numbercombine': solve_numbercombine, 'jump': solve_jump,
        'maxsquare': solve_maxsquare, 'divisible': solve_divisible,
        'wordbreak': solve_wordbreak, 'changevolume': solve_changevolume,
        'stonejump': solve_stonejump, 'sortthree': solve_sortthree,
        'machinefactory': solve_machinefactory, 'segmentation': solve_segmentation,
        'islandescape': solve_islandescape, 'bookcopy': solve_bookcopy,
        'buyinghay': solve_buyinghay,
        'disease': solve_disease, 'disease2': solve_disease2,
        'div13': solve_div13, 'graphtraversal': solve_graphtraversal,
        'lights': solve_lights, 'linecover': solve_linecover,
        'permutation': solve_permutation,
        'wordsequence': solve_wordsequence,
        'cornfield': solve_cornfield, 'compression': solve_compression,
        'uniquechar': solve_uniquechar, 'regexp': solve_regexp,
        'frog': solve_frog,
        'barnpainting': solve_barnpainting, 'caterpillar': solve_caterpillar,
        'chocolate': solve_chocolate, 'invader': solve_invader,
        'king': solve_king, 'palinpath': solve_palinpath,
        'stonegamev': solve_stonegamev,
    }[type_of(slug)]
    return fn(inp)

if __name__ == '__main__':
    data = json.load(open('coderepo-problems.draft.json', encoding='utf-8'))
    for p in data:
        slug = p['slug']; inp = p['testCases'][0]['input']
        got = solve(slug, inp)
        exp = p['testCases'][0]['expected']
        ok = got.strip() == exp.strip()
        flag = 'OK ' if ok else 'REGEN'  # REGEN = 真值需重算（异构/未知生成器）
        print(f"{flag} {type_of(slug):13s} {slug}")
