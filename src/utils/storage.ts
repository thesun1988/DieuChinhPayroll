/**
 * localStorage persistence wrapper.
 *
 * Provides a thin, defensive layer over the browser's `localStorage` for
 * persisting the user's calculation data. All operations degrade gracefully:
 * - If `localStorage` is unavailable (e.g. private browsing), operations
 *   become no-ops and a Vietnamese warning is logged. The app continues to
 *   work without persistence.
 * - If stored data is corrupted, `loadData` returns `null` instead of throwing.
 * - If the storage quota is exceeded, `saveData` logs a warning and continues
 *   without saving.
 *
 * @see design.md — "localStorage Schema" and "Error Handling > localStorage Errors"
 */

import type { StoredData } from "../context/types";

/** Primary key holding the serialized {@link StoredData} object. */
export const STORAGE_KEY = "nail-salon-payroll-data";

/** Standalone key tracking whether the disclaimer has been accepted. */
export const DISCLAIMER_KEY = "nail-salon-disclaimer-accepted";

// Warning messages (Vietnamese) — see design.md Error Handling section.
const WARN_UNAVAILABLE =
  "Trình duyệt không hỗ trợ lưu dữ liệu. Dữ liệu sẽ mất khi đóng trang.";
const WARN_QUOTA_EXCEEDED =
  "Bộ nhớ trình duyệt đã đầy. Không thể lưu dữ liệu mới.";

/**
 * Detect whether `localStorage` is available and writable.
 *
 * Some environments (private browsing, disabled storage, SSR) either omit
 * `localStorage` entirely or throw on access. This probes with a temporary
 * key/value to confirm reads and writes actually work.
 *
 * @returns `true` if `localStorage` can be used, otherwise `false`.
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof localStorage === "undefined") {
      return false;
    }
    const probe = "__nail_salon_storage_test__";
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * Determine whether an error represents a storage quota overflow.
 *
 * Browsers report quota errors inconsistently (name and/or numeric code),
 * so we check the known variants.
 */
function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof DOMException)) {
    return false;
  }
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014
  );
}

/**
 * Merge a partial {@link StoredData} patch into the persisted object and save.
 *
 * The patch is shallow-merged over the existing stored object (or a fresh
 * default if nothing is stored yet). The `lastUpdated` timestamp is refreshed
 * to the current time unless the caller explicitly provides one — this keeps
 * round-trip saves of a complete {@link StoredData} object lossless while still
 * stamping partial updates.
 *
 * The disclaimer-accepted flag is mirrored to its dedicated key whenever it is
 * present in the patch.
 *
 * If storage is unavailable or the quota is exceeded, the call is a no-op and a
 * warning is logged.
 *
 * @param data - Partial data to merge into the stored object.
 */
export function saveData(data: Partial<StoredData>): void {
  if (!isStorageAvailable()) {
    console.warn(WARN_UNAVAILABLE);
    return;
  }

  const existing = loadData();
  const base: StoredData = existing ?? {
    disclaimerAccepted: false,
    lastUpdated: new Date().toISOString(),
  };

  const merged: StoredData = {
    ...base,
    ...data,
    // Preserve a caller-supplied timestamp (lossless round-trip); otherwise
    // stamp the current time for this update.
    lastUpdated: data.lastUpdated ?? new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    if (data.disclaimerAccepted !== undefined) {
      localStorage.setItem(
        DISCLAIMER_KEY,
        JSON.stringify(data.disclaimerAccepted),
      );
    }
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.warn(WARN_QUOTA_EXCEEDED);
      return;
    }
    // Unexpected failure — warn and continue without persistence.
    console.warn(WARN_UNAVAILABLE);
  }
}

/**
 * Load the persisted {@link StoredData} object.
 *
 * Returns `null` if storage is unavailable, nothing is stored, or the stored
 * value is corrupted (invalid JSON or not a plain object). Corrupted data is
 * not thrown — callers can safely treat `null` as "start with empty state".
 *
 * @returns The parsed stored data, or `null`.
 */
export function loadData(): StoredData | null {
  if (!isStorageAvailable()) {
    console.warn(WARN_UNAVAILABLE);
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    return parsed as StoredData;
  } catch {
    // Corrupted JSON — treat as no stored data.
    return null;
  }
}

/**
 * Remove all persisted application data from `localStorage`.
 *
 * Clears both the primary data key and the disclaimer-accepted key. After this
 * call {@link loadData} returns `null` and {@link hasStoredData} returns
 * `false`. No-op if storage is unavailable.
 */
export function clearAllData(): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DISCLAIMER_KEY);
  } catch {
    // Best-effort removal — nothing actionable if it fails.
  }
}

/**
 * Check whether valid (parseable) stored data exists.
 *
 * @returns `true` if {@link loadData} would return a non-null object.
 */
export function hasStoredData(): boolean {
  return loadData() !== null;
}

/**
 * Persist only the disclaimer-accepted flag.
 *
 * Updates both the dedicated disclaimer key and the flag within the primary
 * stored object.
 *
 * @param accepted - Whether the disclaimer has been accepted.
 */
export function saveDisclaimerAccepted(accepted: boolean): void {
  saveData({ disclaimerAccepted: accepted });
}

/**
 * Read whether the disclaimer has been accepted.
 *
 * Reads from the dedicated disclaimer key, falling back to the flag inside the
 * primary stored object.
 *
 * @returns `true` if the disclaimer was previously accepted.
 */
export function isDisclaimerAccepted(): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  const raw = localStorage.getItem(DISCLAIMER_KEY);
  if (raw !== null) {
    try {
      return JSON.parse(raw) === true;
    } catch {
      // Fall through to the primary stored object.
    }
  }

  return loadData()?.disclaimerAccepted === true;
}
