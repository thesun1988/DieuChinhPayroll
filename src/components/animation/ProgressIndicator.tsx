/**
 * ProgressIndicator — step-by-step progress display for the analysis animation.
 *
 * Shows the three analysis steps in Vietnamese and highlights which step is
 * currently active / completed based on the animation progress (0 → 1):
 *
 *   1. "Đang tính toán thuế..."   (calculating taxes)
 *   2. "Đang tạo lộ trình..."     (building the roadmap)
 *   3. "Đang phân tích rủi ro..." (analyzing risk)
 *
 * Pure presentational component driven entirely by the `progress` prop so the
 * timing logic stays in {@link useAnalysisAnimation}.
 *
 * @see design.md — "AnalysisAnimation"
 * @see requirements.md — Requirement 2.9
 */

import { motion } from "framer-motion";

/** Ordered analysis step labels (Vietnamese). */
export const ANALYSIS_STEPS = [
  "Đang tính toán thuế...",
  "Đang tạo lộ trình...",
  "Đang phân tích rủi ro...",
] as const;

/** Props for {@link ProgressIndicator}. */
export interface ProgressIndicatorProps {
  /** Animation progress in the range [0, 1]. */
  progress: number;
}

/**
 * Map a [0, 1] progress value to the index of the currently active step.
 *
 * Steps are split into equal segments; e.g. with 3 steps, progress < 1/3 is
 * step 0, < 2/3 is step 1, otherwise step 2. The result is clamped to the last
 * valid index.
 */
export function activeStepIndex(progress: number, stepCount: number): number {
  if (stepCount <= 0) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  return Math.min(stepCount - 1, Math.floor(clamped * stepCount));
}

/** Step-by-step progress display for the analysis animation. */
export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const active = activeStepIndex(progress, ANALYSIS_STEPS.length);

  return (
    <ol className="space-y-3" aria-label="Tiến trình phân tích">
      {ANALYSIS_STEPS.map((label, index) => {
        const isComplete = index < active || progress >= 1;
        const isActive = index === active && progress < 1;
        const state = isComplete ? "complete" : isActive ? "active" : "pending";

        return (
          <li
            key={label}
            data-state={state}
            aria-current={isActive ? "step" : undefined}
            className="flex items-center gap-3"
          >
            <span
              className={
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold " +
                (isComplete
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : isActive
                    ? "border-indigo-500 text-indigo-600"
                    : "border-gray-300 text-gray-400")
              }
              aria-hidden="true"
            >
              {isComplete ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : isActive ? (
                <motion.span
                  className="block h-2 w-2 rounded-full bg-indigo-500"
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={
                "text-sm " +
                (isComplete
                  ? "text-gray-500 line-through"
                  : isActive
                    ? "font-medium text-gray-900"
                    : "text-gray-400")
              }
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default ProgressIndicator;
