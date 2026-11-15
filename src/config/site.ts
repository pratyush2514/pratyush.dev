import { socialsConfig } from "@/config/socials";
import type { AboutGreetings, AboutItem, FooterConfig, PortfolioConfig } from "@/config/types";
import { SITE } from "@/lib/site";

export const aboutGreetings: AboutGreetings = {
  morning: "Good morning !",
  afternoon: "Good afternoon !",
  evening: "Good evening !",
};

export const aboutItems: AboutItem[] = [
  {
    id: "build",
    lead: "I'm Pratyush, a full-stack engineer",
    illustration: "browser",
    body: "working across Java and Spring Boot back ends, React and Next.js front ends, and the plumbing between them.",
  },
  {
    id: "guardrails",
    lead: "A lot of what I build sits at the edge of production",
    illustration: "notebook",
    body: "Backstop puts a person between an AI agent and a live database, and Portopsy shows you what you are about to stop before you stop it.",
  },
  {
    id: "ai",
    lead: "Writing code got cheap, deciding what should ship didn't",
    illustration: "plane",
    body: "so I treat what AI tools write like a pull request from a fast, confident teammate: read it, test it, and own whatever reaches production.",
  },
];

export const footerConfig: FooterConfig = {
  quote: "Read it, test it, and own whatever reaches production.",
  attribution: SITE.name,
  credit: `© ${new Date().getFullYear()} ${SITE.name}. Built with Next.js.`,
  artwork: {
    src: "/images/footer-garden-strip.webp",
    width: 1264,
    height: 600,
  },
};

export const siteConfig: PortfolioConfig = {
  meta: {
    url: SITE.url,
    title: SITE.title,
    titleTemplate: `%s | ${SITE.name}`,
    shortTitle: SITE.name,
    description: SITE.description,
    keywords: [
      "Pratyush Rastogi",
      "software engineer",
      "full-stack developer",
      "portfolio",
      "Next.js",
      "Spring Boot",
      "TypeScript",
      "Rust",
      "Go",
      "PostgreSQL",
    ],
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    classification: "Portfolio",
    category: "technology",
    locale: "en_US",
    ogImage: {
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: `${SITE.name} — Software Engineer`,
    },
    twitterCreator: SITE.xHandle,
    icon: "/favicon.svg",
    appleIcon: "/apple-touch-icon.png",
    googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    manifest: {
      name: SITE.title,
      short_name: "Pratyush",
      description: SITE.description,
      start_url: "/",
      display: "standalone",
      background_color: "#fafafa",
      theme_color: "#18181b",
      icons: [
        { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    robots: {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin"],
      },
      sitemap: `${SITE.url}/sitemap.xml`,
    },
    sitemap: [
      { url: SITE.url, changeFrequency: "monthly", priority: 1 },
      { url: `${SITE.url}/design`, changeFrequency: "weekly", priority: 0.7 },
    ],
  },
  personal: {
    fullName: SITE.name,
    firstName: "Pratyush",
    avatar: {
      src: "/images/profile.png",
      alt: "Pratyush Rastogi",
      fallback: "PR",
    },
    location: {
      label: "India",
      timeZone: "Asia/Kolkata",
    },
    githubUsername: "pratyush2514",
  },
  sectionOrder: [
    "projects",
    "socials",
    "design",
    "skills",
    "about",
    "experience",
    "github",
    "workflow",
    "contact",
  ],
  sectionFlags: {
    socials: true,
    skills: true,
    components: false,
    about: true,
    testimonials: false,
    projects: true,
    design: true,
    bookmarks: false,
    bookshelf: false,
    certifications: false,
    insights: false,
    sponsors: false,
    experience: true,
    services: false,
    workflow: true,
    github: true,
    contact: true,
  },
  banner: {
    imageSrc: "/images/profile-banner-cutout.webp",
    imageAlt: "Paper cutouts of a keyboard, notebook, paper plane, and coffee cup",
    openSourceUrl: SITE.github,
    openSourceTooltip: "Find me on GitHub",
    themeToggleLabel: "Toggle theme",
    themeShortcut: "D",
    themeTooltip: "Toggle theme",
    switchAudioSrc: "/switch.mp3",
  },
  about: {
    title: "Hello there !",
    body: aboutItems.map(({ lead, body }) => `${lead} ${body}`).join(" "),
  },
  services: {
    title: "What I build",
    items: [
      "Full-stack web apps with Spring Boot or Node back ends and React or Next.js front ends.",
      "Developer tools and CLIs that make production safer to touch.",
      "Automation and monitoring that tells your team the moment something breaks.",
    ],
  },
  workflow: {
    title: "How I work",
    items: [
      {
        label: "Read it",
        description:
          "AI writes a lot of my first drafts. I read every line of it like a pull request before it goes anywhere.",
        icon: "scope",
      },
      {
        label: "Test it",
        description:
          "Behaviour is verified, not assumed. Tools I ship stay read-only until you say otherwise.",
        icon: "communication",
      },
      {
        label: "Own it",
        description:
          "Whatever reaches production is mine: deploys, monitoring, and support after launch.",
        icon: "handoff",
      },
    ],
  },
  contact: {
    title: "Let's talk",
    description:
      "Hiring, a project, or something you are stuck on. Email is the fastest way to reach me, or grab a 30-minute slot.",
    pricing: [],
    channels: socialsConfig.filter((item) =>
      ["email", "calendar", "linkedin"].includes(item.id),
    ),
  },
  bookmarks: {
    title: "Bookmarks",
    items: [],
  },
  certifications: {
    title: "Certificates",
    items: [],
  },
};
