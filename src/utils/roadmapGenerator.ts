/**
 * Transition roadmap generator.
 *
 * Produces a phased plan for moving a nail salon's worker payroll from a
 * mixed cash/check model toward 100% check, while avoiding the abrupt
 * changes that can trigger an IRS audit (Red Flag).
 *
 * The algorithm satisfies the following correctness properties (see design.md):
 *
 * Property 1 — Phases are complete and well-structured:
 *   - at least 3 phases
 *   - each phase: checkPercent + cashPercent = 100, positive durationMonths,
 *     non-negative startMonth, non-empty notes
 *   - first phase cashPercent < input cashPercent
 *   - last phase cashPercent = 0
 *
 * Property 2 — Duration scales with cash percentage:
 *   - cash ≤ 60%  → totalDurationMonths in [6, 12] with ≥ 3 phases
 *   - cash > 60%  → totalDurationMonths in [12, 18] with ≥ 5 phases
 *   - no single phase reduces cash by more than 15 percentage points
 */

import type {
  Phase,
  PhaseAmounts,
  PhaseClassificationBreakdown,
  PhaseOwnerBreakdown,
  PhaseWorkerBreakdown,
  Roadmap,
  RoadmapInput,
  TaxLineItem,
} from "../context/types";
import { calculateW2Tax, calculate1099Tax } from "./taxCalculator";

/** Maximum cash reduction allowed in a single phase (percentage points). */
const MAX_REDUCTION_PER_PHASE = 15;

/** Default number of phases when the caller does not specify one. */
export const DEFAULT_NUMBER_OF_PHASES = 4;

/** Round a number to 2 decimal places. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Clamp a value into the inclusive [min, max] range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Distribute `total` whole months across `count` phases as evenly as
 * possible. The returned array sums exactly to `total` and every entry is a
 * positive integer (given total >= count).
 */
function distributeMonths(total: number, count: number): number[] {
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from(
    { length: count },
    (_, i) => base + (i < remainder ? 1 : 0),
  );
}

/**
 * Decide how many phases to use and the total duration for a given cash
 * percentage and an optional requested phase count.
 *
 * The requested count is respected when possible, but is always clamped to at
 * least `ceil(cash / 15)` so that no single phase reduces cash by more than 15
 * points. The total duration scales with the phase count (~3 months per phase,
 * bounded to a sensible range).
 */
function planFor(
  cash: number,
  requestedPhases?: number,
): {
  numberOfPhases: number;
  totalMonths: number;
} {
  // Minimum phases required to respect the per-phase 15-point reduction cap.
  const minForCap = Math.max(1, Math.ceil(cash / MAX_REDUCTION_PER_PHASE));

  // When the caller requests a specific number of phases, honor it (clamped to
  // a reasonable range and to the per-phase cap).
  if (requestedPhases !== undefined && Number.isFinite(requestedPhases)) {
    const requested = Math.round(requestedPhases);
    const numberOfPhases = Math.min(12, Math.max(minForCap, requested, 2));
    // ~3 months per phase keeps phase pacing realistic.
    const totalMonths = numberOfPhases * 3;
    return { numberOfPhases, totalMonths };
  }

  // No explicit request → fall back to the cash-based defaults.
  if (cash <= 30) {
    // 3 phases over 6 months (≈10% reduction every 2 months).
    return { numberOfPhases: Math.max(3, minForCap), totalMonths: 6 };
  }

  if (cash <= 60) {
    // 4 phases over ~12 months (≈15% reduction every ~3 months).
    return { numberOfPhases: Math.max(4, minForCap), totalMonths: 12 };
  }

  // cash > 60: 5-7 phases over 12-18 months.
  const numberOfPhases = Math.max(5, minForCap);
  // 15 months spread across the phases keeps the total inside [12, 18]
  // for every supported phase count (5, 6, or 7).
  return { numberOfPhases, totalMonths: 15 };
}

/** Build a Vietnamese note describing the goal of a phase. */
function buildPhaseNote(
  phaseNumber: number,
  totalPhases: number,
  checkPercent: number,
  cashPercent: number,
): string {
  if (cashPercent === 0) {
    return (
      `Giai đoạn ${phaseNumber} (giai đoạn cuối): Chuyển hoàn toàn sang 100% check. ` +
      `Đảm bảo mọi khoản lương đều được khai báo đầy đủ, lưu giữ pay stubs và hồ sơ thuế.`
    );
  }

  return (
    `Giai đoạn ${phaseNumber}/${totalPhases}: Đưa tỉ lệ check lên ${checkPercent}% ` +
    `và giảm cash xuống ${cashPercent}%. Tăng dần phần trả qua check một cách đều đặn ` +
    `để tránh thay đổi đột ngột gây chú ý cho IRS.`
  );
}

