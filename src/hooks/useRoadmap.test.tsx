/**
 * Unit tests for useRoadmap: wraps generateRoadmap and updates AppContext.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { type ReactNode } from "react";
import { AppProvider } from "../context/AppContext";
import { useRoadmap } from "./useRoadmap";
import { generateRoadmap } from "../utils/roadmapGenerator";
import type { RoadmapInput } from "../context/types";

const sampleInput: RoadmapInput = {
  currentCashPercent: 70,
  splitRatio: { owner: 4, worker: 6 },
  workerType: "W2",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("useRoadmap", () => {
  it("starts with null input/roadmap", () => {
    const { result } = renderHook(() => useRoadmap(), { wrapper });
    expect(result.current.input).toBeNull();
    expect(result.current.roadmap).toBeNull();
  });

  it("generates and stores the roadmap in context", () => {
    const { result } = renderHook(() => useRoadmap(), { wrapper });

    act(() => {
      result.current.generate(sampleInput);
    });

    expect(result.current.input).toEqual(sampleInput);
    expect(result.current.roadmap).toEqual(generateRoadmap(sampleInput));
  });

  it("returns the generated roadmap from generate()", () => {
    const { result } = renderHook(() => useRoadmap(), { wrapper });

    let returned;
    act(() => {
      returned = result.current.generate(sampleInput);
    });

    expect(returned).toEqual(generateRoadmap(sampleInput));
  });

  it("clears stored values on reset", () => {
    const { result } = renderHook(() => useRoadmap(), { wrapper });

    act(() => {
      result.current.generate(sampleInput);
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.input).toBeNull();
    expect(result.current.roadmap).toBeNull();
  });
});
