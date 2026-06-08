import { describe, it, expect } from "vitest";
import { computeChecklist, tiersConfigured } from "~/services/onboarding/compute";
import type { ChecklistData } from "~/services/onboarding/types";

/**
 * The onboarding checklist must NEVER claim a step is done unless the data
 * proves it. These tests pin every completion rule and the conservative
 * widget behaviour against synthetic inputs (no database).
 */

const DEFAULT_TIER = {
  name: "Bronze Member",
  minSpend: 0,
  cashbackPercent: 1,
  evaluationPeriod: "LIFETIME",
};

function data(overrides: Partial<ChecklistData> = {}): ChecklistData {
  return {
    currencySelected: false,
    tiers: [],
    pointsEnabled: false,
    activeRewardCount: 0,
    widgetIsActive: false,
    widgetSetupDismissed: false,
    cashbackEarnedCount: 0,
    ...overrides,
  };
}

function step(result: ReturnType<typeof computeChecklist>, key: string) {
  const s = result.steps.find((x) => x.key === key);
  if (!s) throw new Error(`step ${key} missing`);
  return s;
}

describe("computeChecklist", () => {
  it("a brand-new shop has every step not-done", () => {
    const result = computeChecklist(data());
    expect(result.totalCount).toBe(6);
    expect(result.completedCount).toBe(0);
    expect(result.allComplete).toBe(false);
    expect(result.steps.every((s) => !s.done)).toBe(true);
  });

  it("orders steps from foundational config to going-live", () => {
    const orders = computeChecklist(data()).steps.map((s) => s.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("currency step flips on currencySelected", () => {
    expect(step(computeChecklist(data({ currencySelected: true })), "configure-store-currency").done).toBe(true);
  });

  it("points step flips on pointsEnabled", () => {
    expect(step(computeChecklist(data({ pointsEnabled: true })), "enable-points-earning").done).toBe(true);
  });

  it("reward step needs an active/scheduled reward", () => {
    expect(step(computeChecklist(data({ activeRewardCount: 0 })), "create-first-reward").done).toBe(false);
    expect(step(computeChecklist(data({ activeRewardCount: 1 })), "create-first-reward").done).toBe(true);
  });

  it("go-live step needs real cashback activity", () => {
    expect(step(computeChecklist(data({ cashbackEarnedCount: 0 })), "go-live-first-cashback").done).toBe(false);
    expect(step(computeChecklist(data({ cashbackEarnedCount: 1 })), "go-live-first-cashback").done).toBe(true);
  });

  describe("widget step is conservative (low confidence)", () => {
    it("is low-confidence", () => {
      expect(step(computeChecklist(data()), "add-storefront-widget").confidence).toBe("low");
    });
    it("done only when active AND not dismissed", () => {
      expect(step(computeChecklist(data({ widgetIsActive: true, widgetSetupDismissed: false })), "add-storefront-widget").done).toBe(true);
      expect(step(computeChecklist(data({ widgetIsActive: true, widgetSetupDismissed: true })), "add-storefront-widget").done).toBe(false);
      expect(step(computeChecklist(data({ widgetIsActive: false, widgetSetupDismissed: false })), "add-storefront-widget").done).toBe(false);
    });
  });

  describe("tiersConfigured", () => {
    it("zero tiers → not configured", () => {
      expect(tiersConfigured([])).toBe(false);
    });
    it("exactly the default Bronze tier → not configured", () => {
      expect(tiersConfigured([{ ...DEFAULT_TIER }])).toBe(false);
    });
    it("a single tier deviating from default → configured", () => {
      expect(tiersConfigured([{ ...DEFAULT_TIER, cashbackPercent: 3 }])).toBe(true);
      expect(tiersConfigured([{ ...DEFAULT_TIER, name: "VIP" }])).toBe(true);
      expect(tiersConfigured([{ ...DEFAULT_TIER, minSpend: 100 }])).toBe(true);
      expect(tiersConfigured([{ ...DEFAULT_TIER, evaluationPeriod: "ANNUAL" }])).toBe(true);
    });
    it("more than one tier → configured", () => {
      expect(tiersConfigured([{ ...DEFAULT_TIER }, { ...DEFAULT_TIER, name: "Silver", minSpend: 100 }])).toBe(true);
    });
  });

  it("counts completed steps and reports allComplete only when every step is done", () => {
    const allDone = computeChecklist(
      data({
        currencySelected: true,
        tiers: [{ ...DEFAULT_TIER, name: "Gold", minSpend: 500, cashbackPercent: 5 }],
        pointsEnabled: true,
        activeRewardCount: 2,
        widgetIsActive: true,
        widgetSetupDismissed: false,
        cashbackEarnedCount: 4,
      }),
    );
    expect(allDone.completedCount).toBe(6);
    expect(allDone.allComplete).toBe(true);
  });
});
