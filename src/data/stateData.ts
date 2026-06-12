/**
 * State-specific tax data for all US states plus the District of Columbia.
 *
 * - `sutaRate`: a representative new-employer State Unemployment Tax (SUTA)
 *   rate. Actual SUTA rates vary by employer experience rating and change
 *   yearly; these are reasonable defaults for estimation purposes.
 * - `stateIncomeTaxRate`: a simplified effective state income tax rate.
 *   States with no income tax use 0. These are approximations intended for
 *   ballpark estimates, not exact filing figures.
 *
 * Disclaimer: values are for estimation only. Owners should consult a CPA.
 */

import type { StateData } from "./taxRates";

export type { StateData };

/** All US states + DC, keyed implicitly by array order; lookup via STATE_MAP. */
export const STATES: StateData[] = [
  {
    code: "AL",
    name: "Alabama",
    nameVi: "Alabama",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.05,
  },
  {
    code: "AK",
    name: "Alaska",
    nameVi: "Alaska",
    sutaRate: 0.023,
    stateIncomeTaxRate: 0.0,
  },
  {
    code: "AZ",
    name: "Arizona",
    nameVi: "Arizona",
    sutaRate: 0.02,
    stateIncomeTaxRate: 0.025,
  },
  {
    code: "AR",
    name: "Arkansas",
    nameVi: "Arkansas",
    sutaRate: 0.031,
    stateIncomeTaxRate: 0.044,
  },
  {
    code: "CA",
    name: "California",
    nameVi: "California",
    sutaRate: 0.034,
    stateIncomeTaxRate: 0.06,
  },
  {
    code: "CO",
    name: "Colorado",
    nameVi: "Colorado",
    sutaRate: 0.017,
    stateIncomeTaxRate: 0.044,
  },
  {
    code: "CT",
    name: "Connecticut",
    nameVi: "Connecticut",
    sutaRate: 0.03,
    stateIncomeTaxRate: 0.05,
  },
  {
    code: "DE",
    name: "Delaware",
    nameVi: "Delaware",
    sutaRate: 0.018,
    stateIncomeTaxRate: 0.05,
  },
  {
    code: "DC",
    name: "District of Columbia",
    nameVi: "Washington D.C.",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.06,
  },
  {
    code: "FL",
    name: "Florida",
    nameVi: "Florida",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.0,
  },
  {
    code: "GA",
    name: "Georgia",
    nameVi: "Georgia",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.0539,
  },
  {
    code: "HI",
    name: "Hawaii",
    nameVi: "Hawaii",
    sutaRate: 0.03,
    stateIncomeTaxRate: 0.07,
  },
  {
    code: "ID",
    name: "Idaho",
    nameVi: "Idaho",
    sutaRate: 0.01,
    stateIncomeTaxRate: 0.058,
  },
  {
    code: "IL",
    name: "Illinois",
    nameVi: "Illinois",
    sutaRate: 0.035,
    stateIncomeTaxRate: 0.0495,
  },
  {
    code: "IN",
    name: "Indiana",
    nameVi: "Indiana",
    sutaRate: 0.025,
    stateIncomeTaxRate: 0.0315,
  },
  {
    code: "IA",
    name: "Iowa",
    nameVi: "Iowa",
    sutaRate: 0.01,
    stateIncomeTaxRate: 0.044,
  },
  {
    code: "KS",
    name: "Kansas",
    nameVi: "Kansas",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.0525,
  },
  {
    code: "KY",
    name: "Kentucky",
    nameVi: "Kentucky",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.04,
  },
  {
    code: "LA",
    name: "Louisiana",
    nameVi: "Louisiana",
    sutaRate: 0.012,
    stateIncomeTaxRate: 0.0425,
  },
  {
    code: "ME",
    name: "Maine",
    nameVi: "Maine",
    sutaRate: 0.019,
    stateIncomeTaxRate: 0.0715,
  },
  {
    code: "MD",
    name: "Maryland",
    nameVi: "Maryland",
    sutaRate: 0.026,
    stateIncomeTaxRate: 0.0475,
  },
  {
    code: "MA",
    name: "Massachusetts",
    nameVi: "Massachusetts",
    sutaRate: 0.0242,
    stateIncomeTaxRate: 0.05,
  },
  {
    code: "MI",
    name: "Michigan",
    nameVi: "Michigan",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.0425,
  },
  {
    code: "MN",
    name: "Minnesota",
    nameVi: "Minnesota",
    sutaRate: 0.025,
    stateIncomeTaxRate: 0.0535,
  },
  {
    code: "MS",
    name: "Mississippi",
    nameVi: "Mississippi",
    sutaRate: 0.012,
    stateIncomeTaxRate: 0.047,
  },
  {
    code: "MO",
    name: "Missouri",
    nameVi: "Missouri",
    sutaRate: 0.025,
    stateIncomeTaxRate: 0.048,
  },
  {
    code: "MT",
    name: "Montana",
    nameVi: "Montana",
    sutaRate: 0.013,
    stateIncomeTaxRate: 0.059,
  },
  {
    code: "NE",
    name: "Nebraska",
    nameVi: "Nebraska",
    sutaRate: 0.0125,
    stateIncomeTaxRate: 0.0584,
  },
  {
    code: "NV",
    name: "Nevada",
    nameVi: "Nevada",
    sutaRate: 0.0295,
    stateIncomeTaxRate: 0.0,
  },
  {
    code: "NH",
    name: "New Hampshire",
    nameVi: "New Hampshire",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.0,
  },
  {
    code: "NJ",
    name: "New Jersey",
    nameVi: "New Jersey",
    sutaRate: 0.028,
    stateIncomeTaxRate: 0.05,
  },
  {
    code: "NM",
    name: "New Mexico",
    nameVi: "New Mexico",
    sutaRate: 0.01,
    stateIncomeTaxRate: 0.049,
  },
  {
    code: "NY",
    name: "New York",
    nameVi: "New York",
    sutaRate: 0.041,
    stateIncomeTaxRate: 0.06,
  },
  {
    code: "NC",
    name: "North Carolina",
    nameVi: "North Carolina",
    sutaRate: 0.01,
    stateIncomeTaxRate: 0.045,
  },
  {
    code: "ND",
    name: "North Dakota",
    nameVi: "North Dakota",
    sutaRate: 0.012,
    stateIncomeTaxRate: 0.0195,
  },
  {
    code: "OH",
    name: "Ohio",
    nameVi: "Ohio",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.035,
  },
  {
    code: "OK",
    name: "Oklahoma",
    nameVi: "Oklahoma",
    sutaRate: 0.015,
    stateIncomeTaxRate: 0.0475,
  },
  {
    code: "OR",
    name: "Oregon",
    nameVi: "Oregon",
    sutaRate: 0.021,
    stateIncomeTaxRate: 0.0875,
  },
  {
    code: "PA",
    name: "Pennsylvania",
    nameVi: "Pennsylvania",
    sutaRate: 0.0369,
    stateIncomeTaxRate: 0.0307,
  },
  {
    code: "RI",
    name: "Rhode Island",
    nameVi: "Rhode Island",
    sutaRate: 0.0098,
    stateIncomeTaxRate: 0.0475,
  },
  {
    code: "SC",
    name: "South Carolina",
    nameVi: "South Carolina",
    sutaRate: 0.0055,
    stateIncomeTaxRate: 0.064,
  },
  {
    code: "SD",
    name: "South Dakota",
    nameVi: "South Dakota",
    sutaRate: 0.012,
    stateIncomeTaxRate: 0.0,
  },
  {
    code: "TN",
    name: "Tennessee",
    nameVi: "Tennessee",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.0,
  },
  {
    code: "TX",
    name: "Texas",
    nameVi: "Texas",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.0,
  },
  {
    code: "UT",
    name: "Utah",
    nameVi: "Utah",
    sutaRate: 0.014,
    stateIncomeTaxRate: 0.0465,
  },
  {
    code: "VT",
    name: "Vermont",
    nameVi: "Vermont",
    sutaRate: 0.01,
    stateIncomeTaxRate: 0.066,
  },
  {
    code: "VA",
    name: "Virginia",
    nameVi: "Virginia",
    sutaRate: 0.0251,
    stateIncomeTaxRate: 0.0575,
  },
  {
    code: "WA",
    name: "Washington",
    nameVi: "Washington",
    sutaRate: 0.0127,
    stateIncomeTaxRate: 0.0,
  },
  {
    code: "WV",
    name: "West Virginia",
    nameVi: "West Virginia",
    sutaRate: 0.027,
    stateIncomeTaxRate: 0.0512,
  },
  {
    code: "WI",
    name: "Wisconsin",
    nameVi: "Wisconsin",
    sutaRate: 0.0305,
    stateIncomeTaxRate: 0.053,
  },
  {
    code: "WY",
    name: "Wyoming",
    nameVi: "Wyoming",
    sutaRate: 0.0118,
    stateIncomeTaxRate: 0.0,
  },
];

/** Lookup map keyed by 2-letter state code. */
export const STATE_MAP: Record<string, StateData> = STATES.reduce(
  (map, state) => {
    map[state.code] = state;
    return map;
  },
  {} as Record<string, StateData>,
);

/** SUTA wage base cap used for SUTA calculations (state default). */
export const DEFAULT_SUTA_WAGE_CAP = 7000;

/**
 * Returns state data for the given 2-letter code, or undefined if unknown.
 */
export function getStateData(code: string): StateData | undefined {
  return STATE_MAP[code];
}
