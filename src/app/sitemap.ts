import { projectsConfig } from "@/config/projects";
import { getDesigns } from "@/lib/designs/storage";
import { absoluteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";

// Rebuilt with the design gallery, so new pieces show up in lastModified.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const designs = await getDesigns();
  const latestDesign = designs
    .map((d) => Date.parse(d.createdAt))
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];

  const projects = projectsConfig
    .filter((p) => p.enabled !== false)
    .sort((a, b) => a.order - b.order);

  const latestProjectYear = Math.max(...projects.map((p) => p.year));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      // Generated OG images get hashed paths, so only real files are listed.
      images: [absoluteUrl("/images/profile.png")],
    },
    {
      url: absoluteUrl("/design"),
      lastModified: latestDesign ? new Date(latestDesign) : new Date(`${latestProjectYear}-01-01T00:00:00Z`),
      changeFrequency: "weekly",
      priority: 0.8,
      images: designs
        .map((d) => (d.media.kind === "video" ? d.poster : d.src))
        .filter((src): src is string => Boolean(src))
        .slice(0, 50),
    },
    ...projects.map((p) => ({
      url: absoluteUrl(`/project/${p.id}`),
      lastModified: new Date(`${p.year}-01-01T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(p.image && { images: [absoluteUrl(p.image)] }),
    })),
  ];
}
