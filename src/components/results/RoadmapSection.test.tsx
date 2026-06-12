/**
 * Tests for the roadmap results section components.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4 (display the transition roadmap
 * with phases, target ratios, durations, and guidance notes — all in
 * Vietnamese).
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { Phase, Roadmap } from "../../context/types";
import { generateRoadmap } from "../../utils/roadmapGenerator";
import { PhaseCard } from "./PhaseCard";
import { RoadmapSection } from "./RoadmapSection";

const samplePhase: Phase = {
  phaseNumber: 2,
  checkPercent: 70,
  cashPercent: 30,
  durationMonths: 3,
  startMonth: 2,
  endMonth: 5,
  notes: "Giai đoạn 2/4: Đưa tỉ lệ check lên 70% và giảm cash xuống 30%.",
};

describe("PhaseCard", () => {
  it("renders the phase number, target ratios, and duration", () => {
    render(<PhaseCard phase={samplePhase} />);

    expect(screen.getByText("Giai đoạn 2")).toBeInTheDocument();
    // Target ratios
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    // Labels (Vietnamese)
    expect(screen.getByText(/Check \(mục tiêu\)/)).toBeInTheDocument();
    expect(screen.getByText(/Cash \(mục tiêu\)/)).toBeInTheDocument();
    // Duration + timeframe
    expect(screen.getByText(/3 tháng/)).toBeInTheDocument();
    expect(screen.getByText(/Tháng 3 - Tháng 5/)).toBeInTheDocument();
  });

  it("marks the final phase with a 'giai đoạn cuối' label", () => {
    const finalPhase: Phase = {
      ...samplePhase,
      phaseNumber: 4,
      checkPercent: 100,
      cashPercent: 0,
    };
    render(<PhaseCard phase={finalPhase} isFinal />);
    expect(screen.getByText(/giai đoạn cuối/)).toBeInTheDocument();
  });

  it("renders a single-month timeframe without a range", () => {
    const onePhase: Phase = {
      ...samplePhase,
      phaseNumber: 1,
      durationMonths: 1,
      startMonth: 0,
      endMonth: 1,
    };
    render(<PhaseCard phase={onePhase} />);
    expect(screen.getByText(/Tháng 1 ·/)).toBeInTheDocument();
    expect(screen.getByText(/1 tháng/)).toBeInTheDocument();
  });
});

describe("RoadmapSection", () => {
  it("renders a Vietnamese heading and one card per phase plus the current-state card", () => {
    const roadmap = generateRoadmap({
      currentCashPercent: 50,
      splitRatio: { owner: 4, worker: 6 },
      workerType: "W2",
    });

    render(<RoadmapSection roadmap={roadmap} currentCashPercent={50} />);

    expect(
      screen.getByRole("heading", { name: "Lộ trình chuyển đổi" }),
    ).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    // +1 for the "Hiện tại" (current state) card at the top.
    expect(items).toHaveLength(roadmap.phases.length + 1);
    // First card is "Hiện tại".
    expect(within(items[0]).getByText("Hiện tại")).toBeInTheDocument();
  });

  it("shows the summary (total duration and phase count on one row)", () => {
    const roadmap = generateRoadmap({
      currentCashPercent: 50,
      splitRatio: { owner: 4, worker: 6 },
      workerType: "W2",
    });

    render(<RoadmapSection roadmap={roadmap} currentCashPercent={50} />);

    expect(screen.getByText("Tổng thời gian")).toBeInTheDocument();
    expect(screen.getByText("Số giai đoạn")).toBeInTheDocument();

    // "Tỉ lệ cash hiện tại" box is gone — that info is in the current-state card.
    expect(screen.queryByText("Tỉ lệ cash hiện tại")).not.toBeInTheDocument();

    const phaseCountCell = screen
      .getByText("Số giai đoạn")
      .closest("div") as HTMLElement;
    expect(
      within(phaseCountCell).getByText(String(roadmap.phases.length)),
    ).toBeInTheDocument();
  });

  it("does not render recommendation text", () => {
    const roadmap: Roadmap = {
      phases: [samplePhase],
      totalDurationMonths: 3,
      recommendation: "Khuyến nghị chuyển đổi từ từ.",
    };

    render(<RoadmapSection roadmap={roadmap} currentCashPercent={30} />);
    expect(
      screen.queryByText("Khuyến nghị chuyển đổi từ từ."),
    ).not.toBeInTheDocument();
  });

  it("renders a 'no transition needed' note when already 100% check", () => {
    const roadmap = generateRoadmap({
      currentCashPercent: 0,
      splitRatio: { owner: 4, worker: 6 },
      workerType: "W2",
    });

    render(<RoadmapSection roadmap={roadmap} currentCashPercent={0} />);
    expect(screen.getByText(/Bạn đã hoạt động 100% check/)).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("renders the final phase reaching 100% check", () => {
    const roadmap = generateRoadmap({
      currentCashPercent: 50,
      splitRatio: { owner: 4, worker: 6 },
      workerType: "W2",
    });

    render(<RoadmapSection roadmap={roadmap} currentCashPercent={50} />);
    const items = screen.getAllByRole("listitem");
    const lastCard = items[items.length - 1];
    // Final phase reaches 100% check.
    expect(within(lastCard).getByText("100%")).toBeInTheDocument();
  });
});
