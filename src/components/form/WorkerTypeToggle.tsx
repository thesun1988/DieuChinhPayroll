/**
 * WorkerTypeToggle — W-2 / 1099 segmented toggle.
 *
 * Selects the worker employment classification. The choice drives which tax
 * formulas the calculator uses and whether the minimum-wage / hours-per-week
 * field is relevant (W-2 only).
 *
 * @see design.md — "InputForm"
 * @see requirements.md — Requirement 2.2
 */

import type { WorkerType } from "../../context/types";

/** Props for {@link WorkerTypeToggle}. */
export interface WorkerTypeToggleProps {
  /** Currently selected worker type. */
  value: WorkerType;
  /** Invoked with the newly selected worker type. */
  onChange: (value: WorkerType) => void;
}

interface ToggleOption {
  type: WorkerType;
  label: string;
  hint: string;
}

const OPTIONS: ToggleOption[] = [
  {
    type: "W2",
    label: "W-2 (Nhân viên)",
    hint: "Chủ tiệm withhold thuế và đóng employer taxes.",
  },
  {
    type: "1099",
    label: "1099 (Thầu độc lập)",
    hint: "Thợ tự đóng thuế self-employment.",
  },
];

export function WorkerTypeToggle({ value, onChange }: WorkerTypeToggleProps) {
  return (
    <fieldset className="flex flex-col">
      <legend className="text-sm font-medium text-gray-900">
        Hình thức lao động (Worker type)
      </legend>
      <div
        role="radiogroup"
        aria-label="Hình thức lao động (Worker type)"
        className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {OPTIONS.map((option) => {
          const selected = value === option.type;
          return (
            <button
              key={option.type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.type)}
              className={`flex flex-col rounded-lg border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  selected ? "text-blue-700" : "text-gray-900"
                }`}
              >
                {option.label}
              </span>
              <span className="mt-1 text-xs text-gray-500">{option.hint}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default WorkerTypeToggle;
