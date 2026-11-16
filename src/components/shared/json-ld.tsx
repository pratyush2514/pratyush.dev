import { serializeJsonLd } from "@/lib/seo";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Structured data for search engines. Server component: renders inline. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
