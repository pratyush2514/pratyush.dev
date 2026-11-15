import "server-only";
import { insightsConfig } from "@/config/insights";
import type { InsightPoint, InsightReport, InsightSummary } from "@/config/types";

/*
 * Visitor insights from PostHog's query API (HogQL). Needs a personal API key
 * with the "query:read" scope and the numeric project id; without them the
 * section shows its "unavailable" state instead of failing the page.
 */

const DAY_MS = 86_400_000;

type Row = unknown[];

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

async function hogql(query: string): Promise<Row[] | null> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const project = process.env.POSTHOG_PROJECT_ID;
  if (!key || !project || !/^\d+$/.test(project)) return null;

  const host = (process.env.POSTHOG_API_HOST ?? "https://us.posthog.com").replace(/\/$/, "");
  const response = await fetch(`${host}/api/projects/${project}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    next: { revalidate: 900 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    console.error("Insights request failed:", response.status);
    return null;
  }
  const payload: unknown = await response.json();
  const results = (payload as { results?: unknown })?.results;
  return Array.isArray(results) ? (results as Row[]) : null;
}

const utcDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// Dates below are generated server-side from the clock, never from input, so
// interpolating them into the query is safe.
function summaryQuery(from: string, to: string) {
  return `
    SELECT
      count(DISTINCT distinct_id),
      count(DISTINCT properties.$session_id),
      countIf(event = '$pageview'),
      (
        SELECT round(avg(duration))
        FROM (
          SELECT dateDiff('second', min(timestamp), max(timestamp)) AS duration
          FROM events
          WHERE timestamp >= toDateTime('${from} 00:00:00')
            AND timestamp < toDateTime('${to} 00:00:00') + INTERVAL 1 DAY
            AND properties.$session_id IS NOT NULL
          GROUP BY properties.$session_id
        )
      )
    FROM events
    WHERE timestamp >= toDateTime('${from} 00:00:00')
      AND timestamp < toDateTime('${to} 00:00:00') + INTERVAL 1 DAY
      AND event IN ('$pageview', '$pageleave')
  `;
}

function readSummary(row: Row | undefined): InsightSummary | null {
  if (!row) return null;
  const [visitors, sessions, pageviews, avg] = row;
  if (!isCount(visitors) || !isCount(sessions) || !isCount(pageviews)) return null;
  return {
    visitors,
    sessions,
    pageviews,
    averageEngagedSeconds: isCount(avg) && sessions > 0 ? Math.round(avg) : null,
  };
}

export async function getInsights(): Promise<InsightReport | null> {
  const days = insightsConfig.days;
  const today = Date.parse(`${utcDay(Date.now())}T00:00:00Z`);
  const dates = Array.from({ length: days }, (_, i) => utcDay(today - (days - 1 - i) * DAY_MS));
  const start = dates[0];
  const end = dates[dates.length - 1];
  const prevStart = utcDay(today - (2 * days - 1) * DAY_MS);
  const prevEnd = utcDay(today - days * DAY_MS);

  try {
    const [daily, current, previous] = await Promise.all([
      hogql(`
        SELECT toString(toDate(timestamp)) AS day,
               count(DISTINCT distinct_id),
               count()
        FROM events
        WHERE event = '$pageview'
          AND timestamp >= toDateTime('${start} 00:00:00')
          AND timestamp < toDateTime('${end} 00:00:00') + INTERVAL 1 DAY
        GROUP BY day
        ORDER BY day
      `),
      hogql(summaryQuery(start, end)),
      hogql(summaryQuery(prevStart, prevEnd)),
    ]);
    if (!daily || !current || !previous) return null;

    const byDay = new Map<string, InsightPoint>();
    for (const [day, visitors, pageviews] of daily) {
      if (typeof day === "string" && isCount(visitors) && isCount(pageviews)) {
        byDay.set(day, { date: day, visitors, pageviews });
      }
    }
    const points = dates.map(
      (date) => byDay.get(date) ?? { date, visitors: 0, pageviews: 0 },
    );

    const summary = readSummary(current[0]);
    const prior = readSummary(previous[0]);
    if (!summary || !prior) return null;

    return { points, summary, previous: prior };
  } catch (error) {
    console.error("Insights request failed:", error instanceof Error ? error.name : error);
    return null;
  }
}
