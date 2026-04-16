# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-surfaces.spec.ts >> dashboard implemented surfaces >> products module renders the fixture-backed catalog scaffold
- Location: tests/e2e/dashboard-surfaces.spec.ts:83:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: 'Edit product' }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: 'Edit product' }).first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - paragraph [ref=e7]: Sohe's Nation
          - heading "Control Desk" [level=1] [ref=e8]
        - paragraph [ref=e9]: Staff workspace for products, orders, content, and post-purchase flow.
      - generic [ref=e10]:
        - generic [ref=e11]:
          - paragraph [ref=e12]: Live desk
          - strong [ref=e13]: Operations Desk
        - generic [ref=e14]: ops@sohesnation.com · Staff Access
      - navigation [ref=e15]:
        - link "01 Overview Daily metrics, recent orders, and priority actions." [ref=e16] [cursor=pointer]:
          - /url: /
          - text: "01"
          - generic [ref=e17]:
            - strong [ref=e18]: Overview
            - generic [ref=e19]: Daily metrics, recent orders, and priority actions.
        - link "02 Products Catalog control for pricing, stock, variants, and visibility." [ref=e20] [cursor=pointer]:
          - /url: /products
          - text: "02"
          - generic [ref=e21]:
            - strong [ref=e22]: Products
            - generic [ref=e23]: Catalog control for pricing, stock, variants, and visibility.
        - link "03 Orders Track payment, fulfillment, and internal handoff status." [ref=e24] [cursor=pointer]:
          - /url: /orders
          - text: "03"
          - generic [ref=e25]:
            - strong [ref=e26]: Orders
            - generic [ref=e27]: Track payment, fulfillment, and internal handoff status.
        - link "04 Content Homepage, stories, and merchandising spotlight control." [ref=e28] [cursor=pointer]:
          - /url: /content
          - text: "04"
          - generic [ref=e29]:
            - strong [ref=e30]: Content
            - generic [ref=e31]: Homepage, stories, and merchandising spotlight control.
        - link "05 Returns Review customer requests and update return outcomes." [ref=e32] [cursor=pointer]:
          - /url: /returns
          - text: "05"
          - generic [ref=e33]:
            - strong [ref=e34]: Returns
            - generic [ref=e35]: Review customer requests and update return outcomes.
        - link "06 Customers Profile, history, and support context at a glance." [ref=e36] [cursor=pointer]:
          - /url: /customers
          - text: "06"
          - generic [ref=e37]:
            - strong [ref=e38]: Customers
            - generic [ref=e39]: Profile, history, and support context at a glance.
        - link "07 Settings Store defaults for payments, shipping, and staff access." [ref=e40] [cursor=pointer]:
          - /url: /settings
          - text: "07"
          - generic [ref=e41]:
            - strong [ref=e42]: Settings
            - generic [ref=e43]: Store defaults for payments, shipping, and staff access.
      - button "Sign out Exit the mocked dashboard session." [ref=e44] [cursor=pointer]:
        - strong [ref=e45]: Sign out
        - text: Exit the mocked dashboard session.
    - main [ref=e46]:
      - generic [ref=e47]:
        - generic [ref=e48]:
          - generic [ref=e49]:
            - button "Menu Products" [ref=e50] [cursor=pointer]:
              - generic [ref=e51]: Menu
              - generic [ref=e52]: Products
            - generic [ref=e53]:
              - generic [ref=e54]: Fixture mode active
              - strong [ref=e55]: Staff Access
            - generic [ref=e56]:
              - generic [ref=e57]: Section
              - strong [ref=e58]: "02"
          - generic [ref=e59]:
            - strong [ref=e60]: Products
            - text: Catalog control for pricing, stock, variants, and visibility.
        - generic [ref=e61]:
          - link "Overview" [ref=e62] [cursor=pointer]:
            - /url: /
          - link "Orders desk" [ref=e63] [cursor=pointer]:
            - /url: /orders
          - generic [ref=e64]:
            - generic [ref=e65]: Session window
            - strong [ref=e66]: 45 min mock access
      - generic [ref=e68]:
        - generic [ref=e69]:
          - generic [ref=e70]:
            - paragraph [ref=e71]: Products
            - heading "Catalog control for discovery and PDP." [level=1] [ref=e72]
            - paragraph [ref=e73]: Search, review, create, and edit product records that power the storefront catalog and product detail pages.
          - generic [ref=e74]:
            - link "Create product" [ref=e75] [cursor=pointer]:
              - /url: /products/new
            - link "Return to overview" [ref=e76] [cursor=pointer]:
              - /url: /
        - generic [ref=e77]:
          - generic [ref=e78]:
            - heading "Catalog desk" [level=2] [ref=e79]
            - paragraph [ref=e80]: Filter the current fixture-backed catalog, then open a product record to edit title, price, stock, variants, and publish state.
          - generic [ref=e81]:
            - generic [ref=e82]:
              - generic [ref=e83]: Search catalog
              - textbox "Search catalog" [ref=e84]:
                - /placeholder: Search by title, slug, or category
            - generic [ref=e85]:
              - generic [ref=e86]: Visibility
              - combobox "Visibility filter" [ref=e87]:
                - option "All visibility" [selected]
                - option "Draft"
                - option "Published"
                - option "Scheduled"
            - generic [ref=e88]:
              - generic [ref=e89]: Audience
              - combobox "Audience filter" [ref=e90]:
                - option "All audiences" [selected]
                - option "Women"
                - option "Men"
                - option "Unisex"
          - generic [ref=e91]:
            - paragraph [ref=e92]: Products
            - heading "The catalog desk is empty right now." [level=2] [ref=e93]
            - paragraph [ref=e94]: Create the first fixture-backed product record to start merchandising and PDP management.
            - link "Create product" [ref=e95] [cursor=pointer]:
              - /url: /products/new
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | const demoEmail = "ops@sohesnation.com";
  4   | const demoPassword = "dashboard-demo";
  5   | const runSuffix = Date.now().toString();
  6   | 
  7   | async function signIn(page: Page) {
  8   |   await page.goto("/signin");
  9   |   await page.getByLabel("Email").fill(demoEmail);
  10  |   await page.getByLabel("Password").fill(demoPassword);
  11  |   await page.getByRole("button", { name: "Continue to overview" }).click();
  12  |   await expect(page).toHaveURL("/");
  13  | }
  14  | 
  15  | test.describe("dashboard implemented surfaces", () => {
  16  |   test.beforeEach(async ({ page }) => {
  17  |     await signIn(page);
  18  |   });
  19  | 
  20  |   test("shell exposes the expected top-level module navigation", async ({ page }) => {
  21  |     await expect(page.getByText("Control Desk")).toBeVisible();
  22  |     const sidebarNav = page.locator("aside nav");
  23  | 
  24  |     await expect(sidebarNav.locator('a[href="/"]').first()).toBeVisible();
  25  |     await expect(sidebarNav.locator('a[href="/products"]')).toBeVisible();
  26  |     await expect(sidebarNav.locator('a[href="/orders"]')).toBeVisible();
  27  |     await expect(sidebarNav.locator('a[href="/content"]')).toBeVisible();
  28  |     await expect(sidebarNav.locator('a[href="/returns"]')).toBeVisible();
  29  |     await expect(sidebarNav.locator('a[href="/customers"]')).toBeVisible();
  30  |     await expect(sidebarNav.locator('a[href="/settings"]')).toBeVisible();
  31  |   });
  32  | 
  33  |   test("tablet shell can open and close the sidebar navigation from the menu button", async ({
  34  |     page,
  35  |   }) => {
  36  |     await page.setViewportSize({ width: 820, height: 1180 });
  37  | 
  38  |     const menuButton = page.getByRole("button", { name: /Menu/i });
  39  |     const sidebar = page.locator("#dashboard-sidebar");
  40  |     const backdrop = page.locator(".dashboard-backdrop");
  41  | 
  42  |     await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  43  | 
  44  |     await menuButton.click();
  45  |     await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  46  |     await expect(sidebar).toHaveAttribute("data-open", "true");
  47  |     await expect(backdrop).toHaveAttribute("data-open", "true");
  48  | 
  49  |     await backdrop.click();
  50  |     await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  51  |     await expect(sidebar).toHaveAttribute("data-open", "false");
  52  |   });
  53  | 
  54  |   test("overview shows the planned operational summary blocks", async ({ page }) => {
  55  |     await expect(page.getByRole("heading", { name: "Daily operations at a glance." })).toBeVisible();
  56  |     await expect(page.getByText("Orders today", { exact: true })).toBeVisible();
  57  |     await expect(page.getByText("Revenue staged", { exact: true })).toBeVisible();
  58  |     await expect(page.getByText("Low stock", { exact: true })).toBeVisible();
  59  |     await expect(page.getByText("Returns awaiting review", { exact: true })).toBeVisible();
  60  |     await expect(page.getByRole("heading", { name: "Recent orders" })).toBeVisible();
  61  |     await expect(page.getByRole("heading", { name: "Low stock watch" })).toBeVisible();
  62  |     await expect(page.getByRole("heading", { name: "Returns pending", exact: true })).toBeVisible();
  63  |   });
  64  | 
  65  |   test("overview quick actions and module cards lead to live module routes without dead ends", async ({
  66  |     page,
  67  |   }) => {
  68  |     await page.getByRole("link", { name: "Open module" }).first().click();
  69  |     await expect(page).toHaveURL("/returns");
  70  |     await expect(page.getByRole("heading", { name: "Process customer requests with a clear queue." })).toBeVisible();
  71  | 
  72  |     await page.goto("/");
  73  |     await page.getByRole("link", { name: "Review orders" }).click();
  74  |     await expect(page).toHaveURL("/orders");
  75  |     await expect(page.getByRole("heading", { name: "Track every purchase handoff." })).toBeVisible();
  76  | 
  77  |     await page.goto("/");
  78  |     await page.getByRole("link", { name: "Open products" }).click();
  79  |     await expect(page).toHaveURL("/products");
  80  |     await expect(page.getByRole("heading", { name: "Catalog control for discovery and PDP." })).toBeVisible();
  81  |   });
  82  | 
  83  |   test("products module renders the fixture-backed catalog scaffold", async ({ page }) => {
  84  |     await page.goto("/products");
  85  | 
  86  |     await expect(page.getByRole("heading", { name: "Catalog control for discovery and PDP." })).toBeVisible();
  87  |     await expect(page.getByRole("heading", { name: "Catalog desk", exact: true })).toBeVisible();
> 88  |     await expect(page.getByRole("link", { name: "Edit product" }).first()).toBeVisible();
      |                                                                            ^ Error: expect(locator).toBeVisible() failed
  89  |   });
  90  | 
  91  |   test("products module supports search and visibility filtering", async ({ page }) => {
  92  |     await page.goto("/products");
  93  | 
  94  |     await page.getByLabel("Search catalog").fill("no-match-catalog-term");
  95  |     await expect(page.getByRole("heading", { name: "No product records match the current filters." })).toBeVisible();
  96  | 
  97  |     await page.getByLabel("Search catalog").fill("");
  98  |     await page.getByLabel("Visibility filter").selectOption("published");
  99  |     await expect(page.getByRole("link", { name: "Edit product" }).first()).toBeVisible();
  100 |   });
  101 | 
  102 |   test("staff can create a new draft product and return to the catalog list", async ({ page }) => {
  103 |     await page.goto("/products/new");
  104 | 
  105 |     await page.getByLabel("Product title").fill(`Sunline Training Tee ${runSuffix}`);
  106 |     await page.getByLabel("Product slug").fill(`sunline-training-tee-${runSuffix}`);
  107 |     await page.getByLabel("Product subtitle").fill("Lightweight top for warm-weather sessions.");
  108 |     await page.getByLabel("Product category").selectOption("tops");
  109 |     await page.getByLabel("Product audience").selectOption("unisex");
  110 |     await page.getByLabel("Primary media URL").fill(
  111 |       "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
  112 |     );
  113 |     await page.getByLabel("Primary media alt").fill("Sunline Training Tee front view");
  114 |     await page.getByLabel("Variant 1 SKU").fill(`SN-STT-WHT-M-${runSuffix}`);
  115 |     await page.getByLabel("Variant 1 size").fill("M");
  116 |     await page.getByLabel("Variant 1 color").fill("White");
  117 |     await page.getByLabel("Variant 1 stock").fill("14");
  118 |     await page.getByLabel("Variant 1 price").fill("62000");
  119 | 
  120 |     await page.getByRole("button", { name: "Save as draft" }).click();
  121 | 
  122 |     await expect(page).toHaveURL("/products");
  123 |     await expect(page.getByText(`Sunline Training Tee ${runSuffix}`)).toBeVisible();
  124 |   });
  125 | 
  126 |   test("staff can edit an existing product and publish changes", async ({ page }) => {
  127 |     await page.goto("/products");
  128 | 
  129 |     const editFirstProductButton = page.getByRole("link", { name: "Edit product" }).first();
  130 |     await editFirstProductButton.click();
  131 |     await expect(page).toHaveURL(/\/products\/.+/);
  132 | 
  133 |     await page.getByLabel("Product title").fill(`Catalog Product Updated ${runSuffix}`);
  134 |     await page.getByRole("button", { name: "Published" }).click();
  135 |     await page.getByRole("button", { name: "Save and publish" }).click();
  136 | 
  137 |     await expect(page).toHaveURL("/products");
  138 |     const updatedCard = page.locator("article").filter({ hasText: `Catalog Product Updated ${runSuffix}` });
  139 | 
  140 |     await expect(updatedCard).toBeVisible();
  141 |     await expect(updatedCard.getByText("published", { exact: true })).toBeVisible();
  142 |   });
  143 | 
  144 |   test("orders module renders the fixture-backed order workflow", async ({ page }) => {
  145 |     await page.goto("/orders");
  146 | 
  147 |     const primaryOrderCard = page.locator("article").filter({ hasText: "SOH-2034" });
  148 | 
  149 |     await expect(page.getByRole("heading", { name: "Track every purchase handoff." })).toBeVisible();
  150 |     await expect(page.getByText("Orders in motion")).toBeVisible();
  151 |     await expect(page.getByText("SOH-2034")).toBeVisible();
  152 |     await expect(primaryOrderCard.getByText("ready to fulfill", { exact: true })).toBeVisible();
  153 |     await expect(page.getByRole("link", { name: "Open order" }).first()).toBeVisible();
  154 |   });
  155 | 
  156 |   test("orders module supports search, status, date, and payment filtering", async ({ page }) => {
  157 |     await page.goto("/orders");
  158 | 
  159 |     await page.getByLabel("Search orders").fill("Tomi");
  160 |     await expect(page.getByText("SOH-2033")).toBeVisible();
  161 |     await expect(page.getByText("SOH-2034")).not.toBeVisible();
  162 | 
  163 |     await page.getByLabel("Search orders").fill("");
  164 |     await page.getByLabel("Status filter").selectOption("delivered");
  165 |     await expect(page.getByText("SOH-2032")).toBeVisible();
  166 |     await expect(page.getByText("SOH-2034")).not.toBeVisible();
  167 | 
  168 |     await page.getByLabel("Status filter").selectOption("all");
  169 |     await page.getByLabel("Placed on filter").fill("2026-04-15");
  170 |     await expect(page.getByText("SOH-2034")).toBeVisible();
  171 |     await expect(page.getByText("SOH-2033")).toBeVisible();
  172 |     await expect(page.getByText("SOH-2032")).not.toBeVisible();
  173 | 
  174 |     await page.getByLabel("Placed on filter").fill("");
  175 |     await page.getByLabel("Payment filter").selectOption("flutterwave");
  176 |     await expect(page.getByText("SOH-2033")).toBeVisible();
  177 |     await expect(page.getByText("SOH-2034")).not.toBeVisible();
  178 |   });
  179 | 
  180 |   test("order detail exposes the core phase 4 review fields for staff", async ({ page }) => {
  181 |     await page.goto("/orders/order_soh_2034");
  182 | 
  183 |     await expect(page.getByRole("heading", { name: "Order SOH-2034" })).toBeVisible();
  184 |     await expect(page.getByText("Ada Nwosu")).toBeVisible();
  185 |     await expect(page.getByText("ada@example.com")).toBeVisible();
  186 |     await expect(page.getByText("2026-04-15", { exact: true })).toBeVisible();
  187 |     await expect(page.getByText("paypal", { exact: true })).toBeVisible();
  188 |     await expect(page.getByText("NGN 414,000", { exact: true })).toBeVisible();
```