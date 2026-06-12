/**
 * Core TypeScript interfaces and type definitions for the
 * Nail Salon Payroll Transition application.
 *
 * These types are shared across utility modules, hooks, context providers,
 * and UI components.
 */

// ---------------------------------------------------------------------------
// Tax calculation types (see design: taxCalculator.ts)
// ---------------------------------------------------------------------------

/** Worker employment classification. */
export type WorkerType = "W2" | "1099";

/** Commission split between the owner and the worker. */
export interface SplitRatio {
  owner: number;
  worker: number;
}

/** Input parameters for tax calculations. */
export interface TaxInput {
  monthlyRevenue: number;
  splitRatio: SplitRatio;
  numberOfWorkers: number;
  currentCashPercent: number;
  workerType: WorkerType;
  state: string;
  /** For minimum wage check (W-2 only). */
  hoursPerWeek?: number;
  /**
   * Desired number of roadmap phases. Defaults to 4 when omitted. The roadmap
   * generator may increase this to keep each phase within the 15-point cash
   * reduction cap.
   */
  numberOfPhases?: number;
}

/** Employer-side payroll taxes (W-2 only). */
export interface EmployerTaxes {
  /** 6.2% of wages up to the Social Security wage cap (2024). */
  socialSecurity: number;
  /** 1.45% of all wages. */
  medicare: number;
  /** 0.6% of first $7,000 (FUTA). */
  futa: number;
  /** State-specific rate (SUTA). */
  suta: number;
  total: number;
}

/** Employee-side payroll taxes (W-2 only). */
export interface EmployeeTaxes {
  federalIncome: number;
  stateIncome: number;
  /** 6.2% Social Security. */
  socialSecurity: number;
  /** 1.45% Medicare. */
  medicare: number;
  total: number;
}

/** Self-employment taxes (1099 only). */
export interface SelfEmploymentTaxes {
  /** 15.3% (12.4% Social Security + 2.9% Medicare). */
  selfEmploymentTax: number;
  estimatedQuarterlyTax: number;
  total: number;
}

/** Result of a tax calculation. */
export interface TaxResult {
  workerGrossIncome: number;
  currentTaxedPortion: number;
  projectedTaxedPortion: number;

  // W-2 specific
  employerTaxes?: EmployerTaxes;
  employeeTaxes?: EmployeeTaxes;

  // 1099 specific
  selfEmploymentTaxes?: SelfEmploymentTaxes;

  // Comparison
  currentEmployerCostPerMonth: number;
  projectedEmployerCostPerMonth: number;
  additionalCostPerMonth: number;
  additionalCostPerYear: number;

  // Worker take-home
  currentWorkerTakeHome: number;
  projectedWorkerTakeHome: number;

  // Warnings
  minimumWageViolation: boolean;
  /** true if >= $600/year. */
  form1099Required: boolean;
}

/** Side-by-side comparison of W-2 and 1099 results. */
export interface ComparisonResult {
  w2Result: TaxResult;
  result1099: TaxResult;
}

// ---------------------------------------------------------------------------
// Roadmap types (see design: roadmapGenerator.ts)
// ---------------------------------------------------------------------------

/** Input parameters for roadmap generation. */
export interface RoadmapInput {
  /** 0-100. */
  currentCashPercent: number;
  splitRatio: SplitRatio;
  workerType: WorkerType;
  /** Average monthly revenue, used to compute per-phase dollar amounts. */
  monthlyRevenue?: number;
  /** Number of workers, used to split the worker pool's pay per worker. */
  numberOfWorkers?: number;
  /** State code, used to apply state taxes when computing after-tax amounts. */
  state?: string;
  /**
   * Desired number of phases. Defaults to 4 when omitted. The generator may
   * raise this to respect the 15-point per-phase cash reduction cap.
   */
  numberOfPhases?: number;
}

/**
 * After-cost pay breakdown for the worker pool under one classification
 * (W-2 or 1099) at a given phase.
 *
 * The two classifications behave differently:
 * - **W-2**: tax is withheld at source. The worker's net (gross − tax) is what
 *   they actually receive, delivered split between check and cash.
 * - **1099**: the owner hands over the FULL gross (no withholding). The
 *   worker's tax is their own responsibility and is shown only as an estimate.
 */
export interface PhaseWorkerBreakdown {
  /** Worker pool gross share for this phase, per month (check + cash base). */
  gross: number;
  /** True for W-2 (tax withheld at source); false for 1099 (self-paid). */
  taxWithheld: boolean;
  /** Tax per month: withheld amount (W-2) or estimated self-paid amount (1099). */
  tax: number;
  /** Effective tax rate over gross, 0-100. */
  effectiveTaxPercent: number;
  /** Amount the owner actually pays the worker (W-2: gross − tax; 1099: gross). */
  amountReceived: number;
  /** Check delivered to the worker, per month. */
  checkReceived: number;
  /** Cash delivered to the worker, per month. */
  cashReceived: number;
  /** Worker net after tax (W-2: == amountReceived; 1099: gross − estimated tax). */
  netAfterTax: number;
  /** Amount received from the owner, per worker per month. */
  amountReceivedPerWorker: number;
  /** Net after tax, per worker per month. */
  netAfterTaxPerWorker: number;
  /** Percent of gross the worker keeps after tax (netAfterTax / gross). */
  retentionPercent: number;
  /** Itemized tax components (monthly), shown when the tax line is expanded. */
  taxLines: TaxLineItem[];
}

