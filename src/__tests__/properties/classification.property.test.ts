/**
 * Property-based tests for W-2 vs 1099 classification scoring.
 *
 * Feature: nail-salon-payroll-transition, Property 14: Classification checklist
 * scoring consistency.
 *
 * For any set of boolean answers to classification questions, IF the number of
 * W2-pointing answers exceeds the number of 1099-pointing answers THEN the
 * recommendation is 'W2', and vice versa. The classification is deterministic
 * (the same answers always produce the same result).
 *
 * Each question has a `w2Indicator` flag: a "yes" (true) answer points toward
 * the indicator side, a "no" (false) answer points toward the opposite side.
 *
 * Validates: Requirements 6.2
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  CLASSIFICATION_QUESTIONS,
  scoreClassification,
} from "../../data/classificationCriteria";

const NUM_RUNS = 200;

const QUESTION_IDS = CLASSIFICATION_QUESTIONS.map((q) => q.id);

/**
 * Independently counts how many answers point toward W2 vs 1099, mirroring the
 * documented scoring rule without reusing the implementation's control flow.
 */
function countVotes(answers: Record<string, boolean>): {
  w2: number;
  v1099: number;
} {
  let w2 = 0;
  let v1099 = 0;
  for (const question of CLASSIFICATION_QUESTIONS) {
    if (!(question.id in answers)) continue;
    if (answers[question.id] === question.w2Indicator) {
      w2 += 1;
    } else {
      v1099 += 1;
    }
  }
  return { w2, v1099 };
}

/**
 * Generates an answer map covering an arbitrary (possibly empty) subset of the
 * classification questions, with arbitrary boolean answers.
 */
const answersArbitrary = fc
  .subarray(QUESTION_IDS, { minLength: 0, maxLength: QUESTION_IDS.length })
  .chain((ids) =>
    fc.tuple(...ids.map(() => fc.boolean())).map((bools) =>
      ids.reduce<Record<string, boolean>>((acc, id, i) => {
        acc[id] = bools[i];
        return acc;
      }, {}),
    ),
  );

describe("Property 14: Classification checklist scoring consistency", () => {
  it("recommends the classification with more pointing answers", () => {
    // Feature: nail-salon-payroll-transition, Property 14
    fc.assert(
      fc.property(answersArbitrary, (answers) => {
        const { w2, v1099 } = countVotes(answers);
        const result = scoreClassification(answers);

        if (w2 > v1099) {
          expect(result).toBe("W2");
        } else if (v1099 > w2) {
          expect(result).toBe("1099");
        } else {
          // Ties resolve to the more conservative W2 classification.
          expect(result).toBe("W2");
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("is deterministic for the same answers", () => {
    // Feature: nail-salon-payroll-transition, Property 14
    fc.assert(
      fc.property(answersArbitrary, (answers) => {
        const first = scoreClassification(answers);
        const second = scoreClassification({ ...answers });
        expect(first).toBe(second);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("always returns one of the two valid classifications", () => {
    // Feature: nail-salon-payroll-transition, Property 14
    fc.assert(
      fc.property(answersArbitrary, (answers) => {
        const result = scoreClassification(answers);
        expect(["W2", "1099"]).toContain(result);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
