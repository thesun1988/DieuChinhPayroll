/**
 * HoursPerWeekInput — hours per week field (W-2 minimum-wage check).
 *
 * Captures the typical hours a worker works per week, used to convert their
 * gross income into an hourly rate for the federal minimum-wage check. Only
 * relevant for W-2 workers, so the parent form conditionally renders it.
 *
 * @see design.md — "InputForm", "Minimum Wage Check (W-2 only)"
 * @see requirements.md — Requirement 2.10
 */

import { ErrorMessage } from "../common/ErrorMessage";

/** Props for {@link HoursPerWeekInput}. */
export interface HoursPerWeekInputProps {
  /** Current hours per week. Empty when undefined. */
  value: number | undefined;
  /** Invoked with the parsed numeric value (or undefined when cleared). */
  onChange: (value: number | undefined) => void;
  /** Inline validation error message (Vietnamese), if any. */
  error?: string;
  /** Field id used for label association. */
  id?: string;
}

export function HoursPerWeekInput({
  value,
  onChange,
  error,
  id = "hoursPerWeek",
}: HoursPerWeekInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        Số giờ làm/tuần (Hours per week)
      </label>
      <p className="mt-1 text-xs text-gray-500">
        Dùng để kiểm tra mức lương tối thiểu liên bang ($7.25/giờ).
      </p>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={168}
        step="1"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        placeholder="40"
        className={`mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default HoursPerWeekInput;
