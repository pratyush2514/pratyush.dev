import { siteConfig } from "@/config/site";
import { getOgFonts, OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/lib/og/card";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = `UI / UX design work by ${siteConfig.personal.fullName}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="UI / UX design"
      title="Interface craft"
      description="Product screens, flows, and the small interactions that make them feel right."
      footer={`${new URL(siteConfig.meta.url).host}/design`}
    />,
    { ...OG_SIZE, fonts: getOgFonts() },
  );
}
