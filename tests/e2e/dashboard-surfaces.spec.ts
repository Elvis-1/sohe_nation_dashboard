import { test, expect, type Page } from "@playwright/test";
import { signInAsOwner } from "./support/staff-auth";

// Runs against the isolated e2e API seeded by `manage.py seed_e2e` (see playwright.config.ts).
// Read-only specs use SOH-2031..2034; update specs use their own records (SOH-2040, SOH-2041,
// the "Wrong colour" return, the "E2E Edit Target" product) so parallel runs do not collide.

function createRunSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function orderCard(page: Page, orderNumber: string) {
  return page.locator("article").filter({ hasText: orderNumber });
}

function returnCard(page: Page, reason: string) {
  return page.locator("article").filter({ hasText: reason });
}

async function openOrder(page: Page, orderNumber: string) {
  await page.goto("/orders");
  await orderCard(page, orderNumber).getByRole("link", { name: "Open order" }).click();
  await expect(page.getByRole("heading", { name: `Order ${orderNumber}` })).toBeVisible();
}

async function openReturn(page: Page, reason: string) {
  await page.goto("/returns");
  await returnCard(page, reason).getByRole("link", { name: "Open return" }).click();
  await expect(page).toHaveURL(/\/returns\/.+/);
}

test.describe("dashboard implemented surfaces", () => {
  test.beforeEach(async ({ page }) => {
    await signInAsOwner(page);
  });

  test("shell exposes the expected top-level module navigation", async ({ page }) => {
    await expect(page.getByText("Control Desk")).toBeVisible();
    const sidebarNav = page.locator("aside nav");

    await expect(sidebarNav.locator('a[href="/"]').first()).toBeVisible();
    await expect(sidebarNav.locator('a[href="/products"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/orders"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/content"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/returns"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/customers"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/settings"]')).toBeVisible();
  });

  test("tablet shell can open and close the sidebar navigation from the menu button", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 1180 });

    const menuButton = page.getByRole("button", { name: /Menu/i });
    const sidebar = page.locator("#dashboard-sidebar");
    const backdrop = page.locator(".dashboard-backdrop");

    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toHaveAttribute("data-open", "true");
    await expect(backdrop).toHaveAttribute("data-open", "true");

    await backdrop.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar).toHaveAttribute("data-open", "false");
  });

  test("overview summarizes live orders, stock, and returns", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Daily operations at a glance." })).toBeVisible();
    await expect(page.getByText("Revenue staged", { exact: true })).toBeVisible();
    await expect(page.getByText("Low stock", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent orders" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Low stock watch" })).toBeVisible();
    // The newest seeded orders are SOH-2040 and SOH-2041.
    await expect(page.getByText(/SOH-204[01]/).first()).toBeVisible();
    await expect(page.getByText("Loading live data...")).toHaveCount(0);
  });

  test("overview quick actions lead to live module routes without dead ends", async ({ page }) => {
    await page.getByRole("link", { name: "Review orders" }).click();
    await expect(page).toHaveURL("/orders");
    await expect(page.getByRole("heading", { name: "Track every purchase handoff." })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Review stock" }).click();
    await expect(page).toHaveURL("/products");
    await expect(page.getByRole("heading", { name: "Catalog control for discovery and PDP." })).toBeVisible();
  });

  test("products module lists the live catalog", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByRole("heading", { name: "Catalog desk", exact: true })).toBeVisible();
    await expect(page.getByText("Lunar Utility Jacket")).toBeVisible();
    await expect(page.getByText("Night Shift Cargo")).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit product" }).first()).toBeVisible();
  });

  test("products module supports search and visibility filtering", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByText("Lunar Utility Jacket")).toBeVisible();

    await page.getByLabel("Search catalog").fill("no-match-catalog-term");
    await expect(page.getByRole("heading", { name: "No product records match the current filters." })).toBeVisible();

    await page.getByLabel("Search catalog").fill("");
    await page.getByLabel("Visibility filter").selectOption("published");
    await expect(page.getByText("Lunar Utility Jacket")).toBeVisible();
    await expect(page.getByText("Night Shift Cargo")).toHaveCount(0);
  });

  test("staff can create a new draft product and return to the catalog list", async ({ page }) => {
    const runSuffix = createRunSuffix();
    await page.goto("/products/new");

    await page.getByLabel("Product title").fill(`Sunline Training Tee ${runSuffix}`);
    await page.getByLabel("Product slug").fill(`sunline-training-tee-${runSuffix}`);
    await page.getByLabel("Product subtitle").fill("Lightweight top for warm-weather sessions.");
    await page.getByLabel("Product category").selectOption("tops");
    await page.getByLabel("Product audience").selectOption("unisex");
    await page.getByLabel("Variant 1 SKU").fill(`SN-STT-WHT-${runSuffix}`);
    await page.getByLabel("Variant 1 size").fill("M");
    await page.getByLabel("Variant 1 color").fill("White");
    await page.getByLabel("Variant 1 stock").fill("14");
    await page.getByLabel("Variant 1 price").fill("62000");

    await page.getByRole("button", { name: "Save as draft" }).click();

    await expect(page).toHaveURL("/products");
    await expect(page.getByText(`Sunline Training Tee ${runSuffix}`)).toBeVisible();
  });

  test("staff can edit an existing product and publish changes", async ({ page }) => {
    const runSuffix = createRunSuffix();
    await page.goto("/products");

    await page
      .locator("article")
      .filter({ hasText: "E2E Edit Target" })
      .getByRole("link", { name: "Edit product" })
      .click();
    await expect(page).toHaveURL(/\/products\/.+/);
    await expect(page.getByLabel("Product title")).toHaveValue("E2E Edit Target");

    // Seeded narrative must load into the form (the list payload omits it).
    await expect(page.getByLabel("Product campaign note")).toHaveValue("E2E Edit Target campaign note.");

    // Saving redirects to /products, so capture the editor URL first.
    const editorUrl = page.url();
    await page.getByLabel("Product title").fill(`E2E Edit Target ${runSuffix}`);
    await page.getByRole("button", { name: "Save and publish" }).click();

    await expect(page.getByText("Product changes saved.")).toBeVisible();
    await page.goto("/products");
    await expect(page.getByText(`E2E Edit Target ${runSuffix}`)).toBeVisible();

    // Saving must not blank fields the list payload does not carry.
    await page.goto(editorUrl);
    await expect(page.getByLabel("Product campaign note")).toHaveValue("E2E Edit Target campaign note.");
    await expect(page.getByLabel("Product fit guidance")).toHaveValue("True to size.");
  });

  test("orders module renders the live order desk", async ({ page }) => {
    await page.goto("/orders");

    await expect(page.getByRole("heading", { name: "Track every purchase handoff." })).toBeVisible();
    await expect(orderCard(page, "SOH-2034")).toBeVisible();
    await expect(orderCard(page, "SOH-2034").getByText("ready to fulfill", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open order" }).first()).toBeVisible();
  });

  test("orders module supports search, status, date, and payment filtering", async ({ page }) => {
    await page.goto("/orders");
    await expect(orderCard(page, "SOH-2034")).toBeVisible();

    await page.getByLabel("Search orders").fill("Tomi");
    await expect(orderCard(page, "SOH-2033")).toBeVisible();
    await expect(orderCard(page, "SOH-2034")).toHaveCount(0);

    await page.getByLabel("Search orders").fill("");
    await page.getByLabel("Status filter").selectOption("delivered");
    await expect(orderCard(page, "SOH-2032")).toBeVisible();
    await expect(orderCard(page, "SOH-2034")).toHaveCount(0);

    await page.getByLabel("Status filter").selectOption("all");
    await page.getByLabel("Placed on filter").fill("2026-09-15");
    await expect(orderCard(page, "SOH-2034")).toBeVisible();
    await expect(orderCard(page, "SOH-2033")).toBeVisible();
    await expect(orderCard(page, "SOH-2032")).toHaveCount(0);

    await page.getByLabel("Placed on filter").fill("");
    await page.getByLabel("Payment filter").selectOption("flutterwave");
    await expect(orderCard(page, "SOH-2033")).toBeVisible();
    await expect(orderCard(page, "SOH-2034")).toHaveCount(0);
  });

  test("order detail exposes the core review fields for staff", async ({ page }) => {
    await openOrder(page, "SOH-2034");

    await expect(page.getByText("Ada Nwosu")).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
    await expect(page.getByText("2026-09-15", { exact: true })).toBeVisible();
    await expect(page.getByText("paypal", { exact: true })).toBeVisible();
    await expect(page.getByText("NGN 412,000", { exact: true })).toBeVisible();
    await expect(page.getByText("12 Admiralty Way, Lekki Phase 1, Lagos")).toBeVisible();
    await expect(page.getByText("Lunar Utility Jacket")).toBeVisible();
    await expect(page.getByText("Black / L")).toBeVisible();
    await expect(page.getByText("Varsity Crest Cap")).toBeVisible();
    await expect(page.getByLabel("Fulfillment note")).toHaveValue("Awaiting final pack confirmation.");
    await expect(page.getByLabel("Internal note")).toHaveValue("VIP customer. Confirm garment bag.");
  });

  test("staff can update an order and hand off into the linked customer record", async ({
    page,
  }) => {
    await openOrder(page, "SOH-2040");

    await page.getByLabel("Fulfillment status").selectOption("paid");
    await page.getByLabel("Internal note").fill("Capture confirmed by finance. Release to fulfillment.");
    await page.getByRole("button", { name: "Save order updates" }).click();
    await expect(page.getByText("Order updates saved.")).toBeVisible();

    await page.getByRole("link", { name: "Back to orders" }).click();
    await expect(page).toHaveURL("/orders");
    await expect(orderCard(page, "SOH-2040").getByText("paid", { exact: true })).toBeVisible();

    await orderCard(page, "SOH-2040").getByRole("link", { name: "Open order" }).click();
    await expect(page.getByLabel("Internal note")).toHaveValue(
      "Capture confirmed by finance. Release to fulfillment.",
    );

    await page.getByRole("link", { name: "Open customer" }).click();
    await expect(page).toHaveURL(/\/customers\/.+/);
    await expect(page.getByRole("heading", { name: "Tomi Alade" })).toBeVisible();
    await expect(page.getByText("SOH-2040")).toBeVisible();
  });

  test("order updates persist after a reload opened by direct URL", async ({ page }) => {
    await openOrder(page, "SOH-2041");
    const orderUrl = page.url();

    await page.getByLabel("Fulfillment status").selectOption("ready_to_fulfill");
    await page.getByLabel("Fulfillment note").fill("Packed, sealed, and transferred to courier staging.");
    await page.getByRole("button", { name: "Save order updates" }).click();
    await expect(page.getByText("Order updates saved.")).toBeVisible();

    // A direct load must fill the form from the loaded order, not blank fields.
    await page.goto(orderUrl);
    await expect(page.getByLabel("Fulfillment status")).toHaveValue("ready_to_fulfill");
    await expect(page.getByLabel("Fulfillment note")).toHaveValue(
      "Packed, sealed, and transferred to courier staging.",
    );
    await expect(page.getByText("12 Admiralty Way, Lekki Phase 1, Lagos")).toBeVisible();
  });

  test("missing order routes resolve to the order-state fallback", async ({ page }) => {
    await page.goto("/orders/00000000-0000-0000-0000-000000000000");

    await expect(page.getByText("This order record is missing")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to orders" })).toBeVisible();
  });

  test("content module renders only homepage hero and featured product controls", async ({ page }) => {
    await page.goto("/content");

    await expect(page.getByRole("heading", { name: "Manage homepage media and featured products." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open homepage desk" })).toBeVisible();
    await expect(page.getByText("Stories index and story detail pages")).toHaveCount(0);
  });

  test("homepage content editor limits editing to hero media and featured products", async ({
    page,
  }) => {
    await page.goto("/content/homepage");

    await expect(page.getByRole("heading", { name: "Homepage hero media." })).toBeVisible();
    await expect(page.getByLabel("homepage headline")).toHaveCount(0);
    await expect(page.getByLabel("featured_drop CTA label")).toHaveCount(0);
    await expect(page.getByLabel("homepage media URL")).toBeVisible();
  });

  test("stories route explains that story editing is not available in dashboard", async ({ page }) => {
    await page.goto("/content/stories");

    await expect(
      page.getByRole("heading", { name: "Story editing is not available in the dashboard." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to homepage desk" })).toBeVisible();
  });

  test("returns module renders the live queue", async ({ page }) => {
    await page.goto("/returns");

    await expect(page.getByRole("heading", { name: "Process customer requests with a clear queue." })).toBeVisible();
    await expect(returnCard(page, "Damaged on arrival")).toBeVisible();
    await expect(returnCard(page, "Fit exchange")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open return" }).first()).toBeVisible();
  });

  test("returns module supports search and lifecycle filtering", async ({ page }) => {
    await page.goto("/returns");
    await expect(returnCard(page, "Fit exchange")).toBeVisible();

    await page.getByLabel("Search returns").fill("Kemi");
    await expect(returnCard(page, "Fit exchange")).toBeVisible();
    await expect(returnCard(page, "Damaged on arrival")).toHaveCount(0);

    await page.getByLabel("Search returns").fill("");
    await page.getByLabel("Return status filter").selectOption("approved");
    await expect(returnCard(page, "Fit exchange")).toBeVisible();
    await expect(returnCard(page, "Damaged on arrival")).toHaveCount(0);
  });

  test("staff can update a return and hand off into the linked customer record", async ({ page }) => {
    await openReturn(page, "Wrong colour");

    await expect(page.getByText("Ada Nwosu")).toBeVisible();
    await page.getByLabel("Return status").selectOption("in_review");
    await page.getByLabel("Internal decision").fill("Checking stock for a colour swap.");
    await page.getByRole("button", { name: "Save return updates" }).click();
    await expect(page.getByText("Return updates saved.")).toBeVisible();

    const returnUrl = page.url();
    await page.goto(returnUrl);
    await expect(page.getByLabel("Return status")).toHaveValue("in_review");
    await expect(page.getByLabel("Internal decision")).toHaveValue("Checking stock for a colour swap.");

    await page.getByRole("link", { name: "Open customer" }).click();
    await expect(page.getByRole("heading", { name: "Ada Nwosu" })).toBeVisible();
  });

  test("missing return routes resolve to the return-state fallback", async ({ page }) => {
    await page.goto("/returns/00000000-0000-0000-0000-000000000000");

    await expect(page.getByText("This return record is missing")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to returns" })).toBeVisible();
  });

  test("customers module lists customers with server-side counts", async ({ page }) => {
    await page.goto("/customers");

    const ada = page.locator("article").filter({ hasText: "ada@example.com" });
    await expect(ada).toBeVisible();
    await expect(page.getByText(/Page 1 of 1 · 3 customers/)).toBeVisible();
  });

  test("customers module searches and filters on the server", async ({ page }) => {
    await page.goto("/customers");
    await expect(page.getByText("Ada Nwosu")).toBeVisible();

    await page.getByLabel("Search customers").fill("tomi");
    await expect(page.getByText("Tomi Alade")).toBeVisible();
    await expect(page.getByText("Ada Nwosu")).toHaveCount(0);

    await page.getByLabel("Search customers").fill("");
    await page.getByLabel("Filter by region").selectOption("US");
    await expect(page.getByText("Kemi Adeyemi")).toBeVisible();
    await expect(page.getByText("Tomi Alade")).toHaveCount(0);
  });

  test("customer detail links orders and returns back into the dashboard", async ({ page }) => {
    await page.goto("/customers");
    await page
      .locator("article")
      .filter({ hasText: "kemi@example.com" })
      .getByRole("link", { name: "Open customer" })
      .click();

    await expect(page.getByRole("heading", { name: "Kemi Adeyemi" })).toBeVisible();
    await expect(page.getByText("SOH-2032")).toBeVisible();

    await page.getByRole("link", { name: "Open order" }).first().click();
    await expect(page.getByRole("heading", { name: "Order SOH-2032" })).toBeVisible();
  });

  test("settings module renders grouped operational settings", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "Settings groups" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save settings" })).toBeVisible();
  });

  test("unknown dashboard routes show the app not-found state", async ({ page }) => {
    await page.goto("/missing-route");

    await expect(page.getByText("This route is not part of the control map")).toBeVisible();
  });
});
