/**
 * Core tax calculation logic for the Nail Salon Payroll Transition app.
 *
 * Implements W-2 (employer + employee) and 1099 (self-employment) tax
 * computations, a combined `calculateTax` entry point, and a
 * `compareW2vs1099` helper. All monetary inputs/outputs are in USD.
 *
 * The calculations satisfy the Correctness Properties 3-9 defined in the
 * design document. See `src/data/taxRates.ts` and `src/data/stateData.ts`
 * for the underlying rate data.
 */

import type {
  TaxInput,
  TaxResult,
  EmployerTaxes,
  EmployeeTaxes,
  SelfEmploymentTaxes,
  ComparisonResult,
} from "../context/types";
import { DEFAULT_TAX_RATES, type FederalTaxBracket } from "../data/taxRates";
import { getStateData, DEFAULT_SUTA_WAGE_CAP } from "../data/stateData";

const RATES = DEFAULT_TAX_RATES;

/** Average number of weeks per month used for the minimum wage check. */
const WEEKS_PER_MONTH = 4.33;

/** Form 1099-NEC reporting threshold (USD/year). */
const FORM_1099_THRESHOLD = 600;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Computes progressive federal income tax for an annual income using the
 * configured tax brackets. The result is always non-negative and, for any
 * positive income, strictly less than the income (top marginal rate < 100%).
 */
function computeFederalIncomeTax(
  annualIncome: number,
  brackets: FederalTaxBracket[] = RATES.federalTaxBrackets,
): number {
  if (annualIncome <= 0) return 0;

  let tax = 0;
  for (const bracket of brackets) {
    if (annualIncome <= bracket.min) break;
    const upper = Math.min(annualIncome, bracket.max);
    const taxableInBracket = upper - bracket.min;
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
    }
  }
  return tax;
}

/** Resolves the SUTA rate for a state code (0 for unknown states). */
function getSutaRate(state: string): number {
  return getStateData(state)?.sutaRate ?? 0;
}

/** Resolves the simplified state income tax rate (0 for unknown states). */
function getStateIncomeTaxRate(state: string): number {
  return getStateData(state)?.stateIncomeTaxRate ?? 0;
}

// ---------------------------------------------------------------------------
// W-2 tax calculation
// ---------------------------------------------------------------------------

/**
 * Computes W-2 employer and employee taxes for a given annual gross income
 * and state.
 *
 * Employer: Social Security (6.2% up to wage cap), Medicare (1.45%),
 * FUTA (0.6% of first $7,000), SUTA (state rate up to SUTA wage cap).
 * Employee: federal income tax, state income tax, Social Security (6.2%),
 * Medicare (1.45%).
 *
 * Satisfies Property 4 (employer) and Property 5 (employee).
 */
export function calculateW2Tax(
  grossIncome: number,
  state: string,
): { employer: EmployerTaxes; employee: EmployeeTaxes } {
  const income = Math.max(0, grossIncome);

  const ssWages = Math.min(income, RATES.socialSecurityWageCap);
  const socialSecurity = ssWages * RATES.socialSecurityRate;
  const medicare = income * RATES.medicareRate;

  // --- Employer taxes ---
  const futa = Math.min(income, RATES.futaWageCap) * RATES.futaRate;
  const suta = Math.min(income, DEFAULT_SUTA_WAGE_CAP) * getSutaRate(state);

  const employer: EmployerTaxes = {
    socialSecurity,
    medicare,
    futa,
    suta,
    total: socialSecurity + medicare + futa + suta,
  };

  // --- Employee taxes ---
  const federalIncome = computeFederalIncomeTax(income);
  const stateIncome = income * getStateIncomeTaxRate(state);

  const employee: EmployeeTaxes = {
    federalIncome,
    stateIncome,
    socialSecurity,
    medicare,
    total: federalIncome + stateIncome + socialSecurity + medicare,
  };

  return { employer, employee };
}

// ---------------------------------------------------------------------------
// 1099 tax calculation
// ---------------------------------------------------------------------------

/**
 * Computes 1099 self-employment taxes for a given annual gross income.
 *
 * Self-employment tax is 15.3% applied to 92.35% of net earnings.
 * Estimated quarterly tax = (annual SE tax + estimated federal income tax) / 4.
 *
 * Satisfies Property 6.
 */
export function calculate1099Tax(
  grossIncome: number,
  _state: string,
): SelfEmploymentTaxes {
  const income = Math.max(0, grossIncome);

  const selfEmploymentTax =
    income * RATES.selfEmploymentTaxablePortion * RATES.selfEmploymentRate;

  // Estimated income tax: federal progressive tax on net earnings after the
  // deductible half of SE tax (a common simplification for estimates).
  const netEarnings = Math.max(0, income - selfEmploymentTax / 2);
  const estimatedIncomeTax = computeFederalIncomeTax(netEarnings);

  const estimatedQuarterlyTax = (selfEmploymentTax + estimatedIncomeTax) / 4;

  return {
    selfEmploymentTax,
    estimatedQuarterlyTax,
    total: selfEmploymentTax + estimatedIncomeTax,
  };
}

// ---------------------------------------------------------------------------
// Combined calculation
// ---------------------------------------------------------------------------

