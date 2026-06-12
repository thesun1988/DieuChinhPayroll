/**
 * useFlowNavigation — ergonomic wrapper around {@link FlowContext}.
 *
 * Exposes the current flow step and disclaimer/overlay state alongside named
 * action helpers, so components can drive the single-page sequential flow
 * (landing → disclaimer → form → analyzing → results) without dispatching raw
 * {@link FlowAction}s themselves.
 *
 * @see design.md — "Flow State Management"
 */

import { useCallback } from "react";
import type { FlowStep } from "../context/types";
import { useFlow } from "../context/FlowContext";

/** Value returned by {@link useFlowNavigation}. */
export interface UseFlowNavigationResult {
  /** The step the user is currently viewing. */
  currentStep: FlowStep;
  /** Whether the legal disclaimer has been acknowledged. */
  disclaimerAccepted: boolean;
  /** Whether the Disclaimer footer overlay is visible. */
  showDisclaimerPage: boolean;
  /** Whether the Privacy Policy footer overlay is visible. */
  showPrivacyPage: boolean;

  /** Begin a feature from the landing CTA (gates on the disclaimer). */
  startFeature: () => void;
  /** Acknowledge the disclaimer and proceed to the form. */
  acceptDisclaimer: () => void;
  /** Decline the disclaimer and return to the landing page. */
  rejectDisclaimer: () => void;
  /** Submit the input form and begin the analysis animation. */
  submitForm: () => void;
  /** Reveal the results once analysis completes. */
  completeAnalysis: () => void;
  /** Return to the form from the results view. */
  editInputs: () => void;
  /** Return to the landing page from the results view. */
  startOver: () => void;
  /** Toggle the Disclaimer footer overlay. */
  setShowDisclaimerPage: (show: boolean) => void;
  /** Toggle the Privacy Policy footer overlay. */
  setShowPrivacyPage: (show: boolean) => void;
}

/**
 * Access flow step state and navigation actions backed by {@link FlowContext}.
 */
export function useFlowNavigation(): UseFlowNavigationResult {
  const { state, dispatch } = useFlow();

  const startFeature = useCallback(
    () => dispatch({ type: "START_FEATURE" }),
    [dispatch],
  );
  const acceptDisclaimer = useCallback(
    () => dispatch({ type: "ACCEPT_DISCLAIMER" }),
    [dispatch],
  );
  const rejectDisclaimer = useCallback(
    () => dispatch({ type: "REJECT_DISCLAIMER" }),
    [dispatch],
  );
  const submitForm = useCallback(
    () => dispatch({ type: "SUBMIT_FORM" }),
    [dispatch],
  );
  const completeAnalysis = useCallback(
    () => dispatch({ type: "ANALYSIS_COMPLETE" }),
    [dispatch],
  );
  const editInputs = useCallback(
    () => dispatch({ type: "EDIT_INPUTS" }),
    [dispatch],
  );
  const startOver = useCallback(
    () => dispatch({ type: "START_OVER" }),
    [dispatch],
  );
  const setShowDisclaimerPage = useCallback(
    (show: boolean) => dispatch({ type: "SHOW_DISCLAIMER_PAGE", show }),
    [dispatch],
  );
  const setShowPrivacyPage = useCallback(
    (show: boolean) => dispatch({ type: "SHOW_PRIVACY_PAGE", show }),
    [dispatch],
  );

  return {
    currentStep: state.currentStep,
    disclaimerAccepted: state.disclaimerAccepted,
    showDisclaimerPage: state.showDisclaimerPage,
    showPrivacyPage: state.showPrivacyPage,
    startFeature,
    acceptDisclaimer,
    rejectDisclaimer,
    submitForm,
    completeAnalysis,
    editInputs,
    startOver,
    setShowDisclaimerPage,
    setShowPrivacyPage,
  };
}
