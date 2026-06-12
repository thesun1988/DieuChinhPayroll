/**
 * useLocalStorage — generic, defensive `localStorage` state hook.
 *
 * Provides a `useState`-like API that transparently persists a JSON-
 * serializable value to `localStorage` under a given key. All storage access
 * is wrapped in try/catch so the hook degrades gracefully when storage is
 * unavailable (e.g. private browsing), the quota is exceeded, or stored data
 * is corrupted — in those cases it simply falls back to in-memory state and
 * logs a warning.
 *
 * Supports Requirement 5.1 (persist calculation data in localStorage) and
 * Requirement 5.2 (auto-load saved data on return) for components that need a
 * standalone persisted value outside of AppContext.
 *
 * @see design.md — "Error Handling > localStorage Errors"
 */

import { useCallback, useState } from "react";

/** A state updater, mirroring the signature of React's `setState`. */
type SetValue<T> = (value: T | ((previous: T) => T)) => void;

const WARN_READ =
  "Không thể đọc dữ liệu đã lưu từ trình duyệt. Sử dụng giá trị mặc định.";
const WARN_WRITE =
  "Không thể lưu dữ liệu vào trình duyệt. Thay đổi sẽ mất khi đóng trang.";

/**
 * Read and parse the value stored under `key`, falling back to `fallback`.
 *
 * Returns `fallback` if storage is unavailable, the key is absent, or the
 * stored value cannot be parsed.
 */
function readStoredValue<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === "undefined") {
      return fallback;
    }
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    console.warn(WARN_READ);
    return fallback;
  }
}

/**
 * Persist a JSON-serializable value to `localStorage`, kept in sync with React
 * state.
 *
 * @param key - The `localStorage` key to read from and write to.
 * @param initialValue - The value used when nothing valid is stored yet.
 * @returns A `[value, setValue, remove]` tuple. `setValue` accepts either a
 *   new value or an updater function; `remove` deletes the key and resets the
 *   value to `initialValue`.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, SetValue<T>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readStoredValue(key, initialValue),
  );

  const setValue = useCallback<SetValue<T>>(
    (value) => {
      setStoredValue((previous) => {
        const next =
          value instanceof Function
            ? (value as (previous: T) => T)(previous)
            : value;

        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(key, JSON.stringify(next));
          }
        } catch {
          console.warn(WARN_WRITE);
        }

        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch {
      // Best-effort removal — nothing actionable if it fails.
    }
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, remove];
}
