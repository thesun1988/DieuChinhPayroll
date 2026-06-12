/**
 * FlowContext — single-page sequential flow state management.
 *
 * The application has no URL routing. Instead, a small finite-state machine
 * tracks which step the user is currently viewing
 * (landing → disclaimer → form → analyzing → results) and whether the
 * legal disclaimer has been acknowledged.
 *
 * On first visit the disclaimer must be acknowledged before the user can
 * reach the input form (see requirements.md — Requirement 7.4). The
 * acknowledgement is persisted to `localStorage` so returning visitors skip
 * the disclaimer gate.
 *
 * Footer links to the Disclaimer and Privacy Policy pages are modeled as
 * overlay flags (`showDisclaimerPage` / `showPrivacyPage`) that can be toggled
 * from any step without changing `currentStep`.
 *
 * @see design.md — "Flow State Management"
 */

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { FlowAction, FlowState } from "./types";
import { isDisclaimerAccepted, saveDisclaimerAccepted } from "../utils/storage";

/**
 * Pure reducer for the flow finite-state machine.
 *
 * Transitions are intentionally explicit so the flow is easy to reason about:
 * - `START_FEATURE`: from the landing CTA. If the disclaimer was already
 *   accepted, jump straight to the form; otherwise show the disclaimer gate.
 * - `ACCEPT_DISCLAIMER`: acknowledge and proceed to the form.
 * - `REJECT_DISCLAIMER`: decline and return to the landing page.
 * - `SUBMIT_FORM`: begin the analysis animation.
 * - `ANALYSIS_COMPLETE`: reveal the results.
 * - `EDIT_INPUTS`: return to the form from results.
 * - `START_OVER`: return to the landing page from results.
 * - `SHOW_DISCLAIMER_PAGE` / `SHOW_PRIVACY_PAGE`: toggle footer overlays.
 */
export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "START_FEATURE":
      return {
        ...state,
        currentStep: state.disclaimerAccepted ? "form" : "disclaimer",
      };

    case "ACCEPT_DISCLAIMER":
      return {
        ...state,
        disclaimerAccepted: true,
        currentStep: "form",
      };

    case "REJECT_DISCLAIMER":
      return {
        ...state,
        currentStep: "landing",
      };

    case "SUBMIT_FORM":
      return {
        ...state,
        currentStep: "analyzing",
      };

    case "ANALYSIS_COMPLETE":
      return {
        ...state,
        currentStep: "results",
      };

    case "EDIT_INPUTS":
      return {
        ...state,
        currentStep: "form",
      };

    case "START_OVER":
      return {
        ...state,
        currentStep: "landing",
      };

    case "SHOW_DISCLAIMER_PAGE":
      return {
        ...state,
        showDisclaimerPage: action.show,
      };

    case "SHOW_PRIVACY_PAGE":
      return {
        ...state,
        showPrivacyPage: action.show,
      };

    default:
      return state;
  }
}

/** Value exposed by {@link FlowContext}. */
export interface FlowContextValue {
  state: FlowState;
  dispatch: Dispatch<FlowAction>;
}

const FlowContext = createContext<FlowContextValue | undefined>(undefined);

/**
 * Build the initial flow state.
 *
 * `disclaimerAccepted` is hydrated from `localStorage` so returning visitors
 * are not re-prompted. Lazily evaluated by `useReducer` to avoid touching
 * storage on every render.
 */
function createInitialState(): FlowState {
  return {
    currentStep: "landing",
    disclaimerAccepted: isDisclaimerAccepted(),
    showDisclaimerPage: false,
    showPrivacyPage: false,
  };
}

/** Props for {@link FlowProvider}. */
export interface FlowProviderProps {
  children: ReactNode;
}

/**
 * Provides flow state and dispatch to descendant components.
 *
 * Persists disclaimer acknowledgement to `localStorage` so it survives reloads.
 */
export function FlowProvider({ children }: FlowProviderProps) {
  const [state, baseDispatch] = useReducer(
    flowReducer,
    undefined,
    createInitialState,
  );

  // Wrap dispatch to mirror disclaimer acceptance into persistent storage.
  const dispatch: Dispatch<FlowAction> = (action) => {
    if (action.type === "ACCEPT_DISCLAIMER") {
      saveDisclaimerAccepted(true);
    }
    baseDispatch(action);
  };

  return (
    <FlowContext.Provider value={{ state, dispatch }}>
      {children}
    </FlowContext.Provider>
  );
}

/**
 * Access the flow context.
 *
 * @throws If called outside of a {@link FlowProvider}.
 */
export function useFlow(): FlowContextValue {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
}

export { FlowContext };
