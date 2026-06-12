/**
 * AppContext — global application state provider.
 *
 * Manages the calculation-related slices of {@link AppState}:
 * calculatorInput, calculatorResult, comparisonResult, roadmapInput,
 * roadmapResult, classificationAnswers, and classificationResult.
 *
 * Behavior:
 * - On mount, initial state is hydrated from `localStorage` via
 *   {@link loadData}. Missing or corrupted data falls back to defaults.
 * - On every state change, the persistable slices are auto-saved to
 *   `localStorage` via {@link saveData}. Persistence degrades gracefully when
 *   storage is unavailable (the storage layer handles warnings/no-ops).
 *
 * Flow-step state (currentStep, disclaimerAccepted, overlay pages) is managed
 * separately by FlowContext — see design.md "Flow State Management".
 *
 * @see design.md — "Data Models > Application State" and "Data Flow"
 */

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import type {
  ComparisonResult,
  Roadmap,
  RoadmapInput,
  TaxInput,
  TaxResult,
  WorkerType,
} from "./types";
import { loadData, saveData } from "../utils/storage";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/**
 * The slice of global application state owned by {@link AppContext}.
 *
 * This intentionally excludes flow-step fields (managed by FlowContext) and
 * disclaimer acceptance (persisted independently by the storage layer).
 */
export interface AppContextState {
  // Calculator
  calculatorInput: TaxInput | null;
  calculatorResult: TaxResult | null;
  comparisonResult: ComparisonResult | null;

  // Roadmap
  roadmapInput: RoadmapInput | null;
  roadmapResult: Roadmap | null;

  // Classification
  classificationAnswers: Record<string, boolean>;
  classificationResult: WorkerType | null;

  // Meta
  lastUpdated: string | null;
}

/** Default empty state used before hydration and as a fallback. */
export const initialAppState: AppContextState = {
  calculatorInput: null,
  calculatorResult: null,
  comparisonResult: null,
  roadmapInput: null,
  roadmapResult: null,
  classificationAnswers: {},
  classificationResult: null,
  lastUpdated: null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Actions dispatched to the app reducer. */
export type AppAction =
  | { type: "SET_CALCULATOR_INPUT"; payload: TaxInput | null }
  | { type: "SET_CALCULATOR_RESULT"; payload: TaxResult | null }
  | { type: "SET_COMPARISON_RESULT"; payload: ComparisonResult | null }
  | { type: "SET_ROADMAP_INPUT"; payload: RoadmapInput | null }
  | { type: "SET_ROADMAP_RESULT"; payload: Roadmap | null }
  | { type: "SET_CLASSIFICATION_ANSWERS"; payload: Record<string, boolean> }
  | { type: "SET_CLASSIFICATION_RESULT"; payload: WorkerType | null }
  | { type: "HYDRATE"; payload: Partial<AppContextState> }
  | { type: "RESET" };

/**
 * Pure reducer applying {@link AppAction}s to {@link AppContextState}.
 *
 * Exported for unit testing.
 */
export function appReducer(
  state: AppContextState,
  action: AppAction,
): AppContextState {
  switch (action.type) {
    case "SET_CALCULATOR_INPUT":
      return { ...state, calculatorInput: action.payload };
    case "SET_CALCULATOR_RESULT":
      return { ...state, calculatorResult: action.payload };
    case "SET_COMPARISON_RESULT":
      return { ...state, comparisonResult: action.payload };
    case "SET_ROADMAP_INPUT":
      return { ...state, roadmapInput: action.payload };
    case "SET_ROADMAP_RESULT":
      return { ...state, roadmapResult: action.payload };
    case "SET_CLASSIFICATION_ANSWERS":
      return { ...state, classificationAnswers: action.payload };
    case "SET_CLASSIFICATION_RESULT":
      return { ...state, classificationResult: action.payload };
    case "HYDRATE":
      return { ...state, ...action.payload };
    case "RESET":
      return { ...initialAppState };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/** Value exposed by {@link AppContext}. */
export interface AppContextValue {
  state: AppContextState;
  dispatch: Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Build the initial reducer state by hydrating from `localStorage`.
 *
 * Lazy initializer for {@link useReducer} so the read happens exactly once.
 */
function hydrateInitialState(): AppContextState {
  const stored = loadData();
  if (stored === null) {
    return initialAppState;
  }

  return {
    ...initialAppState,
    calculatorInput: stored.calculatorInput ?? null,
    calculatorResult: stored.calculatorResult ?? null,
    comparisonResult: stored.comparisonResult ?? null,
    roadmapInput: stored.roadmapInput ?? null,
    roadmapResult: stored.roadmapResult ?? null,
    classificationAnswers: stored.classificationAnswers ?? {},
    lastUpdated: stored.lastUpdated ?? null,
  };
}

/**
 * Provider that owns the global application state and auto-persists it.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    appReducer,
    undefined,
    hydrateInitialState,
  );

  // Skip the very first persistence pass: the initial state was just loaded
  // from storage, so re-saving it would be redundant (and would rewrite the
  // lastUpdated timestamp on every page load).
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    saveData({
      calculatorInput: state.calculatorInput ?? undefined,
      calculatorResult: state.calculatorResult ?? undefined,
      comparisonResult: state.comparisonResult ?? undefined,
      roadmapInput: state.roadmapInput ?? undefined,
      roadmapResult: state.roadmapResult ?? undefined,
      classificationAnswers: state.classificationAnswers,
    });
  }, [
    state.calculatorInput,
    state.calculatorResult,
    state.comparisonResult,
    state.roadmapInput,
    state.roadmapResult,
    state.classificationAnswers,
  ]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Access the global application state and dispatcher.
 *
 * @throws If called outside of an {@link AppProvider}.
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export { AppContext };
