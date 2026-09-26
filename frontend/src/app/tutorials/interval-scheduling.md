# 区间调度与贪心

区间调度问题是贪心算法的经典应用场景：在有限资源下选择最多的不重叠区间。从简单的活动选择到复杂的会议室分配，核心都是"排序 + 贪心选择"。

## 一、经典问题：最多不重叠区间

```mermaid
graph LR
  A[区间集合] --> B[按结束时间排序]
  B --> C[贪心选最早结束]
  C --> D[跳过冲突]
```

给定 n 个区间 [start, end]，选出最多的互不重叠区间。

### 贪心策略：按结束时间排序

```java tab
// LeetCode 435: 无重叠区间（求最少移除数）
int eraseOverlapIntervals(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[1] - b[1]); // 按结束时间
    int count = 0;
    int end = intervals[0][1];
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < end) {
            count++; // 重叠，移除
        } else {
            end = intervals[i][1]; // 不重叠，保留
        }
    }
    return count;
}
```

```typescript tab
// LeetCode 435: 无重叠区间（求最少移除数）
function eraseOverlapIntervals(intervals: number[][]): number {
    intervals.sort((a, b) => a[1] - b[1]); // 按结束时间
    let count = 0;
    let end = intervals[0][1];
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < end) {
            count++; // 重叠，移除
        } else {
            end = intervals[i][1]; // 不重叠，保留
        }
    }
    return count;
}
```

```python tab
# LeetCode 435: 无重叠区间（求最少移除数）
def erase_overlap_intervals(intervals: list) -> int:
    intervals.sort(key=lambda x: x[1])  # 按结束时间
    count = 0
    end = intervals[0][1]
    for i in range(1, len(intervals)):
        if intervals[i][0] < end:
            count += 1  # 重叠，移除
        else:
            end = intervals[i][1]  # 不重叠，保留
    return count
```

### 为什么按结束时间？

结束越早 → 留给后续区间的空间越大 → 能选更多。

## 二、会议室问题（LeetCode 253）

求同时进行的最大会议数 = 最少需要的会议室数。

### 方法一：排序 + 最小堆

```java tab
int minMeetingRooms(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]); // 按开始时间
    PriorityQueue<Integer> pq = new PriorityQueue<>(); // 结束时间
    for (int[] interval : intervals) {
        if (!pq.isEmpty() && pq.peek() <= interval[0]) {
            pq.poll(); // 复用会议室
        }
        pq.offer(interval[1]);
    }
    return pq.size();
}
```

```typescript tab
function minMeetingRooms(intervals: number[][]): number {
    intervals.sort((a, b) => a[0] - b[0]); // 按开始时间
    const pq: number[] = []; // 结束时间（最小堆，此处简化为排序数组）
    for (const interval of intervals) {
        if (pq.length > 0 && pq[0] <= interval[0]) {
            pq.shift(); // 复用会议室
        }
        pq.push(interval[1]);
        pq.sort((a, b) => a - b);
    }
    return pq.length;
}
```

```python tab
import heapq

def min_meeting_rooms(intervals: list) -> int:
    intervals.sort(key=lambda x: x[0])  # 按开始时间
    pq = []  # 结束时间（最小堆）
    for interval in intervals:
        if pq and pq[0] <= interval[0]:
            heapq.heappop(pq)  # 复用会议室
        heapq.heappush(pq, interval[1])
    return len(pq)
```

### 方法二：扫描线（事件排序）

```java tab
int minMeetingRooms(int[][] intervals) {
    int n = intervals.length;
    int[] starts = new int[n], ends = new int[n];
    for (int i = 0; i < n; i++) { starts[i] = intervals[i][0]; ends[i] = intervals[i][1]; }
    Arrays.sort(starts); Arrays.sort(ends);

    int rooms = 0, maxRooms = 0, endPtr = 0;
    for (int i = 0; i < n; i++) {
        if (starts[i] >= ends[endPtr]) {
            endPtr++;
        } else {
            rooms++;
        }
        maxRooms = Math.max(maxRooms, rooms);
    }
    return maxRooms;
}
```

