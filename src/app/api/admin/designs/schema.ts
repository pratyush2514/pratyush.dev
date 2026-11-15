import { z } from "zod";
import { MEDIA_PATH } from "@/lib/designs/types";

const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => {
    try {
      return ["http:", "https:"].includes(new URL(v).protocol);
    } catch {
      return false;
    }
  }, "Link must start with http:// or https://");

export const metaSchema = z.object({
  title: z.string().trim().min(1, "Give it a title").max(120),
  summary: z.string().trim().max(1000).default(""),
  category: z.string().trim().max(40).default(""),
  tools: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
  year: z.string().trim().max(12).default(""),
  link: z.union([httpUrl, z.literal("")]).optional(),
  featured: z.boolean().default(false),
});

export const createSchema = metaSchema.extend({
  media: z.object({
    path: z.string().regex(MEDIA_PATH),
    kind: z.enum(["image", "gif", "video"]),
    width: z.number().int().positive().max(20000),
    height: z.number().int().positive().max(40000),
    posterPath: z.string().regex(MEDIA_PATH).optional(),
  }),
});

export const patchSchema = metaSchema.partial();

export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  return issue ? `${issue.path.join(".") || "input"}: ${issue.message}` : "Invalid input";
}
