# Sohe's Nation Dashboard Engineering Spec

You are building the Sohe's Nation back-office dashboard.

The dashboard is a staff-only operational surface for managing products, orders, content, returns, customers, settings, staff, and notifications. It is wired to the live API in `api/`.

## Scope Guardrails

- `dashboard/` is for staff and admin workflows only.
- Customer-facing shopping, editorial, checkout, and account flows belong in `web/storefront`.
- Shared services and live integrations belong in `api/`.
- Read and write data through the API only. There are no mock repositories or fixtures; do not reintroduce them.

## Current Project Status (2026-09-29)

- The fixture phase is finished (2026-04-16). Every module now reads through an API-backed repository, and the mock repositories and `mock-*.ts` fixtures were deleted (2026-09-29).
- Slice status and API contracts live in [api/PLAN.md](/Users/mac/Documents/AI%20AGENTS/SOHE_NATION/api/PLAN.md) §10. [PLAN.md](/Users/mac/Documents/AI%20AGENTS/SOHE_NATION/dashboard/PLAN.md) is the historical fixture-phase plan.
- The phase notes below describe each module's scope; file paths in them point to the current API-backed code.

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

1. Follow the slice workflow in `api/PLAN.md`.
2. Keep module boundaries clear and simple.
3. Each feature reads the API through `data/api/*-api-client.ts` and `data/repositories/*-repository.ts`; shared HTTP and paging live in `src/core/api/`.
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
- shared dashboard contracts live in `src/core/types/dashboard.ts`
- feature modules read data through `data/repositories/` boundaries, not by calling the API from page shells
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
- `settings` should stay simple; groups other than `store_profile` are still operational placeholders.

Current Phase 1 auth foundation:

- staff sign in against the backend staff auth API (`/auth/staff/login/`); bearer-token session state lives in `src/features/auth/presentation/state/dashboard-auth-provider.tsx`
- there are no demo credentials in code; local dev uses the seeded owner account (see `api/CLAUDE.md`)
- protected dashboard routes should stay behind `dashboard-access-gate`
- auth-facing routes should redirect authenticated staff back into the dashboard instead of duplicating the sign-in surface

Current Phase 1.5 shell foundation:

- the protected dashboard shell is the shared chrome for all staff routes inside `(dashboard)`
- sidebar navigation, topbar context, and global sign-out live in `src/core/ui/dashboard-shell.tsx`
- dashboard module scaffolds should expose loading, error, and empty states through shared UI patterns before deeper workflows are added
- responsive shell behavior must stay stable across desktop and tablet breakpoints and retain automated coverage as the dashboard expands

Current Phase 2 overview foundation:

- the overview is the dashboard landing surface and should remain the fastest operational entry point for staff
- overview KPIs are computed in `src/features/overview/presentation/components/overview-page-shell.tsx` from the complete product, order, return, and content repositories; desks that are loading or failed are flagged (with Retry) instead of showing zeros
- the overview must summarize products, orders, returns, and content in one screen and hand staff into deeper modules without dead ends
- overview state should retain automated coverage for KPI visibility, summary blocks, handoff links, and empty-state behavior

Current Phase 3 products foundation:

- the products module now owns the first complete operator workflow in the dashboard
- list, filter/search, create, edit, and draft/publish behavior should stay inside the products feature boundary
- product reads and writes flow through `src/features/products/data/repositories/product-repository.ts`
- product editor fields must stay aligned to storefront catalog and PDP assumptions: title, slug, category, audience, price, stock, variants, visibility, and media
- product workflow coverage should continue to protect list rendering, filtering, creation, editing, and status transitions

Current Phase 4 orders foundation:

- the orders module now owns the post-purchase list/detail workflow in the dashboard
- list filtering, detail review, fulfillment updates, and internal notes should stay inside the orders feature boundary
- order reads and writes flow through `src/features/orders/data/repositories/order-repository.ts`
- order records must stay aligned to storefront checkout and account-history assumptions: items, totals, customer details, shipping details, payment provider, fulfillment note, and internal note
- orders hand staff into the customer record at `/customers/[id]`
- order workflow coverage should continue to protect list rendering, filtering, detail review, status updates, note persistence, and customer handoff

Current Phase 5 content foundation:

- the content module now owns the campaign and editorial management workflow in the dashboard
- dashboard editing is limited to homepage hero media (Cloudinary upload or URL) and featured-drop product links; stories and navigation promos are backend-owned and not editable here (see `api/AGENTS.md` Content)
- content reads and writes flow through `src/features/content/data/repositories/content-repository.ts`
- content records must stay aligned to the storefront homepage, stories/lookbooks, featured drop, and navigation-promos surfaces
- content workflow coverage should continue to protect hub navigation, editor behavior, linked-product editing, and draft/ready transitions

Current Phase 6 returns foundation:

- the returns module now owns the internal return-processing workflow in the dashboard
- queue filtering, return detail review, lifecycle updates, and internal decision capture should stay inside the returns feature boundary
- return reads and writes flow through `src/features/returns/data/repositories/return-repository.ts`
- return records must stay aligned to the storefront account returns flow: customer context, order context, item summary, request reason, and staff decision handling
- returns workflow coverage should continue to protect queue rendering, filtering, detail review, lifecycle transitions, persistence, and customer handoff

Current Phase 7 customers foundation:

- the customers module now owns the customer lookup and record-review workflow in the dashboard
- customer search, profile review, linked order history, and linked return history should stay inside the customers feature boundary
- `/customers` searches, filters by region, and pages on the server through `src/features/customers/data/repositories/customer-repository.ts`
- customer-linked order and return handoff resolves against the order and return desks
- customer records must stay aligned to the storefront account, checkout, and returns context
- customers workflow coverage should continue to protect list rendering, lookup behavior, detail review, and linked order/return handoff

Current Phase 8 settings foundation:

- the settings module now owns the grouped operational-defaults workflow in the dashboard
- grouped settings review, placeholder editing, and save behavior should stay inside the settings feature boundary
- settings reads and writes flow through `src/features/settings/data/repositories/setting-repository.ts`
- settings records must stay aligned to the operational defaults the storefront and dashboard consume
- settings workflow coverage should continue to protect grouped rendering, editable placeholder behavior, save flow, and persistence

Current Phase 8.5 parity foundation:

- the parity checkpoint was the handoff into API work; its findings are in `dashboard/PARITY_CHECKPOINT.md`
- remaining parity gaps are tracked as explicit design items in `api/PLAN.md` (for example the Slice 5 storefront profile-depth decision)

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

- The API is the source of truth. Map API responses to dashboard contracts in explicit mappers and keep them covered by `tests/unit/contracts/api-contracts.test.ts`.
- List reads follow every page (`src/core/api/paginate.ts`) unless the screen pages on the server.
- A failed read shows an error state with Retry; never fall back silently to an empty list.
- Keep product, order, return, content, and customer shapes compatible with the storefront.

## Definition of Ready

Before building a module:

- its slice and API contract are documented in `api/PLAN.md`
- the route shape is clear
- its dependency on storefront behavior is understood

## Definition of Done

A dashboard module is done when:

- the main list/detail or edit flow works against the live API
- loading, empty, and error states exist
- the module supports the related storefront behavior it is meant to manage
- adapter unit tests and e2e coverage pass

## Current Priority

Use `api/PLAN.md` §10 for slice status and open work (each slice's Pending list) and `TESTING.md` for slice sign-off.
