"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, List } from "lucide-react";

interface TocItem {
  id: string;
  title: string;
  slug: string;
  part: number | null;
  chapter: number | null;
  isPartDivider: boolean;
}

interface Props {
  items: TocItem[];
  activeId: string;
}

const partNames: Record<number, string> = {
  1: "I. Natura Robotica",
  2: "II. Structura Robotica",
  3: "III. Futura Robotica",
};

export function TableOfContents({ items, activeId }: Props) {
  const [expandedParts, setExpandedParts] = useState<Set<number>>(
    new Set([1, 2, 3])
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const togglePart = (part: number) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(part)) next.delete(part);
      else next.add(part);
      return next;
    });
  };

  const scrollTo = (slug: string) => {
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileOpen(false);
    }
  };

  // Group items by part
  const introduction = items.find((i) => i.slug === "introduction");
  const parts = [1, 2, 3].map((p) => ({
    part: p,
    label: partNames[p],
    chapters: items.filter(
      (i) => i.part === p && i.chapter !== null
    ),
  }));
  const backMatter = items.filter(
    (i) =>
      i.part === null &&
      i.chapter === null &&
      !["cover", "title-page", "publishing-info", "dedication"].includes(i.slug) &&
      i.slug !== "introduction"
  );

  const tocContent = (
    <nav className="text-xs" style={{ fontFamily: "var(--font-heading)" }}>
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-4 px-4">
        Contents
      </p>

      {/* Introduction */}
      {introduction && (
        <button
          onClick={() => scrollTo(introduction.slug)}
          className={`block w-full text-left px-4 py-1.5 transition-colors ${
            activeId === introduction.slug
              ? "text-foreground bg-accent/10"
              : "text-muted hover:text-foreground"
          }`}
        >
          Introduction
        </button>
      )}

      {/* Parts */}
      {parts.map((p) => (
        <div key={p.part} className="mt-2">
          <button
            onClick={() => togglePart(p.part)}
            className="flex items-center gap-1 w-full text-left px-4 py-1.5 text-foreground font-medium hover:bg-accent/5 transition-colors"
          >
            {expandedParts.has(p.part) ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
            <span className="text-[11px]">{p.label}</span>
          </button>
          {expandedParts.has(p.part) && (
            <div className="ml-4">
              {p.chapters.map((ch) => (
                <button
                  key={ch.slug}
                  onClick={() => scrollTo(ch.slug)}
                  className={`block w-full text-left px-4 py-1 transition-colors ${
                    activeId === ch.slug
                      ? "text-foreground bg-accent/10"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {ch.chapter}. {ch.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Back matter */}
      <div className="mt-4 border-t border-border pt-2">
        {backMatter.map((item) => (
          <button
            key={item.slug}
            onClick={() => scrollTo(item.slug)}
            className={`block w-full text-left px-4 py-1 transition-colors ${
              activeId === item.slug
                ? "text-foreground bg-accent/10"
                : "text-muted hover:text-foreground"
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop: hover-reveal sidebar */}
      <div className="toc-sidebar hidden lg:block pt-4 pb-8">
        <div className="h-full overflow-y-auto">{tocContent}</div>
      </div>

      {/* Mobile: floating button + bottom sheet */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg"
          aria-label="Table of contents"
        >
          <List size={20} />
        </button>
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl max-h-[70vh] overflow-y-auto py-6">
              {tocContent}
            </div>
          </>
        )}
      </div>
    </>
  );
}
