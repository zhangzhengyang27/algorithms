import Link from "next/link";
import { BookOpen, BarChart3, Code2, ArrowRight } from "lucide-react";

type RelatedResourceItem = { href: string; title: string; description?: string };
export type Related = RelatedResourceItem;

type RelatedResourcesProps = {
  tutorials?: Related[];
  visualizers?: { href: string; title: string; description?: string }[];
  problems?: { href: string; title: string; difficulty?: "Easy" | "Medium" | "Hard" }[];
};

const difficultyColor = (d?: string) => {
  switch (d) {
    case "Easy":
      return "text-ok bg-ok/10";
    case "Medium":
      return "text-warn bg-warn/10";
    case "Hard":
      return "text-err bg-err/10";
    default:
      return "text-ink-3 bg-surface-2";
  }
};

export function RelatedResources({
  tutorials = [],
  visualizers = [],
  problems = [],
}: RelatedResourcesProps) {
  const hasAny = tutorials.length + visualizers.length + problems.length > 0;
  if (!hasAny) return null;

  return (
    <div className="mt-14 space-y-5 max-w-3xl">
      {tutorials.length > 0 && (
        <div className="p-5 bg-surface rounded-lg border border-edge">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-brand" />
            <h3 className="font-display text-sm font-semibold">相关教程</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tutorials.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group p-3.5 bg-bg hover:bg-surface-2 border border-edge hover:border-brand/30 rounded-md transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-ink group-hover:text-brand transition-colors">
                    {t.title}
                  </span>
                  <ArrowRight
                    size={13}
                    className="text-ink-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
                  />
                </div>
                {t.description && (
                  <p className="text-xs text-ink-3 mt-1 line-clamp-2">{t.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {visualizers.length > 0 && (
        <div className="p-5 bg-surface rounded-lg border border-edge">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-brand" />
            <h3 className="font-display text-sm font-semibold">交互式可视化</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visualizers.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                className="group p-3.5 bg-brand-soft hover:bg-brand/15 border border-edge hover:border-brand/30 rounded-md transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-ink group-hover:text-brand transition-colors">
                    {v.title}
                  </span>
                  <ArrowRight
                    size={13}
                    className="text-ink-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
                  />
                </div>
                {v.description && (
                  <p className="text-xs text-ink-3 mt-1 line-clamp-2">{v.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {problems.length > 0 && (
        <div className="p-5 bg-surface rounded-lg border border-edge">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={16} className="text-ok" />
            <h3 className="font-display text-sm font-semibold">配套练习题</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {problems.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group p-3.5 bg-bg hover:bg-surface-2 border border-edge hover:border-ok/30 rounded-md transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13px] font-medium text-ink group-hover:text-ok transition-colors truncate">
                      {p.title}
                    </span>
                    {p.difficulty && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${difficultyColor(p.difficulty)}`}
                      >
                        {p.difficulty}
                      </span>
                    )}
                  </div>
                  <ArrowRight
                    size={13}
                    className="text-ink-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