```typescript tab
function minMeetingRooms(intervals: number[][]): number {
    const n = intervals.length;
    const starts = intervals.map(i => i[0]).sort((a, b) => a - b);
    const ends = intervals.map(i => i[1]).sort((a, b) => a - b);

    let rooms = 0, maxRooms = 0, endPtr = 0;
    for (let i = 0; i < n; i++) {
        if (starts[i] >= ends[endPtr]) {
            endPtr++;
        } else {
            rooms++;
        }
        maxRooms = Math.max(maxRooms, rooms);
    }
    return maxRooms;
}
```

```python tab
def min_meeting_rooms(intervals: list) -> int:
    n = len(intervals)
    starts = sorted(i[0] for i in intervals)
    ends = sorted(i[1] for i in intervals)

    rooms, max_rooms, end_ptr = 0, 0, 0
    for i in range(n):
        if starts[i] >= ends[end_ptr]:
            end_ptr += 1
        else:
            rooms += 1
        max_rooms = max(max_rooms, rooms)
    return max_rooms
```

## 三、区间合并（LeetCode 56）

```java tab
int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    List<int[]> merged = new ArrayList<>();
    for (int[] interval : intervals) {
        if (merged.isEmpty() || merged.get(merged.size()-1)[1] < interval[0]) {
            merged.add(interval);
        } else {
            merged.get(merged.size()-1)[1] = Math.max(merged.get(merged.size()-1)[1], interval[1]);
        }
    }
    return merged.toArray(new int[0][]);
}
```

```typescript tab
function merge(intervals: number[][]): number[][] {
    intervals.sort((a, b) => a[0] - b[0]);
    const merged: number[][] = [];
    for (const interval of intervals) {
        if (merged.length === 0 || merged[merged.length - 1][1] < interval[0]) {
            merged.push(interval);
        } else {
            merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], interval[1]);
        }
    }
    return merged;
}
```

```python tab
def merge(intervals: list) -> list:
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged
```

## 四、区间调度变体

| 问题 | 策略 |
|------|------|
| 最多不重叠区间 | 按结束时间排序 + 贪心 |
| 最少移除使不重叠 | 同上（n - 最多保留） |
| 最少会议室 | 按开始排序 + 堆 |
| 区间合并 | 按开始排序 + 合并 |
| 用最少点覆盖所有区间 | 按结束排序 + 贪心放点 |
| 区间分组（LeetCode 2406） | 最少组数 = 最大重叠深度 |

### 用最少点覆盖所有区间

```java tab
// LeetCode 452: 用最少数量的箭引爆气球
int findMinArrowShots(int[][] points) {
    Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));
    int arrows = 1;
    int end = points[0][1];
    for (int i = 1; i < points.length; i++) {
        if (points[i][0] > end) {
            arrows++;
            end = points[i][1];
        }
    }
    return arrows;
}
```

```typescript tab
// LeetCode 452: 用最少数量的箭引爆气球
function findMinArrowShots(points: number[][]): number {
    points.sort((a, b) => a[1] - b[1]);
    let arrows = 1;
    let end = points[0][1];
    for (let i = 1; i < points.length; i++) {
        if (points[i][0] > end) {
            arrows++;
            end = points[i][1];
        }
    }
    return arrows;
}
```

```python tab
# LeetCode 452: 用最少数量的箭引爆气球
def find_min_arrow_shots(points: list) -> int:
    points.sort(key=lambda x: x[1])
    arrows = 1
    end = points[0][1]
    for i in range(1, len(points)):
        if points[i][0] > end:
            arrows += 1
            end = points[i][1]
    return arrows
```

## 五、贪心正确性证明

区间调度贪心的交换论证：
1. 设最优解的第一个区间为 A
2. 贪心选的第一个区间为 B（结束最早）
3. B.end ≤ A.end → 用 B 替换 A 不会与后续冲突
4. 因此贪心解 ≥ 最优解

## 六、面试要点

1. **按结束时间排序**：区间调度的核心贪心
2. **堆维护活跃区间**：会议室问题
3. **区间合并**：按开始排序 + 判断重叠
4. **交换论证**：证明贪心正确性
5. **LeetCode**：56、57、253、435、452、763、1288
