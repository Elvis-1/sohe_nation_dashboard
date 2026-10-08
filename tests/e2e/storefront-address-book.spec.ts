import { expect, test, type Page } from "@playwright/test";

const SESSION_KEY = "sohe-storefront-account-session";
const CART_KEY = "sohe-storefront-cart";
// Glob so route mocks match whichever API host the storefront env points at.
const API_BASE = "**/api/v1";

async function seedAuthenticatedState(page: Page) {
  await page.addInitScript(
    ([sessionKey, cartKey]) => {
      window.localStorage.setItem(
        sessionKey,
        JSON.stringify({
          isAuthenticated: true,
          token: "customer-token",
          expiresAt: Date.now() + 60 * 60 * 1000,
          email: "customer@example.com",
          firstName: "Customer",
          lastName: "Person",
          emailVerified: true,
        }),
      );
      window.localStorage.setItem(
        cartKey,
        JSON.stringify([
          // Same snapshot shape `createStoredCartLine` writes when a product is added to the bag.
          {
            productId: "sn-command-jacket",
            variantId: "variant-jacket-l",
            quantity: 1,
            title: "Command Jacket",
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
    },
    [SESSION_KEY, CART_KEY],
  );
}

test.describe("storefront address capture and address book", () => {
  test("account addresses page lists saved addresses", async ({ page }) => {
    await seedAuthenticatedState(page);

    await page.route(`${API_BASE}/auth/customer/session/`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "customer-token",
          expires_at: "2099-01-01T00:00:00Z",
          user: {
            email: "customer@example.com",
            first_name: "Customer",
            last_name: "Person",
            is_staff: false,
            email_verified: true,
          },
        }),
      });
    });

    await page.route(`${API_BASE}/account/orders/**`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results: [] }) });
    });
    await page.route(`${API_BASE}/account/returns/**`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results: [] }) });
    });
    await page.route(`${API_BASE}/settings/storefront/`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ store_name: "Sohe Nation", support_email: "support@sohenation.com" }),
      });
    });
    await page.route(`${API_BASE}/account/addresses/`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              id: "address-1",
              label: "Home",
              recipient_name: "Customer Person",
              phone: "+2348010000000",
              line_1: "12 Admiralty Way",
              line_2: "",
              city: "Lagos",
              state: "Lagos",
              postal_code: "100001",
              country_code: "NG",
              is_default: true,
            },
          ],
        }),
      });
    });

    await page.goto("/account/addresses");
    await expect(page.getByText("Address Book")).toBeVisible();
    await expect(page.getByText("12 Admiralty Way, Lagos, Lagos, 100001")).toBeVisible();
  });

  test("checkout can save entered shipping address for authenticated customers", async ({ page }) => {
    await seedAuthenticatedState(page);

    await page.route(`${API_BASE}/auth/customer/session/`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "customer-token",
          expires_at: "2099-01-01T00:00:00Z",
          user: {
            email: "customer@example.com",
            first_name: "Customer",
            last_name: "Person",
            is_staff: false,
            email_verified: true,
          },
        }),
      });
    });

    await page.route(`${API_BASE}/account/addresses/`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results: [] }) });
        return;
      }

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "new-address",
          label: "Checkout Address",
          recipient_name: "Customer Person",
          phone: "+2348010000000",
          line_1: "77 Marina Road",
          line_2: "",
          city: "Lagos",
          state: "Lagos",
          postal_code: "100001",
          country_code: "NG",
          is_default: true,
        }),
      });
    });
    await page.route(`${API_BASE}/checkout/quote/`, async (route) => {
      const money = (amount: number) => ({ amount, currency: "NGN", formatted: `NGN ${amount.toLocaleString("en-NG")}` });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          currency: "NGN",
          lines: [
            {
              product_id: "sn-command-jacket",
              variant_id: "variant-jacket-l",
              title: "Command Jacket",
              variant_label: "Black / L",
              quantity: 1,
              unit_price: money(185000),
              line_total: money(185000),
            },
          ],
          summary: {
            subtotal: money(185000),
            shipping: money(0),
            discount: money(0),
            total: money(185000),
          },
        }),
      });
    });
    await page.route(`${API_BASE}/checkout/sessions/`, async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: "chk_mock_1",
          order_id: "00000000-0000-0000-0000-000000000001",
          provider: "flutterwave",
          status: "pending_redirect",
          region: "NG",
          currency: "NGN",
          approvalUrl: "",
          providerStatus: "pending",
        }),
      });
    });

    await page.goto("/checkout");
    await page.getByPlaceholder("Recipient name").fill("Customer Person");
    await page.getByPlaceholder("Phone number").fill("+2348010000000");
    await page.getByPlaceholder("Address line 1").fill("77 Marina Road");
    await page.getByPlaceholder("City").fill("Lagos");
    await page.getByPlaceholder("State / Province").fill("Lagos");
    await page.getByPlaceholder("Postal code").fill("100001");
    await page.getByLabel("Save this shipping address to my account").check();
    await page.getByRole("button", { name: "Pay with Flutterwave" }).click();

    await expect(page.getByText("Taking you to secure payment.")).toBeVisible();
    await expect(page.getByText("Delivering to: 77 Marina Road, Lagos, Lagos.")).toBeVisible();
  });
});
