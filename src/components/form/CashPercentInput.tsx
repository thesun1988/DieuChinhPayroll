/**
 * CashPercentInput — current cash percentage slider + number input (0-100).
 *
 * Captures what share of the worker's pay is currently delivered as cash. The
 * slider and the number input are kept in sync; both clamp into [0, 100].
 *
 * @see design.md — "InputForm"
 * @see requirements.md — Requirements 2.1, 1.5
 */

import { ErrorMessage } from "../common/ErrorMessage";

/** Props for {@link CashPercentInput}. */
export interface CashPercentInputProps {
  /** Current cash percentage (0-100). */
  value: number;
  /** Invoked with the new percentage. */
  onChange: (value: number) => void;
  /** Inline validation error message (Vietnamese), if any. */
  error?: string;
  /** Field id used for label association. */
  id?: string;
}

export function CashPercentInput({
  value,
  onChange,
  error,
  id = "currentCashPercent",
}: CashPercentInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        Tỉ lệ cash hiện tại (Current cash percentage)
      </label>
      <p className="mt-1 text-xs text-gray-500">
        Phần trăm thu nhập của thợ đang được trả bằng tiền mặt.
      </p>

      <div className="mt-3 flex items-center gap-4">
        <input
          id={`${id}-slider`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Thanh trượt phần trăm tiền mặt (Cash percentage slider)"
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600"
        />
        <div className="relative w-24">
          <input
            id={id}
            name={id}
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`w-full rounded-lg border bg-white py-2 pl-3 pr-7 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
              error
                ? "border-red-400 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            %
          </span>
        </div>
      </div>

      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default CashPercentInput;
