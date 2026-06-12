/**
 * TipReportingNote — guidance on reporting tips correctly to the IRS.
 *
 * Tips are taxable income. This note reminds the salon owner how to record and
 * report tips so that payroll figures stay consistent and audit-safe. All text
 * is in Vietnamese.
 *
 * @see design.md — "TipReportingNote"
 * @see requirements.md — Requirement 3.5 (tip reporting guidance)
 */

export function TipReportingNote() {
  return (
    <div
      className="rounded-lg border border-blue-200 bg-blue-50 p-4"
      role="note"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-xl leading-none">
          💡
        </span>
        <div>
          <h4 className="text-base font-semibold text-blue-900">
            Hướng dẫn khai báo tiền tip (Tip Reporting)
          </h4>
          <p className="mt-1 text-sm text-blue-800">
            Tiền tip là thu nhập chịu thuế. Việc không khai báo hoặc khai thiếu
            tip là một trong những dấu hiệu IRS dễ phát hiện qua đối chiếu doanh
            thu thẻ tín dụng.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-blue-800">
            <li>
              Yêu cầu thợ ghi nhận tip hàng ngày (Form 4070 hoặc sổ tip riêng).
            </li>
            <li>
              Khai báo tip trên W-2 (ô 7) và đóng thuế Social Security/Medicare
              trên phần tip.
            </li>
            <li>
              Với tiệm có nhiều thợ, cân nhắc nộp Form 8027 và áp dụng tip phân
              bổ (allocated tips) đúng quy định.
            </li>
            <li>Lưu giữ hồ sơ tip tối thiểu 4 năm để giải trình khi cần.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TipReportingNote;
