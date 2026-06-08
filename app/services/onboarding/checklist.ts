/**
 * Onboarding checklist — reads facade.
 *
 * `getSetupChecklist(shop)` performs the parallel, read-only Prisma reads the
 * checklist needs and hands them to the pure `computeChecklist`. Safe to call
 * from any admin loader.
 *
 * Aurora Data API note: single-row lookups use `findFirst({ where: { shop } })`
 * rather than `findUnique` — the codebase avoids `findUnique` on these tables
 * because of composite-key issues with the RDS Data API adapter.
 */
import prisma from "~/db.server";
import { computeChecklist } from "./compute";
import type { SetupChecklist } from "./types";

export async function getSetupChecklist(shop: string): Promise<SetupChecklist> {
  const [
    shopSettings,
    tiers,
    pointsConfig,
    raffleActive,
    mysteryBoxActive,
    challengeActive,
    cashbackOrderCount,
    cashbackLedgerCount,
  ] = await Promise.all([
    prisma.shopSettings.findFirst({
      where: { shop },
      select: {
        currencySelected: true,
        widgetIsActive: true,
        widgetSetupDismissed: true,
      },
    }),
    prisma.tier.findMany({
      where: { shop },
      orderBy: { minSpend: "asc" },
      select: {
        name: true,
        minSpend: true,
        cashbackPercent: true,
        evaluationPeriod: true,
      },
    }),
    prisma.pointsConfig.findFirst({
      where: { shop },
      select: { isEnabled: true },
    }),
    prisma.raffle.count({ where: { shop, status: { in: ["ACTIVE", "SCHEDULED"] } } }),
    prisma.mysteryBox.count({ where: { shop, status: { in: ["ACTIVE", "SCHEDULED"] } } }),
    prisma.challenge.count({ where: { shop, status: { in: ["ACTIVE", "SCHEDULED"] } } }),
    prisma.order.count({ where: { shop, cashbackProcessed: true } }),
    prisma.storeCreditLedger.count({
      where: { shop, type: "CASHBACK_EARNED", orderId: { not: null } },
    }),
  ]);

  return computeChecklist({
    currencySelected: shopSettings?.currencySelected ?? false,
    tiers: (tiers ?? []).map((t) => ({
      name: t.name,
      minSpend: Number(t.minSpend),
      cashbackPercent: Number(t.cashbackPercent),
      evaluationPeriod: String(t.evaluationPeriod),
    })),
    pointsEnabled: pointsConfig?.isEnabled ?? false,
    activeRewardCount: raffleActive + mysteryBoxActive + challengeActive,
    widgetIsActive: shopSettings?.widgetIsActive ?? false,
    widgetSetupDismissed: shopSettings?.widgetSetupDismissed ?? false,
    cashbackEarnedCount: cashbackOrderCount + cashbackLedgerCount,
  });
}
