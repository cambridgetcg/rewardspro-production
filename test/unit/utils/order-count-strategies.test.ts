import { describe, it, expect } from "vitest";
import { isBillableOrderPayload } from "~/utils/order-count-strategies";

/**
 * Honest Billing — the billable-order predicate is the single gate that
 * decides whether an order counts toward a merchant's plan usage. Its most
 * important property is asymmetry: it may only ever remove the unambiguous
 * non-revenue case (test orders). It must NEVER drop a legitimate order, even
 * when payload fields are missing.
 */
describe("isBillableOrderPayload", () => {
  it("excludes test orders, with a reason", () => {
    expect(isBillableOrderPayload({ test: true })).toEqual({
      billable: false,
      reason: "test",
    });
  });

  it("counts a normal pending order (orders/create fires before payment)", () => {
    expect(
      isBillableOrderPayload({ test: false, cancelled_at: null }).billable,
    ).toBe(true);
  });

  it("treats a missing test field as billable — never silently drop revenue", () => {
    expect(isBillableOrderPayload({}).billable).toBe(true);
  });

  it("treats test:false as billable", () => {
    expect(isBillableOrderPayload({ test: false }).billable).toBe(true);
  });

  it("still counts a cancelled order at create time (handled via reconciliation, not a one-way create-time skip)", () => {
    expect(
      isBillableOrderPayload({ test: false, cancelled_at: "2026-06-06T00:00:00Z" })
        .billable,
    ).toBe(true);
  });

  it("excludes a test order even when it is also cancelled", () => {
    const result = isBillableOrderPayload({ test: true, cancelled_at: "2026-06-06" });
    expect(result.billable).toBe(false);
    expect(result.reason).toBe("test");
  });
});
