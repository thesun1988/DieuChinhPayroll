/**
 * Input validation utilities for the Nail Salon Payroll Transition app.
 *
 * Every validator returns a {@link ValidationResult}. All user-facing error
 * messages are in Vietnamese, matching the Error Handling section of the
 * design document.
 *
 * See design: validators.ts
 */

import type { TaxInput, RoadmapInput } from "../context/types";

/** A single validation error tied to a specific input field. */
export interface ValidationError {
  /** Identifier of the field that failed validation. */
  field: string;
  /** Human-readable error message (Vietnamese). */
  message: string;
}

/** Outcome of a validation check. */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ---------------------------------------------------------------------------
// Field identifiers
// ---------------------------------------------------------------------------

const FIELD = {
  cashPercent: "currentCashPercent",
  splitRatio: "splitRatio",
  revenue: "monthlyRevenue",
  workerCount: "numberOfWorkers",
  hoursPerWeek: "hoursPerWeek",
  numberOfPhases: "numberOfPhases",
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A finite number is required for every numeric input. */
function isFiniteNumber(value: number): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

function fail(field: string, message: string): ValidationResult {
  return { valid: false, errors: [{ field, message }] };
}

/** Combine several results into one, concatenating all errors. */
function combine(results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap((r) => r.errors);
  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Field validators
// ---------------------------------------------------------------------------

/**
 * Cash percentage must be a finite number within [0, 100].
 */
export function validateCashPercent(value: number): ValidationResult {
  if (!isFiniteNumber(value) || value < 0 || value > 100) {
    return fail(FIELD.cashPercent, "Tỉ lệ cash phải từ 0% đến 100%");
  }
  return ok();
}

/**
 * Both the owner and worker portions of the split ratio must be positive
 * finite numbers.
 */
export function validateSplitRatio(
  owner: number,
  worker: number,
): ValidationResult {
  if (
    !isFiniteNumber(owner) ||
    !isFiniteNumber(worker) ||
    owner <= 0 ||
    worker <= 0
  ) {
    return fail(FIELD.splitRatio, "Tỉ lệ ăn chia phải là số dương");
  }
  return ok();
}

/**
 * Revenue must be a finite number greater than 0.
 */
export function validateRevenue(value: number): ValidationResult {
  if (!isFiniteNumber(value) || value <= 0) {
    return fail(FIELD.revenue, "Doanh thu phải lớn hơn 0");
  }
  return ok();
}

/**
 * Worker count must be a positive integer.
 */
export function validateWorkerCount(value: number): ValidationResult {
  if (!isFiniteNumber(value) || value <= 0 || !Number.isInteger(value)) {
    return fail(FIELD.workerCount, "Số thợ phải là số nguyên dương");
  }
  return ok();
}

/**
 * Hours per week must be a finite number within [1, 168].
 * Used for the minimum-wage check (W-2 only).
 */
export function validateHoursPerWeek(value: number): ValidationResult {
  if (!isFiniteNumber(value) || value <= 0 || value > 168) {
    return fail(FIELD.hoursPerWeek, "Số giờ làm việc phải từ 1 đến 168");
  }
  return ok();
}

/**
 * Number of roadmap phases must be an integer within [2, 12].
 */
export function validateNumberOfPhases(value: number): ValidationResult {
  if (
    !isFiniteNumber(value) ||
    !Number.isInteger(value) ||
    value < 2 ||
    value > 12
  ) {
    return fail(FIELD.numberOfPhases, "Số giai đoạn phải từ 2 đến 12");
  }
  return ok();
}

// ---------------------------------------------------------------------------
// Composite validators
// ---------------------------------------------------------------------------

/**
 * Validate a full {@link TaxInput} for the calculator.
 *
 * Validates revenue, split ratio, worker count, and cash percentage. When the
 * worker type is W-2 and an hoursPerWeek value is provided, it is validated as
 * well (it drives the minimum-wage check).
 */
export function validateCalculatorInput(input: TaxInput): ValidationResult {
  const results: ValidationResult[] = [
    validateRevenue(input.monthlyRevenue),
    validateSplitRatio(input.splitRatio.owner, input.splitRatio.worker),
    validateCashPercent(input.currentCashPercent),
  ];

  if (input.workerType === "W2" && input.hoursPerWeek !== undefined) {
    results.push(validateHoursPerWeek(input.hoursPerWeek));
  }

  if (input.numberOfPhases !== undefined) {
    results.push(validateNumberOfPhases(input.numberOfPhases));
  }

  return combine(results);
}

/**
 * Validate a {@link RoadmapInput} for roadmap generation.
 *
 * Validates the current cash percentage and the split ratio.
 */
export function validateRoadmapInput(input: RoadmapInput): ValidationResult {
  return combine([
    validateCashPercent(input.currentCashPercent),
    validateSplitRatio(input.splitRatio.owner, input.splitRatio.worker),
  ]);
}
