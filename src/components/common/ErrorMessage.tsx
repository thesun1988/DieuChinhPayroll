/**
 * ErrorMessage — inline validation error display.
 *
 * Renders a small red message below a form field. Renders nothing when no
 * message is provided, so callers can pass an optional error directly.
 *
 * @see design.md — "common/ErrorMessage.tsx"
 * @see requirements.md — Requirement 1.5, 2.1
 */

/** Props for {@link ErrorMessage}. */
export interface ErrorMessageProps {
  /** The error message to display (Vietnamese). When empty, nothing renders. */
  message?: string;
  /** Optional id so the field can reference it via aria-describedby. */
  id?: string;
}

export function ErrorMessage({ message, id }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

export default ErrorMessage;
