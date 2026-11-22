import { About } from "@/components/landing/about";
import { CTA } from "@/components/landing/cta";
import { DesignSection } from "@/components/landing/design-section";
import { Education } from "@/components/landing/education";
import { Experience } from "@/components/landing/experience";
import { Footer } from "@/components/landing/footer";
import { GitHubSection } from "@/components/landing/github-section";
import { Hero } from "@/components/landing/hero";
import { Insights } from "@/components/landing/insights";
import { ProfileBanner } from "@/components/landing/profile-banner";
import { HowIWork } from "@/components/landing/how-i-work";
import { HomeProjectExplorer } from "@/components/landing/home-project-explorer";
import { HomeSectionRail } from "@/components/landing/home-section-rail";
import { Services } from "@/components/landing/services";
import { GitSkeleton } from "@/components/skeletons/github-skeleton";
import { Skills } from "@/components/landing/skills";
import Social from "@/components/landing/social";
import { PixelDissolve } from "@/components/ui/pixel-dissolve";
import { SideNote } from "@/components/shared/side-note";
import { projectsConfig, projectsSectionConfig } from "@/config/projects";
import { sectionNotes } from "@/config/section-notes";
import { siteConfig } from "@/config/site";
import type { SectionId } from "@/config/types";
import { getDesigns } from "@/lib/designs/storage";
import { orderForShowcase } from "@/lib/designs/types";
import { JsonLd } from "@/components/shared/json-ld";
import { pageMetadata, profilePageSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { Suspense } from "react";
import type { ProjectExplorerItem } from "@/components/project-explorer";

// Static, rebuilt in the background at most hourly, and immediately after a
// change in the admin panel.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  absoluteTitle: SITE.title,
  description: SITE.description,
  path: "/",
  type: "profile",
});

/* The explorer never reads case-study content, tags, or metrics, so those
   fields stay on the server instead of crossing the client boundary. */
const explorerProjects: ProjectExplorerItem[] = projectsConfig.map(
  (project) => ({
    id: project.id,
    title: project.title,
    year: project.year,
    description: project.description,
    category: project.category,
    status: project.status,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    image: project.image,
    imageAlt: project.imageAlt,
    enabled: project.enabled,
    order: project.order,
  }),
);

type HomeSection = Exclude<SectionId, "github" | "design">;

const staticSections: Partial<Record<HomeSection, ReactElement>> = {
  socials: <Social />,
  skills: <Skills />,
  about: <About />,
  projects: (
    <HomeProjectExplorer
      projects={explorerProjects}
      title={projectsSectionConfig.title}
    />
  ),
  experience: <Experience />,
  education: <Education />,
  insights: <Insights />,
  services: <Services />,
  workflow: <HowIWork />,
  contact: <CTA />,
};

const sectionLabels: Partial<Record<SectionId, string>> = {
  github: "GitHub",
  workflow: "How I work",
};

export default async function Home() {
  const designs = siteConfig.sectionFlags.design
    ? orderForShowcase(await getDesigns())
    : [];

  const isVisible = (id: SectionId) =>
    siteConfig.sectionFlags[id] &&
    (id !== "design" || designs.length > 0) &&
    (id === "github" || id === "design" || Boolean(staticSections[id as HomeSection]));

  const visibleSections = siteConfig.sectionOrder.filter(isVisible);

  return (
    <>
      <JsonLd data={profilePageSchema()} />
      <main
        id="main-content"
        className="relative flex min-h-dvh flex-col gap-y-4 overflow-x-clip border-x bg-background pt-8 xl:overflow-x-visible"
      >
        <div id="hero" className="bg-background scroll-mt-20">
          <ProfileBanner />
          <Hero />
        </div>

        {visibleSections.map((sectionId) => {
          let content: ReactElement | undefined;
          if (sectionId === "github") {
            content = (
              <Suspense fallback={<GitSkeleton />}>
                <GitHubSection />
              </Suspense>
            );
          } else if (sectionId === "design") {
            content = <DesignSection designs={designs.slice(0, 10)} total={designs.length} />;
          } else {
            content = staticSections[sectionId];
          }
          const note = sectionNotes[sectionId];

          return (
            <div
              key={sectionId}
              id={sectionId}
              className="relative bg-background scroll-mt-20"
            >
              {note && <SideNote side={note.side}>{note.text}</SideNote>}
              {content}
            </div>
          );
        })}
      </main>
      <Footer />
      <HomeSectionRail
        items={[
          { id: "hero", label: "Top" },
          ...visibleSections.map((id) => ({
            id,
            label: sectionLabels[id] ?? `${id.charAt(0).toUpperCase()}${id.slice(1)}`,
          })),
        ]}
      />
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[var(--frame-max-w)]">
        <div aria-hidden="true" className="bottom-blur" />
        <PixelDissolve />
      </div>
    </>
  );
}
