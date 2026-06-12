/**
 * Unit tests for the disclaimer components: DisclaimerPopup, DisclaimerPage,
 * and PrivacyPolicyPage.
 *
 * The page overlays consume FlowContext (for their default close handler), so
 * they are rendered inside a FlowProvider. Tests assert Vietnamese content,
 * the "Vietnamese (English)" term pattern, Accept/Reject behaviour, the
 * localStorage acceptance side effect, and overlay close dispatching.
 *
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type ReactNode } from "react";
import { FlowProvider, useFlow } from "../../context/FlowContext";
import { DISCLAIMER_KEY } from "../../utils/storage";
import DisclaimerPopup from "./DisclaimerPopup";
import DisclaimerPage from "./DisclaimerPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";

const wrapper = ({ children }: { children: ReactNode }) => (
  <FlowProvider>{children}</FlowProvider>
);

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("DisclaimerPopup", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(
      <DisclaimerPopup
        isVisible={false}
        onAccept={() => {}}
        onReject={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the disclaimer dialog with Vietnamese (English) terms when visible", () => {
    render(
      <DisclaimerPopup isVisible onAccept={() => {}} onReject={() => {}} />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/Miễn trừ trách nhiệm \(Disclaimer\)/);
    expect(dialog).toHaveTextContent(/CPA/);
    expect(dialog).toHaveTextContent(/tax attorney/);
  });

  it("invokes onAccept and persists acceptance to localStorage", () => {
    const onAccept = vi.fn();
    render(
      <DisclaimerPopup isVisible onAccept={onAccept} onReject={() => {}} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Tôi đã đọc và đồng ý \(Accept\)/ }),
    );
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(DISCLAIMER_KEY)).toBe("true");
  });

  it("invokes onReject without persisting acceptance", () => {
    const onReject = vi.fn();
    render(
      <DisclaimerPopup isVisible onAccept={() => {}} onReject={onReject} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Từ chối \(Reject\)/ }));
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(DISCLAIMER_KEY)).toBeNull();
  });
});

describe("DisclaimerPage", () => {
  it("renders full disclaimer content with consult/liability sections", () => {
    render(<DisclaimerPage />, { wrapper });
    const dialog = screen.getByRole("dialog");
    expect(
      screen.getByRole("heading", {
        name: /Miễn trừ trách nhiệm \(Disclaimer\)/,
      }),
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/tham vấn/);
    expect(dialog).toHaveTextContent(/CPA/);
    expect(dialog).toHaveTextContent(/Giới hạn trách nhiệm/);
    expect(dialog).toHaveTextContent(/localStorage/);
  });

  it("calls the onClose override when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<DisclaimerPage onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: /Đóng \(Close\)/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it("dispatches SHOW_DISCLAIMER_PAGE false via FlowContext by default", () => {
    render(
      <FlowProvider>
        <FlowProbe />
        <DisclaimerPage />
      </FlowProvider>,
    );
    // Open the overlay first so we can observe it closing.
    fireEvent.click(screen.getByTestId("open-disclaimer"));
    expect(screen.getByTestId("disclaimer-flag").textContent).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Đóng (Close)" }));
    expect(screen.getByTestId("disclaimer-flag").textContent).toBe("false");
  });
});

describe("PrivacyPolicyPage", () => {
  it("renders privacy content covering no-collection, localStorage, no sharing", () => {
    render(<PrivacyPolicyPage />, { wrapper });
    const dialog = screen.getByRole("dialog");
    expect(
      screen.getByRole("heading", {
        name: /Chính sách bảo mật \(Privacy Policy\)/,
      }),
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/không thu thập/);
    expect(dialog).toHaveTextContent(/localStorage/);
    expect(dialog).toHaveTextContent(/bên thứ ba/);
    expect(dialog).toHaveTextContent(/cookies theo dõi/);
    expect(dialog).toHaveTextContent(
      /không cần đăng nhập|không cần.*tài khoản/i,
    );
  });

  it("calls the onClose override when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<PrivacyPolicyPage onClose={onClose} />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: /Đóng \(Close\)/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it("dispatches SHOW_PRIVACY_PAGE false via FlowContext by default", () => {
    render(
      <FlowProvider>
        <FlowProbe />
        <PrivacyPolicyPage />
      </FlowProvider>,
    );
    fireEvent.click(screen.getByTestId("open-privacy"));
    expect(screen.getByTestId("privacy-flag").textContent).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Đóng (Close)" }));
    expect(screen.getByTestId("privacy-flag").textContent).toBe("false");
  });
});

// --- Test helpers ----------------------------------------------------------

/**
 * Probe component surfacing the FlowContext overlay flags into the DOM and
 * exposing buttons to open them, so tests can assert close behaviour.
 */
function FlowProbe() {
  const { state, dispatch } = useFlow();
  return (
    <div>
      <span data-testid="disclaimer-flag">
        {String(state.showDisclaimerPage)}
      </span>
      <span data-testid="privacy-flag">{String(state.showPrivacyPage)}</span>
      <button
        type="button"
        data-testid="open-disclaimer"
        onClick={() => dispatch({ type: "SHOW_DISCLAIMER_PAGE", show: true })}
      />
      <button
        type="button"
        data-testid="open-privacy"
        onClick={() => dispatch({ type: "SHOW_PRIVACY_PAGE", show: true })}
      />
    </div>
  );
}
