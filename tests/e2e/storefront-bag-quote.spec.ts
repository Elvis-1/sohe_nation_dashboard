import { expect, test, type Page } from "@playwright/test";

const CART_KEY = "sohe-storefront-cart";
// Glob so route mocks match whichever API host the storefront env points at.
const API_BASE = "**/api/v1";

const money = (amount: number) => ({
  amount,
  currency: "NGN",
  formatted: `NGN ${amount.toLocaleString("en-NG")}`,
});

async function seedCart(page: Page) {
  await page.addInitScript((cartKey) => {
    window.localStorage.setItem(
      cartKey,
      JSON.stringify([
        {
          productId: "11111111-1111-1111-1111-111111111111",
          variantId: "22222222-2222-2222-2222-222222222222",
          quantity: 1,
          title: "Command Jacket",
          variantLabel: "Black / L",
          // Stale client snapshot: the server quote must win.
          unitPriceAmount: 1000,
          unitPriceCurrency: "NGN",
          unitPriceFormatted: "NGN 1,000",
          unitShippingAmount: 0,
          unitShippingCurrency: "NGN",
          unitShippingFormatted: "NGN 0",
        },
      ]),
    );
  }, CART_KEY);
}

test.describe("storefront bag server pricing", () => {
  test("bag shows server-quoted prices instead of the client estimate", async ({ page }) => {
    await seedCart(page);
    await page.route(`${API_BASE}/checkout/quote/`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          currency: "NGN",
          lines: [
            {
              product_id: "11111111-1111-1111-1111-111111111111",
              variant_id: "22222222-2222-2222-2222-222222222222",
              title: "Command Jacket",
              variant_label: "Black / L",
              quantity: 1,
              unit_price: money(185000),
              line_total: money(185000),
            },
          ],
          summary: {
            subtotal: money(185000),
            shipping: money(5000),
            discount: money(0),
            total: money(190000),
          },
        }),
      });
    });

    await page.goto("/bag");

    await expect(page.getByText("Confirmed against current prices and stock.")).toBeVisible();
    await expect(page.getByText("Unit price NGN 185,000")).toBeVisible();
    await expect(page.getByText("NGN 190,000").first()).toBeVisible();
    await expect(page.getByText("NGN 1,000")).toHaveCount(0);
  });

  test("bag surfaces server stock errors", async ({ page }) => {
    await seedCart(page);
    await page.route(`${API_BASE}/checkout/quote/`, async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "checkout_out_of_stock",
            message: "Only 0 left of Command Jacket (Black / L).",
          },
        }),
      });
    });

    await page.goto("/bag");

    await expect(page.getByText("Only 0 left of Command Jacket (Black / L).")).toBeVisible();
  });
});
