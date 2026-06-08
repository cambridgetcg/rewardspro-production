/**
 * Onboarding checklist — pure compute.
 *
 * Takes already-fetched `ChecklistData` and decides which steps are done. No
 * I/O, no Prisma — this is the testable seam. Every `done` rule here is the
 * single source of truth and must only return true when the data genuinely
 * proves completion (see types.ts honesty principle).
 */
import type { ChecklistData, SetupChecklist, SetupStep } from "./types";

/**
 * The auto-injected default tier (see app/services/tier-management.server.ts).
 * A shop whose ONLY tier matches this signature has not configured tiers — it
 * is running on the untouched default.
 */
const DEFAULT_TIER = {
  name: "Bronze Member",
  minSpend: 0,
  cashbackPercent: 1,
  evaluationPeriod: "LIFETIME",
} as const;

/**
 * Tiers are "configured" when the merchant has gone beyond the single default
 * Bronze tier: either more than one tier exists, or the single tier deviates
 * from the default signature on any field. Zero tiers, or exactly one tier
 * matching the default, counts as NOT configured.
 */
export function tiersConfigured(tiers: ChecklistData["tiers"]): boolean {
  if (tiers.length === 0) return false;
  if (tiers.length > 1) return true;
  const t = tiers[0];
  const isDefault =
    t.name === DEFAULT_TIER.name &&
    t.minSpend === DEFAULT_TIER.minSpend &&
    t.cashbackPercent === DEFAULT_TIER.cashbackPercent &&
    t.evaluationPeriod === DEFAULT_TIER.evaluationPeriod;
  return !isDefault;
}

export function computeChecklist(data: ChecklistData): SetupChecklist {
  const steps: SetupStep[] = [
    {
      key: "configure-store-currency",
      title: "Choose your cashback currency",
      description:
        "Pick the store-credit currency customers earn in — everything else builds on this choice.",
      ctaLabel: "Open settings",
      ctaRoute: "/app/settings",
      order: 1,
      confidence: "high",
      done: data.currencySelected,
    },
    {
      key: "configure-tiers",
      title: "Set up your membership tiers",
      description:
        "Define the tiers and cashback rates that reward your best customers, beyond the single default tier.",
      ctaLabel: "Configure tiers",
      ctaRoute: "/app/members/tiers",
      order: 2,
      confidence: "medium",
      done: tiersConfigured(data.tiers),
    },
    {
      key: "enable-points-earning",
      title: "Turn on points earning",
      description:
        "Activate the points engine so customers start accumulating points on every purchase.",
      ctaLabel: "Configure points",
      ctaRoute: "/app/rewards/config",
      order: 3,
      confidence: "high",
      done: data.pointsEnabled,
    },
    {
      key: "create-first-reward",
      title: "Launch your first reward",
      description:
        "Create a raffle, mystery box, or mission so customers have a reason to engage and spend.",
      ctaLabel: "Create a reward",
      ctaRoute: "/app/rewards",
      order: 4,
      confidence: "high",
      done: data.activeRewardCount > 0,
    },
    {
      key: "add-storefront-widget",
      title: "Add the rewards widget to your storefront",
      description:
        "Embed the members widget in your theme so shoppers can actually see and use the program.",
      ctaLabel: "Set up widget",
      ctaRoute: "/app/settings",
      order: 5,
      // Low confidence: widgetIsActive is a lagging cached proxy with no
      // storefront heartbeat, so it can be wrong. Only claim done when the
      // cache says active AND the merchant hasn't dismissed the prompt; the UI
      // hedges this step rather than asserting a confident state.
      confidence: "low",
      done: data.widgetIsActive && !data.widgetSetupDismissed,
    },
    {
      key: "go-live-first-cashback",
      title: "Earn your first real cashback",
      description:
        "Confirm the loyalty loop works end-to-end by crediting cashback on a real order.",
      ctaLabel: "View dashboard",
      ctaRoute: "/app",
      order: 6,
      confidence: "high",
      done: data.cashbackEarnedCount > 0,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    allComplete: completedCount === steps.length,
  };
}
