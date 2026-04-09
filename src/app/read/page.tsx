import { getChaptersForRead } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { CalloutBox } from "@/components/read/CalloutBox";
import { PartDivider } from "@/components/read/PartDivider";
import { ReadPageShell } from "./ReadPageShell";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

export const metadata = {
  title: "Read the Treatise",
  description:
    "Read Systema Robotica: On the Order and Evolution of Robotkind by Ali Ahmed. The full treatise on robot classification, taxonomy, and sentience.",
};

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

export default function ReadPage() {
  const chapters = getChaptersForRead();

  const renderedChapters = chapters.map((ch) => ({
    meta: ch.meta,
    rendered: (
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
    ),
  }));

  return <ReadPageShell chapters={renderedChapters} />;
}
