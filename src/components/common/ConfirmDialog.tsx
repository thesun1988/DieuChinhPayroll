/**
 * ConfirmDialog — reusable confirmation modal.
 *
 * A controlled, accessible dialog used to confirm potentially destructive
 * actions (e.g. clearing all saved data — see Requirement 5.5). Renders an
 * overlay with a title, message, and Confirm/Cancel actions. Clicking the
 * backdrop or the Cancel button cancels; clicking Confirm invokes `onConfirm`.
 *
 * Renders nothing when `isOpen` is false. All visible text is in Vietnamese
 * with sensible Vietnamese defaults for the action buttons.
 *
 * @see design.md — "common/ConfirmDialog.tsx"
 * @see requirements.md — Requirements 5.4, 5.5
 */

/** Props for {@link ConfirmDialog}. */
export interface ConfirmDialogProps {
  /** Whether the dialog is currently visible. */
  isOpen: boolean;
  /** Dialog heading (Vietnamese). */
  title: string;
  /** Body/explanation text shown to the user (Vietnamese). */
  message: string;
  /** Label for the confirm button. Defaults to "Xác nhận". */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to "Hủy". */
  cancelLabel?: string;
  /** Invoked when the user confirms the action. */
  onConfirm: () => void;
  /** Invoked when the user cancels or dismisses the dialog. */
  onCancel: () => void;
  /**
   * Visual emphasis for the confirm button. Use "danger" (default) for
   * destructive actions like deletion, "primary" for neutral confirmations.
   */
  variant?: "danger" | "primary";
}

/** Reusable, accessible confirmation modal. */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  const confirmClasses =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
      : "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-body"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-bold text-gray-900"
        >
          {title}
        </h2>

        <p
          id="confirm-dialog-body"
          className="mt-3 text-sm leading-relaxed text-gray-700"
        >
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
