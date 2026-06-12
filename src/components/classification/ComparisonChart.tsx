/**
 * ComparisonChart — W-2 vs 1099 side-by-side comparison table.
 *
 * Presents a detailed comparison between the two worker classifications
 * across tax responsibility, benefits, and risk dimensions so the owner can
 * understand the trade-offs before choosing a classification.
 *
 * All visible text is Vietnamese (English terms in parentheses).
 *
 * @see design.md — "classification/ComparisonChart"
 * @see requirements.md — Requirement 6.1
 */

/** A single comparison row across the two classifications. */
export interface ComparisonRow {
  /** Aspect being compared (Vietnamese). */
  aspect: string;
  /** How this aspect works under W-2 (Vietnamese). */
  w2: string;
  /** How this aspect works under 1099 (Vietnamese). */
  contractor1099: string;
}

/** Default comparison content covering tax, benefits and risk. */
export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    aspect: "Người đóng thuế lương (Payroll tax)",
    w2: "Chủ tiệm withhold và đóng phần employer (Social Security, Medicare, FUTA, SUTA).",
    contractor1099:
      "Thợ tự đóng self-employment tax 15.3% (cả phần chủ và phần nhân viên).",
  },
  {
    aspect: "Khai thuế (Tax forms)",
    w2: "Chủ phát Form W-2; withhold thuế liên bang và tiểu bang mỗi kỳ lương.",
    contractor1099:
      "Chủ phát Form 1099-NEC nếu trả ≥ $600/năm; thợ tự nộp thuế ước tính hàng quý (quarterly estimated tax).",
  },
  {
    aspect: "Lương tối thiểu & giờ phụ trội (Minimum wage / overtime)",
    w2: "Phải tuân thủ lương tối thiểu và overtime theo luật liên bang/tiểu bang.",
    contractor1099:
      "Không áp dụng lương tối thiểu hay overtime — thợ tự định giá dịch vụ.",
  },
  {
    aspect: "Quyền lợi (Benefits)",
    w2: "Có thể nhận bảo hiểm, nghỉ phép có lương, bồi thường lao động (workers' comp).",
    contractor1099:
      "Thường không có phúc lợi; thợ tự lo bảo hiểm và các chi phí của mình.",
  },
  {
    aspect: "Mức kiểm soát (Control)",
    w2: "Chủ kiểm soát lịch làm việc, quy trình, dụng cụ và cách thực hiện công việc.",
    contractor1099:
      "Thợ tự chủ về giờ giấc, phương pháp, dụng cụ và khách hàng.",
  },
  {
    aspect: "Rủi ro pháp lý (Legal risk)",
    w2: "Rủi ro thấp hơn về misclassification; chi phí nhân công cao hơn cho chủ.",
    contractor1099:
      "Rủi ro cao nếu phân loại sai — IRS và bộ lao động bang nhắm mạnh vào ngành nail.",
  },
];

/** Props for {@link ComparisonChart}. */
export interface ComparisonChartProps {
  /** Override the comparison rows (defaults to {@link COMPARISON_ROWS}). */
  rows?: ComparisonRow[];
}

export function ComparisonChart({
  rows = COMPARISON_ROWS,
}: ComparisonChartProps) {
  return (
    <section
      aria-labelledby="comparison-chart-heading"
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h3
        id="comparison-chart-heading"
        className="text-lg font-semibold text-gray-900"
      >
        So sánh W-2 và 1099 (W-2 vs 1099 comparison)
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Bảng so sánh trách nhiệm thuế, quyền lợi và rủi ro giữa hai hình thức
        lao động.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead>
            <tr>
              <th scope="col" className="py-3 pr-4 font-semibold text-gray-900">
                Khía cạnh (Aspect)
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-blue-700">
                W-2 (Nhân viên)
              </th>
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-emerald-700"
              >
                1099 (Thầu độc lập)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.aspect} className="align-top">
                <th scope="row" className="py-3 pr-4 font-medium text-gray-900">
                  {row.aspect}
                </th>
                <td className="px-4 py-3 text-gray-700">{row.w2}</td>
                <td className="px-4 py-3 text-gray-700">
                  {row.contractor1099}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ComparisonChart;
