"use client";

import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Check, Copy, Download, Github, Linkedin, Menu, X } from "lucide-react";
import { ThemeToggleButton } from "@/components/theme-toggle";
import { FloatingConsultButton } from "@/components/floating-consult-button";
import { GitHubStreak } from "@/components/github-streak";
import { HairlineFigure } from "@/components/hairline-figure";
import { ProjectPreview } from "@/components/project-preview";
import { DesignGallery } from "@/components/design/design-gallery";
import type { PublicDesign } from "@/lib/designs/types";
import { SITE } from "@/lib/site";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  SiGo,
  SiPython,
  SiTypescript,
  SiPostgresql,
  SiDocker,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiOpenai,
  SiSlack,
  SiReact,
  SiSpringboot,
  SiMysql,
  SiStreamlit,
  SiPandas,
  SiJsonwebtokens,
  SiRust,
  SiLinux,
  SiX,
} from "react-icons/si";

// Maps a tag label to its official brand mark (monochrome, inherits currentColor).
// Tags without a recognized logo simply render as text.
const techIcons: Record<string, IconType> = {
  Go: SiGo,
  Python: SiPython,
  TypeScript: SiTypescript,
  PostgreSQL: SiPostgresql,
  Docker: SiDocker,
  "Next.js": SiNextdotjs,
  "Node.js": SiNodedotjs,
  Express: SiExpress,
  OpenAI: SiOpenai,
  Slack: SiSlack,
  React: SiReact,
  "Spring Boot": SiSpringboot,
  MySQL: SiMysql,
  Streamlit: SiStreamlit,
  Pandas: SiPandas,
  JWT: SiJsonwebtokens,
  Rust: SiRust,
  Linux: SiLinux,
};

type Project = {
  title: string;
  role: string;
  year: string;
  description: string;
  tags: string[];
  url?: string;
  source?: string;
  // A full-page capture in public/projects, and its height over its width.
  shot?: { src: string; ratio: number };
};

const featured: Project[] = [
  {
    title: "Backstop",
    role: "Creator",
    year: "2026",
    description:
      "A gateway between AI agents and a PostgreSQL database. It parses every query, holds destructive writes until a person approves them, and restores a table from snapshots kept in your own storage.",
    tags: ["Go", "Python", "TypeScript", "PostgreSQL", "Docker"],
    url: "https://backstop-iota.vercel.app/",
    shot: { src: "/projects/backstop.webp", ratio: 3080 / 1440 },
  },
  {
    title: "Portopsy",
    role: "Creator",
    year: "2026",
    description:
      "A command-line tool for Linux and WSL2 that answers one question: what is using this port? It shows the process, its parent chain, working directory and container, and changes nothing unless you confirm.",
    tags: ["Rust", "Linux"],
    url: "https://portopsy-cli.vercel.app/",
    source: "https://github.com/pratyush2514/portopsy",
    shot: { src: "/projects/portopsy.webp", ratio: 2331 / 1440 },
  },
  {
    title: "PulseBoard",
    role: "Full-stack engineer",
    year: "2026",
    description:
      "Reads Slack channels and shows how conversations are going: tone over time, threads still waiting on a reply, and channels where things are getting tense.",
    tags: ["Next.js", "Node.js", "Express", "OpenAI", "Slack"],
    url: "https://sentiment-front-end-next-js.vercel.app/",
    shot: { src: "/projects/pulseboard.webp", ratio: 3600 / 1440 },
  },
];

const more: Project[] = [
  {
    title: "RSS Posting",
    role: "Full-stack engineer",
    year: "2025",
    description:
      "Publishes to Facebook and Instagram from RSS feeds, with an approval step before anything goes live. Built end to end and supported after launch.",
    tags: ["Spring Boot", "React", "JWT"],
  },
  {
    title: "Not Just ToDo AI",
    role: "Side project",
    year: "2025",
    description:
      "Suggests a next project that matches what a student already knows, so it is a real step up rather than another tutorial clone.",
    tags: ["Next.js", "Spring Boot", "MySQL", "OpenAI"],
  },
  {
    title: "Clean My Data",
    role: "Side project",
    year: "2024",
    description:
      "Turns a raw dataset into summary statistics, interactive charts and a PDF report. Cut reporting time by about 70%.",
    tags: ["Python", "Streamlit", "Pandas"],
    source: "https://github.com/pratyush2514/Clean-My-Data",
  },
];

