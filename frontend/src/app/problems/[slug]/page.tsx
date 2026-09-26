import { ProblemSolver } from '@/components/problem/problem-solver';

// 动态题目路由：所有写入数据库的题目（含本次新增的 100+ 题）都通过 slug 从后端取数。
// 新增题目统一以 solve 作为运行函数名（与 defaultCode 中的函数名一致）。
// 既有 17 题的静态路由 problems/<slug>/page.tsx 仍然存在并优先匹配，互不影响。
export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProblemSolver slug={slug} runFnName="solve" />;
}
