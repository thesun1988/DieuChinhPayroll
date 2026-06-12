/**
 * Unit tests for the configurable phase count and per-phase dollar amounts
 * added to the roadmap generator.
 *
 * Validates: a user-requested number of phases is honored (subject to the
 * 15-point per-phase cash cap), and each phase carries check/cash dollar
 * amounts for the worker pool, per worker, and the owner's share.
 */

import { describe, it, expect } from "vitest";
import { generateRoadmap } from "./roadmapGenerator";
import type { RoadmapInput } from "../context/types";

const baseInput: RoadmapInput = {
  currentCashPercent: 50,
  splitRatio: { owner: 4, worker: 6 },
  workerType: "W2",
  monthlyRevenue: 30000,
  numberOfWorkers: 3,
};

describe("generateRoadmap — configurable phase count", () => {
  it("honors a requested phase count", () => {
    const roadmap = generateRoadmap({ ...baseInput, numberOfPhases: 4 });
    expect(roadmap.phases).toHaveLength(4);
  });

  it("honors a larger requested phase count", () => {
    const roadmap = generateRoadmap({ ...baseInput, numberOfPhases: 8 });
    expect(roadmap.phases).toHaveLength(8);
  });

  it("raises the count to respect the 15-point per-phase cap", () => {
    // 90% cash needs at least ceil(90/15) = 6 phases, even if 2 are requested.
    const roadmap = generateRoadmap({
      ...baseInput,
      currentCashPercent: 90,
      numberOfPhases: 2,
    });
    expect(roadmap.phases.length).toBeGreaterThanOrEqual(6);

    let previousCash = 90;
    for (const phase of roadmap.phases) {
      expect(previousCash - phase.cashPercent).toBeLessThanOrEqual(15.011);
      previousCash = phase.cashPercent;
    }
  });

  it("still ends at 0% cash regardless of the requested count", () => {
    const roadmap = generateRoadmap({ ...baseInput, numberOfPhases: 5 });
    expect(roadmap.phases[roadmap.phases.length - 1].cashPercent).toBe(0);
  });
});

