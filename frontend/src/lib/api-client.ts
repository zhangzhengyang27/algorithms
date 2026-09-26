import { apiGet, apiPost, apiDelete } from "./api";

// Mirror backend response shapes. Kept loose to avoid coupling to Prisma.
export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
};

export type Problem = {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  descriptionMd: string;
  examples: unknown[];
  solutions: Record<string, string>;
  hints: unknown;
  tags?: string[];
  category?: Category;
};

// 后端 /problems/:slug 返回的真实结构（与 Prisma Problem 对齐）
export type ProblemDetail = {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  descriptionMd: string;
  examples: unknown[];
  solutions: Record<string, string>;
  hints: unknown;
  testCases: { input: string; expected: string }[];
  defaultCode?: string;
  timeLimit?: number;
  memoryLimit?: number;
  category?: { id: string; name: string; slug: string };
};

export type Note = {
  id: string;
  problemId: string;
  content: string;
  createdAt?: string;
};

export type ProgressStatus = "NOT_STARTED" | "ATTEMPTING" | "COMPLETED";
export type Progress = {
  id: string;
  userId: string;
  problemId: string;
  status: ProgressStatus;
  updatedAt?: string;
  /** 首次标记完成的时间戳，用于打卡日历 / 连续天数统计 */
  completedAt?: string | null;
  /** 后端 GET /progress 已 include problem，直接带出 slug，无需另行拉取题目 */
  problem?: { slug: string };
};

export type PaginatedProblems = {
  items: Problem[];
  total: number;
  page: number;
  pageSize: number;
};

export const ProblemsApi = {
  list: (token?: string) =>
    apiGet<Problem[]>(`/problems`, {
      token,
      cache: "no-store",
      next: { tags: ["problems"] },
    }),
  count: () =>
    apiGet<{ count: number }>(`/problems/count`, { cache: "no-store" }),
  listPaginated: (params: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    difficulty?: string;
    search?: string;
    tag?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params.categoryId) qs.set('categoryId', params.categoryId);
    if (params.difficulty) qs.set('difficulty', params.difficulty);
    if (params.search) qs.set('search', params.search);
    if (params.tag) qs.set('tag', params.tag);
    return apiGet<PaginatedProblems>(`/problems?${qs.toString()}`, {
      cache: "no-store",
    });
  },
  /** 获取全部标签及其题目数，供标签筛选器渲染 */
  tags: () =>
    apiGet<{ tag: string; count: number }[]>(`/problems/tags`, {
      cache: "no-store",
    }),
  bySlug: (slug: string) =>
    apiGet<ProblemDetail>(`/problems/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      next: { tags: [`problem:${slug}`] },
    }),
};

export const CategoriesApi = {
  list: () =>
    apiGet<Category[]>(`/categories`, {
      cache: "no-store",
      next: { tags: ["categories"] },
    }),
};

export const ProgressApi = {
  list: () =>
    apiGet<Progress[]>(`/progress`, {
      cache: "no-store",
      next: { tags: ["progress"] },
    }),
  upsert: (problemId: string, status: ProgressStatus) =>
    apiPost<Progress>(`/progress`, { problemId, status }, { cache: "no-store" }),
};

export const NotesApi = {
  listByProblem: (problemId: string) =>
    apiGet<Note[]>(`/notes?problemId=${encodeURIComponent(problemId)}`, {
      cache: "no-store",
    }),
  create: (problemId: string, content: string) =>
    apiPost<Note>(
      `/notes`,
      { problemId, content },
      { cache: "no-store" },
    ),
};

export const AuthApi = {
  register: (email: string, password: string, name?: string) =>
    apiPost<{ user: { id: string; email: string } }>(
      `/auth/register`,
      { email, password, name },
      { cache: "no-store" },
    ),
  login: (email: string, password: string) =>
    apiPost<{ user: { id: string; email: string } }>(
      `/auth/login`,
      { email, password },
      { cache: "no-store" },
    ),
  refresh: () =>
    apiPost<{ user: { id: string; email: string } }>(
      `/auth/refresh`,
      {},
      { cache: "no-store" },
    ),
  logout: () =>
    apiPost<{ success: boolean }>(`/auth/logout`, {}, { cache: "no-store" }),
};

export type CommentItem = {
  id: string;
  userId: string;
  problemId: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
};

export type PaginatedComments = {
  items: CommentItem[];
  total: number;
  page: number;
  pageSize: number;
};

export const CommentsApi = {
  list: (problemId: string, page = 1) =>
    apiGet<PaginatedComments>(
      `/comments?problemId=${encodeURIComponent(problemId)}&page=${page}`,
      { cache: "no-store" },
    ),
  create: (problemId: string, content: string) =>
    apiPost<CommentItem>(`/comments`, { problemId, content }, { cache: "no-store" }),
  remove: (id: string) =>
    apiDelete<{ success: boolean }>(`/comments/${id}`, { cache: "no-store" }),
};
