/**
 * InputForm — unified input form composing all calculator inputs.
 *
 * Collects every parameter needed by the tax calculator and roadmap generator:
 * monthly revenue, commission split ratio, number of workers, current cash %,
 * state, worker type (W-2/1099), and hours per week (W-2 only). On submit it
 * runs {@link validateCalculatorInput}; when valid it calls `onSubmit` with a
 * fully-typed {@link TaxInput}, otherwise it renders inline Vietnamese
 * validation errors next to the offending fields.
 *
 * Pre-fill precedence: explicit `initialValues` prop → persisted
 * `calculatorInput` from {@link AppContext} (localStorage) → sensible defaults.
 *
 * @see design.md — "InputForm" (InputFormProps: initialValues, onSubmit, onBack)
 * @see requirements.md — Requirements 2.1, 2.2, 2.11, 2.12, 4.1, 4.2
 */

import { useMemo, useState } from "react";
import type { SplitRatio, TaxInput } from "../../context/types";
import { useAppContext } from "../../context/AppContext";
import { validateCalculatorInput } from "../../utils/validators";
import { STATES } from "../../data/stateData";
import { RevenueInput } from "./RevenueInput";
import { SplitRatioInput } from "./SplitRatioInput";
import { CashPercentInput } from "./CashPercentInput";
import { StateSelector } from "./StateSelector";
import { PhaseCountInput } from "./PhaseCountInput";

/** Props for {@link InputForm}. */
export interface InputFormProps {
  /** Pre-fill values. Falls back to persisted state, then defaults. */
  initialValues?: TaxInput;
  /** Invoked with a validated {@link TaxInput} when the form is submitted. */
  onSubmit: (input: TaxInput) => void;
  /** Invoked when the user cancels / goes back. */
  onBack: () => void;
}

/**
 * Internal draft shape. Numeric fields are optional so the inputs can be
 * cleared while editing; they are required again at submit-time validation.
 */
interface FormDraft {
  monthlyRevenue: number | undefined;
  splitRatio: SplitRatio;
  currentCashPercent: number;
  state: string;
  numberOfPhases: number | undefined;
}

/** Default split when nothing is pre-filled: the common 4/6 nail-salon split. */
const DEFAULT_SPLIT: SplitRatio = { owner: 4, worker: 6 };

/** Default number of transition phases. */
const DEFAULT_NUMBER_OF_PHASES = 4;

/** Build the initial draft from props → persisted state → defaults. */
function buildInitialDraft(
  initialValues: TaxInput | undefined,
  persisted: TaxInput | null,
): FormDraft {
  const source = initialValues ?? persisted ?? null;

  if (source) {
    return {
      monthlyRevenue: source.monthlyRevenue,
      splitRatio: { ...source.splitRatio },
      currentCashPercent: source.currentCashPercent,
      state: source.state,
      numberOfPhases: source.numberOfPhases ?? DEFAULT_NUMBER_OF_PHASES,
    };
  }

  return {
    monthlyRevenue: undefined,
    splitRatio: { ...DEFAULT_SPLIT },
    currentCashPercent: 50,
    state: STATES[0]?.code ?? "AL",
    numberOfPhases: DEFAULT_NUMBER_OF_PHASES,
  };
}

/** Convert a draft into a {@link TaxInput} (with 0 fallbacks for validation). */
function draftToTaxInput(draft: FormDraft): TaxInput {
  return {
    monthlyRevenue: draft.monthlyRevenue ?? 0,
    splitRatio: draft.splitRatio,
    numberOfWorkers: 1,
    currentCashPercent: draft.currentCashPercent,
    workerType: "W2",
    state: draft.state,
    numberOfPhases: draft.numberOfPhases ?? DEFAULT_NUMBER_OF_PHASES,
  };
}

export function InputForm({ initialValues, onSubmit, onBack }: InputFormProps) {
  const { state: appState } = useAppContext();

  const [draft, setDraft] = useState<FormDraft>(() =>
    buildInitialDraft(initialValues, appState.calculatorInput),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = <K extends keyof FormDraft>(key: K, value: FormDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // Map the validator's field identifiers (see validators.ts FIELD) to the
  // first error message for each field.
  const collectErrors = useMemo(
    () =>
      (input: TaxInput): Record<string, string> => {
        const result = validateCalculatorInput(input);
        const next: Record<string, string> = {};
        for (const err of result.errors) {
          if (!next[err.field]) {
            next[err.field] = err.message;
          }
        }
        return next;
      },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = draftToTaxInput(draft);
    const found = collectErrors(input);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setErrors({});
    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Thông tin tiệm (Salon information)
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Nhập các thông số để tính toán chi phí và lộ trình chuyển đổi.
        </p>

        <div className="mt-6 space-y-6">
          <RevenueInput
            value={draft.monthlyRevenue}
            onChange={(value) => update("monthlyRevenue", value)}
            error={errors.monthlyRevenue}
          />

          <SplitRatioInput
            value={draft.splitRatio}
            onChange={(value) => update("splitRatio", value)}
            error={errors.splitRatio}
          />

          <CashPercentInput
            value={draft.currentCashPercent}
            onChange={(value) => update("currentCashPercent", value)}
            error={errors.currentCashPercent}
          />

          <PhaseCountInput
            value={draft.numberOfPhases}
            onChange={(value) => update("numberOfPhases", value)}
            error={errors.numberOfPhases}
          />

          <StateSelector
            value={draft.state}
            onChange={(value) => update("state", value)}
            error={errors.state}
          />
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Quay lại (Back)
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Tính toán (Calculate)
          </button>
        </div>
      </div>
    </form>
  );
}

export default InputForm;
