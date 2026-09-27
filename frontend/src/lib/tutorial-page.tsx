import { Suspense } from "react";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { MarkdownContent } from "@/components/tutorial/markdown-content";
import { RelatedResources } from "@/components/tutorial/related-resources";
import { TutorialSidebar } from "@/components/tutorial/tutorial-sidebar";
import { TutorialMetaPanel } from "@/components/tutorial/tutorial-meta-panel";
import { TutorialPager } from "@/components/tutorial/tutorial-pager";
import { TutorialTabs } from "@/components/tutorial/tutorial-tabs";
import { tutorialResources } from "@/lib/tutorial-resources";
import { groupTutorialsForSidebar, TUTORIAL_CATEGORY_MAP } from "@/lib/tutorial-list";

/**
 * 解析教程分类：优先用 frontmatter，缺失时回退到权威分类映射。
 */
function resolveCategory(slug: string, frontmatterCategory?: string): string {
  if (frontmatterCategory && frontmatterCategory.trim() !== "") {
    return frontmatterCategory.trim();
  }
  return TUTORIAL_CATEGORY_MAP[slug] ?? "数据结构";
}

const CONTENT_ROOT = path.join(process.cwd(), "src/app/tutorials");

export function tutorialMdPath(slug: string): string {
  return path.join(CONTENT_ROOT, `${slug}.md`);
}

export interface LoadedTutorial {
  slug: string;
  title: string;
  category: string;
  content: string;
}

/**
 * 从 MD 顶部提取第一个 H1 文本（# 开头）。
 * 找到第一个非空行；必须是 H1；剥掉开头的 # 和空白。
 */
function extractLeadingH1(body: string): string | null {
  const lines = body.split("\n");
  const firstNonEmptyIdx = lines.findIndex((l) => l.trim() !== "");
  if (firstNonEmptyIdx < 0) return null;
  const line = lines[firstNonEmptyIdx].trim();
  const m = /^#\s+(.+?)\s*$/.exec(line);
  if (!m) return null;
  return m[1].trim();
}

/**
 * 剥掉 frontmatter 之后紧跟的第一个 H1 行（连同其后的空行）。
 * 防止页面头部 `<h1>` 与正文 H1 重复。
 */
function stripLeadingH1(body: string): string {
  const lines = body.split("\n");
  const i = lines.findIndex((l) => l.trim() !== "");
  if (i < 0) return body;
  const line = lines[i].trim();
  if (!/^#\s+\S/.test(line)) return body; // 不是 H1，不动
  // 找下一个非空行
  let j = i + 1;
  while (j < lines.length && lines[j].trim() === "") j++;
  // 返回 [0..i) + [j..)
  return [...lines.slice(0, i), ...lines.slice(j)].join("\n");
}

export async function loadTutorial(slug: string): Promise<LoadedTutorial> {
  const mdPath = tutorialMdPath(slug);
  const raw = await readFile(mdPath, "utf8");
  const { content, data } = matter(raw);

  const titleFromH1 = extractLeadingH1(content);
  const title = titleFromH1 ?? (data.title as string | undefined)?.trim() ?? slug;
  const category = resolveCategory(slug, data.category as string | undefined);

  return {
    slug,
    title,
    category,
    content: stripLeadingH1(content),
  };
}

/**
 * 列出 src/app/tutorials 下所有 `<slug>.md` 的 slug（顶层，仅文件）。
 */
export async function listTutorialSlugs(): Promise<string[]> {
  const entries = await readdir(CONTENT_ROOT, { withFileTypes: true });
  const slugs: string[] = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!e.name.endsWith(".md")) continue;
    if (e.name === "README.md") continue;
    slugs.push(e.name.replace(/\.md$/, ""));
  }
  return slugs.sort();
}

