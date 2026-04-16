# Dashboard Parity Checkpoint

Date: 2026-04-16

## Outcome

The dashboard and storefront are both UI-ready in fixture mode and can move into API planning with a shared operational contract baseline.

## Confirmed Alignment

- Products: dashboard supports the operational catalog fields the storefront currently relies on for discovery and PDP entry points: title, slug, category, audience, price, stock, variants, visibility, and primary media.
- Orders: dashboard supports the post-purchase fields the storefront currently implies through checkout and account history: items, totals, customer context, payment provider, shipping context, fulfillment note, and internal note.
- Content: dashboard covers the storefront-managed surfaces currently live in fixture mode: homepage hero, featured drop, stories/lookbooks, and navigation promos.
- Returns: dashboard internal statuses and decision flow align with the customer-facing account returns handoff, where customer drafts/submissions move into a staff review lifecycle.
- Customers: dashboard customer records align with current account expectations around identity, region, order links, and return links.
- Settings: dashboard now has grouped operational placeholders for store profile, payments, shipping, notifications, and staff roles before backend wiring.
- Overview: operational summary panels now reflect live stored order, product, and return state instead of only base fixture values.

## Remaining Contract Gaps

- Product detail narrative fields: storefront PDPs currently include campaign note, fit guidance, material story, sustainability note, delivery note, and lookbook moments. These are not yet represented in dashboard product contracts.
- Content depth: storefront hero and editorial surfaces currently include richer structures such as campaign stats, secondary CTA detail, story chapters, and hotspots. The dashboard content model remains intentionally lighter and operational.
- Customer profile depth: storefront account overview currently includes membership tier, preferred store, and saved address. The dashboard customer contract still focuses on operational identity plus order/return relationships.
- Settings consumption: settings values are now editable and persistent in dashboard fixture mode, but storefront fixtures do not yet consume those settings values directly.

## API Handoff Notes

- The current dashboard contracts are sufficient for API scoping around catalog ops, order ops, content ops, return ops, customer lookup, and operational settings placeholders.
- The remaining gaps above should be treated as explicit API-model decisions rather than accidental omissions.
