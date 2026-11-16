import {
  profileBannerConfig,
  profileBannerStickers,
} from "@/config/profile-banner";
import { siteConfig } from "@/config/site";
import type { CSSProperties } from "react";
import { InteractiveSticker } from "./interactive-sticker";
import styles from "./profile-banner.module.css";

/** Each sticker settles in with a small spring-like overshoot. Plain CSS
 *  (`.enter` in globals.css), so the banner shows with the first paint. */
const stickerEntrance = (order: number, tilt: number): CSSProperties =>
  ({
    "--enter-y": "24px",
    "--enter-scale": 0.9,
    "--enter-rotate": `${-tilt}deg`,
    "--enter-duration": "0.6s",
    "--enter-ease": "cubic-bezier(0.34, 1.45, 0.64, 1)",
    "--enter-delay": `${(order - 1) * 0.1}s`,
  }) as CSSProperties;

export function ProfileBanner() {
  return (
    <div className="relative px-6 pt-8 sm:pt-10">
      <div
        className={styles.composition}
        role="group"
        aria-label={profileBannerConfig.label}
      >
        {profileBannerStickers.map((sticker) => (
          <div
            key={sticker.id}
            data-reveal=""
            className={`enter ${styles.sticker} ${styles[sticker.id]}`}
            style={stickerEntrance(sticker.order, sticker.tilt)}
          >
            <InteractiveSticker
              {...sticker}
              sizes={
                sticker.id === "keyboard"
                  ? "(max-width: 640px) 60vw, 400px"
                  : "(max-width: 640px) 36vw, 240px"
              }
              preload={sticker.id === "keyboard"}
            />
          </div>
        ))}
      </div>
      <div className={styles.profile}>
        <InteractiveSticker
          src={siteConfig.personal.avatar.src}
          alt={siteConfig.personal.avatar.alt}
          label={profileBannerConfig.profileLabel}
          tilt={-5}
          sizes="(max-width: 640px) 72px, 128px"
          soundSrc={profileBannerConfig.profileSoundSrc}
        />
      </div>
    </div>
  );
}
