import { Banner } from "@shopify/polaris";
import type { ManagedPlan, UsageMetrics } from "~/constants/billing.constants";

interface PlanOverLimitBannerProps {
  planDetails: ManagedPlan;
  usageMetrics: UsageMetrics;
  onUpgrade: () => void;
}

export function PlanOverLimitBanner({
  planDetails,
  usageMetrics,
  onUpgrade
}: PlanOverLimitBannerProps) {
  if (!usageMetrics.isOverLimit) {
    return null;
  }

  return (
    <Banner
      tone="critical"
      title="Plan limit exceeded"
    >
      <p>
        You've processed {usageMetrics.currentUsage} orders this month,
        exceeding your {planDetails.displayName} plan limit of {usageMetrics.planLimit} orders.
        {planDetails.isFree
          ? " New paid upgrades are retired. Existing capacity limits still apply."
          : " Additional charges may apply for overage."}
      </p>
    </Banner>
  );
}