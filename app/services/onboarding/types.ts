/**
 * Onboarding (Getting-Started checklist) — types.
 *
 * The honesty principle: a step is `done` ONLY when real data proves it. A
 * checklist that claims a step is finished when it isn't is worse than no
 * checklist — it erodes the merchant's trust in every other number we show.
 * Where a signal is only a proxy (the storefront widget), `confidence` is
 * "low" and the UI must hedge rather than assert.
 */

export type SetupStepKey =
  | "configure-store-currency"
  | "configure-tiers"
  | "enable-points-earning"
  | "create-first-reward"
  | "add-storefront-widget"
  | "go-live-first-cashback";

export interface SetupStep {
  key: SetupStepKey;
  title: string;
  /** One merchant-facing sentence: what to do and why it matters. */
  description: string;
  ctaLabel: string;
  ctaRoute: string;
  /** Natural setup order — foundational config first, going-live last. */
  order: number;
  /** True only when the data genuinely proves completion. */
  done: boolean;
  /**
   * How trustworthy the `done` signal is. "low" means the underlying signal
   * is a lagging proxy (e.g. a cached widget-detection flag); the UI should
   * present such a step with a "we can't always verify this" hedge instead of
   * a confident tick.
   */
  confidence: "high" | "medium" | "low";
}

/**
 * Raw inputs the pure `computeChecklist` step consumes — one field per
 * underlying data read, already reduced to a primitive so the compute layer
 * stays free of Prisma and is trivially testable.
 */
export interface ChecklistData {
  /** ShopSettings.currencySelected — explicit merchant action, defaults false. */
  currencySelected: boolean;
  /** All Tier rows for the shop (used to detect config vs the default Bronze tier). */
  tiers: Array<{
    name: string;
    minSpend: number;
    cashbackPercent: number;
    evaluationPeriod: string;
  }>;
  /** PointsConfig.isEnabled — master points toggle, defaults false. */
  pointsEnabled: boolean;
  /** Count of raffles + mystery boxes + challenges in ACTIVE/SCHEDULED status. */
  activeRewardCount: number;
  /** ShopSettings.widgetIsActive — cached theme-detection result (lagging proxy). */
  widgetIsActive: boolean;
  /** ShopSettings.widgetSetupDismissed — merchant dismissed the widget prompt. */
  widgetSetupDismissed: boolean;
  /** Processed-cashback orders + cashback ledger entries tied to an order. */
  cashbackEarnedCount: number;
}

export interface SetupChecklist {
  steps: SetupStep[];
  completedCount: number;
  totalCount: number;
  allComplete: boolean;
}
