import type { Page } from "@playwright/test";

/** Glob so route mocks match whichever API host the storefront build points at. */
export const STOREFRONT_API = "**/api/v1";
const SESSION_KEY = "sohe-storefront-account-session";
export const CUSTOMER_EMAIL = "e2e-customer@example.com";

export function money(amount: number) {
  return { amount, currency: "NGN", formatted: `NGN ${amount.toLocaleString("en-NG")}` };
}

export function apiOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-e2e-1",
    order_number: "SN-E2E-0001",
    created_at: "2026-09-10T10:00:00Z",
    status: "fulfilled",
    total: money(185000),
    is_return_eligible: true,
    ...overrides,
  };
}

async function json(route: Parameters<Parameters<Page["route"]>[1]>[0], body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

/**
 * Signed-in customer with every browser-side account call mocked, so no spec reaches a real API.
 * Pass `orders` / `returns` to shape the account; later `page.route` calls take precedence.
 */
export async function signInCustomer(
  page: Page,
  { orders = [], returns = [] }: { orders?: unknown[]; returns?: unknown[] } = {},
) {
  await page.addInitScript(
    ([key, email]) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          isAuthenticated: true,
          token: "customer-token",
          expiresAt: Date.now() + 60 * 60 * 1000,
          email,
          firstName: "E2E",
          lastName: "Customer",
          emailVerified: true,
        }),
      );
    },
    [SESSION_KEY, CUSTOMER_EMAIL],
  );
  await page.route(`${STOREFRONT_API}/auth/customer/session/`, (route) =>
    json(route, {
      token: "customer-token",
      expires_at: "2099-01-01T00:00:00Z",
      user: { email: CUSTOMER_EMAIL, first_name: "E2E", last_name: "Customer", is_staff: false, email_verified: true },
    }),
  );
  await page.route(`${STOREFRONT_API}/account/orders/**`, (route) =>
    json(route, { count: orders.length, results: orders }),
  );
  await page.route(`${STOREFRONT_API}/account/returns/**`, (route) =>
    json(route, { count: returns.length, results: returns }),
  );
  await page.route(`${STOREFRONT_API}/account/addresses/**`, (route) => json(route, { results: [] }));
  await page.route(`${STOREFRONT_API}/settings/storefront/`, (route) =>
    json(route, { store_name: "Sohe's Nation", support_email: "support@sohenation.com" }),
  );
}
