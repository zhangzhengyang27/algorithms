import { ProblemSolver } from '@/components/problem/problem-solver';

// 动态题目路由：所有写入数据库的题目（含本次新增的 100+ 题）都通过 slug 从后端取数。
// 新增题目统一以 solve 作为运行函数名（与 defaultCode 中的函数名一致）。
// 既有 17 题的静态路由 problems/<slug>/page.tsx 仍然存在并优先匹配，互不影响。
//
// 已知：未知 slug 渲染 not-found 内容但 HTTP 仍是 200（软 404）。根因是 app/loading.tsx
// 让本路由走流式渲染——静态壳先以 200 冲出（响应里可见 template id="B:0" 边界），
// 之后 notFound() 抛错时状态已无法回改。tutorials/[slug] 能返回真 404 是因为它
// dynamicParams=false，在路由层就拒了，压根没进渲染。
export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProblemSolver slug={slug} runFnName="solve" />;
}
