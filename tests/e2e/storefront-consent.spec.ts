import { expect, test, type Page } from "@playwright/test";

import { STOREFRONT_API, money, signInCustomer } from "./support/storefront-customer";

// Slice 13E: consent banner, GA4 + Meta Pixel loading, and commerce events.
// Needs a storefront built with test IDs (see playwright.storefront.config.ts). Google's and
// Meta's scripts are stubbed; the spec inspects the dataLayer and fbq queue they would read.

test.use({ storageState: { cookies: [], origins: [] } });

const TRACKER_HOSTS = /googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr/;
const SESSION_ID = "11111111-2222-3333-4444-555555555555";

type Tracking = { requests: string[] };

async function stubTrackers(page: Page): Promise<Tracking> {
  const tracking: Tracking = { requests: [] };
  page.on("request", (request) => {
    if (TRACKER_HOSTS.test(request.url())) tracking.requests.push(request.url());
  });
  await page.route(/googletagmanager\.com/, (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "window.__gaScript = true;" }),
  );
  await page.route(/connect\.facebook\.net/, (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "window.__pixelScript = true;" }),
  );
  return tracking;
}

// dataLayer holds `arguments` objects; turn them into arrays.
async function gaCommands(page: Page): Promise<unknown[][]> {
  return page.evaluate(() =>
    ((window as unknown as { dataLayer?: IArguments[] }).dataLayer ?? []).map((entry) => Array.from(entry)),
  );
}

async function gaEvents(page: Page, name: string) {
  return (await gaCommands(page)).filter((command) => command[0] === "event" && command[1] === name);
}

async function pixelCommands(page: Page): Promise<unknown[][]> {
  return page.evaluate(
    () => ((window as unknown as { fbq?: { queue: unknown[][] } }).fbq?.queue ?? []) as unknown[][],
  );
}

async function consentCookie(page: Page) {
  const cookie = (await page.context().cookies()).find((item) => item.name === "sohe_consent");
  return cookie ? JSON.parse(decodeURIComponent(cookie.value)) : null;
}

function banner(page: Page) {
  return page.getByRole("dialog", { name: "Your cookie choices" });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/about");
  const configured = await page.getByRole("button", { name: "Cookie settings" }).count();
  test.skip(!configured, "Storefront was built without analytics IDs; see playwright.storefront.config.ts.");
});

