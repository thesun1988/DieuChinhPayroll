/**
 * PhaseCountInput — number of roadmap phases field.
 *
 * Lets the owner choose how many phases the transition roadmap should span.
 * Defaults to 4. The roadmap generator may still increase the effective count
 * to keep each phase within the 15-point cash reduction cap.
 *
 * @see design.md — "InputForm"
 * @see requirements.md — Requirement 1.1, 1.4
 */

import { ErrorMessage } from "../common/ErrorMessage";

/** Smallest number of phases the user may request. */
export const MIN_PHASES = 2;
/** Largest number of phases the user may request. */
export const MAX_PHASES = 12;

/** Props for {@link PhaseCountInput}. */
export interface PhaseCountInputProps {
  /** Current phase count. Empty when undefined. */
  value: number | undefined;
  /** Invoked with the parsed numeric value (or undefined when cleared). */
  onChange: (value: number | undefined) => void;
  /** Inline validation error message (Vietnamese), if any. */
  error?: string;
  /** Field id used for label association. */
  id?: string;
}

export function PhaseCountInput({
  value,
  onChange,
  error,
  id = "numberOfPhases",
}: PhaseCountInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        Số giai đoạn chuyển đổi (Number of phases)
      </label>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="numeric"
        min={MIN_PHASES}
        max={MAX_PHASES}
        step="1"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        placeholder="4"
        className={`mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      <p className="mt-1 text-xs text-gray-500">
        Mặc định 4 giai đoạn. Hệ thống có thể tăng thêm để mỗi giai đoạn giảm
        tối đa 15% cash.
      </p>
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default PhaseCountInput;
