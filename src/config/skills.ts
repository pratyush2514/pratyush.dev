import type { SkillCategoryConfig, SkillItem } from "@/config/types";

export const skillsSectionConfig = {
  title: "Stack",
  categories: [
    { id: "language", label: "Languages" },
    { id: "frameworks", label: "Frameworks" },
    { id: "data", label: "Data" },
    { id: "tools", label: "Tools" },
  ] as SkillCategoryConfig[],
};

const groups: Record<SkillItem["category"], Array<[id: string, name: string]>> = {
  language: [
    ["java", "Java"],
    ["typescript", "TypeScript"],
    ["python", "Python"],
    ["go", "Go"],
    ["rust", "Rust"],
    ["sql", "SQL"],
    ["csharp", "C#"],
  ],
  frameworks: [
    ["spring-boot", "Spring Boot"],
    ["react", "React"],
    ["nextjs", "Next.js"],
    ["nodejs", "Node.js"],
    ["graphql", "GraphQL"],
    ["streamlit", "Streamlit"],
  ],
  data: [
    ["postgresql", "PostgreSQL"],
    ["mysql", "MySQL"],
    ["mongodb", "MongoDB"],
  ],
  tools: [
    ["git", "Git"],
    ["docker", "Docker"],
    ["aws", "AWS"],
    ["linux", "Linux"],
    ["n8n", "n8n"],
    ["cicd", "CI/CD"],
  ],
};

export const skillsConfig: SkillItem[] = Object.entries(groups).flatMap(
  ([category, items]) =>
    items.map(([id, name], index) => ({
      id,
      name,
      icon: id,
      category: category as SkillItem["category"],
      order: index + 1,
      enabled: true,
    })),
);
