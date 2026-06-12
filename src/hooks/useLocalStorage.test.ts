/**
 * Unit tests for useLocalStorage: persistence, hydration, updater functions,
 * removal, and graceful handling of corrupted data.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

const KEY = "test-key";

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("useLocalStorage", () => {
  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, "default"));
    expect(result.current[0]).toBe("default");
  });

  it("hydrates from a previously stored value", () => {
    localStorage.setItem(KEY, JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage(KEY, "default"));
    expect(result.current[0]).toBe("stored");
  });

  it("persists a new value to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 0));

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(JSON.parse(localStorage.getItem(KEY) ?? "null")).toBe(42);
  });

  it("supports updater functions", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 1));

    act(() => {
      result.current[1]((previous) => previous + 9);
    });

    expect(result.current[0]).toBe(10);
    expect(JSON.parse(localStorage.getItem(KEY) ?? "null")).toBe(10);
  });

  it("removes the key and resets to the initial value", () => {
    const { result } = renderHook(() => useLocalStorage(KEY, "default"));

    act(() => {
      result.current[1]("changed");
    });
    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("default");
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("falls back to the initial value on corrupted JSON", () => {
    localStorage.setItem(KEY, "{not valid json");
    const { result } = renderHook(() => useLocalStorage(KEY, { a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  it("persists complex objects", () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ items: number[] }>(KEY, { items: [] }),
    );

    act(() => {
      result.current[1]({ items: [1, 2, 3] });
    });

    expect(result.current[0]).toEqual({ items: [1, 2, 3] });
    expect(JSON.parse(localStorage.getItem(KEY) ?? "null")).toEqual({
      items: [1, 2, 3],
    });
  });
});
