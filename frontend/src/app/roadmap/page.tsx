import { Map as MapIcon } from "lucide-react";
import { TUTORIAL_LIST } from "@/lib/tutorial-list";
import { tutorialMeta } from "@/lib/tutorial-meta";
import { hasVisualizer } from "@/lib/visualizer-routes";
import { RoadmapGrid, type RoadmapCard } from "@/components/roadmap/roadmap-grid";

export const metadata = {
  title: "算法学习路线图 · AlgoViz",
  description: "按分类浏览全部算法与数据结构主题，含复杂度、标签与可视化入口。",
};

/** 卡片上展示的时间复杂度：优先 timeSimple，其次取 average。 */
function displayTime(slug: string): string | undefined {
  const m = tutorialMeta[slug];
  if (!m) return undefined;
  if (m.timeSimple) return m.timeSimple;
  if (m.time) return m.time.average;
  return undefined;
}

export default function RoadmapPage() {
  // 按 TUTORIAL_LIST 的分类顺序分组
  const groupMap = new Map<string, RoadmapCard[]>();
  const order: string[] = [];
  for (const item of TUTORIAL_LIST) {
    if (!groupMap.has(item.category)) {
      groupMap.set(item.category, []);
      order.push(item.category);
    }
    groupMap.get(item.category)!.push({
      slug: item.slug,
      title: item.title,
      category: item.category,
      time: displayTime(item.slug),
      space: tutorialMeta[item.slug]?.space,
      stable: tutorialMeta[item.slug]?.stable,
      tags: tutorialMeta[item.slug]?.tags,
      hasViz: hasVisualizer(item.slug),
    });
  }
  const groups = order.map((category) => ({ category, cards: groupMap.get(category)! }));

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
      <div className="mb-8 anim-fade-up">
        <p className="font-mono text-xs text-brand tracking-widest uppercase mb-3 flex items-center gap-1.5">
          <MapIcon size={13} />
          Algorithm Roadmap
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">算法学习路线图</h1>
        <p className="text-ink-2 text-sm md:text-base leading-relaxed max-w-2xl">
          按学习路径整理的 {TUTORIAL_LIST.length} 个算法与数据结构主题。每张卡片标注复杂度、稳定性与特性标签，
          带 <span className="text-brand">可视化</span> 标记的主题可在教程页内直接交互动画演示。
        </p>
      </div>

      <RoadmapGrid groups={groups} />
    </div>
  );
}
