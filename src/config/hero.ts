import type { HeroConfig } from "@/config/types";

// Written for two readers at once: someone hiring who has never opened a
// terminal, and an engineer who wants specifics. Plain words first, then a
// concrete example a developer would recognise.
export const heroConfig: HeroConfig = {
  greeting: "Pratyush Rastogi",
  waveEmoji: "👋",
  headlineBefore: "I design",
  highlightedPhrases: ["products people love", "the guardrails that keep them safe"],
  headlineConnector: "and build",
  headlineAfter: ".",
  description:
    "Full-stack engineer and product designer. I take ideas from a rough sketch to a polished, shipped product. Lately: Backstop, which makes AI agents ask a person before they touch real data, and Portopsy, which shows developers exactly what they're about to shut down. Open to full-time roles.",
  descriptionHighlight: "Open to full-time roles",
};
