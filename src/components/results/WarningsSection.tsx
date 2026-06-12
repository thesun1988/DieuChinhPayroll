/**
 * WarningsSection — IRS red flags and warnings tailored to the user's input.
 *
 * Selects which red flags to surface based on the calculation input and
 * result, then renders them as {@link RedFlagCard}s alongside tip reporting
 * guidance and (for W-2) a minimum wage violation alert. A persistent
 * disclaimer reminds the owner to consult a CPA / tax attorney.
 *
 * All visible text is in Vietnamese.
 *
 * @see design.md — "WarningsSection" / "WarningSectionProps"
 * @see requirements.md — Requirement 3.1–3.6, 2.10
 */

import type { Roadmap, TaxInput, TaxResult } from "../../context/types";
import { RED_FLAGS, type RedFlag } from "../../data/redFlags";
import { MinimumWageWarning } from "./MinimumWageWarning";
import { RedFlagCard } from "./RedFlagCard";
import { TipReportingNote } from "./TipReportingNote";

/** Props for {@link WarningsSection}. */
export interface WarningSectionProps {
  input: TaxInput;
  taxResult: TaxResult;
  roadmap: Roadmap;
}

/** Severity ordering used to sort the most urgent flags first. */
const SEVERITY_ORDER: Record<RedFlag["severity"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/**
 * Decide which red flags are relevant to the current input/result.
 *
 * - Transition-related flags are always relevant (the user is transitioning).
 * - W-2-only flags (below minimum wage) are excluded for 1099.
 * - The 1099-NEC filing flag is only relevant when filing is actually required.
 */
export function selectRelevantRedFlags(
  input: TaxInput,
  taxResult: TaxResult,
): RedFlag[] {
  const flags = RED_FLAGS.filter((flag) => {
    // Minimum wage applies to W-2 workers only, and only when violated.
    if (flag.id === "below-minimum-wage") {
      return input.workerType === "W2" && taxResult.minimumWageViolation;
    }

    // 1099-NEC filing flag only when a 1099 worker crosses the $600 threshold.
    if (flag.id === "mismatched-1099") {
      return input.workerType === "1099" && taxResult.form1099Required;
    }

    // Worker misclassification is most relevant when using 1099.
    if (flag.id === "worker-misclassification") {
      return input.workerType === "1099";
    }

    // Otherwise surface flags tied to the cash → check transition.
    return flag.relatedToTransition;
  });

  return flags.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
}

export function WarningsSection({ input, taxResult }: WarningSectionProps) {
  const relevantFlags = selectRelevantRedFlags(input, taxResult);
  const showMinimumWageWarning =
    input.workerType === "W2" && taxResult.minimumWageViolation;

  return (
    <section aria-labelledby="warnings-heading" className="space-y-4">
      <div>
        <h2 id="warnings-heading" className="text-xl font-bold text-gray-900">
          Khuyến cáo & Cảnh báo IRS
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Các dấu hiệu bất thường (red flag) cần lưu ý khi chuyển đổi, kèm hướng
          dẫn phòng tránh.
        </p>
      </div>

      {showMinimumWageWarning && <MinimumWageWarning visible />}

      <div className="space-y-3">
        {relevantFlags.map((flag) => (
          <RedFlagCard key={flag.id} redFlag={flag} />
        ))}
      </div>

      <TipReportingNote />

      <p className="rounded-md bg-gray-100 p-3 text-xs text-gray-600">
        Lưu ý: nội dung chỉ mang tính tham khảo, không cấu thành tư vấn thuế hay
        pháp lý. Hãy tham vấn CPA hoặc luật sư thuế trước khi đưa ra quyết định.
      </p>
    </section>
  );
}

export default WarningsSection;
