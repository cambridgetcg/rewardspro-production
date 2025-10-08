# Research Instructions: Shopify CLI and Tooling

## Objectives
- Understand the end-to-end workflow for generating, developing, and deploying customer account UI extensions using Shopify CLI.
- Identify required tooling (Node.js versions, package managers, testing frameworks) and how they integrate with the CLI.
- Clarify automation opportunities for CI/CD, environment management, and preview generation.

## Research Tasks
1. Map the Shopify CLI commands relevant to customer account UI extensions (e.g., `shopify extension create`, `shopify extension serve`, `shopify app deploy`).
2. Determine how to authenticate and switch between development stores, partner accounts, and production contexts.
3. Investigate local development requirements: tunneling, HTTPS, environment variables, and project scaffolding.
4. Explore how the CLI handles extension previews, versioning, and pushing updates to Shopify.
5. Evaluate supporting tools (e.g., npm/yarn scripts, linting, formatting, testing) and how they integrate into the workflow.
6. Identify common CLI issues or limitations reported by the community and document mitigation strategies.

## Deliverables
- Command reference sheet with usage notes and prerequisites.
- Flowchart illustrating the CLI-driven lifecycle from local development to deployment.
- Recommendations for scripts or automations to streamline developer onboarding and releases.
