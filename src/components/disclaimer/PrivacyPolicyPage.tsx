/**
 * PrivacyPolicyPage — privacy policy content, rendered as an overlay.
 *
 * Accessible from the Privacy Policy link in the {@link Footer} /
 * {@link MobileMenu} (modeled via the `showPrivacyPage` flag in
 * {@link FlowContext}). Describes the application's privacy posture: no data
 * collection, localStorage-only persistence, no third-party sharing, no
 * tracking cookies, no analytics, and no account required.
 *
 * The close handler defaults to dispatching
 * `SHOW_PRIVACY_PAGE { show: false }` but can be overridden via props for
 * isolated testing.
 *
 * @see design.md — "Project Structure" (components/disclaimer/PrivacyPolicyPage.tsx)
 * @see requirements.md — Requirements 7.5, 7.6, 7.7, 7.8
 */

import { useFlow } from "../../context/FlowContext";

/** Props for {@link PrivacyPolicyPage}. */
export interface PrivacyPolicyPageProps {
  /**
   * Invoked when the page is closed. Defaults to dispatching
   * `SHOW_PRIVACY_PAGE { show: false }` on the flow reducer.
   */
  onClose?: () => void;
}

/** Privacy policy content rendered as a dismissible overlay. */
export default function PrivacyPolicyPage({ onClose }: PrivacyPolicyPageProps) {
  const { dispatch } = useFlow();

  const handleClose =
    onClose ?? (() => dispatch({ type: "SHOW_PRIVACY_PAGE", show: false }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-page-title"
        className="my-8 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h1
            id="privacy-page-title"
            className="text-2xl font-bold text-gray-900"
          >
            Chính sách bảo mật (Privacy Policy)
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
              Không thu thập dữ liệu cá nhân (No personal data collection)
            </h2>
            <p className="mt-2">
              Website này{" "}
              <strong>
                không thu thập, không lưu trữ trên máy chủ (server), và không
                chia sẻ
              </strong>{" "}
              bất kỳ dữ liệu cá nhân nào của bạn với bên thứ ba (no third-party
              sharing). Chúng tôi không yêu cầu bạn cung cấp tên, email, số điện
              thoại, hoặc bất kỳ thông tin định danh nào.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">
              Lưu trữ trên trình duyệt (Local storage only)
            </h2>
            <p className="mt-2">
              Mọi dữ liệu nhập liệu (doanh thu, số thợ, tỉ lệ ăn chia) và kết
              quả tính toán chỉ được lưu trữ trên trình duyệt (localStorage) của
              thiết bị bạn. Dữ liệu này{" "}
              <strong>không được truyền đến bất kỳ máy chủ nào</strong> (is
              never transmitted to any server) và sẽ ở lại trên thiết bị của bạn
              cho đến khi bạn chủ động xóa.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">
              Không cookies theo dõi, không analytics (No tracking)
            </h2>
            <p className="mt-2">
              Website không sử dụng cookies theo dõi (tracking cookies), không
              tích hợp công cụ phân tích bên thứ ba (third-party analytics) thu
              thập dữ liệu cá nhân, và không sử dụng bất kỳ pixel quảng cáo nào.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">
              Không cần tài khoản (No account required)
            </h2>
            <p className="mt-2">
              Bạn có thể sử dụng toàn bộ tính năng của website mà không cần đăng
              nhập hoặc tạo tài khoản (no login or account required). Bạn có thể
              xóa toàn bộ dữ liệu đã lưu bất cứ lúc nào ngay trên thiết bị của
              mình.
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
