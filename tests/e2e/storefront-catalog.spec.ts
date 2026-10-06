import { expect, test } from "@playwright/test";

import { STOREFRONT_API, money } from "./support/storefront-customer";

// Catalog and PDP are server-rendered from the seeded e2e API (api seed_e2e).

test.describe("storefront catalog and product detail", () => {
  test("catalog lists published products and hides drafts", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByText("Lunar Utility Jacket").first()).toBeVisible();
    await expect(page.getByText("Rally Knit Set").first()).toBeVisible();
    await expect(page.getByText("Varsity Crest Cap").first()).toBeVisible();
    await expect(page.getByText("Night Shift Cargo")).toHaveCount(0);
  });

  test("product detail shows the live product and adds it to the bag", async ({ page }) => {
    await page.route(`${STOREFRONT_API}/checkout/quote/`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          currency: "NGN",
          lines: [],
          summary: { subtotal: money(185000), shipping: money(0), discount: money(0), total: money(185000) },
        }),
      }),
    );

    await page.goto("/products");
    await page.locator('a[href="/products/lunar-utility-jacket"]').first().click();
    await expect(page).toHaveURL("/products/lunar-utility-jacket");

    await expect(page.getByRole("heading", { name: "Lunar Utility Jacket", level: 1 })).toBeVisible();
    await expect(page.getByText("Lunar Utility Jacket campaign note.")).toBeVisible();

    await page.getByRole("button", { name: "Add To Bag" }).click();
    await expect(page.getByText("Added to bag.")).toBeVisible();

    await page.getByRole("link", { name: "View Bag" }).click();
    await expect(page).toHaveURL("/bag");
    await expect(page.getByText("Lunar Utility Jacket").first()).toBeVisible();
  });

  test("unknown product slugs show the not-found state", async ({ page }) => {
    const response = await page.goto("/products/not-a-real-product");

    // No loading boundary wraps the product page, so the status is a real 404 (Slice 13C).
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Route off-grid" })).toBeVisible();
  });
});
