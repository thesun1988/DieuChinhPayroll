/**
 * PDF export — captures the results page as rendered in the browser.
 *
 * Uses html2canvas to screenshot the styled DOM (with full Vietnamese
 * diacritics, colored boxes, Tailwind styling) and places the resulting
 * image(s) into an A4 jsPDF document. This produces a PDF that looks
 * identical to the browser view.
 *
 * @see requirements.md — Requirement 5.3
 */

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { ComparisonResult, Roadmap, TaxResult } from "../context/types";

/** Content passed to {@link exportToPdf}. */
export interface PdfContent {
  title: string;
  calculatorResult?: TaxResult;
  comparisonResult?: ComparisonResult;
  roadmap?: Roadmap;
  generatedDate: string;
  disclaimer: string;
}

/**
 * Transliterate Vietnamese to ASCII — kept for legacy/test compatibility.
 */
export function toAsciiVietnamese(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");
}

/** A4 dimensions in mm. */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 10;
const CONTENT_WIDTH_MM = A4_WIDTH_MM - PAGE_MARGIN_MM * 2;

/**
 * Build the jsPDF document (without saving). Synchronous fallback for tests.
 * Creates a single-page A4 with just the title text.
 */
export function buildPdfDocument(content: PdfContent): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFontSize(14);
  doc.text(toAsciiVietnamese(content.title), PAGE_MARGIN_MM, 20);
  doc.setFontSize(10);
  doc.text(`Ngay tao: ${content.generatedDate}`, PAGE_MARGIN_MM, 30);
  doc.text(toAsciiVietnamese(content.disclaimer), PAGE_MARGIN_MM, 40, {
    maxWidth: CONTENT_WIDTH_MM,
  });
  return doc;
}

/** Default Vietnamese disclaimer. */
export const DEFAULT_PDF_DISCLAIMER =
  "Mọi thông tin trong tài liệu này chỉ mang tính tham khảo và không cấu " +
  "thành tư vấn tài chính, thuế hoặc pháp lý. Hãy tham vấn CPA hoặc luật sư " +
  "thuế trước khi đưa ra bất kỳ quyết định nào.";

/**
 * The ID of the DOM element to capture for the PDF.
 * The ResultsView wraps its content in an element with this ID.
 */
export const PDF_CAPTURE_ELEMENT_ID = "pdf-capture-area";

/**
 * Generate and download a PDF by capturing the rendered results DOM.
 *
 * Looks for a DOM element with id {@link PDF_CAPTURE_ELEMENT_ID}, renders it
 * to a canvas via html2canvas, and splits it across A4 pages.
 *
 * Falls back to the simple text-based document if the element is not found.
 */
export async function exportToPdf(content: PdfContent): Promise<void> {
  const element = document.getElementById(PDF_CAPTURE_ELEMENT_ID);

  if (!element) {
    // Fallback: simple text PDF.
    const doc = buildPdfDocument(content);
    doc.save("ket-qua-chuyen-doi-luong.pdf");
    return;
  }

  // Capture the DOM element at Full HD width (1920px) regardless of viewport.
  // This ensures consistent layout even when viewed on mobile.
  const FHD_WIDTH = 1920;
  const originalWidth = element.style.width;
  const originalMaxWidth = element.style.maxWidth;
  const originalPosition = element.style.position;
  const originalLeft = element.style.left;

  // Temporarily force full-HD width for the capture.
  element.style.width = `${FHD_WIDTH}px`;
  element.style.maxWidth = `${FHD_WIDTH}px`;
  element.style.position = "absolute";
  element.style.left = "-9999px";

  const canvas = await html2canvas(element, {
    scale: 1.5, // Good quality without being too large
    useCORS: true,
    logging: false,
    backgroundColor: "#f9fafb",
    windowWidth: FHD_WIDTH,
    width: FHD_WIDTH,
  });

  // Restore original styles.
  element.style.width = originalWidth;
  element.style.maxWidth = originalMaxWidth;
  element.style.position = originalPosition;
  element.style.left = originalLeft;

  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;

  // Scale the image to fit A4 width (minus margins).
  const pdfImgWidth = CONTENT_WIDTH_MM;
  const pdfImgHeight = (imgHeightPx * pdfImgWidth) / imgWidthPx;

  const pageContentHeight = A4_HEIGHT_MM - PAGE_MARGIN_MM * 2;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let remainingHeight = pdfImgHeight;
  let srcYOffset = 0;
  let pageNum = 0;

  while (remainingHeight > 0) {
    if (pageNum > 0) {
      doc.addPage();
    }

    const sliceHeight = Math.min(pageContentHeight, remainingHeight);

    // Calculate source coordinates in the original image pixels.
    const srcYPx = (srcYOffset / pdfImgHeight) * imgHeightPx;
    const srcHeightPx = (sliceHeight / pdfImgHeight) * imgHeightPx;

    // Create a cropped canvas for this page slice.
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = imgWidthPx;
    sliceCanvas.height = Math.round(srcHeightPx);
    const ctx = sliceCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(
        canvas,
        0,
        Math.round(srcYPx),
        imgWidthPx,
        Math.round(srcHeightPx),
        0,
        0,
        imgWidthPx,
        Math.round(srcHeightPx),
      );
    }

    const sliceData = sliceCanvas.toDataURL("image/png");
    doc.addImage(
      sliceData,
      "PNG",
      PAGE_MARGIN_MM,
      PAGE_MARGIN_MM,
      pdfImgWidth,
      sliceHeight,
    );

    srcYOffset += sliceHeight;
    remainingHeight -= sliceHeight;
    pageNum++;
  }

  doc.save("ket-qua-chuyen-doi-luong.pdf");
}
