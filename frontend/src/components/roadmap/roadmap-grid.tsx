"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Clock, HardDrive, BarChart3, BookOpen, CheckCircle2, XCircle } from "lucide-react";

export interface RoadmapCard {
  slug: string;
  title: string;
  category: string;
  time?: string;
  space?: string;
  stable?: boolean;
  tags?: string[];
  hasViz: boolean;
}

interface Group {
  category: string;
  cards: RoadmapCard[];
}

/**
 * 算法路线图网格：分类锚点导航 + 关键词搜索 + 算法卡片。
 */
export function RoadmapGrid({ groups }: { groups: Group[] }) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("全部");

  const categories = useMemo(() => ["全部", ...groups.map((g) => g.category)], [groups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({
        category: g.category,
        cards: g.cards.filter((c) => {
          if (activeCat !== "全部" && g.category !== activeCat) return false;
          if (!q) return true;
          return (
            c.title.toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q) ||
            (c.tags ?? []).some((t) => t.toLowerCase().includes(q))
          );
        }),
      }))
      .filter((g) => g.cards.length > 0);
  }, [groups, query, activeCat]);

  const total = filtered.reduce((n, g) => n + g.cards.length, 0);

  return (
    <div>
      {/* 搜索 + 分类筛选 */}
      <div className="sticky top-14 z-30 -mx-4 px-4 md:mx-0 md:px-0 py-3 bg-bg/80 backdrop-blur-xl border-b border-edge mb-6">
        <div className="relative max-w-sm mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索算法、标签…"
            className="w-full pl-9 pr-3 py-2 bg-surface border border-edge rounded-md text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCat(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeCat === c
                  ? "bg-brand text-on-brand"
                  : "bg-surface border border-edge text-ink-3 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-3 mb-6 font-mono">共 {total} 个主题</p>

      {/* 卡片分组 */}
      <div className="space-y-10">
        {filtered.map((g) => (
          <section key={g.category}>
            <h2 className="font-display text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-brand rounded-full" />
              {g.category}
              <span className="text-xs text-ink-3 font-mono font-normal">({g.cards.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.cards.map((c) => (
                <Card key={c.slug} card={c} />
              ))}
            </div>
          </section>
        ))}
        {total === 0 && (
          <p className="text-center text-ink-3 py-16 text-sm">没有匹配的主题，换个关键词试试。</p>
        )}
      </div>
    </div>
  );
}

function Card({ card }: { card: RoadmapCard }) {
  return (
    <Link
      href={`/tutorials/${card.slug}`}
      className="group flex flex-col p-4 glass-card rounded-lg hover:border-brand/40 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-sm leading-snug group-hover:text-brand transition-colors">
          {card.title}
        </h3>
        {card.hasViz && (
          <span className="flex-shrink-0 w-5 h-5 rounded bg-brand-soft flex items-center justify-center" title="含可视化">
            <BarChart3 size={12} className="text-brand" />
          </span>
        )}
      </div>

      {/* 复杂度指标 */}
      {(card.time || card.space || card.stable !== undefined) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-[11px] font-mono text-ink-3">
          {card.time && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {card.time}
            </span>
          )}
          {card.space && (
            <span className="inline-flex items-center gap-1">
              <HardDrive size={11} />
              {card.space}
            </span>
          )}
          {card.stable !== undefined && (
            <span className={`inline-flex items-center gap-1 ${card.stable ? "text-ok" : "text-warn"}`}>
              {card.stable ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
              {card.stable ? "稳定" : "不稳定"}
            </span>
          )}
        </div>
      )}

      {/* 标签 */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {card.tags.slice(0, 3).map((t) => (
            <span key={t} className="font-mono text-[10px] text-ink-3 bg-surface-2 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 mt-3 text-[11px] text-brand opacity-0 group-hover:opacity-100 transition-opacity">
        <BookOpen size={12} />
        阅读教程
      </div>
    </Link>
  );
}
