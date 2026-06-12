/**
 * MobileMenu — hamburger menu for small screens (<768px).
 *
 * Requirement 4.5 calls for a mobile-optimized layout with a hamburger menu
 * below the 768px breakpoint. The parent {@link Header} only renders this
 * component within an `md:hidden` wrapper, so it is naturally hidden on larger
 * viewports; the component itself manages the open/close state of the dropdown
 * panel.
 *
 * The menu exposes the same legal links as the {@link Footer}, dispatching the
 * overlay actions on {@link FlowContext}.
 *
 * @see requirements.md — Requirement 4.5
 */

import { useState } from "react";
import { useFlow } from "../../context/FlowContext";

/** Hamburger menu shown on mobile viewports (<768px). */
export default function MobileMenu() {
  const { dispatch } = useFlow();
  const [open, setOpen] = useState(false);

  const openDisclaimer = () => {
    dispatch({ type: "SHOW_DISCLAIMER_PAGE", show: true });
    setOpen(false);
  };

  const openPrivacy = () => {
    dispatch({ type: "SHOW_PRIVACY_PAGE", show: true });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? "Đóng menu (Close menu)" : "Mở menu (Open menu)"}
        className="flex h-10 w-10 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
      >
        {/* Hamburger / close icon (inline SVG, no asset dependency). */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-64 rounded-md border border-gray-200 bg-white py-2 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={openDisclaimer}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Miễn trừ trách nhiệm (Disclaimer)
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={openPrivacy}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Chính sách bảo mật (Privacy Policy)
          </button>
        </div>
      )}
    </div>
  );
}
