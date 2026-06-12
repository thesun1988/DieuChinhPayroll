/**
 * useCalculator — calculator orchestration hook.
 *
 * Wraps the pure {@link calculateTax} and {@link compareW2vs1099} utilities and
 * wires their results into {@link AppContext}. Components call {@link calculate}
 * with a {@link TaxInput}; the hook computes the single-scenario result and the
 * W-2 vs. 1099 comparison, then dispatches them (along with the input) into the
 * global state so they are persisted and available to the results view.
 *
 * Satisfies Requirement 2.9 (results update on input change) by recomputing
 * synchronously on each call. The current input/result/comparison are exposed
 * for convenience so consumers can read them without reaching into the context.
 *
 * @see design.md — "Data Flow" and "Custom Hooks"
 */

import { useCallback } from "react";
import type { ComparisonResult, TaxInput, TaxResult } from "../context/types";
import { calculateTax, compareW2vs1099 } from "../utils/taxCalculator";
import { useAppContext } from "../context/AppContext";

/** Value returned by {@link useCalculator}. */
export interface UseCalculatorResult {
  /** The most recent calculator input, or `null` if none has been submitted. */
  input: TaxInput | null;
  /** The most recent single-scenario tax result, or `null`. */
  result: TaxResult | null;
  /** The most recent W-2 vs. 1099 comparison, or `null`. */
  comparison: ComparisonResult | null;
  /**
   * Run the tax calculation and comparison for `input`, updating AppContext.
   *
   * @returns The computed {@link TaxResult} for the provided input.
   */
  calculate: (input: TaxInput) => TaxResult;
  /** Clear the stored calculator input, result, and comparison. */
  reset: () => void;
}

/**
 * Access calculator state and actions backed by {@link AppContext}.
 */
export function useCalculator(): UseCalculatorResult {
  const { state, dispatch } = useAppContext();

  const calculate = useCallback(
    (input: TaxInput): TaxResult => {
      const result = calculateTax(input);
      const comparison = compareW2vs1099(input);

      dispatch({ type: "SET_CALCULATOR_INPUT", payload: input });
      dispatch({ type: "SET_CALCULATOR_RESULT", payload: result });
      dispatch({ type: "SET_COMPARISON_RESULT", payload: comparison });

      return result;
    },
    [dispatch],
  );

  const reset = useCallback(() => {
    dispatch({ type: "SET_CALCULATOR_INPUT", payload: null });
    dispatch({ type: "SET_CALCULATOR_RESULT", payload: null });
    dispatch({ type: "SET_COMPARISON_RESULT", payload: null });
  }, [dispatch]);

  return {
    input: state.calculatorInput,
    result: state.calculatorResult,
    comparison: state.comparisonResult,
    calculate,
    reset,
  };
}
