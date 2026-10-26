// One place for the facts every page, the metadata and the OG image share.

const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined;

export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? fromVercel ?? "http://localhost:3000").replace(/\/$/, ""),
  name: "Pratyush Rastogi",
  title: "Pratyush Rastogi — Software Engineer",
  description:
    "Full-stack software engineer. I build web apps, and small tools that keep production safe: an approval gateway for AI agents that touch Postgres, and a CLI that tells you what is holding a port.",
  email: "rastogipratyush630@gmail.com",
  github: "https://github.com/pratyush2514",
  linkedin: "https://linkedin.com/in/pratyushrastogi05",
  resume:
    "https://nqysiprpmxxombsdvdkh.supabase.co/storage/v1/object/public/portfolio/PratyushRastogiResume.pdf",
  calendar: "https://cal.com/pratyush-rastogi-wck12m/30min",
};
