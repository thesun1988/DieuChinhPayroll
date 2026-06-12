/**
 * Tests for the input form components.
 *
 * Validates: Requirements 2.1, 2.2, 2.11, 2.12, 4.1 (Vietnamese UI), 4.2,
 * and pre-fill from localStorage (5.2).
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppProvider } from "../../context/AppContext";
import type { TaxInput } from "../../context/types";
import { InputForm } from "./InputForm";
import { RevenueInput } from "./RevenueInput";
import { SplitRatioInput } from "./SplitRatioInput";
import { CashPercentInput } from "./CashPercentInput";
import { StateSelector } from "./StateSelector";

const VALID_INPUT: TaxInput = {
  monthlyRevenue: 30000,
  splitRatio: { owner: 4, worker: 6 },
  numberOfWorkers: 1,
  currentCashPercent: 50,
  workerType: "W2",
  state: "CA",
};

beforeEach(() => {
  localStorage.clear();
});

describe("RevenueInput", () => {
  it("renders a Vietnamese label and reports parsed numeric changes", () => {
    const onChange = vi.fn();
    render(<RevenueInput value={undefined} onChange={onChange} />);
    const input = screen.getByLabelText(/Doanh thu trung bình/i);
    fireEvent.change(input, { target: { value: "25000" } });
    expect(onChange).toHaveBeenCalledWith(25000);
  });

  it("reports undefined when cleared", () => {
    const onChange = vi.fn();
    render(<RevenueInput value={25000} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/Doanh thu trung bình/i), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("shows an inline error message", () => {
    render(
      <RevenueInput
        value={0}
        onChange={() => {}}
        error="Doanh thu phải lớn hơn 0"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Doanh thu phải lớn hơn 0",
    );
  });
});

describe("SplitRatioInput", () => {
  it("selects a preset and reports the split ratio", () => {
    const onChange = vi.fn();
    render(
      <SplitRatioInput value={{ owner: 4, worker: 6 }} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "5/5" }));
    expect(onChange).toHaveBeenCalledWith({ owner: 5, worker: 5 });
  });

  it("marks the matching preset as pressed", () => {
    render(
      <SplitRatioInput value={{ owner: 3, worker: 7 }} onChange={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "3/7" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("treats a non-preset ratio as custom", () => {
    render(
      <SplitRatioInput value={{ owner: 2, worker: 8 }} onChange={() => {}} />,
    );
    expect(screen.getByRole("button", { name: /Tùy chỉnh/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("updates the owner portion via the custom input", () => {
    const onChange = vi.fn();
    render(
      <SplitRatioInput value={{ owner: 4, worker: 6 }} onChange={onChange} />,
    );
    // Click "Tùy chỉnh" to reveal the custom inputs (hidden by default for presets).
    fireEvent.click(screen.getByRole("button", { name: /Tùy chỉnh/i }));
    fireEvent.change(screen.getByLabelText(/Chủ \(Owner\)/i), {
      target: { value: "5" },
    });
    expect(onChange).toHaveBeenCalledWith({ owner: 5, worker: 6 });
  });
});

describe("CashPercentInput", () => {
  it("reports slider changes", () => {
    const onChange = vi.fn();
    render(<CashPercentInput value={50} onChange={onChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "70" } });
    expect(onChange).toHaveBeenCalledWith(70);
  });

  it("reports number input changes", () => {
    const onChange = vi.fn();
    render(<CashPercentInput value={50} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/Tỉ lệ cash hiện tại/i), {
      target: { value: "30" },
    });
    expect(onChange).toHaveBeenCalledWith(30);
  });
});

describe("StateSelector", () => {
  it("renders all states and reports a selection", () => {
    const onChange = vi.fn();
    render(<StateSelector value="AL" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/Tiểu bang/i), {
      target: { value: "CA" },
    });
    expect(onChange).toHaveBeenCalledWith("CA");
  });
});

describe("InputForm", () => {
  function renderForm(props?: {
    initialValues?: TaxInput;
    onSubmit?: (input: TaxInput) => void;
    onBack?: () => void;
  }) {
    const onSubmit = props?.onSubmit ?? vi.fn();
    const onBack = props?.onBack ?? vi.fn();
    render(
      <AppProvider>
        <InputForm
          initialValues={props?.initialValues}
          onSubmit={onSubmit}
          onBack={onBack}
        />
      </AppProvider>,
    );
    return { onSubmit, onBack };
  }

  it("renders all input fields", () => {
    renderForm();
    expect(screen.getByLabelText(/Doanh thu trung bình/i)).toBeInTheDocument();
    expect(screen.getByText(/Tỉ lệ ăn chia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tỉ lệ cash hiện tại/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tiểu bang/i)).toBeInTheDocument();
  });

  it("shows validation errors on invalid submit and does not call onSubmit", () => {
    const { onSubmit } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: /Tính toán/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Doanh thu phải lớn hơn 0")).toBeInTheDocument();
  });

  it("submits a valid TaxInput", () => {
    const { onSubmit } = renderForm({ initialValues: VALID_INPUT });
    fireEvent.click(screen.getByRole("button", { name: /Tính toán/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        monthlyRevenue: 30000,
        splitRatio: { owner: 4, worker: 6 },
        workerType: "W2",
        state: "CA",
      }),
    );
  });

  it("pre-fills from initialValues", () => {
    renderForm({ initialValues: VALID_INPUT });
    expect(screen.getByLabelText(/Doanh thu trung bình/i)).toHaveValue(30000);
    expect(screen.getByLabelText(/Tiểu bang/i)).toHaveValue("CA");
  });

  it("calls onBack when the back button is clicked", () => {
    const { onBack } = renderForm();
    fireEvent.click(screen.getByRole("button", { name: /Quay lại/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("pre-fills from persisted calculatorInput in localStorage", () => {
    // Seed storage so AppProvider hydrates calculatorInput.
    localStorage.setItem(
      "nail-salon-payroll-data",
      JSON.stringify({
        calculatorInput: { ...VALID_INPUT, monthlyRevenue: 12345 },
        disclaimerAccepted: true,
        lastUpdated: new Date().toISOString(),
      }),
    );
    render(
      <AppProvider>
        <InputForm onSubmit={vi.fn()} onBack={vi.fn()} />
      </AppProvider>,
    );
    expect(screen.getByLabelText(/Doanh thu trung bình/i)).toHaveValue(12345);
  });
});