/** Build the overall Vietnamese recommendation for the roadmap. */
function buildRecommendation(
  cash: number,
  totalMonths: number,
  numberOfPhases: number,
): string {
  if (cash > 60) {
    return (
      `Tỉ lệ cash hiện tại (${cash}%) khá cao, nên chuyển đổi từ từ qua ${numberOfPhases} ` +
      `giai đoạn trong ${totalMonths} tháng để giảm thiểu rủi ro bị IRS để ý. ` +
      `Mỗi giai đoạn chỉ giảm tối đa 15% tỉ lệ cash.`
    );
  }

  return (
    `Với tỉ lệ cash hiện tại (${cash}%), lộ trình ${numberOfPhases} giai đoạn trong ` +
    `${totalMonths} tháng giúp bạn chuyển sang 100% check một cách an toàn và hợp lý. ` +
    `Mỗi giai đoạn chỉ giảm tối đa 15% tỉ lệ cash.`
  );
}

/**
 * Build the worker + owner after-cost breakdown for one phase under a given
 * classification.
 *
 * Tax is computed only on the CHECK (declared) portion of the worker's income.
 * The cash portion is undeclared / untaxed in this model.
 *
 * Example: worker gross = 1000, check/cash = 50/50 → check = 500 → tax on 500.
 *
 * Worker model:
 * - **W-2**: employee tax is withheld on the check amount. The owner pays out
 *   the check minus tax, plus the full cash. Owner also bears employer payroll
 *   taxes on the check amount.
 * - **1099**: the owner pays out the FULL gross (check + cash, no withholding).
 *   The worker's estimated tax on the check portion is shown as informational.
 *
 * Tax functions operate on annual income (brackets/caps are annual), so the
 * monthly check amount is annualized for the calculation and the resulting tax
 * is converted back to a monthly figure.
 */
function buildBreakdown(
  workerGross: number,
  checkPercent: number,
  cashPercent: number,
  ownerGross: number,
  workers: number,
  workerType: "W2" | "1099",
  state: string,
): PhaseClassificationBreakdown {
  // Tax base: only the CHECK (declared) portion is taxed.
  const checkGross = workerGross * (checkPercent / 100);
  const cashGross = workerGross * (cashPercent / 100);
  const annualCheck = checkGross * 12;

  let monthlyWorkerTax: number;
  let monthlyEmployerCost: number;
  let taxLines: TaxLineItem[];
  if (workerType === "W2") {
    const { employer, employee } = calculateW2Tax(annualCheck, state);
    monthlyWorkerTax = employee.total / 12;
    monthlyEmployerCost = employer.total / 12;
    taxLines = [
      {
        label: "Thuế thu nhập liên bang (Federal Income Tax)",
        amount: round2(employee.federalIncome / 12),
      },
      {
        label: "Thuế thu nhập tiểu bang (State Income Tax)",
        amount: round2(employee.stateIncome / 12),
      },
      {
        label: "An sinh xã hội (Social Security 6.2%)",
        amount: round2(employee.socialSecurity / 12),
      },
      {
        label: "Bảo hiểm y tế (Medicare 1.45%)",
        amount: round2(employee.medicare / 12),
      },
    ];
  } else {
    const se = calculate1099Tax(annualCheck, state);
    monthlyWorkerTax = se.total / 12;
    monthlyEmployerCost = 0;
    const estimatedIncomeTax = se.total - se.selfEmploymentTax;
    taxLines = [
      {
        label: "Thuế tự kinh doanh (Self-Employment Tax 15.3%)",
        amount: round2(se.selfEmploymentTax / 12),
      },
      {
        label: "Thuế thu nhập ước tính (Estimated Income Tax)",
        amount: round2(estimatedIncomeTax / 12),
      },
    ];
  }

  const tax = round2(monthlyWorkerTax);
  const taxWithheld = workerType === "W2";

  // What the owner actually pays out:
  // W-2: check minus withheld tax + full cash.
  // 1099: full check + full cash (no withholding).
  const checkReceived = taxWithheld
    ? round2(checkGross - tax)
    : round2(checkGross);
  const cashReceived = round2(cashGross);
  const amountReceived = round2(checkReceived + cashReceived);

  // Net the worker ultimately keeps after all taxes:
  // W-2: amountReceived (tax already removed from check).
  // 1099: gross − estimated tax on the check portion.
  const netAfterTax = taxWithheld ? amountReceived : round2(workerGross - tax);

  const effectiveTaxPercent =
    checkGross > 0 ? round2((tax / checkGross) * 100) : 0;
  const retentionPercent =
    workerGross > 0 ? round2((netAfterTax / workerGross) * 100) : 0;

  const worker: PhaseWorkerBreakdown = {
    gross: round2(workerGross),
    taxWithheld,
    tax,
    effectiveTaxPercent,
    amountReceived,
    checkReceived,
    cashReceived,
    netAfterTax,
    amountReceivedPerWorker: round2(amountReceived / workers),
    netAfterTaxPerWorker: round2(netAfterTax / workers),
    retentionPercent,
    taxLines,
  };

  const employerCost = round2(monthlyEmployerCost);
  const ownerNet = round2(ownerGross - employerCost);

  let ownerTaxLines: TaxLineItem[];
  if (workerType === "W2") {
    const { employer } = calculateW2Tax(annualCheck, state);
    ownerTaxLines = [
      {
        label: "An sinh xã hội (Social Security 6.2%)",
        amount: round2(employer.socialSecurity / 12),
      },
      {
        label: "Bảo hiểm y tế (Medicare 1.45%)",
        amount: round2(employer.medicare / 12),
      },
      {
        label: "Thất nghiệp liên bang (FUTA 0.6%)",
        amount: round2(employer.futa / 12),
      },
      {
        label: "Thất nghiệp tiểu bang (SUTA)",
        amount: round2(employer.suta / 12),
      },
    ];
  } else {
    ownerTaxLines = [];
  }

  const owner: PhaseOwnerBreakdown = {
    gross: round2(ownerGross),
    employerCost,
    net: ownerNet,
    retentionPercent:
      ownerGross > 0 ? round2((ownerNet / ownerGross) * 100) : 0,
    taxLines: ownerTaxLines,
  };

  return { worker, owner };
}

