/**
 * Getting-Started checklist card for the merchant dashboard.
 *
 * Renders the honest onboarding checklist produced by
 * `app/services/onboarding`. Disappears entirely once every step is done, so
 * it only ever shows up for merchants who still have setup to do. The
 * low-confidence widget step is hedged ("we can't always verify this") rather
 * than presented as a confident state.
 */
import {
  Badge,
  BlockStack,
  Button,
  Card,
  Divider,
  InlineStack,
  ProgressBar,
  Text,
} from "@shopify/polaris";
import type { SetupChecklist as SetupChecklistData } from "~/services/onboarding";

export function SetupChecklist({ checklist }: { checklist: SetupChecklistData }) {
  // Fully set up — nothing to nag about.
  if (checklist.allComplete) return null;

  const pct = Math.round((checklist.completedCount / checklist.totalCount) * 100);

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h2" variant="headingMd">
              Get your loyalty program live
            </Text>
            <Text as="span" variant="bodySm" tone="subdued">
              {`${checklist.completedCount} of ${checklist.totalCount} done`}
            </Text>
          </InlineStack>
          <ProgressBar progress={pct} size="small" />
        </BlockStack>

        <Divider />

        <BlockStack gap="300">
          {checklist.steps.map((s) => (
            <InlineStack
              key={s.key}
              align="space-between"
              blockAlign="center"
              gap="400"
              wrap={false}
            >
              <InlineStack gap="300" blockAlign="center" wrap={false}>
                <Badge tone={s.done ? "success" : undefined}>
                  {s.done ? "Done" : "To do"}
                </Badge>
                <BlockStack gap="050">
                  <InlineStack gap="150" blockAlign="center" wrap>
                    <Text
                      as="span"
                      variant="bodyMd"
                      fontWeight={s.done ? "regular" : "semibold"}
                    >
                      {s.title}
                    </Text>
                    {s.confidence === "low" && !s.done && (
                      <Text as="span" variant="bodySm" tone="subdued">
                        {"(we can't always verify this)"}
                      </Text>
                    )}
                  </InlineStack>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {s.description}
                  </Text>
                </BlockStack>
              </InlineStack>
              {!s.done && (
                <Button url={s.ctaRoute} size="slim">
                  {s.ctaLabel}
                </Button>
              )}
            </InlineStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
