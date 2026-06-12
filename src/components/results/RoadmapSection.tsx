/**
 * RoadmapSection — timeline view of the cash→check transition roadmap.
 *
 * Renders the generated {@link Roadmap} as a sequence of {@link PhaseCard}s
 * (a vertical timeline), along with a summary header (current cash %, total
 * duration, number of phases) and the overall recommendation text.
 *
 * If the user is already at 0% cash (100% check), a friendly note is shown
 * instead of a transition timeline.
 *
 * All visible text is Vietnamese.
 *
 * @see design.md — "RoadmapSection"
 * @see requirements.md — Requirements 1.1, 1.2, 1.3, 1.4
 */

import type { PhaseAmounts, Roadmap } from "../../context/types";
import { formatPercent, formatUSD } from "../../utils/formatters";
import { PhaseCard } from "./PhaseCard";

/** Props for {@link RoadmapSection}. */
export interface RoadmapSectionProps {
  /** The generated transition roadmap. */
  roadmap: Roadmap;
  /** The user's current cash percentage (0-100). */
  currentCashPercent: number;
}

/** Format the total duration in a Vietnamese label. */
function formatDuration(months: number): string {
  return months === 1 ? "1 tháng" : `${months} tháng`;
}

/** Before vs After summary comparing current state with 100% check. */
function BeforeAfterSummary({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: PhaseAmounts;
  after: PhaseAmounts;
  beforeLabel: string;
  afterLabel: string;
}) {
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">
        So sánh trước và sau chuyển đổi
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        So sánh số tiền thực nhận (sau thuế/chi phí) giữa hiện tại và khi chuyển
        sang 100% check.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* W-2 block */}
        <ComparisonBlock
          title="W-2 (Nhân viên)"
          accent="blue"
          beforeLabel={beforeLabel}
          afterLabel={afterLabel}
          before={{
            ownerPays: before.w2.worker.amountReceived,
            workerTax: before.w2.worker.tax,
            workerNet: before.w2.worker.netAfterTax,
            workerRetention: before.w2.worker.retentionPercent,
            employerCost: before.w2.owner.employerCost,
            ownerNet: before.w2.owner.net,
            ownerRetention: before.w2.owner.retentionPercent,
          }}
          after={{
            ownerPays: after.w2.worker.amountReceived,
            workerTax: after.w2.worker.tax,
            workerNet: after.w2.worker.netAfterTax,
            workerRetention: after.w2.worker.retentionPercent,
            employerCost: after.w2.owner.employerCost,
            ownerNet: after.w2.owner.net,
            ownerRetention: after.w2.owner.retentionPercent,
          }}
          taxLabel="Thuế khấu trừ"
        />

        {/* 1099 block */}
        <ComparisonBlock
          title="1099 (Thầu độc lập)"
          accent="emerald"
          beforeLabel={beforeLabel}
          afterLabel={afterLabel}
          before={{
            ownerPays: before.result1099.worker.amountReceived,
            workerTax: before.result1099.worker.tax,
            workerNet: before.result1099.worker.netAfterTax,
            workerRetention: before.result1099.worker.retentionPercent,
            employerCost: before.result1099.owner.employerCost,
            ownerNet: before.result1099.owner.net,
            ownerRetention: before.result1099.owner.retentionPercent,
          }}
          after={{
            ownerPays: after.result1099.worker.amountReceived,
            workerTax: after.result1099.worker.tax,
            workerNet: after.result1099.worker.netAfterTax,
            workerRetention: after.result1099.worker.retentionPercent,
            employerCost: after.result1099.owner.employerCost,
            ownerNet: after.result1099.owner.net,
            ownerRetention: after.result1099.owner.retentionPercent,
          }}
          taxLabel="Thuế ước tính (thợ tự trả)"
          taxEstimate
        />
      </div>
    </div>
  );
}

interface BlockData {
  ownerPays: number;
  workerTax: number;
  workerNet: number;
  workerRetention: number;
  employerCost: number;
  ownerNet: number;
  ownerRetention: number;
}

const BLOCK_ACCENTS = {
  blue: {
    headerBg: "bg-blue-50",
    headerText: "text-blue-800",
    border: "border-blue-200",
  },
  emerald: {
    headerBg: "bg-emerald-50",
    headerText: "text-emerald-800",
    border: "border-emerald-200",
  },
} as const;

