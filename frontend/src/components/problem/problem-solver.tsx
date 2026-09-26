'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, FileText, BookOpen, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeEditor } from '@/components/editor/code-editor';
import { SolutionTabs } from '@/components/ui/solution-tabs';
import { ProblemVisualizer } from '@/components/problem/problem-visualizer';
import { ProblemRelatedLinks } from '@/components/problem/problem-related-links';
import { CompanyFrequencyBadges } from '@/components/problem/company-frequency-badges';
import { ProblemComments } from '@/components/problem/problem-comments';
import { ProblemsApi, type ProblemDetail } from '@/lib/api-client';
import { useProgressStore } from '@/store';

const DIFFICULTY_TEXT: Record<string, string> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
};

/** 解析文本中的 `inline code` 为 <code> 元素 */
function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="bg-surface-2 text-brand px-1 py-0.5 rounded text-[12px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: 'bg-ok/10 text-ok',
  MEDIUM: 'bg-warn/10 text-warn',
  HARD: 'bg-err/10 text-err',
};

const STATUS_TEXT: Record<string, string> = {
  NOT_STARTED: '未开始',
  ATTEMPTING: '尝试中',
  COMPLETED: '已完成',
};

const STATUS_STYLE: Record<string, string> = {
  NOT_STARTED: 'bg-ink-3/10 text-ink-3',
  ATTEMPTING: 'bg-warn/10 text-warn',
  COMPLETED: 'bg-ok/10 text-ok',
};

type AdaptedProblem = {
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  difficultyText: string;
  category: string;
  categorySlug: string;
  description: string;
  hints: string[];
  solutions: Record<string, string>;
  testCases: { input: string; expected: string }[];
  defaultCode: string;
};

/**
 * 修复 CommonMark 规范限制：当闭合 ** 前是全角标点且后紧跟非空白字符时，
 * 解析器不认为它是有效的加粗闭合标记。在闭合 ** 后插入空格解决。
 */
function fixBoldMarkdown(md: string): string {
  return md.replace(/([^\s])\*\*(?=[^\s\p{P}\p{S}])/gu, '$1** ');
}

function adapt(p: ProblemDetail): AdaptedProblem {
  const solutions = (p.solutions as Record<string, string>) ?? {};
  return {
    title: p.title,
    difficulty: p.difficulty,
    difficultyText: DIFFICULTY_TEXT[p.difficulty] ?? p.difficulty,
    category: p.category?.name ?? '',
    categorySlug: p.category?.slug ?? '',
    description: fixBoldMarkdown(p.descriptionMd),
    hints: Array.isArray(p.hints) ? (p.hints as string[]) : [],
    solutions,
    testCases: (p.testCases as { input: string; expected: string }[]) ?? [],
    defaultCode: p.defaultCode ?? '',
  };
}

// ─── 沙箱运行（Web Worker + 超时） ───────────────────────────────

const RUN_TIMEOUT_MS = 3000;

const WORKER_SOURCE = `self.onmessage = function (e) {
  var data = e.data;
  try {
    var fn = new Function(data.code + '\\nreturn ' + data.runFnName + ';')();
    var output = '';
    var hasFailure = false, hasExpected = false;
    for (var i = 0; i < data.testCases.length; i++) {
      var tc = data.testCases[i];
      var inner = tc.input.slice(tc.input.indexOf('(') + 1, tc.input.lastIndexOf(')'));
      var args = JSON.parse('[' + inner + ']');
      var result = fn.apply(null, args);
      var resultStr = (typeof result === 'object') ? JSON.stringify(result) : String(result);
      if (!tc.expected) {
        output += '测试: ' + tc.input + '\\n输出: ' + resultStr + '\\n\\n';
        continue;
      }
      hasExpected = true;
      var isJsonExpected = /^\\s*[[{]/.test(tc.expected);
      var passed;
      if (isJsonExpected) {
        try { passed = JSON.stringify(JSON.parse(tc.expected)) === JSON.stringify(result); }
        catch (err) { passed = resultStr === tc.expected; }
      } else {
        passed = resultStr === tc.expected;
      }
      if (!passed) hasFailure = true;
      output += '测试: ' + tc.input + '\\n期望: ' + tc.expected + '\\n结果: ' + resultStr + '\\n状态: ' + (passed ? '✓ 通过' : '✗ 失败') + '\\n\\n';
    }
    self.postMessage({ output: output.trim(), hasExpected: hasExpected, hasFailure: hasFailure });
  } catch (err) {
    self.postMessage({ error: err instanceof Error ? err.message : String(err) });
  }
};`;

