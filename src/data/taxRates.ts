/**
 * Federal tax rates and 2024 tax configuration data.
 *
 * Values reflect the 2024 federal tax year. State-specific data
 * (SUTA, state income tax) lives in `stateData.ts`.
 */

/** A single federal income tax bracket. */
export interface FederalTaxBracket {
  min: number;
  /** Use Infinity for the top (open-ended) bracket. */
  max: number;
  rate: number;
}

/** State-specific tax data. */
export interface StateData {
  code: string;
  /** State name in English. */
  name: string;
  /** State name in Vietnamese. */
  nameVi: string;
  /** State Unemployment Tax (SUTA) rate. */
  sutaRate: number;
  /** Simplified effective state income tax rate. */
  stateIncomeTaxRate: number;
}

/** Federal tax configuration for a given year. */
export interface TaxRatesConfig {
  year: number;
  /** Social Security rate (employee or employer share): 0.062. */
  socialSecurityRate: number;
  /** Social Security wage base cap (2024): 168600. */
  socialSecurityWageCap: number;
  /** Medicare rate: 0.0145. */
  medicareRate: number;
  /** FUTA rate (effective after state credit): 0.006. */
  futaRate: number;
  /** FUTA wage cap: 7000. */
  futaWageCap: number;
  /** Combined self-employment tax rate: 0.153. */
  selfEmploymentRate: number;
  /** Portion of net earnings subject to SE tax: 0.9235. */
  selfEmploymentTaxablePortion: number;
  /** Federal minimum wage: 7.25. */
  federalMinimumWage: number;
  /** Federal income tax brackets (single filer, 2024). */
  federalTaxBrackets: FederalTaxBracket[];
}

/**
 * 2024 federal income tax brackets for a single filer.
 * Source: IRS Revenue Procedure 2023-34.
 */
export const FEDERAL_TAX_BRACKETS_2024: FederalTaxBracket[] = [
  { min: 0, max: 11600, rate: 0.1 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

/** 2024 federal tax configuration. */
export const TAX_RATES_2024: TaxRatesConfig = {
  year: 2024,
  socialSecurityRate: 0.062,
  socialSecurityWageCap: 168600,
  medicareRate: 0.0145,
  futaRate: 0.006,
  futaWageCap: 7000,
  selfEmploymentRate: 0.153,
  selfEmploymentTaxablePortion: 0.9235,
  federalMinimumWage: 7.25,
  federalTaxBrackets: FEDERAL_TAX_BRACKETS_2024,
};

/** Default tax configuration used throughout the app. */
export const DEFAULT_TAX_RATES: TaxRatesConfig = TAX_RATES_2024;
