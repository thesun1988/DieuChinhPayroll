/**
 * W-2 vs 1099 worker classification questions, in Vietnamese.
 *
 * Based on the IRS "Common Law Rules" three-category test for determining
 * worker status:
 *   - Behavioral control  (kiểm soát hành vi)
 *   - Financial control   (kiểm soát tài chính)
 *   - Relationship        (mối quan hệ giữa hai bên)
 *
 * Each question is phrased so that a "yes" (true) answer points toward one
 * classification, captured by `w2Indicator`:
 *   - w2Indicator = true  → a "yes" answer suggests the worker is an EMPLOYEE (W-2)
 *   - w2Indicator = false → a "yes" answer suggests the worker is an
 *                           INDEPENDENT CONTRACTOR (1099)
 *
 * Disclaimer: nội dung chỉ mang tính tham khảo. Phân loại lao động phụ thuộc
 * vào toàn bộ hoàn cảnh; chủ tiệm nên tham vấn CPA hoặc luật sư thuế.
 *
 * Validates: Requirements 6.1, 6.2
 */

/** IRS common-law control category. */
export type ClassificationCategory =
  | "behavioral"
  | "financial"
  | "relationship";

/** A single classification checklist question. */
export interface ClassificationQuestion {
  /** Stable identifier. */
  id: string;
  /** Which IRS control category this question belongs to. */
  category: ClassificationCategory;
  /** The yes/no question shown to the owner (Vietnamese). */
  question: string;
  /** Explanation of why this factor matters (Vietnamese). */
  explanation: string;
  /** true if a "yes" answer points toward W-2 (employee). */
  w2Indicator: boolean;
}

/** Full list of classification checklist questions. */
export const CLASSIFICATION_QUESTIONS: ClassificationQuestion[] = [
  // --- Behavioral control ---------------------------------------------------
  {
    id: "behavioral-schedule",
    category: "behavioral",
    question:
      "Chủ tiệm có quy định giờ giấc, ngày làm việc cụ thể cho thợ không?",
    explanation:
      "Khi chủ tiệm ấn định lịch làm việc (giờ vào/ra, ngày nghỉ), đó là dấu hiệu của quan hệ employee (W-2). Nhà thầu độc lập thường tự quyết định thời gian làm việc của mình.",
    w2Indicator: true,
  },
  {
    id: "behavioral-instructions",
    category: "behavioral",
    question:
      "Chủ tiệm có hướng dẫn chi tiết cách thợ phải làm dịch vụ (quy trình, kỹ thuật, sản phẩm dùng) không?",
    explanation:
      "Kiểm soát cách thức thực hiện công việc — chứ không chỉ kết quả — cho thấy quan hệ employee. Nhà thầu độc lập tự quyết định phương pháp làm việc.",
    w2Indicator: true,
  },
  {
    id: "behavioral-training",
    category: "behavioral",
    question:
      "Chủ tiệm có đào tạo thợ về quy trình, tiêu chuẩn của tiệm không?",
    explanation:
      "Việc đào tạo thợ làm theo cách của tiệm cho thấy chủ muốn dịch vụ được thực hiện theo phương pháp riêng — đặc trưng của employee. Nhà thầu độc lập dùng kỹ năng sẵn có của họ.",
    w2Indicator: true,
  },
  {
    id: "behavioral-supervision",
    category: "behavioral",
    question:
      "Chủ tiệm có giám sát, đánh giá công việc của thợ trong lúc làm không?",
    explanation:
      "Giám sát liên tục cách làm việc là dấu hiệu employee. Với nhà thầu độc lập, người thuê thường chỉ quan tâm kết quả cuối cùng.",
    w2Indicator: true,
  },
  {
    id: "behavioral-set-own-clients",
    category: "behavioral",
    question:
      "Thợ có tự mang khách riêng và tự quyết định nhận hay từ chối khách không?",
    explanation:
      "Khi thợ tự chủ về khách hàng và có thể từ chối công việc, điều này nghiêng về nhà thầu độc lập (1099).",
    w2Indicator: false,
  },

  // --- Financial control ----------------------------------------------------
  {
    id: "financial-tools",
    category: "financial",
    question:
      "Chủ tiệm có cung cấp dụng cụ, sản phẩm, ghế và bàn làm việc cho thợ không?",
    explanation:
      "Khi chủ tiệm cung cấp dụng cụ và vật tư, đó là dấu hiệu employee. Nhà thầu độc lập thường tự đầu tư dụng cụ và vật tư của riêng mình.",
    w2Indicator: true,
  },
  {
    id: "financial-payment-method",
    category: "financial",
    question:
      "Thợ được trả lương theo giờ hoặc lương cố định (thay vì theo từng dịch vụ/hợp đồng) không?",
    explanation:
      "Trả theo giờ hoặc lương cố định là đặc trưng của employee. Nhà thầu độc lập thường được trả theo công việc hoặc theo thỏa thuận từng dịch vụ.",
    w2Indicator: true,
  },
  {
    id: "financial-expenses-reimbursed",
    category: "financial",
    question:
      "Chủ tiệm có hoàn trả/chi trả các chi phí làm việc cho thợ không?",
    explanation:
      "Khi tiệm gánh chi phí hoạt động, thợ ít chịu rủi ro tài chính — đặc trưng employee. Nhà thầu độc lập tự chịu chi phí của mình.",
    w2Indicator: true,
  },
  {
    id: "financial-profit-loss",
    category: "financial",
    question:
      "Thợ có khả năng lời/lỗ về tài chính tùy theo cách điều hành công việc của họ không?",
    explanation:
      "Khả năng lời/lỗ thực sự (đầu tư dụng cụ, tự định giá, gánh chi phí) là dấu hiệu nhà thầu độc lập (1099).",
    w2Indicator: false,
  },
  {
    id: "financial-rents-booth",
    category: "financial",
    question:
      "Thợ có thuê ghế/booth của tiệm và tự định giá dịch vụ của mình không?",
    explanation:
      "Mô hình booth rental — thợ trả tiền thuê chỗ và tự định giá, tự thu tiền khách — nghiêng mạnh về nhà thầu độc lập (1099). Cần hợp đồng thuê rõ ràng.",
    w2Indicator: false,
  },

  // --- Relationship ---------------------------------------------------------
  {
    id: "relationship-written-contract",
    category: "relationship",
    question:
      "Có hợp đồng bằng văn bản xác định thợ là nhà thầu độc lập (independent contractor) không?",
    explanation:
      "Hợp đồng ghi rõ quan hệ nhà thầu độc lập nghiêng về 1099. Tuy nhiên, hợp đồng không tự động quyết định — IRS vẫn xét thực tế công việc.",
    w2Indicator: false,
  },
  {
    id: "relationship-benefits",
    category: "relationship",
    question:
      "Chủ tiệm có cung cấp phúc lợi cho thợ (bảo hiểm, nghỉ phép có lương, nghỉ bệnh) không?",
    explanation:
      "Cung cấp phúc lợi kiểu nhân viên là dấu hiệu rõ của quan hệ employee (W-2). Nhà thầu độc lập thường không nhận phúc lợi.",
    w2Indicator: true,
  },
  {
    id: "relationship-permanency",
    category: "relationship",
    question:
      "Quan hệ làm việc có tính lâu dài, liên tục (không phải theo dự án/thời vụ) không?",
    explanation:
      "Quan hệ lâu dài, không có ngày kết thúc cụ thể, cho thấy employee. Nhà thầu độc lập thường làm theo từng dự án hoặc khoảng thời gian xác định.",
    w2Indicator: true,
  },
  {
    id: "relationship-core-service",
    category: "relationship",
    question:
      "Công việc của thợ có phải là hoạt động cốt lõi của tiệm (làm dịch vụ cho khách) không?",
    explanation:
      "Khi công việc là phần cốt lõi của hoạt động kinh doanh, người làm thường được xem là employee vì tiệm có xu hướng kiểm soát chặt phần việc này.",
    w2Indicator: true,
  },
  {
    id: "relationship-works-elsewhere",
    category: "relationship",
    question:
      "Thợ có tự do làm cho nhiều tiệm/khách khác cùng lúc và quảng bá dịch vụ riêng không?",
    explanation:
      "Khả năng phục vụ nhiều khách hàng/tiệm khác và tự quảng bá là dấu hiệu nhà thầu độc lập (1099).",
    w2Indicator: false,
  },
];

