/**
 * Tests for the classification section components.
 *
 * Validates: Requirements 6.1 (comparison table), 6.2 (IRS checklist with
 * scoring), 6.3 (misclassification warning), 6.4 (split model explanation),
 * 6.5 (classification suggestion based on control).
 */

import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { AppProvider } from "../../context/AppContext";
import {
  CLASSIFICATION_QUESTIONS,
  scoreClassification,
} from "../../data/classificationCriteria";
import { ComparisonChart, COMPARISON_ROWS } from "./ComparisonChart";
import { ClassificationChecklist } from "./ClassificationChecklist";
import { SplitModelGuide, SPLIT_EXAMPLES } from "./SplitModelGuide";

describe("ComparisonChart", () => {
  it("renders a heading and the W-2 / 1099 column headers", () => {
    render(<ComparisonChart />);
    expect(
      screen.getByRole("heading", { name: /So sánh W-2 và 1099/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /W-2/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /1099/i }),
    ).toBeInTheDocument();
  });

  it("renders one row per comparison aspect", () => {
    render(<ComparisonChart />);
    for (const row of COMPARISON_ROWS) {
      expect(
        screen.getByRole("rowheader", { name: row.aspect }),
      ).toBeInTheDocument();
    }
  });

  it("renders custom rows when provided", () => {
    render(
      <ComparisonChart
        rows={[{ aspect: "Tùy chỉnh", w2: "A", contractor1099: "B" }]}
      />,
    );
    expect(
      screen.getByRole("rowheader", { name: "Tùy chỉnh" }),
    ).toBeInTheDocument();
  });
});

describe("ClassificationChecklist", () => {
  function renderChecklist() {
    return render(
      <AppProvider>
        <ClassificationChecklist />
      </AppProvider>,
    );
  }

  it("shows the misclassification warning", () => {
    renderChecklist();
    expect(screen.getByText(/Cảnh báo phân loại sai/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/misclassification/i);
  });

  it("renders every classification question", () => {
    renderChecklist();
    for (const q of CLASSIFICATION_QUESTIONS) {
      expect(screen.getByText(q.question)).toBeInTheDocument();
    }
  });

  it("does not show a recommendation before any answer", () => {
    renderChecklist();
    expect(screen.queryByText(/Đề xuất phân loại/i)).not.toBeInTheDocument();
  });

  it("recommends a classification consistent with scoreClassification", () => {
    renderChecklist();
    // Answer a W-2-indicator question in the W-2 direction (Có/Yes).
    const w2Question = CLASSIFICATION_QUESTIONS.find((q) => q.w2Indicator)!;
    const item = screen.getByText(w2Question.question).closest("li")!;
    fireEvent.click(within(item).getByRole("radio", { name: /Có/i }));

    const expected = scoreClassification({ [w2Question.id]: true });
    const expectedLabel =
      expected === "W2" ? "W-2 (Nhân viên)" : "1099 (Thầu độc lập)";
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Đề xuất phân loại");
    expect(status).toHaveTextContent(expectedLabel);
  });
});

describe("SplitModelGuide", () => {
  it("renders the split model heading and tax reporting guidance", () => {
    render(<SplitModelGuide />);
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Mô hình Ăn Chia trong ngành dịch vụ/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Khai thuế đúng/i)).toBeInTheDocument();
  });

  it("renders each common split example", () => {
    render(<SplitModelGuide />);
    for (const example of SPLIT_EXAMPLES) {
      expect(screen.getByText(example.label)).toBeInTheDocument();
    }
  });

  it("explains classification choice based on owner control", () => {
    render(<SplitModelGuide />);
    expect(
      screen.getByText(/Mô hình Ăn Chia nên dùng W-2 hay 1099/i),
    ).toBeInTheDocument();
  });
});
