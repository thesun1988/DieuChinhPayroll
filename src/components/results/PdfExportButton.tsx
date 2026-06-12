/**
 * PdfExportButton — triggers generation/download of the results PDF.
 *
 * On click it invokes the provided {@link onExport} callback (which builds and
 * saves the PDF). If generation throws, a Vietnamese error message is shown
 * inline per the design's PDF error-handling table.
 *
 * All visible text is in Vietnamese.
 *
 * @see design.md — "PdfExportButton" / PDF Export error handling
 * @see requirements.md — Requirement 5.3
 */

import { useState } from "react";

/** Props for {@link PdfExportButton}. */
export interface PdfExportButtonProps {
  /** Called when the user requests a PDF export. May be async. May throw on failure. */
  onExport: () => void | Promise<void>;
  /** Optional extra class names for layout. */
  className?: string;
}

export function PdfExportButton({ onExport, className }: PdfExportButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick(): Promise<void> {
    setError(null);
    setLoading(true);
    try {
      await onExport();
    } catch {
      setError("Không thể tạo PDF. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Đang tạo PDF..." : "Xuất PDF"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default PdfExportButton;