/**
 * IRS misclassification penalty warning shown alongside the checklist.
 * Validates: Requirement 6.3.
 */
export const MISCLASSIFICATION_WARNING =
  "Phân loại sai (misclassification) thợ là 1099 trong khi thực tế là W-2 có thể " +
  "dẫn đến phạt nặng từ IRS, bao gồm truy thu thuế (back taxes), tiền phạt " +
  "(penalties) và lãi (interest). Đây là vấn đề bị IRS và bộ lao động bang " +
  "nhắm tới mạnh với ngành dịch vụ. Khi không chắc chắn, hãy tham vấn CPA hoặc " +
  "luật sư thuế, hoặc nộp Form SS-8 để IRS xác định.";

/** Returns all questions belonging to a given control category. */
export function getQuestionsByCategory(
  category: ClassificationCategory,
): ClassificationQuestion[] {
  return CLASSIFICATION_QUESTIONS.filter((q) => q.category === category);
}

/**
 * Scores a set of yes/no answers and returns a recommended classification.
 *
 * For each answered question, a "yes" (true) answer counts toward W-2 when
 * `w2Indicator` is true, otherwise toward 1099. A "no" (false) answer counts
 * the opposite way. The side with more votes wins; ties default to "W2"
 * (the more conservative / lower-risk classification).
 */
export function scoreClassification(
  answers: Record<string, boolean>,
): "W2" | "1099" {
  let w2Score = 0;
  let score1099 = 0;

  for (const question of CLASSIFICATION_QUESTIONS) {
    if (!(question.id in answers)) continue;
    const answeredYes = answers[question.id];
    // A "yes" points to the indicator side; a "no" points to the other side.
    const pointsToW2 = answeredYes === question.w2Indicator;
    if (pointsToW2) {
      w2Score += 1;
    } else {
      score1099 += 1;
    }
  }

  return score1099 > w2Score ? "1099" : "W2";
}
