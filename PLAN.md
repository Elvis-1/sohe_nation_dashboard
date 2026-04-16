# Sohe's Nation Dashboard Implementation Plan

## 0. Mission

- Build a simple, high-clarity back-office dashboard for Sohe's Nation staff.
- Keep the dashboard fixture-first until the API phase begins.
- Match the already-built storefront flows closely enough that dashboard and storefront can meet at the parity checkpoint before API work begins.
- Prioritize operational usefulness over breadth: products, orders, content, and returns come first.

## 1. Scope and Role

- `dashboard/` is for staff-only operations.
- It must not duplicate customer-facing storefront flows from `web/storefront`.
- It should prepare cleanly for later Django/API wiring.
- It should remain simple in the MVP phase: clear lists, details, edit forms, and status controls before advanced analytics or automation.

## 2. Current Project Context

- `web/storefront` remains the most mature product surface in the repo.
- Storefront UI phases 0 to 4 are materially in place in fixture mode and remain the contract reference for the dashboard.
- `dashboard/` is now actively implemented as its own Next.js app with a live fixture-backed shell and module scaffolds.
- Live API integration still comes after the dashboard reaches broader UI readiness.

### Current Dashboard Status — 2026-04-16

- Phase 0 – Dashboard Foundations: complete
- Phase 1 – Auth: complete
- Phase 1.5 – Shell: complete
- Phase 2 – Overview: complete
- Phase 3 – Products: complete
- Phase 4 – Orders: complete
- Phase 5 – Content: complete
- Phase 6 – Returns: complete
- Phase 7 – Customers: complete
- Phase 8 – Settings: complete
- Phase 8.5 – Dashboard parity checkpoint: complete

### Implemented Today

- Staff can sign in through the mocked auth flow and land on the protected overview route.
- The protected dashboard shell, navigation, loading/error/not-found states, and shared empty-state pattern are in place.
- The overview screen now aligns to the documented operator flow: KPI strip, recent orders, low-stock watch, returns pending, and direct module handoffs.
- The products module now supports list, filter/search, create, edit, and draft/publish workflow in fixture mode.
- The orders module now supports list filtering, order detail review, fulfillment status updates, internal notes, and a live handoff into a lightweight customer record.
- The content module now supports content-area selection, homepage editing, stories editing, linked product management, preview structure, and draft/ready state changes in fixture mode.
- The returns module now supports queue filtering, return detail review, lifecycle status updates, internal decision capture, and live handoff into lightweight customer records.
- The customers module now supports lookup, customer detail review, and linked handoff into live orders and returns records.
- The settings module now supports grouped placeholder review, fixture-backed editing, and persistence for operational defaults.
- Automated coverage exists for dashboard foundations, auth, shell behavior, overview behavior, and the currently implemented module surfaces.

## 3. Dashboard MVP Features

- Auth
- Overview
- Products
- Orders
- Content
- Returns
- Customers
- Settings

## 4. Storefront Feature Tracking

This section keeps the dashboard scope tied to the storefront features it must eventually support.

| Dashboard Feature | Purpose in Dashboard | Related Storefront Feature(s) | Current Storefront Reality |
| --- | --- | --- | --- |
| Auth | Staff access to admin workspace | `account-auth`, `account` | Customer auth/account UI is mocked and live in fixture mode |
| Overview | Snapshot of daily operations | `cart-and-checkout`, `account`, `product-discovery` | Cart, checkout, and account surfaces are live in fixture mode |
| Products | Manage catalog, pricing, stock, variants, media, visibility | `product-discovery`, `product-detail` | Catalog and PDP are live |
| Orders | Review and update order lifecycle | `cart-and-checkout`, `account` | Checkout success and order history are live in fixture mode |
| Content | Control homepage and editorial content | `hero`, `editorial`, `navigation` | Homepage and stories are live in fixture mode |
| Returns | Process customer return requests | `account` | Returns request UI is live in fixture mode |
| Customers | View customer records and order relationships | `account`, `cart-and-checkout` | Account/order history surfaces are live in fixture mode |
| Settings | Configure operational defaults and placeholders | cross-cutting | Storefront depends on future auth, payment, shipping, and content settings |

## 5. Feature Flows

### Auth

**Goal**: let staff enter the dashboard through a simple, secure access gate.

