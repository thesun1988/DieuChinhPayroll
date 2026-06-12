/**
 * Unit tests for AppContext: reducer behavior, localStorage hydration on
 * mount, and auto-save on state changes.
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type ReactNode } from "react";
import {
  AppProvider,
  appReducer,
  initialAppState,
  useAppContext,
  type AppContextState,
} from "./AppContext";
import { STORAGE_KEY } from "../utils/storage";
import type {
  ComparisonResult,
  Roadmap,
  RoadmapInput,
  TaxInput,
  TaxResult,
} from "./types";

// --- Test fixtures ---------------------------------------------------------

const sampleInput: TaxInput = {
  monthlyRevenue: 30000,
  splitRatio: { owner: 4, worker: 6 },
  numberOfWorkers: 3,
  currentCashPercent: 50,
  workerType: "W2",
  state: "CA",
  hoursPerWeek: 40,
};

const sampleResult: TaxResult = {
  workerGrossIncome: 18000,
  currentTaxedPortion: 9000,
  projectedTaxedPortion: 18000,
  currentEmployerCostPerMonth: 1000,
  projectedEmployerCostPerMonth: 2000,
  additionalCostPerMonth: 1000,
  additionalCostPerYear: 12000,
  currentWorkerTakeHome: 8000,
  projectedWorkerTakeHome: 15000,
  minimumWageViolation: false,
  form1099Required: true,
};

const sampleComparison: ComparisonResult = {
  w2Result: sampleResult,
  result1099: sampleResult,
};

const sampleRoadmapInput: RoadmapInput = {
  currentCashPercent: 50,
  splitRatio: { owner: 4, worker: 6 },
  workerType: "W2",
};

const sampleRoadmap: Roadmap = {
  phases: [
    {
      phaseNumber: 1,
      checkPercent: 60,
      cashPercent: 40,
      durationMonths: 3,
      startMonth: 1,
      endMonth: 3,
      notes: "Giai đoạn 1",
    },
  ],
  totalDurationMonths: 9,
  recommendation: "Chuyển đổi từ từ",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// --- Reducer ---------------------------------------------------------------

describe("appReducer", () => {
  it("sets calculator input", () => {
    const next = appReducer(initialAppState, {
      type: "SET_CALCULATOR_INPUT",
      payload: sampleInput,
    });
    expect(next.calculatorInput).toEqual(sampleInput);
  });

  it("sets calculator and comparison results", () => {
    let state = appReducer(initialAppState, {
      type: "SET_CALCULATOR_RESULT",
      payload: sampleResult,
    });
    state = appReducer(state, {
      type: "SET_COMPARISON_RESULT",
      payload: sampleComparison,
    });
    expect(state.calculatorResult).toEqual(sampleResult);
    expect(state.comparisonResult).toEqual(sampleComparison);
  });

  it("sets roadmap input and result", () => {
    let state = appReducer(initialAppState, {
      type: "SET_ROADMAP_INPUT",
      payload: sampleRoadmapInput,
    });
    state = appReducer(state, {
      type: "SET_ROADMAP_RESULT",
      payload: sampleRoadmap,
    });
    expect(state.roadmapInput).toEqual(sampleRoadmapInput);
    expect(state.roadmapResult).toEqual(sampleRoadmap);
  });

  it("sets classification answers and result", () => {
    let state = appReducer(initialAppState, {
      type: "SET_CLASSIFICATION_ANSWERS",
      payload: { q1: true, q2: false },
    });
    state = appReducer(state, {
      type: "SET_CLASSIFICATION_RESULT",
      payload: "W2",
    });
    expect(state.classificationAnswers).toEqual({ q1: true, q2: false });
    expect(state.classificationResult).toBe("W2");
  });

  it("hydrates a partial state", () => {
    const next = appReducer(initialAppState, {
      type: "HYDRATE",
      payload: { calculatorInput: sampleInput },
    });
    expect(next.calculatorInput).toEqual(sampleInput);
  });

  it("resets to initial state", () => {
    const populated: AppContextState = {
      ...initialAppState,
      calculatorInput: sampleInput,
    };
    expect(appReducer(populated, { type: "RESET" })).toEqual(initialAppState);
  });
});

// --- Hook / Provider -------------------------------------------------------

describe("AppProvider + useAppContext", () => {
  it("throws when used outside a provider", () => {
    expect(() => renderHook(() => useAppContext())).toThrow(
      /must be used within an AppProvider/,
    );
  });

  it("starts with the default state when localStorage is empty", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    expect(result.current.state).toEqual(initialAppState);
  });

  it("loads initial state from localStorage on mount", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        calculatorInput: sampleInput,
        roadmapInput: sampleRoadmapInput,
        classificationAnswers: { q1: true },
        disclaimerAccepted: true,
        lastUpdated: "2024-01-01T00:00:00.000Z",
      }),
    );

    const { result } = renderHook(() => useAppContext(), { wrapper });
    expect(result.current.state.calculatorInput).toEqual(sampleInput);
    expect(result.current.state.roadmapInput).toEqual(sampleRoadmapInput);
    expect(result.current.state.classificationAnswers).toEqual({ q1: true });
  });

  it("auto-saves to localStorage when state changes", () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: "SET_CALCULATOR_INPUT",
        payload: sampleInput,
      });
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(stored.calculatorInput).toEqual(sampleInput);
    expect(stored.lastUpdated).toBeTruthy();
  });

  it("does not write to localStorage on initial mount", () => {
    renderHook(() => useAppContext(), { wrapper });
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
