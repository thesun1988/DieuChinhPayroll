/**
 * ResultsView — unified results page.
 *
 * Composes the three main result sections together on a single page:
 *
 * 1. {@link RoadmapSection} — the cash → check transition roadmap
 * 2. {@link ComparisonSection} — the W-2 vs 1099 comparison
 * 3. {@link WarningsSection} — IRS red flags tailored to the input
 *
 * It also exposes two actions: "Chỉnh sửa thông tin" (back to the form) and
 * "Xuất PDF" (export all results via {@link PdfExportButton}). PDF generation
 * gathers the roadmap, comparison and cost summary into a {@link PdfContent}
 * payload and delegates to {@link exportToPdf}.
 *
 * All visible text is in Vietnamese.
 *
 * @see design.md — "ResultsView" / "ResultsViewProps"
 * @see requirements.md — Requirements 5.3, 2.7, 2.8
 */

import type {
  ComparisonResult,
  Roadmap,
  TaxInput,
  TaxResult,
} from "../../context/types";
import {
  DEFAULT_PDF_DISCLAIMER,
  exportToPdf,
  PDF_CAPTURE_ELEMENT_ID,
  type PdfContent,
} from "../../utils/pdfExport";
import { PdfExportButton } from "./PdfExportButton";
import { RoadmapSection } from "./RoadmapSection";
import { WarningsSection } from "./WarningsSection";
import { BackToTopButton } from "../common/BackToTopButton";
import { useEffect } from "react";

/** Props for {@link ResultsView}. */
export interface ResultsViewProps {
  /** Result for the user's chosen worker type. */
  taxResult: TaxResult;
  /** W-2 vs 1099 comparison results. */
  comparisonResult: ComparisonResult;
  /** Generated transition roadmap. */
  roadmap: Roadmap;
  /** The calculator input that produced these results. */
  input: TaxInput;
  /** Navigate back to the input form. */
  onEditInputs: () => void;
  /** Restart the flow from the landing page. */
  onStartOver?: () => void;
  /**
   * Optional export override. When omitted, the default {@link exportToPdf}
   * implementation is used. Primarily useful for testing.
   */
  onExportPdf?: (content: PdfContent) => void | Promise<void>;
}

/** Build the {@link PdfContent} payload from the current results. */
export function buildPdfContent(
  taxResult: TaxResult,
  comparisonResult: ComparisonResult,
  roadmap: Roadmap,
): PdfContent {
  return {
    title: "Ket qua chuyen doi luong",
    calculatorResult: taxResult,
    comparisonResult,
    roadmap,
    generatedDate: new Date().toLocaleDateString("vi-VN"),
    disclaimer: DEFAULT_PDF_DISCLAIMER,
  };
}

export function ResultsView({
  taxResult,
  comparisonResult,
  roadmap,
  input,
  onEditInputs,
  onStartOver,
  onExportPdf,
}: ResultsViewProps) {
  async function handleExport(): Promise<void> {
    const content = buildPdfContent(taxResult, comparisonResult, roadmap);
    await (onExportPdf ?? exportToPdf)(content);
  }

  // Scroll to top when results are first displayed.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-6">
      {/* Action buttons (not captured in PDF) */}
      <div className="flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={onEditInputs}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          Chỉnh sửa thông tin
        </button>
        {onStartOver && (
          <button
            type="button"
            onClick={onStartOver}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
          >
            Bắt đầu lại
          </button>
        )}
      </div>

      <header>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Kết quả phân tích
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Lộ trình chuyển đổi theo từng giai đoạn (kèm so sánh W-2 / 1099) và
          các khuyến cáo dành cho tiệm của bạn.
        </p>
      </header>

      {/* Capturable area for PDF export — only roadmap + comparison */}
      <div id={PDF_CAPTURE_ELEMENT_ID}>
        <RoadmapSection
          roadmap={roadmap}
          currentCashPercent={input.currentCashPercent}
        />
      </div>

      {/* PDF export button below the comparison */}
      <div className="flex justify-center">
        <PdfExportButton onExport={handleExport} />
      </div>

      <WarningsSection input={input} taxResult={taxResult} roadmap={roadmap} />

      <BackToTopButton />
    </div>
  );
}

export default ResultsView;