**MVP flow**
- Staff lands on sign-in page.
- Staff enters email and password.
- If valid, staff is routed into the dashboard overview.
- If invalid, staff sees a clear error state and can retry.
- Staff can sign out from the global shell.

**Key MVP screens**
- Sign in
- Forgot password placeholder
- Session-expired state

**Success criteria**
- Staff can enter and exit the dashboard through a coherent mocked auth flow.
- Protected routes are gated behind the auth shell.

### Overview

**Goal**: give staff a quick operational snapshot without needing to open multiple modules.

**MVP flow**
- Staff signs in and lands on overview.
- Staff sees top metrics: orders, revenue, low stock, returns awaiting review.
- Staff sees recent orders and urgent actions.
- Staff can jump directly into products, orders, returns, or content.

**Key MVP modules**
- KPI strip
- Recent orders list
- Low-stock panel
- Returns pending panel
- Quick actions

**Success criteria**
- Overview communicates current store state in one screen.
- Each summary block links into a deeper module.

### Products

**Goal**: let staff manage catalog data that powers storefront discovery and PDPs.

**MVP flow**
- Staff opens the products list.
- Staff filters or searches for a product.
- Staff opens a product detail/editor screen.
- Staff updates title, slug, category, audience, price, stock, size options, color options, visibility, and primary media.
- Staff saves changes and returns to the list.
- Staff can create a new product in a simple draft state.

**Key MVP screens**
- Product list
- Product editor
- Create product
- Draft/published status control

**Success criteria**
- Staff can create, edit, and review products using mocked repositories.
- Product fields cover the current storefront catalog and PDP needs.

### Orders

**Goal**: let staff track the lifecycle of customer purchases from placement to fulfillment.

**MVP flow**
- Staff opens the orders list.
- Staff filters by status, date, customer, or order number.
- Staff opens a single order detail view.
- Staff reviews items, totals, customer details, shipping details, and payment method.
- Staff updates fulfillment status and internal notes.
- Staff returns to the list or navigates to the customer record.

**Key MVP screens**
- Orders list
- Order detail
- Fulfillment status control
- Internal notes area

**Success criteria**
- Staff can inspect and update mocked order lifecycle states.
- Order detail reflects the core data already implied by storefront checkout and account flows.

### Content

**Goal**: let staff manage campaign and editorial surfaces without touching code.

**MVP flow**
- Staff opens the content hub.
- Staff chooses a content area: homepage, featured drop, stories/lookbooks, or navigation promos.
- Staff edits text, linked products, media references, and visibility state.
- Staff previews the content structure.
- Staff saves as draft or marks ready for publish.

**Key MVP screens**
- Content index
- Homepage content editor
- Story/lookbook editor
- Merchandising spotlight editor

**Success criteria**
- Dashboard content models cover the major live storefront content surfaces.
- Staff can manage homepage and story content in a fixture-backed workflow.

### Returns

**Goal**: let staff review and process return requests coming from the customer account area.

**MVP flow**
- Staff opens returns queue.
- Staff filters by status: new, in review, approved, rejected, completed.
- Staff opens a return detail.
- Staff reviews customer, order, item, reason, and notes.
- Staff updates return status and records an internal decision.
- Staff exits back to the queue.

**Key MVP screens**
- Returns queue
- Return detail
- Status update controls

**Success criteria**
- Staff can process mocked return requests through a full internal lifecycle.
- Return statuses are shaped to align with the customer-facing account returns flow.

### Customers

**Goal**: give staff a simple record view of each customer and their relationship to orders/returns.

**MVP flow**
- Staff opens customers list.
- Staff searches by name, email, or customer ID.
- Staff opens customer detail.
- Staff reviews profile, addresses, order history, and return history.
- Staff can jump from customer detail into related orders or returns.

**Key MVP screens**
- Customers list
- Customer detail
- Linked orders block
- Linked returns block

**Success criteria**
- Staff can review customer context without leaving the dashboard.
- Customer data structure aligns with current storefront account expectations.

### Settings

**Goal**: centralize operational configuration placeholders needed before API wiring.

**MVP flow**
- Staff opens settings.
- Staff reviews grouped settings: store profile, payments, shipping, notifications, staff roles.
- Staff updates fixture-backed values or placeholders.
- Staff saves configuration.

