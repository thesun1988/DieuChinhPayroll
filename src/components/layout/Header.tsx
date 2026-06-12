/**
 * Header — minimal top bar with the app logo/title.
 *
 * Displayed persistently across every flow step. On small screens (<768px)
 * it renders the hamburger {@link MobileMenu}; on larger screens the menu is
 * hidden via responsive Tailwind utilities.
 *
 * @see design.md — "Project Structure" (components/layout/Header.tsx)
 */

import MobileMenu from "./MobileMenu";

/** Minimal application header with logo/title. */
export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          {/* Simple inline logo mark — no external asset needed. */}
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-lg font-bold text-white"
          >
            N
          </span>
          <span className="text-lg font-bold text-gray-900 sm:text-xl">
            Chuyển Đổi Lương Tiệm Nail
          </span>
        </div>

        {/* Hamburger menu only on mobile (<768px). */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
