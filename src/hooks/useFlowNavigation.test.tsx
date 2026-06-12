/**
 * Unit tests for useFlowNavigation: step transitions and overlay toggles
 * backed by FlowContext.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { type ReactNode } from "react";
import { FlowProvider } from "../context/FlowContext";
import { useFlowNavigation } from "./useFlowNavigation";

const wrapper = ({ children }: { children: ReactNode }) => (
  <FlowProvider>{children}</FlowProvider>
);

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("useFlowNavigation", () => {
  it("starts on the landing step", () => {
    const { result } = renderHook(() => useFlowNavigation(), { wrapper });
    expect(result.current.currentStep).toBe("landing");
    expect(result.current.disclaimerAccepted).toBe(false);
  });

  it("startFeature shows the disclaimer when not yet accepted", () => {
    const { result } = renderHook(() => useFlowNavigation(), { wrapper });

    act(() => result.current.startFeature());

    expect(result.current.currentStep).toBe("disclaimer");
  });

  it("walks the full flow: accept → submit → complete → edit → start over", () => {
    const { result } = renderHook(() => useFlowNavigation(), { wrapper });

    act(() => result.current.startFeature());
    act(() => result.current.acceptDisclaimer());
    expect(result.current.currentStep).toBe("form");
    expect(result.current.disclaimerAccepted).toBe(true);

    act(() => result.current.submitForm());
    expect(result.current.currentStep).toBe("analyzing");

    act(() => result.current.completeAnalysis());
    expect(result.current.currentStep).toBe("results");

    act(() => result.current.editInputs());
    expect(result.current.currentStep).toBe("form");

    act(() => result.current.startOver());
    expect(result.current.currentStep).toBe("landing");
  });

  it("rejectDisclaimer returns to landing", () => {
    const { result } = renderHook(() => useFlowNavigation(), { wrapper });

    act(() => result.current.startFeature());
    act(() => result.current.rejectDisclaimer());

    expect(result.current.currentStep).toBe("landing");
  });

  it("toggles footer overlays", () => {
    const { result } = renderHook(() => useFlowNavigation(), { wrapper });

    act(() => result.current.setShowDisclaimerPage(true));
    expect(result.current.showDisclaimerPage).toBe(true);

    act(() => result.current.setShowPrivacyPage(true));
    expect(result.current.showPrivacyPage).toBe(true);

    act(() => result.current.setShowDisclaimerPage(false));
    expect(result.current.showDisclaimerPage).toBe(false);
  });
});
