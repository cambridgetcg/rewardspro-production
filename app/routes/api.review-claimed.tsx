import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PAID_SUBSCRIPTIONS_RETIRED_STATUS, paidSubscriptionsRetiredResult } from "~/constants/commercial-retirement";

/** Review rewards formerly opened a new paid subscription after a trial. */
export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  await authenticate.admin(request);
  // Refuse before provider requests, trial claims, or entitlement writes.
  return json(paidSubscriptionsRetiredResult(), { status: PAID_SUBSCRIPTIONS_RETIRED_STATUS });
};
