import { JsonLd } from "@/components/shared/json-ld";
import { projectsConfig, projectsSectionConfig } from "@/config/projects";
import { markdownComponents } from "@/lib/markdown/markdown-components";
import { breadcrumbSchema, pageMetadata, projectSchema } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProjectContent } from "./project-content";

const enabledProjects = () =>
  projectsConfig
    .filter((p) => p.enabled !== false)
    .sort((a, b) => a.order - b.order);

export async function generateStaticParams() {
  return enabledProjects().map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = enabledProjects().find((p) => p.id === id);

  if (!project) {
    return {
      title: "Project not found",
      robots: { index: false, follow: false },
    };
  }

  return pageMetadata({
    title: project.title,
    description: project.description,
    path: `/project/${project.id}`,
    type: "article",
    keywords: [...project.tags, project.category, "case study", "Pratyush Rastogi"],
    publishedTime: `${project.year}-01-01T00:00:00Z`,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enabled = enabledProjects();
  const index = enabled.findIndex((p) => p.id === id);
  const project = enabled[index];

  if (!project) {
    notFound();
  }

  const prev = index > 0 ? enabled[index - 1] : undefined;
  const next = index < enabled.length - 1 ? enabled[index + 1] : undefined;

  // Rendered here, on the server, so react-markdown never reaches the browser.
  const caseStudy = project.content ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {project.content}
    </ReactMarkdown>
  ) : undefined;

  return (
    <>
      <JsonLd
        data={[
          projectSchema(project),
          breadcrumbSchema([
            // Search engines drop URL fragments, so "/#projects" would just
            // repeat the home page; the trail goes straight to the project.
            { name: projectsSectionConfig.title, path: "/" },
            { name: project.title, path: `/project/${project.id}` },
          ]),
        ]}
      />
      <ProjectContent project={project} caseStudy={caseStudy} prev={prev} next={next} />
    </>
  );
}
