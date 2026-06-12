/**
 * FeatureCard — a single landing page feature card.
 *
 * Displays an icon, title, short description, and a call-to-action button.
 * Clicking the CTA invokes {@link FeatureCardProps.onStart}, which the
 * landing page wires to the disclaimer flow.
 *
 * All visible text is supplied via the `feature` prop (Vietnamese).
 *
 * @see design.md — "FeatureCard"
 * @see requirements.md — Requirement 4 (Vietnamese interface)
 */

import type { ReactNode } from "react";

/**
 * Renderable feature card data consumed by the UI.
 *
 * Note the `icon` is a {@link ReactNode} here (already resolved), whereas the
 * raw configuration in `data/featureCards.ts` stores a string identifier.
 */
export interface FeatureCardData {
  id: string;
  /** Already-resolved icon node. */
  icon: ReactNode;
  /** Card title (Vietnamese). */
  title: string;
  /** Short description (Vietnamese). */
  description: string;
  /** CTA button label (Vietnamese). */
  ctaLabel: string;
}

/** Props for {@link FeatureCard}. */
export interface FeatureCardProps {
  feature: FeatureCardData;
  /** Invoked when the user clicks the CTA button. */
  onStart: () => void;
}

export function FeatureCard({ feature, onStart }: FeatureCardProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {feature.icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {feature.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-gray-600">{feature.description}</p>
      <button
        type="button"
        onClick={onStart}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {feature.ctaLabel}
      </button>
    </div>
  );
}

export default FeatureCard;
