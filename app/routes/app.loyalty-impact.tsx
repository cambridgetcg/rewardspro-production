/**
 * Loyalty Impact — merchant-facing admin dashboard.
 *
 * Surfaces the `loyalty-impact` service module: answers the universal
 * "is this app paying for itself?" question with cohort comparison
 * (members vs non-members), honest program cost, and a deliberately
 * caveated impact estimate.
 *
 * Honesty principle (mirrored from the module): the `confidence` badge
 * is never "high", and the `caveat` is shown prominently — a merchant
 * should read it before quoting any number. We surface the limits of
 * observation, we do not hide them behind a big green figure.
 */
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, useNavigation } from "@remix-run/react";
import { useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Banner,
  Box,
  Divider,
  DataTable,
  Select,
  EmptyState,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { getShopSettings } from "../services/shop-data-provider.server";
import { getLoyaltyImpactReport } from "../services/loyalty-impact";
import type { CohortDefinitionType } from "../services/loyalty-impact";
import { formatCurrency } from "../utils/currency";

const WINDOW_DAYS = [7, 30, 90] as const;
const COHORT_TYPES: CohortDefinitionType[] = [
  "any-loyalty-event",
  "has-redeemed",
  "has-spent-points",
];
const COHORT_LABELS: Record<CohortDefinitionType, string> = {
  "any-loyalty-event": "Anyone the program has touched",
  "has-redeemed": "Has redeemed points or credit",
  "has-spent-points": "Spent points in this window",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const url = new URL(request.url);
  const daysParam = parseInt(url.searchParams.get("days") || "30", 10);
  const days = (WINDOW_DAYS as readonly number[]).includes(daysParam) ? daysParam : 30;

  const cohortParam = url.searchParams.get("cohort") as CohortDefinitionType | null;
  const cohortDefinition: CohortDefinitionType =
    cohortParam && COHORT_TYPES.includes(cohortParam) ? cohortParam : "any-loyalty-event";

  const windowFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Shop currency for money formatting — graceful fallback to USD.
  let currency = "USD";
  try {
    const settings = await getShopSettings(shop);
    const storeCurrency = (settings as { storeCurrency?: string } | null)?.storeCurrency;
    if (storeCurrency) currency = storeCurrency;
  } catch {
    // default USD
  }

  const report = await getLoyaltyImpactReport(shop, { windowFrom, cohortDefinition });

  return json({ report, currency, days, cohort: cohortDefinition });
};

export default function LoyaltyImpactPage() {
  const { report, currency, days, cohort } = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  const update = useCallback(
    (key: string, value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(key, value);
          return next;
        },
        { preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  const money = useCallback((n: number) => formatCurrency(n, currency), [currency]);
  const signedMoney = (n: number) => (n >= 0 ? `+${money(n)}` : money(n));
  const pct = (n: number) =>
    Number.isFinite(n) ? `${n >= 0 ? "+" : ""}${n.toFixed(1)}%` : "—";

  const { cohorts, revenue, programCost, estimatedImpact, cohortDefinition } = report;
  const { members, nonMembers } = revenue;

  const confidenceTone = estimatedImpact.confidence === "medium" ? "info" : "warning";
  const netPositive = estimatedImpact.netImpact >= 0;

  const windowControl = (
    <InlineStack gap="400" wrap={false} blockAlign="end">
      <Box minWidth="200px">
        <Select
          label="Time window"
          value={String(days)}
          disabled={isLoading}
          onChange={(v) => update("days", v)}
          options={WINDOW_DAYS.map((d) => ({ label: `Last ${d} days`, value: String(d) }))}
        />
      </Box>
      <Box minWidth="280px">
        <Select
          label="Who counts as a member?"
          value={cohort}
          disabled={isLoading}
          onChange={(v) => update("cohort", v)}
          options={COHORT_TYPES.map((t) => ({ label: COHORT_LABELS[t], value: t }))}
        />
      </Box>
    </InlineStack>
  );

  // No customers at all → nothing to compare. Show a friendly empty state
  // instead of a wall of zeroes.
  if (cohorts.totalCustomers === 0) {
    return (
      <Page title="Loyalty Impact" subtitle="Is your loyalty program paying for itself?">
        <Layout>
          <Layout.Section>
            <Card>{windowControl}</Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <EmptyState
                heading="No customer data yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Once customers start earning and spending points, this page
                  will compare members against non-members and show what your
                  program costs.
                </p>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const comparisonRows: [string, string, string][] = [
    ["Customers", String(members.customerCount), String(nonMembers.customerCount)],
    ["Revenue", money(members.totalRevenue), money(nonMembers.totalRevenue)],
    ["Orders", String(members.orderCount), String(nonMembers.orderCount)],
    ["Avg order value", money(members.aov), money(nonMembers.aov)],
    ["Revenue per customer", money(members.arpu), money(nonMembers.arpu)],
  ];

  const costRows: [string, string][] = [
    ["Points redeemed (valued)", money(programCost.pointsRedeemedValue)],
    ["Store credit redeemed", money(programCost.storeCreditRedeemed)],
    ["Gift cards issued", money(programCost.giftCardsIssued)],
  ];

  return (
    <Page title="Loyalty Impact" subtitle="Is your loyalty program paying for itself?">
      <Layout>
        {/* Controls */}
        <Layout.Section>
          <Card>{windowControl}</Card>
        </Layout.Section>

        {/* Headline answer — impact + honesty front-and-centre */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  Estimated net impact
                </Text>
                <Badge tone={confidenceTone}>
                  {`${estimatedImpact.confidence} confidence`}
                </Badge>
              </InlineStack>

              <Text as="p" variant="heading2xl" tone={netPositive ? "success" : "critical"}>
                {signedMoney(estimatedImpact.netImpact)}
              </Text>

              <Text as="p" tone="subdued">
                Naive AOV-lift revenue {money(estimatedImpact.aovLiftRevenue)} − direct
                program cost {money(programCost.totalDirectCost)}
              </Text>

              <Banner tone={confidenceTone} title="Read this before quoting the number">
                <Text as="p">{estimatedImpact.caveat}</Text>
              </Banner>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Cohort comparison */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Members vs non-members
              </Text>
              <DataTable
                columnContentTypes={["text", "numeric", "numeric"]}
                headings={["Metric", "Members", "Non-members"]}
                rows={comparisonRows}
              />
              <Divider />
              <InlineStack gap="200" blockAlign="center" wrap>
                <Text as="span" variant="headingSm">
                  Members spend {signedMoney(revenue.aovDelta)} per order
                </Text>
                <Badge tone={revenue.aovDelta >= 0 ? "success" : "critical"}>
                  {`${pct(revenue.aovLiftPercent)} AOV`}
                </Badge>
                <Text as="span" tone="subdued">
                  ({signedMoney(revenue.arpuDelta)} per customer)
                </Text>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Program cost */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                What the program cost you
              </Text>
              <DataTable
                columnContentTypes={["text", "numeric"]}
                headings={["Cost component", "Amount"]}
                rows={costRows}
                totals={["", money(programCost.totalDirectCost)]}
                showTotalsInFooter
              />
              <Text as="p" tone="subdued">
                Store credit issued this window (a future obligation, not yet
                spent): {money(programCost.storeCreditIssued)}. Raffle prizes
                delivered: {programCost.rafflePrizesAwarded}; mystery-box rewards:{" "}
                {programCost.mysteryBoxRewardsAwarded} — counts only, since prize
                value is shop-specific.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Methodology footer */}
        <Layout.Section>
          <Box paddingBlockStart="200" paddingInlineStart="200">
            <BlockStack gap="100">
              <Text as="p" tone="subdued" variant="bodySm">
                Member definition: {cohortDefinition.description}
              </Text>
              <Text as="p" tone="subdued" variant="bodySm">
                Window: {new Date(report.windowFrom).toLocaleDateString()} –{" "}
                {new Date(report.windowTo).toLocaleDateString()} · Generated{" "}
                {new Date(report.generatedAt).toLocaleString()}
              </Text>
              <Text as="p" tone="subdued" variant="bodySm">
                This report shows observed differences and direct costs. It does
                not prove the program caused the difference — engaged customers
                self-select into loyalty. For a defensible ROI claim, run an
                experiment with random assignment.
              </Text>
            </BlockStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
