import { expect, test, type Page } from "@playwright/test";

import { STOREFRONT_API, money, signInCustomer } from "./support/storefront-customer";

const SESSION_ID = "11111111-2222-3333-4444-555555555555";

async function seedBag(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "sohe-storefront-cart",
      JSON.stringify([
        {
          productId: "product-e2e",
          variantId: "variant-e2e",
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
  await page.route(`${STOREFRONT_API}/checkout/quote/`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        currency: "NGN",
        lines: [
          {
            product_id: "product-e2e",
            variant_id: "variant-e2e",
            title: "Lunar Utility Jacket",
            variant_label: "Black / L",
            quantity: 1,
            unit_price: money(185000),
            line_total: money(185000),
          },
        ],
        summary: { subtotal: money(185000), shipping: money(0), discount: money(0), total: money(185000) },
      }),
    }),
  );
}

function mockSessionStatus(page: Page, status: "authorized" | "failed", lines: unknown[] = []) {
  return page.route(`${STOREFRONT_API}/checkout/sessions/${SESSION_ID}/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: SESSION_ID,
        order_id: "order-e2e-1",
        provider: "flutterwave",
        status,
        region: "NG",
        currency: "NGN",
        approvalUrl: "",
        providerStatus: status === "authorized" ? "successful" : "failed",
        lines,
      }),
    }),
  );
}

const PAID_LINE = {
  product_id: "product-e2e",
  variant_id: "variant-e2e",
  title: "Lunar Utility Jacket",
  variant_label: "Black / L",
  quantity: 1,
  unit_price: money(185000),
};

function storedLine(variantId: string, title: string) {
  return {
    productId: `product-${variantId}`,
    variantId,
    quantity: 1,
    title,
    variantLabel: "Black / L",
    unitPriceAmount: 185000,
    unitPriceCurrency: "NGN",
    unitPriceFormatted: "NGN 185,000",
    unitShippingAmount: 0,
    unitShippingCurrency: "NGN",
    unitShippingFormatted: "NGN 0",
  };
}

/** Seeds the bag once (not on every page load, unlike seedBag). */
async function seedBagOnce(page: Page, lines: unknown[]) {
  await page.goto("/");
  await page.evaluate((value) => window.localStorage.setItem("sohe-storefront-cart", JSON.stringify(value)), lines);
  await page.reload(); // same-tab storage writes don't notify the open page
}

test.describe("bag after payment", () => {
  test("a confirmed payment removes the paid items from the bag, keeping anything else", async ({ page }) => {
    await signInCustomer(page);
    await mockSessionStatus(page, "authorized", [PAID_LINE]);
    await seedBagOnce(page, [storedLine("variant-e2e", "Lunar Utility Jacket"), storedLine("variant-other", "Varsity Crest Cap")]);
    await expect(page.getByLabel("2 items in bag").first()).toBeAttached();

    await page.goto(`/checkout/return?checkout_session_id=${SESSION_ID}`);
    await expect(page.getByRole("heading", { name: "Payment confirmed." })).toBeVisible();
    await expect(page.getByLabel("1 item in bag").first()).toBeAttached();

    await page.goto("/bag");
    await expect(page.getByRole("heading", { name: "Varsity Crest Cap" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lunar Utility Jacket" })).toHaveCount(0);
  });

  test("a failed payment keeps the bag so the customer can try again", async ({ page }) => {
    await signInCustomer(page);
    await mockSessionStatus(page, "failed", [PAID_LINE]);
    await seedBagOnce(page, [storedLine("variant-e2e", "Lunar Utility Jacket")]);

    await page.goto(`/checkout/return?checkout_session_id=${SESSION_ID}`);
    await expect(page.getByText("Payment was not completed.")).toBeVisible();
    await expect(page.getByLabel("1 item in bag").first()).toBeAttached();
  });

  test("an empty bag shows no count", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Bag" }).first()).toBeVisible();
    await expect(page.getByLabel(/in bag$/)).toHaveCount(0);
  });
});

test.describe("storefront checkout to provider and back", () => {
  test("checkout redirects to the provider and the return page confirms payment", async ({ page, baseURL }) => {
    await signInCustomer(page);
    await seedBag(page);
    await mockSessionStatus(page, "authorized");

    // The "provider" sends the customer straight back to the return URL, as Flutterwave does after payment.
    const providerReturn = `${baseURL}/checkout/return?checkout_session_id=${SESSION_ID}&transaction_id=987654&tx_ref=tx-e2e`;
    let sessionRequest: Record<string, unknown> | null = null;
    await page.route(`${STOREFRONT_API}/checkout/sessions/`, (route) => {
      sessionRequest = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: SESSION_ID,
          order_id: "order-e2e-1",
          provider: "flutterwave",
          status: "pending_redirect",
          region: "NG",
          currency: "NGN",
          approvalUrl: providerReturn,
          providerStatus: "pending",
        }),
      });
    });

    await page.goto("/checkout");
    await page.getByPlaceholder("Recipient name").fill("E2E Customer");
    await page.getByPlaceholder("Phone number").fill("+2348010000000");
    await page.getByPlaceholder("Address line 1").fill("12 Admiralty Way");
    await page.getByPlaceholder("City").fill("Lagos");
    await page.getByPlaceholder("State / Province").fill("Lagos");
    await page.getByRole("button", { name: "Pay with Flutterwave" }).click();

    await expect(page).toHaveURL(/\/checkout\/return\?/);
    await expect(page.getByRole("heading", { name: "Payment confirmed." })).toBeVisible();
    // The storefront sends only variant ids and quantities; the server prices the bag.
    expect(sessionRequest).toMatchObject({ provider: "flutterwave" });
    expect(JSON.stringify(sessionRequest)).not.toContain("unit_price");
  });

  test("a failed payment tells the customer to contact support if charged", async ({ page }) => {
    await signInCustomer(page);
    await mockSessionStatus(page, "failed");

    await page.goto(`/checkout/return?checkout_session_id=${SESSION_ID}&transaction_id=987654&tx_ref=tx-e2e`);

    await expect(page.getByRole("heading", { name: "Payment needs attention." })).toBeVisible();
    await expect(page.getByText("If you were charged, contact support")).toBeVisible();
  });

  test("the return page reports a missing session reference", async ({ page }) => {
    await page.goto("/checkout/return");

    await expect(page.getByText("Missing checkout session reference.")).toBeVisible();
  });
});