const experience = [
  {
    company: "Wednesday Solutions",
    role: "Software Engineer I",
    place: "Full-time · Pune",
    period: "Feb – Apr 2026",
    details:
      "Shipped features on two products: PulseBoard, a Slack sentiment dashboard, and a queue management system that plugs into Moodle and Canvas.",
  },
  {
    company: "Freelance",
    role: "Full-stack developer",
    place: "Contract",
    period: "Oct – Dec 2025",
    details:
      "Built RSS Posting, a tool that publishes to Facebook and Instagram from RSS feeds with an approval step, JWT auth, and support after launch.",
  },
  {
    company: "Freelance",
    role: "Automation engineer",
    place: "Contract",
    period: "Jun 2025",
    details:
      "Set up server monitoring with n8n and Bash scripts that post to Slack the moment something goes down.",
  },
];

const toolbox = [
  { label: "Languages", items: ["Java", "TypeScript", "Python", "Go", "Rust", "SQL", "C#"] },
  { label: "Frameworks", items: ["Spring Boot", "React", "Next.js", "Node.js", "GraphQL", "Streamlit"] },
  { label: "Data", items: ["PostgreSQL", "MySQL", "MongoDB"] },
  { label: "Tools", items: ["Git", "Docker", "AWS", "Linux", "n8n", "CI/CD"] },
];

const ALL_NAV = [
  { id: "work", label: "Work" },
  { id: "design", label: "Design" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

// Expo-out cubic bézier, typed as a tuple so framer-motion accepts it.
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: EASE_OUT_EXPO },
};

const headline = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const word = {
  initial: { opacity: 0, y: "0.35em", filter: "blur(10px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE_OUT_EXPO },
  },
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
    {children}
  </span>
);

const SectionHead = ({
  index,
  label,
  title,
  aside,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
}) => (
  <m.div {...fadeUp} className="mb-10 md:mb-20">
    <div className="mb-8 flex items-center gap-3 border-t border-border pt-5">
      <Label>{index}</Label>
      <span className="h-px w-6 bg-border" aria-hidden="true" />
      <Label>{label}</Label>
    </div>
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <h2 className="text-balance font-serif text-5xl leading-[0.95] tracking-tight md:text-7xl">
        {title}
      </h2>
      {aside}
    </div>
  </m.div>
);

const Tags = ({ tags }: { tags: string[] }) => (
  <ul className="flex flex-wrap gap-1.5">
    {tags.map((tag) => {
      const Icon = techIcons[tag];
      return (
        <li
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-text-secondary"
        >
          {Icon && <Icon className="size-3 shrink-0" aria-hidden="true" />}
          {tag}
        </li>
      );
    })}
  </ul>
);

const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group/link -my-3 inline-flex items-center gap-1 py-3 text-sm font-medium text-text"
  >
    <span className="link-hover">{children}</span>
    <ArrowUpRight
      size={15}
      className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
    />
  </a>
);

