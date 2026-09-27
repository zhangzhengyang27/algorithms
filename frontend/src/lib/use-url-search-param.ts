'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** router.replace/pushState 不会触发 popstate，程序化改 URL 后要自己喊一声 */
const URL_CHANGE_EVENT = 'algo:url-change';
export function notifyUrlChange() {
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

/**
 * 读 URL 查询参数，但**不参与服务端渲染**：服务端一律拿 null，浏览器里才是真值。
 *
 * 为什么不用 useSearchParams：那会让整棵子树在静态预渲染时退化成客户端渲染，
 * 教程页的正文与侧栏 137 条目录链接就都不在 HTML 里了。
 * 为什么不在 useEffect 里 setState：react-hooks 规则禁止 effect 内同步 setState（级联渲染），
 * 而 useSyncExternalStore 正是「订阅只在浏览器里存在的外部状态」的官方解法。
 */
export function useUrlSearchParam(name: string): string | null {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      window.addEventListener('popstate', onStoreChange);
      window.addEventListener(URL_CHANGE_EVENT, onStoreChange);
      return () => {
        window.removeEventListener('popstate', onStoreChange);
        window.removeEventListener(URL_CHANGE_EVENT, onStoreChange);
      };
    },
    [],
  );
  const getSnapshot = useCallback(
    () => new URLSearchParams(window.location.search).get(name)?.trim() || null,
    [name],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
