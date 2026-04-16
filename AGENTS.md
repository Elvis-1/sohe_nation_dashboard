# Sohe's Nation Dashboard Engineering Spec

You are building the Sohe's Nation back-office dashboard.

The dashboard is a staff-only operational surface for managing products, orders, content, returns, customers, and settings. It comes after the storefront UI phase and before live API integration.

## Scope Guardrails

- `dashboard/` is for staff and admin workflows only.
- Customer-facing shopping, editorial, checkout, and account flows belong in `web/storefront`.
- Shared services and live integrations belong in `api/`.
- Keep the dashboard fixture-first until the API phase begins.

## Current Project Status (2026-04-16)

- `web/storefront` is the most mature app in the repo and is already live in fixture mode.
- The dashboard is the next major product surface to build.
- Delivery order remains: `web` first, `dashboard` second, `api` third.
- The dashboard roadmap and phased build order live in [PLAN.md](/Users/mac/Documents/AI%20AGENTS/SOHE_NATION/dashboard/PLAN.md).

## Required Dashboard Modules

Build around these MVP features:

- `auth`
- `overview`
- `products`
- `orders`
- `content`
- `returns`
- `customers`
- `settings`

## Delivery Workflow

1. Follow the phased order in `dashboard/PLAN.md`.
2. Keep module boundaries clear and simple.
3. Use mocked repositories and local fixtures until API work begins.
4. Build the dashboard to support the already-defined storefront feature set.

## Architecture

Use the same high-level architectural discipline as the storefront:

- feature-based structure
- thin route files
- shared contracts through `core/`
- no business logic inside page components
- no silent coupling between unrelated modules

Phase 0 foundation decisions now in force:

- the dashboard owns its own route space inside the `dashboard/` Next.js app
- top-level module routes are `/`, `/products`, `/orders`, `/content`, `/returns`, `/customers`, and `/settings`
- shared dashboard fixture contracts live in `src/core/types/dashboard.ts`
- feature modules should read fixture data through `data/repositories/` boundaries, not by coupling page shells directly to raw mock files
- dashboard tokens live in `src/app/globals.css` and should stay aligned with storefront brand direction without reusing the storefront shell aesthetic verbatim

