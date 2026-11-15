import { PostHogProvider } from "@/components/shared/posthog-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.meta.url),
  title: {
    default: siteConfig.meta.title,
    template: siteConfig.meta.titleTemplate,
  },
  description: siteConfig.meta.description,
  applicationName: SITE.name,
  keywords: siteConfig.meta.keywords,
  authors: siteConfig.meta.authors,
  creator: siteConfig.meta.creator,
  publisher: siteConfig.meta.publisher,
  classification: siteConfig.meta.classification,
  category: siteConfig.meta.category,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    locale: siteConfig.meta.locale,
    url: "/",
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    siteName: siteConfig.meta.shortTitle,
    firstName: "Pratyush",
    lastName: "Rastogi",
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.xHandle,
    creator: siteConfig.meta.twitterCreator,
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
  },
  icons: {
    icon: siteConfig.meta.icon,
    shortcut: siteConfig.meta.icon,
    apple: siteConfig.meta.appleIcon,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: siteConfig.meta.googleVerification || undefined,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
      publisher: { "@id": `${SITE.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.name,
      url: SITE.url,
      email: `mailto:${SITE.email}`,
      jobTitle: "Software Engineer",
      description: SITE.description,
      alumniOf: { "@type": "CollegeOrUniversity", name: "Graphic Era University" },
      knowsAbout: [
        "Full-stack development",
        "Java",
        "Spring Boot",
        "TypeScript",
        "Next.js",
        "Go",
        "Rust",
        "PostgreSQL",
        "AI tooling",
      ],
      sameAs: [SITE.github, SITE.linkedin, SITE.x],
      image: `${SITE.url}${siteConfig.personal.avatar.src}`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-background font-sans",
        dmSans.variable,
        instrumentSerif.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <noscript>
          <style>{`.no-js-visible { opacity: 1 !important; transform: none !important; filter: none !important; stroke-dashoffset: 0 !important; stroke-dasharray: none !important; }`}</style>
        </noscript>
        <ThemeProvider>
          <TooltipProvider>
            <PostHogProvider>{children}</PostHogProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
