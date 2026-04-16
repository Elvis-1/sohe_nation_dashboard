# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-surfaces.spec.ts >> dashboard implemented surfaces >> staff can create a new draft product and return to the catalog list
- Location: tests/e2e/dashboard-surfaces.spec.ts:102:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://127.0.0.1:3100/products"
Received: "http://127.0.0.1:3100/products/new"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://127.0.0.1:3100/products/new"

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
            - button "Menu Control Desk" [ref=e50] [cursor=pointer]:
              - generic [ref=e51]: Menu
              - generic [ref=e52]: Control Desk
            - generic [ref=e53]:
              - generic [ref=e54]: Fixture mode active
              - strong [ref=e55]: Staff Access
            - generic [ref=e56]:
              - generic [ref=e57]: Section
              - strong [ref=e58]: "00"
          - generic [ref=e59]:
            - strong [ref=e60]: Control Desk
            - text: Staff workspace for products, orders, content, returns, customers, and settings.
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
            - heading "Create a draft product." [level=1] [ref=e72]
            - paragraph [ref=e73]: "Manage the product fields the storefront relies on: title, slug, category, audience, price, stock, variants, visibility, and media."
          - link "Back to products" [ref=e75] [cursor=pointer]:
            - /url: /products
        - generic [ref=e76]:
          - generic [ref=e77]:
            - generic [ref=e78]:
              - heading "Status control" [level=2] [ref=e79]
              - paragraph [ref=e80]: Keep a product in draft while shaping it, or publish it once the storefront-facing fields are ready.
            - generic [ref=e81]:
              - button "draft" [ref=e82] [cursor=pointer]
              - button "published" [ref=e83] [cursor=pointer]
              - button "scheduled" [ref=e84] [cursor=pointer]
          - generic [ref=e85]:
            - generic [ref=e86]:
              - heading "Product fields" [level=2] [ref=e87]
              - paragraph [ref=e88]: These fields cover the key storefront merchandising and PDP assumptions already in fixture mode.
            - generic [ref=e89]:
              - generic [ref=e90]:
                - generic [ref=e91]: Title
                - textbox "Product title" [ref=e92]: Sunline Training Tee 1776336082336
              - generic [ref=e93]:
                - generic [ref=e94]: Slug
                - textbox "Product slug" [ref=e95]: sunline-training-tee-1776336082336
              - generic [ref=e96]:
                - generic [ref=e97]: Subtitle
                - textbox "Product subtitle" [ref=e98]: Lightweight top for warm-weather sessions.
              - generic [ref=e99]:
                - generic [ref=e100]: Category
                - combobox "Product category" [ref=e101]:
                  - option "Tracksuit"
                  - option "Outerwear"
                  - option "Tops" [selected]
                  - option "Bottoms"
                  - option "Headwear"
              - generic [ref=e102]:
                - generic [ref=e103]: Audience
                - combobox "Product audience" [ref=e104]:
                  - option "Women"
                  - option "Men"
                  - option "Unisex" [selected]
              - generic [ref=e105]:
                - generic [ref=e106]: Primary media URL
                - textbox "Primary media URL" [ref=e107]: https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800
              - generic [ref=e108]:
                - generic [ref=e109]: Primary media alt
                - textbox "Primary media alt" [ref=e110]: Sunline Training Tee front view
          - generic [ref=e111]:
            - generic [ref=e112]:
              - heading "PDP narrative" [level=2] [ref=e113]
              - paragraph [ref=e114]: These narrative fields render in storefront product story blocks.
            - generic [ref=e115]:
              - generic [ref=e116]:
                - generic [ref=e117]: Campaign note
                - textbox "Product campaign note" [ref=e118]
              - generic [ref=e119]:
                - generic [ref=e120]: Fit guidance
                - textbox "Product fit guidance" [ref=e121]
              - generic [ref=e122]:
                - generic [ref=e123]: Material story
                - textbox "Product material story" [ref=e124]
              - generic [ref=e125]:
                - generic [ref=e126]: Sustainability note
                - textbox "Product sustainability note" [ref=e127]
              - generic [ref=e128]:
                - generic [ref=e129]: Delivery note
                - textbox "Product delivery note" [ref=e130]
          - generic [ref=e131]:
            - generic [ref=e132]:
              - heading "Variants" [level=2] [ref=e133]
              - paragraph [ref=e134]: Capture the size, color, SKU, and stock options the storefront needs for selection and availability.
            - generic [ref=e135]:
              - generic [ref=e136]:
                - generic [ref=e137]:
                  - strong [ref=e138]: Variant 1new
                  - button "Remove" [disabled] [ref=e139] [cursor=pointer]
                - generic [ref=e140]:
                  - generic [ref=e141]:
                    - generic [ref=e142]: SKU
                    - textbox "Variant 1 SKU" [ref=e143]: SN-STT-WHT-M-1776336082336
                  - generic [ref=e144]:
                    - generic [ref=e145]: Size
                    - textbox "Variant 1 size" [ref=e146]: M
                  - generic [ref=e147]:
                    - generic [ref=e148]: Color
                    - textbox "Variant 1 color" [ref=e149]: White
                  - generic [ref=e150]:
                    - generic [ref=e151]: Stock
                    - textbox "Variant 1 stock" [ref=e152]: "14"
                  - generic [ref=e153]:
                    - generic [ref=e154]: Price (NGN)
                    - textbox "Variant 1 price" [ref=e155]: "62000"
                  - generic [ref=e156]:
                    - generic [ref=e157]: Compare at (NGN)
                    - textbox "Variant 1 compare at price" [ref=e158]:
                      - /placeholder: Leave blank if no sale
              - button "Add variant" [ref=e159] [cursor=pointer]
          - generic [ref=e160]:
            - generic [ref=e161]:
              - heading "Save actions" [level=2] [ref=e162]
              - paragraph [ref=e163]: Save the record as a draft, publish it to the mocked catalog, or return to the product desk.
            - generic [ref=e164]:
              - button "Save as draft" [active] [ref=e165] [cursor=pointer]
              - button "Save and publish" [ref=e166] [cursor=pointer]
              - link "Cancel" [ref=e167] [cursor=pointer]:
                - /url: /products
