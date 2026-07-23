"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  Code2,
  Cpu,
  Calendar,
} from "lucide-react";
import { ThemeToggleButton } from "@/components/theme-toggle";
import { FloatingConsultButton } from "@/components/floating-consult-button";
import { GitHubStreak } from "@/components/github-streak";
import { useEffect, useCallback, useState, useRef } from "react";
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
  SiMongodb,
  SiGraphql,
  SiStreamlit,
  SiPandas,
  SiJsonwebtokens,
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
  MongoDB: SiMongodb,
  GraphQL: SiGraphql,
  Streamlit: SiStreamlit,
  Pandas: SiPandas,
  JWT: SiJsonwebtokens,
};

const RESUME_URL =
  "https://nqysiprpmxxombsdvdkh.supabase.co/storage/v1/object/public/portfolio/PratyushRastogiResume.pdf";
const CALCOM_URL = "https://cal.com/pratyush-rastogi-wck12m/30min";

const projects = [
  {
    title: "Backstop",
    role: "Creator & Maintainer",
    description:
      "The last line of defense between your AI agent and production. An open-source safety gateway that classifies risky PostgreSQL queries via AST parsing, gates destructive writes behind human approval, and restores table snapshots from your own storage.",
    tags: ["Go", "Python", "TypeScript", "PostgreSQL", "Docker"],
    year: "2026",
    url: "https://backstop-iota.vercel.app/",
  },
  {
    title: "PulseBoard",
    role: "Full-Stack Engineer",
    description:
      "Sentiment analysis for Slack conversations. Ingests message streams and surfaces team mood, tone shifts, and engagement signals through a real-time analytics dashboard.",
    tags: ["Next.js", "Node.js", "Express", "OpenAI", "Slack"],
    year: "2026",
    url: "https://sentiment-front-end-next-js.vercel.app/",
  },
  {
    title: "RSS Posting (rssposting.com)",
    role: "Full-Stack Engineer",
    description:
      "Production platform for automated Facebook and Instagram management. Features RSS feed posting, admin approval workflows, and JWT security.",
    tags: ["Spring Boot", "JWT", "CI/CD", "React"],
    year: "2025",
    url: "https://rssposting.com",
  },
  {
    title: "Not Just ToDo AI",
    role: "",
    description:
      "Personalized project idea generator using prompt engineering to move students beyond basic tutorials based on their specific learning progression.",
    tags: ["Next.js", "Spring Boot", "MySQL", "OpenAI"],
    year: "2025",
    url: "",
  },
  {
    title: "Automated EDA Platform",
    // role: "Software Engineer",
    description:
      "Data analysis platform reducing statistical reporting time by 70%. Optimized for large datasets with interactive visualizations and automated PDF generation.",
    tags: ["Python", "Streamlit", "Pandas", "EDA"],
    year: "2024",
    url: "https://github.com/pratyush2514/Clean-My-Data",
  },
];

const experience = [
  {
    company: "Freelance",
    role: "Automation Engineer",
    period: "Jun 2025",
    details:
      "Delivered end-to-end monitoring workflows using n8n and custom Bash scripts. Integrated real-time Slack alerting via OAuth API for 99.9% uptime awareness.",
  },
  {
    company: "Freelance Full Stack Developer",
    role: "Web Developer",
    period: "Oct 2025 - Dec 2025",
    details:
      "Implemented a platform for automated Facebook and Instagram management. Features RSS feed posting, admin approval authentication, and End-2-End JWT security and Long Term Support.",
  },
  {
    company: "Wednesday Solutions",
    role: "Software Engineer I · Full-Time · Pune",
    period: "Feb 2026 - Apr 2026",
    details:
      "Shipped production features across two products: PulseBoard, a real-time Slack sentiment-analysis dashboard, and a Queue Management System (QMS) integrated with LMS platforms like Moodle and Canvas.",
  },
];

const skills = [
  {
    category: "Languages",
    items: ["Java", "C#", "Python", "SQL"],
    icon: Code2,
  },
  {
    category: "Technologies",
    items: ["Spring Boot", "React", "Next.js", "GraphQL", "MySQL", "MongoDB"],
    icon: Cpu,
  },
  {
    category: "Tools",
    items: ["Git", "Docker", "AWS", "Linux", "CI/CD"],
    icon: Code2,
  },
  {
    category: "Core",
    items: [
      "AI Integration",
      "Prompt Engineering",
      "Full-Stack Development, Database Design, Enterprise Application Development",
      "System Design",
    ],
    icon: Cpu,
  },
];

