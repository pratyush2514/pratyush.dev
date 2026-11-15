import type { Project } from "@/config/types";

export const projectsSectionConfig = {
  title: "Work",
  liveButtonLabel: "View Product",
  liveTooltip: "Open project",
};

export const projectsConfig: Project[] = [
  {
    id: "backstop",
    title: "Backstop — Approval gateway for AI agents",
    description:
      "A gateway between AI agents and a PostgreSQL database. It parses every query, holds destructive writes until a person approves them, and restores a table from snapshots kept in your own storage.",
    content:
      "## Problem\nAI agents are getting direct access to production databases. One wrong `DELETE` or `DROP` from an agent that misread its task can take out real data, and most setups have no step where a person gets to say no.\n\n## Solution\nBackstop sits between the agent and PostgreSQL. It parses every query, lets reads through, and holds destructive writes until a person approves them. Before an approved write runs, it snapshots the affected table into storage you own, so any change can be rolled back.\n\n## Outcome\nAgents keep working at full speed on safe queries, while anything that could destroy data waits for a human. The gateway, approval flow and restore path are built with Go, Python and TypeScript, and ship as Docker images.",
    image: "/projects/backstop.webp",
    imageAlt: "Screenshot of the Backstop website",
    liveUrl: "https://backstop-iota.vercel.app/",
    tags: ["Go", "Python", "TypeScript", "PostgreSQL", "Docker"],
    year: 2026,
    status: "building",
    category: "Developer tools",
    order: 1,
    enabled: true,
  },
  {
    id: "portopsy",
    title: "Portopsy — What is using this port?",
    description:
      "A command-line tool for Linux and WSL2 that answers one question: what is using this port? It shows the process, its parent chain, working directory and container, and changes nothing unless you confirm.",
    content:
      "## Problem\n`address already in use` usually ends with someone running `kill -9` on a PID they found in a hurry, without knowing what it was, who started it, or whether it lived in a container.\n\n## Solution\nPortopsy is a Rust CLI for Linux and WSL2. Give it a port and it shows the owning process, its parent chain, working directory and container. It is read-only by default and only stops anything after you confirm.\n\n## Outcome\nYou see exactly what you are about to stop before you stop it. The source is on GitHub.",
    image: "/projects/portopsy.webp",
    imageAlt: "Screenshot of the Portopsy website",
    liveUrl: "https://portopsy-cli.vercel.app/",
    githubUrl: "https://github.com/pratyush2514/portopsy",
    tags: ["Rust", "Linux", "CLI"],
    year: 2026,
    status: "new",
    category: "CLI",
    order: 2,
    enabled: true,
  },
  {
    id: "pulseboard",
    title: "PulseBoard — Slack conversation health",
    description:
      "Reads Slack channels and shows how conversations are going: tone over time, threads still waiting on a reply, and channels where things are getting tense.",
    content:
      "## Problem\nIn a busy Slack workspace, it is hard to tell which threads have been left hanging or which channels are heading somewhere tense until it is already a problem.\n\n## Solution\nPulseBoard reads Slack channels and turns them into a dashboard: tone over time, threads still waiting on a reply, and channels where sentiment is dropping. Built at Wednesday Solutions with Next.js, Node.js, Express and OpenAI.\n\n## Outcome\nTeam leads get an early read on conversations that need attention instead of finding out after the fact.",
    image: "/projects/pulseboard.webp",
    imageAlt: "Screenshot of the PulseBoard website",
    liveUrl: "https://sentiment-front-end-next-js.vercel.app/",
    tags: ["Next.js", "Node.js", "Express", "OpenAI", "Slack"],
    year: 2026,
    status: "shipped",
    category: "Dashboard",
    order: 3,
    enabled: true,
  },
  {
    id: "rss-posting",
    title: "RSS Posting",
    description:
      "Publishes to Facebook and Instagram from RSS feeds, with an approval step before anything goes live. Built end to end and supported after launch.",
    content:
      "## Problem\nThe client wanted posts from their RSS feeds to reach Facebook and Instagram without someone copying them over by hand, but nothing could go live without a review.\n\n## Solution\nA Spring Boot and React app that pulls RSS feeds, drafts the social posts, and queues them for approval. JWT auth controls who can approve.\n\n## Outcome\nBuilt end to end as a freelance contract and supported after launch.",
    imageAlt: "RSS Posting",
    tags: ["Spring Boot", "React", "JWT"],
    year: 2025,
    status: "shipped",
    category: "Freelance",
    order: 4,
    enabled: true,
  },
  {
    id: "not-just-todo-ai",
    title: "Not Just ToDo AI",
    description:
      "Suggests a next project that matches what a student already knows, so it is a real step up rather than another tutorial clone.",
    imageAlt: "Not Just ToDo AI",
    tags: ["Next.js", "Spring Boot", "MySQL", "OpenAI"],
    year: 2025,
    status: "shipped",
    category: "Side project",
    order: 5,
    enabled: true,
  },
  {
    id: "clean-my-data",
    title: "Clean My Data",
    description:
      "Turns a raw dataset into summary statistics, interactive charts and a PDF report. Cut reporting time by about 70%.",
    imageAlt: "Clean My Data",
    githubUrl: "https://github.com/pratyush2514/Clean-My-Data",
    tags: ["Python", "Streamlit", "Pandas"],
    year: 2024,
    status: "shipped",
    category: "Side project",
    order: 6,
    enabled: true,
  },
];

export function getProjectById(id: string) {
  return projectsConfig.find((project) => project.id === id && project.enabled !== false);
}
