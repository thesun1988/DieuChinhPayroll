/**
 * DisclaimerPopup — action-triggered legal disclaimer modal.
 *
 * Shown when the user clicks a "Bắt đầu" CTA on a feature card and the
 * disclaimer has not yet been accepted (see {@link FlowContext} —
 * `START_FEATURE`). The user must explicitly accept before continuing to the
 * input form; rejecting returns them to the landing page.
 *
 * Accepting persists the acknowledgement to `localStorage` via
 * {@link saveDisclaimerAccepted} so returning visitors are not re-prompted,
 * then invokes `onAccept`. The persistence call is idempotent, so it is safe
 * even when the parent's `onAccept` handler also mirrors acceptance into
 * storage (as the default `FlowContext` dispatch does).
 *
 * @see design.md — "DisclaimerPopup"
 * @see requirements.md — Requirements 7.1, 7.2, 7.3, 7.4
 */

import { saveDisclaimerAccepted } from "../../utils/storage";

/** Props for {@link DisclaimerPopup}. */
export interface DisclaimerPopupProps {
  /** Whether the popup is currently visible. */
  isVisible: boolean;
  /** Invoked after the user accepts the disclaimer. */
  onAccept: () => void;
  /** Invoked when the user rejects / dismisses the disclaimer. */
  onReject: () => void;
}

/** Action-triggered disclaimer modal requiring explicit acknowledgement. */
export default function DisclaimerPopup({
  isVisible,
  onAccept,
  onReject,
}: DisclaimerPopupProps) {
  if (!isVisible) {
    return null;
  }

  const handleAccept = () => {
    // Persist acknowledgement so returning visitors skip the gate. Idempotent.
    saveDisclaimerAccepted(true);
    onAccept();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onReject}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-popup-title"
        aria-describedby="disclaimer-popup-body"
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="disclaimer-popup-title"
          className="text-lg font-bold text-gray-900"
        >
          Miễn trừ trách nhiệm (Disclaimer)
        </h2>

        <div
          id="disclaimer-popup-body"
          className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700"
        >
          <p>
            Mọi thông tin và kết quả tính toán trên website này chỉ mang tính
            chất tham khảo (for informational purposes only) và{" "}
            <strong>
              không cấu thành tư vấn tài chính, thuế, hoặc pháp lý
            </strong>{" "}
            (does not constitute financial, tax, or legal advice).
          </p>
          <p>
            Bạn nên tham vấn chuyên gia kế toán (CPA - Certified Public
            Accountant) hoặc luật sư thuế (tax attorney) trước khi đưa ra bất kỳ
            quyết định tài chính nào.
          </p>
          <p>
            Website không chịu trách nhiệm pháp lý về bất kỳ tổn thất hoặc hậu
            quả nào (any loss or consequences) phát sinh từ việc sử dụng thông
            tin trên website.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onReject}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Từ chối (Reject)
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Tôi đã đọc và đồng ý (Accept)
          </button>
        </div>
      </div>
    </div>
  );
}
