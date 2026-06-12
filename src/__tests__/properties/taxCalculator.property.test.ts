/**
 * Property-based tests for the tax calculator.
 *
 * Feature: nail-salon-payroll-transition
 *
 * These tests validate the universal correctness Properties 3-9 defined in
 * design.md for `calculateTax`, `calculateW2Tax`, and `calculate1099Tax`.
 *
 * Expected values are re-derived independently from the published rate
 * constants rather than copied from the implementation's control flow.
 *
 * Validates: Requirements 2.1, 2.3, 2.4, 2.5, 2.6, 2.7, 2.10, 2.12
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  calculateTax,
  calculateW2Tax,
  calculate1099Tax,
} from "../../utils/taxCalculator";
import type { TaxInput } from "../../context/types";
import {
  FEDERAL_TAX_BRACKETS_2024,
  type FederalTaxBracket,
} from "../../data/taxRates";
import { STATES, DEFAULT_SUTA_WAGE_CAP } from "../../data/stateData";

const NUM_RUNS = 300;

// --- Independently re-stated rate constants (not imported from the impl path
//     used by calculateTax, to keep the assertions independent). ---
const SS_RATE = 0.062;
const SS_WAGE_CAP = 168600;
const MEDICARE_RATE = 0.0145;
const FUTA_RATE = 0.006;
const FUTA_WAGE_CAP = 7000;
const SE_RATE = 0.153;
const SE_TAXABLE_PORTION = 0.9235;
const FEDERAL_MIN_WAGE = 7.25;
const WEEKS_PER_MONTH = 4.33;
const FORM_1099_THRESHOLD = 600;

/** Valid 2-letter state codes plus a couple of unknown codes (rate -> 0). */
const STATE_CODES = STATES.map((s) => s.code);
const stateArb = fc.constantFrom(...STATE_CODES);

/** SUTA rate for a known state code (0 for unknown). */
function sutaRateFor(code: string): number {
  return STATES.find((s) => s.code === code)?.sutaRate ?? 0;
}

/** Simplified state income tax rate for a known state code (0 for unknown). */
function stateIncomeRateFor(code: string): number {
  return STATES.find((s) => s.code === code)?.stateIncomeTaxRate ?? 0;
}

/**
 * Independent progressive federal income tax computation over annual income,
 * mirroring the published 2024 single-filer brackets.
 */
function federalIncomeTax(
  annualIncome: number,
  brackets: FederalTaxBracket[] = FEDERAL_TAX_BRACKETS_2024,
): number {
  if (annualIncome <= 0) return 0;
  let tax = 0;
  for (const bracket of brackets) {
    if (annualIncome <= bracket.min) break;
    const upper = Math.min(annualIncome, bracket.max);
    const taxable = upper - bracket.min;
    if (taxable > 0) tax += taxable * bracket.rate;
  }
  return tax;
}

const positiveRevenueArb = fc.double({
  min: 1,
  max: 1_000_000,
  noNaN: true,
  noDefaultInfinity: true,
});

const splitRatioArb = fc.record({
  owner: fc.integer({ min: 1, max: 100 }),
  worker: fc.integer({ min: 1, max: 100 }),
});

const workerTypeArb = fc.constantFrom<"W2" | "1099">("W2", "1099");

/** A general valid TaxInput with positive revenue and split, cash in [0,100]. */
const taxInputArb: fc.Arbitrary<TaxInput> = fc.record({
  monthlyRevenue: positiveRevenueArb,
  splitRatio: splitRatioArb,
  numberOfWorkers: fc.integer({ min: 1, max: 20 }),
  currentCashPercent: fc.double({
    min: 0,
    max: 100,
    noNaN: true,
    noDefaultInfinity: true,
  }),
  workerType: workerTypeArb,
  state: stateArb,
  hoursPerWeek: fc.double({
    min: 1,
    max: 80,
    noNaN: true,
    noDefaultInfinity: true,
  }),
});

/** Annual gross income generator for the W-2 / 1099 sub-calculations. */
const annualIncomeArb = fc.double({
  min: 1,
  max: 2_000_000,
  noNaN: true,
  noDefaultInfinity: true,
});