**Key MVP screens**
- General settings
- Payment settings placeholder
- Shipping settings placeholder
- Roles/permissions placeholder

**Success criteria**
- Settings exist as a clean placeholder module for later live integration.
- The dashboard has a defined place for payment, shipping, and access configuration without overbuilding those systems yet.

## 6. Recommended MVP Navigation

- Overview
- Products
- Orders
- Content
- Returns
- Customers
- Settings

Auth lives outside the main navigation as the dashboard access gate.

## 7. Phased Implementation Plan

### Phase 0 – Dashboard Foundations — _Status: Complete_

**Goals**
- Confirm dashboard scope and IA.
- Define dashboard module boundaries.
- Create fixture shapes aligned to storefront needs.
- Establish dashboard shell, navigation, and token usage.

**Tasks**
- [ ] Confirm route map and sidebar structure.
- [ ] Confirm dashboard design language and reuse of shared brand tokens where appropriate.
- [ ] Define feature folders, core contracts, and mock repository boundaries.
- [ ] Document fixture shapes for products, orders, content, returns, customers, and settings.

**Success criteria**
- Dashboard structure is documented and ready for implementation.
- Mock data contracts clearly map to existing storefront features.
- Phase 0 foundations have verification coverage for contracts, repository boundaries, and route/IA assumptions.

**Phase 0 completion notes**
- Route ownership is confirmed: the dashboard is its own Next.js app and owns `/`, `/signin`, `/products`, `/orders`, `/content`, `/returns`, `/customers`, and `/settings`.
- The Phase 0 IA is the top-level module map above; detail routes such as `/products/[id]` and `/orders/[id]` remain Phase 3+ implementation work, not a blocker for foundations.
- Dashboard shell and sidebar structure are established in `src/app/(dashboard)/layout.tsx`, `src/core/ui/dashboard-shell.tsx`, and `src/features/navigation/data/nav-items.ts`.
- Dashboard tokens are defined in `src/app/globals.css` and intentionally follow the storefront brand direction while staying more utilitarian.
- Shared fixture contracts now live in `src/core/types/dashboard.ts`.
- Mock repository boundaries now live under each feature’s `data/repositories/` folder and are the approved entry point for fixture-backed reads during the MVP phase.
- Fixture shapes for products, orders, content, returns, customers, and settings are defined in each feature’s `data/mock-*.ts` file and align to the storefront responsibilities listed in Section 4.

#### Phase 0 fixture contract map

| Dashboard module | Contract source | Fixture source | Storefront responsibility mirrored |
| --- | --- | --- | --- |
| Overview | `src/core/types/dashboard.ts` (`OverviewMetric`, `OverviewQuickAction`, `OverviewModuleLink`) | `src/features/overview/data/mock-overview.ts` + `src/features/overview/data/repositories/mock-overview-repository.ts` | Daily snapshot of products, orders, returns, and content |
| Products | `src/core/types/dashboard.ts` (`DashboardProductRecord`) | `src/features/products/data/mock-products.ts` | Catalog, PDP, price, stock, media, and variant support |
| Orders | `src/core/types/dashboard.ts` (`DashboardOrderRecord`) | `src/features/orders/data/mock-orders.ts` | Checkout follow-through, payment visibility, fulfillment lifecycle |
| Content | `src/core/types/dashboard.ts` (`DashboardContentRecord`) | `src/features/content/data/mock-content.ts` | Homepage, stories, and merchandising content surfaces |
| Returns | `src/core/types/dashboard.ts` (`DashboardReturnRecord`) | `src/features/returns/data/mock-returns.ts` | Customer account returns lifecycle |
| Customers | `src/core/types/dashboard.ts` (`DashboardCustomerRecord`) | `src/features/customers/data/mock-customers.ts` | Account context, order links, return links |
| Settings | `src/core/types/dashboard.ts` (`DashboardSettingGroup`) | `src/features/settings/data/mock-settings.ts` | Operational placeholders for future API-backed configuration |

### Phase 1 – Auth — _Status: Complete_

**Goals**
- Build the staff access gate first.

**Tasks**
- [ ] Implement mocked staff sign-in flow.

