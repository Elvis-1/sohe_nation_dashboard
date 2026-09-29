import { expect, test } from "@playwright/test";

import { STOREFRONT_API, apiOrder, money, signInCustomer } from "./support/storefront-customer";

test.describe("storefront account orders", () => {
  test("customers can open an order from their history", async ({ page }) => {
    await signInCustomer(page, {
      orders: [
        apiOrder({ id: "order-e2e-1", order_number: "SN-E2E-0001" }),
        apiOrder({ id: "order-e2e-2", order_number: "SN-E2E-0002", status: "paid" }),
      ],
    });
    await page.route(`${STOREFRONT_API}/account/orders/order-e2e-2/`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...apiOrder({ id: "order-e2e-2", order_number: "SN-E2E-0002", status: "paid" }),
          shipping_address: "12 Admiralty Way, Lekki Phase 1, Lagos",
          lines: [
            { id: "line-1", title: "Lunar Utility Jacket", variant_label: "Black / L", quantity: 1, unit_price: money(185000) },
          ],
        }),
      }),
    );

    await page.goto("/account/orders");
    await expect(page.getByText("SN-E2E-0001").first()).toBeVisible();

    await page
      .locator("article")
      .filter({ hasText: "SN-E2E-0002" })
      .getByRole("link", { name: "View Detail" })
      .click();

    await expect(page).toHaveURL("/account/orders/order-e2e-2");
    await expect(page.getByText("12 Admiralty Way, Lekki Phase 1, Lagos")).toBeVisible();
    await expect(page.getByText("Lunar Utility Jacket")).toBeVisible();
    await expect(page.getByText("Black / L")).toBeVisible();
  });

  test("order detail shows the structured shipping snapshot", async ({ page }) => {
    await signInCustomer(page, {
      orders: [apiOrder({ id: "order-e2e-3", order_number: "SN-E2E-0003", status: "paid" })],
    });
    await page.route(`${STOREFRONT_API}/account/orders/order-e2e-3/`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...apiOrder({ id: "order-e2e-3", order_number: "SN-E2E-0003", status: "paid" }),
          shipping_address: "Ada Nwosu, +2348010000000, 12 Admiralty Way, Lagos, Lagos, NG",
          shipping_details: {
            recipient_name: "Ada Nwosu",
            phone: "+2348010000000",
            line_1: "12 Admiralty Way",
            line_2: "Flat 4",
            city: "Lagos",
            state: "Lagos",
            postal_code: "",
            country_code: "NG",
          },
          lines: [],
        }),
      }),
    );

    await page.goto("/account/orders/order-e2e-3");

    const address = page.getByText("Flat 4", { exact: false });
    await expect(address).toBeVisible();
    await expect(address).toContainText("Ada Nwosu");
    await expect(address).toContainText("12 Admiralty Way");
    await expect(address).toContainText("+2348010000000");
    // Rendered from the structured snapshot, not the comma-joined string.
    await expect(page.getByText("Ada Nwosu, +2348010000000")).toHaveCount(0);
  });
});