export async function renderTutorialPage({ slug }: { slug: string }) {
  const { content, title, category } = await loadTutorial(slug);

  // 侧边栏数据：动态扫描所有 .md，避免 TUTORIAL_LIST 漏列
  const index = await loadTutorialIndex();
  const sidebarGroups = groupTutorialsForSidebar(
    index.map((it) => ({ slug: it.slug, title: it.title, category: it.category })),
  );

  return (
    <div className="px-4 md:px-8 lg:px-10 xl:pl-[150px] xl:pr-[150px] py-10">
      <div className="flex gap-8 items-start">
        {/* 左侧教程目录：全部分类与链接都进预渲染 HTML */}
        <TutorialSidebar groups={sidebarGroups} />

        {/* 主内容区 */}
        <div className="min-w-0 flex-1">
          <div className="mb-8 anim-fade-up">
            <span className="font-mono text-[10px] text-brand bg-brand-soft px-1.5 py-0.5 rounded">
              {category}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-3 tracking-tight">{title}</h1>
          </div>

          <TutorialMetaPanel slug={slug} />

          <Suspense>
            <TutorialTabs slug={slug}>
              <MarkdownContent content={content} />

              <RelatedResources
                tutorials={tutorialResources[slug]?.tutorials ?? []}
                visualizers={tutorialResources[slug]?.visualizers ?? []}
                problems={tutorialResources[slug]?.problems ?? []}
              />

              <TutorialPager slug={slug} />
            </TutorialTabs>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/**
 * 教程分类展示顺序（详情/列表共用）。
 * 与前端列表页 DISPLAY_CATEGORIES 保持一致；不在其中出现的分类排到最后。
 */
export const TUTORIAL_CATEGORY_ORDER = [
  "排序算法",
  "搜索算法",
  "数据结构",
  "算法思想",
  "动态规划",
  "图论",
  "字符串",
  "面试进阶",
  "工程实战",
];

export interface TutorialIndexItem {
  slug: string;
  title: string;
  category: string;
  description: string;
}

/**
 * 从 markdown 正文里抽取一段纯文本摘要（用于列表卡片）。
 * 跳过标题/代码围栏/列表/引用，剥离 markdown 符号，截断到 max 字符。
 */
function summarizeMarkdown(markdown: string, max = 80): string {
  const lines = markdown.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue; // 标题
    if (t.startsWith("```")) continue; // 代码围栏
    if (/^[-*+]\s/.test(t)) continue; // 无序列表
    if (/^\d+\.\s/.test(t)) continue; // 有序列表
    if (t.startsWith(">")) continue; // 引用
    const plain = t
      .replace(/[*_`>#~]/g, "")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接/图片 -> 文本
      .replace(/\s+/g, " ")
      .trim();
    if (plain.length < 6) continue;
    return plain.length > max ? `${plain.slice(0, max)}...` : plain;
  }
  return "";
}

/**
 * 遍历本地 src/app/tutorials/*.md，构建列表页所需的轻量索引。
 * 这是教程列表页的本地真相源，不再依赖后端 /api/v1/tutorials。
 * 新增/删除 .md 文件会自动反映到列表，无需手动 sync。
 */
export async function loadTutorialIndex(): Promise<TutorialIndexItem[]> {
  const slugs = await listTutorialSlugs();
  const items: TutorialIndexItem[] = [];

  for (const slug of slugs) {
    const raw = await readFile(tutorialMdPath(slug), "utf8");
    const { content, data } = matter(raw);
    const titleFromH1 = extractLeadingH1(content);
    const title = titleFromH1 ?? (data.title as string | undefined)?.trim() ?? slug;
    const category = resolveCategory(slug, data.category as string | undefined);
    const body = stripLeadingH1(content);
    items.push({
      slug,
      title,
      category,
      description: summarizeMarkdown(body),
    });
  }

  return items.sort((a, b) => {
    const ca = TUTORIAL_CATEGORY_ORDER.indexOf(a.category);
    const cb = TUTORIAL_CATEGORY_ORDER.indexOf(b.category);
    const ra = ca === -1 ? 999 : ca;
    const rb = cb === -1 ? 999 : cb;
    if (ra !== rb) return ra - rb;
    return a.title.localeCompare(b.title, "zh");
  });
}

/** 本地教程总数（用于进度统计的完成率分母）。 */
export async function getTutorialCount(): Promise<number> {
  const slugs = await listTutorialSlugs();
  return slugs.length;
}