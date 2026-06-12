/**
 * Footer — site footer with links to the Disclaimer and Privacy Policy pages.
 *
 * The two legal pages are not URL routes; they are modeled as overlay flags in
 * {@link FlowContext}. Clicking a footer link dispatches the corresponding
 * `SHOW_DISCLAIMER_PAGE` / `SHOW_PRIVACY_PAGE` action so the overlay opens from
 * any step in the flow.
 *
 * @see design.md — "Project Structure" (components/layout/Footer.tsx)
 * @see requirements.md — Requirements 7.1, 7.7
 */

import { useFlow } from "../../context/FlowContext";

/** Site footer with links to legal overlay pages. */
export default function Footer() {
  const { dispatch } = useFlow();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <nav
          aria-label="Liên kết pháp lý (Legal links)"
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
        >
          <p className="text-sm text-gray-500">© {currentYear} LASH NP</p>
          <ul className="flex items-center gap-4">
            <li>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "SHOW_DISCLAIMER_PAGE", show: true })
                }
                className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
              >
                Miễn trừ trách nhiệm (Disclaimer)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "SHOW_PRIVACY_PAGE", show: true })
                }
                className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
              >
                Chính sách bảo mật (Privacy Policy)
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
