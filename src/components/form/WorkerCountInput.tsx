/**
 * WorkerCountInput — number of workers field.
 *
 * Collects how many workers (thợ) the salon employs. Must be a positive
 * integer; validation is surfaced via the `error` prop.
 *
 * @see design.md — "InputForm"
 * @see requirements.md — Requirement 2.1
 */

import { ErrorMessage } from "../common/ErrorMessage";

/** Props for {@link WorkerCountInput}. */
export interface WorkerCountInputProps {
  /** Current worker count. Empty when undefined. */
  value: number | undefined;
  /** Invoked with the parsed numeric value (or undefined when cleared). */
  onChange: (value: number | undefined) => void;
  /** Inline validation error message (Vietnamese), if any. */
  error?: string;
  /** Field id used for label association. */
  id?: string;
}

export function WorkerCountInput({
  value,
  onChange,
  error,
  id = "numberOfWorkers",
}: WorkerCountInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        Số thợ (Number of workers)
      </label>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="numeric"
        min={1}
        step="1"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        placeholder="1"
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

export default WorkerCountInput;
