import { ArchiveClient } from "./ArchiveClient";
import taxonomyData from "@/data/taxonomy.json";

export const metadata = {
  title: "Robot Archive",
  description:
    "Interactive taxonomy of all known robots — explore the Robot Taxonomy from Systema Robotica and submit new entries.",
};

export default function ArchivePage() {
  return <ArchiveClient taxonomy={taxonomyData} />;
}
