// Page metadata and structured data shared by every public route.
//
// Next.js replaces nested metadata objects (openGraph, twitter) wholesale
// rather than merging them, so a page that sets only `openGraph.title` would
// drop the site name, locale and type. `pageMetadata` fills those in once.

import type { Metadata } from "next";
import { educationConfig } from "@/config/education";
import { projectsConfig } from "@/config/projects";
import { skillsConfig } from "@/config/skills";
import type { Project } from "@/config/types";
import { SITE } from "@/lib/site";

export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** `<link rel="alternate" type="text/plain">` pointing AI tools at llms.txt. */
export const LLMS_ALTERNATE = {
  "text/plain": [{ url: "/llms.txt", title: "LLM-readable summary" }],
};

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`.replace(/\/$/, "") || SITE.url;
}

type PageMetadataInput = {
  /** Shown through the root title template, e.g. "Design | Pratyush Rastogi". */
  title?: string;
  /** Used as-is, bypassing the template (the home page). */
  absoluteTitle?: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  publishedTime?: string;
};

export function pageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  type = "website",
  keywords,
  publishedTime,
}: PageMetadataInput): Metadata {
  const socialTitle = absoluteTitle ?? (title ? `${title} — ${SITE.name}` : SITE.title);

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    keywords,
    alternates: { canonical: path, types: LLMS_ALTERNATE },
    openGraph: {
      type,
      url: path,
      title: socialTitle,
      description,
      siteName: SITE.name,
      locale: "en_US",
      ...(type === "profile" && {
        firstName: "Pratyush",
        lastName: "Rastogi",
        username: SITE.xHandle.replace(/^@/, ""),
      }),
      ...(type === "article" && {
        authors: [SITE.url],
        publishedTime,
      }),
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.xHandle,
      creator: SITE.xHandle,
      title: socialTitle,
      description,
    },
  };
}

// --- JSON-LD ---------------------------------------------------------------

type JsonLdNode = Record<string, unknown>;

/** Serialises JSON-LD for a <script> tag. Escapes `<` so a value can never
 *  close the script element early. */
export function serializeJsonLd(data: JsonLdNode | JsonLdNode[]): string {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export function personSchema(): JsonLdNode {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    givenName: "Pratyush",
    familyName: "Rastogi",
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    image: absoluteUrl("/images/profile.png"),
    jobTitle: SITE.jobTitle,
    description: SITE.description,
    address: { "@type": "PostalAddress", addressCountry: "IN" },
    alumniOf: educationConfig.map((item) => ({
      "@type": "CollegeOrUniversity",
      name: item.school,
    })),
    knowsAbout: [
      "Full-stack development",
      "AI agent safety",
      ...skillsConfig.filter((s) => s.enabled).map((s) => s.name),
    ],
    sameAs: [SITE.github, SITE.linkedin, SITE.x],
  };
}

export function websiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    alternateName: SITE.title,
    description: SITE.description,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
  };
}

export function profilePageSchema(): JsonLdNode {
  const projects = projectsConfig
    .filter((p) => p.enabled !== false)
    .sort((a, b) => a.order - b.order);

  return {
    "@type": "ProfilePage",
    "@id": `${SITE.url}/#profilepage`,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
    hasPart: {
      "@type": "ItemList",
      name: "Projects",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/project/${project.id}`),
        name: project.title,
      })),
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function projectSchema(project: Project): JsonLdNode {
  const url = absoluteUrl(`/project/${project.id}`);
  return {
    "@type": project.githubUrl ? "SoftwareSourceCode" : "CreativeWork",
    "@id": `${url}#project`,
    url,
    name: project.title,
    headline: project.title,
    description: project.description,
    ...(project.image && { image: absoluteUrl(project.image) }),
    dateCreated: String(project.year),
    keywords: project.tags.join(", "),
    genre: project.category,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    creator: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    ...(project.githubUrl && { codeRepository: project.githubUrl }),
    ...((project.liveUrl || project.githubUrl) && {
      sameAs: [project.liveUrl, project.githubUrl].filter(Boolean),
    }),
  };
}
