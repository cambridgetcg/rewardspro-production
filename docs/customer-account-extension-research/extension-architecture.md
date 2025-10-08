# Research Instructions: Extension Architecture

## Objectives
- Define the architectural building blocks of Shopify Customer Account UI extensions.
- Understand the API surface, extension points, and data flows between the extension, Shopify, and our backend.
- Clarify hosting, bundling, and runtime execution constraints for the extension.

## Research Tasks
1. Review Shopify's documentation on customer account extension points and the APIs available within each point.
2. Diagram the extension's lifecycle: initialization, data fetching, state management, and teardown.
3. Investigate how extensions communicate with Shopify (GraphQL Admin APIs, Storefront APIs, customer account APIs) and what authentication is required.
4. Determine how to share code between multiple extensions or surfaces within the same app.
5. Identify limitations on assets, bundle size, internationalization, and dependencies.
6. Explore how the extension interacts with app proxies, metafields, or other Shopify data models to deliver content.

## Deliverables
- Architecture diagram capturing components, data flow, and integration touchpoints.
- Glossary of relevant Shopify concepts (extension points, APIs, objects) with documentation references.
- Risk assessment summarizing architectural unknowns and proposed experiments.
