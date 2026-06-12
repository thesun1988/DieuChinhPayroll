/**
 * HeroSection — top intro section of the landing page.
 *
 * Presents the application's purpose in Vietnamese: helping nail salon
 * owners transition payroll from cash payments toward fully reported
 * (check / payroll) compensation while staying compliant with the IRS.
 *
 * Pure presentational component with no state or props.
 *
 * @see requirements.md — Requirement 4 (Vietnamese interface)
 * @see design.md — "HeroSection"
 */

export function HeroSection() {
  return (
    <section className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
        Chuyển Đổi Lương Một Cách An Toàn
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
        Công cụ giúp chủ tiệm chuyển từ hình thức trả lương tiền mặt (cash) sang
        trả lương qua check / bảng lương (payroll) đúng quy định, giảm rủi ro bị
        Sở Thuế (IRS) chú ý và kiểm toán (audit).
      </p>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
        Xem lộ trình chuyển đổi từng bước, ước lượng chi phí thuế, tìm hiểu các
        dấu hiệu bất thường (red flag), và so sánh hình thức W-2 với 1099. Phù
        hợp cho tiệm nail, salon tóc, làm đẹp và các ngành dịch vụ ăn chia.
      </p>
    </section>
  );
}

export default HeroSection;