**Success criteria**
- Staff can sign in through a coherent mocked access flow.
- Protected routes are ready to sit behind dashboard auth.
- Auth entry, redirect, expiry, and sign-out flows have automated verification coverage.

**Phase 1 completion notes**
- Mocked staff sign-in is implemented in `src/features/auth/presentation/components/sign-in-page-shell.tsx`.
- Staff session rules and demo credentials are centralized in `src/features/auth/data/mock-staff-auth-repository.ts`.
- Session state, expiry handling, and sign-out behavior are managed in `src/features/auth/presentation/state/dashboard-auth-provider.tsx`.
- Protected dashboard routes sit behind `src/features/auth/presentation/components/dashboard-access-gate.tsx`.
- Auth pages redirect authenticated staff back to `/` through `src/features/auth/presentation/components/auth-route-gate.tsx`.
- Auth entry, forgot-password placeholder, and session-expired routes now form the complete mocked MVP access flow.

### Phase 1.5 – Shell — _Status: Complete_

**Goals**
- Build the dashboard chrome and protected route shell.

**Tasks**
- [ ] Implement dashboard layout, sidebar, topbar, and protected route shell.
- [ ] Add loading, empty, and error states for admin pages.

**Success criteria**
- Staff can move through a stable protected dashboard shell.
- Navigation is stable across desktop and tablet layouts.
- Shell navigation, protected layout behavior, and admin state surfaces are verified through automated tests.

**Phase 1.5 completion notes**
- The protected shell is implemented in `src/app/(dashboard)/layout.tsx` and `src/core/ui/dashboard-shell.tsx`.
- Sidebar, topbar, action shortcuts, and route context are now stable across desktop and tablet layouts.
- The shell includes a tablet menu toggle, backdrop close behavior, route-aware navigation states, and sign-out controls.
- Shared loading, error, and not-found admin states remain available through `src/app/loading.tsx`, `src/app/error.tsx`, and `src/app/not-found.tsx`.
- Shared empty-state coverage now exists through `src/core/ui/empty-state-panel.tsx` and is wired into the scaffolded module pages.
- Automated verification covers shell navigation, responsive sidebar behavior, and current admin state surfaces.

### Phase 2 – Overview — _Status: Complete_

**Goals**
- Build the dashboard landing surface first so staff have a stable operational entry point.

**Tasks**
- [ ] Implement overview screen with KPIs, recent orders, low-stock alerts, and quick actions.

**Success criteria**
- Overview can summarize the current fixture-mode state of products, orders, returns, and content.
- Staff can navigate from overview into the deeper operational modules without dead ends.
- Overview KPIs, summary blocks, and module handoffs are covered by automated verification.

**Phase 2 completion notes**
- The overview landing surface is implemented in `src/features/overview/presentation/components/overview-page-shell.tsx`.
- Overview reads through `src/features/overview/data/repositories/mock-overview-repository.ts` and summarizes fixture-backed products, orders, returns, and content state.
- Overview copy and structure now stay tightly aligned to the documented feature flow instead of using extra narrative detail.
- Overview includes KPI cards, quick actions, recent orders, low-stock watch, returns pending, and direct module handoffs.
- Module handoffs from the overview route into live dashboard modules without dead ends.
- The overview now has an explicit empty-state fallback in case fixture data is missing.
- Automated verification covers overview repository composition, KPI/summary visibility, and module handoff behavior.

### Phase 3 – Products — _Status: Complete_

**Goals**
- Build the catalog management surface as its own module.

**Tasks**
- [ ] Implement products list, filter/search, create/edit, and publish status flow.
- [ ] Add product fields for title, slug, category, audience, price, stock, variants, visibility, and media references.

**Success criteria**
- Dashboard can represent the live storefront catalog in fixture mode.
- Staff can manage product records without relying on order-management screens.
- Product list, editor flow, and status interactions are covered by automated verification once implemented.

**Phase 3 completion notes**
- The products list workflow is implemented in `src/features/products/presentation/components/products-page-shell.tsx`.
- Product creation and editing routes now exist at `/products/new` and `/products/[id]`.
- The mocked catalog supports search, visibility filtering, audience filtering, create, edit, and draft/publish state changes.
- Product records expose the key storefront-facing fields: title, slug, subtitle, category, audience, price, stock, variants, visibility, and primary media.
- The catalog workflow uses a fixture-backed client repository in `src/features/products/data/repositories/mock-product-repository.ts` and shared client state through `src/features/products/presentation/state/use-product-catalog.ts`.
- Automated verification now covers product list rendering, filter/search behavior, product creation, and product editing/publish flow.

