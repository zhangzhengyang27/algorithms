# 计算几何：点、线与凸包




## 一、计算几何概述

**计算几何**研究几何对象的算法表示与操作，面试中常考：
- 点与向量的基本运算
- 线段相交判断
- 凸包算法
- 面积与包含关系

> 核心工具：**叉积（Cross Product）**——一个公式解决 80% 的几何题。

## 二、基本工具

### 2.1 点与向量

```java tab
class Point {
    double x, y;
    Point(double x, double y) { this.x = x; this.y = y; }
}
```

```typescript tab
class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) { this.x = x; this.y = y; }
}
```

```python tab
class Point:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
```

### 2.2 向量运算

```java tab
// 向量减法：A→B = B - A
static Point subtract(Point b, Point a) {
    return new Point(b.x - a.x, b.y - a.y);
}

// 点积：a·b = |a||b|cos θ
static double dot(Point a, Point b) {
    return a.x * b.x + a.y * b.y;
}

// 叉积：a×b = |a||b|sin θ（有符号）
static double cross(Point a, Point b) {
    return a.x * b.y - a.y * b.x;
}
```

```typescript tab
// 向量减法：A→B = B - A
function subtract(b: Point, a: Point): Point {
    return new Point(b.x - a.x, b.y - a.y);
}

// 点积：a·b = |a||b|cos θ
function dot(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y;
}

// 叉积：a×b = |a||b|sin θ（有符号）
function cross(a: Point, b: Point): number {
    return a.x * b.y - a.y * b.x;
}
```

```python tab
# 向量减法：A→B = B - A
def subtract(b: Point, a: Point) -> Point:
    return Point(b.x - a.x, b.y - a.y)

# 点积：a·b = |a||b|cos θ
def dot(a: Point, b: Point) -> float:
    return a.x * b.x + a.y * b.y

# 叉积：a×b = |a||b|sin θ（有符号）
def cross(a: Point, b: Point) -> float:
    return a.x * b.y - a.y * b.x
```

### 2.3 叉积的几何意义

| 叉积值 | 含义 |
|--------|------|
| > 0 | b 在 a 的**逆时针**方向（左边） |
| < 0 | b 在 a 的**顺时针**方向（右边） |
| = 0 | a 与 b **共线** |

> 这是判断左右转、线段相交、凸包的基础。

## 三、经典问题

### 3.1 判断点在线段的哪一侧

```java tab
// 判断点 P 相对于线段 A→B 的位置
static int orientation(Point a, Point b, Point p) {
    double val = cross(subtract(b, a), subtract(p, a));
    if (Math.abs(val) < 1e-9) return 0;   // 共线
    return val > 0 ? 1 : -1;              // 1=左侧, -1=右侧
}
```

```typescript tab
// 判断点 P 相对于线段 A→B 的位置
function orientation(a: Point, b: Point, p: Point): number {
    const val = cross(subtract(b, a), subtract(p, a));
    if (Math.abs(val) < 1e-9) return 0;   // 共线
    return val > 0 ? 1 : -1;              // 1=左侧, -1=右侧
}
```

```python tab
# 判断点 P 相对于线段 A→B 的位置
def orientation(a: Point, b: Point, p: Point) -> int:
    val = cross(subtract(b, a), subtract(p, a))
    if abs(val) < 1e-9:
        return 0   # 共线
    return 1 if val > 0 else -1  # 1=左侧, -1=右侧
```

### 3.2 线段相交判断

两线段 AB 和 CD 相交 ⟺ C、D 在 AB 两侧 **且** A、B 在 CD 两侧：

