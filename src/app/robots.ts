import { siteConfig } from "@/config/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    ...siteConfig.meta.robots,
    host: siteConfig.meta.url,
  };
}
