import { PAID_SUBSCRIPTIONS_RETIRED_MESSAGE } from "~/constants/commercial-retirement";
/** Existing subscription records and capacity notices. New paid upsells are retired. */

import React from 'react';
import { useNavigate } from '@remix-run/react';
import {
  Banner,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Badge,
  Icon,
  ProgressBar,
  Modal,
} from '@shopify/polaris';
import {
  LockIcon,
  StarIcon,
  ChartVerticalIcon,
  CreditCardIcon,
  ArrowUpIcon,
} from '~/utils/polaris-icons';

// ============================================
// TYPES
// ============================================

export type UpgradePromptVariant = 'banner' | 'card' | 'inline' | 'compact';

export type PlanTier = 'free' | 'pro' | 'max' | 'ultra';

export interface UpgradePromptProps {
  /** Visual variant */
  variant?: UpgradePromptVariant;
  /** Feature or module name that requires upgrade */
  feature?: string;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Minimum plan required */
  requiredPlan?: PlanTier;
  /** Current user's plan */
  currentPlan?: string;
  /** Custom CTA text */
  ctaText?: string;
  /** Custom URL (defaults to /app/billing) */
  upgradeUrl?: string;
  /** Show dismiss button */
  dismissible?: boolean;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Banner tone for banner variant */
  tone?: 'info' | 'warning' | 'critical';
  /** Show plan comparison badge */
  showPlanBadge?: boolean;
}

export interface UsageUpgradePromptProps {
  /** Current usage count */
  current: number;
  /** Maximum limit */
  limit: number;
  /** Resource name (e.g., "orders", "customers", "tiers") */
  resource: string;
  /** Show when approaching limit (default: 80%) */
  warningThreshold?: number;
  /** Custom title */
  title?: string;
  /** Hide if under threshold */
  hideUnderThreshold?: boolean;
}

export interface SubscriptionCardProps {
  /** Current plan name */
  planName?: string;
  /** Plan status */
  status?: 'active' | 'trial' | 'cancelled' | 'past_due';
  /** Monthly price */
  price?: number;
  /** Billing interval */
  interval?: 'monthly' | 'annual';
  /** Current period end date */
  periodEnd?: string;
  /** Usage data */
  usage?: {
    current: number;
    limit: number;
    resource?: string;
  };
  /** Show manage button */
  showManageButton?: boolean;
  /** Compact mode */
  compact?: boolean;
}

// ============================================
// PLAN HELPERS
// ============================================

const PLAN_DETAILS: Record<PlanTier, { name: string; color: string; features: string[] }> = {
  free: {
    name: 'Free',
    color: '#6b7280',
    features: ['100 orders/month', '500 customers', 'Basic features'],
  },
  pro: {
    name: 'Pro',
    color: '#059669',
    features: ['500 orders/month', '2,000 customers', 'Advanced analytics', 'Batch operations'],
  },
  max: {
    name: 'Max',
    color: '#d97706',
    features: ['2,000 orders/month', 'Unlimited customers', 'Tier memberships', 'Priority support'],
  },
  ultra: {
    name: 'Ultra',
    color: '#7c3aed',
    features: ['Unlimited orders', 'All features', 'Dedicated support', 'Custom integrations'],
  },
};

function getPlanTier(planName?: string): PlanTier {
  if (!planName) return 'free';
  const lower = planName.toLowerCase();
  if (lower.includes('ultra')) return 'ultra';
  if (lower.includes('max')) return 'max';
  if (lower.includes('pro')) return 'pro';
  return 'free';
}

function getPlanBadgeTone(plan: PlanTier): 'info' | 'success' | 'attention' | 'warning' {
  switch (plan) {
    case 'free': return 'info';
    case 'pro': return 'success';
    case 'max': return 'attention';
    case 'ultra': return 'warning';
    default: return 'info';
  }
}

// ============================================
// UPGRADE PROMPT COMPONENT
// ============================================

export function UpgradePrompt(_props: UpgradePromptProps) {
  return null;
}

// ============================================
// USAGE UPGRADE PROMPT
// ============================================

export function UsageUpgradePrompt(_props: UsageUpgradePromptProps) {
  return null;
}

// ============================================
// SUBSCRIPTION CARD
// ============================================

