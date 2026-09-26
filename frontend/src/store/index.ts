import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProgressApi } from '@/lib/api-client';
import type { ProgressStatus, Progress } from '@/lib/api-client';

export type ProblemStatus = 'NOT_STARTED' | 'ATTEMPTING' | 'COMPLETED';

interface Problem {
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  status: ProblemStatus;
  lastAttempt?: string;
}

interface AuthUser {
  id: string;
  email: string;
}

/** 错题本条目：记录首次出错时间与间隔重复复习调度 */
export interface WrongEntry {
  firstAt: string;   // 首次出错 ISO
  lastAt: string;    // 最近一次出错 ISO
  count: number;     // 累计出错次数
  nextReview: string; // 下次复习 ISO（间隔重复）
  stage: number;      // 复习阶段（0 起始，每过一轮 +1）
}

/** 间隔重复间隔（天），参考 SuperMemo SM-2 简化曲线 */
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30];

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** 取本地时区的 yyyy-mm-dd 键 */
export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 由 solvedAt 映射推导连续打卡天数（从今天/昨天向前回溯） */
export function computeStreak(solvedAt: Record<string, string>): number {
  const days = new Set(Object.values(solvedAt).map((v) => dayKey(v)));
  if (days.size === 0) return 0;
  const cursor = new Date();
  // 今天还没打卡时，从昨天开始数（不中断连续）
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

interface ProgressState {
  user: AuthUser | null;

  totalProblems: number;
  totalTutorials: number;
  bootstrapped: boolean;

  completedProblems: Set<string>;
  attemptingProblems: Set<string>;
  completedTutorials: Set<string>;
  /** slug -> 完成时间 ISO，打卡日历 / streak 的数据源 */
  solvedAt: Record<string, string>;
  /** slug -> 错题条目，错题本 + 间隔重复 */
  wrongProblems: Record<string, WrongEntry>;
  totalPracticeTime: number;

  setAuth: (user: AuthUser | null) => void;
  setTotals: (totalProblems: number, totalTutorials: number) => void;
  setBootstrapped: (v: boolean) => void;
  loadProgress: (rows: Progress[]) => void;

  markProblemComplete: (slug: string, problemId?: string) => void;
  markProblemAttempting: (slug: string, problemId?: string) => void;
  markTutorialComplete: (slug: string) => void;
  resetProblem: (slug: string, problemId?: string) => void;

  /** 记录一次运行失败（供错题本使用） */
  recordWrong: (slug: string) => void;
  /** 复习通过：推进间隔重复阶段 */
  advanceReview: (slug: string) => void;
  /** 移除错题记录 */
  removeWrong: (slug: string) => void;

  addPracticeTime: (minutes: number) => void;

  statusOfProblem: (slug: string) => ProblemStatus;
  /** 由 solvedAt 推导的连续打卡天数 */
  streak: () => number;
  getStats: () => {
    totalProblems: number;
    completedProblems: number;
    attemptingProblems: number;
    totalTutorials: number;
    completedTutorials: number;
    completionRate: number;
  };
}

function inferStatus(slug: string, completed: Set<string>, attempting: Set<string>): ProblemStatus {
  if (completed.has(slug)) return 'COMPLETED';
  if (attempting.has(slug)) return 'ATTEMPTING';
  return 'NOT_STARTED';
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      user: null,

      totalProblems: 0,
      totalTutorials: 0,
      bootstrapped: false,

      completedProblems: new Set<string>(),
      attemptingProblems: new Set<string>(),
      completedTutorials: new Set<string>(),
      solvedAt: {},
      wrongProblems: {},
      totalPracticeTime: 0,

      setAuth: (user) => set({ user }),
      setTotals: (totalProblems, totalTutorials) => set({ totalProblems, totalTutorials }),
      setBootstrapped: (v) => set({ bootstrapped: v }),

      loadProgress: (rows) => {
        const completed = new Set<string>();
        const attempting = new Set<string>();
        const solvedAt: Record<string, string> = { ...get().solvedAt };
        for (const row of rows) {
          // 后端 GET /progress 已 include problem，直接用 row.problem.slug
          const slug = row.problem?.slug;
          if (!slug) continue;
          if (row.status === 'COMPLETED') {
            completed.add(slug);
            // 后端 completedAt 是打卡日历的权威数据源
            if (row.completedAt) solvedAt[slug] = row.completedAt;
            else if (!solvedAt[slug]) solvedAt[slug] = row.updatedAt ?? new Date().toISOString();
          } else if (row.status === 'ATTEMPTING') attempting.add(slug);
        }
        set({ completedProblems: completed, attemptingProblems: attempting, solvedAt });
      },

      markProblemComplete: (slug, problemId) => {
        set((state) => {
          const completed = new Set(state.completedProblems);
          completed.add(slug);
          const attempting = new Set(state.attemptingProblems);
          attempting.delete(slug);
          // 记录完成时间（已有则保留首次时间）；完成后从错题本移除
          const solvedAt = { ...state.solvedAt };
          if (!solvedAt[slug]) solvedAt[slug] = new Date().toISOString();
          const wrongProblems = { ...state.wrongProblems };
          delete wrongProblems[slug];
          return { completedProblems: completed, attemptingProblems: attempting, solvedAt, wrongProblems };
        });
        // 乐观更新本地后，登录用户写回后端
        if (problemId && get().user) {
          ProgressApi.upsert(problemId, 'COMPLETED').catch(() => {});
        }
      },

      markProblemAttempting: (slug, problemId) => {
        set((state) => {
          const completed = new Set(state.completedProblems);
          completed.delete(slug);
          const attempting = new Set(state.attemptingProblems);
          attempting.add(slug);
          return { completedProblems: completed, attemptingProblems: attempting };
        });
        if (problemId && get().user) {
          ProgressApi.upsert(problemId, 'ATTEMPTING').catch(() => {});
        }
      },

      resetProblem: (slug, problemId) => {
        set((state) => {
          const completed = new Set(state.completedProblems);
          completed.delete(slug);
          const attempting = new Set(state.attemptingProblems);
          attempting.delete(slug);
          const solvedAt = { ...state.solvedAt };
          delete solvedAt[slug];
          return { completedProblems: completed, attemptingProblems: attempting, solvedAt };
        });
        if (problemId && get().user) {
          ProgressApi.upsert(problemId, 'NOT_STARTED').catch(() => {});
        }
      },

      recordWrong: (slug) =>
        set((state) => {
          const now = new Date().toISOString();
          const prev = state.wrongProblems[slug];
          // 间隔重复（SM-2）：再次出错说明未掌握，重置阶段为 0，从最短间隔重新调度
          const interval = REVIEW_INTERVALS[0];
          return {
            wrongProblems: {
              ...state.wrongProblems,
              [slug]: {
                firstAt: prev?.firstAt ?? now,
                lastAt: now,
                count: (prev?.count ?? 0) + 1,
                nextReview: isoDaysFromNow(interval),
                stage: 0,
              },
            },
          };
        }),

      advanceReview: (slug) =>
        set((state) => {
          const entry = state.wrongProblems[slug];
          if (!entry) return {};
          const stage = entry.stage + 1;
          const interval = REVIEW_INTERVALS[Math.min(stage, REVIEW_INTERVALS.length - 1)];
          return {
            wrongProblems: {
              ...state.wrongProblems,
              [slug]: { ...entry, stage, nextReview: isoDaysFromNow(interval) },
            },
          };
        }),

      removeWrong: (slug) =>
        set((state) => {
          const wrongProblems = { ...state.wrongProblems };
          delete wrongProblems[slug];
          return { wrongProblems };
        }),

      markTutorialComplete: (slug) =>
        set((state) => {
          const completed = new Set(state.completedTutorials);
          completed.add(slug);
          return { completedTutorials: completed };
        }),

      addPracticeTime: (minutes) =>
        set((state) => ({
          totalPracticeTime: state.totalPracticeTime + minutes,
        })),

      statusOfProblem: (slug) => {
        const state = get();
        return inferStatus(slug, state.completedProblems, state.attemptingProblems);
      },

      streak: () => computeStreak(get().solvedAt),

      getStats: () => {
        const state = get();
        const totalProblems = state.totalProblems;
        const totalTutorials = state.totalTutorials;
        const completedProblems = state.completedProblems.size;
        const completedTutorials = state.completedTutorials.size;
        const totalItems = totalProblems + totalTutorials;
        const completedItems = completedProblems + completedTutorials;
        return {
          totalProblems,
          completedProblems,
          attemptingProblems: state.attemptingProblems.size,
          totalTutorials,
          completedTutorials,
          completionRate:
            totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        };
      },
    }),
    {
      name: 'algo-visualizer-progress',
      version: 3,
      // Sets are not natively serializable; persist as arrays and rehydrate.
      partialize: (state) => ({
        user: state.user,
        totalPracticeTime: state.totalPracticeTime,
        completedProblems: [...state.completedProblems],
        attemptingProblems: [...state.attemptingProblems],
        completedTutorials: [...state.completedTutorials],
        solvedAt: state.solvedAt,
        wrongProblems: state.wrongProblems,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Revive serialized arrays back into Sets
        const raw = state as any;
        state.completedProblems = new Set(Array.isArray(raw.completedProblems) ? raw.completedProblems : []);
        state.attemptingProblems = new Set(Array.isArray(raw.attemptingProblems) ? raw.attemptingProblems : []);
        state.completedTutorials = new Set(Array.isArray(raw.completedTutorials) ? raw.completedTutorials : []);
        state.solvedAt = raw.solvedAt && typeof raw.solvedAt === 'object' ? raw.solvedAt : {};
        state.wrongProblems = raw.wrongProblems && typeof raw.wrongProblems === 'object' ? raw.wrongProblems : {};
      },
    },
  ),
);

interface SettingsState {
  theme: 'dark' | 'light';
  fontSize: number;
  animationSpeed: number;
  soundEnabled: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  setFontSize: (size: number) => void;
  setAnimationSpeed: (speed: number) => void;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      fontSize: 14,
      animationSpeed: 500,
      soundEnabled: true,

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'algo-visualizer-settings',
    },
  ),
);

export function statusToProgressStatus(s: ProblemStatus): ProgressStatus {
  return s === 'COMPLETED' || s === 'ATTEMPTING' || s === 'NOT_STARTED' ? s : 'NOT_STARTED';
}