describe("generateRoadmap — per-phase dollar amounts", () => {
  it("computes worker and owner after-cost breakdowns for W-2 and 1099", () => {
    const roadmap = generateRoadmap({ ...baseInput, numberOfPhases: 4 });

    // Worker share = 30000 * 6/10 = 18000; owner share = 12000.
    for (const phase of roadmap.phases) {
      expect(phase.amounts).toBeDefined();
      const a = phase.amounts!;
      expect(a.workerGrossIncome).toBeCloseTo(18000, 2);
      expect(a.ownerGrossIncome).toBeCloseTo(12000, 2);

      // --- W-2: tax withheld on the CHECK portion only.
      const w2w = a.w2.worker;
      expect(w2w.taxWithheld).toBe(true);
      expect(w2w.gross).toBeCloseTo(18000, 2);
      expect(w2w.tax).toBeGreaterThanOrEqual(0);
      // Check portion = gross * checkPercent / 100.
      const expectedCheckGross = (18000 * phase.checkPercent) / 100;
      // checkReceived = checkGross − tax (withheld from check).
      expect(w2w.checkReceived).toBeCloseTo(expectedCheckGross - w2w.tax, 2);
      // cashReceived = full cash (untaxed).
      const expectedCash = (18000 * phase.cashPercent) / 100;
      expect(w2w.cashReceived).toBeCloseTo(expectedCash, 2);
      // amountReceived = checkReceived + cashReceived.
      expect(w2w.amountReceived).toBeCloseTo(
        w2w.checkReceived + w2w.cashReceived,
        2,
      );
      // For W-2, net after tax equals what was paid out.
      expect(w2w.netAfterTax).toBeCloseTo(w2w.amountReceived, 2);

      // --- 1099: owner pays the FULL gross; tax is an estimate on check only.
      const w1099 = a.result1099.worker;
      expect(w1099.taxWithheld).toBe(false);
      expect(w1099.gross).toBeCloseTo(18000, 2);
      // Owner hands over the full gross (no withholding).
      expect(w1099.amountReceived).toBeCloseTo(18000, 2);
      // check + cash = gross (split by percent, no deduction).
      expect(w1099.checkReceived).toBeCloseTo(expectedCheckGross, 2);
      expect(w1099.cashReceived).toBeCloseTo(expectedCash, 2);
      // Net after the worker pays their estimated tax on check.
      expect(w1099.netAfterTax).toBeCloseTo(18000 - w1099.tax, 2);

      // --- Owner: net = gross − employer cost.
      for (const cls of [a.w2, a.result1099]) {
        expect(cls.owner.gross).toBeCloseTo(12000, 2);
        expect(cls.owner.employerCost).toBeGreaterThanOrEqual(0);
        expect(cls.owner.net).toBeCloseTo(
          cls.owner.gross - cls.owner.employerCost,
          2,
        );
      }
      // 1099 owner bears no employer payroll cost.
      expect(a.result1099.owner.employerCost).toBe(0);
      expect(a.result1099.owner.retentionPercent).toBeCloseTo(100, 2);
    }
  });

  it("taxes only the check portion (cash is untaxed)", () => {
    // Worker pool gross = 1000, at a phase with some check and some cash.
    const roadmap = generateRoadmap({
      currentCashPercent: 50,
      splitRatio: { owner: 0.0001, worker: 1 },
      workerType: "W2",
      monthlyRevenue: 1000,
      numberOfWorkers: 1,
      state: "CA",
      numberOfPhases: 2,
    });
    const phase = roadmap.phases[0];
    const a = phase.amounts!;
    const checkGross = 1000 * (phase.checkPercent / 100);
    const cashGross = 1000 * (phase.cashPercent / 100);

    // W-2: checkReceived + tax ≈ checkGross (rounding tolerance).
    expect(a.w2.worker.checkReceived + a.w2.worker.tax).toBeCloseTo(
      checkGross,
      0,
    );
    // Cash delivered in full (untaxed).
    expect(a.w2.worker.cashReceived).toBeCloseTo(cashGross, 0);
    // amountReceived = checkReceived + cashReceived.
    expect(a.w2.worker.amountReceived).toBeCloseTo(
      a.w2.worker.checkReceived + a.w2.worker.cashReceived,
      1,
    );

    // 1099: full check + full cash handed over, no withholding.
    expect(a.result1099.worker.checkReceived).toBeCloseTo(checkGross, 0);
    expect(a.result1099.worker.cashReceived).toBeCloseTo(cashGross, 0);
    expect(a.result1099.worker.amountReceived).toBeCloseTo(1000, 0);
  });

  it("W-2 withholds tax on the check portion only; 1099 pays full gross", () => {
    const roadmap = generateRoadmap({ ...baseInput, numberOfPhases: 4 });
    const a = roadmap.phases[0].amounts!;
    // W-2: tax deducted from check portion; cash untouched.
    // amountReceived = (checkGross - tax) + cash < gross.
    expect(a.w2.worker.amountReceived).toBeLessThan(a.w2.worker.gross);
    expect(a.w2.worker.tax).toBeGreaterThan(0);
    // 1099: full gross handed over (check + cash, no withholding).
    expect(a.result1099.worker.amountReceived).toBeCloseTo(
      a.result1099.worker.gross,
      2,
    );
    expect(a.result1099.worker.tax).toBeGreaterThan(0);
    // W-2 owner employer cost also based on check portion.
    expect(a.w2.owner.employerCost).toBeGreaterThan(0);
    expect(a.w2.owner.net).toBeLessThan(a.w2.owner.gross);
  });

  it("omits amounts when no revenue is supplied", () => {
    const roadmap = generateRoadmap({
      currentCashPercent: 50,
      splitRatio: { owner: 4, worker: 6 },
      workerType: "W2",
    });
    for (const phase of roadmap.phases) {
      expect(phase.amounts).toBeUndefined();
    }
  });

  it("treats a missing worker count as a single worker for per-worker amounts", () => {
    const roadmap = generateRoadmap({
      currentCashPercent: 50,
      splitRatio: { owner: 4, worker: 6 },
      workerType: "W2",
      monthlyRevenue: 30000,
      numberOfPhases: 4,
    });
    const w = roadmap.phases[0].amounts!.w2.worker;
    expect(w.amountReceivedPerWorker).toBeCloseTo(w.amountReceived, 2);
    expect(w.netAfterTaxPerWorker).toBeCloseTo(w.netAfterTax, 2);
  });
});
