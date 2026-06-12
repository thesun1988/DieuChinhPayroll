/**
 * Property-based tests for input validation.
 *
 * Feature: nail-salon-payroll-transition, Property 13: Invalid input rejection
 * For any cashPercent value outside [0, 100], OR any non-positive split ratio,
 * OR any negative revenue, OR any non-positive worker count, the corresponding
 * validator returns { valid: false } with at least one error message in
 * Vietnamese.
 *
 * Validates: Requirements 1.5
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  validateCashPercent,
  validateSplitRatio,
  validateRevenue,
  validateWorkerCount,
} from "../../utils/validators";

const NUM_RUNS = 100;

/**
 * Vietnamese text contains diacritics outside the basic ASCII range. A message
 * that contains at least one such character is taken as evidence the message is
 * in Vietnamese (the validators use fixed Vietnamese strings).
 */
const VIETNAMESE_CHARS =
  /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;

function expectRejectedInVietnamese(result: {
  valid: boolean;
  errors: { field: string; message: string }[];
}) {
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
  expect(result.errors.some((e) => VIETNAMESE_CHARS.test(e.message))).toBe(
    true,
  );
}

describe("Property 13: Invalid input rejection", () => {
  it("rejects cashPercent outside [0, 100]", () => {
    // Feature: nail-salon-payroll-transition, Property 13: Invalid input rejection
    const invalidCashPercent = fc.oneof(
      // strictly below 0
      fc.double({ min: -1e6, max: -Number.MIN_VALUE, noNaN: true }),
      // strictly above 100
      fc.double({
        min: 100 + Number.EPSILON,
        max: 1e6,
        noNaN: true,
        minExcluded: true,
      }),
    );

    fc.assert(
      fc.property(invalidCashPercent, (value) => {
        expectRejectedInVietnamese(validateCashPercent(value));
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("rejects non-positive split ratios", () => {
    // Feature: nail-salon-payroll-transition, Property 13: Invalid input rejection
    const nonPositive = fc.double({ min: -1e6, max: 0, noNaN: true });
    const positive = fc.double({
      min: Number.MIN_VALUE,
      max: 1e6,
      noNaN: true,
    });

    // At least one side is non-positive: (np, any) or (any, np).
    const invalidSplit = fc.oneof(
      fc.tuple(nonPositive, fc.oneof(nonPositive, positive)),
      fc.tuple(fc.oneof(nonPositive, positive), nonPositive),
    );

    fc.assert(
      fc.property(invalidSplit, ([owner, worker]) => {
        expectRejectedInVietnamese(validateSplitRatio(owner, worker));
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("rejects non-positive revenue", () => {
    // Feature: nail-salon-payroll-transition, Property 13: Invalid input rejection
    const invalidRevenue = fc.double({ min: -1e9, max: 0, noNaN: true });

    fc.assert(
      fc.property(invalidRevenue, (value) => {
        expectRejectedInVietnamese(validateRevenue(value));
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("rejects non-positive worker count", () => {
    // Feature: nail-salon-payroll-transition, Property 13: Invalid input rejection
    const invalidWorkerCount = fc.integer({ min: -1_000_000, max: 0 });

    fc.assert(
      fc.property(invalidWorkerCount, (value) => {
        expectRejectedInVietnamese(validateWorkerCount(value));
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