// Expo-out cubic bézier, typed as a tuple so framer-motion accepts it.
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: EASE_OUT_EXPO },
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
  viewport: { once: true },
};

const wordAnimation = {
  initial: { opacity: 0, y: 20 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
  },
};

// Builds an on-the-fly screenshot of a live URL (link-unfurl style, à la X/Slack).
// Returned image is used directly as an <img src>. Swap this line for a static
// asset path later if you want zero external dependency.
const buildPreviewSrc = (url: string) =>
  `https://api.microlink.io/?url=${encodeURIComponent(
    url
  )}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=800&waitUntil=networkidle2`;

const ProjectCard = ({ project, i }: { project: any; i: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [previewMounted, setPreviewMounted] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  const previewSrc =
    project.url && project.preview !== false
      ? buildPreviewSrc(project.url)
      : null;

  // Drive the cursor spotlight via a direct style write instead of React state,
  // so moving the mouse never triggers a re-render (60fps without reconciliation).
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.background = `radial-gradient(600px circle at ${x}px ${y}px, var(--color-border), transparent 40%)`;
  };

  const handleEnter = () => {
    if (glowRef.current) glowRef.current.style.opacity = "1";
    setHovered(true);
    if (previewSrc) setPreviewMounted(true); // lazy: only fetch once hovered
  };

  const handleLeave = () => {
    if (glowRef.current) glowRef.current.style.opacity = "0";
    setHovered(false);
  };

  const handleClick = () => {
    if (!project.url) return;
    window.open(project.url, "_blank", "noopener,noreferrer");
  };

  const showPreview = hovered && previewLoaded && !previewFailed;

  return (
    <m.div
      ref={containerRef}
      key={project.title}
      {...fadeUp}
      transition={{ delay: i * 0.05, ...fadeUp.transition }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className="group relative grid gap-8 bg-bg py-12 transition-colors duration-500 hover:bg-bg-secondary/50 md:grid-cols-12 md:gap-16 overflow-hidden"
    >
      {previewSrc && previewMounted && (
        <img
          src={previewSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          draggable={false}
          onLoad={() => setPreviewLoaded(true)}
          onError={() => setPreviewFailed(true)}
          className={`pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-left-top grayscale transition-opacity duration-700 ease-out ${
            showPreview ? "opacity-[0.11] dark:opacity-[0.17]" : "opacity-0"
          }`}
          style={{
            maskImage:
              "radial-gradient(135% 130% at 88% 45%, #000 8%, transparent 68%)",
            WebkitMaskImage:
              "radial-gradient(135% 130% at 88% 45%, #000 8%, transparent 68%)",
          }}
        />
      )}
      <div
        ref={glowRef}
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
      />

      <div className="relative z-10 md:col-span-1">
        <span className="text-xs font-bold text-text-tertiary tabular-nums">
          {project.year}
        </span>
      </div>
      <div className="relative z-10 md:col-span-5">
        <h3 className="font-serif text-3xl md:text-4xl group-hover:italic transition-all duration-500">
          {project.title}
        </h3>
        <p className="mt-2 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          {project.role}
        </p>
      </div>
      <div className="relative z-10 md:col-span-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag: string) => {
            const Icon = techIcons[tag];
            return (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-text-tertiary transition-colors duration-300 group-hover:border-text-tertiary/50 group-hover:text-text-secondary"
              >
                {Icon && (
                  <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                )}
                {tag}
              </span>
            );
          })}
        </div>
      </div>
      <div className="relative z-10 flex justify-end md:col-span-2">
        <div className="h-10 w-10 flex items-center justify-center rounded-full border border-border transition-all duration-500 group-hover:rotate-45 group-hover:bg-text group-hover:text-bg">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </m.div>
  );
};

