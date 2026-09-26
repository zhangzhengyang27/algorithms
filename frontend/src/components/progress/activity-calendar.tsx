'use client';

import { useMemo, useState } from 'react';
import { dayKey } from '@/store';

type Cell = { key: string; date: Date; count: number; future: boolean };

const WEEKDAY_LABELS = ['', '一', '', '三', '', '五', ''];
const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

/** 根据当日完成数返回热力色阶 class */
function heatClass(count: number): string {
  if (count <= 0) return 'bg-surface-2';
  if (count === 1) return 'bg-brand/30';
  if (count === 2) return 'bg-brand/55';
  if (count <= 4) return 'bg-brand/80';
  return 'bg-brand';
}

/**
 * GitHub 风格刷题热力日历：展示最近 18 周每天的完成题数。
 * 数据源为 store 的 solvedAt（slug -> ISO），按本地日期聚合。
 */
export function ActivityCalendar({ solvedAt }: { solvedAt: Record<string, string> }) {
  const [hover, setHover] = useState<{ key: string; count: number; label: string } | null>(null);

  // 每日完成数聚合
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const iso of Object.values(solvedAt)) {
      const k = dayKey(iso);
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }, [solvedAt]);

  // 构建网格：以「今天」结尾，向前推 17 周，对齐到周一开头
  const { weeks, monthMarks, totalSolvedDays, maxCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    // 本周周日作为网格末尾
    const dayOfWeek = (end.getDay() + 6) % 7; // 周一=0 ... 周日=6
    end.setDate(end.getDate() + (6 - dayOfWeek));
    const TOTAL_WEEKS = 18;
    const start = new Date(end);
    start.setDate(start.getDate() - (TOTAL_WEEKS * 7 - 1));

    const weeks: Cell[][] = [];
    const monthMarks: { index: number; label: string }[] = [];
    let totalSolvedDays = 0;
    let maxCount = 0;
    let lastMonth = -1;

    const cursor = new Date(start);
    for (let w = 0; w < TOTAL_WEEKS; w++) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const key = dayKey(cursor);
        const count = counts[key] ?? 0;
        const future = cursor.getTime() > today.getTime();
        col.push({ key, date: new Date(cursor), count: future ? 0 : count, future });
        if (!future && count > 0) {
          totalSolvedDays += 1;
          maxCount = Math.max(maxCount, count);
        }
        // 月份标记：每列首行（周一）若进入新月份则记录
        if (d === 0 && cursor.getMonth() !== lastMonth) {
          lastMonth = cursor.getMonth();
          monthMarks.push({ index: w, label: MONTH_LABELS[cursor.getMonth()] });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(col);
    }
    return { weeks, monthMarks, totalSolvedDays, maxCount };
  }, [counts]);

  return (
    <div className="bg-surface rounded-lg border border-edge p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-sm font-semibold">刷题打卡日历</h2>
        <div className="flex items-center gap-3 text-[11px] text-ink-3">
          <span>
            活跃 <b className="text-ink font-mono">{totalSolvedDays}</b> 天
          </span>
          <span className="flex items-center gap-1">
            少
            {[0, 1, 2, 3, 5].map((c) => (
              <span key={c} className={`w-2.5 h-2.5 rounded-[2px] ${heatClass(c)}`} />
            ))}
            多
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1 min-w-full">
          {/* 月份标签行 */}
          <div className="flex gap-[3px] pl-7 h-4 relative">
            {monthMarks.map((m) => (
              <span
                key={`${m.label}-${m.index}`}
                className="absolute text-[10px] text-ink-3 font-mono"
                style={{ left: `${m.index * 13}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {/* 星期标签列 */}
            <div className="flex flex-col gap-[3px] pr-1">
              {WEEKDAY_LABELS.map((label, i) => (
                <span key={i} className="h-[10px] text-[9px] leading-[10px] text-ink-3 font-mono w-5 text-right">
                  {label}
                </span>
              ))}
            </div>

            {/* 热力网格 */}
            <div className="flex gap-[3px]">
              {weeks.map((col, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {col.map((cell) => (
                    <div
                      key={cell.key}
                      onMouseEnter={() =>
                        !cell.future &&
                        setHover({
                          key: cell.key,
                          count: cell.count,
                          label: `${cell.date.getMonth() + 1}月${cell.date.getDate()}日`,
                        })
                      }
                      onMouseLeave={() => setHover(null)}
                      className={`w-[10px] h-[10px] rounded-[2px] ${
                        cell.future ? 'bg-transparent' : heatClass(cell.count)
                      } ${cell.key === hover?.key ? 'ring-1 ring-brand ring-offset-1 ring-offset-surface' : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-4 mt-2 text-[11px] text-ink-3 font-mono">
        {hover ? `${hover.label} · 完成 ${hover.count} 题` : maxCount > 0 ? `单日最多 ${maxCount} 题` : '完成题目后这里会被点亮'}
      </div>
    </div>
  );
}
