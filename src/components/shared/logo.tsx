import type { SVGProps } from "react";
import { LOGO_PATHS, LOGO_SHADES } from "@/lib/logo-pixels";
import { cn } from "@/lib/utils";
import styles from "./logo.module.css";

export interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Logo({ size = 20, className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", styles.logo, className)}
      {...props}
    >
      {LOGO_SHADES.map((shade, index) => (
        <path key={shade} d={LOGO_PATHS[index]} fill={`rgb(var(--footer-earth-${shade}))`} />
      ))}
    </svg>
  );
}

export default Logo;
