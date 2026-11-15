import type { SectionId, SectionNoteConfig } from "@/config/types";

export const sectionNotes: Partial<Record<SectionId, SectionNoteConfig>> = {
  design: {
    text: "Screens, flows\nand motion",
    side: "right",
  },
  insights: {
    text: "Visitors and views\nover the last 7 days",
    side: "right",
  },
  experience: {
    text: "Where I've\nworked",
    side: "left",
  },
};
