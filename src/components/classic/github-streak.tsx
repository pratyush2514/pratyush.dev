"use client";

import { useEffect, useRef, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Github, Flame, X } from "lucide-react";
import NumberFlow from "@number-flow/react";

type Day = { date: string; count: number; level: number; weekday: number };
type Week = { days: Day[] };

type Stats = {
  username: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  weeks: Week[];
  updatedAt: string;
};

const PROFILE_URL = "https://github.com/pratyush2514";

// Emerald ramp (ties to the live pulse dot). Empty cells use neutral text color
// at low opacity, so the graph adapts to both light and dark themes.
const LEVEL_ALPHA = [0, 0.3, 0.5, 0.75, 1];

const cellStyle = (level: number) =>
  level <= 0
    ? { backgroundColor: "var(--color-text)", opacity: 0.08 }
    : { backgroundColor: `rgba(16, 185, 129, ${LEVEL_ALPHA[level] ?? 1})` };

const StatBlock = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col gap-1">
    <span className="font-serif text-3xl leading-none text-text tabular-nums">
      <NumberFlow value={value} />
    </span>
    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
      {label}
    </span>
  </div>
);

const ContributionGraph = ({ weeks }: { weeks: Week[] }) => (
  <div className="flex w-full gap-[2px]">
    {weeks.map((week, wi) => (
      <div key={wi} className="flex flex-1 flex-col gap-[2px]">
        {/* Pad the first column so the first day sits on its correct weekday row */}
        {wi === 0 &&
          Array.from({ length: week.days[0]?.weekday ?? 0 }).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
        {week.days.map((day) => (
          <div
            key={day.date}
            title={`${day.count} contribution${
              day.count === 1 ? "" : "s"
            } on ${day.date}`}
            className="aspect-square rounded-[1px]"
            style={cellStyle(day.level)}
          />
        ))}
      </div>
    ))}
  </div>
);

export const GitHubStreak = () => {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const started = useRef(false);

  // Lazy fetch: only hit the API the first time the panel is opened.
  // A ref guard (not state) prevents effect re-runs from cancelling the request.
  useEffect(() => {
    if (!open || started.current) return;
    started.current = true;
    fetch("/api/github-stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((data: Stats) => setStats(data))
      .catch(() => setError(true));
  }, [open]);

  // Close on Escape while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* Click-catcher to dismiss (no dark overlay — keeps it subtle) */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Right-edge trigger tab */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle GitHub activity"
        aria-expanded={open}
        className="group fixed right-0 top-1/2 z-50 hidden -translate-y-1/2 md:flex flex-col items-center gap-2 rounded-l-xl border border-r-0 border-border bg-bg/80 py-4 pl-3 pr-2.5 backdrop-blur-sm transition-colors duration-300 hover:bg-bg-secondary"
      >
        <Github
          size={16}
          className="text-text-tertiary transition-colors group-hover:text-text"
        />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary [writing-mode:vertical-rl] transition-colors group-hover:text-text">
          GitHub
        </span>
      </button>

      {/* Slide-out panel */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-14 top-1/2 z-50 w-[min(34rem,calc(100vw-4.5rem))] -translate-y-1/2 rounded-2xl border border-border bg-bg p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github size={16} className="text-text" />
                <span className="text-sm font-medium tracking-tight text-text">
                  @{stats?.username ?? "pratyush2514"}
                </span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-text-tertiary transition-colors hover:text-text"
              >
                <X size={16} />
              </button>
            </div>

            {error ? (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Couldn&apos;t load live stats right now.
                </p>
                <a
                  href={PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold uppercase tracking-widest text-text link-hover"
                >
                  View profile ↗
                </a>
              </div>
            ) : !stats ? (
              <div className="animate-pulse space-y-6">
                <div className="flex gap-8">
                  <div className="h-11 w-24 rounded bg-border" />
                  <div className="h-11 w-16 rounded bg-border" />
                  <div className="h-11 w-16 rounded bg-border" />
                </div>
                <div className="h-16 w-full rounded bg-border" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border">
                      <Flame size={18} className="text-text" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-4xl leading-none text-text tabular-nums">
                        <NumberFlow value={stats.currentStreak} />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                        Day streak
                      </span>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-8">
                    <StatBlock label="Longest" value={stats.longestStreak} />
                    <StatBlock
                      label="Past year"
                      value={stats.totalContributions}
                    />
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-6">
                  <ContributionGraph weeks={stats.weeks} />
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <span className="text-[10px] uppercase tracking-widest text-text-tertiary">
                      Less
                    </span>
                    {[0, 1, 2, 3, 4].map((l) => (
                      <div
                        key={l}
                        className="h-2.5 w-2.5 rounded-[1px]"
                        style={cellStyle(l)}
                      />
                    ))}
                    <span className="text-[10px] uppercase tracking-widest text-text-tertiary">
                      More
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-text-tertiary opacity-60">
                    Updated hourly
                  </span>
                  <a
                    href={PROFILE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold uppercase tracking-widest text-text link-hover"
                  >
                    Profile ↗
                  </a>
                </div>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};
