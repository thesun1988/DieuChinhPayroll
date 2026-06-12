/**
 * ClearDataButton — "Xóa dữ liệu" action with confirmation.
 *
 * Renders a destructive-styled button that, when clicked, opens a
 * {@link ConfirmDialog}. On confirmation it clears all persisted data via
 * {@link clearAllData} and dispatches a `RESET` action to {@link AppContext} so
 * the in-memory state returns to its defaults.
 *
 * The component is fully self-contained: it pulls `dispatch` from
 * {@link useAppContext} itself and requires no wiring beyond being rendered
 * inside an {@link AppProvider}. App.tsx placement is handled separately
 * (task 10.1).
 *
 * All visible text is in Vietnamese.
 *
 * @see design.md — "common/ConfirmDialog.tsx" / data deletion confirmation
 * @see requirements.md — Requirements 5.4, 5.5
 */

import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { clearAllData } from "../../utils/storage";
import ConfirmDialog from "./ConfirmDialog";

/** Props for {@link ClearDataButton}. */
export interface ClearDataButtonProps {
  /** Optional extra class names for layout. */
  className?: string;
  /**
   * Optional callback invoked after data has been cleared and state reset.
   * Useful for navigation side effects (e.g. returning to the landing page).
   */
  onCleared?: () => void;
}

/** Button + confirmation dialog that clears all saved data. */
export function ClearDataButton({
  className,
  onCleared,
}: ClearDataButtonProps) {
  const { dispatch } = useAppContext();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleConfirm(): void {
    clearAllData();
    dispatch({ type: "RESET" });
    setIsConfirmOpen(false);
    onCleared?.();
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        Xóa dữ liệu
      </button>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xóa toàn bộ dữ liệu?"
        message="Hành động này sẽ xóa vĩnh viễn toàn bộ dữ liệu đã lưu trên trình duyệt của bạn và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel="Xóa dữ liệu"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}

export default ClearDataButton;
