/**
 * Resolves the string icon identifiers stored in {@link FEATURE_CARDS}
 * (e.g. "roadmap", "calculator") into renderable React nodes.
 *
 * Icons are inline SVGs (no external icon dependency) styled via
 * `currentColor` so they inherit the surrounding text color and an
 * explicit size class can be applied by the caller.
 *
 * @see design.md — "FeatureCardData.icon: React.ReactNode"
 */

import type { ReactNode } from "react";

/** Common props applied to every inline icon SVG. */
const svgProps = {
  className: "h-8 w-8",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

/** Map of icon identifier → inline SVG node. */
const ICONS: Record<string, ReactNode> = {
  // Roadmap / transition path.
  roadmap: (
    <svg {...svgProps}>
      <path d="M9 6 4 4v14l5 2 6-2 5 2V6l-5-2-6 2Z" />
      <path d="M9 6v14M15 4v14" />
    </svg>
  ),
  // Calculator.
  calculator: (
    <svg {...svgProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v2M8 19h4" />
    </svg>
  ),
  // Warning / IRS red flag.
  warning: (
    <svg {...svgProps}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  // Classification / compare (W-2 vs 1099).
  classification: (
    <svg {...svgProps}>
      <path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4" />
      <path d="M12 3v18" />
    </svg>
  ),
};

/** Fallback icon used when an identifier is not recognized. */
const FALLBACK_ICON: ReactNode = (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

/**
 * Resolve a string icon identifier into a renderable React node.
 *
 * @param icon - Icon identifier (e.g. "roadmap"). Unknown identifiers
 *   resolve to a neutral fallback icon.
 */
export function resolveIcon(icon: string): ReactNode {
  return ICONS[icon] ?? FALLBACK_ICON;
}
