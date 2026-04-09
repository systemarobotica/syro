"use client";

import { useState, useEffect, useMemo } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { TableOfContents } from "@/components/read/TableOfContents";
import { CalloutBox } from "@/components/read/CalloutBox";
import { PartDivider } from "@/components/read/PartDivider";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import chaptersData from "@/data/chapters.json";

interface ChapterMeta {
  title: string;
  slug: string;
  order: number;
  part: number | null;
  chapter: number | null;
  partNumber?: string;
  chapterNumber?: string;
}

interface Props {
  chapters: { meta: ChapterMeta; content: string }[];
}

const mdxComponents = {
  CalloutBox,
  PartDivider,
  img: (props: React.ComponentProps<"img">) => {
    const { src, alt } = props;
    if (!src || typeof src !== "string") return null;
    return (
      <span className="block my-6 text-center">
        <Image
          src={src}
          alt={alt || "Figure"}
          width={680}
          height={400}
          className="mx-auto rounded max-w-full h-auto"
          unoptimized
        />
        {alt && alt !== "Figure" && (
          <span className="block text-xs text-muted italic mt-2">{alt}</span>
        )}
      </span>
    );
  },
};

export function ReadPageClient({ chapters }: Props) {
  const [progress, setProgress] = useState(0);

  const slugs = useMemo(
    () => chapters.map((ch) => ch.meta.slug),
    [chapters]
  );
  const activeId = useScrollSpy(slugs);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tocItems = chaptersData
    .filter((c) => c.order >= 4)
    .map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      part: c.part,
      chapter: c.chapter,
      isPartDivider: c.isPartDivider,
    }));

  return (
    <>
      {/* Reading progress bar */}
      <div
        className="reading-progress"
        style={{ width: `${progress}%` }}
      />

      <TableOfContents items={tocItems} activeId={activeId} />

      <div className="pt-20 pb-20 px-4 lg:pl-[60px]">
        <div className="max-w-[680px] mx-auto">
          {chapters.map((ch) => (
            <article
              key={ch.meta.slug}
              id={ch.meta.slug}
              className="mb-16 scroll-mt-20"
            >
              {/* Chapter heading */}
              {ch.meta.chapterNumber && (
                <div className="text-center mb-8">
                  <p
                    className="text-3xl mb-2"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 100,
                    }}
                  >
                    {ch.meta.chapterNumber}
                  </p>
                  <h2
                    className="text-xl md:text-2xl"
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 400,
                    }}
                  >
                    {ch.meta.title}
                  </h2>
                </div>
              )}

              {/* Non-chapter headings (Acknowledgements, Notes, etc.) */}
              {!ch.meta.chapterNumber && !ch.meta.partNumber && ch.meta.order > 4 && (
                <h2
                  className="text-xl md:text-2xl text-center mb-8"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 400,
                  }}
                >
                  {ch.meta.title}
                </h2>
              )}

              {/* Content */}
              <div className="prose-reading text-[15px] md:text-[17px] leading-[1.8] [&_p]:mb-4 [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-base [&_h3]:mt-6 [&_h3]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_li]:mb-2 [&_a]:text-accent-blue [&_a]:underline [&_strong]:font-bold [&_em]:italic"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <MDXRemote
                  source={ch.content}
                  components={mdxComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [rehypeSlug],
                    },
                  }}
                />
              </div>
            </article>
          ))}

          {/* Back to top */}
          <div className="text-center pt-8 border-t border-border">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-xs text-muted hover:text-foreground transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Return to top
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