export function SubscriptionCard({
  planName = 'Free',
  status = 'active',
  price = 0,
  interval = 'monthly',
  periodEnd,
  usage,
  showManageButton = true,
  compact = false,
}: SubscriptionCardProps) {
  const navigate = useNavigate();
  const planTier = getPlanTier(planName);
  const planDetails = PLAN_DETAILS[planTier];

  const statusBadge = {
    active: { tone: 'success' as const, label: 'Active' },
    trial: { tone: 'info' as const, label: 'Trial' },
    cancelled: { tone: 'warning' as const, label: 'Cancelled' },
    past_due: { tone: 'critical' as const, label: 'Past Due' },
  }[status];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (compact) {
    return (
      <Box
        padding="300"
        background="bg-surface-secondary"
        borderRadius="200"
      >
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: `${planDetails.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon source={CreditCardIcon} tone="base" />
            </div>
            <BlockStack gap="0">
              <Text variant="bodyMd" fontWeight="semibold" as="span">{planDetails.name}</Text>
              <Text variant="bodySm" tone="subdued" as="span">
                {price > 0 ? `$${price}/${interval === 'annual' ? 'year' : 'mo'}` : 'Free'}
              </Text>
            </BlockStack>
          </InlineStack>
          <InlineStack gap="200" blockAlign="center">
            <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>
            {showManageButton && (
              <Button size="slim" onClick={() => navigate('/app/billing')}>Manage</Button>
            )}
          </InlineStack>
        </InlineStack>
      </Box>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="start">
          <InlineStack gap="300" blockAlign="center">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${planDetails.color}20, ${planDetails.color}40)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon source={CreditCardIcon} tone="base" />
            </div>
            <BlockStack gap="050">
              <InlineStack gap="200" blockAlign="center">
                <Text variant="headingMd" as="h3">{planDetails.name}</Text>
                <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>
              </InlineStack>
              <Text variant="bodySm" tone="subdued" as="p">
                {price > 0
                  ? `$${price}/${interval === 'annual' ? 'year' : 'month'}`
                  : 'No charge'}
                {periodEnd && ` · Renews ${formatDate(periodEnd)}`}
              </Text>
            </BlockStack>
          </InlineStack>
        </InlineStack>

        {/* Usage */}
        {usage && (
          <>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" variant="bodySm" tone="subdued">
                    {usage.resource || 'Orders'} this period
                  </Text>
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    {usage.current.toLocaleString()} / {usage.limit === Infinity ? '∞' : usage.limit.toLocaleString()}
                  </Text>
                </InlineStack>
                {usage.limit !== Infinity && (
                  <ProgressBar
                    progress={Math.min((usage.current / usage.limit) * 100, 100)}
                    tone={usage.current >= usage.limit ? 'critical' : usage.current >= usage.limit * 0.8 ? 'highlight' : 'primary'}
                    size="small"
                  />
                )}
              </BlockStack>
            </Box>
          </>
        )}

        {/* Actions */}
        {showManageButton && (
          <InlineStack gap="200">
            <Button onClick={() => navigate('/app/billing')}>Manage Subscription</Button>
          </InlineStack>
        )}
      </BlockStack>
    </Card>
  );
}

// ============================================
// FEATURE LOCKED CARD
// ============================================

export interface FeatureLockedCardProps {
  /** Feature name */
  feature: string;
  /** Feature description */
  description: string;
  /** Icon to show */
  icon?: React.ComponentType<any>;
  /** Required plan */
  requiredPlan?: PlanTier;
  /** Bullet points of what's included */
  benefits?: string[];
}

export function FeatureLockedCard({ feature }: FeatureLockedCardProps) {
  return <Card><BlockStack gap="200">
    <Text variant="headingMd" as="h3">{feature}</Text>
    <Text as="p">This feature is unavailable under the existing agreement. {PAID_SUBSCRIPTIONS_RETIRED_MESSAGE}</Text>
  </BlockStack></Card>;
}

// ============================================
// LIMIT HINT - SUBTLE UPGRADE NUDGES
// ============================================

export type LimitHintVariant = 'inline' | 'badge' | 'tooltip' | 'contextual';

export interface LimitHintProps {
  /** Current usage count */
  current: number;
  /** Maximum limit for current plan */
  limit: number;
  /** Resource name (singular, e.g., "raffle", "campaign") */
  resource: string;
  /** What the next tier offers (optional, auto-calculated if not provided) */
  nextTierLimit?: number;
  /** Name of next tier (optional) */
  nextTierName?: string;
  /** Visual variant */
  variant?: LimitHintVariant;
  /** Show only when approaching limit (default: 60%) */
  showThreshold?: number;
  /** Always show regardless of threshold */
  alwaysShow?: boolean;
  /** Compact mode - smaller text */
  compact?: boolean;
}

/**
 * LimitHint - Explains existing capacity
 *
 * Shows usage context without being pushy. Designed to plant
 * the seed of "I could do more with a higher plan" without
 * interrupting the user's workflow.
 *
 * Variants:
 * - inline: Small progress bar with usage count
 * - badge: Compact badge showing "2/3"
 * - tooltip: Icon with hover tooltip
 * - contextual: Shows comparison with next tier
 */
export function LimitHint({ current, limit, resource, alwaysShow = false }: LimitHintProps) {
  if (!alwaysShow && current < limit) return null;
  return <Text as="span" variant="bodySm" tone="subdued">{current} / {limit} {resource} capacity</Text>;
}

// ============================================
// PAGE HEADER LIMIT STATUS
// ============================================

export interface PageLimitStatusProps {
  /** Current usage count */
  current: number;
  /** Maximum limit */
  limit: number;
  /** Resource name (singular) */
  resource: string;
  /** What action is limited (e.g., "create", "add") */
  action?: string;
  /** Next tier limit for comparison */
  nextTierLimit?: number;
  /** Next tier name */
  nextTierName?: string;
}

/**
 * PageLimitStatus - Shows limit status in page headers
 *
 * Designed to appear next to page titles or action buttons,
 * providing context about current usage without blocking actions.
 */
export function PageLimitStatus({ current, limit, resource }: PageLimitStatusProps) {
  if (current < limit) return null;
  return <Text as="span" variant="bodySm" tone="subdued">The existing {resource} capacity has been reached.</Text>;
}

// ============================================
// CREATE BUTTON WITH LIMIT AWARENESS
// ============================================

export interface LimitAwareButtonProps {
  /** Current usage count */
  current: number;
  /** Maximum limit */
  limit: number;
  /** Resource name (singular) */
  resource: string;
  /** Button click handler (only called if within limit) */
  onClick: () => void;
  /** Button text */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Next tier info for upgrade messaging */
  nextTierLimit?: number;
  nextTierName?: string;
}

/**
 * LimitAwareButton - Create button that handles limit state
 *
 * When within limit: Normal button
 * When at limit: Keeps the action disabled and explains existing capacity
 */
export function LimitAwareButton({ current, limit, resource, onClick, children, variant = 'primary' }: LimitAwareButtonProps) {
  const isAtLimit = current >= limit;
  return <InlineStack gap="200" blockAlign="center">
    <Button variant={variant} onClick={onClick} disabled={isAtLimit}>{children as string}</Button>
    {isAtLimit && <Text as="span" variant="bodySm">The existing {resource} capacity has been reached. New paid upgrades are retired.</Text>}
  </InlineStack>;
}

// ============================================
// LIMIT EXCEEDED MODAL
// ============================================

export interface LimitExceededModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Resource that was limited */
  resource: string;
  /** Current count */
  current: number;
  /** Maximum limit for current plan */
  limit: number;
  /** Current plan name */
  currentPlan?: string;
  /** Action that was attempted */
  action?: string;
  /** Custom title */
  title?: string;
}

// Existing capacity notices
// Prices from app/constants/billing.constants.ts
// Limits from PLAN_COMPARISON in same file


// Map resource names to incentive keys


/**
 * LimitExceededModal - Shows when user hits a rate limit during an action
 *
 * Explains the existing capacity limit.
 * New paid upgrades are retired.
 */
export function LimitExceededModal({ open, onClose, resource, current, limit, title }: LimitExceededModalProps) {
  return <Modal open={open} onClose={onClose} title={title || "Existing capacity reached"}
    primaryAction={{ content: "Close", onAction: onClose }}>
    <Modal.Section><BlockStack gap="200">
      <Text as="p">The existing {resource} capacity has been reached ({current}/{limit}).</Text>
      <Text as="p">{PAID_SUBSCRIPTIONS_RETIRED_MESSAGE}</Text>
    </BlockStack></Modal.Section>
  </Modal>;
}

// ============================================
// LIMIT EXCEEDED TOAST WITH UPGRADE LINK
// ============================================

export interface LimitExceededToastInfo {
  /** Resource that was limited */
  resource: string;
  /** Current count */
  current: number;
  /** Maximum limit */
  limit: number;
  /** Current plan */
  currentPlan: string;
}

/**
 * Helper to get toast content for limit exceeded errors
 */
export function getLimitExceededToastContent(info: LimitExceededToastInfo): {
  content: string;
  action?: { content: string; url: string };
} {
  return { content: `${info.resource} capacity reached (${info.current}/${info.limit}). New paid upgrades are retired.` };
}