export default function Home() {
  const openExternalUrl = useCallback((url: string) => {
    try {
      window.parent.postMessage(
        { type: "OPEN_EXTERNAL_URL", data: { url } },
        "*"
      );
    } catch {
      // Fallback: try direct navigation if postMessage fails
    }
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
    <main className="relative min-h-screen selection:bg-text selection:text-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 lg:px-24 mix-blend-difference">
        <span className="text-sm font-semibold tracking-tighter select-none hover:text-[#b8a16f] transition-colors duration-700 cursor-default uppercase text-bg dark:text-white">
          pratyush.dev
        </span>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8">
            {["Work", "About", "Experience", "Resume", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-bg/80 dark:text-white/60 hover:text-bg dark:hover:text-white transition-colors link-hover"
              >
                {item}
              </a>
            ))}
          </div>
          <ThemeToggleButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex min-h-[90vh] flex-col justify-center px-6 pt-24 md:px-12 lg:px-24">
        <div className="max-w-5xl">
          <m.div {...fadeUp}>
            <span className="mb-6 block text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary">
              Full-Stack Developer / Prompt Engineer / Software Developer
            </span>
          </m.div>

          <m.h1
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="text-balance font-serif text-[clamp(2.5rem,10vw,7rem)] leading-[0.9] tracking-tighter flex flex-wrap gap-x-[0.2em]"
          >
            {"Manipulating LLMs to shape high-quality digital experiences."
              .split(" ")
              .map((word, i) => (
                <m.span
                  key={i}
                  variants={wordAnimation}
                  className={word === "high-quality" ? "italic font-light" : ""}
                >
                  {word}
                </m.span>
              ))}
          </m.h1>

          <m.div
            {...fadeUp}
            transition={{ delay: 0.5, ...fadeUp.transition }}
            className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
          >
            <p className="max-w-md text-lg leading-relaxed text-text-secondary">
              I build intentional systems using AI-assisted workflows. Focused
              on engineering correctness and design taste—delivering
              production-ready solutions with technical depth.
            </p>

            <div className="flex gap-6">
              <a
                href="#work"
                className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all hover:text-text-tertiary"
              >
                View Projects
                <m.span
                  animate={{ y: [0, 4, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ↓
                </m.span>
              </a>
            </div>
          </m.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="work" className="px-6 py-32 md:px-12 lg:px-24">
        <div className="mb-20">
          <h2 className="font-serif text-5xl md:text-7xl">Selected Work</h2>
        </div>

        <div className="grid gap-px bg-border">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} i={i} />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="bg-bg-secondary px-6 py-32 md:px-12 lg:px-24 relative overflow-hidden"
      >
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2">
          <m.div {...fadeUp}>
            <span className="mb-6 block text-xs font-bold uppercase tracking-widest text-text-tertiary">
              Perspective
            </span>
            <h2 className="mb-8 font-serif text-5xl md:text-6xl">Philosophy</h2>
            <div className="space-y-6 text-lg leading-relaxed text-text-secondary">
              <p>
                The job stopped being about typing code. The bottleneck is no
                longer output—it&apos;s judgment. I design the system, direct
                the agents that build it, and stay accountable for every
                decision that reaches production.
              </p>
              <p>
                I think of this as{" "}
                <span className="text-text font-medium italic">
                  agentic engineering
                </span>
                : orchestrating LLMs across the full loop—plan, build,
                verify—while keeping a human hand on architecture, correctness,
                and taste. Generating code is cheap now; knowing what deserves
                to ship is the hard part.
              </p>
              <p>
                Agents accelerate everything, mistakes included. So I build the
                guardrails that make speed safe—typed contracts, tests, review
                gates, and the tooling that sits between an agent and
                production. The result should read as intentional and
                unmistakably human-crafted, never autogenerated.
              </p>
            </div>
          </m.div>

          <m.div
            {...fadeUp}
            className="flex flex-col justify-center border-t border-border pt-16 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-24"
          >
            <span className="mb-8 block text-xs font-bold uppercase tracking-widest text-text-tertiary">
              Competencies
            </span>
            <div className="grid grid-cols-2 gap-12">
              {skills.map((skillGroup, i) => {
                const Icon = skillGroup.icon;
                return (
                  <m.div
                    key={skillGroup.category}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Icon
                      className="mb-4 text-text-tertiary transition-colors group-hover:text-text"
                      size={24}
                    />
                    <h4 className="mb-2 font-bold uppercase tracking-tighter">
                      {skillGroup.category}
                    </h4>
                    <ul className="text-sm text-text-secondary space-y-1">
                      {skillGroup.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </m.div>
                );
              })}
            </div>
          </m.div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="px-6 py-32 md:px-12 lg:px-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-6 block text-xs font-bold uppercase tracking-widest text-text-tertiary">
            Journey
          </span>
          <div className="space-y-16">
            {experience.map((exp) => (
              <m.div key={exp.company} {...fadeUp} className="group">
                <span className="text-xs font-bold tabular-nums text-text-tertiary">
                  {exp.period}
                </span>
                <h3 className="mt-2 font-serif text-4xl md:text-5xl group-hover:italic transition-all duration-500">
                  {exp.company}
                </h3>
                <p className="mt-1 text-sm font-medium uppercase tracking-widest text-text-tertiary">
                  {exp.role}
                </p>
                <p className="mx-auto mt-4 max-w-xl text-text-secondary">
                  {exp.details}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section
        id="resume"
        className="bg-bg-secondary px-6 py-32 md:px-12 lg:px-24 border-y border-border"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-text-tertiary">
                Credentials
              </span>
              <h2 className="font-serif text-5xl md:text-6xl">Resume</h2>
            </div>
            <m.a
              href={RESUME_URL}
              download="PratyushRastogi-Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest cursor-pointer"
            >
              Download PDF{" "}
              <ArrowUpRight
                size={16}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
              />
            </m.a>
          </div>

          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-tertiary">
                <Code2 size={14} /> Technical Core
              </h3>
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tighter mb-2">
                    Languages & Dev
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Java (Advanced), Java 8, C#, Python, SQL, HTML/CSS,
                    JavaScript, TypeScript, OOPs.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tighter mb-2">
                    Frameworks & APIs
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Java Spring Boot, GraphQL, MySQL, MongoDB, REST APIs,
                    Streamlit, React, Next.js.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tighter mb-2">
                    Tools & DevOps
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Git, Docker, AWS, Linux, n8n, CI/CD Pipelines, OAuth API.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-tertiary">
                <Cpu size={14} /> Education & Certs
              </h3>
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tighter mb-2">
                    Graphic Era University
                  </h4>
                  <p className="text-text-secondary text-sm">
                    B.Sc. in IT (2022 — 2025)
                  </p>
                  <p className="text-xs text-text-tertiary mt-1 tabular-nums">
                    CGPA: 7.64 / 10.0
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-tighter mb-2">
                    Certifications
                  </h4>
                  <ul className="text-text-secondary text-sm space-y-1">
                    <li>Data Science Certification (Great Learning)</li>
                    <li>Oracle Java Certification (In Progress)</li>
                    <li>AWS Solutions Architect (Currently Learning)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="px-6 py-24 md:px-12 lg:px-24">
        <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <div>
            <span className="mb-6 block text-xs font-bold uppercase tracking-widest text-text-tertiary">
              Get in touch
            </span>
            <h2 className="mb-8 font-serif text-6xl md:text-8xl">
              Let&apos;s talk.
            </h2>
            <div className="flex flex-wrap gap-8">
              <a
                href="mailto:rastogipratyush630@gmail.com"
                className="flex items-center gap-2 text-xl font-medium link-hover"
              >
                <Mail size={20} /> <span>rastogipratyush630@gmail.com</span>
              </a>
              <div className="flex gap-4">
                <m.a
                  whileHover={{
                    y: -3,
                    backgroundColor: "var(--color-text)",
                    color: "var(--color-bg)",
                  }}
                  href="https://github.com/pratyush2514"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border transition-colors duration-300"
                >
                  <Github size={20} />
                </m.a>
                <m.a
                  whileHover={{
                    y: -3,
                    backgroundColor: "var(--color-text)",
                    color: "var(--color-bg)",
                  }}
                  href="https://linkedin.com/in/pratyushrastogi05"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border transition-colors duration-300"
                >
                  <Linkedin size={20} />
                </m.a>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-tertiary">
              Open for collaboration & roles
            </p>
            <p className="mt-4 text-xs text-text-tertiary opacity-50">
              © {mounted ? new Date().getFullYear() : "2025"} Pratyush Rastogi.
              Handcrafted with intent.
            </p>
          </div>
        </div>
      </footer>

      <FloatingConsultButton
        ctaButtonAction={() =>
          window.open(CALCOM_URL, "_blank", "noopener,noreferrer")
        }
        imageSrc="https://design.cal.com/~gitbook/image?url=https%3A%2F%2F2607815040-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FpmUOqZjfGqNkiPmqgnMv%252Fuploads%252FWIZxsSWIHr9tS5JyNxfv%252Fimage.png%3Falt%3Dmedia%26token%3D8c767397-829e-46d4-a670-929749474e35&width=300&dpr=4&quality=100&sign=696ce3d2&sv=2"
        imageAlt="Pratyush Rastogi"
        popupHeading="Let's build something."
        popupDescription="Schedule a 30-minute session to discuss AI integration, automation workflows, or full-stack architectural challenges. No strings attached—just technical depth and design taste."
        ctaButtonText="Schedule Call"
      />

      <GitHubStreak />
    </main>
    </LazyMotion>
  );
}
