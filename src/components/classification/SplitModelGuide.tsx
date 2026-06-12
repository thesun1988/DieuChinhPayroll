/**
 * SplitModelGuide — commission split ("Ăn Chia") model explanation.
 *
 * Explains the commission-split model common in nail salons (e.g. owner 4 /
 * worker 6) and how to report taxes correctly for it. Also offers a
 * classification suggestion based on how much control the owner retains,
 * supporting Requirement 6.5.
 *
 * All visible text is Vietnamese (English terms in parentheses).
 *
 * @see design.md — "classification/SplitModelGuide"
 * @see requirements.md — Requirements 6.4, 6.5
 */

/** A common commission-split example. */
export interface SplitExample {
  /** Label for the split (Vietnamese). */
  label: string;
  /** Owner's share, percent (0-100). */
  ownerPercent: number;
  /** Worker's share, percent (0-100). */
  workerPercent: number;
  /** Short note about this split (Vietnamese). */
  note: string;
}

/** Typical commission splits seen in the nail industry. */
export const SPLIT_EXAMPLES: SplitExample[] = [
  {
    label: "Chủ 4 / Thợ 6 (40/60)",
    ownerPercent: 40,
    workerPercent: 60,
    note: "Phổ biến nhất: thợ giữ 60% doanh thu dịch vụ, chủ giữ 40%.",
  },
  {
    label: "Chủ 5 / Thợ 5 (50/50)",
    ownerPercent: 50,
    workerPercent: 50,
    note: "Chia đều; thường gặp khi chủ cung cấp toàn bộ dụng cụ và khách.",
  },
  {
    label: "Chủ 3 / Thợ 7 (30/70)",
    ownerPercent: 30,
    workerPercent: 70,
    note: "Thợ giữ phần lớn hơn, thường khi thợ tự mang khách hoặc tay nghề cao.",
  },
];

export function SplitModelGuide() {
  return (
    <section
      aria-labelledby="split-model-guide-heading"
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h3
        id="split-model-guide-heading"
        className="text-lg font-semibold text-gray-900"
      >
        Mô hình Ăn Chia trong ngành nail (Commission split model)
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Mô hình Ăn Chia là cách chia doanh thu mỗi dịch vụ giữa chủ tiệm và thợ
        theo một tỷ lệ thỏa thuận.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SPLIT_EXAMPLES.map((example) => (
          <div
            key={example.label}
            className="rounded-lg border border-gray-200 p-4"
          >
            <p className="text-sm font-semibold text-gray-900">
              {example.label}
            </p>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="bg-blue-500"
                style={{ width: `${example.ownerPercent}%` }}
                aria-hidden="true"
              />
              <div
                className="bg-emerald-500"
                style={{ width: `${example.workerPercent}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Chủ {example.ownerPercent}% · Thợ {example.workerPercent}%
            </p>
            <p className="mt-2 text-xs text-gray-600">{example.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900">
            Khai thuế đúng cho mô hình Ăn Chia (Reporting taxes correctly)
          </h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            <li>
              Ghi nhận tổng doanh thu dịch vụ (gross revenue) trước khi chia, kể
              cả phần khách trả tiền mặt (cash).
            </li>
            <li>
              Nếu thợ là <strong>W-2</strong>: phần ăn chia của thợ là tiền
              lương — chủ phải withhold thuế và đóng employer taxes, phát Form
              W-2.
            </li>
            <li>
              Nếu thợ là <strong>1099</strong>: phần ăn chia là thu nhập của nhà
              thầu — chủ phát Form 1099-NEC khi trả ≥ $600/năm, thợ tự nộp
              self-employment tax.
            </li>
            <li>
              Giữ hồ sơ rõ ràng cho mỗi giao dịch và tỷ lệ chia để chứng minh
              khi IRS kiểm tra (audit).
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="text-sm font-semibold text-blue-900">
            Mô hình Ăn Chia nên dùng W-2 hay 1099? (Which classification?)
          </h4>
          <p className="mt-1 text-xs text-blue-800">
            Bản thân tỷ lệ ăn chia không quyết định phân loại. IRS xét mức độ
            kiểm soát của chủ tiệm:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-blue-800">
            <li>
              Chủ kiểm soát chặt (ấn định giờ giấc, cung cấp dụng cụ, hướng dẫn
              cách làm) → nghiêng về <strong>W-2</strong>.
            </li>
            <li>
              Thợ tự chủ cao (tự định giờ, tự mang khách, thuê booth, tự lo dụng
              cụ) → có thể là <strong>1099</strong>.
            </li>
          </ul>
          <p className="mt-2 text-xs text-blue-800">
            Dùng checklist phân loại ở trên để có đề xuất cụ thể, và tham vấn
            CPA hoặc luật sư thuế khi không chắc chắn.
          </p>
        </div>
      </div>
    </section>
  );
}

export default SplitModelGuide;
