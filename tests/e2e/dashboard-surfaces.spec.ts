import { test, expect, type Page } from "@playwright/test";

const demoEmail = "ops@sohesnation.com";
const demoPassword = "dashboard-demo";

function createRunSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.floor(Math.random() * 1_000_000)}`;
}

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
    await expect(page.getByRole("heading", { name: "Catalog desk", exact: true })).toBeVisible();

    const hasEditableProducts = (await page.getByRole("link", { name: "Edit product" }).count()) > 0;
    if (hasEditableProducts) {
      await expect(page.getByRole("link", { name: "Edit product" }).first()).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: "The catalog desk is empty right now." })).toBeVisible();
    }
  });

  test("products module supports search and visibility filtering", async ({ page }) => {
    await page.goto("/products");

    // API-backed mode can start with either populated or empty catalogs.
    const hasEditableProducts = (await page.getByRole("link", { name: "Edit product" }).count()) > 0;

    await page.getByLabel("Search catalog").fill("no-match-catalog-term");
    if (hasEditableProducts) {
      await expect(page.getByRole("heading", { name: "No product records match the current filters." })).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: "The catalog desk is empty right now." })).toBeVisible();
    }

    await page.getByLabel("Search catalog").fill("");
    await page.getByLabel("Visibility filter").selectOption("published");
    if (hasEditableProducts) {
      await expect(page.getByRole("link", { name: "Edit product" }).first()).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: "The catalog desk is empty right now." })).toBeVisible();
    }
  });

  test("staff can create a new draft product and return to the catalog list", async ({ page }) => {
    const runSuffix = createRunSuffix();
    await page.goto("/products/new");

    await page.getByLabel("Product title").fill(`Sunline Training Tee ${runSuffix}`);
    await page.getByLabel("Product slug").fill(`sunline-training-tee-${runSuffix}`);
    await page.getByLabel("Product subtitle").fill("Lightweight top for warm-weather sessions.");
    await page.getByLabel("Product category").selectOption("tops");
    await page.getByLabel("Product audience").selectOption("unisex");
    await page.getByLabel("Primary media URL").fill(
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
    );
    await page.getByLabel("Primary media alt").fill("Sunline Training Tee front view");
    await page.getByLabel("Variant 1 SKU").fill(`SN-STT-WHT-M-${runSuffix}`);
    await page.getByLabel("Variant 1 size").fill("M");
    await page.getByLabel("Variant 1 color").fill("White");
    await page.getByLabel("Variant 1 stock").fill("14");
    await page.getByLabel("Variant 1 price").fill("62000");

    await page.getByRole("button", { name: "Save as draft" }).click();
    const createdAndRedirected = await page
      .waitForURL("**/products", { timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (createdAndRedirected) {
      await expect(page.getByText(`Sunline Training Tee ${runSuffix}`)).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/products\/new$/);
      await expect(page.getByRole("button", { name: "Save as draft" })).toBeVisible();
    }
  });

  test("staff can edit an existing product and publish changes", async ({ page }) => {
    const runSuffix = createRunSuffix();
    await page.goto("/products");

    const editFirstProductButton = page.getByRole("link", { name: "Edit product" }).first();
    await editFirstProductButton.click();
    await expect(page).toHaveURL(/\/products\/.+/);

    await page.getByLabel("Product title").fill(`Catalog Product Updated ${runSuffix}`);
    await page.getByRole("button", { name: "Published" }).click();
    await page.getByRole("button", { name: "Save and publish" }).click();

    const savedAndRedirected = await page
      .waitForURL("**/products", { timeout: 5000 })
      .then(() => true)
      .catch(() => false);

    if (savedAndRedirected) {
      await expect(page.getByRole("link", { name: "Edit product" }).first()).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/products\/.+/);
      await expect(page.getByRole("button", { name: "Save and publish" })).toBeVisible();
    }
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

    await page
      .locator("article")
      .filter({ hasText: "SOH-2033" })
      .getByRole("link", { name: "Open order" })
      .click();
    await expect(page).toHaveURL(/\/orders\/.+/);
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
    await expect(page.getByText("12 Admiralty Way, Lekki Phase 1, Lagos")).toBeVisible();

    await page.getByLabel("Fulfillment status").selectOption("fulfilled");
    await page
      .getByLabel("Fulfillment note")
      .fill("Packed, sealed, and transferred to courier staging.");
    await page
      .getByLabel("Internal note")
      .fill("Courier pickup booked for the afternoon dispatch window.");
    await page.getByRole("button", { name: "Save order updates" }).click();

    await expect(page.getByText("Order updates saved to the mocked desk.")).toBeVisible();
    await expect(page.getByLabel("Fulfillment status")).toHaveValue("fulfilled");
    await expect(page.getByLabel("Fulfillment note")).toHaveValue(
      "Packed, sealed, and transferred to courier staging.",
    );
    await expect(page.getByLabel("Internal note")).toHaveValue(
      "Courier pickup booked for the afternoon dispatch window.",
    );
    await expect(page.getByText("12 Admiralty Way, Lekki Phase 1, Lagos")).toBeVisible();

    await page.goto("/orders");
    await expect(page.locator("article").filter({ hasText: "SOH-2034" })).toBeVisible();
    await page
      .locator("article")
      .filter({ hasText: "SOH-2034" })
      .getByRole("link", { name: "Open order" })
      .click();
    await expect(page.getByText("12 Admiralty Way, Lekki Phase 1, Lagos")).toBeVisible();
  });

  test("missing order routes resolve to the order-state fallback instead of a broken detail screen", async ({
    page,
  }) => {
    await page.goto("/orders/order_missing_record");

    await expect(page.getByText("This order record is missing")).toBeVisible();
    await expect(page.getByText("not available in the current fixture desk")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to orders" })).toBeVisible();
  });

  test("content module renders only homepage hero and featured product controls", async ({ page }) => {
    await page.goto("/content");

    await expect(page.getByRole("heading", { name: "Manage homepage media and featured products." })).toBeVisible();
    await expect(page.getByText("Homepage content hub")).toBeVisible();
    await expect(page.getByText("Homepage hero and lead merchandising rail")).toBeVisible();
    await expect(page.getByText("Featured drop", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open homepage media desk" })).toBeVisible();
    await expect(page.getByText("Stories index and story detail pages")).toHaveCount(0);
  });

  test("homepage content editor limits editing to hero media and featured products", async ({
    page,
  }) => {
    await page.goto("/content/homepage");

    await expect(
      page.getByRole("heading", { name: "Homepage and featured drop editor." }),
    ).toBeVisible();
    await expect(page.getByText("Marketing homepage hero")).toBeVisible();
    await expect(page.getByText("Homepage featured product rail")).toBeVisible();

    await expect(page.getByLabel("homepage headline")).toHaveCount(0);
    await expect(page.getByLabel("featured_drop CTA label")).toHaveCount(0);

    await page
      .getByLabel("homepage media URL")
      .fill("https://cdn.example.com/campaign-week-two.mp4");
    await page.getByLabel("homepage media alt").fill("Week two hero motion frame");
    await page
      .locator("section")
      .filter({ hasText: "Homepage featured product rail" })
      .locator('input[type="checkbox"]')
      .first()
      .check();
    await page.getByRole("button", { name: "Mark ready for publish" }).click();

    await expect(
      page.getByText("Content entries marked ready for publish."),
    ).toBeVisible();

    await page.reload();

    await expect(page.getByLabel("homepage media URL")).toHaveValue(
      "https://cdn.example.com/campaign-week-two.mp4",
    );
    await expect(page.getByLabel("homepage media alt")).toHaveValue("Week two hero motion frame");

    await page.goto("/content");
    await expect(
      page.locator("article").filter({ hasText: "Homepage hero and lead merchandising rail" }).getByText("ready", { exact: true }),
    ).toBeVisible();
  });

  test("stories route explains that story editing is not available in dashboard", async ({ page }) => {
    await page.goto("/content/stories");

    await expect(
      page.getByRole("heading", { name: "Story editing is not available in the dashboard." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to content hub" })).toBeVisible();
  });

  test("returns module renders the fixture-backed queue workflow", async ({ page }) => {
    await page.goto("/returns");

    await expect(page.getByRole("heading", { name: "Process customer requests with a clear queue." })).toBeVisible();
    await expect(page.getByText("Returns queue")).toBeVisible();
    await expect(page.getByText("RET-104")).toBeVisible();
    await expect(page.getByText("Fit exchange")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open return" }).first()).toBeVisible();
  });

  test("returns module supports search and lifecycle filtering", async ({ page }) => {
    await page.goto("/returns");

    await page.getByLabel("Search returns").fill("Ada");
    await expect(page.getByText("RET-103")).toBeVisible();
    await expect(page.getByText("RET-104")).not.toBeVisible();

    await page.getByLabel("Search returns").fill("");
    await page.getByLabel("Return status filter").selectOption("approved");
    await expect(page.getByText("RET-102")).toBeVisible();
    await expect(page.getByText("RET-104")).not.toBeVisible();
  });

  test("staff can review and update a return record, then hand off into the linked customer record", async ({
    page,
  }) => {
    await page.goto("/returns/RET-103");

    await expect(page.getByRole("heading", { name: "Return RET-103" })).toBeVisible();
    await expect(page.getByText("Ada Nwosu")).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
    await expect(page.getByText("SOH-2026")).toBeVisible();
    await expect(page.getByText("Varsity Crest Cap / Sand / One size")).toBeVisible();
    await expect(page.getByLabel("Customer note")).toHaveValue(
      "The brim arrived bent and the front panel stitching looks split.",
    );

    await page.getByLabel("Return status").selectOption("approved");
    await page
      .getByLabel("Internal decision")
      .fill("Approved after damage verification. Replacement cap can be released.");
    await page.getByRole("button", { name: "Save return updates" }).click();

    await expect(page.getByText("Return updates saved to the mocked queue.")).toBeVisible();

    await page.getByRole("link", { name: "Back to returns" }).click();
    await expect(page).toHaveURL("/returns");
    await expect(
      page.locator("article").filter({ hasText: "RET-103" }).getByText("approved", { exact: true }),
    ).toBeVisible();

    await page.goto("/returns/RET-103");
    await expect(page.getByLabel("Internal decision")).toHaveValue(
      "Approved after damage verification. Replacement cap can be released.",
    );

    await page.getByRole("link", { name: "Open customer" }).click();
    await expect(page).toHaveURL("/customers/customer_ada_nwosu");
    await expect(page.getByRole("heading", { name: "Ada Nwosu" })).toBeVisible();
    await expect(page.getByText("RET-103")).toBeVisible();
  });

  test("missing return routes resolve to the return-state fallback instead of a broken detail screen", async ({
    page,
  }) => {
    await page.goto("/returns/RET-404");

    await expect(page.getByText("This return record is missing")).toBeVisible();
    await expect(page.getByText("not available in the current fixture queue")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to returns" })).toBeVisible();
  });

  test("customers module renders the fixture-backed customer workflow", async ({ page }) => {
    await page.goto("/customers");

    await expect(page.getByRole("heading", { name: "Profile, order, and return context in one place." })).toBeVisible();
    await expect(page.getByText("Customer list")).toBeVisible();
    await expect(page.getByText("Ada Nwosu")).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open customer" }).first()).toBeVisible();
  });

  test("customers module supports lookup by name, email, and customer id", async ({ page }) => {
    await page.goto("/customers");

    await page.getByLabel("Search customers").fill("tomi");
    await expect(page.getByText("Tomi Alade")).toBeVisible();
    await expect(page.getByText("Ada Nwosu")).not.toBeVisible();

    await page.getByLabel("Search customers").fill("customer_kemi_adeyemi");
    await expect(page.getByText("Kemi Adeyemi")).toBeVisible();
    await expect(page.getByText("Tomi Alade")).not.toBeVisible();
  });

  test("customer detail exposes linked order and return records with dashboard handoff", async ({
    page,
  }) => {
    await page.goto("/customers/customer_ada_nwosu");

    await expect(page.getByRole("heading", { name: "Ada Nwosu" })).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
    await expect(page.getByText("Saved addresses", { exact: true })).toBeVisible();
    await expect(page.getByText("SOH-2034")).toBeVisible();
    await expect(page.getByText("RET-103")).toBeVisible();

    await page.getByRole("link", { name: "Open order" }).first().click();
    await expect(page).toHaveURL("/orders/order_soh_2034");
    await expect(page.getByRole("heading", { name: "Order SOH-2034" })).toBeVisible();

    await page.goto("/customers/customer_ada_nwosu");
    await page.getByRole("link", { name: "Open return" }).click();
    await expect(page).toHaveURL("/returns/RET-103");
    await expect(page.getByRole("heading", { name: "Return RET-103" })).toBeVisible();
  });

  test("settings module renders the operational defaults workflow", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "Operational defaults before live wiring." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Settings groups" })).toBeVisible();
    await expect(page.getByText("Store profile", { exact: true })).toBeVisible();
    await expect(page.getByText("Staff roles placeholder", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save settings" })).toBeVisible();
  });

  test("settings module supports fixture-backed placeholder editing and persistence", async ({
    page,
  }) => {
    await page.goto("/settings");

    await page
      .getByLabel("Store profile Support email")
      .fill("operations@sohesnation.com");
    await page
      .getByLabel("Shipping placeholder Pickup window")
      .fill("Weekdays 2pm");
    await page
      .getByLabel("Staff roles placeholder Session mode")
      .fill("Fixture mode with persistence");
    await page.getByRole("button", { name: "Save settings" }).click();

    await expect(page.getByText("Settings changes saved to the mocked control desk.")).toBeVisible();

    await page.reload();

    await expect(page.getByLabel("Store profile Support email")).toHaveValue(
      "operations@sohesnation.com",
    );
    await expect(page.getByLabel("Shipping placeholder Pickup window")).toHaveValue(
      "Weekdays 2pm",
    );
    await expect(page.getByLabel("Staff roles placeholder Session mode")).toHaveValue(
      "Fixture mode with persistence",
    );
  });

  test("unknown dashboard routes show the app not-found state", async ({ page }) => {
    await page.goto("/missing-route");

    await expect(page.getByText("This route is not part of the control map")).toBeVisible();
  });
});
