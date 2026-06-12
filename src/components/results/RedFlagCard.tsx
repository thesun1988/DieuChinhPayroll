/**
 * RedFlagCard — a single IRS red flag warning card.
 *
 * Renders the red flag's title, a severity indicator badge, the description of
 * why the behavior attracts IRS attention, and concrete prevention guidance.
 * All visible text comes from the {@link RedFlag} data (Vietnamese).
 *
 * @see design.md — "RedFlagCard"
 * @see requirements.md — Requirement 3.1, 3.2 (red flags + prevention guidance)
 */

import type { RedFlag, RedFlagSeverity } from "../../data/redFlags";

/** Props for {@link RedFlagCard}. */
export interface RedFlagCardProps {
  /** The red flag to display. */
  redFlag: RedFlag;
}

/** Vietnamese label for each severity level. */
const SEVERITY_LABEL: Record<RedFlagSeverity, string> = {
  high: "Rủi ro cao",
  medium: "Rủi ro trung bình",
  low: "Rủi ro thấp",
};

/** Tailwind classes for the severity badge and card accent per level. */
const SEVERITY_STYLES: Record<
  RedFlagSeverity,
  { badge: string; border: string; dot: string }
> = {
  high: {
    badge: "bg-red-100 text-red-700",
    border: "border-l-4 border-red-500",
    dot: "bg-red-500",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700",
    border: "border-l-4 border-amber-500",
    dot: "bg-amber-500",
  },
  low: {
    badge: "bg-yellow-100 text-yellow-700",
    border: "border-l-4 border-yellow-400",
    dot: "bg-yellow-400",
  },
};

export function RedFlagCard({ redFlag }: RedFlagCardProps) {
  const styles = SEVERITY_STYLES[redFlag.severity];

  return (
    <div
      className={`rounded-lg bg-white p-4 shadow-sm ${styles.border}`}
      data-severity={redFlag.severity}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-semibold text-gray-900">
          {redFlag.title}
        </h4>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
          />
          {SEVERITY_LABEL[redFlag.severity]}
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-600">{redFlag.description}</p>

      <div className="mt-3 rounded-md bg-green-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
          Cách phòng tránh
        </p>
        <p className="mt-1 text-sm text-green-800">{redFlag.prevention}</p>
      </div>
    </div>
  );
}

export default RedFlagCard;