/** A single labeled tax component for the expandable tax detail. */
export interface TaxLineItem {
  label: string;
  amount: number;
}

/**
 * Net income breakdown for the owner under one classification at a given
 * phase. For W-2 the owner bears employer payroll taxes on the worker's
 * declared (check) pay; for 1099 the owner bears no payroll taxes.
 */
export interface PhaseOwnerBreakdown {
  /** Owner's share of revenue before costs, per month. */
  gross: number;
  /** Mandatory employer cost (W-2 employer payroll taxes; 0 for 1099). */
  employerCost: number;
  /** Owner net after costs (gross − employerCost), per month. */
  net: number;
  /** Percent of gross the owner keeps after costs (net / gross). */
  retentionPercent: number;
  /** Itemized employer tax components (monthly), shown when expanded. */
  taxLines: TaxLineItem[];
}

/** Worker + owner after-cost breakdown for one classification at a phase. */
export interface PhaseClassificationBreakdown {
  worker: PhaseWorkerBreakdown;
  owner: PhaseOwnerBreakdown;
}

/** Per-phase dollar amounts, with W-2 and 1099 after-cost breakdowns. */
export interface PhaseAmounts {
  /** Total worker pool gross income per month at this phase. */
  workerGrossIncome: number;
  /** Owner's gross share of revenue per month (before costs). */
  ownerGrossIncome: number;
  /** Worker + owner after-cost breakdown under the W-2 classification. */
  w2: PhaseClassificationBreakdown;
  /** Worker + owner after-cost breakdown under the 1099 classification. */
  result1099: PhaseClassificationBreakdown;
}

/** A single phase in the transition roadmap. */
export interface Phase {
  phaseNumber: number;
  checkPercent: number;
  cashPercent: number;
  durationMonths: number;
  startMonth: number;
  endMonth: number;
  notes: string;
  /** Optional per-phase dollar amounts (present when revenue is provided). */
  amounts?: PhaseAmounts;
}

/** Generated transition roadmap. */
export interface Roadmap {
  phases: Phase[];
  totalDurationMonths: number;
  recommendation: string;
  /** Synthetic "current state" phase (phase 0) for display purposes. */
  currentPhase?: Phase;
}

// ---------------------------------------------------------------------------
// Storage types (see design: storage.ts)
// ---------------------------------------------------------------------------

/** Shape of the data persisted to localStorage. */
export interface StoredData {
  calculatorInput?: TaxInput;
  calculatorResult?: TaxResult;
  comparisonResult?: ComparisonResult;
  roadmapInput?: RoadmapInput;
  roadmapResult?: Roadmap;
  classificationAnswers?: Record<string, boolean>;
  disclaimerAccepted: boolean;
  /** ISO date string. */
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Flow state types (see design: FlowContext.tsx)
// ---------------------------------------------------------------------------

/** Steps in the single-page sequential flow. */
export type FlowStep =
  | "landing"
  | "disclaimer"
  | "form"
  | "analyzing"
  | "results";

/** State managed by FlowContext. */
export interface FlowState {
  currentStep: FlowStep;
  disclaimerAccepted: boolean;
  /** For footer link (overlay). */
  showDisclaimerPage: boolean;
  /** For footer link (overlay). */
  showPrivacyPage: boolean;
}

/** Actions dispatched to the flow reducer. */
export type FlowAction =
  | { type: "START_FEATURE" } // CTA click → shows disclaimer or goes to form
  | { type: "ACCEPT_DISCLAIMER" } // Accept → go to form
  | { type: "REJECT_DISCLAIMER" } // Reject → back to landing
  | { type: "SUBMIT_FORM" } // Submit → go to analyzing
  | { type: "ANALYSIS_COMPLETE" } // Done → show results
  | { type: "EDIT_INPUTS" } // From results → back to form
  | { type: "START_OVER" } // From results → back to landing
  | { type: "SHOW_DISCLAIMER_PAGE"; show: boolean }
  | { type: "SHOW_PRIVACY_PAGE"; show: boolean };

// ---------------------------------------------------------------------------
// Application state (see design: Data Models)
// ---------------------------------------------------------------------------

/** Global application state managed by AppContext. */
export interface AppState {
  // Flow
  currentStep: FlowStep;
  disclaimerAccepted: boolean;

  // Calculator
  calculatorInput: TaxInput | null;
  calculatorResult: TaxResult | null;
  comparisonResult: ComparisonResult | null;

  // Roadmap
  roadmapInput: RoadmapInput | null;
  roadmapResult: Roadmap | null;

  // Classification
  classificationAnswers: Record<string, boolean>;
  classificationResult: WorkerType | null;

  // Overlay pages (footer links)
  showDisclaimerPage: boolean;
  showPrivacyPage: boolean;

  // Meta
  lastUpdated: string | null;
}
