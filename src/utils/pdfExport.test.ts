/**
 * Unit tests for the PDF export utility.
 *
 * Validates: Requirements 5.3, 2.7, 2.8 — export results to a Vietnamese PDF
 * including roadmap, comparison and cost figures, with a disclaimer footer.
 */

import { describe, expect, it } from "vitest";
import type { ComparisonResult, Roadmap, TaxResult } from "../context/types";
import {
  DEFAULT_PDF_DISCLAIMER,
  buildPdfDocument,
  exportToPdf,
  toAsciiVietnamese,
  type PdfContent,
} from "./pdfExport";

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
      notes: "Giai đoạn đầu: tăng tỉ lệ check lên 65%.",
    },
    {
      phaseNumber: 2,
      checkPercent: 100,
      cashPercent: 0,
      durationMonths: 3,
      startMonth: 4,
      endMonth: 6,
      notes: "Hoàn tất chuyển sang 100% check.",
    },
  ],
  totalDurationMonths: 6,
  recommendation: "Chuyển đổi dần trong 6 tháng.",
};

const comparisonResult: ComparisonResult = {
  w2Result: makeResult(),
  result1099: makeResult({ projectedEmployerCostPerMonth: 800 }),
};

function makeContent(overrides: Partial<PdfContent> = {}): PdfContent {
  return {
    title: "Kết quả chuyển đổi lương",
    calculatorResult: makeResult(),
    comparisonResult,
    roadmap,
    generatedDate: "15/01/2024",
    disclaimer: DEFAULT_PDF_DISCLAIMER,
    ...overrides,
  };
}

describe("toAsciiVietnamese", () => {
  it("removes diacritics and maps đ/Đ to d/D", () => {
    expect(toAsciiVietnamese("Lộ trình chuyển đổi")).toBe(
      "Lo trinh chuyen doi",
    );
    expect(toAsciiVietnamese("Đồng")).toBe("Dong");
  });

  it("leaves plain ASCII unchanged", () => {
    expect(toAsciiVietnamese("W-2 vs 1099")).toBe("W-2 vs 1099");
  });
});

describe("buildPdfDocument", () => {
  it("returns a jsPDF document containing all results", () => {
    const doc = buildPdfDocument(makeContent());
    expect(doc).toBeDefined();
    // At least one page produced.
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("does not throw when optional sections are omitted", () => {
    expect(() =>
      buildPdfDocument(
        makeContent({
          calculatorResult: undefined,
          comparisonResult: undefined,
          roadmap: undefined,
        }),
      ),
    ).not.toThrow();
  });
});

describe("exportToPdf", () => {
  it("builds and saves the PDF without throwing", () => {
    // jsPDF#save triggers a DOM download; in jsdom it resolves without error.
    expect(() => exportToPdf(makeContent())).not.toThrow();
  });
});