```java tab
static boolean segmentsIntersect(Point a, Point b, Point c, Point d) {
    int d1 = orientation(a, b, c);
    int d2 = orientation(a, b, d);
    int d3 = orientation(c, d, a);
    int d4 = orientation(c, d, b);

    if (d1 * d2 < 0 && d3 * d4 < 0) return true;

    // 共线特殊情况（端点在线段上）
    if (d1 == 0 && onSegment(a, b, c)) return true;
    if (d2 == 0 && onSegment(a, b, d)) return true;
    if (d3 == 0 && onSegment(c, d, a)) return true;
    if (d4 == 0 && onSegment(c, d, b)) return true;
    return false;
}

static boolean onSegment(Point a, Point b, Point p) {
    return Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x)
        && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
}
```

```typescript tab
function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
    const d1 = orientation(a, b, c);
    const d2 = orientation(a, b, d);
    const d3 = orientation(c, d, a);
    const d4 = orientation(c, d, b);

    if (d1 * d2 < 0 && d3 * d4 < 0) return true;

    // 共线特殊情况（端点在线段上）
    if (d1 === 0 && onSegment(a, b, c)) return true;
    if (d2 === 0 && onSegment(a, b, d)) return true;
    if (d3 === 0 && onSegment(c, d, a)) return true;
    if (d4 === 0 && onSegment(c, d, b)) return true;
    return false;
}

function onSegment(a: Point, b: Point, p: Point): boolean {
    return Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x)
        && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
}
```

```python tab
def segments_intersect(a: Point, b: Point, c: Point, d: Point) -> bool:
    d1 = orientation(a, b, c)
    d2 = orientation(a, b, d)
    d3 = orientation(c, d, a)
    d4 = orientation(c, d, b)

    if d1 * d2 < 0 and d3 * d4 < 0:
        return True

    # 共线特殊情况（端点在线段上）
    if d1 == 0 and on_segment(a, b, c): return True
    if d2 == 0 and on_segment(a, b, d): return True
    if d3 == 0 and on_segment(c, d, a): return True
    if d4 == 0 and on_segment(c, d, b): return True
    return False

def on_segment(a: Point, b: Point, p: Point) -> bool:
    return (min(a.x, b.x) <= p.x <= max(a.x, b.x)
            and min(a.y, b.y) <= p.y <= max(a.y, b.y))
```

### 3.3 多边形面积（Shoelace 公式）

```java tab
static double polygonArea(Point[] poly) {
    double area = 0;
    int n = poly.length;
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        area += cross(poly[i], poly[j]);
    }
    return Math.abs(area) / 2.0;
}
```

```typescript tab
function polygonArea(points: [number, number][]): number {
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += points[i][0] * points[j][1] - points[i][1] * points[j][0];
    }
    return Math.abs(area) / 2;
}
```

```python tab
def polygon_area(points: list) -> float:
    n = len(points)
    area = 0
    for i in range(n):
        j = (i + 1) % n
        area += points[i][0] * points[j][1] - points[i][1] * points[j][0]
    return abs(area) / 2
```

### 3.4 判断点在多边形内（射线法）

从点向右发射线，统计与多边形边的交点数：奇数=内部，偶数=外部。

```java tab
static boolean pointInPolygon(Point p, Point[] poly) {
    int n = poly.length;
    boolean inside = false;
    for (int i = 0, j = n - 1; i < n; j = i++) {
        if ((poly[i].y > p.y) != (poly[j].y > p.y)
            && p.x < (poly[j].x - poly[i].x) * (p.y - poly[i].y)
                     / (poly[j].y - poly[i].y) + poly[i].x) {
            inside = !inside;
        }
    }
    return inside;
}
```

```typescript tab
function pointInPolygon(p: Point, poly: Point[]): boolean {
    const n = poly.length;
    let inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        if ((poly[i].y > p.y) !== (poly[j].y > p.y)
            && p.x < (poly[j].x - poly[i].x) * (p.y - poly[i].y)
                     / (poly[j].y - poly[i].y) + poly[i].x) {
            inside = !inside;
        }
    }
    return inside;
}
```

