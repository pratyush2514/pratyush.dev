import { skillsConfig, skillsSectionConfig } from "@/config/skills";
import type { SkillIcon, SkillItem } from "@/config/types";
import { cn } from "@/lib/utils";
import ClaudeCodeIcon from "@/public/stacks/claude-code";
import GrokIcon from "@/public/stacks/grok";
import NextjsIcon from "@/public/stacks/nextjs";
import OpenCodeIcon from "@/public/stacks/opencode";
import ReactIcon from "@/public/stacks/react";
import TSIcon from "@/public/stacks/ts";
import type { ComponentType } from "react";
import { FaAws, FaDatabase, FaJava } from "react-icons/fa";
import {
  SiDocker,
  SiDotnet,
  SiGit,
  SiGithubactions,
  SiGo,
  SiGraphql,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiN8N,
  SiNodedotjs,
  SiPostgresql,
  SiProducthunt,
  SiPython,
  SiRust,
  SiSpringboot,
  SiStreamlit,
} from "react-icons/si";

type IconProps = { size: string };

// Brand marks in their own colours, so the chips read like the reference's
// coloured stack icons. Next.js and Rust stay currentColor to work in both themes.
const tinted =
  (Icon: ComponentType<{ size?: string | number; color?: string }>, color?: string) =>
  function TintedIcon({ size }: IconProps) {
    return <Icon size={size} color={color} />;
  };

const skillIconMap: Record<SkillIcon, ComponentType<IconProps>> = {
  java: tinted(FaJava, "#E76F00"),
  typescript: TSIcon,
  python: tinted(SiPython, "#3776AB"),
  go: tinted(SiGo, "#00ADD8"),
  rust: tinted(SiRust),
  sql: tinted(FaDatabase, "#64748b"),
  csharp: tinted(SiDotnet, "#512BD4"),
  "spring-boot": tinted(SiSpringboot, "#6DB33F"),
  react: ReactIcon,
  nextjs: NextjsIcon,
  nodejs: tinted(SiNodedotjs, "#5FA04E"),
  graphql: tinted(SiGraphql, "#E10098"),
  streamlit: tinted(SiStreamlit, "#FF4B4B"),
  postgresql: tinted(SiPostgresql, "#4169E1"),
  mysql: tinted(SiMysql, "#4479A1"),
  mongodb: tinted(SiMongodb, "#47A248"),
  git: tinted(SiGit, "#F05032"),
  docker: tinted(SiDocker, "#2496ED"),
  aws: tinted(FaAws, "#FF9900"),
  linux: tinted(SiLinux),
  n8n: tinted(SiN8N, "#EA4B71"),
  cicd: tinted(SiGithubactions, "#2088FF"),
  "claude-code": ClaudeCodeIcon,
  opencode: OpenCodeIcon,
  grok: GrokIcon,
  producthunt: tinted(SiProducthunt, "#DA552F"),
};

const enabledSkills = skillsConfig
  .filter((skill) => skill.enabled !== false)
  .sort((a, b) => a.order - b.order);

function SkillChip({ skill }: { skill: SkillItem }) {
  const Icon = skillIconMap[skill.icon];

  // Deliberately no hover:/focus-visible: styles here. These chips are labels,
  // not controls: there is nothing to click and nothing to focus (a div with
  // no tabIndex can never receive focus, so a focus ring is unreachable CSS).
  // Styling them like interactive filter chips made users click them, which
  // PostHog then recorded as $dead_click. If these ever become filters or
  // links, restore the affordances along with the handler.
  const chipClasses =
    "no-js-visible inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1 text-sm text-muted-foreground";

  return (
    <div className={chipClasses} aria-label={skill.name}>
      <Icon size="18" />
      <span className="font-medium">{skill.name}</span>
    </div>
  );
}

export function Skills() {
  const skills = enabledSkills;
  // Only groups with at least one skill render, so numbering and the
  // last-row border follow what's actually on screen.
  const categories = skillsSectionConfig.categories.filter((category) =>
    skills.some((skill) => skill.category === category.id),
  );

  return (
    <section className="border-t border-dashed pt-6">
      <h2 className="no-js-visible section-heading">
        {skillsSectionConfig.title}
      </h2>
      {categories.map((category, groupIndex) => {
        const categorySkills = skills.filter(
          (skill) => skill.category === category.id,
        );

        return (
          <div
            key={category.id}
            className={cn(
              "flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-6 px-6 py-3.5 border-b",
              groupIndex === categories.length - 1 ? "border-none" : "",
            )}
          >
            <span className="shrink-0 w-36 font-mono text-xs tracking-wider text-muted-foreground">
              {`0${groupIndex + 1}`.padStart(2, "0") + " " + category.label}
            </span>

            <div className="flex flex-wrap gap-2 flex-1">
              {categorySkills.map((skill) => (
                <SkillChip key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
