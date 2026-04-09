import { ArchiveClient } from "./ArchiveClient";
import fallbackTaxonomy from "@/data/taxonomy.json";

const ARCHIVE_RAW_URL =
  "https://raw.githubusercontent.com/systemarobotica/archive/main/taxonomy.json";

export const revalidate = 3600; // ISR: revalidate every hour

async function getTaxonomy() {
  try {
    const res = await fetch(ARCHIVE_RAW_URL, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Fallback to local copy if fetch fails (e.g. archive repo PR not merged yet)
    return fallbackTaxonomy;
  }
}

export const metadata = {
  title: "Robot Archive",
  description:
    "Interactive taxonomy of all known robots — explore the Robot Taxonomy from Systema Robotica and submit new entries.",
};

export default async function ArchivePage() {
  const taxonomy = await getTaxonomy();
  return <ArchiveClient taxonomy={taxonomy} />;
}
