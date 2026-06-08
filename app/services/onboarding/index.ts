/**
 * Onboarding — public surface.
 *
 * `getSetupChecklist(shop)` answers "what does this merchant still need to do
 * to get the loyalty program live?" with an honest, data-proven checklist.
 *
 * `computeChecklist(data)` is the pure decision logic, exported for testing
 * and for callers that already hold the underlying counts in memory.
 */
export { getSetupChecklist } from "./checklist";
export { computeChecklist, tiersConfigured } from "./compute";
export type {
  SetupStep,
  SetupStepKey,
  ChecklistData,
  SetupChecklist,
} from "./types";
