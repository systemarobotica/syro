import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CHAPTERS_DIR = path.join(process.cwd(), "src/content/chapters/en");

export interface ChapterMeta {
  title: string;
  slug: string;
  order: number;
  part: number | null;
  chapter: number | null;
  partNumber?: string;
  chapterNumber?: string;
}

export interface ChapterData {
  meta: ChapterMeta;
  content: string;
}

export function getAllChapters(): ChapterData[] {
  const files = fs
    .readdirSync(CHAPTERS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CHAPTERS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    return {
      meta: data as ChapterMeta,
      content,
    };
  });
}

export function getChaptersForRead(): ChapterData[] {
  // Filter out cover, title page, publishing info, dedication for reading
  return getAllChapters().filter((ch) => ch.meta.order >= 4);
}
