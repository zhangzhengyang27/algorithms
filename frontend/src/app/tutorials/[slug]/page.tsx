import { notFound } from "next/navigation";
import {
  renderTutorialPage,
  loadTutorial,
  listTutorialSlugs,
  tutorialMdPath,
} from "@/lib/tutorial-page";
import { existsSync } from "node:fs";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ category?: string | string[] }>;
}

export async function generateStaticParams() {
  const slugs = await listTutorialSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function TutorialSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  if (!existsSync(tutorialMdPath(slug))) notFound();
  // 解析 ?category=，支持数组形式时取第一个
  const sp = await searchParams;
  const raw = sp?.category;
  const scopedCategory =
    typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null;
  return renderTutorialPage({ slug, scopedCategory });
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const { title } = await loadTutorial(slug);
    return { title: `${title} | 算法教程` };
  } catch {
    return { title: slug };
  }
}