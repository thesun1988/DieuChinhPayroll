/**
 * Tests for the landing page components.
 *
 * Validates: Requirements 4.1 (Vietnamese UI), 4.2 (feature discovery)
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { FlowProvider } from "../../context/FlowContext";
import { FEATURE_CARDS } from "../../data/featureCards";
import { LandingPage } from "./LandingPage";
import { FeatureCard, type FeatureCardData } from "./FeatureCard";
import { HeroSection } from "./HeroSection";

describe("HeroSection", () => {
  it("renders a Vietnamese heading", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", {
        name: /Chuyển Đổi Lương/i,
      }),
    ).toBeInTheDocument();
  });
});

describe("FeatureCard", () => {
  const feature: FeatureCardData = {
    id: "demo",
    icon: <svg data-testid="demo-icon" />,
    title: "Tiêu đề",
    description: "Mô tả ngắn",
    ctaLabel: "Bắt đầu",
  };

  it("renders title, description, icon and CTA label", () => {
    render(<FeatureCard feature={feature} onStart={() => {}} />);
    expect(screen.getByText("Tiêu đề")).toBeInTheDocument();
    expect(screen.getByText("Mô tả ngắn")).toBeInTheDocument();
    expect(screen.getByTestId("demo-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bắt đầu" })).toBeInTheDocument();
  });

  it("invokes onStart when the CTA is clicked", () => {
    const onStart = vi.fn();
    render(<FeatureCard feature={feature} onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

describe("LandingPage", () => {
  it("renders the hero and one card per feature config", () => {
    render(
      <FlowProvider>
        <LandingPage />
      </FlowProvider>,
    );
    expect(
      screen.getByRole("heading", { name: /Chuyển Đổi Lương/i }),
    ).toBeInTheDocument();
    for (const card of FEATURE_CARDS) {
      expect(screen.getByText(card.title)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button", { name: "Bắt đầu" })).toHaveLength(
      FEATURE_CARDS.length,
    );
  });

  it("calls onStartFeature override when a CTA is clicked", () => {
    const onStartFeature = vi.fn();
    render(
      <FlowProvider>
        <LandingPage onStartFeature={onStartFeature} />
      </FlowProvider>,
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Bắt đầu" })[0]);
    expect(onStartFeature).toHaveBeenCalledTimes(1);
  });

  it("renders custom features when provided", () => {
    const features: FeatureCardData[] = [
      {
        id: "only",
        icon: <svg />,
        title: "Chỉ một thẻ",
        description: "Mô tả",
        ctaLabel: "Mở",
      },
    ];
    render(
      <FlowProvider>
        <LandingPage features={features} />
      </FlowProvider>,
    );
    expect(screen.getByText("Chỉ một thẻ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mở" })).toBeInTheDocument();
  });

  it("renders each card's CTA inside its own card", () => {
    render(
      <FlowProvider>
        <LandingPage />
      </FlowProvider>,
    );
    const firstTitle = screen.getByText(FEATURE_CARDS[0].title);
    const card = firstTitle.closest("div");
    expect(card).not.toBeNull();
    expect(
      within(card as HTMLElement).getByRole("button", { name: "Bắt đầu" }),
    ).toBeInTheDocument();
  });
});
