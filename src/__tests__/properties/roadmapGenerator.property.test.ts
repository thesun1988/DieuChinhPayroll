import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { generateRoadmap } from "../../utils/roadmapGenerator";
import type { RoadmapInput } from "../../context/types";

/**
 * Property-based tests for the transition roadmap generator.
 *
 * Feature: nail-salon-payroll-transition
 *
 * These tests validate the universal correctness properties defined in
 * design.md for `generateRoadmap`.
 */

/** Maximum cash reduction allowed in a single phase (percentage points). */
const MAX_REDUCTION_PER_PHASE = 15;

/** Small tolerance to absorb floating-point rounding (round2 in the impl). */
const EPSILON = 0.011;

/**
 * Generate a valid RoadmapInput:
 *  - currentCashPercent in [1, 100]
 *  - positive split ratios (owner, worker)
 *  - workerType W2 | 1099
 */
const roadmapInputArb: fc.Arbitrary<RoadmapInput> = fc.record({
  currentCashPercent: fc.double({
    min: 1,
    max: 100,
    noNaN: true,
    noDefaultInfinity: true,
  }),
  splitRatio: fc.record({
    owner: fc.integer({ min: 1, max: 100 }),
    worker: fc.integer({ min: 1, max: 100 }),
  }),
  workerType: fc.constantFrom<"W2" | "1099">("W2", "1099"),
});

describe("generateRoadmap properties", () => {
  // Feature: nail-salon-payroll-transition, Property 1: Roadmap phases are
  // complete and well-structured — at least 3 phases, each with a valid
  // phaseNumber, checkPercent + cashPercent = 100, positive durationMonths,
  // non-negative startMonth, and non-empty notes string. The first phase's
  // cashPercent is less than the input cashPercent, and the last phase's
  // cashPercent is 0.
  // Validates: Requirements 1.1, 1.4
  it("Property 1: roadmap phases are complete and well-structured", () => {
    fc.assert(
      fc.property(roadmapInputArb, (input) => {
        const roadmap = generateRoadmap(input);
        const { phases } = roadmap;

        // At least 3 phases.
        expect(phases.length).toBeGreaterThanOrEqual(3);

        phases.forEach((phase, index) => {
          // Valid, sequential phaseNumber (1-based).
          expect(phase.phaseNumber).toBe(index + 1);

          // checkPercent + cashPercent = 100.
          expect(phase.checkPercent + phase.cashPercent).toBeCloseTo(100, 2);

          // Percentages are within [0, 100].
          expect(phase.cashPercent).toBeGreaterThanOrEqual(0);
          expect(phase.cashPercent).toBeLessThanOrEqual(100);
          expect(phase.checkPercent).toBeGreaterThanOrEqual(0);
          expect(phase.checkPercent).toBeLessThanOrEqual(100);

          // Positive durationMonths.
          expect(phase.durationMonths).toBeGreaterThan(0);

          // Non-negative startMonth.
          expect(phase.startMonth).toBeGreaterThanOrEqual(0);

          // endMonth = startMonth + durationMonths.
          expect(phase.endMonth).toBe(phase.startMonth + phase.durationMonths);

          // Non-empty notes string.
          expect(typeof phase.notes).toBe("string");
          expect(phase.notes.trim().length).toBeGreaterThan(0);
        });

        // First phase reduces cash below the input.
        expect(phases[0].cashPercent).toBeLessThan(input.currentCashPercent);

        // Last phase lands on 0 cash.
        expect(phases[phases.length - 1].cashPercent).toBe(0);
      }),
      { numRuns: 200 },
    );
  });

  // Feature: nail-salon-payroll-transition, Property 2: Roadmap duration scales
  // with cash percentage — IF currentCashPercent <= 60% THEN totalDurationMonths
  // is between 6 and 12 (inclusive) with at least 3 phases, AND IF
  // currentCashPercent > 60% THEN totalDurationMonths is between 12 and 18
  // (inclusive) with at least 5 phases. Additionally, no single phase reduces
  // cash percentage by more than 15 percentage points.
  // Validates: Requirements 1.2, 1.3
  it("Property 2: roadmap duration scales with cash percentage", () => {
    fc.assert(
      fc.property(roadmapInputArb, (input) => {
        const roadmap = generateRoadmap(input);
        const { phases, totalDurationMonths } = roadmap;
        const cash = input.currentCashPercent;

        if (cash <= 60) {
          expect(totalDurationMonths).toBeGreaterThanOrEqual(6);
          expect(totalDurationMonths).toBeLessThanOrEqual(12);
          expect(phases.length).toBeGreaterThanOrEqual(3);
        } else {
          expect(totalDurationMonths).toBeGreaterThanOrEqual(12);
          expect(totalDurationMonths).toBeLessThanOrEqual(18);
          expect(phases.length).toBeGreaterThanOrEqual(5);
        }

        // totalDurationMonths equals the sum of phase durations and the final
        // endMonth.
        const summedDuration = phases.reduce(
          (sum, phase) => sum + phase.durationMonths,
          0,
        );
        expect(totalDurationMonths).toBe(summedDuration);
        expect(totalDurationMonths).toBe(phases[phases.length - 1].endMonth);

        // No single phase reduces cash by more than 15 percentage points.
        let previousCash = cash;
        phases.forEach((phase) => {
          const reduction = previousCash - phase.cashPercent;
          expect(reduction).toBeLessThanOrEqual(
            MAX_REDUCTION_PER_PHASE + EPSILON,
          );
          // Cash must be non-increasing across phases.
          expect(reduction).toBeGreaterThanOrEqual(-EPSILON);
          previousCash = phase.cashPercent;
        });
      }),
      { numRuns: 200 },
    );
  });
});
