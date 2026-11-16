// Builds /llms.txt and /llms-full.txt (https://llmstxt.org) from the same
// config the site renders, so the summary AI tools read never drifts from
// the pages people see.

import { certificationStatus, educationConfig } from "@/config/education";
import { experienceConfig } from "@/config/experience";
import { heroConfig } from "@/config/hero";
import { projectsConfig } from "@/config/projects";
import { aboutItems, siteConfig } from "@/config/site";
import { skillsConfig, skillsSectionConfig } from "@/config/skills";
import { absoluteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";

const projects = () =>
  projectsConfig
    .filter((p) => p.enabled !== false)
    .sort((a, b) => a.order - b.order);

const statusLabel = { building: "in progress", new: "recently launched", shipped: "shipped" } as const;

function header(): string[] {
  return [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    heroConfig.description,
    "",
    `- Role: ${SITE.jobTitle}`,
    `- Location: ${siteConfig.personal.location.label} (${siteConfig.personal.location.timeZone})`,
    `- Email: ${SITE.email}`,
    `- Website: ${SITE.url}`,
  ];
}

function projectLine(p: ReturnType<typeof projects>[number]): string {
  const links = [
    p.liveUrl && `[live](${p.liveUrl})`,
    p.githubUrl && `[source](${p.githubUrl})`,
  ].filter(Boolean);
  return `- [${p.title}](${absoluteUrl(`/project/${p.id}`)}): ${p.description} (${p.year}, ${statusLabel[p.status]}; ${p.tags.join(", ")}${links.length ? `; ${links.join(", ")}` : ""})`;
}

function skillsLines(): string[] {
  return skillsSectionConfig.categories.map((category) => {
    const names = skillsConfig
      .filter((s) => s.enabled && s.category === category.id)
      .sort((a, b) => a.order - b.order)
      .map((s) => s.name);
    return `- ${category.label}: ${names.join(", ")}`;
  });
}

function experienceLines(): string[] {
  return experienceConfig
    .filter((e) => e.enabled !== false)
    .sort((a, b) => a.order - b.order)
    .map((e) => `- ${e.role}, ${e.company} (${e.period}): ${e.summary}`);
}

function educationLines(): string[] {
  return [
    ...educationConfig.map(
      (e) => `- ${e.degree}, ${e.school} (${e.period})${e.note ? `, ${e.note}` : ""}`,
    ),
    ...certificationStatus.map(
      (c) => `- ${c.title}${c.issuer ? ` (${c.issuer})` : ""}: ${c.status}`,
    ),
  ];
}

function contactLines(): string[] {
  return [
    `- [Email](mailto:${SITE.email}): fastest way to reach me`,
    `- [Book a 30-minute call](${SITE.calendar})`,
    `- [Resume (PDF)](${SITE.resume})`,
    `- [GitHub](${SITE.github})`,
    `- [LinkedIn](${SITE.linkedin})`,
    `- [X / Twitter](${SITE.x})`,
  ];
}

export function buildLlmsTxt(): string {
  return [
    ...header(),
    "",
    "## Projects",
    "",
    ...projects().map(projectLine),
    "",
    "## Pages",
    "",
    `- [Home](${SITE.url}): profile, projects, stack, experience and contact`,
    `- [UI / UX design](${absoluteUrl("/design")}): interface, flow and motion design work`,
    `- [Full text for LLMs](${absoluteUrl("/llms-full.txt")}): everything below plus each project's case study`,
    "",
    "## Experience",
    "",
    ...experienceLines(),
    "",
    "## Contact",
    "",
    ...contactLines(),
    "",
    "## Optional",
    "",
    "### Stack",
    "",
    ...skillsLines(),
    "",
    "### Education and certifications",
    "",
    ...educationLines(),
    "",
  ].join("\n");
}

export function buildLlmsFullTxt(): string {
  const caseStudies = projects().flatMap((p) => {
    const body =
      typeof p.content === "string"
        ? // Demote the case-study headings one level so they nest under the project.
          p.content.replace(/^(#{1,5}) /gm, "$1## ")
        : p.description;
    return [
      `### ${p.title}`,
      "",
      `URL: ${absoluteUrl(`/project/${p.id}`)}`,
      p.liveUrl ? `Live: ${p.liveUrl}` : null,
      p.githubUrl ? `Source: ${p.githubUrl}` : null,
      `Year: ${p.year} · Category: ${p.category} · Status: ${statusLabel[p.status]}`,
      `Stack: ${p.tags.join(", ")}`,
      "",
      body,
      "",
    ].filter((line): line is string => line !== null);
  });

  return [
    ...header(),
    "",
    "## About",
    "",
    ...aboutItems.map((item) => `- ${item.lead} ${item.body}`),
    "",
    "## How I work",
    "",
    ...(siteConfig.workflow.intro ? [siteConfig.workflow.intro, ""] : []),
    ...siteConfig.workflow.items.map(
      (item, index) =>
        `${index + 1}. ${item.label}: ${item.description}${item.outputs?.length ? ` (Produces: ${item.outputs.join(", ")}.)` : ""}`,
    ),
    "",
    "## Projects",
    "",
    ...caseStudies,
    "## Experience",
    "",
    ...experienceLines(),
    "",
    "## Stack",
    "",
    ...skillsLines(),
    "",
    "## Education and certifications",
    "",
    ...educationLines(),
    "",
    "## Contact",
    "",
    ...contactLines(),
    "",
  ].join("\n");
}