```python tab
def point_in_polygon(p: Point, poly: list) -> bool:
    n = len(poly)
    inside = False
    j = n - 1
    for i in range(n):
        if ((poly[i].y > p.y) != (poly[j].y > p.y)
                and p.x < (poly[j].x - poly[i].x) * (p.y - poly[i].y)
                         / (poly[j].y - poly[i].y) + poly[i].x):
            inside = not inside
        j = i
    return inside
```

## 四、凸包算法

### 4.1 Andrew 算法（单调链）

按 x 排序后，分别构建上凸包和下凸包：

```java tab
static Point[] convexHull(Point[] points) {
    Arrays.sort(points, (a, b) -> a.x != b.x ? Double.compare(a.x, b.x)
                                               : Double.compare(a.y, b.y));
    int n = points.length;
    if (n <= 2) return points;

    Point[] hull = new Point[2 * n];
    int k = 0;

    // 下凸包
    for (int i = 0; i < n; i++) {
        while (k >= 2 && cross(subtract(hull[k-1], hull[k-2]),
                               subtract(points[i], hull[k-2])) <= 0) k--;
        hull[k++] = points[i];
    }

    // 上凸包
    int lower = k + 1;
    for (int i = n - 2; i >= 0; i--) {
        while (k >= lower && cross(subtract(hull[k-1], hull[k-2]),
                                    subtract(points[i], hull[k-2])) <= 0) k--;
        hull[k++] = points[i];
    }

    return Arrays.copyOf(hull, k - 1);   // 去掉重复的起点
}
```

```typescript tab
function convexHull(points: Point[]): Point[] {
    points.sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
    const n = points.length;
    if (n <= 2) return points;

    const hull: Point[] = [];

    // 下凸包
    for (let i = 0; i < n; i++) {
        while (hull.length >= 2 && cross(subtract(hull[hull.length - 1], hull[hull.length - 2]),
               subtract(points[i], hull[hull.length - 2])) <= 0) hull.pop();
        hull.push(points[i]);
    }

    // 上凸包
    const lower = hull.length + 1;
    for (let i = n - 2; i >= 0; i--) {
        while (hull.length >= lower && cross(subtract(hull[hull.length - 1], hull[hull.length - 2]),
               subtract(points[i], hull[hull.length - 2])) <= 0) hull.pop();
        hull.push(points[i]);
    }

    hull.pop(); // 去掉重复的起点
    return hull;
}
```

```python tab
def convex_hull(points: list) -> list:
    points.sort(key=lambda p: (p.x, p.y))
    n = len(points)
    if n <= 2:
        return points

    hull = []

    # 下凸包
    for i in range(n):
        while len(hull) >= 2 and cross(subtract(hull[-1], hull[-2]),
                                       subtract(points[i], hull[-2])) <= 0:
            hull.pop()
        hull.append(points[i])

    # 上凸包
    lower = len(hull) + 1
    for i in range(n - 2, -1, -1):
        while len(hull) >= lower and cross(subtract(hull[-1], hull[-2]),
                                           subtract(points[i], hull[-2])) <= 0:
            hull.pop()
        hull.append(points[i])

    hull.pop()  # 去掉重复的起点
    return hull
```

- **时间**：O(n log n)（排序主导）

## 五、面试常见题

- 🟢 矩形面积、有效的正方形、三点共线
- 🟡 线段相交、多边形面积、最接近原点的 K 个点
- 🟠 凸包、最小矩形覆盖、旋转卡壳
- 🔴 半平面交、Voronoi 图、KD-Tree

## 六、精度问题

| 问题 | 解决方案 |
|------|----------|
| 浮点误差 | 用 `eps = 1e-9` 判断相等 |
| 整数坐标 | 尽量用整数叉积（long） |
| 除零 | 判断分母是否为 0 |
| 溢出 | 坐标范围大时用 long 或 BigInteger |

## 七、调试技巧

1. **画图**：几何题必须画图，标注坐标和方向。
2. **叉积方向**：记住"正=逆时针=左边"。
3. **边界情况**：共线、重合、退化（三点共线不构成三角形）。
4. **验证凸包**：结果应满足所有相邻边叉积同号。
