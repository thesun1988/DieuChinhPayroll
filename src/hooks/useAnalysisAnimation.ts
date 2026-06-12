/**
 * useAnalysisAnimation — analysis animation timing controller.
 *
 * Manages the minimum-display timing for the analysis ("Đang phân tích…")
 * animation shown after the input form is submitted. The animation must run
 * for at least 1.5s and at most 3s to convey that real processing is happening
 * (see design.md — AnalysisAnimation), then fire `onComplete` so the flow can
 * advance to the results view.
 *
 * The hook starts a timer whenever `isActive` becomes true, clamps the
 * requested duration into the [1500, 3000]ms window, and reports progress
 * (0 → 1) so the UI can drive a progress indicator. Timers are cleaned up on
 * unmount or when `isActive` toggles off to avoid stale callbacks.
 *
 * @see design.md — "AnalysisAnimation"
 */

import { useEffect, useRef, useState } from "react";

/** Minimum animation display time (ms). */
export const MIN_DURATION_MS = 1500;
/** Maximum animation display time (ms). */
export const MAX_DURATION_MS = 3000;

/** How often progress is updated while the animation runs (ms). */
const PROGRESS_TICK_MS = 50;

/** Options for {@link useAnalysisAnimation}. */
export interface UseAnalysisAnimationOptions {
  /** Whether the animation is currently running. */
  isActive: boolean;
  /** Fired once when the animation completes. */
  onComplete: () => void;
  /** Requested duration in ms; clamped to [1500, 3000]. Defaults to 2000. */
  duration?: number;
}

/** Value returned by {@link useAnalysisAnimation}. */
export interface UseAnalysisAnimationResult {
  /** Animation progress in the range [0, 1]. */
  progress: number;
  /** The clamped duration (ms) actually used for the animation. */
  duration: number;
}

/** Clamp a value into the inclusive [min, max] range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Drive the analysis animation timing and fire `onComplete` when it finishes.
 */
export function useAnalysisAnimation({
  isActive,
  onComplete,
  duration = 2000,
}: UseAnalysisAnimationOptions): UseAnalysisAnimationResult {
  const clampedDuration = clamp(duration, MIN_DURATION_MS, MAX_DURATION_MS);
  const [progress, setProgress] = useState(0);

  // Keep the latest onComplete without re-triggering the timing effect.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(clamp(elapsed / clampedDuration, 0, 1));
    }, PROGRESS_TICK_MS);

    const timeout = setTimeout(() => {
      setProgress(1);
      clearInterval(interval);
      onCompleteRef.current();
    }, clampedDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, clampedDuration]);

  return { progress, duration: clampedDuration };
}
