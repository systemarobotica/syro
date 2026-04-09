import { getChaptersForRead } from "@/lib/mdx";
import { ReadPageClient } from "./ReadPageClient";

export const metadata = {
  title: "Read the Treatise",
  description:
    "Read Systema Robotica: On the Order and Evolution of Robotkind by Ali Ahmed. The full treatise on robot classification, taxonomy, and sentience.",
};

export default function ReadPage() {
  const chapters = getChaptersForRead();

  return (
    <ReadPageClient
      chapters={chapters.map((ch) => ({
        meta: ch.meta,
        content: ch.content,
      }))}
    />
  );
}