### Phase 4 – Orders — _Status: Complete_

**Goals**
- Build the post-purchase operations surface as its own module.

**Tasks**
- [ ] Implement orders list, order detail, fulfillment status changes, and internal notes.
- [ ] Reflect the key data already implied by storefront checkout, order history, and payment-provider selection.

**Success criteria**
- Dashboard can represent the storefront order lifecycle in fixture mode.
- Staff can review and update orders without relying on product-management screens.
- Order list, detail, fulfillment updates, and notes behavior are covered by automated verification once implemented.

**Phase 4 completion notes**
- The orders list workflow is implemented in `src/features/orders/presentation/components/orders-page-shell.tsx`.
- Order detail now exists at `/orders/[id]` through `src/features/orders/presentation/components/order-detail-page-shell.tsx`.
- Staff can search orders by customer or order number and filter by status, date, and payment provider.
- Order detail reflects the key checkout and account-history assumptions already present in the storefront: line items, totals, customer details, shipping details, payment provider, fulfillment note, and internal note.
- Fulfillment status and notes now persist through `src/features/orders/data/repositories/mock-order-repository.ts` and shared client state in `src/features/orders/presentation/state/use-order-desk.ts`.
- Orders can hand staff into a lightweight customer drill-in at `/customers/[id]` so the Phase 4 flow does not end in a dead link before the full customers phase is built.
- Automated verification now covers order list rendering, search/filter behavior, order detail review, fulfillment updates, note persistence, and customer handoff.

### Phase 5 – Content — _Status: Complete_

**Goals**
- Build the campaign and editorial management module.

**Tasks**
- [ ] Implement content hub for homepage, stories, and featured merchandising blocks.

**Success criteria**
- Dashboard can manage the key storefront content areas currently live in `web/storefront`.
- Staff can manage campaign and editorial records without relying on returns tooling.
- Content hub navigation, editing flows, and publish/draft behavior are covered by automated verification once implemented.

**Phase 5 completion notes**
- The content hub is implemented in `src/features/content/presentation/components/content-page-shell.tsx`.
- Strict Phase 5 routes now exist at `/content/homepage` and `/content/stories`.
- The homepage editor covers both homepage hero and featured-drop merchandising structures, while the stories editor covers story/lookbook and navigation-promo content.
- Content records now support fixture-backed editing for text, CTA fields, linked products, media references, preview structure, and draft/ready/published visibility.
- Content state persists through `src/features/content/data/repositories/mock-content-repository.ts` and shared client state in `src/features/content/presentation/state/use-content-desk.ts`.
- Automated verification now covers content hub navigation, homepage editing, stories editing, and draft/ready state behavior.

### Phase 6 – Returns — _Status: Complete_

**Goals**
- Build the post-purchase returns operations module.

**Tasks**
- [ ] Implement returns queue and return-detail processing flow.

**Success criteria**
- Dashboard can process customer return requests in a clear mocked workflow.
- Return handling is shaped to match the storefront account returns flow.
- Return queue, decision flow, and lifecycle transitions are covered by automated verification once implemented.

**Phase 6 completion notes**
- The returns queue workflow is implemented in `src/features/returns/presentation/components/returns-page-shell.tsx`.
- Return detail now exists at `/returns/[id]` through `src/features/returns/presentation/components/return-detail-page-shell.tsx`.
- Staff can search returns by return ID, order ID, customer, email, or reason and filter by lifecycle status.
- Return detail reflects the key account-side request assumptions already present in the storefront: customer context, order context, item summary, request reason, customer note, and internal decision.
- Return status and internal decision now persist through `src/features/returns/data/repositories/mock-return-repository.ts` and shared client state in `src/features/returns/presentation/state/use-return-desk.ts`.
- Returns can hand staff into a lightweight customer drill-in at `/customers/[id]` so the Phase 6 flow does not end in a dead link before the full customers phase is built.
- Automated verification now covers return queue rendering, search/filter behavior, return detail review, lifecycle updates, persistence, and customer handoff.

