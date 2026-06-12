/**
 * Tests for the unified ResultsView container and the PDF export button.
 *
 * Validates: Requirements 5.3, 2.7, 2.8 — render all three result sections
 * (roadmap, comparison, warnings) and expose edit / PDF export actions.
 */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type {
  ComparisonResult,
  Roadmap,
  TaxInput,
  TaxResult,
} from "../../context/types";
import { PdfExportButton } from "./PdfExportButton";
import { ResultsView, buildPdfContent } from "./ResultsView";

const input: TaxInput = {
  monthlyRevenue: 20000,
  splitRatio: { owner: 4, worker: 6 },
  numberOfWorkers: 3,
  currentCashPercent: 50,
  workerType: "W2",
  state: "CA",
  hoursPerWeek: 40,
};

function makeResult(overrides: Partial<TaxResult> = {}): TaxResult {
  return {
    workerGrossIncome: 12000,
    currentTaxedPortion: 6000,
    projectedTaxedPortion: 12000,
    currentEmployerCostPerMonth: 500,
    projectedEmployerCostPerMonth: 1000,
    additionalCostPerMonth: 500,
    additionalCostPerYear: 6000,
    currentWorkerTakeHome: 11000,
    projectedWorkerTakeHome: 10000,
    minimumWageViolation: false,
    form1099Required: false,
    ...overrides,
  };
}

const roadmap: Roadmap = {
  phases: [
    {
      phaseNumber: 1,
      checkPercent: 65,
      cashPercent: 35,
      durationMonths: 3,
      startMonth: 1,
      endMonth: 3,
      notes: "Giai đoạn đầu.",
    },
  ],
  totalDurationMonths: 9,
  recommendation: "Chuyển đổi dần.",
};

const comparisonResult: ComparisonResult = {
  w2Result: makeResult(),
  result1099: makeResult({ projectedEmployerCostPerMonth: 800 }),
};

function renderView(
  props: Partial<React.ComponentProps<typeof ResultsView>> = {},
) {
  return render(
    <ResultsView
      taxResult={makeResult()}
      comparisonResult={comparisonResult}
      roadmap={roadmap}
      input={input}
      onEditInputs={vi.fn()}
      {...props}
    />,
  );
}

describe("ResultsView", () => {
  it("renders the roadmap and warnings sections (comparison now lives per-phase)", () => {
    renderView();
    expect(
      screen.getByRole("heading", { name: /Lộ trình chuyển đổi/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Khuyến cáo & Cảnh báo IRS/i }),
    ).toBeInTheDocument();
    // The standalone W-2 vs 1099 comparison section was removed as redundant;
    // the per-phase cards now carry that comparison.
    expect(
      screen.queryByRole("heading", { name: /So sánh W-2 và 1099/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the edit and export buttons", () => {
    renderView();
    expect(
      screen.getByRole("button", { name: /Chỉnh sửa thông tin/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Xuất PDF/i }),
    ).toBeInTheDocument();
  });

  it("calls onEditInputs when the edit button is clicked", () => {
    const onEditInputs = vi.fn();
    renderView({ onEditInputs });
    fireEvent.click(
      screen.getByRole("button", { name: /Chỉnh sửa thông tin/i }),
    );
    expect(onEditInputs).toHaveBeenCalledTimes(1);
  });

  it("invokes the export override with built PDF content", () => {
    const onExportPdf = vi.fn();
    renderView({ onExportPdf });
    fireEvent.click(screen.getByRole("button", { name: /Xuất PDF/i }));
    expect(onExportPdf).toHaveBeenCalledTimes(1);
    const content = onExportPdf.mock.calls[0][0];
    expect(content.roadmap).toBe(roadmap);
    expect(content.comparisonResult).toBe(comparisonResult);
    expect(content.disclaimer).toMatch(/CPA/);
  });

  it("renders a Start over button only when the handler is provided", () => {
    const { rerender } = renderView();
    expect(
      screen.queryByRole("button", { name: /Bắt đầu lại/i }),
    ).not.toBeInTheDocument();

    rerender(
      <ResultsView
        taxResult={makeResult()}
        comparisonResult={comparisonResult}
        roadmap={roadmap}
        input={input}
        onEditInputs={vi.fn()}
        onStartOver={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Bắt đầu lại/i }),
    ).toBeInTheDocument();
  });
});

describe("buildPdfContent", () => {
  it("assembles roadmap, comparison and calculator result", () => {
    const content = buildPdfContent(makeResult(), comparisonResult, roadmap);
    expect(content.roadmap).toBe(roadmap);
    expect(content.comparisonResult).toBe(comparisonResult);
    expect(content.calculatorResult).toBeDefined();
    expect(content.disclaimer).toMatch(/tham vấn CPA/);
  });
});

describe("PdfExportButton", () => {
  it("shows a Vietnamese error message when export throws", () => {
    const onExport = vi.fn(() => {
      throw new Error("boom");
    });
    render(<PdfExportButton onExport={onExport} />);
    fireEvent.click(screen.getByRole("button", { name: /Xuất PDF/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Không thể tạo PDF/i);
  });
});
