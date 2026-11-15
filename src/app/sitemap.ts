import { projectsConfig } from "@/config/projects";
import { siteConfig } from "@/config/site";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseEntries = siteConfig.meta.sitemap.map((item) => ({
    ...item,
  }));

  const projectEntries: MetadataRoute.Sitemap = projectsConfig
    .filter((p) => p.enabled !== false)
    .map((p) => ({
      url: `${siteConfig.meta.url}/project/${p.id}`,
      lastModified: new Date(`${p.year}-01-01T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...baseEntries, ...projectEntries];
}
