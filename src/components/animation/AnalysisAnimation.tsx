/**
 * AnalysisAnimation — analyzing/loading transition shown after form submit.
 *
 * Container that displays the analysis animation while the tax/roadmap/risk
 * calculations run, then advances the flow to the results view. The minimum
 * display time (1.5s) makes the processing feel deliberate, capped at 3s; the
 * actual timing is owned by {@link useAnalysisAnimation}, which clamps
 * `duration` into [1500, 3000]ms and fires `onComplete` when finished.
 *
 * Calculations are kicked off once when the animation becomes active via the
 * optional `runCalculations` callback, so real work happens behind the
 * animation rather than blocking it. Because the work is synchronous and fast,
 * the animation's minimum display time is the limiting factor — `onComplete`
 * fires only after both the animation has elapsed and calculations have run.
 *
 * @see design.md — "AnalysisAnimation"
 * @see requirements.md — Requirement 2.9
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAnalysisAnimation } from "../../hooks/useAnalysisAnimation";
import { AnimationGraphics } from "./AnimationGraphics";
import { ProgressIndicator } from "./ProgressIndicator";

/** Props for {@link AnalysisAnimation}. */
export interface AnalysisAnimationProps {
  /** Whether the animation is currently running. */
  isActive: boolean;
  /** Fired once when the animation completes and calculations have run. */
  onComplete: () => void;
  /** Requested duration in ms; clamped to [1500, 3000]. Defaults to 2000. */
  duration?: number;
  /**
   * Optional calculation callback run once when the animation activates.
   * Lets real work execute behind the animation; the minimum display time
   * ensures the result is not shown before the animation completes.
   */
  runCalculations?: () => void;
}

/** Analyzing transition displayed between the input form and the results. */
export function AnalysisAnimation({
  isActive,
  onComplete,
  duration,
  runCalculations,
}: AnalysisAnimationProps) {
  const { progress } = useAnalysisAnimation({ isActive, onComplete, duration });

  // Run the calculations exactly once per activation, behind the animation.
  const hasRunRef = useRef(false);
  useEffect(() => {
    if (!isActive) {
      hasRunRef.current = false;
      return;
    }
    if (!hasRunRef.current) {
      hasRunRef.current = true;
      runCalculations?.();
    }
  }, [isActive, runCalculations]);

  if (!isActive) return null;

  return (
    <motion.section
      className="flex flex-col items-center justify-center gap-8 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-center text-xl font-semibold text-gray-900">
        Đang phân tích dữ liệu của bạn
      </h2>

      <AnimationGraphics progress={progress} />

      <div className="w-full max-w-xs">
        <ProgressIndicator progress={progress} />
      </div>
    </motion.section>
  );
}

export default AnalysisAnimation;
