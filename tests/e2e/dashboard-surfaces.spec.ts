import { test, expect, type Page } from "@playwright/test";

const demoEmail = "ops@sohesnation.com";
const demoPassword = "dashboard-demo";

async function signIn(page: Page) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(demoEmail);
  await page.getByLabel("Password").fill(demoPassword);
  await page.getByRole("button", { name: "Continue to overview" }).click();
  await expect(page).toHaveURL("/");
}

test.describe("dashboard implemented surfaces", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
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

  test("overview shows the planned operational summary blocks", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Daily operations at a glance." })).toBeVisible();
    await expect(page.getByText("Orders today", { exact: true })).toBeVisible();
    await expect(page.getByText("Revenue staged", { exact: true })).toBeVisible();
    await expect(page.getByText("Low stock", { exact: true })).toBeVisible();
    await expect(page.getByText("Returns awaiting review", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent orders" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Low stock watch" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Returns pending", exact: true })).toBeVisible();
  });

  test("overview quick actions and module cards lead to live module routes without dead ends", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Open module" }).first().click();
    await expect(page).toHaveURL("/returns");
    await expect(page.getByRole("heading", { name: "Process customer requests with a clear queue." })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Review orders" }).click();
    await expect(page).toHaveURL("/orders");
    await expect(page.getByRole("heading", { name: "Track every purchase handoff." })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Open products" }).click();
    await expect(page).toHaveURL("/products");
    await expect(page.getByRole("heading", { name: "Catalog control for discovery and PDP." })).toBeVisible();
  });

  test("products module renders the fixture-backed catalog scaffold", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByRole("heading", { name: "Catalog control for discovery and PDP." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Catalog desk" })).toBeVisible();
    await expect(page.getByText("Lunar Utility Jacket")).toBeVisible();
    await expect(page.getByText("Varsity Crest Cap")).toBeVisible();
  });

  test("products module supports search and visibility filtering", async ({ page }) => {
    await page.goto("/products");

    await page.getByLabel("Search catalog").fill("Rally");
    await expect(page.getByText("Rally Knit Set")).toBeVisible();
    await expect(page.getByText("Lunar Utility Jacket")).not.toBeVisible();

    await page.getByLabel("Search catalog").fill("");
    await page.getByLabel("Visibility filter").selectOption("draft");
    await expect(page.getByText("Rally Knit Set")).toBeVisible();
    await expect(page.getByText("Varsity Crest Cap")).not.toBeVisible();
  });

  test("staff can create a new draft product and return to the catalog list", async ({ page }) => {
    await page.goto("/products/new");

    await page.getByLabel("Product title").fill("Sunline Training Tee");
    await page.getByLabel("Product slug").fill("sunline-training-tee");
    await page.getByLabel("Product subtitle").fill("Lightweight top for warm-weather sessions.");
    await page.getByLabel("Product category").selectOption("tops");
    await page.getByLabel("Product audience").selectOption("unisex");
    await page.getByLabel("Product price").fill("62000");
    await page.getByLabel("Product stock").fill("14");
    await page.getByLabel("Primary media URL").fill("/fixtures/products/sunline-training-tee.jpg");
    await page.getByLabel("Primary media alt").fill("Sunline Training Tee front view");
    await page.getByLabel("Variant 1 SKU").fill("SN-STT-WHT-M");
    await page.getByLabel("Variant 1 size").fill("M");
    await page.getByLabel("Variant 1 color").fill("White");
    await page.getByLabel("Variant 1 stock").fill("14");

    await page.getByRole("button", { name: "Save as draft" }).click();

    await expect(page).toHaveURL("/products");
    await expect(page.getByText("Sunline Training Tee")).toBeVisible();
  });

  test("staff can edit an existing product and publish changes", async ({ page }) => {
    await page.goto("/products/prod_rally_knit_set");

    await page.getByLabel("Product title").fill("Rally Knit Set Updated");
    await page.getByRole("button", { name: "Published" }).click();
    await page.getByRole("button", { name: "Save and publish" }).click();

    await expect(page).toHaveURL("/products");
    const updatedCard = page.locator("article").filter({ hasText: "Rally Knit Set Updated" });

    await expect(updatedCard).toBeVisible();
    await expect(updatedCard.getByText("published", { exact: true })).toBeVisible();
  });

  test("orders module renders the fixture-backed order workflow", async ({ page }) => {
    await page.goto("/orders");

    const primaryOrderCard = page.locator("article").filter({ hasText: "SOH-2034" });

    await expect(page.getByRole("heading", { name: "Track every purchase handoff." })).toBeVisible();
    await expect(page.getByText("Orders in motion")).toBeVisible();
    await expect(page.getByText("SOH-2034")).toBeVisible();
    await expect(primaryOrderCard.getByText("ready to fulfill", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open order" }).first()).toBeVisible();
  });

  test("orders module supports search, status, date, and payment filtering", async ({ page }) => {
    await page.goto("/orders");

    await page.getByLabel("Search orders").fill("Tomi");
    await expect(page.getByText("SOH-2033")).toBeVisible();
    await expect(page.getByText("SOH-2034")).not.toBeVisible();

    await page.getByLabel("Search orders").fill("");
    await page.getByLabel("Status filter").selectOption("delivered");
    await expect(page.getByText("SOH-2032")).toBeVisible();
    await expect(page.getByText("SOH-2034")).not.toBeVisible();

    await page.getByLabel("Status filter").selectOption("all");
    await page.getByLabel("Placed on filter").fill("2026-04-15");
    await expect(page.getByText("SOH-2034")).toBeVisible();
    await expect(page.getByText("SOH-2033")).toBeVisible();
    await expect(page.getByText("SOH-2032")).not.toBeVisible();

    await page.getByLabel("Placed on filter").fill("");
    await page.getByLabel("Payment filter").selectOption("flutterwave");
    await expect(page.getByText("SOH-2033")).toBeVisible();
    await expect(page.getByText("SOH-2034")).not.toBeVisible();
  });

  test("order detail exposes the core phase 4 review fields for staff", async ({ page }) => {
    await page.goto("/orders/order_soh_2034");

    await expect(page.getByRole("heading", { name: "Order SOH-2034" })).toBeVisible();
    await expect(page.getByText("Ada Nwosu")).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
    await expect(page.getByText("2026-04-15", { exact: true })).toBeVisible();
    await expect(page.getByText("paypal", { exact: true })).toBeVisible();
    await expect(page.getByText("NGN 414,000", { exact: true })).toBeVisible();
    await expect(page.getByText("12 Admiralty Way, Lekki Phase 1, Lagos")).toBeVisible();
    await expect(page.getByText("Lunar Utility Jacket")).toBeVisible();
    await expect(page.getByText("Black / L")).toBeVisible();
    await expect(page.getByText("Varsity Crest Cap")).toBeVisible();
    await expect(page.getByLabel("Fulfillment note")).toHaveValue(
      "Awaiting final pack confirmation before courier handoff.",
    );
    await expect(page.getByLabel("Internal note")).toHaveValue(
      "VIP customer. Confirm jacket garment bag before dispatch.",
    );
  });

  test("staff can update an order and hand off into the linked customer record", async ({
    page,
  }) => {
    await page.goto("/orders/order_soh_2033");

    await expect(page.getByRole("heading", { name: "Order SOH-2033" })).toBeVisible();
    await expect(page.getByText("4 Raymond Njoku Street, Ikoyi, Lagos")).toBeVisible();
    await expect(page.getByText("Rally Knit Set")).toBeVisible();

    await page.getByLabel("Fulfillment status").selectOption("paid");
    await page
      .getByLabel("Internal note")
      .fill("Capture confirmed by finance. Release to fulfillment.");
    await page.getByRole("button", { name: "Save order updates" }).click();

    await expect(page.getByText("Order updates saved to the mocked desk.")).toBeVisible();

    await page.getByRole("link", { name: "Back to orders" }).click();
    await expect(page).toHaveURL("/orders");
    await expect(
      page.locator("article").filter({ hasText: "SOH-2033" }).getByText("paid", { exact: true }),
    ).toBeVisible();

    await page.goto("/orders/order_soh_2033");
    await expect(page.getByLabel("Internal note")).toHaveValue(
      "Capture confirmed by finance. Release to fulfillment.",
    );

    await page.getByRole("link", { name: "Open customer" }).click();
    await expect(page).toHaveURL("/customers/customer_tomi_alade");
    await expect(page.getByRole("heading", { name: "Tomi Alade" })).toBeVisible();
    await expect(page.getByText("SOH-2033")).toBeVisible();
  });

  test("order updates persist after reload and remain visible in the orders desk", async ({
    page,
  }) => {
    await page.goto("/orders/order_soh_2034");

    await page.getByLabel("Fulfillment status").selectOption("fulfilled");
    await page
      .getByLabel("Fulfillment note")
      .fill("Packed, sealed, and transferred to courier staging.");
    await page
      .getByLabel("Internal note")
      .fill("Courier pickup booked for the afternoon dispatch window.");
    await page.getByRole("button", { name: "Save order updates" }).click();

    await expect(page.getByText("Order updates saved to the mocked desk.")).toBeVisible();

    await page.reload();

    await expect(page.getByLabel("Fulfillment status")).toHaveValue("fulfilled");
    await expect(page.getByLabel("Fulfillment note")).toHaveValue(
      "Packed, sealed, and transferred to courier staging.",
    );
    await expect(page.getByLabel("Internal note")).toHaveValue(
      "Courier pickup booked for the afternoon dispatch window.",
    );

    await page.goto("/orders");
    await expect(
      page.locator("article").filter({ hasText: "SOH-2034" }).getByText("fulfilled", { exact: true }),
    ).toBeVisible();
  });

  test("missing order routes resolve to the order-state fallback instead of a broken detail screen", async ({
    page,
  }) => {
    await page.goto("/orders/order_missing_record");

    await expect(page.getByText("This order record is missing")).toBeVisible();
    await expect(page.getByText("not available in the current fixture desk")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to orders" })).toBeVisible();
  });

  test("content module renders the phase 5 content hub with area selection", async ({ page }) => {
    await page.goto("/content");

    await expect(page.getByRole("heading", { name: "Manage campaign and editorial surfaces." })).toBeVisible();
    await expect(page.getByText("Content hub")).toBeVisible();
    await expect(page.getByText("Homepage hero and lead merchandising rail")).toBeVisible();
    await expect(page.getByText("Featured drop", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open homepage editor" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open stories editor" })).toBeVisible();
  });

  test("homepage content editor supports fixture-backed editing and ready-state updates", async ({
    page,
  }) => {
    await page.goto("/content/homepage");

    await expect(
      page.getByRole("heading", { name: "Homepage and featured drop editor." }),
    ).toBeVisible();
    await expect(page.getByText("Area: homepage")).toBeVisible();
    await expect(page.getByText("Area: featured drop")).toBeVisible();

    await page.getByLabel("homepage headline").fill("Campaign Reset For Week Two");
    await page
      .getByLabel("homepage body")
      .fill("Updated homepage direction for the second campaign week and product push.");
    await page
      .getByLabel("homepage preview bullets")
      .fill("Hero reset, Product rail, CTA refresh");
    await page.getByLabel("featured_drop CTA label").fill("Shop Featured Pieces");
    await page.getByRole("button", { name: "Mark ready for publish" }).click();

    await expect(
      page.getByText("Content entries marked ready for publish in the mocked content desk."),
    ).toBeVisible();

    await page.reload();

    await expect(page.getByLabel("homepage headline")).toHaveValue("Campaign Reset For Week Two");
    await expect(page.getByLabel("homepage body")).toHaveValue(
      "Updated homepage direction for the second campaign week and product push.",
    );
    await expect(page.getByLabel("homepage preview bullets")).toHaveValue(
      "Hero reset, Product rail, CTA refresh",
    );
    await expect(page.getByLabel("featured_drop CTA label")).toHaveValue("Shop Featured Pieces");

    await page.goto("/content");
    await expect(
      page.locator("article").filter({ hasText: "Homepage hero and lead merchandising rail" }).getByText("ready", { exact: true }),
    ).toBeVisible();
  });

  test("stories editor supports lookbook and navigation promo updates from the content hub flow", async ({
    page,
  }) => {
    await page.goto("/content");

    await page
      .locator("article")
      .filter({ hasText: "Navigation promo slots and footer messaging" })
      .getByRole("link", { name: "Edit area" })
      .click();

    await expect(page).toHaveURL(/\/content\/stories/);
    await expect(page.getByRole("heading", { name: "Stories and navigation editor." })).toBeVisible();

    await page.getByLabel("stories CTA label").fill("Read The Updated Story");
    await page.getByLabel("navigation_promos headline").fill("Campaign support across nav");
    await page
      .getByLabel("navigation_promos summary")
      .fill("Navigation and footer promo messaging for the active release.");
    await page.getByRole("button", { name: "Save as draft" }).click();

    await expect(page.getByText("Content entries saved as draft in the mocked content desk.")).toBeVisible();

    await page.reload();

    await expect(page.getByLabel("stories CTA label")).toHaveValue("Read The Updated Story");
    await expect(page.getByLabel("navigation_promos headline")).toHaveValue(
      "Campaign support across nav",
    );
    await expect(page.getByLabel("navigation_promos summary")).toHaveValue(
      "Navigation and footer promo messaging for the active release.",
    );
  });

  test("returns module renders the fixture-backed queue scaffold", async ({ page }) => {
    await page.goto("/returns");

    await expect(page.getByRole("heading", { name: "Process customer requests with a clear queue." })).toBeVisible();
    await expect(page.getByText("Returns queue")).toBeVisible();
    await expect(page.getByText("RET-104")).toBeVisible();
    await expect(page.getByText("Fit exchange")).toBeVisible();
  });

  test("customers module renders the fixture-backed customer scaffold", async ({ page }) => {
    await page.goto("/customers");

    await expect(page.getByRole("heading", { name: "Profile, order, and return context in one place." })).toBeVisible();
    await expect(page.getByText("Customer list")).toBeVisible();
    await expect(page.getByText("Ada Nwosu")).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
  });

  test("settings module renders the operational placeholder scaffold", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "Operational defaults before live wiring." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Settings groups" })).toBeVisible();
    await expect(page.getByText("Store profile", { exact: true })).toBeVisible();
    await expect(page.getByText("Staff roles placeholder", { exact: true })).toBeVisible();
  });

  test("unknown dashboard routes show the app not-found state", async ({ page }) => {
    await page.goto("/missing-route");

    await expect(page.getByText("This route is not part of the control map")).toBeVisible();
  });
});
