"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Term {
  term: string;
  definition: string;
  letter: string;
}

export function GlossaryClient({ terms }: { terms: Term[] }) {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const allLetters = useMemo(() => {
    const letters = new Set(terms.map((t) => t.letter.toUpperCase()));
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => ({
      letter: l,
      active: letters.has(l),
    }));
  }, [terms]);

  const filtered = useMemo(() => {
    let result = terms;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      );
    }
    if (activeLetter) {
      result = result.filter(
        (t) => t.letter.toUpperCase() === activeLetter
      );
    }
    return result;
  }, [terms, query, activeLetter]);

  // Group by letter
  const grouped = useMemo(() => {
    const groups: Record<string, Term[]> = {};
    for (const t of filtered) {
      const l = t.letter.toUpperCase();
      if (!groups[l]) groups[l] = [];
      groups[l].push(t);
    }
    // Sort groups and terms within
    const sorted = Object.entries(groups).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    return sorted.map(([letter, items]) => ({
      letter,
      items: items.sort((a, b) => a.term.localeCompare(b.term)),
    }));
  }, [filtered]);

  const scrollToLetter = (letter: string) => {
    setActiveLetter(activeLetter === letter ? null : letter);
    const el = document.getElementById(`letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pt-20 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-2xl md:text-3xl mb-8 text-center"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 300 }}
        >
          Glossary
        </h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search terms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-card-bg border border-border rounded-lg focus:outline-none focus:border-accent-blue transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Count */}
        <p
          className="text-xs text-muted mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Showing {filtered.length} of {terms.length} terms
        </p>

        {/* Alphabet nav */}
        <div className="flex flex-wrap gap-1 mb-8 sticky top-12 bg-background/90 backdrop-blur-sm py-2 z-10">
          {allLetters.map(({ letter, active }) => (
            <button
              key={letter}
              onClick={() => active && scrollToLetter(letter)}
              disabled={!active}
              className={`w-7 h-7 text-xs rounded transition-colors ${
                activeLetter === letter
                  ? "bg-foreground text-background"
                  : active
                  ? "text-foreground hover:bg-accent/10"
                  : "text-muted/30 cursor-default"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {letter}
            </button>
          ))}
          {activeLetter && (
            <button
              onClick={() => setActiveLetter(null)}
              className="text-xs text-muted hover:text-foreground ml-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Terms */}
        <AnimatePresence mode="wait">
          <motion.div
            key={query + (activeLetter || "")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {grouped.map(({ letter, items }) => (
              <div key={letter} id={`letter-${letter}`} className="mb-8 scroll-mt-24">
                <h2
                  className="text-lg text-muted mb-3 border-b border-border pb-1"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 300 }}
                >
                  {letter}
                </h2>
                <div className="flex flex-col gap-3">
                  {items.map((t) => (
                    <div
                      key={t.term}
                      className="py-2 px-3 rounded-lg hover:bg-card-bg transition-colors"
                    >
                      <dt
                        className="text-sm font-semibold mb-1"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {t.term}
                      </dt>
                      <dd className="text-sm text-muted leading-relaxed">
                        {t.definition}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="text-center text-muted text-sm py-12">
            No terms match your search.
          </p>
        )}
      </div>
    </div>
  );
}
