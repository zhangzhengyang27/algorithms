'use client';

import { useEffect, useRef } from 'react';
import { useProgressStore } from '@/store';
import { ProblemsApi, ProgressApi } from '@/lib/api-client';

/**
 * 在登录后 / 已登录用户刷新页面时，从后端拉取真实进度数据：
 *  - 真实题目总量（用于 getStats 完成率；题目仍在后端 DB）
 *  - 真实的题目完成状态（映射 problemId -> slug 后写入 store）
 * 教程总量由服务端（layout）从本地 .md 计算后通过 totalTutorials 传入，
 * 不再走后端 API（教程已完全本地化）。
 * 同一用户只拉一次，避免 React StrictMode 双调用重复请求。
 */
export function ProgressBootstrap({ totalTutorials }: { totalTutorials: number }) {
  const user = useProgressStore((s) => s.user);
  const setTotals = useProgressStore((s) => s.setTotals);
  const loadProgress = useProgressStore((s) => s.loadProgress);
  const setBootstrapped = useProgressStore((s) => s.setBootstrapped);
  const ranFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      // 登出时重置，便于下次登录重新拉取
      if (ranFor.current !== null) {
        ranFor.current = null;
        setBootstrapped(false);
      }
      return;
    }

    if (ranFor.current === user.id) return;
    ranFor.current = user.id;

    let cancelled = false;
    (async () => {
      try {
        const [{ count: totalProblems }, rows] = await Promise.all([
          ProblemsApi.count(),
          ProgressApi.list(),
        ]);
        if (cancelled) return;
        setTotals(totalProblems, totalTutorials);
        loadProgress(rows);
        setBootstrapped(true);
      } catch {
        // 拉取失败不影响其余功能，进度保持默认值
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, totalTutorials, setTotals, loadProgress, setBootstrapped]);

  return null;
}