test.describe("consent banner", () => {
  test("nothing is loaded or sent before a choice is made", async ({ page }) => {
    const tracking = await stubTrackers(page);
    await page.goto("/products/lunar-utility-jacket");

    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("link", { name: "privacy and cookies policy" })).toHaveAttribute("href", "/privacy");
    await page.getByRole("button", { name: "Add To Bag" }).click();

    expect(tracking.requests).toEqual([]);
    expect(await gaCommands(page)).toEqual([]);
    expect(await page.evaluate(() => typeof (window as unknown as { fbq?: unknown }).fbq)).toBe("undefined");
  });

  test("Reject all keeps every tracker off and is remembered", async ({ page }) => {
    const tracking = await stubTrackers(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Reject all" }).click();

    await expect(banner(page)).toHaveCount(0);
    expect(await consentCookie(page)).toMatchObject({ analytics: false, marketing: false, v: 1 });

    await page.goto("/products/lunar-utility-jacket");
    await expect(page.getByRole("heading", { name: "Lunar Utility Jacket", level: 1 })).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
    expect(tracking.requests).toEqual([]);
    expect(await gaCommands(page)).toEqual([]);
  });

  test("Accept all loads GA4 and the Pixel and reports product events", async ({ page }) => {
    const tracking = await stubTrackers(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await expect(banner(page)).toHaveCount(0);

    await page.goto("/products/lunar-utility-jacket");
    await expect.poll(() => page.evaluate(() => (window as unknown as { __gaScript?: boolean }).__gaScript)).toBe(true);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __pixelScript?: boolean }).__pixelScript)).toBe(true);
    expect(tracking.requests.some((url) => url.includes("gtag/js?id=G-E2ETEST"))).toBe(true);

    const commands = await gaCommands(page);
    expect(commands[0]).toEqual([
      "consent",
      "default",
      { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" },
    ]);
    expect(commands).toContainEqual([
      "consent",
      "update",
      { analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" },
    ]);
    expect(commands).toContainEqual(["config", "G-E2ETEST"]);

    await expect.poll(async () => (await gaEvents(page, "view_item")).length).toBe(1);
    const [viewItem] = await gaEvents(page, "view_item");
    expect(viewItem[2]).toMatchObject({
      currency: "NGN",
      value: 185000,
      items: [{ item_name: "Lunar Utility Jacket", item_category: "outerwear", price: 185000, quantity: 1 }],
    });
    // No personal data in events.
    expect(JSON.stringify(viewItem)).not.toMatch(/@/);

    await page.getByRole("button", { name: "Add To Bag" }).click();
    await expect.poll(async () => (await gaEvents(page, "add_to_cart")).length).toBe(1);

    const pixel = (await pixelCommands(page)).map((command) => command.slice(0, 2));
    expect(pixel).toContainEqual(["init", "1234567890"]);
    expect(pixel).toContainEqual(["track", "PageView"]);
    expect(pixel).toContainEqual(["track", "ViewContent"]);
    expect(pixel).toContainEqual(["track", "AddToCart"]);
  });

  test("Manage lets a visitor allow analytics only", async ({ page }) => {
    const tracking = await stubTrackers(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Manage" }).click();
    await banner(page).getByRole("checkbox", { name: /Analytics/ }).check();
    await banner(page).getByRole("button", { name: "Save choices" }).click();

    expect(await consentCookie(page)).toMatchObject({ analytics: true, marketing: false });
    await page.goto("/products/lunar-utility-jacket");
    await expect.poll(async () => (await gaEvents(page, "view_item")).length).toBe(1);
    expect(tracking.requests.some((url) => url.includes("connect.facebook.net"))).toBe(false);
    const commands = await gaCommands(page);
    expect(commands).toContainEqual([
      "consent",
      "update",
      { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" },
    ]);
  });

  test("Cookie settings in the footer reopens the choice, and withdrawing removes GA cookies", async ({ page }) => {
    await stubTrackers(page);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await page.context().addCookies([{ name: "_ga", value: "GA1.1.123.456", domain: "127.0.0.1", path: "/" }]);

    await page.getByRole("button", { name: "Cookie settings" }).click();
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("checkbox", { name: /Analytics/ })).toBeChecked();
    await banner(page).getByRole("button", { name: "Reject all" }).click();

    expect(await consentCookie(page)).toMatchObject({ analytics: false, marketing: false });
    const names = (await page.context().cookies()).map((cookie) => cookie.name);
    expect(names).not.toContain("_ga");
  });
});

