/**
 * DisclaimerBanner — persistent reminder to consult a CPA / tax attorney.
 *
 * Requirements 3.7 and 7.2 require a banner, visible on every flow step,
 * reminding the owner that the site is informational only and that they should
 * consult a tax professional before making financial decisions.
 *
 * The component takes no props — it is always visible (see design.md
 * "DisclaimerBanner" interface).
 *
 * @see requirements.md — Requirements 3.7, 7.2
 */

/** Persistent banner reminding users to consult a tax professional. */
export default function DisclaimerBanner() {
  return (
    <div
      role="note"
      className="border-b border-amber-200 bg-amber-50 text-amber-900"
    >
      <div className="mx-auto flex max-w-4xl items-start gap-2 px-4 py-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="mt-0.5 shrink-0"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-xs leading-relaxed sm:text-sm">
          Thông tin trên website chỉ mang tính tham khảo, không phải tư vấn tài
          chính, thuế, hoặc pháp lý. Vui lòng tham vấn chuyên gia kế toán (CPA)
          hoặc luật sư thuế (tax attorney) trước khi đưa ra quyết định.
        </p>
      </div>
    </div>
  );
}
