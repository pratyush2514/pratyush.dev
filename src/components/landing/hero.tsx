"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VerseText } from "@/components/verse-text";
import { heroConfig } from "@/config/hero";
import { siteConfig } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { RotatingGlobe } from "./rotating-globe";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useHaptic } from "react-haptic";

// Keep blur on the text itself, so the banner and section shell stay sharp.
// The entrance is CSS (`.enter` in globals.css) so it never waits for hydration.
const enter = (delay = 0): CSSProperties =>
  ({ "--enter-delay": `${delay}s`, "--enter-blur": "3px" }) as CSSProperties;

const locationTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: siteConfig.personal.location.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function Hero() {
  const { vibrate } = useHaptic();
  const vibrateAudio = useRef<HTMLAudioElement>(null);
  const lastWaveTrackRef = useRef<number>(0);
  const [isLocationHovered, setIsLocationHovered] = useState(false);
  const [isLocationTooltipOpen, setIsLocationTooltipOpen] = useState(false);
  const [locationTime, setLocationTime] = useState<string | null>(null);

  const [beforeHighlight, afterHighlight] = heroConfig.description.split(
    heroConfig.descriptionHighlight,
  );
  const headlineAfter = heroConfig.headlineAfter
    ? /^[.,!?;:]/.test(heroConfig.headlineAfter)
      ? heroConfig.headlineAfter
      : ` ${heroConfig.headlineAfter}`
    : "";

  const handleWaveAudio = (play: boolean, interactionType: "hover" | "touch" = "hover") => {
    const audio = vibrateAudio.current;
    if (!audio) {
      return;
    }

    if (play) {
      const now = Date.now();
      if (now - lastWaveTrackRef.current > 5000) {
        trackEvent("hero_wave_hovered", { interaction_type: interactionType });
        lastWaveTrackRef.current = now;
      }
      audio.currentTime = 0;
      audio.playbackRate = 1;
      audio.volume = 0.6;
      audio.play().catch(() => {});
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  };

  useEffect(() => {
    if (!isLocationTooltipOpen) return;

    const updateLocationTime = () => {
      setLocationTime(locationTimeFormatter.format(new Date()));
    };

    updateLocationTime();
    const intervalId = window.setInterval(updateLocationTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [isLocationTooltipOpen]);

  useEffect(() => {
    const vibrate = vibrateAudio.current;

    return () => {
      vibrate?.pause();
    };
  }, []);

  return (
    <section className="relative z-20 space-y-4 px-6 pt-4">
      <div className="flex flex-col items-start gap-2">
        <div className="w-full min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 max-sm:justify-between">
            <div className="flex min-w-0 items-center gap-1 text-xl  font-mono font-semibold tracking-wide sm:text-2xl">
            <VerseText
              text={heroConfig.greeting}
              className="font-serif"
              style={
                {
                  "--vt-ink": "var(--foreground)",
                  "--vt-blend": "var(--verse-text-blend, multiply)",
                  "--vt-leading": "inherit",
                } as CSSProperties
              }
            />
            <span
              data-reveal=""
              style={enter()}
              className="enter flex items-center"
            >
              <span
                className="inline-block text-xl leading-none"
                onMouseEnter={() => {
                  vibrate();
                  handleWaveAudio(true, "hover");
                }}
                onMouseLeave={() => handleWaveAudio(false)}
                onFocus={() => handleWaveAudio(true, "hover")}
                onBlur={() => handleWaveAudio(false)}
                onTouchStart={() => handleWaveAudio(true, "touch")}
                onTouchEnd={() => handleWaveAudio(false)}
              >
                {typeof heroConfig.waveEmoji === "string" ? (
                  <span
                    className="inline-block hover:animate-wave"
                    style={{ transformOrigin: "70% 70%" }}
                  >
                    {heroConfig.waveEmoji}
                  </span>
                ) : (
                  <heroConfig.waveEmoji
                    size="1em"
                    style={{ display: "block" }}
                    className="transition-transform duration-200 ease-out motion-safe:hover:scale-110 motion-reduce:transition-none"
                    aria-hidden="true"
                    focusable="false"
                  />
                )}
              </span>
            </span>
            </div>
            <span className="size-2 rounded-full bg-muted ring-1 ring-inset ring-muted max-sm:hidden">

            </span>
            <Tooltip onOpenChange={setIsLocationTooltipOpen}>
              <TooltipTrigger
                className="micro-transition relative flex min-h-4 shrink-0 items-center after:absolute after:-inset-x-2 after:-inset-y-3.5 after:content-[''] gap-1.5 whitespace-nowrap rounded-sm text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 hover:text-foreground sm:text-sm"
                onMouseEnter={() => setIsLocationHovered(true)}
                onMouseLeave={() => setIsLocationHovered(false)}
                onFocus={() => setIsLocationHovered(true)}
                onBlur={() => setIsLocationHovered(false)}
              >

                <RotatingGlobe isHovered={isLocationHovered} />
                <span
                  data-reveal=""
                  className="enter inline-block font-sans"
                  style={enter(0.26)}
                >
                  {siteConfig.personal.location.label}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="font-sans text-xs tracking-wider">
                  {locationTime ?? "--:--:--"}
                </span>
              </TooltipContent>
            </Tooltip>
          </div>

          <h1
            data-reveal=""
            className="enter text-lg sm:text-sm md:text-lg font-semibold leading-[1.05] tracking-tight text-balance"
            style={enter(0.1)}
          >
            <span className="whitespace-nowrap">
              {heroConfig.headlineBefore} {heroConfig.highlightedPhrases[0]}
            </span>{" "}
            <span>
              {heroConfig.headlineConnector ?? "in"} {heroConfig.highlightedPhrases[1]}
            </span>
            {headlineAfter}
          </h1>

          <p
            data-reveal=""
            className="enter mt-2 text-sm leading-relaxed text-muted-foreground text-pretty sm:leading-normal"
            style={enter(0.18)}
          >
            {afterHighlight === undefined ? (
              heroConfig.description
            ) : (
              <>
                {beforeHighlight}
                <span className="underline decoration-border/50 underline-offset-4">
                  {heroConfig.descriptionHighlight}
                </span>
                {afterHighlight}
              </>
            )}
          </p>

        </div>
      </div>

      <audio src="/vibration.mp3" ref={vibrateAudio} loop preload="none" />
    </section>
  );
}