test.describe("conversion events", () => {
  async function acceptAll(page: Page) {
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await expect(banner(page)).toHaveCount(0);
  }

  test("purchase is reported once, only after the payment is confirmed", async ({ page }) => {
    await stubTrackers(page);
    await acceptAll(page);
    await signInCustomer(page);
    await page.route(`${STOREFRONT_API}/checkout/sessions/${SESSION_ID}/**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: SESSION_ID,
          order_id: "order-e2e-1",
          order_number: "SN-E2E-1001",
          provider: "flutterwave",
          status: "authorized",
          region: "NG",
          currency: "NGN",
          approvalUrl: "",
          providerStatus: "successful",
          total: money(185000),
          lines: [
            {
              product_id: "product-e2e",
              variant_id: "variant-e2e",
              title: "Lunar Utility Jacket",
              variant_label: "Black / L",
              quantity: 1,
              unit_price: money(185000),
            },
          ],
        }),
      }),
    );

    const returnUrl = `/checkout/return?checkout_session_id=${SESSION_ID}&transaction_id=987654&tx_ref=tx-e2e`;
    await page.goto(returnUrl);
    await expect(page.getByRole("heading", { name: "Payment confirmed." })).toBeVisible();
    await expect.poll(async () => (await gaEvents(page, "purchase")).length).toBe(1);
    const [purchase] = await gaEvents(page, "purchase");
    expect(purchase[2]).toMatchObject({
      transaction_id: "SN-E2E-1001",
      currency: "NGN",
      value: 185000,
      items: [{ item_id: "product-e2e", item_name: "Lunar Utility Jacket", quantity: 1 }],
    });
    const pixelPurchase = (await pixelCommands(page)).find((command) => command[1] === "Purchase");
    expect(pixelPurchase?.[3]).toEqual({ eventID: "SN-E2E-1001" });

    await page.reload();
    await expect(page.getByRole("heading", { name: "Payment confirmed." })).toBeVisible();
    await page.waitForTimeout(500);
    expect(await gaEvents(page, "purchase")).toHaveLength(0);
  });

  test("a newsletter sign-up is reported as a lead", async ({ page }) => {
    await stubTrackers(page);
    await acceptAll(page);
    await page.route(`${STOREFRONT_API}/marketing/subscribe/`, (route) =>
      route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ message: "Check your inbox to confirm your place on the drop list." }),
      }),
    );
    await page.goto("/faq");
    const form = page.getByRole("form", { name: "Newsletter sign-up" });
    await form.getByPlaceholder("Email address").fill("lead@example.com");
    await form.getByRole("button", { name: "Join The List" }).click();

    await expect.poll(async () => (await gaEvents(page, "generate_lead")).length).toBe(1);
    const [lead] = await gaEvents(page, "generate_lead");
    expect(JSON.stringify(lead)).not.toContain("lead@example.com");
  });

  test("opening checkout with a bag reports begin_checkout", async ({ page }) => {
    await stubTrackers(page);
    await acceptAll(page);
    await page.evaluate(() => {
      window.localStorage.setItem(
        "sohe-storefront-cart",
        JSON.stringify([
          {
            productId: "product-e2e",
            variantId: "variant-e2e",
            quantity: 2,
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
        body: JSON.stringify({ currency: "NGN", lines: [], summary: { subtotal: money(370000), shipping: money(0), discount: money(0), total: money(370000) } }),
      }),
    );

    await page.goto("/checkout");
    await expect.poll(async () => (await gaEvents(page, "begin_checkout")).length).toBe(1);
    const [begin] = await gaEvents(page, "begin_checkout");
    expect(begin[2]).toMatchObject({ currency: "NGN", value: 370000, items: [{ item_id: "product-e2e", quantity: 2 }] });
  });

  test("creating an account reports sign_up without the email", async ({ page }) => {
    await stubTrackers(page);
    await acceptAll(page);
    await page.route(`${STOREFRONT_API}/auth/customer/register/`, (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          token: "customer-token",
          expires_at: "2099-01-01T00:00:00Z",
          user: { email: "new@example.com", first_name: "New", last_name: "Customer", is_staff: false, email_verified: false },
        }),
      }),
    );

    await page.goto("/account");
    await page.getByRole("button", { name: "Register" }).click();
    await page.getByPlaceholder("First name").fill("New");
    await page.getByPlaceholder("Last name").fill("Customer");
    await page.getByPlaceholder("Email", { exact: true }).fill("new@example.com");
    await page.getByPlaceholder("Password").fill("a-strong-pass-123");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect.poll(async () => (await gaEvents(page, "sign_up")).length).toBe(1);
    const [signUp] = await gaEvents(page, "sign_up");
    expect(signUp).toEqual(["event", "sign_up", { method: "email" }]);
  });
});
