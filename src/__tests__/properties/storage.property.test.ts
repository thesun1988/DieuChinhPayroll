/**
 * Property-based tests for localStorage persistence.
 *
 * Feature: nail-salon-payroll-transition
 *
 * Property 11: Storage round-trip preservation — for any valid StoredData
 * object, saving to localStorage and then loading produces a value deeply
 * equal to the original object.
 *
 * Property 12: Storage clear operation — for any valid StoredData object,
 * after saving and then calling clearAllData(), loadData() returns null and
 * hasStoredData() returns false.
 *
 * Validates: Requirements 5.1, 5.2, 5.4
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import {
  saveData,
  loadData,
  clearAllData,
  hasStoredData,
} from "../../utils/storage";
import type {
  StoredData,
  TaxInput,
  TaxResult,
  ComparisonResult,
  RoadmapInput,
  Roadmap,
  Phase,
  SplitRatio,
  EmployerTaxes,
  EmployeeTaxes,
  SelfEmploymentTaxes,
} from "../../context/types";

const NUM_RUNS = 100;

/**
 * A JSON-safe finite number. localStorage persistence serializes through
 * JSON, which cannot represent NaN/Infinity (they become `null`) and folds
 * `-0` into `0`. Constraining the generators to finite numbers and
 * normalizing `-0` keeps save→load a lossless round-trip.
 */
const finiteNumber: fc.Arbitrary<number> = fc
  .double({ min: -1e9, max: 1e9, noNaN: true, noDefaultInfinity: true })
  .map((n) => (Object.is(n, -0) ? 0 : n));

const splitRatioArb: fc.Arbitrary<SplitRatio> = fc.record({
  owner: finiteNumber,
  worker: finiteNumber,
});

const taxInputArb: fc.Arbitrary<TaxInput> = fc.record(
  {
    monthlyRevenue: finiteNumber,
    splitRatio: splitRatioArb,
    numberOfWorkers: fc.integer({ min: 1, max: 50 }),
    currentCashPercent: finiteNumber,
    workerType: fc.constantFrom<"W2" | "1099">("W2", "1099"),
    state: fc.string(),
    hoursPerWeek: finiteNumber,
  },
  {
    requiredKeys: [
      "monthlyRevenue",
      "splitRatio",
      "numberOfWorkers",
      "currentCashPercent",
      "workerType",
      "state",
    ],
  },
);

const employerTaxesArb: fc.Arbitrary<EmployerTaxes> = fc.record({
  socialSecurity: finiteNumber,
  medicare: finiteNumber,
  futa: finiteNumber,
  suta: finiteNumber,
  total: finiteNumber,
});

const employeeTaxesArb: fc.Arbitrary<EmployeeTaxes> = fc.record({
  federalIncome: finiteNumber,
  stateIncome: finiteNumber,
  socialSecurity: finiteNumber,
  medicare: finiteNumber,
  total: finiteNumber,
});

const selfEmploymentTaxesArb: fc.Arbitrary<SelfEmploymentTaxes> = fc.record({
  selfEmploymentTax: finiteNumber,
  estimatedQuarterlyTax: finiteNumber,
  total: finiteNumber,
});

const taxResultArb: fc.Arbitrary<TaxResult> = fc.record(
  {
    workerGrossIncome: finiteNumber,
    currentTaxedPortion: finiteNumber,
    projectedTaxedPortion: finiteNumber,
    employerTaxes: employerTaxesArb,
    employeeTaxes: employeeTaxesArb,
    selfEmploymentTaxes: selfEmploymentTaxesArb,
    currentEmployerCostPerMonth: finiteNumber,
    projectedEmployerCostPerMonth: finiteNumber,
    additionalCostPerMonth: finiteNumber,
    additionalCostPerYear: finiteNumber,
    currentWorkerTakeHome: finiteNumber,
    projectedWorkerTakeHome: finiteNumber,
    minimumWageViolation: fc.boolean(),
    form1099Required: fc.boolean(),
  },
  {
    requiredKeys: [
      "workerGrossIncome",
      "currentTaxedPortion",
      "projectedTaxedPortion",
      "currentEmployerCostPerMonth",
      "projectedEmployerCostPerMonth",
      "additionalCostPerMonth",
      "additionalCostPerYear",
      "currentWorkerTakeHome",
      "projectedWorkerTakeHome",
      "minimumWageViolation",
      "form1099Required",
    ],
  },
);

const comparisonResultArb: fc.Arbitrary<ComparisonResult> = fc.record({
  w2Result: taxResultArb,
  result1099: taxResultArb,
});

const roadmapInputArb: fc.Arbitrary<RoadmapInput> = fc.record({
  currentCashPercent: finiteNumber,
  splitRatio: splitRatioArb,
  workerType: fc.constantFrom<"W2" | "1099">("W2", "1099"),
});

const phaseArb: fc.Arbitrary<Phase> = fc.record({
  phaseNumber: fc.integer({ min: 1, max: 20 }),
  checkPercent: finiteNumber,
  cashPercent: finiteNumber,
  durationMonths: fc.integer({ min: 1, max: 24 }),
  startMonth: fc.integer({ min: 0, max: 24 }),
  endMonth: fc.integer({ min: 0, max: 48 }),
  notes: fc.string(),
});

const roadmapArb: fc.Arbitrary<Roadmap> = fc.record({
  phases: fc.array(phaseArb, { maxLength: 8 }),
  totalDurationMonths: fc.integer({ min: 0, max: 48 }),
  recommendation: fc.string(),
});

const classificationAnswersArb: fc.Arbitrary<Record<string, boolean>> =
  fc.dictionary(fc.string(), fc.boolean());

/**
 * Generate a valid StoredData object. The two required fields
 * (`disclaimerAccepted`, `lastUpdated`) are always present; every optional
 * field is either present with a generated value or omitted entirely (never
 * an explicit `undefined`, which JSON would drop and break deep equality).
 */
const storedDataArb: fc.Arbitrary<StoredData> = fc.record(
  {
    calculatorInput: taxInputArb,
    calculatorResult: taxResultArb,
    comparisonResult: comparisonResultArb,
    roadmapInput: roadmapInputArb,
    roadmapResult: roadmapArb,
    classificationAnswers: classificationAnswersArb,
    disclaimerAccepted: fc.boolean(),
    lastUpdated: fc
      .date({
        min: new Date("2000-01-01T00:00:00.000Z"),
        max: new Date("2100-01-01T00:00:00.000Z"),
      })
      .map((d) => d.toISOString()),
  },
  { requiredKeys: ["disclaimerAccepted", "lastUpdated"] },
);

describe("storage persistence properties", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Feature: nail-salon-payroll-transition, Property 11: Storage round-trip
  // preservation — saving a valid StoredData object then loading it yields a
  // deeply equal object.
  // Validates: Requirements 5.1, 5.2
  it("Property 11: save then load preserves the StoredData object", () => {
    fc.assert(
      fc.property(storedDataArb, (stored) => {
        // Start from a clean slate so leftover state cannot leak into the
        // merge performed by saveData.
        clearAllData();

        saveData(stored);
        const loaded = loadData();

        expect(loaded).toEqual(stored);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  // Feature: nail-salon-payroll-transition, Property 12: Storage clear
  // operation — after saving then clearing, loadData() is null and
  // hasStoredData() is false.
  // Validates: Requirements 5.4
  it("Property 12: clearAllData removes persisted data", () => {
    fc.assert(
      fc.property(storedDataArb, (stored) => {
        saveData(stored);
        clearAllData();

        expect(loadData()).toBeNull();
        expect(hasStoredData()).toBe(false);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
