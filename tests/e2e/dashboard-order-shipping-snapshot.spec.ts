import { expect, test, type Page } from "@playwright/test";

const ORDER_ID = "snapshot-order-1";
const ORDER_NUMBER = "SOH-SNAPSHOT-1";
const SHIPPING_ADDRESS = "12 Admiralty Way, Lekki Phase 1, Lagos";

async function signInAsAdmin(page: Page) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("admin");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Continue to overview" }).click();
  await expect(page).toHaveURL("/");
}

test("dashboard order detail keeps shipping address snapshot stable after edits", async ({ page }) => {
  await page.route("**/api/backend/dashboard/orders**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: ORDER_ID,
            order_number: ORDER_NUMBER,
            customer_id: "customer-1",
            customer_name: "Ada Nwosu",
            customer_email: "ada@example.com",
            created_at: "2026-04-15T08:00:00Z",
            status: "ready_to_fulfill",
            payment_provider: "paypal",
            total: { amount: 414000, currency: "NGN", formatted: "NGN 414,000" },
            shipping_address: SHIPPING_ADDRESS,
            fulfillment_note: "Awaiting pack confirmation.",
            internal_note: "VIP order.",
            lines: [
              {
                id: "line-1",
                variant_id: "SN-JKT-BLK-L",
                title: "Lunar Utility Jacket",
                variant_label: "Black / L",
                quantity: 1,
                unit_price: { amount: 322000, currency: "NGN", formatted: "NGN 322,000" },
              },
            ],
          },
        ],
      }),
    });
  });

  await page.route(`**/api/backend/dashboard/orders/${ORDER_ID}**`, async (route) => {
    const method = route.request().method();
    if (method === "GET" || method === "PATCH") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: ORDER_ID,
          order_number: ORDER_NUMBER,
          customer_id: "customer-1",
          customer_name: "Ada Nwosu",
          customer_email: "ada@example.com",
          created_at: "2026-04-15T08:00:00Z",
          status: method === "PATCH" ? "ready_to_fulfill" : "ready_to_fulfill",
          payment_provider: "paypal",
          total: { amount: 414000, currency: "NGN", formatted: "NGN 414,000" },
          shipping_address: SHIPPING_ADDRESS,
          fulfillment_note: "Awaiting pack confirmation.",
          internal_note: "Snapshot integrity verification run.",
          lines: [
            {
              id: "line-1",
              variant_id: "SN-JKT-BLK-L",
              title: "Lunar Utility Jacket",
              variant_label: "Black / L",
              quantity: 1,
              unit_price: { amount: 322000, currency: "NGN", formatted: "NGN 322,000" },
            },
          ],
        }),
      });
      return;
    }

    await route.fallback();
  });

  await signInAsAdmin(page);
  await page.goto(`/orders/${ORDER_ID}`);

  const shippingAddressLocator = page
    .locator('p:has-text("Shipping address")')
    .locator("xpath=following-sibling::strong[1]");

  const snapshotAddress = (await shippingAddressLocator.innerText()).trim();
  expect(snapshotAddress.length).toBeGreaterThan(5);

  await page.getByLabel("Internal note").fill("Snapshot integrity verification run.");
  await page.getByRole("button", { name: "Save order updates" }).click();
  await expect(page.getByText("Order updates saved.")).toBeVisible();
  await expect(shippingAddressLocator).toHaveText(snapshotAddress);

  await page.goto("/orders");
  await expect(page.locator("article").filter({ hasText: ORDER_NUMBER })).toBeVisible();
  await page.goto(`/orders/${ORDER_ID}`);
  await expect(shippingAddressLocator).toHaveText(snapshotAddress);
});
