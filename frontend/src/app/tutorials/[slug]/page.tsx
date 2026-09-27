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
}

// 教程集合就是本地那 137 篇 md：未知 slug 必须在路由层直接 404，
// 否则它会走按需动态渲染，notFound() 只能渲染出 404 界面却带着已冲刷的 HTTP 200 头。
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await listTutorialSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function TutorialSlugPage({ params }: PageProps) {
  const { slug } = await params;
  if (!existsSync(tutorialMdPath(slug))) notFound();
  // ?category= 交给客户端组件读，页面不碰 searchParams，路由才保持静态
  return renderTutorialPage({ slug });
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