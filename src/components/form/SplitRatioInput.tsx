/**
 * SplitRatioInput — commission split ratio selector.
 *
 * Lets the owner pick a common owner/worker split (4/6, 5/5, 3/7) or enter a
 * custom ratio. The value is reported as a {@link SplitRatio} ({ owner,
 * worker }). Presets are matched against the current value so reloading a
 * saved ratio re-selects the matching preset.
 *
 * @see design.md — "InputForm"
 * @see requirements.md — Requirements 2.1, 2.12
 */

import { useState } from "react";
import type { SplitRatio } from "../../context/types";
import { ErrorMessage } from "../common/ErrorMessage";

/** A selectable preset ratio. */
interface SplitPreset {
  label: string;
  owner: number;
  worker: number;
}

/** Common nail-salon commission splits (owner/worker). */
const PRESETS: SplitPreset[] = [
  { label: "4/6", owner: 4, worker: 6 },
  { label: "5/5", owner: 5, worker: 5 },
  { label: "3/7", owner: 3, worker: 7 },
];

/** Props for {@link SplitRatioInput}. */
export interface SplitRatioInputProps {
  /** Current split ratio. */
  value: SplitRatio;
  /** Invoked with the new split ratio. */
  onChange: (value: SplitRatio) => void;
  /** Inline validation error message (Vietnamese), if any. */
  error?: string;
}

/** True when the value matches a preset's owner/worker pair. */
function matchesPreset(value: SplitRatio, preset: SplitPreset): boolean {
  return value.owner === preset.owner && value.worker === preset.worker;
}

export function SplitRatioInput({
  value,
  onChange,
  error,
}: SplitRatioInputProps) {
  const matchesAnyPreset = PRESETS.some((preset) =>
    matchesPreset(value, preset),
  );
  const [customMode, setCustomMode] = useState(!matchesAnyPreset);
  const isCustom = customMode || !matchesAnyPreset;
  const errorId = "splitRatio-error";

  return (
    <fieldset className="flex flex-col">
      <legend className="text-sm font-medium text-gray-900">
        Tỉ lệ ăn chia chủ/thợ (Commission split)
      </legend>
      <p className="mt-1 text-xs text-gray-500">
        Số phần chủ tiệm nhận so với số phần thợ nhận.
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const selected = !isCustom && matchesPreset(value, preset);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setCustomMode(false);
                onChange({ owner: preset.owner, worker: preset.worker });
              }}
              aria-pressed={selected}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCustomMode(true)}
          aria-pressed={isCustom}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isCustom
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Tùy chỉnh (Custom)
        </button>
      </div>

      {isCustom && (
        <div className="mt-3 flex items-end gap-3">
          <div className="flex flex-col">
            <label
              htmlFor="splitRatio-owner"
              className="text-xs font-medium text-gray-700"
            >
              Chủ (Owner)
            </label>
            <input
              id="splitRatio-owner"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.5"
              value={value.owner}
              onChange={(e) =>
                onChange({
                  owner: Number(e.target.value),
                  worker: value.worker,
                })
              }
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`mt-1 w-24 rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
          </div>
          <span className="pb-2 text-lg font-semibold text-gray-400">/</span>
          <div className="flex flex-col">
            <label
              htmlFor="splitRatio-worker"
              className="text-xs font-medium text-gray-700"
            >
              Thợ (Worker)
            </label>
            <input
              id="splitRatio-worker"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.5"
              value={value.worker}
              onChange={(e) =>
                onChange({ owner: value.owner, worker: Number(e.target.value) })
              }
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`mt-1 w-24 rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
          </div>
        </div>
      )}

      <ErrorMessage id={errorId} message={error} />
    </fieldset>
  );
}

export default SplitRatioInput;
