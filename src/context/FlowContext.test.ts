import { describe, it, expect } from "vitest";
import { flowReducer } from "./FlowContext";
import type { FlowState } from "./types";

const baseState: FlowState = {
  currentStep: "landing",
  disclaimerAccepted: false,
  showDisclaimerPage: false,
  showPrivacyPage: false,
};

describe("flowReducer", () => {
  describe("START_FEATURE", () => {
    it("goes to disclaimer when not yet accepted", () => {
      const next = flowReducer(baseState, { type: "START_FEATURE" });
      expect(next.currentStep).toBe("disclaimer");
    });

    it("skips disclaimer and goes to form when already accepted", () => {
      const next = flowReducer(
        { ...baseState, disclaimerAccepted: true },
        { type: "START_FEATURE" },
      );
      expect(next.currentStep).toBe("form");
    });
  });

  describe("ACCEPT_DISCLAIMER", () => {
    it("marks disclaimer accepted and goes to form", () => {
      const next = flowReducer(
        { ...baseState, currentStep: "disclaimer" },
        { type: "ACCEPT_DISCLAIMER" },
      );
      expect(next.disclaimerAccepted).toBe(true);
      expect(next.currentStep).toBe("form");
    });
  });

  describe("REJECT_DISCLAIMER", () => {
    it("returns to landing without accepting", () => {
      const next = flowReducer(
        { ...baseState, currentStep: "disclaimer" },
        { type: "REJECT_DISCLAIMER" },
      );
      expect(next.currentStep).toBe("landing");
      expect(next.disclaimerAccepted).toBe(false);
    });
  });

  describe("SUBMIT_FORM", () => {
    it("transitions form → analyzing", () => {
      const next = flowReducer(
        { ...baseState, currentStep: "form" },
        { type: "SUBMIT_FORM" },
      );
      expect(next.currentStep).toBe("analyzing");
    });
  });

  describe("ANALYSIS_COMPLETE", () => {
    it("transitions analyzing → results", () => {
      const next = flowReducer(
        { ...baseState, currentStep: "analyzing" },
        { type: "ANALYSIS_COMPLETE" },
      );
      expect(next.currentStep).toBe("results");
    });
  });

  describe("EDIT_INPUTS", () => {
    it("returns from results to form", () => {
      const next = flowReducer(
        { ...baseState, currentStep: "results" },
        { type: "EDIT_INPUTS" },
      );
      expect(next.currentStep).toBe("form");
    });
  });

  describe("START_OVER", () => {
    it("returns from results to landing", () => {
      const next = flowReducer(
        { ...baseState, currentStep: "results" },
        { type: "START_OVER" },
      );
      expect(next.currentStep).toBe("landing");
    });
  });

  describe("overlay toggles", () => {
    it("toggles the disclaimer overlay without changing the step", () => {
      const shown = flowReducer(baseState, {
        type: "SHOW_DISCLAIMER_PAGE",
        show: true,
      });
      expect(shown.showDisclaimerPage).toBe(true);
      expect(shown.currentStep).toBe("landing");

      const hidden = flowReducer(shown, {
        type: "SHOW_DISCLAIMER_PAGE",
        show: false,
      });
      expect(hidden.showDisclaimerPage).toBe(false);
    });

    it("toggles the privacy overlay without changing the step", () => {
      const shown = flowReducer(baseState, {
        type: "SHOW_PRIVACY_PAGE",
        show: true,
      });
      expect(shown.showPrivacyPage).toBe(true);
      expect(shown.currentStep).toBe("landing");
    });
  });

  it("does not mutate the input state", () => {
    const input: FlowState = { ...baseState };
    flowReducer(input, { type: "START_FEATURE" });
    expect(input).toEqual(baseState);
  });
});
