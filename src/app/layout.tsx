import { PostHogProvider } from "@/components/shared/posthog-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JsonLd } from "@/components/shared/json-ld";
import { siteConfig } from "@/config/site";
import { LLMS_ALTERNATE, personSchema, websiteSchema } from "@/lib/seo";
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
  // No canonical or og:url here: they would be inherited by every route that
  // forgets to set its own (404s included). Pages set them via pageMetadata.
  openGraph: {
    type: "website",
    locale: siteConfig.meta.locale,
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    siteName: siteConfig.meta.shortTitle,
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
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  // iOS Safari otherwise turns digit runs (years, stats) into phone links.
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  appleWebApp: {
    capable: true,
    title: "Pratyush",
    statusBarStyle: "default",
  },
  alternates: { types: LLMS_ALTERNATE },
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
        <JsonLd data={[websiteSchema(), personSchema()]} />
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