/**
 * Main tax calculation entry point. Computes the worker's gross income from
 * the commission split, the current vs. projected taxed portions, the
 * associated tax burden (W-2 or 1099), the before/after cost comparison,
 * worker take-home pay, the minimum wage check (W-2 only), and the
 * Form 1099-NEC threshold (1099 only).
 *
 * Satisfies Properties 3, 7, 8, 9 (and uses Properties 4, 5, 6 internally).
 */
export function calculateTax(input: TaxInput): TaxResult {
  const {
    monthlyRevenue,
    splitRatio,
    numberOfWorkers,
    currentCashPercent,
    workerType,
    state,
    hoursPerWeek,
  } = input;

  const totalShares = splitRatio.owner + splitRatio.worker;
  const workerRatio = totalShares > 0 ? splitRatio.worker / totalShares : 0;

  // Property 3: worker gross income = monthlyRevenue × (worker / (owner + worker))
  const workerGrossIncome = monthlyRevenue * workerRatio;

  // Portions of monthly worker income that are declared on payroll.
  const checkPercent = 100 - currentCashPercent;
  const currentTaxedPortion = workerGrossIncome * (checkPercent / 100);
  const projectedTaxedPortion = workerGrossIncome; // 100% on check

  // Annualized taxed portions (tax brackets and wage caps are annual).
  const annualCurrentTaxed = currentTaxedPortion * 12;
  const annualProjectedTaxed = projectedTaxedPortion * 12;

  let employerTaxes: EmployerTaxes | undefined;
  let employeeTaxes: EmployeeTaxes | undefined;
  let selfEmploymentTaxes: SelfEmploymentTaxes | undefined;

  let currentEmployerCostPerMonth: number;
  let projectedEmployerCostPerMonth: number;
  let currentWorkerTakeHome: number;
  let projectedWorkerTakeHome: number;

  if (workerType === "W2") {
    const currentW2 = calculateW2Tax(annualCurrentTaxed, state);
    const projectedW2 = calculateW2Tax(annualProjectedTaxed, state);

    // Store the projected (100% check) breakdown for display.
    employerTaxes = projectedW2.employer;
    employeeTaxes = projectedW2.employee;

    // Employer cost is the employer's payroll tax burden (monthly).
    currentEmployerCostPerMonth = currentW2.employer.total / 12;
    projectedEmployerCostPerMonth = projectedW2.employer.total / 12;

    // Worker take-home: full monthly income minus withheld employee taxes
    // on the declared (check) portion.
    currentWorkerTakeHome = workerGrossIncome - currentW2.employee.total / 12;
    projectedWorkerTakeHome =
      workerGrossIncome - projectedW2.employee.total / 12;
  } else {
    // 1099: store the projected (full income) self-employment breakdown.
    const current1099 = calculate1099Tax(annualCurrentTaxed, state);
    const projected1099 = calculate1099Tax(annualProjectedTaxed, state);

    selfEmploymentTaxes = projected1099;

    // Employer bears no payroll taxes for 1099 contractors; the relevant tax
    // burden of declaring income is the self-employment tax (monthly).
    currentEmployerCostPerMonth = current1099.selfEmploymentTax / 12;
    projectedEmployerCostPerMonth = projected1099.selfEmploymentTax / 12;

    // Worker take-home: full monthly income minus the contractor's total
    // tax burden on the declared portion.
    currentWorkerTakeHome = workerGrossIncome - current1099.total / 12;
    projectedWorkerTakeHome = workerGrossIncome - projected1099.total / 12;
  }

  const additionalCostPerMonth =
    projectedEmployerCostPerMonth - currentEmployerCostPerMonth;
  const additionalCostPerYear = additionalCostPerMonth * 12;

  // Property 9: minimum wage check (W-2 only, requires hoursPerWeek > 0).
  let minimumWageViolation = false;
  if (workerType === "W2" && hoursPerWeek != null && hoursPerWeek > 0) {
    const hourlyRate =
      workerGrossIncome / numberOfWorkers / (hoursPerWeek * WEEKS_PER_MONTH);
    minimumWageViolation = hourlyRate < RATES.federalMinimumWage;
  }

  // Property 7: Form 1099-NEC threshold (1099 only).
  const annualWorkerGrossIncome = monthlyRevenue * 12 * workerRatio;
  const form1099Required =
    workerType === "1099" && annualWorkerGrossIncome >= FORM_1099_THRESHOLD;

  return {
    workerGrossIncome,
    currentTaxedPortion,
    projectedTaxedPortion,
    employerTaxes,
    employeeTaxes,
    selfEmploymentTaxes,
    currentEmployerCostPerMonth,
    projectedEmployerCostPerMonth,
    additionalCostPerMonth,
    additionalCostPerYear,
    currentWorkerTakeHome,
    projectedWorkerTakeHome,
    minimumWageViolation,
    form1099Required,
  };
}

/**
 * Runs both W-2 and 1099 calculations for the same input so the UI can show a
 * side-by-side comparison.
 */
export function compareW2vs1099(input: TaxInput): ComparisonResult {
  const w2Result = calculateTax({ ...input, workerType: "W2" });
  const result1099 = calculateTax({ ...input, workerType: "1099" });
  return { w2Result, result1099 };
}
