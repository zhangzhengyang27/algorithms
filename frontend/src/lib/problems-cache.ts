import { ProblemsApi, type Problem } from "./api-client";

/**
 * 全量题目列表的客户端共享缓存。
 *
 * 背景：每日一题、错题本、统计仪表盘等组件都需要全量题库（~1900 题），
 * 若各自调用 ProblemsApi.list() 会重复发起同一请求。
 * 这里做模块级单例缓存 + 在途请求去重：
 * - 首次调用发起请求并缓存结果；
 * - 并发调用复用同一个在途 Promise，不会重复请求；
 * - 命中缓存后直接同步返回，后续组件零网络开销。
 */
let cache: Problem[] | null = null;
let inflight: Promise<Problem[]> | null = null;

export function getAllProblems(): Promise<Problem[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = ProblemsApi.list()
      .then((rows) => {
        cache = rows;
        inflight = null;
        return rows;
      })
      .catch((err) => {
        // 失败不缓存，允许下次重试
        inflight = null;
        throw err;
      });
  }
  return inflight;
}

/** 主动失效缓存（如题目数据变更后调用） */
export function invalidateProblemsCache(): void {
  cache = null;
  inflight = null;
}
