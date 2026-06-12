/**
 * AnimationGraphics — visual animation elements for the analysis screen.
 *
 * Renders the "processing" visuals shown while calculations run: a spinning
 * chart/ring graphic and an animated number counter that ticks up toward the
 * current progress. Built with Framer Motion so the motion stays declarative.
 *
 * Purely decorative and driven by the `progress` prop ([0, 1]); all timing is
 * owned by {@link useAnalysisAnimation}.
 *
 * @see design.md — "AnalysisAnimation"
 * @see requirements.md — Requirement 2.9
 */

import { motion } from "framer-motion";

/** Props for {@link AnimationGraphics}. */
export interface AnimationGraphicsProps {
  /** Animation progress in the range [0, 1]. */
  progress: number;
}

/** Convert a [0, 1] progress value to a clamped whole-number percentage. */
export function progressPercent(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return Math.round(clamped * 100);
}

/** Geometry for the circular progress ring. */
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Spinning chart ring with an animated percentage counter. */
export function AnimationGraphics({ progress }: AnimationGraphicsProps) {
  const percent = progressPercent(progress);
  const dashOffset =
    RING_CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div
      className="relative mx-auto flex h-32 w-32 items-center justify-center"
      role="img"
      aria-label={`Đang phân tích, ${percent}%`}
    >
      {/* Continuously spinning outer ring conveys ongoing processing. */}
      <motion.svg
        className="absolute inset-0 h-full w-full text-indigo-200"
        viewBox="0 0 120 120"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray="10 14"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Progress arc that fills as calculations complete. */}
      <svg
        className="absolute inset-0 h-full w-full -rotate-90 text-indigo-500"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>

      {/* Animated number counter in the center. */}
      <div className="flex flex-col items-center">
        <motion.span
          key={percent}
          className="text-3xl font-bold tabular-nums text-indigo-600"
          initial={{ opacity: 0.4, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {percent}%
        </motion.span>
        <span className="text-xs text-gray-500">Đang phân tích</span>
      </div>
    </div>
  );
}

export default AnimationGraphics;
