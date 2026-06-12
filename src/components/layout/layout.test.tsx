/**
 * Unit tests for the layout components: Header, Footer, MobileMenu, and
 * DisclaimerBanner.
 *
 * Footer and MobileMenu interact with FlowContext, so they are rendered inside
 * a FlowProvider. Tests assert Vietnamese content, the "Vietnamese (English)"
 * term pattern, and that footer/menu links dispatch the overlay actions.
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type ReactNode } from "react";
import { FlowProvider } from "../../context/FlowContext";
import Header from "./Header";
import Footer from "./Footer";
import MobileMenu from "./MobileMenu";
import DisclaimerBanner from "./DisclaimerBanner";

const wrapper = ({ children }: { children: ReactNode }) => (
  <FlowProvider>{children}</FlowProvider>
);

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("Header", () => {
  it("renders the app title as a clickable button", () => {
    render(<Header />, { wrapper });
    expect(
      screen.getByRole("button", { name: "Safe Payroll" }),
    ).toBeInTheDocument();
  });

  it("includes the mobile hamburger menu trigger", () => {
    render(<Header />, { wrapper });
    expect(
      screen.getByRole("button", { name: /Mở menu \(Open menu\)/ }),
    ).toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("renders disclaimer and privacy policy links", () => {
    render(<Footer />, { wrapper });
    expect(
      screen.getByRole("button", {
        name: /Miễn trừ trách nhiệm \(Disclaimer\)/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Chính sách bảo mật \(Privacy Policy\)/,
      }),
    ).toBeInTheDocument();
  });

  it("opens the disclaimer overlay via FlowContext when clicked", () => {
    render(
      <FlowProvider>
        <Footer />
        <FlowProbe />
      </FlowProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /Miễn trừ trách nhiệm \(Disclaimer\)/,
      }),
    );
    expect(screen.getByTestId("disclaimer-flag").textContent).toBe("true");
  });

  it("opens the privacy overlay via FlowContext when clicked", () => {
    render(
      <FlowProvider>
        <Footer />
        <FlowProbe />
      </FlowProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /Chính sách bảo mật \(Privacy Policy\)/,
      }),
    );
    expect(screen.getByTestId("privacy-flag").textContent).toBe("true");
  });
});

describe("MobileMenu", () => {
  it("is collapsed initially and expands on click", () => {
    render(<MobileMenu />, { wrapper });
    const toggle = screen.getByRole("button", {
      name: /Mở menu \(Open menu\)/,
    });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(toggle);
    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(
      within(menu).getByText(/Miễn trừ trách nhiệm \(Disclaimer\)/),
    ).toBeInTheDocument();
    expect(
      within(menu).getByText(/Chính sách bảo mật \(Privacy Policy\)/),
    ).toBeInTheDocument();
  });

  it("dispatches the privacy overlay action and closes the menu", () => {
    render(
      <FlowProvider>
        <MobileMenu />
        <FlowProbe />
      </FlowProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Mở menu \(Open menu\)/ }),
    );
    fireEvent.click(
      within(screen.getByRole("menu")).getByText(
        /Chính sách bảo mật \(Privacy Policy\)/,
      ),
    );
    expect(screen.getByTestId("privacy-flag").textContent).toBe("true");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("DisclaimerBanner", () => {
  it("renders the CPA/tax attorney reminder with the term pattern", () => {
    render(<DisclaimerBanner />);
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent(/CPA/);
    expect(note).toHaveTextContent(/tax attorney/);
    expect(note).toHaveTextContent(/tham vấn/);
  });
});

// --- Test helpers ----------------------------------------------------------

/**
 * Probe component that surfaces the current FlowContext overlay flags into the
 * DOM so tests can assert that actions dispatched correctly.
 */
import { useFlow } from "../../context/FlowContext";

function FlowProbe() {
  const { state } = useFlow();
  return (
    <div>
      <span data-testid="disclaimer-flag">
        {String(state.showDisclaimerPage)}
      </span>
      <span data-testid="privacy-flag">{String(state.showPrivacyPage)}</span>
    </div>
  );
}
