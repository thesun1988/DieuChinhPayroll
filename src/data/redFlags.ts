/**
 * IRS Red Flag content for nail salon payroll, in Vietnamese.
 *
 * These are common audit triggers ("red flags") that the IRS looks for when
 * reviewing small cash-intensive businesses such as nail salons. Each entry
 * includes plain-language guidance on how to avoid the red flag.
 *
 * Disclaimer: nội dung chỉ mang tính tham khảo. Chủ tiệm nên tham vấn CPA
 * hoặc luật sư thuế trước khi đưa ra quyết định.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

/** Severity level of a red flag. */
export type RedFlagSeverity = "high" | "medium" | "low";

/** A single IRS red flag entry. */
export interface RedFlag {
  /** Stable identifier. */
  id: string;
  /** Short title in Vietnamese. */
  title: string;
  /** Description of why this behavior attracts IRS attention (Vietnamese). */
  description: string;
  /** Concrete guidance on how to avoid the red flag (Vietnamese). */
  prevention: string;
  /** Relative severity / likelihood of triggering an audit. */
  severity: RedFlagSeverity;
  /**
   * true if this red flag is directly relevant to the cash → check
   * transition process (used to highlight in the transition flow).
   */
  relatedToTransition: boolean;
}

/** Full list of IRS red flags for nail salon payroll. */
export const RED_FLAGS: RedFlag[] = [
  {
    id: "sudden-cash-to-check",
    title: "Thay đổi tỉ lệ cash/check quá đột ngột",
    description:
      "Chuyển từ 70% cash xuống 0% cash chỉ trong 1-2 tháng làm doanh thu khai báo tăng vọt bất thường. IRS dùng phần mềm so sánh doanh thu khai báo qua các năm; một bước nhảy đột ngột là dấu hiệu cho thấy trước đây tiệm có thể đã giấu doanh thu, dễ dẫn đến audit cho cả các năm trước.",
    prevention:
      "Chuyển đổi theo lộ trình từng giai đoạn (giảm tối đa ~10-15% cash mỗi 2-3 tháng) trong 6-18 tháng. Tăng dần phần trả qua check để con số khai báo tăng một cách tự nhiên, hợp lý theo thời gian.",
    severity: "high",
    relatedToTransition: true,
  },
  {
    id: "underreported-income",
    title: "Khai báo doanh thu thấp hơn thực tế",
    description:
      "Doanh thu khai báo thấp bất thường so với các tiệm cùng quy mô, cùng khu vực, hoặc không tương xứng với số ghế/thợ và chi phí thuê mặt bằng. IRS so sánh tỉ suất lợi nhuận của tiệm với chuẩn ngành (industry benchmark); chênh lệch lớn là red flag hàng đầu với ngành dùng nhiều tiền mặt.",
    prevention:
      "Khai báo đầy đủ toàn bộ doanh thu, kể cả tiền mặt. Giữ tỉ lệ chi phí / doanh thu hợp lý so với chuẩn ngành nail. Đối chiếu doanh thu với số lượng dịch vụ thực tế và lịch hẹn.",
    severity: "high",
    relatedToTransition: true,
  },
  {
    id: "unreported-tips",
    title: "Không khai báo hoặc khai thiếu tiền tip",
    description:
      "Tiền tip là thu nhập chịu thuế. Khi thợ nhận tip qua thẻ tín dụng nhưng không khai, hoặc tiệm không khai phần tip phân bổ (allocated tips), IRS dễ phát hiện qua đối chiếu doanh thu thẻ. Tip không khai cũng làm sai lệch lương cơ bản dùng để tính thuế employer.",
    prevention:
      "Yêu cầu thợ ghi nhận tip hàng ngày (Form 4070 hoặc sổ tip). Khai báo tip trên W-2 (ô 7) và đóng thuế Social Security/Medicare trên phần tip. Với tiệm có nhiều thợ, cân nhắc nộp Form 8027 và áp dụng tip phân bổ đúng quy định.",
    severity: "high",
    relatedToTransition: false,
  },
  {
    id: "worker-misclassification",
    title: "Phân loại sai thợ (1099 thay vì W-2)",
    description:
      "Xếp thợ làm 1099 (independent contractor) trong khi thực tế chủ tiệm kiểm soát lịch làm, giá dịch vụ, cung cấp dụng cụ và mặt bằng — tức là quan hệ employee. Đây là một trong những vấn đề bị IRS và bộ lao động bang nhắm tới mạnh nhất với ngành nail. Phạt gồm back taxes, penalties và interest.",
    prevention:
      "Dùng tiêu chí kiểm soát của IRS (behavioral, financial, relationship) để phân loại đúng. Nếu chủ tiệm kiểm soát cách làm việc, thợ thường phải là W-2. Khi không chắc, nộp Form SS-8 để IRS xác định, và tham vấn CPA.",
    severity: "high",
    relatedToTransition: true,
  },
  {
    id: "poor-recordkeeping",
    title: "Hồ sơ lương và sổ sách không đầy đủ",
    description:
      "Thiếu pay stubs, bảng chấm công, bản sao W-2/1099, hoặc sổ thu chi không khớp với tờ khai thuế. Khi bị audit mà không xuất trình được chứng từ, IRS có quyền ước tính doanh thu theo hướng bất lợi cho tiệm và bác bỏ các khoản khấu trừ.",
    prevention:
      "Lưu giữ pay stubs, bảng lương, W-2/1099, biên lai và sao kê ngân hàng tối thiểu 4 năm. Dùng phần mềm payroll hoặc dịch vụ payroll để tạo hồ sơ nhất quán. Tách bạch tài khoản ngân hàng cá nhân và tài khoản kinh doanh.",
    severity: "medium",
    relatedToTransition: true,
  },
  {
    id: "cash-heavy-deposits",
    title: "Gửi/rút tiền mặt bất thường, cấu trúc giao dịch",
    description:
      "Gửi tiền mặt nhiều lần ngay dưới mức $10,000 để né báo cáo (structuring), hoặc tiền mặt nộp ngân hàng không khớp doanh thu khai báo. Ngân hàng nộp Form 8300/CTR cho giao dịch tiền mặt lớn; cấu trúc giao dịch để né báo cáo là vi phạm hình sự độc lập.",
    prevention:
      "Không chia nhỏ giao dịch để né ngưỡng báo cáo. Gửi tiền mặt tương ứng với doanh thu thực và khai báo đầy đủ. Giữ nhật ký doanh thu hàng ngày để giải trình nguồn tiền khi cần.",
    severity: "medium",
    relatedToTransition: true,
  },
  {
    id: "owner-low-salary",
    title: "Chủ tiệm (S-corp) trả lương cho bản thân quá thấp",
    description:
      "Với tiệm hoạt động theo S-corporation, nếu chủ rút phần lớn lợi nhuận dưới dạng distribution nhưng trả cho mình mức lương W-2 rất thấp để né thuế payroll, IRS xem đây là red flag về 'reasonable compensation'.",
    prevention:
      "Trả cho chủ một mức lương hợp lý (reasonable salary) tương xứng với công việc và chuẩn ngành trước khi nhận distribution. Tham vấn CPA để xác định mức lương phù hợp.",
    severity: "medium",
    relatedToTransition: false,
  },
  {
    id: "excessive-deductions",
    title: "Khấu trừ chi phí quá mức hoặc cá nhân",
    description:
      "Khai khấu trừ lớn bất thường so với doanh thu, hoặc trộn chi phí cá nhân (xe, ăn uống, du lịch) vào chi phí kinh doanh. Tỉ lệ khấu trừ cao bất thường so với chuẩn ngành dễ kích hoạt review.",
    prevention:
      "Chỉ khấu trừ chi phí kinh doanh hợp lệ và có chứng từ. Tách riêng chi phí cá nhân và kinh doanh. Giữ biên lai và ghi rõ mục đích kinh doanh của từng khoản.",
    severity: "low",
    relatedToTransition: false,
  },
  {
    id: "below-minimum-wage",
    title: "Thu nhập thợ W-2 thấp hơn lương tối thiểu",
    description:
      "Với thợ W-2, nếu phần ăn chia quy đổi theo giờ thấp hơn mức lương tối thiểu liên bang ($7.25/giờ) hoặc của bang, tiệm vi phạm luật lao động (FLSA). Đây vừa là rủi ro với bộ lao động vừa là dấu hiệu khai báo lương không nhất quán cho IRS.",
    prevention:
      "Bảo đảm thợ W-2 luôn nhận ít nhất mức lương tối thiểu cho mỗi giờ làm; nếu phần ăn chia thấp hơn, tiệm phải bù thêm (true-up). Đối với bang có mức tối thiểu cao hơn liên bang, áp dụng mức của bang.",
    severity: "medium",
    relatedToTransition: true,
  },
  {
    id: "mismatched-1099",
    title: "Không nộp Form 1099-NEC khi đủ ngưỡng",
    description:
      "Trả cho thợ/nhà thầu 1099 từ $600 trở lên trong năm nhưng không nộp Form 1099-NEC. IRS đối chiếu 1099 do bên nhận khai với hồ sơ của tiệm; thiếu form gây phạt và nghi vấn về phân loại lao động.",
    prevention:
      "Thu thập Form W-9 của mọi nhà thầu trước khi trả tiền. Nộp Form 1099-NEC cho mỗi người được trả ≥ $600/năm, đúng hạn (thường 31/01). Lưu bản sao và xác nhận đã gửi.",
    severity: "medium",
    relatedToTransition: true,
  },
];

/** Lookup map keyed by red flag id. */
export const RED_FLAG_MAP: Record<string, RedFlag> = RED_FLAGS.reduce(
  (map, flag) => {
    map[flag.id] = flag;
    return map;
  },
  {} as Record<string, RedFlag>,
);

/** Returns the red flags that are directly relevant to the transition. */
export function getTransitionRedFlags(): RedFlag[] {
  return RED_FLAGS.filter((flag) => flag.relatedToTransition);
}

/** Returns red flags filtered by severity. */
export function getRedFlagsBySeverity(severity: RedFlagSeverity): RedFlag[] {
  return RED_FLAGS.filter((flag) => flag.severity === severity);
}
