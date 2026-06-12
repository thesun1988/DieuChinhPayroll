/**
 * Landing page feature card configuration, in Vietnamese.
 *
 * Each card showcases one of the app's main features on the landing page.
 * The `icon` field is a string identifier resolved to an actual icon by the
 * UI layer (e.g. mapped to a Lucide/SVG component).
 *
 * Validates: Requirements 3.x, 6.x (feature discovery for landing page)
 */

/** Configuration for a single landing page feature card. */
export interface FeatureCardConfig {
  /** Stable identifier. */
  id: string;
  /** Icon identifier resolved by the UI (e.g. "roadmap", "calculator"). */
  icon: string;
  /** Card title (Vietnamese). */
  title: string;
  /** Short description (Vietnamese). */
  description: string;
  /** CTA button label (Vietnamese). */
  ctaLabel: string;
}

/** Feature cards displayed on the landing page (4 cards). */
export const FEATURE_CARDS: FeatureCardConfig[] = [
  {
    id: "roadmap",
    icon: "roadmap",
    title: "Lộ trình chuyển đổi",
    description:
      "Xem lộ trình từng bước chuyển từ trả lương cash sang 100% check một cách an toàn, tránh thay đổi đột ngột gây chú ý cho IRS.",
    ctaLabel: "Bắt đầu",
  },
  {
    id: "calculator",
    icon: "calculator",
    title: "Tính toán lương & thuế",
    description:
      "Ước lượng chi phí thuế khi chuyển đổi cho cả hình thức W-2 và 1099, bao gồm phần chủ tiệm và phần thợ.",
    ctaLabel: "Bắt đầu",
  },
  {
    id: "warnings",
    icon: "warning",
    title: "Cảnh báo IRS",
    description:
      "Tìm hiểu các dấu hiệu bất thường (red flag) thường gặp trong ngành nail và cách phòng tránh để giảm rủi ro bị audit.",
    ctaLabel: "Bắt đầu",
  },
  {
    id: "classification",
    icon: "classification",
    title: "So sánh W-2 vs 1099",
    description:
      "Hiểu sự khác biệt giữa W-2 và 1099, dùng checklist theo tiêu chí IRS để chọn đúng hình thức lao động cho thợ.",
    ctaLabel: "Bắt đầu",
  },
];

/** Lookup map keyed by feature card id. */
export const FEATURE_CARD_MAP: Record<string, FeatureCardConfig> =
  FEATURE_CARDS.reduce(
    (map, card) => {
      map[card.id] = card;
      return map;
    },
    {} as Record<string, FeatureCardConfig>,
  );
