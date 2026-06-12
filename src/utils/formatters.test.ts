import { describe, it, expect } from "vitest";
import {
  formatUSD,
  formatPercent,
  formatRatio,
  formatMonth,
} from "./formatters";

describe("formatUSD", () => {
  it("formats whole dollars with 2 decimal places", () => {
    expect(formatUSD(1234)).toBe("$1,234.00");
  });

  it("formats cents with comma-separated thousands", () => {
    expect(formatUSD(1234567.89)).toBe("$1,234,567.89");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatUSD(9.999)).toBe("$10.00");
  });

  it("formats zero", () => {
    expect(formatUSD(0)).toBe("$0.00");
  });

  it("handles small amounts below a dollar", () => {
    expect(formatUSD(0.5)).toBe("$0.50");
  });

  it("places the sign before the dollar sign for negatives", () => {
    expect(formatUSD(-1234.5)).toBe("-$1,234.50");
  });
});

describe("formatPercent", () => {
  it("formats a whole-number percentage", () => {
    expect(formatPercent(60)).toBe("60%");
  });

  it("rounds to the nearest integer", () => {
    expect(formatPercent(33.4)).toBe("33%");
    expect(formatPercent(66.6)).toBe("67%");
  });

  it("formats zero", () => {
    expect(formatPercent(0)).toBe("0%");
  });
});

describe("formatRatio", () => {
  it("formats owner/worker split", () => {
    expect(formatRatio(4, 6)).toBe("4/6");
    expect(formatRatio(5, 5)).toBe("5/5");
    expect(formatRatio(3, 7)).toBe("3/7");
  });
});

describe("formatMonth", () => {
  it("formats a Vietnamese month label", () => {
    expect(formatMonth(3)).toBe("Tháng 3");
    expect(formatMonth(12)).toBe("Tháng 12");
  });
});
