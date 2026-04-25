# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-surfaces.spec.ts >> dashboard implemented surfaces >> stories editor supports lookbook and navigation promo updates from the content hub flow
- Location: tests/e2e/dashboard-surfaces.spec.ts:375:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://127.0.0.1:3100/"
Received: "http://127.0.0.1:3100/signin"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://127.0.0.1:3100/signin"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - paragraph [ref=e5]: Staff Access
        - heading "Run the line from one desk." [level=1] [ref=e6]
        - paragraph [ref=e7]: Products, orders, editorial drops, customer returns, and daily operating signals all move through the protected operations desk.
      - generic [ref=e8]:
        - generic [ref=e9]:
          - paragraph [ref=e10]: Backend auth
          - heading "Enter the dashboard" [level=2] [ref=e11]
          - paragraph [ref=e12]: Sign in against the backend staff auth layer to open the protected operations desk.
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e15]: Email or username
            - textbox "Email or username" [ref=e16]: ops@sohesnation.com
          - generic [ref=e17]:
            - generic [ref=e18]: Password
            - textbox "Password" [ref=e19]: dashboard-demo
          - generic [ref=e20]:
            - generic [ref=e21]:
              - text: "Dev access:"
              - code [ref=e22]: admin
              - text: /
              - code [ref=e23]: admin123
            - generic [ref=e24]: Access gate ready
          - paragraph [ref=e25]: Invalid credentials.
          - button "Continue to overview" [ref=e26] [cursor=pointer]
          - link "Forgot password?" [ref=e27] [cursor=pointer]:
            - /url: /forgot-password
  - alert [ref=e28]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | const demoEmail = "ops@sohesnation.com";
  4   | const demoPassword = "dashboard-demo";
  5   | 
  6   | function createRunSuffix() {
  7   |   return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.floor(Math.random() * 1_000_000)}`;
  8   | }
  9   | 
  10  | async function signIn(page: Page) {
  11  |   await page.goto("/signin");
  12  |   await page.getByLabel("Email").fill(demoEmail);
  13  |   await page.getByLabel("Password").fill(demoPassword);
  14  |   await page.getByRole("button", { name: "Continue to overview" }).click();
> 15  |   await expect(page).toHaveURL("/");
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  16  | }
  17  | 
  18  | test.describe("dashboard implemented surfaces", () => {
  19  |   test.beforeEach(async ({ page }) => {
  20  |     await signIn(page);
  21  |   });
  22  | 
  23  |   test("shell exposes the expected top-level module navigation", async ({ page }) => {
  24  |     await expect(page.getByText("Control Desk")).toBeVisible();
  25  |     const sidebarNav = page.locator("aside nav");
  26  | 
  27  |     await expect(sidebarNav.locator('a[href="/"]').first()).toBeVisible();
  28  |     await expect(sidebarNav.locator('a[href="/products"]')).toBeVisible();
  29  |     await expect(sidebarNav.locator('a[href="/orders"]')).toBeVisible();
  30  |     await expect(sidebarNav.locator('a[href="/content"]')).toBeVisible();
  31  |     await expect(sidebarNav.locator('a[href="/returns"]')).toBeVisible();
  32  |     await expect(sidebarNav.locator('a[href="/customers"]')).toBeVisible();
  33  |     await expect(sidebarNav.locator('a[href="/settings"]')).toBeVisible();
  34  |   });
  35  | 
  36  |   test("tablet shell can open and close the sidebar navigation from the menu button", async ({
  37  |     page,
  38  |   }) => {
  39  |     await page.setViewportSize({ width: 820, height: 1180 });
  40  | 
  41  |     const menuButton = page.getByRole("button", { name: /Menu/i });
  42  |     const sidebar = page.locator("#dashboard-sidebar");
  43  |     const backdrop = page.locator(".dashboard-backdrop");
  44  | 
  45  |     await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  46  | 
  47  |     await menuButton.click();
  48  |     await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  49  |     await expect(sidebar).toHaveAttribute("data-open", "true");
  50  |     await expect(backdrop).toHaveAttribute("data-open", "true");
  51  | 
  52  |     await backdrop.click();
  53  |     await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  54  |     await expect(sidebar).toHaveAttribute("data-open", "false");
  55  |   });
  56  | 
  57  |   test("overview shows the planned operational summary blocks", async ({ page }) => {
  58  |     await expect(page.getByRole("heading", { name: "Daily operations at a glance." })).toBeVisible();
  59  |     await expect(page.getByText("Orders today", { exact: true })).toBeVisible();
  60  |     await expect(page.getByText("Revenue staged", { exact: true })).toBeVisible();
  61  |     await expect(page.getByText("Low stock", { exact: true })).toBeVisible();
  62  |     await expect(page.getByText("Returns awaiting review", { exact: true })).toBeVisible();
  63  |     await expect(page.getByRole("heading", { name: "Recent orders" })).toBeVisible();
  64  |     await expect(page.getByRole("heading", { name: "Low stock watch" })).toBeVisible();
  65  |     await expect(page.getByRole("heading", { name: "Returns pending", exact: true })).toBeVisible();
  66  |   });
  67  | 
  68  |   test("overview quick actions and module cards lead to live module routes without dead ends", async ({
  69  |     page,
  70  |   }) => {
  71  |     await page.getByRole("link", { name: "Open module" }).first().click();
  72  |     await expect(page).toHaveURL("/returns");
  73  |     await expect(page.getByRole("heading", { name: "Process customer requests with a clear queue." })).toBeVisible();
  74  | 
  75  |     await page.goto("/");
  76  |     await page.getByRole("link", { name: "Review orders" }).click();
  77  |     await expect(page).toHaveURL("/orders");
  78  |     await expect(page.getByRole("heading", { name: "Track every purchase handoff." })).toBeVisible();
  79  | 
  80  |     await page.goto("/");
  81  |     await page.getByRole("link", { name: "Open products" }).click();
  82  |     await expect(page).toHaveURL("/products");
  83  |     await expect(page.getByRole("heading", { name: "Catalog control for discovery and PDP." })).toBeVisible();
  84  |   });
  85  | 
  86  |   test("products module renders the fixture-backed catalog scaffold", async ({ page }) => {
  87  |     await page.goto("/products");
  88  | 
  89  |     await expect(page.getByRole("heading", { name: "Catalog control for discovery and PDP." })).toBeVisible();
  90  |     await expect(page.getByRole("heading", { name: "Catalog desk", exact: true })).toBeVisible();
  91  | 
  92  |     const hasEditableProducts = (await page.getByRole("link", { name: "Edit product" }).count()) > 0;
  93  |     if (hasEditableProducts) {
  94  |       await expect(page.getByRole("link", { name: "Edit product" }).first()).toBeVisible();
  95  |     } else {
  96  |       await expect(page.getByRole("heading", { name: "The catalog desk is empty right now." })).toBeVisible();
  97  |     }
  98  |   });
  99  | 
  100 |   test("products module supports search and visibility filtering", async ({ page }) => {
  101 |     await page.goto("/products");
  102 | 
  103 |     // API-backed mode can start with either populated or empty catalogs.
  104 |     const hasEditableProducts = (await page.getByRole("link", { name: "Edit product" }).count()) > 0;
  105 | 
  106 |     await page.getByLabel("Search catalog").fill("no-match-catalog-term");
  107 |     if (hasEditableProducts) {
  108 |       await expect(page.getByRole("heading", { name: "No product records match the current filters." })).toBeVisible();
  109 |     } else {
  110 |       await expect(page.getByRole("heading", { name: "The catalog desk is empty right now." })).toBeVisible();
  111 |     }
  112 | 
  113 |     await page.getByLabel("Search catalog").fill("");
  114 |     await page.getByLabel("Visibility filter").selectOption("published");
  115 |     if (hasEditableProducts) {
```