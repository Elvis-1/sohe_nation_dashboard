import { expect, test, type Page } from "@playwright/test";

// Slice 14E: each product's return rule on the product page (seeded e2e API: jacket standard,
// knit final sale, cap 30-day custom; final sale applies in every region by default), and on
// bag and checkout lines from the server quote.

const CART_KEY = "sohe-storefront-cart";
const API_BASE = "**/api/v1";
const money = (amount: number) => ({ amount, currency: "NGN", formatted: `NGN ${amount.toLocaleString("en-NG")}` });

const LINES = [
  { product_id: "p-knit", variant_id: "v-knit", title: "Rally Knit Set", variant_label: "Ash / S", return_policy: "final_sale", return_window_days: null },
  { product_id: "p-cap", variant_id: "v-cap", title: "Varsity Crest Cap", variant_label: "Sand / One size", return_policy: "custom", return_window_days: 30 },
];

async function seedBagWithQuote(page: Page) {
  await page.addInitScript(
    ([cartKey, lines]) => {
      window.localStorage.setItem(
        cartKey,
        JSON.stringify(
          lines.map((line) => ({
            productId: line.product_id,
            variantId: line.variant_id,
            quantity: 1,
            title: line.title,
            variantLabel: line.variant_label,
            unitPriceAmount: 1000,
            unitPriceCurrency: "NGN",
            unitPriceFormatted: "NGN 1,000",
            unitShippingAmount: 0,
            unitShippingCurrency: "NGN",
            unitShippingFormatted: "NGN 0",
          })),
        ),
      );
    },
    [CART_KEY, LINES] as const,
  );
  await page.route(`${API_BASE}/checkout/quote/`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        currency: "NGN",
        lines: LINES.map((line) => ({ ...line, quantity: 1, unit_price: money(50000), line_total: money(50000) })),
        summary: { subtotal: money(100000), shipping: money(0), discount: money(0), total: money(100000) },
      }),
    }),
  );
}

test.describe("return rule notices", () => {
  test("product pages show the product's return rule", async ({ page }) => {
    await page.goto("/products/rally-knit-set");
    await expect(page.getByText("Final sale: returnable only if faulty.")).toBeVisible();

    await page.goto("/products/varsity-crest-cap");
    await expect(page.getByText("Returnable within 30 days of delivery.")).toBeVisible();

    await page.goto("/products/lunar-utility-jacket");
    await expect(page.getByText("Returnable within 14 days of delivery.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Returns policy" })).toHaveAttribute("href", "/returns");
  });

  test("bag lines show each item's return rule", async ({ page }) => {
    await seedBagWithQuote(page);
    await page.goto("/bag");
    await expect(page.locator("[data-return-notice=final-sale]")).toHaveText("Final sale: returnable only if faulty.");
    await expect(page.getByText("Returnable within 30 days of delivery.")).toBeVisible();
  });

  test("checkout lines show each item's return rule", async ({ page }) => {
    await seedBagWithQuote(page);
    await page.goto("/checkout");
    await expect(page.getByText("Final sale: returnable only if faulty.")).toBeVisible();
    await expect(page.getByText("Returnable within 30 days of delivery.")).toBeVisible();
  });
});