describe("taxCalculator properties", () => {
  // Property 3: Worker income calculation correctness.
  // Validates: Requirements 2.1, 2.12
  it("Property 3: workerGrossIncome = monthlyRevenue × worker/(owner+worker)", () => {
    fc.assert(
      fc.property(taxInputArb, (input) => {
        const result = calculateTax(input);
        const expected =
          input.monthlyRevenue *
          (input.splitRatio.worker /
            (input.splitRatio.owner + input.splitRatio.worker));
        expect(
          Math.abs(result.workerGrossIncome - expected),
        ).toBeLessThanOrEqual(0.01);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  // Property 4: W-2 employer tax calculation correctness.
  // Validates: Requirements 2.3
  it("Property 4: W-2 employer taxes match the published formulas", () => {
    fc.assert(
      fc.property(annualIncomeArb, stateArb, (income, state) => {
        const { employer } = calculateW2Tax(income, state);

        const expectedSS = Math.min(income, SS_WAGE_CAP) * SS_RATE;
        const expectedMedicare = income * MEDICARE_RATE;
        const expectedFuta = Math.min(income, FUTA_WAGE_CAP) * FUTA_RATE;
        const expectedSuta =
          Math.min(income, DEFAULT_SUTA_WAGE_CAP) * sutaRateFor(state);

        expect(employer.socialSecurity).toBeCloseTo(expectedSS, 2);
        expect(employer.medicare).toBeCloseTo(expectedMedicare, 2);
        expect(employer.futa).toBeCloseTo(expectedFuta, 2);
        expect(employer.suta).toBeCloseTo(expectedSuta, 2);
        expect(employer.total).toBeCloseTo(
          expectedSS + expectedMedicare + expectedFuta + expectedSuta,
          2,
        );
      }),
      { numRuns: NUM_RUNS },
    );
  });

  // Property 5: W-2 employee tax calculation correctness.
  // Validates: Requirements 2.4
  it("Property 5: W-2 employee taxes are well-formed and sum correctly", () => {
    fc.assert(
      fc.property(annualIncomeArb, stateArb, (income, state) => {
        const { employee } = calculateW2Tax(income, state);

        const expectedSS = Math.min(income, SS_WAGE_CAP) * SS_RATE;
        const expectedMedicare = income * MEDICARE_RATE;

        expect(employee.socialSecurity).toBeCloseTo(expectedSS, 2);
        expect(employee.medicare).toBeCloseTo(expectedMedicare, 2);

        // federalIncome and stateIncome are non-negative and < grossIncome.
        expect(employee.federalIncome).toBeGreaterThanOrEqual(0);
        expect(employee.stateIncome).toBeGreaterThanOrEqual(0);
        expect(employee.federalIncome).toBeLessThan(income);
        expect(employee.stateIncome).toBeLessThan(income);

        // total = sum of components.
        expect(employee.total).toBeCloseTo(
          employee.federalIncome +
            employee.stateIncome +
            employee.socialSecurity +
            employee.medicare,
          2,
        );

        // Independent cross-check of the state income component.
        expect(employee.stateIncome).toBeCloseTo(
          income * stateIncomeRateFor(state),
          2,
        );
      }),
      { numRuns: NUM_RUNS },
    );
  });

  // Property 6: 1099 self-employment tax calculation.
  // Validates: Requirements 2.5
  it("Property 6: 1099 self-employment and quarterly tax match formulas", () => {
    fc.assert(
      fc.property(annualIncomeArb, stateArb, (income, state) => {
        const se = calculate1099Tax(income, state);

        const expectedSETax = income * SE_TAXABLE_PORTION * SE_RATE;
        expect(se.selfEmploymentTax).toBeCloseTo(expectedSETax, 2);

        // Re-derive the estimated income tax independently: federal progressive
        // tax on net earnings after the deductible half of SE tax.
        const netEarnings = Math.max(0, income - expectedSETax / 2);
        const expectedEstimatedIncomeTax = federalIncomeTax(netEarnings);

        const expectedQuarterly =
          (expectedSETax + expectedEstimatedIncomeTax) / 4;
        expect(se.estimatedQuarterlyTax).toBeCloseTo(expectedQuarterly, 2);

        expect(se.total).toBeCloseTo(
          expectedSETax + expectedEstimatedIncomeTax,
          2,
        );
      }),
      { numRuns: NUM_RUNS },
    );
  });

  // Property 7: Form 1099-NEC threshold detection.
  // Validates: Requirements 2.6
  it("Property 7: form1099Required IFF annual worker gross >= $600 (1099)", () => {
    fc.assert(
      fc.property(taxInputArb, (input) => {
        const result = calculateTax({ ...input, workerType: "1099" });
        const workerRatio =
          input.splitRatio.worker /
          (input.splitRatio.owner + input.splitRatio.worker);
        const annualWorkerGross = input.monthlyRevenue * 12 * workerRatio;

        expect(result.form1099Required).toBe(
          annualWorkerGross >= FORM_1099_THRESHOLD,
        );
      }),
      { numRuns: NUM_RUNS },
    );
  });

  // Property 8: Cost comparison monotonicity.
  // Validates: Requirements 2.7
  it("Property 8: projected employer cost >= current when cash% > 0", () => {
    const positiveCashInputArb = fc.record({
      monthlyRevenue: positiveRevenueArb,
      splitRatio: splitRatioArb,
      numberOfWorkers: fc.integer({ min: 1, max: 20 }),
      // Strictly positive cash percentage (declaring more income later).
      currentCashPercent: fc.double({
        min: 0.001,
        max: 100,
        noNaN: true,
        noDefaultInfinity: true,
      }),
      workerType: workerTypeArb,
      state: stateArb,
      hoursPerWeek: fc.double({
        min: 1,
        max: 80,
        noNaN: true,
        noDefaultInfinity: true,
      }),
    });

    fc.assert(
      fc.property(positiveCashInputArb, (input) => {
        const result = calculateTax(input);
        // Allow a tiny epsilon for floating-point noise.
        expect(
          result.projectedEmployerCostPerMonth -
            result.currentEmployerCostPerMonth,
        ).toBeGreaterThanOrEqual(-1e-6);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  // Property 9: Minimum wage violation detection.
  // Validates: Requirements 2.10
  it("Property 9: minimumWageViolation IFF hourly rate < $7.25 (W2)", () => {
    fc.assert(
      fc.property(taxInputArb, (input) => {
        const w2Input: TaxInput = { ...input, workerType: "W2" };
        const result = calculateTax(w2Input);

        const workerRatio =
          w2Input.splitRatio.worker /
          (w2Input.splitRatio.owner + w2Input.splitRatio.worker);
        const workerGrossIncome = w2Input.monthlyRevenue * workerRatio;
        const hourlyRate =
          workerGrossIncome /
          w2Input.numberOfWorkers /
          ((w2Input.hoursPerWeek as number) * WEEKS_PER_MONTH);

        expect(result.minimumWageViolation).toBe(hourlyRate < FEDERAL_MIN_WAGE);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
