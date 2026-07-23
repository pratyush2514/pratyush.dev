import { NextResponse } from "next/server";

// Refresh at most once an hour. Combined with the fetch-level revalidate below,
// this keeps us fast and well under GitHub's rate limits.
export const revalidate = 3600;

const USERNAME = "pratyush2514";

const CONTRIBUTIONS_QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
              weekday
            }
          }
        }
      }
    }
  }
`;

const LEVEL: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

type ApiDay = {
  date: string;
  contributionCount: number;
  contributionLevel: string;
  weekday: number;
};

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN is not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: USERNAME },
      }),
      next: { revalidate },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `GitHub API responded ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    const calendar =
      json?.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      return NextResponse.json(
        { error: "Contribution calendar unavailable" },
        { status: 502 }
      );
    }

    // Full weekly grid (as GitHub renders it), with a normalized 0-4 level.
    const weeks = calendar.weeks.map(
      (w: { contributionDays: ApiDay[] }) => ({
        days: w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          level: LEVEL[d.contributionLevel] ?? 0,
          weekday: d.weekday,
        })),
      })
    );

    // Flat, chronologically sorted list for streak math.
    const days = weeks
      .flatMap((w: { days: { date: string; count: number }[] }) => w.days)
      .sort((a: { date: string }, b: { date: string }) =>
        a.date.localeCompare(b.date)
      );

    let longestStreak = 0;
    let run = 0;
    for (const day of days) {
      if (day.count > 0) {
        run += 1;
        longestStreak = Math.max(longestStreak, run);
      } else {
        run = 0;
      }
    }

    // Today having no commits yet doesn't break the streak (day isn't over).
    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak += 1;
      } else if (i === days.length - 1) {
        continue;
      } else {
        break;
      }
    }

    return NextResponse.json({
      username: USERNAME,
      totalContributions: calendar.totalContributions as number,
      currentStreak,
      longestStreak,
      weeks,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach GitHub" },
      { status: 500 }
    );
  }
}
