/**
 * TaxBreakdown — detailed tax breakdown table for a single worker type.
 *
 * Renders the relevant tax line items for the projected (100% check) scenario:
 * - W-2: employer taxes (Social Security, Medicare, FUTA, SUTA) and employee
 *   taxes (Federal Income, State Income, Social Security, Medicare).
 * - 1099: self-employment tax and estimated quarterly tax.
 *
 * All visible labels are in Vietnamese with the original English term in
 * parentheses (Requirement 4.2). Amounts are formatted as USD (Requirement 4.3).
 *
 * @see design.md — "ComparisonSection" / Results View
 * @see requirements.md — Requirements 2.3, 2.4, 2.5
 */

import type { TaxResult, WorkerType } from "../../context/types";
import { formatUSD } from "../../utils/formatters";

/** Props for {@link TaxBreakdown}. */
export interface TaxBreakdownProps {
  /** The calculated tax result to display. */
  result: TaxResult;
  /** Worker classification determining which breakdown to render. */
  workerType: WorkerType;
}

/** A single labelled amount row in a breakdown table. */
interface BreakdownRow {
  label: string;
  amount: number;
}

function BreakdownTable({
  title,
  rows,
  total,
}: {
  title: string;
  rows: BreakdownRow[];
  total: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th
              scope="col"
              colSpan={2}
              className="px-4 py-2 text-left font-semibold text-gray-900"
            >
              {title}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-4 py-2 text-gray-600">{row.label}</td>
              <td className="px-4 py-2 text-right font-medium text-gray-900">
                {formatUSD(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 bg-gray-50">
            <td className="px-4 py-2 font-semibold text-gray-900">
              Tổng cộng (Total)
            </td>
            <td className="px-4 py-2 text-right font-semibold text-gray-900">
              {formatUSD(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function TaxBreakdown({ result, workerType }: TaxBreakdownProps) {
  if (workerType === "W2") {
    const { employerTaxes, employeeTaxes } = result;
    return (
      <div className="space-y-4">
        {employerTaxes && (
          <BreakdownTable
            title="Thuế chủ tiệm đóng (Employer Taxes)"
            total={employerTaxes.total}
            rows={[
              {
                label: "An sinh xã hội (Social Security)",
                amount: employerTaxes.socialSecurity,
              },
              {
                label: "Bảo hiểm y tế (Medicare)",
                amount: employerTaxes.medicare,
              },
              {
                label: "Thất nghiệp liên bang (FUTA)",
                amount: employerTaxes.futa,
              },
              {
                label: "Thất nghiệp tiểu bang (SUTA)",
                amount: employerTaxes.suta,
              },
            ]}
          />
        )}
        {employeeTaxes && (
          <BreakdownTable
            title="Thuế thợ đóng (Employee Taxes)"
            total={employeeTaxes.total}
            rows={[
              {
                label: "Thuế thu nhập liên bang (Federal Income Tax)",
                amount: employeeTaxes.federalIncome,
              },
              {
                label: "Thuế thu nhập tiểu bang (State Income Tax)",
                amount: employeeTaxes.stateIncome,
              },
              {
                label: "An sinh xã hội (Social Security)",
                amount: employeeTaxes.socialSecurity,
              },
              {
                label: "Bảo hiểm y tế (Medicare)",
                amount: employeeTaxes.medicare,
              },
            ]}
          />
        )}
      </div>
    );
  }

  const { selfEmploymentTaxes } = result;
  if (!selfEmploymentTaxes) return null;

  return (
    <div className="space-y-4">
      <BreakdownTable
        title="Thuế tự kinh doanh (Self-Employment Taxes)"
        total={selfEmploymentTaxes.total}
        rows={[
          {
            label: "Thuế tự kinh doanh (Self-Employment Tax)",
            amount: selfEmploymentTaxes.selfEmploymentTax,
          },
          {
            label: "Thuế tạm tính hàng quý (Estimated Quarterly Tax)",
            amount: selfEmploymentTaxes.estimatedQuarterlyTax,
          },
        ]}
      />
    </div>
  );
}

export default TaxBreakdown;
