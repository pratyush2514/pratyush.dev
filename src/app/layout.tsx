import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "@/visual-edits/VisualEditsMessenger";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";

// Self-hosted, preloaded fonts (no render-blocking @import, no layout shift).
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pratyush Rastogi | Full-Stack Developer & Software Engineer",
  description: "Portfolio of Pratyush Rastogi - Full-Stack Developer, Software Engineer, and Frontend Engineer specializing in AI Integration and Prompt Engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={`${instrumentSerif.variable} ${plusJakartaSans.variable}`}
        suppressHydrationWarning
      >
        <body className="antialiased" suppressHydrationWarning>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="833cc088-1862-449c-b812-21314f3343b3"
        />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="grain" />
          {children}
          <VisualEditsMessenger />
        </ThemeProvider>
      </body>
    </html>
  );
}
