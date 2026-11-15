"use client";

import { motion, useReducedMotion, type ViewportOptions } from "motion/react";
import { useId } from "react";
import { SIGNATURE_PATH, SIGNATURE_VIEWBOX } from "./signature-path";

interface SignatureProps {
  className?: string;
  viewport?: ViewportOptions;
  /** Rendered width in px; height follows the signature's aspect ratio. */
  width?: number;
}

const { width: VW, height: VH } = SIGNATURE_VIEWBOX;
// Width of the soft leading edge of the reveal, in viewBox units.
const FEATHER = 160;

/**
 * Pratyush's signature. Inherits `currentColor`, so it follows the theme, and
 * "writes" itself left to right the first time it scrolls into view.
 */
export function Signature({ className, viewport, width = 150 }: SignatureProps) {
  const reducedMotion = useReducedMotion();
  const id = useId().replace(/:/g, "");
  const maskId = `signature-mask-${id}`;
  const gradientId = `signature-edge-${id}`;

  return (
    <svg
      role="img"
      aria-label="Signature: Pratyush"
      width={width}
      height={Math.round((width * VH) / VW)}
      viewBox={`0 0 ${VW} ${VH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
          <motion.g
            initial={reducedMotion ? false : { x: -(VW + FEATHER) }}
            whileInView={{ x: 0 }}
            viewport={{ once: true, ...viewport }}
            transition={{ duration: 1.6, ease: [0.45, 0, 0.2, 1], delay: 0.15 }}
          >
            <rect x="0" y="0" width={VW} height={VH} fill="#fff" />
            <rect x={VW} y="0" width={FEATHER} height={VH} fill={`url(#${gradientId})`} />
          </motion.g>
        </mask>
      </defs>
      <path
        d={SIGNATURE_PATH}
        fill="currentColor"
        fillRule="evenodd"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