Suggested structure:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── core/
│   ├── api/
│   ├── types/
│   ├── ui/
│   ├── utils/
│   └── validation/
├── features/
│   └── feature-name/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── middleware.ts
```

## Feature Rules

- `auth` handles staff entry only, not customer account behavior.
- `overview` is a decision surface, not a reporting warehouse.
- `products` must support the storefront catalog and PDP shape.
- `orders` must support checkout, fulfillment, and order-history needs.
- `content` must support homepage and story/editorial management.
- `returns` must support the customer account returns flow.
- `customers` should focus on profile, order context, and return context.
- `settings` should stay simple and placeholder-friendly until live integration.

Current Phase 1 auth foundation:

- mocked staff access is the approved MVP auth mode
- demo credentials should be sourced from `src/features/auth/data/mock-staff-auth-repository.ts`
- protected dashboard routes should stay behind `dashboard-access-gate`
- auth-facing routes should redirect authenticated staff back into the dashboard instead of duplicating the sign-in surface

Current Phase 1.5 shell foundation:

- the protected dashboard shell is the shared chrome for all staff routes inside `(dashboard)`
- sidebar navigation, topbar context, and global sign-out live in `src/core/ui/dashboard-shell.tsx`
- dashboard module scaffolds should expose loading, error, and empty states through shared UI patterns before deeper workflows are added
- responsive shell behavior must stay stable across desktop and tablet breakpoints and retain automated coverage as the dashboard expands

Current Phase 2 overview foundation:

- the overview is the dashboard landing surface and should remain the fastest operational entry point for staff
- overview data should be composed through `src/features/overview/data/repositories/mock-overview-repository.ts`
- the overview must summarize products, orders, returns, and content in one screen and hand staff into deeper modules without dead ends
- overview state should retain automated coverage for KPI visibility, summary blocks, handoff links, and empty-state behavior

Current Phase 3 products foundation:

- the products module now owns the first complete operator workflow in the dashboard
- list, filter/search, create, edit, and draft/publish behavior should stay inside the products feature boundary
- fixture-backed product changes should flow through `src/features/products/data/repositories/mock-product-repository.ts`
- product editor fields must stay aligned to storefront catalog and PDP assumptions: title, slug, category, audience, price, stock, variants, visibility, and media
- product workflow coverage should continue to protect list rendering, filtering, creation, editing, and status transitions

Current Phase 4 orders foundation:

- the orders module now owns the post-purchase list/detail workflow in the dashboard
- list filtering, detail review, fulfillment updates, and internal notes should stay inside the orders feature boundary
- fixture-backed order changes should flow through `src/features/orders/data/repositories/mock-order-repository.ts`
- order records must stay aligned to storefront checkout and account-history assumptions: items, totals, customer details, shipping details, payment provider, fulfillment note, and internal note
- orders can hand staff into a lightweight customer drill-in at `/customers/[id]` until the full customers phase lands
- order workflow coverage should continue to protect list rendering, filtering, detail review, status updates, note persistence, and customer handoff

Current Phase 5 content foundation:

- the content module now owns the campaign and editorial management workflow in the dashboard
- content-area selection, homepage editing, stories editing, linked products, media references, preview structure, and draft/ready behavior should stay inside the content feature boundary
- fixture-backed content changes should flow through `src/features/content/data/repositories/mock-content-repository.ts`
- content records must stay aligned to the live storefront homepage, stories/lookbooks, featured drop, and navigation-promos surfaces already present in fixture mode
- content workflow coverage should continue to protect hub navigation, editor behavior, linked-product editing, and draft/ready transitions

Current Phase 6 returns foundation:

- the returns module now owns the internal return-processing workflow in the dashboard
- queue filtering, return detail review, lifecycle updates, and internal decision capture should stay inside the returns feature boundary
- fixture-backed return changes should flow through `src/features/returns/data/repositories/mock-return-repository.ts`
- return records must stay aligned to the live storefront account returns flow already present in fixture mode: customer context, order context, item summary, request reason, and staff decision handling
- returns workflow coverage should continue to protect queue rendering, filtering, detail review, lifecycle transitions, persistence, and customer handoff

Current Phase 7 customers foundation:

- the customers module now owns the customer lookup and record-review workflow in the dashboard
- customer search, profile review, linked order history, and linked return history should stay inside the customers feature boundary
- customer-linked order and return handoff should resolve against the current fixture-backed dashboard records where those records exist
- customer records must stay aligned to the live storefront account, checkout, and returns context already present in fixture mode
- customers workflow coverage should continue to protect list rendering, lookup behavior, detail review, and linked order/return handoff

Current Phase 8 settings foundation:

- the settings module now owns the grouped operational-defaults workflow in the dashboard
- grouped settings review, placeholder editing, and save behavior should stay inside the settings feature boundary
- fixture-backed settings changes should flow through `src/features/settings/data/repositories/mock-setting-repository.ts`
- settings records must stay aligned to the operational defaults the storefront and dashboard will eventually consume during API wiring
- settings workflow coverage should continue to protect grouped rendering, editable placeholder behavior, save flow, and persistence

Current Phase 8.5 parity foundation:

- the dashboard/storefront parity checkpoint is now a required handoff step before API implementation begins
- parity review findings and remaining gaps should be logged in `dashboard/PARITY_CHECKPOINT.md`
- cross-surface parity checks that are feasible in fixture mode should remain protected by automated verification
- API work should treat the documented parity gaps as explicit design items rather than silent assumptions

## Rendering Rules

- Use Next.js App Router.
- Prefer Server Components by default.
- Use Client Components only where interaction requires them.
- Keep server/client boundaries explicit.
- Keep route files thin and move logic into feature modules.

## UX Rules

- Prioritize clarity and speed of use over decorative complexity.
- Optimize for list-detail workflows, filters, status changes, and quick actions.
- Keep the interface simple, operational, and trustworthy.
- Do not make the dashboard feel like the storefront; it should feel more utilitarian while still respecting brand polish.

## Data Rules

- Model dashboard fixtures around the storefront features already implemented.
- Prepare for later Django/API wiring, but do not build live integration yet.
- Keep product, order, return, content, and customer shapes compatible with the storefront plan.

## Definition of Ready

Before building a module:

- its operator flow is documented in `dashboard/PLAN.md`
- the route shape is clear
- the mocked data shape is defined
- its dependency on storefront behavior is understood

## Definition of Done

A dashboard module is done when:

- the main list/detail or edit flow works in fixture mode
- loading, empty, and error states exist
- the module supports the related storefront behavior it is meant to manage
- the implementation matches the current dashboard phase plan

## Current Priority

Use `dashboard/PLAN.md` as the source of truth for what to build next.

The immediate sequence is:

1. dashboard foundations
2. auth
3. shell
4. overview
5. products
6. orders
7. content
8. returns
9. customers
10. settings
11. dashboard parity checkpoint before API work
