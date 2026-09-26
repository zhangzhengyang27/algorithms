import Link from 'next/link';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { ArrowRight, BarChart3, Book, Zap, ChevronRight, Play, CheckCircle, Target, Terminal, Map } from 'lucide-react';
import { DailyProblem } from '@/components/home/daily-problem';

// ── 构建期统计（静态页面用，避免与真实内容脱节）─────────────────────────────
const countDirPages = (rel: string) => {
  try {
    const dir = path.join(process.cwd(), 'src/app', rel);
    return readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).length;
  } catch {
    return 0;
  }
};
const VISUALIZER_COUNT = countDirPages('visualizer');
const PROBLEMS_COUNT = countDirPages('problems');
const TUTORIALS_COUNT = (() => {
  try {
    return readdirSync(path.join(process.cwd(), 'src/app/tutorials'))
      .filter((f) => f.endsWith('.md')).length;
  } catch {
    return 0;
  }
})();

const features = [
  {
    title: '算法学习路线图',
    description: '按分类浏览 100+ 算法主题，含复杂度、标签与可视化入口，支持搜索筛选',
    icon: Map,
    href: '/roadmap',
    span: 'md:col-span-2',
  },
  {
    title: '排序算法可视化',
    description: '冒泡、选择、插入、快排、归并、堆排——六种排序逐步动画拆解',
    icon: BarChart3,
    href: '/visualizer/sorting',
    span: '',
  },
  {
    title: '搜索算法可视化',
    description: '二分查找、BFS、DFS 动画演示',
    icon: Target,
    href: '/visualizer/searching',
    span: '',
  },
  {
    title: '树与图可视化',
    description: '二叉树遍历、图搜索算法动态演示',
    icon: Zap,
    href: '/visualizer/trees',
    span: '',
  },
  {
    title: '数据结构教程',
    description: '40+ 篇 Markdown 教程，从数组到红黑树',
    icon: Book,
    href: '/tutorials',
    span: '',
  },
  {
    title: '算法题练习',
    description: 'LeetCode 风格题目，内置 Monaco 编辑器在线运行',
    icon: Terminal,
    href: '/problems',
    span: 'md:col-span-2',
  },
];

const learningPath = [
  { title: '基础排序', progress: 100, href: '/visualizer/sorting' },
  { title: '搜索算法', progress: 60, href: '/visualizer/searching' },
  { title: '二叉树', progress: 30, href: '/visualizer/trees' },
  { title: '图算法', progress: 0, href: '/visualizer/graphs' },
  { title: '动态规划', progress: 0, href: '/problems' },
];

const recentProblems = [
  { title: '两数之和', difficulty: '简单', status: 'completed', href: '/problems/two-sum' },
  { title: '有效的括号', difficulty: '简单', status: 'attempting', href: '/problems/valid-parentheses' },
  { title: '爬楼梯', difficulty: '简单', status: 'not_started', href: '/problems/climbing-stairs' },
];

const codeSnippet = `function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;
  const pivot = arr[(lo + hi) >> 1];
  let i = lo, j = hi;
  while (i <= j) {
    while (arr[i] < pivot) i++;
    while (arr[j] > pivot) j--;
    if (i <= j) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++; j--;
    }
  }
  quickSort(arr, lo, j);
  quickSort(arr, i, hi);
  return arr;
}`;

