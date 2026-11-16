// One place for the facts every page, the metadata and the OG image share.

const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? fromVercel ?? "http://localhost:3000").replace(/\/$/, ""),
  name: "Pratyush Rastogi",
  title: "Pratyush Rastogi — Full-Stack Software Engineer",
  jobTitle: "Full-Stack Software Engineer",
  // Kept under ~160 characters so search results show it whole.
  description:
    "Full-stack software engineer in India building web apps with Java, Spring Boot and Next.js, plus tools that keep production safe for teams using AI agents.",
  email: "rastogipratyush630@gmail.com",
  github: "https://github.com/pratyush2514",
  linkedin: "https://linkedin.com/in/pratyushrastogi05",
  x: "https://x.com/Pratyusshmd",
  xHandle: "@Pratyusshmd",
  resume:
    "https://nqysiprpmxxombsdvdkh.supabase.co/storage/v1/object/public/portfolio/PratyushRastogiResume.pdf",
  calendar: "https://cal.com/pratyush-rastogi-wck12m/30min",
};
