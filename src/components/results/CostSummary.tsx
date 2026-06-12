/**
 * CostSummary — before/after cost comparison.
 *
 * Shows the employer's payroll cost before vs. after the transition to 100%
 * check, the additional monthly/yearly cost, and the worker take-home pay
 * before vs. after. When a {@link Roadmap} is supplied, it also renders a
 * per-phase projection of the employer cost as the cash percentage decreases
 * (Requirement 2.7 — "so sánh chi phí ... theo từng giai đoạn của Lộ_Trình").
 *
 * All visible labels are in Vietnamese with English terms in parentheses
 * (Requirement 4.2). Amounts are formatted as USD (Requirement 4.3).
 *
 * @see design.md — Results View / ComparisonSection
 * @see requirements.md — Requirements 2.7, 2.8
 */

import type { Roadmap, TaxInput, TaxResult } from "../../context/types";
import { calculateTax } from "../../utils/taxCalculator";
import { formatPercent, formatUSD } from "../../utils/formatters";

/** Props for {@link CostSummary}. */
export interface CostSummaryProps {
  /** The user's calculator input (drives per-phase recomputation). */
  input: TaxInput;
  /** The calculated result for the current input. */
  result: TaxResult;
  /** Optional transition roadmap for per-phase cost projection. */
  roadmap?: Roadmap;
}

export function CostSummary({ input, result, roadmap }: CostSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Before / after summary */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-900">
              <th scope="col" className="px-4 py-2 font-semibold">
                Khoản mục (Item)
              </th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">
                Hiện tại (Before)
              </th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">
                Sau chuyển đổi (After)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="px-4 py-2 text-gray-600">
                Chi phí chủ tiệm / tháng (Employer cost / month)
              </td>
              <td className="px-4 py-2 text-right font-medium text-gray-900">
                {formatUSD(result.currentEmployerCostPerMonth)}
              </td>
              <td className="px-4 py-2 text-right font-medium text-gray-900">
                {formatUSD(result.projectedEmployerCostPerMonth)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-600">
                Thu nhập thực nhận của thợ / tháng (Worker take-home / month)
              </td>
              <td className="px-4 py-2 text-right font-medium text-gray-900">
                {formatUSD(result.currentWorkerTakeHome)}
              </td>
              <td className="px-4 py-2 text-right font-medium text-gray-900">
                {formatUSD(result.projectedWorkerTakeHome)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional cost highlight */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            Chi phí tăng thêm / tháng (Additional cost / month)
          </p>
          <p className="mt-1 text-xl font-semibold text-blue-900">
            {formatUSD(result.additionalCostPerMonth)}
          </p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            Chi phí tăng thêm / năm (Additional cost / year)
          </p>
          <p className="mt-1 text-xl font-semibold text-blue-900">
            {formatUSD(result.additionalCostPerYear)}
          </p>
        </div>
      </div>

      {/* Per-phase projection */}
      {roadmap && roadmap.phases.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-900">
                <th scope="col" className="px-4 py-2 font-semibold">
                  Giai đoạn (Phase)
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  Tỉ lệ check (Check %)
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  Chi phí chủ / tháng (Employer cost / month)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roadmap.phases.map((phase) => {
                const phaseResult = calculateTax({
                  ...input,
                  currentCashPercent: phase.cashPercent,
                });
                return (
                  <tr key={phase.phaseNumber}>
                    <td className="px-4 py-2 text-gray-600">
                      Giai đoạn {phase.phaseNumber}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {formatPercent(phase.checkPercent)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                      {formatUSD(phaseResult.currentEmployerCostPerMonth)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CostSummary;
