import type { ExperienceItem } from "@/config/types";

export const experienceSectionConfig = {
  title: "Experience",
};

export const experienceConfig: ExperienceItem[] = [
  {
    id: "wednesday",
    role: "Software Engineer I",
    company: "Wednesday Solutions · Full-time · Pune",
    period: "Feb – Apr 2026",
    summary:
      "Shipped features on two products: PulseBoard, a Slack sentiment dashboard, and a queue management system that plugs into Moodle and Canvas.",
    order: 1,
    enabled: true,
  },
  {
    id: "freelance-rss",
    role: "Full-stack developer",
    company: "Freelance · Contract",
    period: "Oct – Dec 2025",
    summary:
      "Built RSS Posting, a tool that publishes to Facebook and Instagram from RSS feeds with an approval step, JWT auth, and support after launch.",
    order: 2,
    enabled: true,
  },
  {
    id: "freelance-automation",
    role: "Automation engineer",
    company: "Freelance · Contract",
    period: "Jun 2025",
    summary:
      "Set up server monitoring with n8n and Bash scripts that post to Slack the moment something goes down.",
    order: 3,
    enabled: true,
  },
  {
    id: "education",
    role: "B.Sc. Information Technology",
    company: "Graphic Era University",
    period: "2022 – 2025",
    summary: "CGPA 7.64.",
    highlights: [
      "Data Science — Great Learning (certified)",
      "Oracle Java (in progress)",
      "AWS Solutions Architect (studying)",
    ],
    order: 4,
    enabled: true,
  },
];
