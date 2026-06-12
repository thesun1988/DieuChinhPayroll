/**
 * DisclaimerPage — full legal disclaimer content, rendered as an overlay.
 *
 * Accessible from the Disclaimer link in the {@link Footer} / {@link MobileMenu}
 * (modeled via the `showDisclaimerPage` flag in {@link FlowContext}). Unlike
 * {@link DisclaimerPopup}, this page is purely informational — it does not gate
 * the flow and is dismissed with a close button.
 *
 * The close handler defaults to dispatching `SHOW_DISCLAIMER_PAGE { show: false }`
 * but can be overridden via props to keep the component easy to test in
 * isolation.
 *
 * @see design.md — "Project Structure" (components/disclaimer/DisclaimerPage.tsx)
 * @see requirements.md — Requirements 7.1, 7.2, 7.3, 7.5, 7.6
 */

import { useFlow } from "../../context/FlowContext";

/** Props for {@link DisclaimerPage}. */
export interface DisclaimerPageProps {
  /**
   * Invoked when the page is closed. Defaults to dispatching
   * `SHOW_DISCLAIMER_PAGE { show: false }` on the flow reducer.
   */
  onClose?: () => void;
}

/** Full disclaimer content rendered as a dismissible overlay. */
export default function DisclaimerPage({ onClose }: DisclaimerPageProps) {
  const { dispatch } = useFlow();

  const handleClose =
    onClose ?? (() => dispatch({ type: "SHOW_DISCLAIMER_PAGE", show: false }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-page-title"
        className="my-8 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h1
            id="disclaimer-page-title"
            className="text-2xl font-bold text-gray-900"
          >
            Miễn trừ trách nhiệm (Disclaimer)
          </h1>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng cửa sổ (Close dialog)"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-base font-semibold text-gray-900">
              Chỉ mang tính tham khảo (Informational purposes only)
            </h2>
            <p className="mt-2">
              Mọi thông tin, công cụ tính toán, lộ trình chuyển đổi, và khuyến
              cáo trên website này chỉ mang tính chất tham khảo và{" "}
              <strong>
                không cấu thành tư vấn tài chính, thuế, hoặc pháp lý
              </strong>{" "}
              (does not constitute financial, tax, or legal advice). Các con số
              tính toán dựa trên giả định đơn giản hóa và có thể không phản ánh
              chính xác tình huống cụ thể của bạn.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">
              Tham vấn chuyên gia (Consult a professional)
            </h2>
            <p className="mt-2">
              Bạn nên tham vấn chuyên gia kế toán (CPA - Certified Public
              Accountant) hoặc luật sư thuế (tax attorney) có giấy phép hành
              nghề trước khi đưa ra bất kỳ quyết định tài chính, thuế, hoặc pháp
              lý nào. Luật thuế liên bang và tiểu bang thay đổi theo thời gian
              và theo từng trường hợp.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">
              Giới hạn trách nhiệm (Limitation of liability)
            </h2>
            <p className="mt-2">
              Website không chịu trách nhiệm pháp lý về bất kỳ tổn thất, thiệt
              hại, hoặc hậu quả nào (any loss, damage, or consequences) phát
              sinh trực tiếp hoặc gián tiếp từ việc sử dụng hoặc tin tưởng vào
              thông tin trên website này. Việc sử dụng website đồng nghĩa với
              việc bạn chấp nhận các điều khoản miễn trừ trách nhiệm này.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">
              Dữ liệu của bạn (Your data)
            </h2>
            <p className="mt-2">
              Mọi dữ liệu tính toán chỉ được lưu trữ trên trình duyệt
              (localStorage) của thiết bị bạn và không được truyền đến bất kỳ
              máy chủ nào. Xem thêm tại trang Chính sách bảo mật (Privacy
              Policy).
            </p>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Đóng (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
