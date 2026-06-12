/**
 * MinimumWageWarning — minimum wage violation alert (W-2 only).
 *
 * Shown when a W-2 worker's commission-split income, converted to an hourly
 * rate, falls below the federal minimum wage ($7.25/hour). This is both an FLSA
 * labor-law risk and an IRS red flag. All text is in Vietnamese.
 *
 * The component renders nothing unless {@link MinimumWageWarningProps.visible}
 * is true, so callers can pass `taxResult.minimumWageViolation` directly.
 *
 * @see design.md — "MinimumWageWarning"
 * @see requirements.md — Requirement 2.10 (minimum wage warning, W-2 only)
 */

/** Federal minimum wage used for the violation check (2024). */
const FEDERAL_MINIMUM_WAGE = 7.25;

/** Props for {@link MinimumWageWarning}. */
export interface MinimumWageWarningProps {
  /** Whether a violation was detected (e.g. `taxResult.minimumWageViolation`). */
  visible: boolean;
}

export function MinimumWageWarning({ visible }: MinimumWageWarningProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-xl leading-none">
          ⚠️
        </span>
        <div>
          <h4 className="text-base font-semibold text-red-900">
            Cảnh báo vi phạm lương tối thiểu (Minimum Wage)
          </h4>
          <p className="mt-1 text-sm text-red-800">
            Phần ăn chia của thợ quy đổi theo giờ đang thấp hơn mức lương tối
            thiểu liên bang (${FEDERAL_MINIMUM_WAGE.toFixed(2)}/giờ). Với hình
            thức W-2, đây là vi phạm luật lao động (FLSA) và là dấu hiệu khai
            báo lương không nhất quán cho IRS.
          </p>
          <p className="mt-2 text-sm font-medium text-red-800">
            Khuyến nghị: tiệm phải bù thêm (true-up) để bảo đảm thợ W-2 luôn
            nhận ít nhất mức lương tối thiểu cho mỗi giờ làm. Nếu bang có mức
            tối thiểu cao hơn liên bang, áp dụng mức của bang.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MinimumWageWarning;
