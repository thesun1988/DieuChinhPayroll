/**
 * StateSelector — US state dropdown.
 *
 * Selects the state whose SUTA and state income tax rates apply. Options come
 * from `data/stateData.ts` (all 50 states + DC), labelled with the Vietnamese
 * name and the 2-letter code.
 *
 * @see design.md — "InputForm"
 * @see requirements.md — Requirement 2.11
 */

import { STATES } from "../../data/stateData";
import { ErrorMessage } from "../common/ErrorMessage";

/** Props for {@link StateSelector}. */
export interface StateSelectorProps {
  /** Currently selected 2-letter state code. */
  value: string;
  /** Invoked with the newly selected state code. */
  onChange: (value: string) => void;
  /** Inline validation error message (Vietnamese), if any. */
  error?: string;
  /** Field id used for label association. */
  id?: string;
}

export function StateSelector({
  value,
  onChange,
  error,
  id = "state",
}: StateSelectorProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        Tiểu bang (State)
      </label>
      <p className="mt-1 text-xs text-gray-500">
        Dùng để áp dụng thuế SUTA và thuế thu nhập tiểu bang.
      </p>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      >
        {STATES.map((state) => (
          <option key={state.code} value={state.code}>
            {state.nameVi} ({state.code})
          </option>
        ))}
      </select>
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default StateSelector;
