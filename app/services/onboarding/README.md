# Onboarding

The Getting-Started checklist that turns a freshly-installed RewardsPro into a
live loyalty program — and the answer to the #1 friction point merchants hit
with loyalty apps: *"I added the app, now what?"*

## The merchant problem

Most merchants install a loyalty app, drop a points widget on the storefront,
and then watch participation flatline — because a widget is not a program. A
working program needs a few foundational pieces set up **in order**: a cashback
currency, membership tiers, points earning, at least one reward, the storefront
widget, and finally a real order that proves the loop fires.

Competing apps either skip this guidance entirely or bury it. This service
surfaces the exact next step, every step proven from real data.

## What it returns

```ts
const checklist = await getSetupChecklist(shop);

// checklist.completedCount / totalCount → "3 of 6 done"
// checklist.allComplete → boolean
// checklist.steps → ordered SetupStep[]:
//   { key, title, description, ctaLabel, ctaRoute, order, done, confidence }
```

## Completion rules (the honesty principle)

A step is `done` **only when real data proves it**. A checklist that lies about
progress is worse than none — it poisons trust in every other number we show.

| Step | `done` when | Confidence |
|---|---|---|
| `configure-store-currency` | `ShopSettings.currencySelected === true` | high |
| `configure-tiers` | a tier exists that deviates from the default `Bronze Member / 0 / 1% / LIFETIME` (or >1 tier) | medium |
| `enable-points-earning` | `PointsConfig.isEnabled === true` | high |
| `create-first-reward` | ≥1 raffle / mystery box / challenge in `ACTIVE` or `SCHEDULED` | high |
| `add-storefront-widget` | `widgetIsActive === true && !widgetSetupDismissed` | **low** |
| `go-live-first-cashback` | ≥1 processed-cashback order **or** cashback ledger entry tied to an order | high |

### The widget caveat

`add-storefront-widget` is the one **low-confidence** step. `widgetIsActive` is
a 5-minute-TTL cache of a theme-detection check with no storefront heartbeat,
so it can lag reality. The rule is deliberately conservative (it will sooner
show *not done* than a false *done*), and the UI should hedge this step rather
than present it as a confident tick. We would rather under-claim progress than
tell a merchant they're set up when they aren't.

## Architecture

```
   checklist.ts        ←── parallel Prisma reads (ShopSettings, Tier,
       │                   PointsConfig, Raffle/MysteryBox/Challenge counts,
       │                   Order + StoreCreditLedger cashback counts)
       ▼
   compute.ts          ←── Pure: reduces the reads to done/not-done per step.
       │                   No I/O — the testable seam.
       ▼
   types.ts            ←── SetupStep, ChecklistData, SetupChecklist
```

`compute.ts` is exercised by `test/unit/services/onboarding-checklist.test.ts`
with hand-crafted inputs and no database.

## What this does NOT do

- **Does NOT write anything.** Read-only; it reports state, it doesn't change it.
- **Does NOT guarantee widget accuracy.** See the widget caveat — that signal is
  a proxy, surfaced honestly as low-confidence.
- **Does NOT gate features.** It's guidance, not enforcement. A merchant can use
  any feature whether or not the checklist is complete.
