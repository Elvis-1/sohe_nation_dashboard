import { expect, test } from "@playwright/test";

import { STOREFRONT_API, apiOrder, signInCustomer } from "./support/storefront-customer";

test.describe("storefront account returns", () => {
  test("customers can submit a return for an eligible order", async ({ page }) => {
    await signInCustomer(page, {
      orders: [apiOrder({ id: "order-e2e-1", order_number: "SN-E2E-0001", is_return_eligible: true })],
    });
    let submitted: Record<string, unknown> | null = null;
    await page.route(`${STOREFRONT_API}/account/returns/**`, async (route) => {
      if (route.request().method() === "POST") {
        submitted = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "return-e2e-1",
            order_id: "order-e2e-1",
            status: "new",
            reason: "Wrong size delivered",
            item_summary: "Lunar Utility Jacket, size L",
            customer_note: "",
            requested_at: "2026-09-12T10:00:00Z",
          }),
        });
        return;
      }
      await route.fallback();
    });

    await page.goto("/account/returns");
    await page.getByPlaceholder("e.g. SN Command Jacket, size M").fill("Lunar Utility Jacket, size L");
    await page.getByPlaceholder("Describe why you are returning this item.").fill("Wrong size delivered");
    await page.getByRole("button", { name: "Submit Return Request" }).click();

    await expect(page.getByText("Return request submitted successfully.")).toBeVisible();
    expect(submitted).toMatchObject({
      order_id: "order-e2e-1",
      item_summary: "Lunar Utility Jacket, size L",
      reason: "Wrong size delivered",
    });
  });

  test("orders outside the return window cannot be selected", async ({ page }) => {
    await signInCustomer(page, {
      orders: [apiOrder({ is_return_eligible: false })],
    });

    await page.goto("/account/returns");

    await expect(page.getByText("None of your orders are currently eligible for a return.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit Return Request" })).toBeDisabled();
  });
});
