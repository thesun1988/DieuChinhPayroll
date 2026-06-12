/**
 * ClassificationChecklist — IRS criteria checklist with live scoring.
 *
 * Presents the W-2 vs 1099 classification questions (grouped by IRS
 * common-law control category) as yes/no toggles. As the owner answers, the
 * component scores the answers via {@link scoreClassification} and recommends
 * a worker type, persisting answers and the result to {@link AppContext}.
 *
 * Also surfaces the misclassification penalty warning (Requirement 6.3).
 *
 * All visible text is Vietnamese (English terms in parentheses).
 *
 * @see design.md — "classification/ClassificationChecklist"
 * @see requirements.md — Requirements 6.2, 6.3, 6.5
 */

import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  CLASSIFICATION_QUESTIONS,
  MISCLASSIFICATION_WARNING,
  getQuestionsByCategory,
  scoreClassification,
  type ClassificationCategory,
} from "../../data/classificationCriteria";

/** Human-readable Vietnamese labels for each IRS control category. */
const CATEGORY_LABELS: Record<ClassificationCategory, string> = {
  behavioral: "Kiểm soát hành vi (Behavioral control)",
  financial: "Kiểm soát tài chính (Financial control)",
  relationship: "Mối quan hệ (Relationship)",
};

const CATEGORY_ORDER: ClassificationCategory[] = [
  "behavioral",
  "financial",
  "relationship",
];

export function ClassificationChecklist() {
  const { state, dispatch } = useAppContext();
  const { classificationAnswers } = state;

  const answeredCount = useMemo(
    () =>
      CLASSIFICATION_QUESTIONS.filter((q) => q.id in classificationAnswers)
        .length,
    [classificationAnswers],
  );

  const recommendation = useMemo(
    () =>
      answeredCount > 0 ? scoreClassification(classificationAnswers) : null,
    [classificationAnswers, answeredCount],
  );

  function setAnswer(id: string, value: boolean) {
    const next = { ...classificationAnswers, [id]: value };
    dispatch({ type: "SET_CLASSIFICATION_ANSWERS", payload: next });
    dispatch({
      type: "SET_CLASSIFICATION_RESULT",
      payload: scoreClassification(next),
    });
  }

  return (
    <section
      aria-labelledby="classification-checklist-heading"
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h3
        id="classification-checklist-heading"
        className="text-lg font-semibold text-gray-900"
      >
        Checklist phân loại theo tiêu chí IRS (IRS classification checklist)
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Trả lời các câu hỏi dưới đây để xác định thợ thuộc dạng W-2 hay 1099.
        Đáp án chỉ mang tính tham khảo.
      </p>

      <div className="mt-6 space-y-8">
        {CATEGORY_ORDER.map((category) => (
          <fieldset key={category}>
            <legend className="text-base font-semibold text-gray-900">
              {CATEGORY_LABELS[category]}
            </legend>
            <ul className="mt-3 space-y-4">
              {getQuestionsByCategory(category).map((q) => {
                const answer = classificationAnswers[q.id];
                return (
                  <li
                    key={q.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {q.question}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {q.explanation}
                    </p>
                    <div
                      role="radiogroup"
                      aria-label={q.question}
                      className="mt-3 flex gap-2"
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={answer === true}
                        onClick={() => setAnswer(q.id, true)}
                        className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          answer === true
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Có (Yes)
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={answer === false}
                        onClick={() => setAnswer(q.id, false)}
                        className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          answer === false
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Không (No)
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      {recommendation !== null && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
          <p className="text-sm font-semibold text-blue-900">
            Đề xuất phân loại (Suggested classification):{" "}
            {recommendation === "W2"
              ? "W-2 (Nhân viên)"
              : "1099 (Thầu độc lập)"}
          </p>
          <p className="mt-1 text-xs text-blue-800">
            Dựa trên {answeredCount}/{CLASSIFICATION_QUESTIONS.length} câu đã
            trả lời. Đề xuất này chỉ mang tính tham khảo, không thay thế tư vấn
            của CPA hoặc luật sư thuế.
          </p>
        </div>
      )}

      <div
        role="alert"
        className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4"
      >
        <p className="text-sm font-semibold text-amber-900">
          Cảnh báo phân loại sai (Misclassification warning)
        </p>
        <p className="mt-1 text-xs text-amber-800">
          {MISCLASSIFICATION_WARNING}
        </p>
      </div>
    </section>
  );
}

export default ClassificationChecklist;
