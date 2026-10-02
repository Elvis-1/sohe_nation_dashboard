import { expect, test } from "@playwright/test";

import { STOREFRONT_API, money } from "./support/storefront-customer";

// Slice 13G: hero media loading and customer-facing copy.

test.describe("hero media", () => {
  test("the hero still loads first and the video carries no duplicate poster", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section").first();
    const still = hero.locator("img").first();
    await expect(still).toHaveAttribute("fetchpriority", "high");
    await expect(still).toHaveAttribute("src", /\/_next\/image\?url=/);

    const video = hero.locator("video");
    if (await video.count()) {
      await expect(video).not.toHaveAttribute("poster", /.+/);
      await expect(video).toHaveAttribute("preload", "metadata");
    }
  });

  test("with reduced motion the video is hidden and the still remains", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const hero = page.locator("section").first();
    await expect(hero.locator("img").first()).toBeVisible();
    if (await hero.locator("video").count()) {
      await expect(hero.locator("video")).toBeHidden();
    }
    await context.close();
  });
});

// Words that described the build, not the shop, and must never reach customers again.
const DEVELOPER_WORDING = /fixture|backend|\bmock|\bAPI\b|session-based|handoff|staged flow|customer surface|workspace|simulate/i;

test.describe("customer-facing copy", () => {
  test("shopping and account pages use customer language", async ({ page }) => {
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

    for (const path of ["/bag", "/checkout", "/account", "/account/orders", "/account/returns", "/account/addresses"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const text = await page.locator("main").innerText();
      expect(text, path).not.toMatch(DEVELOPER_WORDING);
    }

    await page.evaluate(() => {
      window.localStorage.setItem(
        "sohe-storefront-cart",
        JSON.stringify([
          {
            productId: "p",
            variantId: "v",
            quantity: 1,
            title: "Lunar Utility Jacket",
            variantLabel: "Black / L",
            unitPriceAmount: 185000,
            unitPriceCurrency: "NGN",
            unitPriceFormatted: "NGN 185,000",
            unitShippingAmount: 0,
            unitShippingCurrency: "NGN",
            unitShippingFormatted: "NGN 0",
          },
        ]),
      );
    });
    for (const path of ["/bag", "/checkout"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(await page.locator("main").innerText(), `${path} with a bag`).not.toMatch(DEVELOPER_WORDING);
    }
    // Both payment options stay offered.
    await expect(page.getByRole("button", { name: /PayPal/ }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Pay with Flutterwave" })).toBeVisible();
  });
});