interface RunResult {
  output?: string;
  error?: string;
  hasExpected?: boolean;
  hasFailure?: boolean;
}

function runCodeInWorker(
  code: string,
  runFnName: string,
  testCases: { input: string; expected: string }[],
): Promise<RunResult> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (r: RunResult) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };

    let worker: Worker;
    let url: string;
    try {
      const blob = new Blob([WORKER_SOURCE], { type: 'text/javascript' });
      url = URL.createObjectURL(blob);
      worker = new Worker(url);
    } catch (err) {
      finish({ error: err instanceof Error ? err.message : String(err) });
      return;
    }

    const cleanup = () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
    const timer = setTimeout(() => {
      cleanup();
      finish({ error: '执行超时（可能存在死循环），已终止' });
    }, RUN_TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<RunResult>) => {
      clearTimeout(timer);
      cleanup();
      finish(e.data);
    };
    worker.onerror = (e: ErrorEvent) => {
      clearTimeout(timer);
      cleanup();
      finish({ error: e.message || '执行出错' });
    };
    worker.postMessage({ code, runFnName, testCases });
  });
}

type LeftTab = 'description' | 'solutions' | 'visualizer';

export function ProblemSolver({
  slug,
  runFnName,
}: {
  slug: string;
  runFnName: string;
}) {
  const [problem, setProblem] = useState<AdaptedProblem | null>(null);
  const [problemId, setProblemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LeftTab>('description');

  const status = useProgressStore((s) => s.statusOfProblem(slug));
  const user = useProgressStore((s) => s.user);
  const markComplete = useProgressStore((s) => s.markProblemComplete);
  const markAttempting = useProgressStore((s) => s.markProblemAttempting);
  const resetProblem = useProgressStore((s) => s.resetProblem);
  const recordWrong = useProgressStore((s) => s.recordWrong);

  useEffect(() => {
    let active = true;
    ProblemsApi.bySlug(slug)
      .then((p) => {
        if (active) {
          setProblem(adapt(p));
          setProblemId(p.id);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [slug]);

  const handleRun = async (code: string) => {
    if (!problem) return { error: '题目加载中' };
    const result = await runCodeInWorker(code, runFnName, problem.testCases);
    if (result.error) return { error: result.error };
    if (result.hasExpected && result.hasFailure) recordWrong(slug);
    return { output: result.output ?? '' };
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-56px)] lg:h-[calc(100vh-56px)] flex items-center justify-center text-ink-3 text-sm">
        题目加载中…
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center text-err text-sm">
        加载失败：{error}
      </div>
    );
  }
  if (!problem) return null;

  return (
    <div className="min-h-[calc(100vh-56px)] lg:h-[calc(100vh-56px)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 glass-card shrink-0">
        <Link
          href="/problems"
          className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          题库
        </Link>
        <span className="text-edge-2">|</span>
        <h1 className="text-sm font-semibold text-ink truncate min-w-0 max-w-[30vw] sm:max-w-none sm:min-w-0">{problem.title}</h1>
        <span className={clsx('text-[10px] font-mono px-1.5 py-0.5 rounded', DIFFICULTY_STYLE[problem.difficulty])}>
          {problem.difficultyText}
        </span>
        {problem.category && (
          <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-surface-2 text-ink-3 border border-edge/60">
            {problem.category}
          </span>
        )}

        {/* 进度标记控件：标记完成 / 尝试中 / 重置，并写回后端 */}
        <div className="ml-auto flex items-center gap-1.5">
          {!user ? (
            <span className="text-[11px] text-ink-3">登录后保存进度</span>
          ) : (
            <>
              <span className={clsx('text-[10px] font-mono px-1.5 py-0.5 rounded', STATUS_STYLE[status])}>
                {STATUS_TEXT[status]}
              </span>
              {status !== 'COMPLETED' && (
                <button
                  onClick={() => markComplete(slug, problemId ?? undefined)}
                  className="text-[11px] px-2 py-1 rounded border border-brand/40 text-brand hover:bg-brand/10 transition-colors"
                >
                  标记完成
                </button>
              )}
              {status === 'NOT_STARTED' && (
                <button
                  onClick={() => markAttempting(slug, problemId ?? undefined)}
                  className="text-[11px] px-2 py-1 rounded border border-edge text-ink-3 hover:text-ink transition-colors"
                >
                  尝试中
                </button>
              )}
              {status !== 'NOT_STARTED' && (
                <button
                  onClick={() => resetProblem(slug, problemId ?? undefined)}
                  className="text-[11px] px-2 py-1 rounded border border-edge text-ink-3 hover:text-err transition-colors"
                >
                  重置
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Split panels */}
      <div className={clsx(
        'flex-1 min-h-0 grid divide-x divide-edge',
        activeTab === 'visualizer' ? 'lg:grid-cols-1' : 'lg:grid-cols-2',
      )}>
        {/* Left panel */}
        <div className="flex flex-col min-h-0 lg:overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-0 glass-card px-4 shrink-0">
            <button
              onClick={() => setActiveTab('description')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-colors cursor-pointer',
                activeTab === 'description'
                  ? 'border-brand text-brand font-medium'
                  : 'border-transparent text-ink-3 hover:text-ink',
              )}
            >
              <FileText size={13} />
              描述
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-colors cursor-pointer',
                activeTab === 'solutions'
                  ? 'border-brand text-brand font-medium'
                  : 'border-transparent text-ink-3 hover:text-ink',
              )}
            >
              <BookOpen size={13} />
              题解
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-colors cursor-pointer',
                activeTab === 'visualizer'
                  ? 'border-brand text-brand font-medium'
                  : 'border-transparent text-ink-3 hover:text-ink',
              )}
            >
              <BarChart2 size={13} />
              可视化
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 lg:overflow-y-auto p-5">
            {activeTab === 'description' ? (
              <div className="space-y-6">
                {/* 反向关联：对应教程 + 可视化 */}
                <ProblemRelatedLinks slug={slug} />
                <CompanyFrequencyBadges slug={slug} />
                {/* Problem description */}
                <div className="text-sm text-ink-2 leading-7 problem-md">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="my-3 leading-7">{children}</p>,
                      ul: ({ children }) => <ul className="my-3 ml-5 list-disc space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="my-3 ml-5 list-decimal space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-7">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                      code: ({ className, children }) => {
                        const isBlock = className?.startsWith('language-');
                        if (isBlock) return <code className={`${className ?? ''} text-[13px] font-mono`}>{children}</code>;
                        return <code className="bg-surface-2 text-brand px-1 py-0.5 rounded text-[13px] font-mono">{children}</code>;
                      },
                      pre: ({ children }) => <pre className="my-3 p-3 bg-bg border border-edge rounded-lg overflow-x-auto text-[13px] font-mono">{children}</pre>,
                      table: ({ children }) => <div className="my-3 overflow-x-auto"><table className="border-collapse text-[13px]">{children}</table></div>,
                      th: ({ children }) => <th className="border border-edge px-2 py-1 font-semibold text-ink">{children}</th>,
                      td: ({ children }) => <td className="border border-edge px-2 py-1">{children}</td>,
                    }}
                  >
                    {problem.description}
                  </ReactMarkdown>
                </div>

                {/* Test cases */}
                {problem.testCases.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">
                      示例
                    </h3>
                    <div className="space-y-2">
                      {problem.testCases.map((tc, i) => (
                        <div key={i} className="p-3 glass-card rounded-md text-[13px] font-mono">
                          <div className="text-ink-3">输入: {tc.input}</div>
                          {tc.expected && <div className="text-ok">输出: {tc.expected}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints */}
                {problem.hints.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-3 uppercase tracking-wide mb-3">
                      <Lightbulb size={13} className="text-warn" />
                      提示
                    </h3>
                    <ul className="space-y-1.5">
                      {problem.hints.map((hint, i) => (
                        <li key={i} className="text-ink-3 text-[13px] leading-6">
                          {i + 1}. {renderInlineCode(hint)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 评论 / 打卡社区 */}
                {problemId && <ProblemComments problemId={problemId} />}
              </div>
            ) : activeTab === 'solutions' ? (
              <div>
                {Object.keys(problem.solutions).length > 0 ? (
                  <SolutionTabs solutions={problem.solutions} />
                ) : (
                  <div className="text-sm text-ink-3 py-8 text-center">
                    暂无题解
                  </div>
                )}
              </div>
            ) : (
              <ProblemVisualizer
                solutions={problem.solutions}
                testCases={problem.testCases}
                title={problem.title}
              />
            )}
          </div>
        </div>

        {/* Right panel: Code editor (hidden in visualizer mode) */}
        {activeTab !== 'visualizer' && (
          <div className="flex flex-col min-h-0 h-[60vh] lg:h-auto">
            <CodeEditor
              initialCode={problem.defaultCode}
              language="javascript"
              onRun={handleRun}
              height="100%"
            />
          </div>
        )}
      </div>
    </div>
  );
}
