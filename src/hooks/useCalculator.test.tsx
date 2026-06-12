/**
 * Unit tests for useCalculator: wraps calculateTax/compareW2vs1099 and updates
 * AppContext.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { type ReactNode } from "react";
import { AppProvider } from "../context/AppContext";
import { useCalculator } from "./useCalculator";
import { calculateTax, compareW2vs1099 } from "../utils/taxCalculator";
import type { TaxInput } from "../context/types";

const sampleInput: TaxInput = {
  monthlyRevenue: 30000,
  splitRatio: { owner: 4, worker: 6 },
  numberOfWorkers: 3,
  currentCashPercent: 50,
  workerType: "W2",
  state: "CA",
  hoursPerWeek: 40,
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("useCalculator", () => {
  it("starts with null input/result/comparison", () => {
    const { result } = renderHook(() => useCalculator(), { wrapper });
    expect(result.current.input).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.comparison).toBeNull();
  });

  it("computes and stores the result and comparison in context", () => {
    const { result } = renderHook(() => useCalculator(), { wrapper });

    act(() => {
      result.current.calculate(sampleInput);
    });

    expect(result.current.input).toEqual(sampleInput);
    expect(result.current.result).toEqual(calculateTax(sampleInput));
    expect(result.current.comparison).toEqual(compareW2vs1099(sampleInput));
  });

  it("returns the computed result from calculate()", () => {
    const { result } = renderHook(() => useCalculator(), { wrapper });

    let returned;
    act(() => {
      returned = result.current.calculate(sampleInput);
    });

    expect(returned).toEqual(calculateTax(sampleInput));
  });

  it("clears stored values on reset", () => {
    const { result } = renderHook(() => useCalculator(), { wrapper });

    act(() => {
      result.current.calculate(sampleInput);
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.input).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.comparison).toBeNull();
  });
});
