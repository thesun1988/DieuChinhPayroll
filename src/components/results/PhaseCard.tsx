/**
 * PhaseCard — a single phase in the transition roadmap.
 *
 * Displays one {@link Phase} of the cash→check transition: its target
 * check/cash ratio, the timeframe (start/end month), duration, and the
 * Vietnamese guidance note.
 *
 * All visible text is Vietnamese.
 *
 * @see design.md — "PhaseCard"
 * @see requirements.md — Requirement 1.4 (mỗi giai đoạn với tỉ lệ mục tiêu,
 *   thời gian, ghi chú)
 */

import { useState } from "react";
import type {
  Phase,
  PhaseClassificationBreakdown,
  PhaseOwnerBreakdown,
} from "../../context/types";
import { formatMonth, formatPercent, formatUSD } from "../../utils/formatters";

/** Expandable owner employer-cost detail (mirrors the worker tax expand). */
function ExpandableOwnerCost({ owner }: { owner: PhaseOwnerBreakdown }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded px-0.5 py-0.5 text-left text-xs hover:bg-black/5"
      >
        <span className="flex items-center gap-1 text-gray-600">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M7.21 5.23a.75.75 0 0 1 1.06 0l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 1 1-1.06-1.06L10.94 10 7.21 6.29a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
          Chi phí (thuế chủ đóng)
        </span>
        <span className="font-medium text-red-600">
          −{formatUSD(owner.employerCost)}
        </span>
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5 rounded-md bg-white/70 px-2 py-1.5 text-[11px]">
          {owner.taxLines.map((line) => (
            <li
              key={line.label}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-gray-500">{line.label}</span>
              <span className="shrink-0 font-medium text-gray-700">
                {formatUSD(line.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Tailwind accent classes per classification column. */
const ACCENTS = {
  blue: {
    border: "border-blue-200",
    bg: "bg-blue-50/60",
    label: "text-blue-700",
    value: "text-blue-900",
  },
  emerald: {
    border: "border-emerald-200",
    bg: "bg-emerald-50/60",
    label: "text-emerald-700",
    value: "text-emerald-900",
  },
} as const;

/** One classification column: worker + owner after-cost breakdown. */
function ClassificationCard({
  label,
  accent,
  data,
}: {
  label: string;
  accent: keyof typeof ACCENTS;
  data: PhaseClassificationBreakdown;
}) {
  const c = ACCENTS[accent];
  const { worker, owner } = data;
  const [taxOpen, setTaxOpen] = useState(false);
  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-3`}>
      <p className={`text-xs font-semibold ${c.label}`}>{label}</p>

      {/* Worker block */}
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        Thợ (Worker)
      </p>
      <dl className="mt-1 space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Phần thợ (trước thuế)</dt>
          <dd className="font-medium text-gray-900">
            {formatUSD(worker.gross)}
          </dd>
        </div>

        {/* Expandable tax line */}
        <div>
          <button
            type="button"
            onClick={() => setTaxOpen((o) => !o)}
            aria-expanded={taxOpen}
            className="flex w-full items-center justify-between rounded px-0.5 py-0.5 text-left hover:bg-black/5"
          >
            <span className="flex items-center gap-1 text-gray-600">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={`h-3 w-3 shrink-0 transition-transform ${
                  taxOpen ? "rotate-90" : ""
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 5.23a.75.75 0 0 1 1.06 0l4.25 4.24a.75.75 0 0 1 0 1.06l-4.25 4.24a.75.75 0 1 1-1.06-1.06L10.94 10 7.21 6.29a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
              {worker.taxWithheld
                ? `Thuế trên check (${formatPercent(worker.effectiveTaxPercent)})`
                : `Thuế ước tính trên check (~${formatPercent(worker.effectiveTaxPercent)})`}
            </span>
            <span
              className={
                worker.taxWithheld
                  ? "font-medium text-red-600"
                  : "font-medium text-gray-500"
              }
            >
              {worker.taxWithheld
                ? `−${formatUSD(worker.tax)}`
                : `~${formatUSD(worker.tax)}`}
            </span>
          </button>

          {taxOpen && (
            <ul className="mt-1 space-y-0.5 rounded-md bg-white/70 px-2 py-1.5 text-[11px]">
              {worker.taxLines.map((line) => (
                <li
                  key={line.label}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-gray-500">{line.label}</span>
                  <span className="shrink-0 font-medium text-gray-700">
                    {formatUSD(line.amount)}
                  </span>
                </li>
              ))}
              {!worker.taxWithheld && (
                <li className="pt-1 text-[10px] italic text-gray-400">
                  * Số liệu thuế 1099 chỉ là ước tính; thợ tự khai và đóng.
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-1">
          <dt className="font-medium text-gray-800">Chủ trả cho thợ</dt>
          <dd className={`text-sm font-bold ${c.value}`}>
            {formatUSD(worker.amountReceived)}
          </dd>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-600">
          <dt>Trong đó Check / Cash</dt>
          <dd className="font-medium">
            {formatUSD(worker.checkReceived)} / {formatUSD(worker.cashReceived)}
          </dd>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <dt>
            {worker.taxWithheld
              ? "Thực nhận (đã trừ thuế)"
              : "Thực nhận sau thuế ước tính"}
          </dt>
          <dd className="font-semibold">
            {formatUSD(worker.netAfterTax)} (
            {formatPercent(worker.retentionPercent)})
          </dd>
        </div>
      </dl>

      {/* Owner block */}
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        Chủ (Owner)
      </p>
      <dl className="mt-1 space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Phần chủ (trước chi phí)</dt>
          <dd className="font-medium text-gray-900">
            {formatUSD(owner.gross)}
          </dd>
        </div>

        {/* Expandable employer cost line */}
        {owner.employerCost > 0 ? (
          <ExpandableOwnerCost owner={owner} />
        ) : (
          <div className="flex items-center justify-between">
            <dt className="text-gray-600">Chi phí (thuế chủ đóng)</dt>
            <dd className="font-medium text-gray-400">$0.00</dd>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 pt-1">
          <dt className="font-medium text-gray-800">Thực nhận</dt>
          <dd className={`text-sm font-bold ${c.value}`}>
            {formatUSD(owner.net)}
          </dd>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <dt>% giữ lại sau chi phí</dt>
          <dd className="font-semibold">
            {formatPercent(owner.retentionPercent)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/** Props for {@link PhaseCard}. */
export interface PhaseCardProps {
  /** The phase to render. */
  phase: Phase;
  /** Whether this is the final phase (100% check), styled as the goal. */
  isFinal?: boolean;
  /** Whether this is the "current state" synthetic card (phase 0). */
  isCurrent?: boolean;
}

/**
 * Format a phase's timeframe as a Vietnamese label.
 *
 * Phase month boundaries are zero-based "months elapsed". Convert to a
 * human-friendly 1-based calendar label, e.g. startMonth 0, endMonth 2 →
 * "Tháng 1 - Tháng 2".
 */
function formatTimeframe(startMonth: number, endMonth: number): string {
  const start = formatMonth(startMonth + 1);
  const end = formatMonth(endMonth);
  return start === end ? start : `${start} - ${end}`;
}

export function PhaseCard({
  phase,
  isFinal = false,
  isCurrent = false,
}: PhaseCardProps) {
  const durationLabel =
    phase.durationMonths === 1 ? "1 tháng" : `${phase.durationMonths} tháng`;

  const borderClass = isCurrent
    ? "border-indigo-300 bg-indigo-50"
    : isFinal
      ? "border-green-300 bg-green-50"
      : "border-gray-200";

  const badgeClass = isCurrent
    ? "bg-indigo-600 text-white"
    : isFinal
      ? "bg-green-600 text-white"
      : "bg-blue-100 text-blue-700";

  const title = isCurrent
    ? "Hiện tại"
    : `Giai đoạn ${phase.phaseNumber}${isFinal ? " (giai đoạn cuối)" : ""}`;

  return (
    <div
      className={[
        "rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        borderClass,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              "flex h-9 w-9 flex-none items-center justify-center rounded-full text-sm font-semibold",
              badgeClass,
            ].join(" ")}
          >
            {isCurrent ? "●" : phase.phaseNumber}
          </span>
          <div>
            <h4 className="text-base font-semibold text-gray-900">{title}</h4>
            {!isCurrent && (
              <p className="text-xs text-gray-500">
                {formatTimeframe(phase.startMonth, phase.endMonth)} ·{" "}
                {durationLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-xs font-medium text-blue-700">Check (mục tiêu)</p>
          <p className="mt-1 text-lg font-bold text-blue-900">
            {formatPercent(phase.checkPercent)}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3 text-center">
          <p className="text-xs font-medium text-amber-700">Cash (mục tiêu)</p>
          <p className="mt-1 text-lg font-bold text-amber-900">
            {formatPercent(phase.cashPercent)}
          </p>
        </div>
      </div>

      {phase.amounts && (
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ClassificationCard
              label="W-2 (Nhân viên)"
              accent="blue"
              data={phase.amounts.w2}
            />
            <ClassificationCard
              label="1099 (Thầu độc lập)"
              accent="emerald"
              data={phase.amounts.result1099}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PhaseCard;
