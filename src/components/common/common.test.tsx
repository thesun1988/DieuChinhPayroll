/**
 * Unit tests for the common utility components: ConfirmDialog, BackButton, and
 * ClearDataButton.
 *
 * Covers visibility gating, Vietnamese content, confirm/cancel behaviour, the
 * back-navigation callback, and the data-deletion flow (clearAllData +
 * AppContext RESET dispatch).
 *
 * Validates: Requirements 5.4, 5.5
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type ReactNode } from "react";
import { AppProvider } from "../../context/AppContext";
import {
  STORAGE_KEY,
  hasStoredData,
  loadData,
  saveData,
} from "../../utils/storage";
import ConfirmDialog from "./ConfirmDialog";
import BackButton from "./BackButton";
import ClearDataButton from "./ClearDataButton";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="Tiêu đề"
        message="Nội dung"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the title and message when open", () => {
    render(
      <ConfirmDialog
        isOpen
        title="Xóa toàn bộ dữ liệu?"
        message="Hành động không thể hoàn tác."
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Xóa toàn bộ dữ liệu?");
    expect(dialog).toHaveTextContent("Hành động không thể hoàn tác.");
  });

  it("uses Vietnamese default button labels", () => {
    render(
      <ConfirmDialog
        isOpen
        title="T"
        message="M"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Xác nhận" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy" })).toBeInTheDocument();
  });

  it("invokes onConfirm when the confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="T"
        message="M"
        confirmLabel="Xóa"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("invokes onCancel when the cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        title="T"
        message="M"
        cancelLabel="Hủy"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("BackButton", () => {
  it("renders the default Vietnamese label", () => {
    render(<BackButton onClick={() => {}} />);
    expect(
      screen.getByRole("button", { name: /Quay lại/ }),
    ).toBeInTheDocument();
  });

  it("renders a custom label when provided", () => {
    render(<BackButton onClick={() => {}} label="Trở về trang chủ" />);
    expect(
      screen.getByRole("button", { name: /Trở về trang chủ/ }),
    ).toBeInTheDocument();
  });

  it("invokes onClick when clicked", () => {
    const onClick = vi.fn();
    render(<BackButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /Quay lại/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

const appWrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe("ClearDataButton", () => {
  it('renders the "Xóa dữ liệu" trigger button', () => {
    render(<ClearDataButton />, { wrapper: appWrapper });
    expect(
      screen.getByRole("button", { name: "Xóa dữ liệu" }),
    ).toBeInTheDocument();
  });

  it("opens a confirmation dialog before deleting", () => {
    render(<ClearDataButton />, { wrapper: appWrapper });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xóa dữ liệu" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not clear data when the dialog is cancelled", () => {
    saveData({ classificationAnswers: { q1: true } });
    expect(hasStoredData()).toBe(true);

    render(<ClearDataButton />, { wrapper: appWrapper });
    fireEvent.click(screen.getByRole("button", { name: "Xóa dữ liệu" }));
    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("clears all saved data and invokes onCleared when confirmed", () => {
    saveData({ classificationAnswers: { q1: true } });
    expect(hasStoredData()).toBe(true);

    const onCleared = vi.fn();
    render(<ClearDataButton onCleared={onCleared} />, { wrapper: appWrapper });
    fireEvent.click(screen.getByRole("button", { name: "Xóa dữ liệu" }));
    // Confirm button inside the dialog also reads "Xóa dữ liệu".
    const confirmButtons = screen.getAllByRole("button", {
      name: "Xóa dữ liệu",
    });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    // The previously saved data is gone. The AppContext RESET dispatch may
    // re-persist a fresh, empty default object, so we assert the prior data was
    // cleared rather than that the key is absent entirely.
    expect(loadData()?.classificationAnswers ?? {}).toEqual({});
    expect(onCleared).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