function ComparisonBlock({
  title,
  accent,
  beforeLabel,
  afterLabel,
  before,
  after,
  taxLabel,
  taxEstimate,
}: {
  title: string;
  accent: keyof typeof BLOCK_ACCENTS;
  beforeLabel: string;
  afterLabel: string;
  before: BlockData;
  after: BlockData;
  taxLabel: string;
  taxEstimate?: boolean;
}) {
  const c = BLOCK_ACCENTS[accent];
  const prefix = taxEstimate ? "~" : "";

  return (
    <div className={`rounded-lg border ${c.border} overflow-hidden`}>
      <div className={`${c.headerBg} px-4 py-2`}>
        <p className={`text-sm font-semibold ${c.headerText}`}>{title}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-2 text-left font-medium text-gray-500" />
              <th className="px-3 py-2 text-right font-semibold text-indigo-600">
                {beforeLabel}
              </th>
              <th className="px-3 py-2 text-right font-semibold text-green-600">
                {afterLabel}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <tr>
              <td className="px-4 py-2 text-gray-600">Chủ trả cho thợ</td>
              <td className="px-3 py-2 text-right font-medium">
                {formatUSD(before.ownerPays)}
              </td>
              <td className="px-3 py-2 text-right font-medium">
                {formatUSD(after.ownerPays)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-600">{taxLabel}</td>
              <td className="px-3 py-2 text-right font-medium text-red-600">
                {prefix}
                {formatUSD(before.workerTax)}
              </td>
              <td className="px-3 py-2 text-right font-medium text-red-600">
                {prefix}
                {formatUSD(after.workerTax)}
              </td>
            </tr>
            <tr className="bg-gray-50/80">
              <td className="px-4 py-2 font-semibold text-gray-900">
                Thực nhận thợ
              </td>
              <td className="px-3 py-2 text-right font-bold text-gray-900">
                {formatUSD(before.workerNet)}
                <span className="ml-1 text-[10px] font-normal text-gray-500">
                  ({formatPercent(before.workerRetention)})
                </span>
              </td>
              <td className="px-3 py-2 text-right font-bold text-gray-900">
                {formatUSD(after.workerNet)}
                <span className="ml-1 text-[10px] font-normal text-gray-500">
                  ({formatPercent(after.workerRetention)})
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-gray-600">Chi phí chủ (thuế)</td>
              <td className="px-3 py-2 text-right font-medium text-red-600">
                {formatUSD(before.employerCost)}
              </td>
              <td className="px-3 py-2 text-right font-medium text-red-600">
                {formatUSD(after.employerCost)}
              </td>
            </tr>
            <tr className="bg-gray-50/80">
              <td className="px-4 py-2 font-semibold text-gray-900">
                Thực nhận chủ
              </td>
              <td className="px-3 py-2 text-right font-bold text-gray-900">
                {formatUSD(before.ownerNet)}
                <span className="ml-1 text-[10px] font-normal text-gray-500">
                  ({formatPercent(before.ownerRetention)})
                </span>
              </td>
              <td className="px-3 py-2 text-right font-bold text-gray-900">
                {formatUSD(after.ownerNet)}
                <span className="ml-1 text-[10px] font-normal text-gray-500">
                  ({formatPercent(after.ownerRetention)})
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RoadmapSection({
  roadmap,
  currentCashPercent,
}: RoadmapSectionProps) {
  const { phases, totalDurationMonths, currentPhase } = roadmap;
  const lastIndex = phases.length - 1;

  // Already 100% check — no transition needed.
  if (currentCashPercent <= 0) {
    return (
      <section aria-labelledby="roadmap-heading" className="w-full">
        <h2
          id="roadmap-heading"
          className="text-xl font-bold text-gray-900 sm:text-2xl"
        >
          Lộ trình chuyển đổi
        </h2>
        <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-6 text-center">
          <p className="text-base font-medium text-green-800">
            Bạn đã hoạt động 100% check. Không cần chuyển đổi.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="roadmap-heading" className="w-full">
      <h2
        id="roadmap-heading"
        className="text-xl font-bold text-gray-900 sm:text-2xl"
      >
        Lộ trình chuyển đổi
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Kế hoạch chuyển từ cash/check sang 100% check theo từng giai đoạn.
      </p>

      {/* Summary — 2 boxes on one row */}
      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <dt className="text-xs font-medium text-gray-500">Tổng thời gian</dt>
          <dd className="mt-1 text-lg font-bold text-gray-900">
            {formatDuration(totalDurationMonths)}
          </dd>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <dt className="text-xs font-medium text-gray-500">Số giai đoạn</dt>
          <dd className="mt-1 text-lg font-bold text-gray-900">
            {phases.length}
          </dd>
        </div>
      </dl>

      {/* Timeline: current state + phases */}
      <ol className="mt-6 space-y-4">
        {/* "Hiện tại" — current state card before phase 1 */}
        {currentPhase && (
          <li key="current">
            <PhaseCard phase={currentPhase} isCurrent />
          </li>
        )}
        {phases.map((phase, index) => (
          <li key={phase.phaseNumber}>
            <PhaseCard phase={phase} isFinal={index === lastIndex} />
          </li>
        ))}
      </ol>

      {/* Before vs After comparison */}
      {currentPhase?.amounts && phases[lastIndex]?.amounts && (
        <BeforeAfterSummary
          before={currentPhase.amounts}
          after={phases[lastIndex].amounts!}
          beforeLabel="Hiện tại"
          afterLabel="Sau chuyển đổi (100% check)"
        />
      )}
    </section>
  );
}

export default RoadmapSection;
