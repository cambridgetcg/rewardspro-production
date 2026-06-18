import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as crypto from "node:crypto";
import prisma from "../db.server";
import { sendEmail } from "~/services/sendgrid.server";

/**
 * Webhook handler for APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT
 * Fired when a merchant's usage-based billing approaches the capped amount
 *
 * This webhook is critical for:
 * - Alerting merchants before they hit their usage cap
 * - Preventing service disruption
 * - Tracking usage patterns
 *
 * @security HMAC verification required before processing
 * @see https://shopify.dev/docs/api/admin-graphql/latest/enums/WebhookSubscriptionTopic
 */
export async function action({ request }: ActionFunctionArgs) {
  console.log("[APPROACHING_CAP] Webhook received");

  // 1. Get raw body for HMAC verification
  const rawBody = await request.text();

  // 2. VERIFY HMAC FIRST! (Critical security requirement)
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const shopDomain = request.headers.get("x-shopify-shop-domain");

  if (!hmacHeader || !shopDomain) {
    console.error("[APPROACHING_CAP] Missing required headers");
    return new Response("Unauthorized", { status: 401 });
  }

  // Verify HMAC using timing-safe comparison
  // Use dedicated webhook secret if configured, fall back to API secret
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_API_SECRET;
  if (!webhookSecret) {
    console.error("[APPROACHING_CAP] Neither SHOPIFY_WEBHOOK_SECRET nor SHOPIFY_API_SECRET configured");
    return new Response("Server configuration error", { status: 500 });
  }

  const hash = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody, "utf8")
    .digest("base64");

  try {
    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader))) {
      console.error("[APPROACHING_CAP] HMAC verification failed");
      return new Response("Unauthorized", { status: 401 });
    }
  } catch (error) {
    console.error("[APPROACHING_CAP] HMAC comparison error:", error);
    return new Response("Unauthorized", { status: 401 });
  }

  console.log(`[APPROACHING_CAP] HMAC verified for shop: ${shopDomain}`);

  // 3. Parse verified webhook body
  let webhookData: any;
  try {
    webhookData = JSON.parse(rawBody);
  } catch (error) {
    console.error("[APPROACHING_CAP] Failed to parse webhook body:", error);
    return new Response("Bad Request", { status: 400 });
  }

  // 4. Process usage cap alert
  try {
    const { app_subscription: subscription } = webhookData;

    if (!subscription) {
      console.warn("[APPROACHING_CAP] No subscription data in webhook");
      return json({ success: true, message: "No subscription data" });
    }

    // Extract usage details
    const cappedAmount = parseFloat(subscription.capped_amount?.amount || "0");
    const balanceUsed = parseFloat(subscription.balance_used || "0");
    const balanceRemaining = parseFloat(subscription.balance_remaining || "0");
    const usagePercentage = cappedAmount > 0 ? (balanceUsed / cappedAmount) * 100 : 0;

    console.log(`[APPROACHING_CAP] Usage alert for ${shopDomain}:`, {
      subscriptionId: subscription.admin_graphql_api_id,
      subscriptionName: subscription.name,
      cappedAmount,
      balanceUsed,
      balanceRemaining,
      usagePercentage: `${usagePercentage.toFixed(2)}%`,
      status: subscription.status,
      test: subscription.test,
    });

    // 5. Determine alert level based on usage percentage
    let alertLevel: string;
    if (usagePercentage >= 95) {
      alertLevel = "CRITICAL";
      console.error(`[APPROACHING_CAP] 🚨 CRITICAL: ${shopDomain} at ${usagePercentage.toFixed(2)}% of usage cap!`);
    } else if (usagePercentage >= 80) {
      alertLevel = "WARNING";
      console.warn(`[APPROACHING_CAP] ⚠️  WARNING: ${shopDomain} at ${usagePercentage.toFixed(2)}% of usage cap`);
    } else {
      alertLevel = "INFO";
      console.log(`[APPROACHING_CAP] ℹ️  INFO: ${shopDomain} at ${usagePercentage.toFixed(2)}% of usage cap`);
    }

    // 6. Log to UsageCapAlert table
    try {
      await prisma.usageCapAlert.create({
        data: {
          shop: shopDomain,
          subscriptionId: subscription.admin_graphql_api_id,
          subscriptionName: subscription.name,
          cappedAmount,
          balanceUsed,
          balanceRemaining,
          usagePercentage,
          alertLevel,
          notificationSent: false, // Will be set to true after sending notification
          metadata: {
            status: subscription.status,
            test: subscription.test,
            currentPeriodEnd: subscription.current_period_end,
            webhookReceivedAt: new Date().toISOString(),
          },
        },
      });

      console.log(`[APPROACHING_CAP] Created UsageCapAlert for ${shopDomain}`);
    } catch (dbError) {
      console.error("[APPROACHING_CAP] Failed to create UsageCapAlert:", dbError);
      // Continue processing even if DB write fails
    }

    // 7. Update ShopSettings with usage cap flag
    try {
      if (usagePercentage >= 100) {
        await prisma.shopSettings.update({
          where: { shop: shopDomain },
          data: {
            usageCapReached: true,
            usageCapReachedAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log(`[APPROACHING_CAP] Updated ShopSettings - cap reached for ${shopDomain}`);
      }
    } catch (dbError) {
      console.error("[APPROACHING_CAP] Failed to update ShopSettings:", dbError);
      // Continue processing
    }

    // 8. Create in-app notification
    try {
      const notificationMessage =
        usagePercentage >= 95
          ? `Your usage is at ${usagePercentage.toFixed(1)}% of your plan's cap ($${balanceRemaining.toFixed(2)} remaining). Please upgrade your plan to avoid service interruption.`
          : `Your usage is at ${usagePercentage.toFixed(1)}% of your plan's cap ($${balanceRemaining.toFixed(2)} remaining). Consider upgrading your plan soon.`;

      await prisma.notification.create({
        data: {
          shop: shopDomain,
          type: "USAGE_CAP_WARNING",
          title: usagePercentage >= 95 ? "🚨 Usage Cap Almost Reached" : "⚠️ Usage Cap Warning",
          message: notificationMessage,
          severity: usagePercentage >= 95 ? "ERROR" : "WARNING",
          read: false,
          metadata: {
            subscriptionId: subscription.admin_graphql_api_id,
            usagePercentage,
            cappedAmount,
            balanceRemaining,
          },
        },
      });

      console.log(`[APPROACHING_CAP] Created in-app notification for ${shopDomain}`);
    } catch (dbError) {
      console.error("[APPROACHING_CAP] Failed to create notification:", dbError);
      // Continue processing
    }

    // 9. Log to BillingHistory for audit trail
    try {
      await prisma.billingHistory.create({
        data: {
          shop: shopDomain,
          eventType: "APPROACHING_CAP",
          planName: subscription.name,
          status: subscription.status,
          amount: balanceUsed,
          metadata: {
            cappedAmount,
            balanceRemaining,
            usagePercentage,
            alertLevel,
          },
        },
      });

      console.log(`[APPROACHING_CAP] Logged to BillingHistory for ${shopDomain}`);
    } catch (dbError) {
      console.error("[APPROACHING_CAP] Failed to log to BillingHistory:", dbError);
      // Continue processing
    }

    // 10. Send email notification to merchant
    try {
      // Find the shop owner's email from the most recent session
      const ownerSession = await prisma.session.findFirst({
        where: { shop: shopDomain, accountOwner: true },
        orderBy: { expires: "desc" },
        select: { email: true, firstName: true, lastName: true },
      });

      if (ownerSession?.email) {
        const merchantName = ownerSession.firstName || "there";
        const isUrgent = usagePercentage >= 95;
        const subject = isUrgent
          ? `🚨 Your RewardsPro plan is almost at capacity (${usagePercentage.toFixed(0)}%)`
          : `⚠️ Your RewardsPro plan is approaching its cap (${usagePercentage.toFixed(0)}%)`;

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <h2 style="color: ${isUrgent ? "#d32f2f" : "#f57c00"};">${isUrgent ? "Urgent" : "Heads up"}, ${merchantName}</h2>
            <p>Your RewardsPro subscription (${subscription.name}) is at <strong>${usagePercentage.toFixed(1)}%</strong> of its monthly cap.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">Plan</td><td style="padding: 8px; border: 1px solid #ddd;">${subscription.name}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">Used</td><td style="padding: 8px; border: 1px solid #ddd;">$${balanceUsed.toFixed(2)}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">Cap</td><td style="padding: 8px; border: 1px solid #ddd;">$${cappedAmount.toFixed(2)}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;">Remaining</td><td style="padding: 8px; border: 1px solid #ddd; color: ${isUrgent ? "#d32f2f" : "#f57c00"}; font-weight: bold;">$${balanceRemaining.toFixed(2)}</td></tr>
            </table>
            ${isUrgent
              ? `<p style="color: #d32f2f; font-weight: bold;">You have less than 5% of your plan's capacity remaining. Some features may pause soon if the cap is reached.</p>`
              : `<p>You still have some room, but consider upgrading soon to avoid interruptions.</p>`
            }
            <p style="margin-top: 24px;">
              <a href="https://admin.shopify.com/apps/rewards-pro/app/billing" style="display: inline-block; background: #008060; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">View billing &amp; upgrade</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #999;">RewardsPro — loyalty rewards for Shopify. This is an automated message about your subscription usage.</p>
          </div>
        `;

        await sendEmail(shopDomain, {
          to: { email: ownerSession.email, name: merchantName },
          subject,
          html,
          text: `${isUrgent ? "URGENT" : "Notice"}: Your RewardsPro plan (${subscription.name}) is at ${usagePercentage.toFixed(1)}% of its cap. $${balanceRemaining.toFixed(2)} remaining. View billing at https://admin.shopify.com/apps/rewards-pro/app/billing`,
          categories: ["billing", "usage-warning", isUrgent ? "urgent" : "notice"],
          customArgs: { shop: shopDomain, event: "approaching_cap" },
        });

        console.log(`[APPROACHING_CAP] Email sent to merchant for ${shopDomain}`);
      } else {
        console.log(`[APPROACHING_CAP] No owner email found for ${shopDomain} — in-app notification only`);
      }
    } catch (emailError) {
      console.error(`[APPROACHING_CAP] Failed to send merchant email for ${shopDomain}:`, emailError);
      // Don't fail the webhook — the in-app notification already landed
    }

    if (usagePercentage >= 95) {
      console.warn(
        `[APPROACHING_CAP] 🚨 URGENT: Shop ${shopDomain} needs immediate attention! ` +
        `Only $${balanceRemaining.toFixed(2)} remaining of $${cappedAmount.toFixed(2)} cap.`
      );
      // Email already sent above with isUrgent styling; this is the additional log line.
      // TODO: Consider auto-pausing usage-based features
    }

    // 11. Return success to Shopify
    console.log(`[APPROACHING_CAP] Successfully processed for ${shopDomain}`);
    return json({
      success: true,
      shop: shopDomain,
      subscriptionId: subscription.admin_graphql_api_id,
      usagePercentage,
      alertLevel,
    });

  } catch (error) {
    console.error("[APPROACHING_CAP] Processing error:", error);
    // Still return 200 to acknowledge receipt
    // Shopify will retry if we return an error status
    return json({
      success: false,
      error: "Processing failed but acknowledged",
    });
  }
}
