import { GlossaryClient } from "./GlossaryClient";
import glossaryData from "@/data/glossary.json";

export const metadata = {
  title: "Glossary",
  description:
    "Glossary of terms from Systema Robotica — definitions for robot taxonomy, sentience, superintelligence, and more.",
};

export default function GlossaryPage() {
  return <GlossaryClient terms={glossaryData} />;
}
