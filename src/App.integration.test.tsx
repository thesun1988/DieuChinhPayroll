/**
 * Component integration tests for the App root / flow router.
 *
 * Where App.test.tsx covers smoke-level wiring, this suite exercises the full
 * end-to-end user journeys through the single-page flow:
 *
 * - Flow navigation: landing → disclaimer → form → analyzing → results
 *   (advancing fake timers through the AnalysisAnimation min-display window).
 * - Disclaimer persistence: the popup is skipped when acceptance was already
 *   stored under the 'nail-salon-disclaimer-accepted' key.
 * - Form pre-fill from the persisted 'nail-salon-payroll-data' localStorage key.
 * - Responsive rendering: the hamburger mobile menu (Header's md:hidden wrapper)
 *   opens the legal overlays on small screens.
 * - Vietnamese content format follows the "Vietnamese (English)" pattern.
 *
 * Validates: Requirements 4.1, 4.2, 4.4, 4.5, 5.2, 7.4
 */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { TaxInput } from "./context/types";

const DISCLAIMER_KEY = "nail-salon-disclaimer-accepted";
const DATA_KEY = "nail-salon-payroll-data";

const VALID_INPUT: TaxInput = {
  monthlyRevenue: 30000,
  splitRatio: { owner: 4, worker: 6 },
  numberOfWorkers: 1,
  currentCashPercent: 50,
  workerType: "W2",
  state: "CA",
};

/** Seed localStorage so a returning visitor skips the disclaimer gate. */
function seedAcceptedDisclaimer(): void {
  localStorage.setItem(DISCLAIMER_KEY, "true");
}

/** Seed the persisted calculator input (the AppProvider hydrates from this). */
function seedPersistedInput(input: TaxInput): void {
  localStorage.setItem(
    DATA_KEY,
    JSON.stringify({
      calculatorInput: input,
      disclaimerAccepted: true,
      lastUpdated: new Date().toISOString(),
    }),
  );
}

/** Click the first landing-page "Bắt đầu" CTA. */
function clickStartCta(): void {
  fireEvent.click(screen.getAllByRole("button", { name: "Bắt đầu" })[0]);
}

/** Fill the input form with a valid set of values. */
function fillValidForm(): void {
  fireEvent.change(screen.getByLabelText(/Doanh thu trung bình/i), {
    target: { value: String(VALID_INPUT.monthlyRevenue) },
  });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("Flow navigation: landing → disclaimer → form → analyzing → results", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("walks the full journey end-to-end", () => {
    render(<App />);

    // 1. Landing page.
    expect(
      screen.getByRole("heading", {
        name: /Chuyển Đổi Lương Một Cách An Toàn/i,
      }),
    ).toBeInTheDocument();

    // 2. Landing → disclaimer (first visit shows the gate).
    clickStartCta();
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: /Miễn trừ trách nhiệm/i }),
    ).toBeInTheDocument();

    // 3. Disclaimer → form.
    fireEvent.click(within(dialog).getByRole("button", { name: /Accept/i }));
    expect(
      screen.getByRole("heading", { name: /Thông tin tiệm/i }),
    ).toBeInTheDocument();

    // 4. Form → analyzing.
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /Tính toán/i }));
    expect(
      screen.getByRole("heading", { name: /Đang phân tích dữ liệu của bạn/i }),
    ).toBeInTheDocument();

    // 5. Analyzing → results. Advance past the clamped min-display window
    //    (useAnalysisAnimation clamps the default 2000ms into [1500, 3000]).
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(
      screen.getByRole("heading", { name: /Kết quả phân tích/i }),
    ).toBeInTheDocument();
    // The analyzing transition is gone once results render.
    expect(
      screen.queryByRole("heading", {
        name: /Đang phân tích dữ liệu của bạn/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("does not reveal results before the minimum analyzing display time", () => {
    seedAcceptedDisclaimer();
    render(<App />);

    clickStartCta();
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /Tính toán/i }));

    // Still analyzing just before the 1.5s minimum elapses.
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(
      screen.getByRole("heading", { name: /Đang phân tích dữ liệu của bạn/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Kết quả phân tích/i }),
    ).not.toBeInTheDocument();
  });

  it("returns to the form via 'Chỉnh sửa thông tin' from results", () => {
    seedAcceptedDisclaimer();
    render(<App />);

    clickStartCta();
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /Tính toán/i }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.getByRole("heading", { name: /Kết quả phân tích/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Chỉnh sửa thông tin/i }),
    );
    expect(
      screen.getByRole("heading", { name: /Thông tin tiệm/i }),
    ).toBeInTheDocument();
  });
});

describe("Disclaimer persistence (Requirement 7.4)", () => {
  it("skips the popup and goes straight to the form when already accepted", () => {
    seedAcceptedDisclaimer();
    render(<App />);

    clickStartCta();

    // No disclaimer dialog — straight to the input form.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Thông tin tiệm/i }),
    ).toBeInTheDocument();
  });

  it("shows the popup on a fresh visit with no stored acceptance", () => {
    render(<App />);

    clickStartCta();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("persists acceptance to localStorage after accepting", () => {
    render(<App />);

    clickStartCta();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /Accept/i }));

    expect(localStorage.getItem(DISCLAIMER_KEY)).toBe("true");
  });
});

describe("Form pre-fill from localStorage (Requirement 5.2)", () => {
  it("pre-fills the form from the persisted calculator input", () => {
    seedPersistedInput({ ...VALID_INPUT, monthlyRevenue: 54321 });
    render(<App />);

    // disclaimerAccepted was seeded true, so the CTA jumps to the form.
    clickStartCta();

    expect(screen.getByLabelText(/Doanh thu trung bình/i)).toHaveValue(54321);
    expect(screen.getByLabelText(/Tiểu bang/i)).toHaveValue(VALID_INPUT.state);
  });
});

describe("Responsive rendering: mobile menu (Requirement 4.5)", () => {
  it("renders the hamburger menu inside the md:hidden (<768px) wrapper", () => {
    render(<App />);

    const hamburger = screen.getByRole("button", { name: /Mở menu/i });
    // The wrapper hides the menu at the md breakpoint (>=768px) via Tailwind.
    expect(hamburger.closest("div.md\\:hidden")).not.toBeNull();
  });

  it("opens the legal links from the mobile menu and shows the overlay", () => {
    render(<App />);

    // Open the dropdown.
    fireEvent.click(screen.getByRole("button", { name: /Mở menu/i }));
    const menu = screen.getByRole("menu");

    // Open the disclaimer overlay from the menu.
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: /Miễn trừ trách nhiệm/i }),
    );
    expect(
      screen.getByRole("heading", { level: 1, name: /Miễn trừ trách nhiệm/i }),
    ).toBeInTheDocument();
  });
});

describe("Vietnamese content format (Requirements 4.1, 4.2)", () => {
  it("uses the 'Vietnamese (English)' pattern across the form", () => {
    seedAcceptedDisclaimer();
    render(<App />);

    clickStartCta();

    // Heading and field labels carry the English term in parentheses.
    expect(
      screen.getByText(/Thông tin tiệm \(Salon information\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Doanh thu trung bình hàng tháng \(Monthly revenue\)/),
    ).toBeInTheDocument();

    // Action buttons follow the same bilingual pattern.
    const calculate = screen.getByRole("button", { name: /Tính toán/i });
    expect(calculate).toHaveTextContent(/Tính toán \(Calculate\)/);
    const back = screen.getByRole("button", { name: /Quay lại/i });
    expect(back).toHaveTextContent(/Quay lại \(Back\)/);
  });
});
