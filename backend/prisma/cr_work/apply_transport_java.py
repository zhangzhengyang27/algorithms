# -*- coding: utf-8 -*-
"""用完整 A* 实现替换 SOL_JAVA['transport']（transport 是 cr_solutions.py 最后一个块）。"""
import os
path = os.path.join(os.path.dirname(__file__), 'cr_solutions.py')
src = open(path, encoding='utf-8').read()

start_marker = "SOL_JAVA['transport'] = '''"
i = src.index(start_marker)
last_tri = src.rindex("'''")
assert last_tri > i
head = src[:i]            # 不含标记
tail = src[last_tri + 3:] # 收口 ''' 之后

JAVA = '''import java.util.*;

public class Main {
    static final int MOD = 1440;
    static int N, M, start, end, pathType;
    static double budget;
    static List<Edge>[] graph;
    static List<Edge>[] rgraph;
    static Map<Integer, Integer> level;

    static class Edge {
        int from, to, length, speed, toll, ps, pe;
        Edge(int from, int to, int length, int speed, int toll, int ps, int pe) {
            this.from = from; this.to = to; this.length = length; this.speed = speed;
            this.toll = toll; this.ps = ps; this.pe = pe;
        }
    }
    static class Node {
        int point, arr, dist, cost, prev, ht, hd, hc;
        Node(int point, int arr, int dist, int cost, int prev) {
            this.point = point; this.arr = arr; this.dist = dist; this.cost = cost; this.prev = prev;
        }
    }

    static int toMin(String s) {
        s = s.trim();
        return ((s.charAt(0) - '0') * 10 + (s.charAt(1) - '0')) * 60 + (s.charAt(3) - '0') * 10 + (s.charAt(4) - '0');
    }
    static String toHm(int x) {
        int h = x / 60, m = x % 60;
        return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
    }
    static int nextArr(int t, Edge e) {
        int pt = (int)(t + (double) e.length / e.speed);
        if (t % MOD > e.pe) return (t / MOD + 1) * MOD + e.ps + pt;
        return t + pt;
    }
    static int lvl(int x) { Integer v = level.get(x); return v == null ? 1000000000 : v; }

    static int heurTime(int u, int arr) {
        int cur = u, t = arr;
        while (cur != end) {
            int best = -1, bt = Integer.MAX_VALUE;
            for (Edge e : graph[cur]) {
                if (lvl(cur) - lvl(e.to) == 1) {
                    int na = nextArr(t, e);
                    if (best == -1 || na < bt) { best = e.to; bt = na; }
                }
            }
            cur = best; t = bt;
        }
        return t;
    }
    static int heurDist(int u, int dist) {
        int cur = u, d = dist;
        while (cur != end) {
            int best = -1, bd = Integer.MAX_VALUE;
            for (Edge e : graph[cur]) {
                if (lvl(cur) - lvl(e.to) == 1) {
                    int nd = d + e.length;
                    if (best == -1 || nd < bd) { best = e.to; bd = nd; }
                }
            }
            cur = best; d = bd;
        }
        return d;
    }
    static int heurCost(int u, int cost) {
        int cur = u, c = cost;
        while (cur != end) {
            int best = -1, bc = Integer.MAX_VALUE;
            for (Edge e : graph[cur]) {
                if (lvl(cur) - lvl(e.to) == 1) {
                    int nc = c + e.toll;
                    if (best == -1 || nc < bc) { best = e.to; bc = nc; }
                }
            }
            cur = best; c = bc;
        }
        return c;
    }

    static int attr(Node pn, Edge e) {
        if (pathType == 1 || pathType == 4) return nextArr(pn.arr, e);
        if (pathType == 2) return pn.dist + e.length;
        return pn.cost + e.toll;
    }

    static class PQ {
        List<Node> a = new ArrayList<>();
        boolean less(Node x, Node y) {
            if (pathType == 1 || pathType == 4) return x.ht > y.ht;
            if (pathType == 2) return x.hd > y.hd;
            if (pathType == 3) { if (x.hc != y.hc) return x.hc > y.hc; return x.ht > y.ht; }
            return x.ht > y.ht;
        }
        void swap(int i, int j) { Node t = a.get(i); a.set(i, a.get(j)); a.set(j, t); }
        void push(Node it) {
            a.add(it); int ci = a.size() - 1;
            while (ci > 0) { int pi = (ci - 1) / 2; if (less(a.get(ci), a.get(pi))) { swap(ci, pi); ci = pi; } else break; }
        }
        Node pop() {
            Node top = a.get(0); a.set(0, a.get(a.size() - 1)); a.remove(a.size() - 1);
            int ci = 0;
            while (true) {
                int l = 2 * ci + 1, r = l + 1, sm = ci;
                if (l < a.size() && less(a.get(l), a.get(sm))) sm = l;
                if (r < a.size() && less(a.get(r), a.get(sm))) sm = r;
                if (sm == ci) break;
                swap(ci, sm); ci = sm;
            }
            return top;
        }
        boolean isEmpty() { return a.isEmpty(); }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] h = sc.nextLine().split(" ");
        N = Integer.parseInt(h[0]); M = Integer.parseInt(h[1]); start = Integer.parseInt(h[2]);
        end = Integer.parseInt(h[3]); pathType = Integer.parseInt(h[4]);
        budget = Double.parseDouble(h[5]) * 100;
        int startTime = toMin(sc.nextLine());
        graph = new List[N]; rgraph = new List[N];
        for (int i = 0; i < N; i++) { graph[i] = new ArrayList<>(); rgraph[i] = new ArrayList<>(); }
        for (int i = 0; i < M; i++) {
            String[] p = sc.nextLine().split(" ");
            int f = Integer.parseInt(p[0]), to = Integer.parseInt(p[1]), length = Integer.parseInt(p[2]);
            int speed = Integer.parseInt(p[3]), toll = (int)(Double.parseDouble(p[4]) * 100);
            String[] win = p[5].split("~"); int ps = toMin(win[0]), pe = toMin(win[1]);
            Edge e = new Edge(f, to, length, speed, toll, ps, pe);
            graph[f].add(e); rgraph[to].add(e);
        }
        level = new HashMap<>(); Queue<Integer> q = new LinkedList<>(); q.add(end); level.put(end, 0);
        while (!q.isEmpty()) {
            int x = q.poll();
            for (Edge e : rgraph[x]) {
                if (!level.containsKey(e.from)) { level.put(e.from, level.get(x) + 1); q.add(e.from); }
            }
        }
        List<Node> arch = new ArrayList<>();
        PQ pq = new PQ();
        Node init = new Node(start, startTime, 0, 0, -1);
        if (pathType == 1) init.ht = heurTime(start, startTime);
        else if (pathType == 2) init.hd = heurDist(start, 0);
        else if (pathType == 3) { init.hc = heurCost(start, 0); init.ht = heurTime(start, startTime); }
        else init.ht = heurTime(start, startTime);
        pq.push(init);
        Map<Integer, Integer> hashState = new HashMap<>();
        while (!pq.isEmpty()) {
            Node cur = pq.pop();
            arch.add(cur);
            if (cur.point == end) {
                List<Node> path = new ArrayList<>(); Node c = cur;
                while (c.prev != -1) { c = arch.get(c.prev); path.add(c); }
                StringBuilder res = new StringBuilder();
                Node fin = path.get(0);
                res.append(toHm(fin.arr)).append(' ').append(fin.dist).append(' ').append(String.format("%.2f", fin.cost / 100.0)).append('\\n');
                res.append(path.size()).append('\\n');
                for (int k = path.size() - 1; k >= 0; k--) {
                    Node nd = path.get(k);
                    res.append(nd.point).append(' ').append(toHm(nd.arr)).append('\\n');
                }
                System.out.print(res.toString());
                return;
            }
            for (Edge e : graph[cur.point]) {
                int at = attr(cur, e);
                Integer prev = hashState.get(e.to);
                if (prev == null || prev > at) {
                    Node nxt = new Node(e.to, nextArr(cur.arr, e), cur.dist + e.length, cur.cost + e.toll, arch.size() - 1);
                    if (pathType == 4 && nxt.cost > budget) continue;
                    if (pathType == 1) nxt.ht = heurTime(nxt.point, nxt.arr);
                    else if (pathType == 2) nxt.hd = heurDist(nxt.point, nxt.dist);
                    else if (pathType == 3) { nxt.hc = heurCost(nxt.point, nxt.cost); nxt.ht = heurTime(nxt.point, nxt.arr); }
                    else nxt.ht = heurTime(nxt.point, nxt.arr);
                    pq.push(nxt); hashState.put(e.to, at);
                }
            }
        }
    }
}
'''

open(path, 'w', encoding='utf-8').write(head + "SOL_JAVA['transport'] = '''" + JAVA + "'''" + tail)
print("transport Java replaced; tail len", len(tail))
