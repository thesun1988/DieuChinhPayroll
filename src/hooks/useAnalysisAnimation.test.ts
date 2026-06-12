/**
 * Unit tests for useAnalysisAnimation: duration clamping, onComplete firing,
 * progress reporting, and timer cleanup.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_DURATION_MS,
  MIN_DURATION_MS,
  useAnalysisAnimation,
} from "./useAnalysisAnimation";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useAnalysisAnimation", () => {
  it("clamps a too-short duration up to the minimum", () => {
    const { result } = renderHook(() =>
      useAnalysisAnimation({
        isActive: true,
        onComplete: () => {},
        duration: 100,
      }),
    );
    expect(result.current.duration).toBe(MIN_DURATION_MS);
  });

  it("clamps a too-long duration down to the maximum", () => {
    const { result } = renderHook(() =>
      useAnalysisAnimation({
        isActive: true,
        onComplete: () => {},
        duration: 99999,
      }),
    );
    expect(result.current.duration).toBe(MAX_DURATION_MS);
  });

  it("does not fire onComplete before the duration elapses", () => {
    const onComplete = vi.fn();
    renderHook(() =>
      useAnalysisAnimation({ isActive: true, onComplete, duration: 2000 }),
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("fires onComplete once after the clamped duration", () => {
    const onComplete = vi.fn();
    renderHook(() =>
      useAnalysisAnimation({ isActive: true, onComplete, duration: 2000 }),
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("reaches full progress when complete", () => {
    const { result } = renderHook(() =>
      useAnalysisAnimation({
        isActive: true,
        onComplete: () => {},
        duration: 2000,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.progress).toBe(1);
  });

  it("does not fire onComplete when inactive", () => {
    const onComplete = vi.fn();
    renderHook(() =>
      useAnalysisAnimation({ isActive: false, onComplete, duration: 2000 }),
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("cleans up timers on unmount without firing onComplete", () => {
    const onComplete = vi.fn();
    const { unmount } = renderHook(() =>
      useAnalysisAnimation({ isActive: true, onComplete, duration: 2000 }),
    );

    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
