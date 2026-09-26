'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle, Circle, AlertCircle, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { ProblemsApi, CategoriesApi, type Problem, type Category } from '@/lib/api-client';
import { useProgressStore } from '@/store';

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  EASY: 'text-ok',
  MEDIUM: 'text-warn',
  HARD: 'text-err',
};

type FilterKey = 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'EASY', label: '简单' },
  { key: 'MEDIUM', label: '中等' },
  { key: 'HARD', label: '困难' },
];

const PAGE_SIZE = 50;

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tag, setTag] = useState('');
  const [tagOptions, setTagOptions] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const statusOfProblem = useProgressStore((s) => s.statusOfProblem);
  const completedProblems = useProgressStore((s) => s.completedProblems);
  const attemptingProblems = useProgressStore((s) => s.attemptingProblems);

  // 加载分类列表
  useEffect(() => {
    CategoriesApi.list()
      .then(setCategories)
      .catch(() => {});
    ProblemsApi.tags()
      .then(setTagOptions)
      .catch(() => {});
  }, []);

  // 加载题目（服务端分页）
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ProblemsApi.listPaginated({
        page,
        pageSize: PAGE_SIZE,
        categoryId: categoryId || undefined,
        difficulty: filter !== 'ALL' ? filter : undefined,
        search: search.trim() || undefined,
        tag: tag || undefined,
      });
      setProblems(res.items);
      setTotal(res.total);
    } catch {
      // fallback: 无分页
      try {
        const rows = await ProblemsApi.list();
        setProblems(rows);
        setTotal(rows.length);
      } catch {}
    }
    setLoading(false);
  }, [page, filter, categoryId, search, tag]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchProblems 内部 setState 均在 await 之后
    fetchProblems();
  }, [fetchProblems]);

  // 搜索防抖
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight mb-1">题库</h1>
        <p className="text-ink-3 text-sm">LeetCode 全量题目，支持在线运行与多语言题解</p>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 p-4 bg-surface rounded-lg border border-edge">
        <div className="flex items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ok" />
            <span className="text-ink-2">已通过 <b className="text-ink">{completedProblems.size}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warn" />
            <span className="text-ink-2">尝试中 <b className="text-ink">{attemptingProblems.size}</b></span>
          </div>
        </div>
        <div className="ml-auto text-xs text-ink-3 font-mono">
          共 {total} 题
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        {/* Difficulty tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-surface rounded-lg border border-edge">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={clsx(
                'px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer',
                filter === f.key
                  ? 'bg-brand/10 text-brand font-medium'
                  : 'text-ink-3 hover:text-ink',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category select */}
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="px-3 py-2 text-xs bg-surface border border-edge rounded-lg text-ink focus:outline-none focus:border-brand/50 cursor-pointer"
        >
          <option value="">全部分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索题目…"
            className="w-full pl-8 pr-3 py-2 text-sm bg-surface border border-edge rounded-lg text-ink placeholder:text-ink-3/60 focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>
      </div>

      {/* Tag filter chips */}
      {tagOptions.length > 0 && (
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => { setTag(''); setPage(1); }}
            className={clsx(
              'shrink-0 px-2.5 py-1 text-[11px] rounded-full border transition-colors cursor-pointer',
              tag === ''
                ? 'bg-brand text-on-brand border-brand'
                : 'bg-surface text-ink-3 border-edge hover:text-ink',
            )}
          >
            全部标签
          </button>
          {tagOptions.slice(0, 24).map((t) => (
            <button
              key={t.tag}
              onClick={() => { setTag(t.tag); setPage(1); }}
              className={clsx(
                'shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full border transition-colors cursor-pointer',
                tag === t.tag
                  ? 'bg-brand text-on-brand border-brand'
                  : 'bg-surface text-ink-3 border-edge hover:text-ink',
              )}
            >
              {t.tag}
              <span className={clsx('font-mono text-[9px]', tag === t.tag ? 'text-on-brand/70' : 'text-ink-3/60')}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface rounded-lg border border-edge overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[40px_32px_1fr_64px] sm:grid-cols-[48px_40px_1fr_80px_120px] items-center px-4 py-2.5 border-b border-edge text-[11px] font-mono text-ink-3 uppercase tracking-wider">
          <span className="text-center">#</span>
          <span>状态</span>
          <span>题目</span>
          <span>难度</span>
          <span className="hidden sm:block">分类</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-edge/60">
          {loading ? (
            <div className="px-4 py-12 text-center text-sm text-ink-3">加载中…</div>
          ) : problems.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-ink-3">没有匹配的题目</div>
          ) : (
            problems.map((problem, i) => {
              const status = statusOfProblem(problem.slug);
              const index = (page - 1) * PAGE_SIZE + i + 1;
              return (
                <div
                  key={problem.slug}
                  className="group relative grid grid-cols-[40px_32px_1fr_64px] sm:grid-cols-[48px_40px_1fr_80px_120px] items-center px-4 py-3 hover:bg-surface-2/50 transition-colors"
                >
                  {/* 拉伸链接：铺满整行负责跳转，避免与外链 <a> 嵌套（无效 HTML） */}
                  <Link
                    href={`/problems/${problem.slug}`}
                    className="absolute inset-0 z-0"
                    aria-label={problem.title}
                  />
                  <span className="text-center text-xs text-ink-3 font-mono">{index}</span>
                  <span className="flex items-center justify-center">
                    {status === 'COMPLETED' ? (
                      <CheckCircle size={16} className="text-ok" />
                    ) : status === 'ATTEMPTING' ? (
                      <AlertCircle size={16} className="text-warn" />
                    ) : (
                      <Circle size={16} className="text-edge-2 group-hover:text-ink-3 transition-colors" />
                    )}
                  </span>
                  <span className="flex items-center gap-1.5 min-w-0 pr-2">
                    <span className="text-sm text-ink group-hover:text-brand transition-colors truncate">
                      {problem.title}
                    </span>
                    {(problem.tags ?? []).slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="hidden md:inline-block shrink-0 px-1.5 py-0.5 text-[10px] rounded bg-brand-soft text-brand/80 border border-brand/15"
                      >
                        {t}
                      </span>
                    ))}
                    <a
                      href={`https://leetcode.cn/problems/${problem.slug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 shrink-0 text-ink-3 hover:text-brand transition-colors"
                      title="在 LeetCode 打开"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </span>
                  <span className={clsx('text-xs font-medium', DIFFICULTY_COLOR[problem.difficulty])}>
                    {DIFFICULTY_LABEL[problem.difficulty]}
                  </span>
                  <span className="hidden sm:block">
                    <span className="inline-block px-2 py-0.5 text-[11px] rounded-full bg-surface-2 text-ink-3 border border-edge/60 truncate max-w-[100px]">
                      {problem.category?.name ?? '未分类'}
                    </span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-md border border-edge text-ink-3 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          
          {generatePageNumbers(page, totalPages).map((p, i) =>
            p === -1 ? (
              <span key={`ellipsis-${i}`} className="px-2 text-xs text-ink-3">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={clsx(
                  'w-8 h-8 text-xs rounded-md transition-colors cursor-pointer',
                  p === page
                    ? 'bg-brand text-white font-medium'
                    : 'text-ink-3 hover:text-ink hover:bg-surface-2',
                )}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-md border border-edge text-ink-3 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>

          <span className="ml-3 text-xs text-ink-3 font-mono">
            {page}/{totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

/** 生成页码数组，超出范围用 -1 表示省略号 */
function generatePageNumbers(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  
  const pages: number[] = [];
  pages.push(1);
  
  if (current > 3) pages.push(-1);
  
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  
  if (current < total - 2) pages.push(-1);
  
  pages.push(total);
  return pages;
}
