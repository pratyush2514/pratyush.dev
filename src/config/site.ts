import { socialsConfig } from "@/config/socials";
import type { AboutGreetings, AboutItem, FooterConfig, PortfolioConfig } from "@/config/types";
import { SITE } from "@/lib/site";

export const aboutGreetings: AboutGreetings = {
  morning: "Good morning !",
  afternoon: "Good afternoon !",
  evening: "Good evening !",
  night: "Good night !",
};

export const aboutItems: AboutItem[] = [
  {
    id: "build",
    lead: "I'm Pratyush, an engineer who designs",
    illustration: "browser",
    body: "I shape how a product looks and feels, then build all of it: the screens in React and Next.js, the server in Java and Spring Boot, and everything that connects them.",
  },
  {
    id: "guardrails",
    lead: "I like building the safety nets",
    illustration: "notebook",
    body: "Backstop makes an AI agent ask a person before it changes a live database. Portopsy shows you what's running on your machine before you shut it down.",
  },
  {
    id: "ai",
    lead: "Writing code got cheap. Taste didn't.",
    illustration: "plane",
    body: "AI drafts a lot of my code, and I treat it like work from a fast, confident teammate: I read it, test it, polish it, and own whatever reaches people.",
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
      "product designer",
      "UI/UX designer",
      "design engineer",
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
      alt: `${SITE.name} — ${SITE.jobTitle}`,
    },
    twitterCreator: SITE.xHandle,
    icon: "/favicon.svg",
    appleIcon: "/apple-touch-icon.png",
    googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    manifest: {
      name: SITE.title,
      short_name: "Pratyush",
      description: SITE.description,
      id: "/",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#fafafa",
      theme_color: "#18181b",
      categories: ["portfolio", "developer", "technology"],
      icons: [
        { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
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
    "education",
    "insights",
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
    insights: true,
    sponsors: false,
    experience: true,
    education: true,
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
    intro:
      "AI makes code fast to write. The hard part is knowing what to build and making it feel right, so that's where I spend my time.",
    items: [
      {
        label: "Validate the idea",
        description:
          "Before any code, I check the problem is real: who has it, how they solve it today, and what would make them switch.",
        icon: "validate",
        outputs: ["Problem statement", "Target user", "Success metric"],
      },
      {
        label: "Map the flow",
        description:
          "I sketch every screen a person moves through, then the system behind it, so surprises show up on paper instead of in production.",
        icon: "map",
        outputs: ["User flows", "Mind map", "Architecture"],
      },
      {
        label: "Write it down",
        description:
          "AI drafts the specs and docs from that map. I edit them until they're right, so everyone, human or agent, builds from the same plan.",
        icon: "docs",
        outputs: ["Spec", "API contract", "Agent rules"],
      },
      {
        label: "Build the harness",
        description:
          "Before features, I set up the safety net: tests, type checks and preview deploys that catch mistakes automatically, whoever made them.",
        icon: "harness",
        outputs: ["Tests", "CI checks", "Preview deploys"],
      },
      {
        label: "Build and polish",
        description:
          "Then I build, and I sweat the details: spacing, motion, empty states and the slow-connection case. AI writes drafts; I review every line.",
        icon: "craft",
        outputs: ["Design system", "Accessibility", "Performance"],
      },
      {
        label: "Ship and own it",
        description:
          "Launch is the start. I watch how it's used, fix what breaks, and keep improving it after it's live.",
        icon: "ship",
        outputs: ["Monitoring", "Analytics", "Iteration"],
      },
    ],
  },
  contact: {
    title: "Let's talk",
    description:
      "Hiring, have a product idea, or stuck on something? Email is the fastest way to reach me, or book a 30-minute call.",
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