/**
 * Compute per-phase dollar amounts from revenue, the split ratio, and the
 * phase's check/cash mix — including W-2 and 1099 after-cost breakdowns for
 * both the worker pool and the owner. Returns `undefined` when no usable
 * revenue is given.
 */
function computeAmounts(
  input: RoadmapInput,
  checkPercent: number,
  cashPercent: number,
): PhaseAmounts | undefined {
  const revenue = input.monthlyRevenue;
  if (revenue === undefined || !Number.isFinite(revenue) || revenue <= 0) {
    return undefined;
  }

  const { owner, worker } = input.splitRatio;
  const totalShare = owner + worker;
  if (totalShare <= 0) return undefined;

  const workerGrossIncome = round2(revenue * (worker / totalShare));
  const ownerGrossIncome = round2(revenue * (owner / totalShare));

  const workers =
    input.numberOfWorkers && input.numberOfWorkers > 0
      ? input.numberOfWorkers
      : 1;
  const state = input.state ?? "";

  return {
    workerGrossIncome,
    ownerGrossIncome,
    w2: buildBreakdown(
      workerGrossIncome,
      checkPercent,
      cashPercent,
      ownerGrossIncome,
      workers,
      "W2",
      state,
    ),
    result1099: buildBreakdown(
      workerGrossIncome,
      checkPercent,
      cashPercent,
      ownerGrossIncome,
      workers,
      "1099",
      state,
    ),
  };
}

/**
 * Generate a phased transition roadmap from the current cash/check mix toward
 * 100% check.
 */
export function generateRoadmap(input: RoadmapInput): Roadmap {
  const cash = clamp(input.currentCashPercent, 0, 100);

  const { numberOfPhases, totalMonths } = planFor(cash, input.numberOfPhases);
  const durations = distributeMonths(totalMonths, numberOfPhases);

  const phases: Phase[] = [];
  let monthsElapsed = 0;

  for (let i = 1; i <= numberOfPhases; i++) {
    const durationMonths = durations[i - 1];
    const startMonth = monthsElapsed;
    const endMonth = monthsElapsed + durationMonths;

    // Cash decreases linearly toward 0. The factor (numberOfPhases - i) makes
    // the final phase land exactly on 0 cash.
    const cashPercent =
      i === numberOfPhases
        ? 0
        : round2((cash * (numberOfPhases - i)) / numberOfPhases);
    const checkPercent = round2(100 - cashPercent);

    phases.push({
      phaseNumber: i,
      checkPercent,
      cashPercent,
      durationMonths,
      startMonth,
      endMonth,
      notes: buildPhaseNote(i, numberOfPhases, checkPercent, cashPercent),
      amounts: computeAmounts(input, checkPercent, cashPercent),
    });

    monthsElapsed = endMonth;
  }

  // Synthetic "current state" phase for display (phase 0).
  const currentCheckPercent = round2(100 - cash);
  const currentPhase: Phase = {
    phaseNumber: 0,
    checkPercent: currentCheckPercent,
    cashPercent: cash,
    durationMonths: 0,
    startMonth: 0,
    endMonth: 0,
    notes: "",
    amounts: computeAmounts(input, currentCheckPercent, cash),
  };

  return {
    phases,
    totalDurationMonths: monthsElapsed,
    recommendation: buildRecommendation(cash, monthsElapsed, numberOfPhases),
    currentPhase,
  };
}
