/**
 * ComparisonSection — side-by-side W-2 vs 1099 comparison.
 *
 * Renders a high-level comparison table of the key figures for the W-2 and
 * 1099 scenarios (employer cost, worker take-home, additional cost) followed
 * by the detailed tax breakdown for each classification.
 *
 * All visible labels are in Vietnamese with English terms in parentheses
 * (Requirement 4.2). Amounts are formatted as USD (Requirement 4.3).
 *
 * @see design.md — "ComparisonSection"
 * @see requirements.md — Requirements 2.3, 2.4, 2.5, 2.7, 2.8
 */

import type { TaxInput, TaxResult } from "../../context/types";
import { formatUSD } from "../../utils/formatters";
import TaxBreakdown from "./TaxBreakdown";

/** Props for {@link ComparisonSection}. */
export interface ComparisonSectionProps {
  /** Result computed with the W-2 classification. */
  w2Result: TaxResult;
  /** Result computed with the 1099 classification. */
  result1099: TaxResult;
  /** The user's calculator input. */
  input: TaxInput;
}

/** A comparison row: a label and the W-2 / 1099 values. */
interface CompareRow {
  label: string;
  w2: number;
  v1099: number;
}

export function ComparisonSection({
  w2Result,
  result1099,
  input,
}: ComparisonSectionProps) {
  const rows: CompareRow[] = [
    {
      label: "Chi phí chủ tiệm / tháng (Employer cost / month)",
      w2: w2Result.projectedEmployerCostPerMonth,
      v1099: result1099.projectedEmployerCostPerMonth,
    },
    {
      label: "Thu nhập thực nhận của thợ / tháng (Worker take-home / month)",
      w2: w2Result.projectedWorkerTakeHome,
      v1099: result1099.projectedWorkerTakeHome,
    },
    {
      label: "Chi phí tăng thêm / năm (Additional cost / year)",
      w2: w2Result.additionalCostPerYear,
      v1099: result1099.additionalCostPerYear,
    },
  ];

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">
          So sánh W-2 và 1099 (W-2 vs 1099 Comparison)
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          So sánh chi phí và thuế giữa hai hình thức lao động để chọn phương án
          phù hợp.
        </p>
      </header>

      {/* Side-by-side summary table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-900">
              <th scope="col" className="px-4 py-2 font-semibold">
                Khoản mục (Item)
              </th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">
                W-2 (Employee)
              </th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">
                1099 (Contractor)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-4 py-2 text-gray-600">{row.label}</td>
                <td className="px-4 py-2 text-right font-medium text-gray-900">
                  {formatUSD(row.w2)}
                </td>
                <td className="px-4 py-2 text-right font-medium text-gray-900">
                  {formatUSD(row.v1099)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">
            Chi tiết thuế W-2 (W-2 Tax Detail)
          </h3>
          <TaxBreakdown result={w2Result} workerType="W2" />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">
            Chi tiết thuế 1099 (1099 Tax Detail)
          </h3>
          <TaxBreakdown result={result1099} workerType="1099" />
        </div>
      </div>

      {/* 1099 reporting note (Requirement 2.6 context) */}
      {result1099.form1099Required && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Lưu ý: Với hình thức 1099, chủ tiệm không cần withhold thuế nhưng phải
          nộp Form 1099-NEC nếu trả từ $600 trở lên trong năm cho mỗi thợ.
        </p>
      )}

      <p className="text-xs text-gray-500">
        Tính toán dựa trên doanh thu hàng tháng{" "}
        {formatUSD(input.monthlyRevenue)} và tỉ lệ ăn chia{" "}
        {input.splitRatio.owner}/{input.splitRatio.worker}.
      </p>
    </section>
  );
}

export default ComparisonSection;
