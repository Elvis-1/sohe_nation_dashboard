import { expect, test, type Page } from "@playwright/test";

const STOREFRONT_SESSION_KEY = "sohe-storefront-account-session";
// Glob so route mocks match whichever API host the storefront env points at.
const API_BASE = "**/api/v1";

function apiOrder(index: number) {
  return {
    id: `order-${index}`,
    order_number: `SN-TEST-${String(index).padStart(3, "0")}`,
    created_at: "2026-09-01T10:00:00Z",
    status: "paid",
    total: { amount: 1000, currency: "NGN", formatted: "NGN 1,000" },
    is_return_eligible: false,
  };
}

async function signIn(page: Page) {
  await page.route(`${API_BASE}/auth/customer/session/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        token: "customer-token",
        expires_at: "2099-01-01T00:00:00Z",
        user: {
          email: "load-check@example.com",
          first_name: "Load",
          last_name: "Check",
          is_staff: false,
          email_verified: true,
        },
      }),
    });
  });
  await page.route(`${API_BASE}/account/returns/**`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results: [] }) });
  });
  await page.route(`${API_BASE}/account/addresses/`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results: [] }) });
  });
  await page.addInitScript((storageKey) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        isAuthenticated: true,
        token: "customer-token",
        expiresAt: Date.now() + 60 * 60 * 1000,
        email: "load-check@example.com",
        firstName: "Load",
        lastName: "Check",
        emailVerified: true,
      }),
    );
  }, STOREFRONT_SESSION_KEY);
}

test.describe("storefront account load errors and paging", () => {
  test("a failed orders read shows a retry notice instead of an empty history", async ({ page }) => {
    await signIn(page);
    let failOrders = true;
    await page.route(`${API_BASE}/account/orders/**`, async (route) => {
      if (failOrders) {
        await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 1, results: [apiOrder(1)] }),
      });
    });

    await page.goto("/account/orders");
    await expect(page.getByText("We couldn't load your orders right now")).toBeVisible();

    failOrders = false;
    await page.getByRole("button", { name: "Try Again" }).click();

    await expect(page.getByText("We couldn't load your orders right now")).toHaveCount(0);
    await expect(page.getByText("SN-TEST-001").first()).toBeVisible();
  });

  test("order history reads past the first API page", async ({ page }) => {
    await signIn(page);
    await page.route(`${API_BASE}/account/orders/**`, async (route) => {
      const pageNumber = Number(new URL(route.request().url()).searchParams.get("page") ?? "1");
      const results =
        pageNumber === 1 ? Array.from({ length: 100 }, (_, index) => apiOrder(index + 1)) : [apiOrder(101)];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 101, results }),
      });
    });

    await page.goto("/account/orders");

    await expect(page.getByText("SN-TEST-101")).toBeVisible();
  });
});
