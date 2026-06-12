/**
 * Tests for the comparison and cost result components.
 *
 * Validates: Requirements 2.3, 2.4, 2.5, 2.7, 2.8 (tax breakdown, cost
 * comparison per phase, W-2 vs 1099 comparison) and 4.2/4.3 (Vietnamese
 * labels with English terms, USD formatting).
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { TaxInput } from "../../context/types";
import { calculateTax, compareW2vs1099 } from "../../utils/taxCalculator";
import { generateRoadmap } from "../../utils/roadmapGenerator";
import { formatUSD } from "../../utils/formatters";
import TaxBreakdown from "./TaxBreakdown";
import CostSummary from "./CostSummary";
import ComparisonSection from "./ComparisonSection";

const baseInput: TaxInput = {
  monthlyRevenue: 30000,
  splitRatio: { owner: 4, worker: 6 },
  numberOfWorkers: 3,
  currentCashPercent: 50,
  workerType: "W2",
  state: "CA",
  hoursPerWeek: 40,
};

describe("TaxBreakdown", () => {
  it("renders employer and employee tax line items for W-2", () => {
    const result = calculateTax({ ...baseInput, workerType: "W2" });
    render(<TaxBreakdown result={result} workerType="W2" />);

    expect(
      screen.getByText(/Thuế chủ tiệm đóng \(Employer Taxes\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Thuế thợ đóng \(Employee Taxes\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Thuế thu nhập liên bang \(Federal Income Tax\)/),
    ).toBeInTheDocument();
    // FUTA line should display the formatted USD amount.
    expect(
      screen.getByText(formatUSD(result.employerTaxes!.futa)),
    ).toBeInTheDocument();
  });

  it("renders self-employment line items for 1099", () => {
    const result = calculateTax({ ...baseInput, workerType: "1099" });
    render(<TaxBreakdown result={result} workerType="1099" />);

    expect(
      screen.getByText(/Thuế tự kinh doanh \(Self-Employment Tax\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Thuế tạm tính hàng quý \(Estimated Quarterly Tax\)/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Employer Taxes/)).not.toBeInTheDocument();
  });
});

describe("CostSummary", () => {
  it("renders before/after employer cost and additional cost", () => {
    const result = calculateTax(baseInput);
    render(<CostSummary input={baseInput} result={result} />);

    expect(screen.getByText(/Hiện tại \(Before\)/)).toBeInTheDocument();
    expect(screen.getByText(/Sau chuyển đổi \(After\)/)).toBeInTheDocument();
    expect(
      screen.getByText(/Chi phí tăng thêm \/ năm \(Additional cost \/ year\)/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(formatUSD(result.additionalCostPerYear)),
    ).toBeInTheDocument();
  });

  it("renders a per-phase projection row for each roadmap phase", () => {
    const result = calculateTax(baseInput);
    const roadmap = generateRoadmap({
      currentCashPercent: baseInput.currentCashPercent,
      splitRatio: baseInput.splitRatio,
      workerType: baseInput.workerType,
    });
    render(<CostSummary input={baseInput} result={result} roadmap={roadmap} />);

    for (const phase of roadmap.phases) {
      expect(
        screen.getByText(`Giai đoạn ${phase.phaseNumber}`),
      ).toBeInTheDocument();
    }
  });
});

describe("ComparisonSection", () => {
  it("renders W-2 and 1099 columns with both detailed breakdowns", () => {
    const { w2Result, result1099 } = compareW2vs1099(baseInput);
    render(
      <ComparisonSection
        w2Result={w2Result}
        result1099={result1099}
        input={baseInput}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: /So sánh W-2 và 1099/,
      }),
    ).toBeInTheDocument();

    const w2Header = screen.getByText(/W-2 \(Employee\)/);
    const table = w2Header.closest("table");
    expect(table).not.toBeNull();
    expect(
      within(table as HTMLElement).getByText(/1099 \(Contractor\)/),
    ).toBeInTheDocument();

    // Both detailed breakdown sections render.
    expect(
      screen.getByRole("heading", { name: /Chi tiết thuế W-2/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Chi tiết thuế 1099/ }),
    ).toBeInTheDocument();
  });
});
