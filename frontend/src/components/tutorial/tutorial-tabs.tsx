"use client";

import { useCallback, Suspense, useRef, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, BarChart3, ExternalLink, Loader2 } from "lucide-react";
import { visualizerRegistry } from "@/lib/visualizer-registry";
import { hasVisualizer, getVisualizerRoute } from "@/lib/visualizer-routes";

/**
 * 教程页「讲解 ｜ 可视化」双 Tab 容器。
 * - 讲解：服务端渲染的 Markdown 正文 + 相关资源 + 翻页（作为 children 传入）
 * - 可视化：按 slug 懒加载对应的可视化面板
 * 仅当该教程存在对应可视化时渲染 Tab 切换器，否则直接渲染 children。
 * Tab 状态同步到 URL ?view=，支持前进后退/分享；切换时回到容器顶部。
 */
export function TutorialTabs({ slug, children }: { slug: string; children: ReactNode }) {
  const vizRoute = hasVisualizer(slug) ? getVisualizerRoute(slug) : null;
  const Panel = vizRoute ? visualizerRegistry[vizRoute] : null;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const tab = searchParams.get("view") === "visualizer" ? "visualizer" : "lecture";

  const setTab = useCallback(
    (next: "lecture" | "visualizer") => {
      if (next === tab) return;
      // 切换时滚动到 tab 容器顶部，避免停留在长文底部造成视觉突兀
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      const params = new URLSearchParams(searchParams.toString());
      if (next === "lecture") params.delete("view");
      else params.set("view", "visualizer");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [tab, searchParams, pathname, router],
  );

  if (!Panel) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef}>
      {/* Tab 切换器 */}
      <div className="mb-8 inline-flex items-center gap-1 p-1 bg-surface border border-edge rounded-lg">
        <TabButton active={tab === "lecture"} onClick={() => setTab("lecture")} icon={<BookOpen size={14} />}>
          讲解
        </TabButton>
        <TabButton
          active={tab === "visualizer"}
          onClick={() => setTab("visualizer")}
          icon={<BarChart3 size={14} />}
        >
          可视化
        </TabButton>
      </div>

      {/* 讲解：用 hidden 显隐切换而非 unmount，避免长文档反复重建、保留滚动位置 */}
      <div hidden={tab !== "lecture"}>{children}</div>

      <div hidden={tab !== "visualizer"} className="anim-fade-up">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-ink-3">交互式动画演示，可调整参数并单步执行。</p>
          <Link
            href={`/visualizer/${vizRoute}`}
            className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
          >
            全屏打开
            <ExternalLink size={12} />
          </Link>
        </div>
        <div className="rounded-lg border border-edge bg-surface p-4 min-h-[420px]">
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-2 py-24 text-ink-3 text-sm">
                <Loader2 size={16} className="animate-spin" />
                加载可视化中…
              </div>
            }
          >
            <Panel />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
        active ? "bg-brand text-on-brand shadow-sm" : "text-ink-3 hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
