import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { TableOfContents } from "./table-of-contents";
import { MermaidDiagram } from "./mermaid-diagram";
import { CodeTabs } from "./code-tabs";
import remarkCodeTabs from "@/lib/remark-code-tabs";
import { rehypeExtractMermaid } from "@/lib/rehype-mermaid";

interface MarkdownContentProps {
  content: string;
}

type HeadingItem = { id: string; text: string; level: number };

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/gm;

function slugify(text: string): string {
  return text
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "")
    .toLowerCase()
    .slice(0, 60) || "section";
}

function extractHeadings(markdown: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  // 先移除代码块内容，避免 Python 注释等被误识别为标题
  const stripped = markdown.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "");
  let m: RegExpExecArray | null;
  HEADING_RE.lastIndex = 0;
  while ((m = HEADING_RE.exec(stripped))) {
    headings.push({
      id: slugify(m[2].trim()),
      text: m[2].trim(),
      level: m[1].length,
    });
  }
  const seen = new Map<string, number>();
  for (const h of headings) {
    const count = seen.get(h.id) ?? 0;
    if (count > 0) h.id = `${h.id}-${count}`;
    seen.set(slugify(h.text), count + 1);
  }
  return headings;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const headings = extractHeadings(content);
  // Build a counter aligned with how react-markdown walks the AST.
  const idCounter = new Map<string, number>();

  const headingId = (children: React.ReactNode): string => {
    const base = slugify(extractText(children));
    const n = idCounter.get(base) ?? 0;
    idCounter.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };

  const components = {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 id={headingId(children)} className="font-display text-3xl font-bold mt-10 mb-4 text-ink scroll-mt-20 tracking-tight">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 id={headingId(children)} className="font-display text-2xl font-semibold mt-10 mb-3 text-ink border-b border-edge pb-2 scroll-mt-20 tracking-tight">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 id={headingId(children)} className="font-display text-xl font-semibold mt-7 mb-2 text-ink scroll-mt-20">{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 id={headingId(children)} className="text-lg font-semibold mt-5 mb-2 text-ink scroll-mt-20">{children}</h4>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="my-4 leading-7 text-ink-2">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="my-4 ml-6 list-disc text-ink-2 space-y-2">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="my-4 ml-6 list-decimal text-ink-2 space-y-2">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-7">{children}</li>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        className="text-brand hover:underline"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 border-brand pl-4 my-4 text-ink-3 italic">
        {children}
      </blockquote>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-surface-2">{children}</thead>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="border border-edge px-3 py-2 text-left font-semibold text-ink">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="border border-edge px-3 py-2 text-ink-2">{children}</td>
    ),
    code: ({
      className,
      children,
    }: {
      className?: string;
      children?: React.ReactNode;
    }) => {
      const isBlock = className?.startsWith("language-");
      if (isBlock) {
        return <code className={`${className ?? ""} text-sm font-mono`}>{children}</code>;
      }
      return (
        <code className="bg-surface-2 text-brand px-1.5 py-0.5 rounded text-[13px] font-mono">
          {children}
        </code>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => {
      if (
        children &&
        typeof children === "object" &&
        "props" in (children as object)
      ) {
        const childProps = (children as { props?: { className?: string; children?: React.ReactNode } }).props;
        const cls = childProps?.className ?? "";
        if (childProps && typeof cls === "string" && cls.includes("language-mermaid")) {
          const text =
            typeof childProps.children === "string"
              ? childProps.children
              : extractText(childProps.children);
          return <MermaidDiagram chart={text} />;
        }
      }
      return (
        <pre className="my-4 p-4 bg-surface border border-edge rounded-lg overflow-x-auto text-sm font-mono">
          {children}
        </pre>
      );
    },
    hr: () => <hr className="my-8 border-edge" />,
    "mermaid-diagram": ({ chart }: { chart?: string }) => (
      <MermaidDiagram chart={typeof chart === "string" ? chart : ""} />
    ),
    codeTabs: ({ 'data-tabs': rawTabs }: { 'data-tabs': string }) => {
      try {
        const tabs = JSON.parse(rawTabs);
        return <CodeTabs tabs={tabs} />;
      } catch {
        return null;
      }
    },
  };

  return (
    <div className="flex gap-10 items-start">
      <article className="prose min-w-0 flex-1">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkCodeTabs]}
          rehypePlugins={[rehypeExtractMermaid(), rehypeHighlight]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </article>
      <TableOfContents headings={headings} />
    </div>
  );
}