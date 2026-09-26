import { Clock, HardDrive, CheckCircle2, XCircle, Tag, Lightbulb } from "lucide-react";
import { tutorialMeta } from "@/lib/tutorial-meta";

/**
 * 教程头部结构化面板：时间/空间复杂度、稳定性、特性标签、应用场景。
 * 仅当 slug 在 tutorialMeta 中有记录时渲染。
 */
export function TutorialMetaPanel({ slug }: { slug: string }) {
  const meta = tutorialMeta[slug];
  if (!meta) return null;

  const { time, timeSimple, space, stable, tags, scenarios } = meta;

  return (
    <div className="mb-8 p-5 bg-surface rounded-lg border border-edge anim-fade-up">
      {/* 复杂度指标卡片 */}
      {(time || timeSimple || space || stable !== undefined) && (
        <div className="flex flex-wrap gap-2.5 mb-4">
          {time && (
            <>
              <Metric label="最佳时间" value={time.best} icon={<Clock size={13} />} />
              <Metric label="平均时间" value={time.average} icon={<Clock size={13} />} />
              <Metric label="最坏时间" value={time.worst} icon={<Clock size={13} />} />
            </>
          )}
          {timeSimple && <Metric label="时间复杂度" value={timeSimple} icon={<Clock size={13} />} />}
          {space && <Metric label="空间复杂度" value={space} icon={<HardDrive size={13} />} />}
          {stable !== undefined && (
            <Metric
              label="稳定性"
              value={stable ? "稳定" : "不稳定"}
              icon={stable ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              tone={stable ? "ok" : "warn"}
            />
          )}
        </div>
      )}

      {/* 标签 */}
      {tags && tags.length > 0 && (
        <div className="flex items-start gap-2 mb-3">
          <Tag size={13} className="text-brand mt-0.5 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="font-mono text-[11px] text-brand bg-brand-soft px-2 py-0.5 rounded"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 应用场景 */}
      {scenarios && scenarios.length > 0 && (
        <div className="flex items-start gap-2">
          <Lightbulb size={13} className="text-warn mt-0.5 flex-shrink-0" />
          <p className="text-xs text-ink-3 leading-relaxed">
            <span className="text-ink-2 font-medium">应用场景：</span>
            {scenarios.join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "ok" | "warn";
}) {
  const toneCls =
    tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-ink-3";
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 bg-bg border border-edge rounded-md min-w-[92px]">
      <span className="flex items-center gap-1 text-[10px] text-ink-3">
        <span className={toneCls}>{icon}</span>
        {label}
      </span>
      <span className="font-mono text-[13px] font-semibold text-ink">{value}</span>
    </div>
  );
}
