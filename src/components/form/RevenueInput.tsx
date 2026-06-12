/**
 * RevenueInput — monthly revenue field.
 *
 * Collects the salon's average monthly revenue (doanh thu trung bình hàng
 * tháng) used to derive the worker's gross income. Renders an inline
 * validation error when one is supplied.
 *
 * @see design.md — "InputForm"
 * @see requirements.md — Requirement 2.1
 */

import { ErrorMessage } from "../common/ErrorMessage";

/** Props for {@link RevenueInput}. */
export interface RevenueInputProps {
  /** Current revenue value (USD per month). Empty when undefined. */
  value: number | undefined;
  /** Invoked with the parsed numeric value (or undefined when cleared). */
  onChange: (value: number | undefined) => void;
  /** Inline validation error message (Vietnamese), if any. */
  error?: string;
  /** Field id used for label association. */
  id?: string;
}

export function RevenueInput({
  value,
  onChange,
  error,
  id = "monthlyRevenue",
}: RevenueInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        Doanh thu trung bình hàng tháng (Monthly revenue)
      </label>
      <p className="mt-1 text-xs text-gray-500">
        Tổng doanh thu tiệm trước khi chia cho thợ.
      </p>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          $
        </span>
        <input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={value ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? undefined : Number(raw));
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder="0.00"
          className={`w-full rounded-lg border bg-white py-2 pl-7 pr-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
      </div>
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default RevenueInput;
