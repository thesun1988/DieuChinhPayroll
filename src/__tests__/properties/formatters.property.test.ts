import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { formatUSD } from "../../utils/formatters";

/**
 * Feature: nail-salon-payroll-transition, Property 10: USD formatting correctness —
 * For any non-negative number, formatUSD SHALL produce a string matching the
 * pattern `$X,XXX.XX` (dollar sign, comma-separated thousands, exactly 2 decimal
 * places). Additionally, parsing the formatted string back to a number SHALL
 * produce the original value rounded to 2 decimal places.
 *
 * Validates: Requirements 4.3
 */
describe("Property 10: USD formatting correctness", () => {
  // Pattern: dollar sign, 1-3 leading digits, comma-separated groups of 3,
  // followed by exactly 2 decimal places.
  const USD_PATTERN = /^\$\d{1,3}(,\d{3})*\.\d{2}$/;

  // Smart generator: non-negative finite numbers within a range that avoids
  // floating-point precision loss in the integer portion (>= 2^53 cannot be
  // represented exactly), keeping the round-trip check meaningful.
  const nonNegativeAmount = fc.double({
    min: 0,
    max: 1e12,
    noNaN: true,
    noDefaultInfinity: true,
  });

  it("produces output matching the $X,XXX.XX pattern", () => {
    fc.assert(
      fc.property(nonNegativeAmount, (amount) => {
        expect(formatUSD(amount)).toMatch(USD_PATTERN);
      }),
      { numRuns: 100 },
    );
  });

  it("round-trips: parsing the formatted string yields the value rounded to 2 decimals", () => {
    fc.assert(
      fc.property(nonNegativeAmount, (amount) => {
        const formatted = formatUSD(amount);
        const parsed = Number(formatted.replace(/[$,]/g, ""));
        const expected = Math.round(amount * 100) / 100;
        expect(parsed).toBeCloseTo(expected, 2);
      }),
      { numRuns: 100 },
    );
  });
});
