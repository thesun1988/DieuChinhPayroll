/**
 * Tests for the warnings section components.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 2.10
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { Roadmap, TaxInput, TaxResult } from "../../context/types";
import { RED_FLAGS } from "../../data/redFlags";
import { RedFlagCard } from "./RedFlagCard";
import { TipReportingNote } from "./TipReportingNote";
import { MinimumWageWarning } from "./MinimumWageWarning";
import { WarningsSection, selectRelevantRedFlags } from "./WarningsSection";

const baseInput: TaxInput = {
  monthlyRevenue: 20000,
  splitRatio: { owner: 4, worker: 6 },
  numberOfWorkers: 3,
  currentCashPercent: 50,
  workerType: "W2",
  state: "CA",
  hoursPerWeek: 40,
};

function makeResult(overrides: Partial<TaxResult> = {}): TaxResult {
  return {
    workerGrossIncome: 12000,
    currentTaxedPortion: 6000,
    projectedTaxedPortion: 12000,
    currentEmployerCostPerMonth: 500,
    projectedEmployerCostPerMonth: 1000,
    additionalCostPerMonth: 500,
    additionalCostPerYear: 6000,
    currentWorkerTakeHome: 11000,
    projectedWorkerTakeHome: 10000,
    minimumWageViolation: false,
    form1099Required: false,
    ...overrides,
  };
}

const baseRoadmap: Roadmap = {
  phases: [],
  totalDurationMonths: 9,
  recommendation: "Chuyển đổi dần.",
};

describe("RedFlagCard", () => {
  it("renders title, description, prevention and severity label", () => {
    const flag = RED_FLAGS[0];
    render(<RedFlagCard redFlag={flag} />);
    expect(screen.getByText(flag.title)).toBeInTheDocument();
    expect(screen.getByText(flag.description)).toBeInTheDocument();
    expect(screen.getByText(flag.prevention)).toBeInTheDocument();
    expect(screen.getByText("Cách phòng tránh")).toBeInTheDocument();
  });

  it("shows a severity-specific badge label", () => {
    const high = RED_FLAGS.find((f) => f.severity === "high")!;
    render(<RedFlagCard redFlag={high} />);
    expect(screen.getByText("Rủi ro cao")).toBeInTheDocument();
  });
});

describe("TipReportingNote", () => {
  it("renders Vietnamese tip reporting guidance", () => {
    render(<TipReportingNote />);
    expect(
      screen.getByText(/Hướng dẫn khai báo tiền tip/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Form 4070/i)).toBeInTheDocument();
  });
});

describe("MinimumWageWarning", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(<MinimumWageWarning visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders an alert when visible", () => {
    render(<MinimumWageWarning visible />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/Cảnh báo vi phạm lương tối thiểu/i),
    ).toBeInTheDocument();
  });
});

describe("selectRelevantRedFlags", () => {
  it("excludes the minimum wage flag for 1099 workers", () => {
    const flags = selectRelevantRedFlags(
      { ...baseInput, workerType: "1099" },
      makeResult({ minimumWageViolation: true }),
    );
    expect(flags.some((f) => f.id === "below-minimum-wage")).toBe(false);
  });

  it("includes the minimum wage flag only for W-2 with a violation", () => {
    const withViolation = selectRelevantRedFlags(
      baseInput,
      makeResult({ minimumWageViolation: true }),
    );
    expect(withViolation.some((f) => f.id === "below-minimum-wage")).toBe(true);

    const withoutViolation = selectRelevantRedFlags(
      baseInput,
      makeResult({ minimumWageViolation: false }),
    );
    expect(withoutViolation.some((f) => f.id === "below-minimum-wage")).toBe(
      false,
    );
  });

  it("includes the 1099-NEC flag only when filing is required", () => {
    const required = selectRelevantRedFlags(
      { ...baseInput, workerType: "1099" },
      makeResult({ form1099Required: true }),
    );
    expect(required.some((f) => f.id === "mismatched-1099")).toBe(true);

    const notRequired = selectRelevantRedFlags(
      { ...baseInput, workerType: "1099" },
      makeResult({ form1099Required: false }),
    );
    expect(notRequired.some((f) => f.id === "mismatched-1099")).toBe(false);
  });

  it("sorts high severity flags before lower severity flags", () => {
    const flags = selectRelevantRedFlags(baseInput, makeResult());
    const severities = flags.map((f) => f.severity);
    const order = { high: 0, medium: 1, low: 2 } as const;
    for (let i = 1; i < severities.length; i++) {
      expect(order[severities[i]]).toBeGreaterThanOrEqual(
        order[severities[i - 1]],
      );
    }
  });
});

describe("WarningsSection", () => {
  it("renders the heading, tip note and disclaimer", () => {
    render(
      <WarningsSection
        input={baseInput}
        taxResult={makeResult()}
        roadmap={baseRoadmap}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /Khuyến cáo & Cảnh báo IRS/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hướng dẫn khai báo tiền tip/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/tham vấn CPA hoặc luật sư thuế/i),
    ).toBeInTheDocument();
  });

  it("shows the minimum wage warning for W-2 violations", () => {
    render(
      <WarningsSection
        input={baseInput}
        taxResult={makeResult({ minimumWageViolation: true })}
        roadmap={baseRoadmap}
      />,
    );
    expect(
      screen.getByText(/Cảnh báo vi phạm lương tối thiểu/i),
    ).toBeInTheDocument();
  });

  it("hides the minimum wage warning for 1099 even if flagged", () => {
    render(
      <WarningsSection
        input={{ ...baseInput, workerType: "1099" }}
        taxResult={makeResult({ minimumWageViolation: true })}
        roadmap={baseRoadmap}
      />,
    );
    expect(
      screen.queryByText(/Cảnh báo vi phạm lương tối thiểu/i),
    ).not.toBeInTheDocument();
  });

  it("renders a card for each relevant red flag", () => {
    const result = makeResult();
    const expected = selectRelevantRedFlags(baseInput, result);
    render(
      <WarningsSection
        input={baseInput}
        taxResult={result}
        roadmap={baseRoadmap}
      />,
    );
    const section = screen.getByRole("region", {
      name: /Khuyến cáo & Cảnh báo IRS/i,
    });
    for (const flag of expected) {
      expect(within(section).getByText(flag.title)).toBeInTheDocument();
    }
  });
});
