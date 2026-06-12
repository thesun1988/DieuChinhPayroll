/**
 * Display formatting helpers.
 *
 * These functions format numeric values for the Vietnamese-language UI:
 * - USD currency amounts (`$X,XXX.XX`)
 * - Percentages (`XX%`)
 * - Commission split ratios (`X/Y`)
 * - Month labels in Vietnamese (`Tháng X`)
 */

/**
 * Format a number as a USD currency string: `$X,XXX.XX`.
 *
 * Uses comma-separated thousands and exactly 2 decimal places. The value is
 * rounded to 2 decimal places, so the formatted string round-trips back to the
 * original value when parsed (within 2-decimal precision).
 *
 * @param amount - The dollar amount to format.
 * @returns A string like `"$1,234.56"`.
 */
export function formatUSD(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(Math.abs(amount));

  // Preserve sign while keeping the dollar sign immediately before the digits.
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Format a number as a whole-number percentage: `XX%`.
 *
 * The value is rounded to the nearest integer.
 *
 * @param value - The percentage value (e.g. `60` for 60%).
 * @returns A string like `"60%"`.
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format a commission split ratio as `X/Y`.
 *
 * @param owner - The owner's share (e.g. `4`).
 * @param worker - The worker's share (e.g. `6`).
 * @returns A string like `"4/6"`.
 */
export function formatRatio(owner: number, worker: number): string {
  return `${owner}/${worker}`;
}

/**
 * Format a month number as a Vietnamese label: `Tháng X`.
 *
 * @param month - The month number (e.g. `3`).
 * @returns A string like `"Tháng 3"`.
 */
export function formatMonth(month: number): string {
  return `Tháng ${month}`;
}
