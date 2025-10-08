# Research Instructions: Data and Integrations

## Objectives
- Clarify which data sources power the customer account UI extension and how data flows between systems.
- Identify Shopify objects, metafields, and external services that must be queried or updated.
- Determine synchronization patterns, caching strategies, and latency considerations.

## Research Tasks
1. Catalog the customer data required for the extension (e.g., loyalty tiers, recent purchases, points balances) and map it to Shopify or external sources.
2. Investigate available APIs (Admin, Storefront, Customer Account, or custom) to retrieve and mutate needed data.
3. Determine how to securely expose backend endpoints to the extension (app proxies, authenticated fetch, custom APIs).
4. Research approaches for real-time updates versus scheduled syncs, including webhook usage.
5. Examine data storage options within Shopify (metafields, customer tags) versus external databases and when to use each.
6. Identify data privacy requirements (GDPR, CCPA) and how they influence data retention and consent.

## Deliverables
- Data flow diagram connecting Shopify, backend services, and the extension.
- API access matrix listing endpoints, authentication methods, and rate limits.
- Summary of data governance considerations and unresolved questions.
