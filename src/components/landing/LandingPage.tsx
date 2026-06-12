/**
 * LandingPage — the entry screen of the application.
 *
 * Renders the {@link HeroSection} followed by a responsive grid of
 * {@link FeatureCard}s (one per entry in `data/featureCards.ts`, 4 total).
 * Clicking any card's CTA dispatches `START_FEATURE` on the flow reducer,
 * which shows the disclaimer gate (or jumps to the form if the disclaimer
 * was already accepted).
 *
 * The component reads its data and flow integration from defaults so it can
 * be dropped in as `<LandingPage />`, but both are overridable via props to
 * keep it easy to test in isolation (matching the documented interface in
 * design.md).
 *
 * @see design.md — "LandingPage"
 * @see requirements.md — Requirement 4 (Vietnamese interface)
 */

import { FEATURE_CARDS } from "../../data/featureCards";
import { useFlow } from "../../context/FlowContext";
import { FeatureCard, type FeatureCardData } from "./FeatureCard";
import { HeroSection } from "./HeroSection";
import { resolveIcon } from "./icons";

/** Props for {@link LandingPage}. */
export interface LandingPageProps {
  /**
   * Invoked when a feature card CTA is clicked. Defaults to dispatching
   * `START_FEATURE` on the flow reducer.
   */
  onStartFeature?: () => void;
  /**
   * Feature cards to display. Defaults to the cards from
   * `data/featureCards.ts` with their icon identifiers resolved.
   */
  features?: FeatureCardData[];
}

/** Resolve the raw feature card config into renderable card data. */
function defaultFeatures(): FeatureCardData[] {
  return FEATURE_CARDS.map((card) => ({
    id: card.id,
    icon: resolveIcon(card.icon),
    title: card.title,
    description: card.description,
    ctaLabel: card.ctaLabel,
  }));
}

export function LandingPage({ onStartFeature, features }: LandingPageProps) {
  const { dispatch } = useFlow();

  const handleStart =
    onStartFeature ?? (() => dispatch({ type: "START_FEATURE" }));
  const cards = features ?? defaultFeatures();

  return (
    <div className="space-y-10">
      <HeroSection />
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {cards.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            onStart={handleStart}
          />
        ))}
      </section>
    </div>
  );
}

export default LandingPage;
