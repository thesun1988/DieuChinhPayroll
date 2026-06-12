/**
 * useRoadmap — transition roadmap orchestration hook.
 *
 * Wraps the pure {@link generateRoadmap} utility and wires its result into
 * {@link AppContext}. Components call {@link generate} with a
 * {@link RoadmapInput}; the hook produces the phased {@link Roadmap} and
 * dispatches it (along with the input) into the global state so it is persisted
 * and available to the results view.
 *
 * The current input/result are exposed for convenience so consumers can read
 * them without reaching into the context directly.
 *
 * @see design.md — "Data Flow" and "Custom Hooks"
 */

import { useCallback } from "react";
import type { Roadmap, RoadmapInput } from "../context/types";
import { generateRoadmap } from "../utils/roadmapGenerator";
import { useAppContext } from "../context/AppContext";

/** Value returned by {@link useRoadmap}. */
export interface UseRoadmapResult {
  /** The most recent roadmap input, or `null` if none has been submitted. */
  input: RoadmapInput | null;
  /** The most recent generated roadmap, or `null`. */
  roadmap: Roadmap | null;
  /**
   * Generate a roadmap for `input`, updating AppContext.
   *
   * @returns The generated {@link Roadmap}.
   */
  generate: (input: RoadmapInput) => Roadmap;
  /** Clear the stored roadmap input and result. */
  reset: () => void;
}

/**
 * Access roadmap state and actions backed by {@link AppContext}.
 */
export function useRoadmap(): UseRoadmapResult {
  const { state, dispatch } = useAppContext();

  const generate = useCallback(
    (input: RoadmapInput): Roadmap => {
      const roadmap = generateRoadmap(input);

      dispatch({ type: "SET_ROADMAP_INPUT", payload: input });
      dispatch({ type: "SET_ROADMAP_RESULT", payload: roadmap });

      return roadmap;
    },
    [dispatch],
  );

  const reset = useCallback(() => {
    dispatch({ type: "SET_ROADMAP_INPUT", payload: null });
    dispatch({ type: "SET_ROADMAP_RESULT", payload: null });
  }, [dispatch]);

  return {
    input: state.roadmapInput,
    roadmap: state.roadmapResult,
    generate,
    reset,
  };
}