export default function HomePage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-14">
      {/* ─── Hero: split layout ─── */}
      <section className="grid lg:grid-cols-[1fr_minmax(0,520px)] gap-10 lg:gap-16 items-center mb-16">
        <div className="anim-fade-up">
          <p className="font-mono text-xs text-brand tracking-widest uppercase mb-4">
            Interactive Algorithm Learning
          </p>
          <h1 className="font-display text-4xl md:text-[3.4rem] font-bold leading-[1.08] tracking-tight mb-5">
            看见算法的
            <br />
            每一步运转
          </h1>
          <p className="text-ink-2 text-base md:text-lg leading-relaxed max-w-md mb-8">
            动画可视化 × 深度教程 × 在线刷题——
            把抽象的指针移动变成肉眼可追踪的帧。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/visualizer/sorting"
              className="group inline-flex items-center gap-2 px-5 py-2.5 btn-gradient rounded-md text-sm font-medium transition-all"
            >
              启动可视化
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface border border-edge hover:border-edge-2 rounded-md text-sm font-medium text-ink-2 hover:text-ink transition-all"
            >
              浏览学习路线图
            </Link>
          </div>

          {/* Inline stats */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-10 pt-6 border-t border-edge">
            {[
              { value: String(VISUALIZER_COUNT || 126), label: '可视化模块' },
              { value: `${TUTORIALS_COUNT || 137}`, label: '深度教程' },
              { value: String(PROBLEMS_COUNT || 18), label: '本地练习题目' },
              { value: 'O(n log n)', label: '从排序开始' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-xl font-bold text-ink">{s.value}</div>
                <div className="text-xs text-ink-3 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Code terminal panel */}
        <div className="anim-fade-up stagger-2 hidden lg:block">
          <div className="rounded-lg border border-edge bg-surface shadow-2xl shadow-black/20 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-edge bg-surface-2/50">
              <span className="w-2.5 h-2.5 rounded-full bg-err/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-warn/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-ok/70" />
              <span className="ml-3 text-xs text-ink-3 font-mono">quicksort.ts</span>
            </div>
            <pre className="p-5 text-[12.5px] leading-relaxed font-mono text-ink-2 overflow-x-auto">
              <code>{codeSnippet}</code>
            </pre>
            <div className="px-4 py-2.5 border-t border-edge flex items-center gap-2 text-xs text-ink-3 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
              pivot=7 · 比较 23 次 · 交换 8 次 · 0.4ms
            </div>
          </div>
        </div>
      </section>

      {/* ─── Learning path: horizontal rail ─── */}
      <section className="mb-14 anim-fade-up stagger-3">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold tracking-tight">学习路径</h2>
          <Link href="/roadmap" className="text-xs text-ink-3 hover:text-brand transition-colors font-mono">
            /roadmap →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {learningPath.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative p-4 glass-card rounded-lg hover:border-brand/40 transition-all hover:-translate-y-0.5"
            >
              <div className="font-mono text-[10px] text-ink-3 mb-1.5">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="font-medium text-sm group-hover:text-brand transition-colors">
                {item.title}
              </div>
              <div className="mt-3 h-[3px] bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="mt-1.5 font-mono text-[10px] text-ink-3">{item.progress}%</div>
              {item.progress === 100 && (
                <CheckCircle size={13} className="absolute top-3 right-3 text-ok" />
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Bento grid: features + recent problems ─── */}
      <section className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Feature cards */}
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight mb-5">探索功能</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href + feature.title}
                  href={feature.href}
                  className={`group p-5 glass-card rounded-lg hover:border-edge-2 transition-all hover:-translate-y-0.5 ${feature.span}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-md bg-brand-soft flex items-center justify-center">
                      <Icon size={17} className="text-brand" />
                    </div>
                    <ArrowRight
                      size={14}
                      className="ml-auto text-ink-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </div>
                  <h3 className="font-medium text-sm mb-1.5 group-hover:text-brand transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-ink-3 text-xs leading-relaxed">{feature.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent problems rail */}
        <div>
          {/* 每日一题 */}
          <div className="mb-5">
            <DailyProblem />
          </div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold tracking-tight">最近题目</h2>
            <Link href="/problems" className="text-xs text-ink-3 hover:text-brand transition-colors font-mono">
              all →
            </Link>
          </div>
          <div className="glass-card rounded-lg divide-y divide-edge">
            {recentProblems.map((problem) => (
              <Link
                key={problem.title}
                href={problem.href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="w-7 h-7 rounded-md bg-surface-2 flex items-center justify-center shrink-0">
                  {problem.status === 'completed' ? (
                    <CheckCircle size={14} className="text-ok" />
                  ) : problem.status === 'attempting' ? (
                    <Play size={13} className="text-warn" />
                  ) : (
                    <ChevronRight size={14} className="text-ink-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{problem.title}</div>
                </div>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                    problem.status === 'completed'
                      ? 'text-ok bg-ok/10'
                      : problem.status === 'attempting'
                      ? 'text-warn bg-warn/10'
                      : 'text-ink-3 bg-surface-2'
                  }`}
                >
                  {problem.status === 'completed' ? 'AC' : problem.status === 'attempting' ? 'WA' : '--'}
                </span>
              </Link>
            ))}
          </div>

          {/* Quick CTA */}
          <Link
            href="/problems/two-sum"
            className="mt-3 flex items-center justify-between px-4 py-3.5 rounded-lg border border-dashed border-edge-2 text-sm text-ink-2 hover:text-brand hover:border-brand/40 transition-all group"
          >
            <span>继续刷题：两数之和</span>
            <ArrowRight size={14} className="text-ink-3 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </section>
    </div>
  );
}