const FeaturedProject = ({ project, i }: { project: Project; i: number }) => (
  <m.article
    {...fadeUp}
    className="group grid grid-cols-1 items-center gap-7 md:grid-cols-12 md:gap-12 [&>*]:min-w-0"
  >
    <div className={`md:col-span-5 ${i % 2 ? "md:order-2" : ""}`}>
      <div className="mb-5 flex items-center gap-3">
        <Label>{project.year}</Label>
        <span className="h-px w-4 bg-border" aria-hidden="true" />
        <Label>{project.role}</Label>
      </div>
      <h3 className="font-serif text-4xl tracking-tight md:text-5xl">{project.title}</h3>
      <p className="mt-4 max-w-md text-pretty leading-relaxed text-text-secondary">
        {project.description}
      </p>
      <div className="mt-6">
        <Tags tags={project.tags} />
      </div>
      <div className="mt-7 flex gap-6">
        {project.url && <ExternalLink href={project.url}>Visit site</ExternalLink>}
        {project.source && <ExternalLink href={project.source}>Source</ExternalLink>}
      </div>
    </div>
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${project.title}`}
      className={`block md:col-span-7 ${i % 2 ? "md:order-1" : ""}`}
    >
      {project.shot && project.url && (
        <ProjectPreview
          src={project.shot.src}
          ratio={project.shot.ratio}
          url={project.url}
          alt={`Screenshot of the ${project.title} website`}
        />
      )}
    </a>
  </m.article>
);

const CopyEmail = () => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(SITE.email).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      aria-label="Copy email address"
      className="inline-flex size-11 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-text-tertiary hover:text-text"
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </button>
  );
};

export function Home({ designs, designCount }: { designs: PublicDesign[]; designCount: number }) {
  // The Design section, and its nav link, appear once there is something to show.
  const NAV = designs.length ? ALL_NAV : ALL_NAV.filter((n) => n.id !== "design");
  const num = (id: string) => String(NAV.findIndex((n) => n.id === id) + 1).padStart(2, "0");
  const [year, setYear] = useState<number | null>(null);
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // The phone menu closes on Escape, and when the page grows past phone width.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    const wide = window.matchMedia("(min-width: 640px)");
    const onWide = () => wide.matches && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [menuOpen]);

  // Light up the nav link for the section in the middle of the viewport.
  useEffect(() => {
    const sections = NAV.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <main className="relative min-h-screen overflow-x-clip">
          {/* Navigation */}
          <header className="fixed inset-x-0 top-0 z-50 flex flex-col items-center px-3 pt-3 sm:px-4 sm:pt-4">
            <nav
              aria-label="Primary"
              className="relative flex w-full max-w-6xl items-center justify-between gap-4 overflow-hidden rounded-full border border-border/80 bg-bg/70 py-1.5 pl-5 pr-1.5 backdrop-blur-xl backdrop-saturate-150"
            >
              <a href="#top" className="py-2.5 text-sm font-semibold tracking-tight" onClick={() => setMenuOpen(false)}>
                pratyush<span className="text-text-tertiary">.dev</span>
              </a>
              <div className="flex items-center gap-1">
                <ul className="hidden items-center sm:flex">
                  {NAV.map(({ id, label }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        aria-current={active === id ? "true" : undefined}
                        className={`rounded-full px-3.5 py-2 text-[13px] transition-colors duration-300 ${
                          active === id
                            ? "bg-bg-secondary text-text"
                            : "text-text-secondary hover:text-text"
                        }`}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href={SITE.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-full px-3.5 py-2 text-[13px] text-text-secondary transition-colors hover:text-text md:block"
                >
                  Resume
                </a>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  className="inline-flex size-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text sm:hidden"
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
                <ThemeToggleButton className="ml-1 size-10" />
              </div>
              <m.span
                aria-hidden="true"
                style={{ scaleX: progress }}
                className="absolute inset-x-6 bottom-0 h-px origin-left bg-text/30"
              />
            </nav>

            <AnimatePresence>
              {menuOpen && (
                <m.div
                  id="mobile-menu"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                  className="mt-2 w-full origin-top rounded-3xl border border-border/80 bg-bg/90 p-2 backdrop-blur-xl backdrop-saturate-150 sm:hidden"
                >
                  <ul>
                    {NAV.map(({ id, label }, i) => (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-baseline justify-between rounded-2xl px-4 py-3.5 transition-colors active:bg-bg-secondary"
                        >
                          <span className="font-serif text-3xl tracking-tight">{label}</span>
                          <span className="font-mono text-[11px] text-text-tertiary">0{i + 1}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-1 grid grid-cols-2 gap-2 border-t border-border p-2 pt-3">
                    <a
                      href={SITE.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border py-3 text-sm font-medium"
                    >
                      <Download size={15} /> Resume
                    </a>
                    <a
                      href={SITE.calendar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-text py-3 text-sm font-medium text-bg"
                    >
                      Book a call <ArrowUpRight size={15} />
                    </a>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </header>

          {/* Hero */}
          <section id="top" className="relative mx-auto max-w-6xl px-6 pb-8 pt-32 md:px-10 md:pb-24 md:pt-44">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7">
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
                  className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-bg/60 py-1.5 pl-2.5 pr-3.5"
                >
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/50 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[13px] text-text-secondary">Open to full-time roles</span>
                </m.div>

                <m.h1
                  variants={headline}
                  initial="initial"
                  animate="animate"
                  className="text-balance font-serif text-[clamp(2.9rem,6.2vw,5.6rem)] leading-[0.95] tracking-[-0.02em]"
                >
                  {"I build software, and the guardrails around it.".split(" ").map((w, i) => (
                    <m.span
                      key={i}
                      variants={word}
                      className={`mr-[0.22em] inline-block ${
                        w === "guardrails" ? "italic text-text-secondary" : ""
                      }`}
                    >
                      {w}
                    </m.span>
                  ))}
                </m.h1>

                <m.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.9, ease: EASE_OUT_EXPO }}
                  className="mt-8 max-w-lg text-pretty text-lg leading-relaxed text-text-secondary"
                >
                  I&apos;m Pratyush, a full-stack engineer. Lately I&apos;ve built an
                  approval gateway for AI agents that touch Postgres, and a CLI that
                  tells you what is holding a port before you kill it.
                </m.p>

                <m.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.9, ease: EASE_OUT_EXPO }}
                  className="mt-10 flex flex-wrap items-center gap-3"
                >
                  <a
                    href="#work"
                    className="group inline-flex items-center gap-2 rounded-full bg-text px-5 py-3 text-sm font-medium text-bg transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    See my work
                    <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
                  </a>
                  <a
                    href={SITE.calendar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors duration-300 hover:border-text-tertiary"
                  >
                    Book a call <ArrowUpRight size={15} />
                  </a>
                  {designs.length > 0 && (
                    <a
                      href="#design"
                      className="group -my-3 ml-1 inline-flex items-center gap-1.5 py-3 text-sm text-text-secondary transition-colors hover:text-text"
                    >
                      <span className="link-hover">I design interfaces too</span>
                      <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
                    </a>
                  )}
                </m.div>
              </div>

              <m.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 1.4, ease: EASE_OUT_EXPO }}
                className="relative lg:col-span-5"
              >
                <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
                <HairlineFigure
                  name="stack"
                  autoplay
                  caption={
                    <>
                      <span className="[@media(hover:none)]:hidden">fig. 1 — move across to open the stack</span>
                      <span className="hidden [@media(hover:none)]:inline">fig. 1 — tap across to open the stack</span>
                    </>
                  }
                  className="mx-auto max-w-[520px]"
                  stageClassName="scale-[1.15] lg:scale-[1.3]"
                />
              </m.div>
            </div>
          </section>

          {/* Work */}
          <section id="work" className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-32">
            <SectionHead
              index={num("work")}
              label="Work"
              title="Selected work"
              aside={
                <p className="max-w-xs text-sm text-text-secondary">
                  Things I designed, built and shipped.
                  <span className="hidden [@media(hover:hover)]:inline">
                    {" "}Hover a preview to scroll the page.
                  </span>
                </p>
              }
            />

            <div className="space-y-20 md:space-y-32">
              {featured.map((project, i) => (
                <FeaturedProject key={project.title} project={project} i={i} />
              ))}
            </div>

            <m.div {...fadeUp} className="mt-20 md:mt-28">
              <div className="mb-2 flex items-center justify-between">
                <Label>Also built</Label>
              </div>
              <ul className="divide-y divide-border border-y border-border">
                {more.map((p) => {
                  const href = p.url ?? p.source;
                  const Row = href ? "a" : "div";
                  return (
                    <li key={p.title}>
                      <Row
                        {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="group grid gap-3 py-7 transition-colors duration-500 md:grid-cols-12 md:gap-8"
                      >
                        <span className="font-mono text-[11px] text-text-tertiary md:col-span-1 md:pt-2">
                          {p.year}
                        </span>
                        <div className="md:col-span-4">
                          <h3 className="flex items-center gap-2 font-serif text-3xl tracking-tight">
                            {p.title}
                            {href && (
                              <ArrowUpRight
                                size={18}
                                className="text-text-tertiary transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text"
                              />
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-text-tertiary">{p.role}</p>
                        </div>
                        <p className="text-pretty text-sm leading-relaxed text-text-secondary md:col-span-4 md:pt-1">
                          {p.description}
                        </p>
                        <div className="md:col-span-3 md:flex md:justify-end md:pt-1">
                          <Tags tags={p.tags} />
                        </div>
                      </Row>
                    </li>
                  );
                })}
              </ul>
            </m.div>
          </section>

          {/* Design */}
          {designs.length > 0 && (
            <section id="design" className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-32">
              <SectionHead
                index={num("design")}
                label="UI / UX"
                title={
                  <>
                    Interface <span className="italic text-text-secondary">craft</span>
                  </>
                }
                aside={
                  <p className="max-w-xs text-sm text-text-secondary">
                    Screens, flows and motion I designed. Recordings play as you
                    scroll; open any of them for the full view.
                  </p>
                }
              />
              <m.div {...fadeUp}>
                <DesignGallery designs={designs} />
              </m.div>
              <m.div {...fadeUp} className="mt-14 flex justify-center md:mt-20">
                <a
                  href="/design"
                  className="group inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors duration-300 hover:border-text-tertiary"
                >
                  {designCount > designs.length ? `See all ${designCount} designs` : "Open the design gallery"}
                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </m.div>
            </section>
          )}

          {/* About */}
          <section id="about" className="border-y border-border bg-bg-secondary">
            <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-32">
              <SectionHead index={num("about")} label="About" title="How I work" />

              <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
                <m.div {...fadeUp} className="space-y-6 text-lg leading-relaxed text-text-secondary lg:col-span-6">
                  <p className="text-pretty">
                    Writing code got cheap. Deciding what should ship didn&apos;t. I use
                    AI tools every day, and I treat what they write like a pull request
                    from a fast, confident teammate: read it, test it, and own whatever
                    reaches production.
                  </p>
                  <p className="text-pretty">
                    A lot of what I build sits right at that edge. Backstop puts a
                    person between an agent and a live database. Portopsy shows you
                    exactly what you are about to stop before you stop it. Both are
                    read-only until you say otherwise.
                  </p>
                  <p className="text-pretty">
                    Before that, I worked across Java and Spring Boot back ends, React
                    and Next.js front ends, and the plumbing between them.
                  </p>
                </m.div>

                <m.div {...fadeUp} className="lg:col-span-5 lg:col-start-8">
                  <HairlineFigure
                    name="keys"
                    caption="fig. 2 — press a key"
                    className="[--hairline-plate:var(--color-bg-secondary)]"
                    stageClassName="lg:scale-110"
                  />
                </m.div>
              </div>

              <m.dl
                {...fadeUp}
                className="mt-14 grid gap-x-8 gap-y-8 md:mt-20 md:gap-y-10 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4"
              >
                {toolbox.map((group) => (
                  <div key={group.label}>
                    <dt className="mb-3">
                      <Label>{group.label}</Label>
                    </dt>
                    <dd className="text-[15px] leading-7 text-text">
                      {group.items.join(", ")}
                    </dd>
                  </div>
                ))}
              </m.dl>
            </div>
          </section>

          {/* Experience */}
          <section id="experience" className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-32">
            <SectionHead
              index={num("experience")}
              label="Experience"
              title="Where I've worked"
              aside={
                <a
                  href={SITE.resume}
                  download="PratyushRastogi-Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2.5 text-sm font-medium transition-colors duration-300 hover:border-text-tertiary md:self-auto"
                >
                  <Download size={15} /> Resume (PDF)
                </a>
              }
            />

            <ol className="border-b border-border">
              {experience.map((exp) => (
                <m.li
                  key={exp.period}
                  {...fadeUp}
                  className="grid gap-3 border-t border-border py-8 md:grid-cols-12 md:gap-8"
                >
                  <span className="font-mono text-[12px] text-text-tertiary md:col-span-3 md:pt-1.5">
                    {exp.period}
                  </span>
                  <div className="md:col-span-4">
                    <h3 className="font-serif text-3xl tracking-tight">{exp.company}</h3>
                    <p className="mt-1 text-sm text-text-tertiary">
                      {exp.role} · {exp.place}
                    </p>
                  </div>
                  <p className="text-pretty leading-relaxed text-text-secondary md:col-span-5 md:pt-1">
                    {exp.details}
                  </p>
                </m.li>
              ))}
            </ol>

            <m.div {...fadeUp} id="resume" className="mt-14 grid gap-5 md:mt-20 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-3">
                <Label>Education</Label>
              </div>
              <div className="md:col-span-4">
                <h3 className="font-serif text-2xl">Graphic Era University</h3>
                <p className="mt-1 text-sm text-text-secondary">B.Sc. Information Technology</p>
                <p className="mt-1 font-mono text-[12px] text-text-tertiary">2022 – 2025 · CGPA 7.64</p>
              </div>
              <div className="md:col-span-5">
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex justify-between gap-4 border-b border-border pb-2">
                    <span>Data Science — Great Learning</span>
                    <span className="font-mono text-[12px] text-text-tertiary">Certified</span>
                  </li>
                  <li className="flex justify-between gap-4 border-b border-border pb-2">
                    <span>Oracle Java</span>
                    <span className="font-mono text-[12px] text-text-tertiary">In progress</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>AWS Solutions Architect</span>
                    <span className="font-mono text-[12px] text-text-tertiary">Studying</span>
                  </li>
                </ul>
              </div>
            </m.div>
          </section>

          {/* Contact */}
          <footer id="contact" className="border-t border-border">
            <div className="mx-auto max-w-6xl px-6 pb-10 pt-20 md:px-10 md:pt-32">
              <m.div {...fadeUp}>
                <div className="mb-8 flex items-center gap-3">
                  <Label>{num("contact")}</Label>
                  <span className="h-px w-6 bg-border" aria-hidden="true" />
                  <Label>Contact</Label>
                </div>
                <h2 className="font-serif text-[clamp(3.5rem,11vw,9rem)] leading-[0.9] tracking-[-0.02em]">
                  Let&apos;s <span className="italic text-text-secondary">talk.</span>
                </h2>
                <p className="mt-8 max-w-md text-lg text-text-secondary">
                  Hiring, a project, or something you are stuck on. Email is the
                  fastest way to reach me.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${SITE.email}`}
                    className="inline-flex items-center rounded-full bg-text px-5 py-3 text-sm font-medium text-bg transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {SITE.email}
                  </a>
                  <CopyEmail />
                  <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
                  <a
                    href={SITE.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-border transition-colors duration-300 hover:bg-text hover:text-bg"
                  >
                    <Github size={18} />
                  </a>
                  <a
                    href={SITE.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-border transition-colors duration-300 hover:bg-text hover:text-bg"
                  >
                    <Linkedin size={18} />
                  </a>
                  <a
                    href={SITE.x}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={`X (${SITE.xHandle})`}
                    className="inline-flex size-11 items-center justify-center rounded-full border border-border transition-colors duration-300 hover:bg-text hover:text-bg"
                  >
                    <SiX size={15} aria-hidden="true" />
                  </a>
                </div>
              </m.div>

              <div className="mt-16 flex flex-col gap-1 md:mt-28 border-t border-border pt-6 font-mono text-[11px] text-text-tertiary sm:flex-row sm:items-center sm:justify-between">
                <span>© {year ?? ""} Pratyush Rastogi</span>
                <a href="#top" className="link-hover -my-3 self-start py-3 sm:self-auto">
                  Back to top ↑
                </a>
              </div>
            </div>
          </footer>

          {/* Desktop only: on a phone it would sit over the text, and the
              hero, menu and contact section already offer the call. */}
          <div className="hidden md:block">
          <FloatingConsultButton
            buttonSize={112}
            imageSize={64}
            position={{ bottom: "1.5rem", right: "1.5rem" }}
            revolvingText="BOOK A CALL · 30 MIN · BOOK A CALL · 30 MIN · "
            ctaButtonAction={() => window.open(SITE.calendar, "_blank", "noopener,noreferrer")}
            imageSrc="https://github.com/pratyush2514.png?size=160"
            imageAlt="Pratyush Rastogi"
            popupHeading="30 minutes."
            popupBadgeText="Free"
            popupDescription="A short call about a role, a project, or a problem you are working through. Pick a time that suits you."
            ctaButtonText="Pick a time"
          />
          </div>

          <GitHubStreak />
        </main>
      </MotionConfig>
    </LazyMotion>
  );
}
