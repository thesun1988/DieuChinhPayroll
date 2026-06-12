/**
 * Tests for the analysis animation components: ProgressIndicator,
 * AnimationGraphics, and the AnalysisAnimation container.
 *
 * Validates: Requirement 2.9 (analysis animation with progress steps,
 * min 1.5s / max 3s display time before completion).
 */

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AnalysisAnimation,
  type AnalysisAnimationProps,
} from "./AnalysisAnimation";
import {
  ANALYSIS_STEPS,
  ProgressIndicator,
  activeStepIndex,
} from "./ProgressIndicator";
import { AnimationGraphics, progressPercent } from "./AnimationGraphics";

describe("activeStepIndex", () => {
  it("returns the first step at zero progress", () => {
    expect(activeStepIndex(0, 3)).toBe(0);
  });

  it("returns the last step at full progress", () => {
    expect(activeStepIndex(1, 3)).toBe(2);
  });

  it("maps the middle segment to the middle step", () => {
    expect(activeStepIndex(0.5, 3)).toBe(1);
  });

  it("clamps out-of-range progress", () => {
    expect(activeStepIndex(-1, 3)).toBe(0);
    expect(activeStepIndex(5, 3)).toBe(2);
  });

  it("is safe when there are no steps", () => {
    expect(activeStepIndex(0.5, 0)).toBe(0);
  });
});

describe("ProgressIndicator", () => {
  it("renders all three Vietnamese step labels", () => {
    render(<ProgressIndicator progress={0} />);
    for (const label of ANALYSIS_STEPS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("marks the active step with aria-current at the start", () => {
    render(<ProgressIndicator progress={0} />);
    const current = screen.getByText(ANALYSIS_STEPS[0]).closest("li");
    expect(current).toHaveAttribute("aria-current", "step");
    expect(current).toHaveAttribute("data-state", "active");
  });

  it("marks every step complete once progress reaches 1", () => {
    render(<ProgressIndicator progress={1} />);
    const items = screen.getAllByRole("listitem");
    for (const item of items) {
      expect(item).toHaveAttribute("data-state", "complete");
    }
  });
});

describe("progressPercent", () => {
  it("converts progress to a whole percentage", () => {
    expect(progressPercent(0)).toBe(0);
    expect(progressPercent(0.5)).toBe(50);
    expect(progressPercent(1)).toBe(100);
  });

  it("clamps values outside [0, 1]", () => {
    expect(progressPercent(-0.5)).toBe(0);
    expect(progressPercent(2)).toBe(100);
  });
});

describe("AnimationGraphics", () => {
  it("renders an accessible percentage label", () => {
    render(<AnimationGraphics progress={0.42} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Đang phân tích, 42%",
    );
  });
});

describe("AnalysisAnimation", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = (props: Partial<AnalysisAnimationProps> = {}) => {
    const onComplete = vi.fn();
    const runCalculations = vi.fn();
    const result = render(
      <AnalysisAnimation
        isActive
        onComplete={onComplete}
        runCalculations={runCalculations}
        {...props}
      />,
    );
    return { onComplete, runCalculations, ...result };
  };

  it("renders nothing when inactive", () => {
    const { container } = render(
      <AnalysisAnimation isActive={false} onComplete={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("runs calculations once when activated", () => {
    const { runCalculations } = setup();
    expect(runCalculations).toHaveBeenCalledTimes(1);
  });

  it("shows the progress steps while analyzing", () => {
    setup();
    expect(screen.getByText(ANALYSIS_STEPS[0])).toBeInTheDocument();
  });

  it("does not complete before the minimum 1.5s display time", () => {
    const { onComplete } = setup({ duration: 100 });
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("completes after the clamped duration elapses", () => {
    const { onComplete } = setup({ duration: 100 });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("caps the display time at 3s for very large durations", () => {
    const { onComplete } = setup({ duration: 99999 });
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