### Phase 7 – Customers — _Status: Complete_

**Goals**
- Build the customer record module as its own operational surface.

**Tasks**
- [ ] Implement customers list and customer detail view.

**Success criteria**
- Customer records are reviewable and linked to orders/returns.
- Staff can review customer context without relying on settings or returns tooling.
- Customer lookup, detail navigation, and linked order/return context are covered by automated verification once implemented.

**Phase 7 completion notes**
- The customers list workflow is implemented in `src/features/customers/presentation/components/customers-page-shell.tsx`.
- Customer detail remains at `/customers/[id]` through `src/features/customers/presentation/components/customer-detail-page-shell.tsx`, now as a full Phase 7 workflow instead of a temporary handoff shell.
- Staff can search customers by name, email, or customer ID from the customer list.
- Customer detail now reflects profile context, saved-address count, order history, and return history with direct handoff into live order and return records where available.
- Customer-linked order handoff is resolved through live order state using `src/features/orders/data/repositories/mock-order-repository.ts`.
- Automated verification now covers customer list rendering, customer lookup, customer detail review, and linked order/return handoff behavior.

### Phase 8 – Settings — _Status: Complete_

**Goals**
- Build the operational configuration placeholder module.

**Tasks**
- [ ] Implement settings placeholders for store profile, payments, shipping, and staff roles.

**Success criteria**
- Settings provide clear placeholders for later backend integration.
- The dashboard has a defined home for operational defaults before live API wiring.
- Settings groups, placeholder editing behavior, and persistence expectations are covered by automated verification once implemented.

**Phase 8 completion notes**
- The settings workflow is implemented in `src/features/settings/presentation/components/settings-page-shell.tsx`.
- Settings now render as grouped editable defaults for store profile, payments, shipping, and staff roles.
- Fixture-backed settings persistence is implemented in `src/features/settings/data/repositories/mock-setting-repository.ts` and shared client state in `src/features/settings/presentation/state/use-setting-groups.ts`.
- Staff can review grouped placeholders, update values, save the current defaults, and reload to confirm persistence.
- Automated verification now covers settings rendering, grouped field editing, save behavior, and persistence expectations.

### Phase 8.5 – Dashboard Parity Checkpoint — _Status: Pending_

**Goals**
- Confirm the dashboard is ready to pair with the storefront during API work.

**Tasks**
- [ ] Review dashboard scope against storefront feature needs.
- [ ] Validate that product, order, content, return, and customer data shapes match the storefront assumptions.
- [ ] Log any contract gaps before Django/API implementation begins.

**Success criteria**
- Dashboard and storefront are both UI-ready in fixture mode.
- The team has a clear contract handoff into the API phase.
- Cross-surface contract assumptions and the final parity checklist are backed by automated verification where feasible.

**Phase 8.5 completion notes**
- The dashboard/storefront parity review is documented in `PARITY_CHECKPOINT.md`.
- Overview operational summaries now reflect live stored product, order, and return state, closing the remaining in-session parity gap for cross-module dashboard summaries.
- Settings coverage now includes the planned notifications placeholder group, bringing the settings module in line with the documented MVP flow.
- Automated verification now covers the parity checkpoint through `tests/unit/parity/dashboard-parity-checkpoint.test.ts`.
- The remaining contract gaps are now explicit and logged for API planning instead of being left implicit across the two apps.

## 8. Suggested Dashboard Route Map

- `/signin`
- `/`
- `/products`
- `/products/new`
- `/products/[id]`
- `/orders`
- `/orders/[id]`
- `/content`
- `/content/homepage`
- `/content/stories`
- `/returns`
- `/returns/[id]`
- `/customers`
- `/customers/[id]`
- `/settings`

## 9. Out of Scope for MVP

- Advanced analytics and custom reporting
- Discount engine and promotion builder
- Inventory transfers and warehouse workflows
- Complex role/permission matrix
- Multi-location operations
- Notification center
- Audit logs
- Bulk import/export tooling

## 10. Next Recommended Step

- Move into the API phase with the dashboard and storefront contract handoff captured.
- Use `PARITY_CHECKPOINT.md` and the dashboard/storefront fixture contracts as the source of truth for Django/API scoping.
- Address the logged contract gaps deliberately during API design rather than treating them as accidental omissions.
