/**
 * BackButton — navigation control for stepping back within a flow.
 *
 * A small, reusable button that invokes the provided {@link onClick} handler
 * (typically a FlowContext "go back" dispatch). Renders a left-pointing chevron
 * and a Vietnamese label. The label defaults to "Quay lại" but can be
 * overridden for context-specific wording.
 *
 * @see design.md — "common/BackButton.tsx"
 * @see requirements.md — Requirements 5.4, 5.5
 */

/** Props for {@link BackButton}. */
export interface BackButtonProps {
  /** Invoked when the button is clicked. */
  onClick: () => void;
  /** Visible label (Vietnamese). Defaults to "Quay lại". */
  label?: string;
  /** Optional extra class names for layout. */
  className?: string;
}

/** Reusable back-navigation button. */
export function BackButton({
  onClick,
  label = "Quay lại",
  className,
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${className ?? ""}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </button>
  );
}

export default BackButton;
