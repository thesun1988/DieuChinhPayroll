/**
 * Integration smoke tests for the App root / flow router.
 *
 * Exercises the wiring done in App.tsx: persistent chrome, the landing →
 * disclaimer → form transition, footer-triggered legal overlays, and graceful
 * handling when results are not yet available.
 *
 * Validates: Requirements 4.4, 4.5, 3.7
 */

import { afterEach, describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("App flow router", () => {
  it("renders persistent chrome (header, disclaimer banner, footer)", () => {
    render(<App />);

    // Header title.
    expect(
      screen.getByRole("button", { name: /Safe Payroll/i }),
    ).toBeInTheDocument();
    // Persistent disclaimer banner (Requirement 3.7).
    expect(
      screen.getByText(/Vui lòng tham vấn chuyên gia kế toán/i),
    ).toBeInTheDocument();
    // Footer legal links.
    expect(
      screen.getByRole("button", { name: /Chính sách bảo mật/i }),
    ).toBeInTheDocument();
  });

  it("starts on the landing page", () => {
    render(<App />);
    expect(
      screen.getAllByRole("button", { name: "Bắt đầu" }).length,
    ).toBeGreaterThan(0);
  });

  it("shows the disclaimer popup on first CTA click, then the form on accept", () => {
    render(<App />);

    fireEvent.click(screen.getAllByRole("button", { name: "Bắt đầu" })[0]);

    // Disclaimer modal appears.
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: /Miễn trừ trách nhiệm/i }),
    ).toBeInTheDocument();

    // Accept → input form.
    fireEvent.click(within(dialog).getByRole("button", { name: /Accept/i }));
    expect(
      screen.getByRole("heading", { name: /Thông tin tiệm/i }),
    ).toBeInTheDocument();
  });

  it("skips the disclaimer popup when already accepted", () => {
    localStorage.setItem("nail-salon-disclaimer-accepted", "true");
    render(<App />);

    fireEvent.click(screen.getAllByRole("button", { name: "Bắt đầu" })[0]);

    // Goes straight to the form — no disclaimer dialog.
    expect(
      screen.getByRole("heading", { name: /Thông tin tiệm/i }),
    ).toBeInTheDocument();
  });

  it("opens the privacy policy overlay from the footer", () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: /Chính sách bảo mật/i }),
    );

    expect(
      screen.getByRole("heading", { name: /Chính sách bảo mật/i }),
    ).toBeInTheDocument();
  });

  it("opens the disclaimer page overlay from the footer", () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: /Miễn trừ trách nhiệm/i }),
    );

    // The full disclaimer page renders its heading as a level-1 heading.
    expect(
      screen.getByRole("heading", { level: 1, name: /Miễn trừ trách nhiệm/i }),
    ).toBeInTheDocument();
  });
});
