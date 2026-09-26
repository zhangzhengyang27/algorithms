"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-20 self-start w-52 shrink-0">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-3 mb-3 pl-3">
        On this page
      </div>
      <ul className="space-y-0.5 border-l border-edge text-[13px]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveId(h.id);
                  history.replaceState(null, "", `#${h.id}`);
                }
              }}
              className={[
                "block py-1.5 leading-snug transition-colors truncate",
                h.level === 3 ? "pl-6" : "pl-3",
                h.level === 4 ? "pl-9 text-xs" : "",
                activeId === h.id
                  ? "text-brand border-l-2 border-brand -ml-px font-medium"
                  : "text-ink-3 hover:text-ink",
              ].join(" ")}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}