```

# Test source

```ts
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
  88  |     await expect(page.getByRole("link", { name: "Edit product" }).first()).toBeVisible();
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
> 122 |     await expect(page).toHaveURL("/products");
      |                        ^ Error: expect(page).toHaveURL(expected) failed
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
  189 |     await expect(page.getByText("12 Admiralty Way, Lekki Phase 1, Lagos")).toBeVisible();
  190 |     await expect(page.getByText("Lunar Utility Jacket")).toBeVisible();
  191 |     await expect(page.getByText("Black / L")).toBeVisible();
  192 |     await expect(page.getByText("Varsity Crest Cap")).toBeVisible();
  193 |     await expect(page.getByLabel("Fulfillment note")).toHaveValue(
  194 |       "Awaiting final pack confirmation before courier handoff.",
  195 |     );
  196 |     await expect(page.getByLabel("Internal note")).toHaveValue(
  197 |       "VIP customer. Confirm jacket garment bag before dispatch.",
  198 |     );
  199 |   });
  200 | 
  201 |   test("staff can update an order and hand off into the linked customer record", async ({
  202 |     page,
  203 |   }) => {
  204 |     await page.goto("/orders/order_soh_2033");
  205 | 
  206 |     await expect(page.getByRole("heading", { name: "Order SOH-2033" })).toBeVisible();
  207 |     await expect(page.getByText("4 Raymond Njoku Street, Ikoyi, Lagos")).toBeVisible();
  208 |     await expect(page.getByText("Rally Knit Set")).toBeVisible();
  209 | 
  210 |     await page.getByLabel("Fulfillment status").selectOption("paid");
  211 |     await page
  212 |       .getByLabel("Internal note")
  213 |       .fill("Capture confirmed by finance. Release to fulfillment.");
  214 |     await page.getByRole("button", { name: "Save order updates" }).click();
  215 | 
  216 |     await expect(page.getByText("Order updates saved to the mocked desk.")).toBeVisible();
  217 | 
  218 |     await page.getByRole("link", { name: "Back to orders" }).click();
  219 |     await expect(page).toHaveURL("/orders");
  220 |     await expect(
  221 |       page.locator("article").filter({ hasText: "SOH-2033" }).getByText("paid", { exact: true }),
  222 |     ).toBeVisible();
```