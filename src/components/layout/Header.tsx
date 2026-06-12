/**
 * Header — minimal top bar with the app title.
 *
 * Displayed persistently across every flow step. The title "Safe Payroll" is
 * clickable and returns the user to the landing page. On small screens (<768px)
 * it renders the hamburger {@link MobileMenu}.
 *
 * @see design.md — "Project Structure" (components/layout/Header.tsx)
 */

import { useFlow } from "../../context/FlowContext";
import MobileMenu from "./MobileMenu";

/** Minimal application header with clickable title. */
export default function Header() {
  const { dispatch } = useFlow();

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <button
          type="button"
          onClick={() => dispatch({ type: "START_OVER" })}
          className="text-lg font-bold text-gray-900 hover:text-emerald-700 transition-colors sm:text-xl"
        >
          Safe Payroll
        </button>

        {/* Hamburger menu only on mobile (<768px). */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
