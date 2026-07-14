import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed", code: "METHOD_NOT_ALLOWED", detail: "Only POST is accepted" },
      { status: 405 }
    );
  }

  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    await prisma.shopSettings.update({
      where: { shop },
      data: { reviewBannerDismissed: true },
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error dismissing review banner:", error);
    return json(
      { error: "Failed to dismiss banner", code: "BANNER_DISMISS_FAILED", detail: "See server logs" },
      { status: 500 }
    );
  }
};
