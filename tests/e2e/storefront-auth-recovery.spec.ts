import { expect, test, type Page } from "@playwright/test";

const STOREFRONT_SESSION_KEY = "sohe-storefront-account-session";
const API_BASE = "http://localhost:8000/api/v1";

async function mockStorefrontAccountApis(page: Page) {
  await page.route(`${API_BASE}/auth/customer/session/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        token: "customer-token",
        expires_at: "2099-01-01T00:00:00Z",
        user: {
          email: "verified-check@example.com",
          first_name: "Verify",
          last_name: "Check",
          is_staff: false,
          email_verified: false,
        },
      }),
    });
  });

  await page.route(`${API_BASE}/account/orders/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [] }),
    });
  });

  await page.route(`${API_BASE}/account/returns/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ results: [] }),
    });
  });
}

test.describe("storefront account recovery and verification", () => {
  test("forgot-password requests show a safe generic message", async ({ page }) => {
    await page.route(`${API_BASE}/auth/customer/password-reset/request/`, async (route) => {
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({
          message:
            "If an account exists for this email, a password reset email has been sent.",
        }),
      });
    });

    await page.goto("/account/forgot-password");
    await page.getByPlaceholder("you@example.com").fill("missing@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(
      page.getByText("If an account exists for this email, a password reset email has been sent."),
    ).toBeVisible();
  });

  test("successful email verification immediately removes the verify prompt in account", async ({
    page,
  }) => {
    await mockStorefrontAccountApis(page);

    await page.route(`${API_BASE}/auth/customer/email-verification/confirm/`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Email verified successfully." }),
      });
    });

    await page.addInitScript((storageKey) => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          isAuthenticated: true,
          token: "customer-token",
          expiresAt: Date.now() + 60 * 60 * 1000,
          email: "verified-check@example.com",
          firstName: "Verify",
          lastName: "Check",
          emailVerified: false,
        }),
      );
    }, STOREFRONT_SESSION_KEY);

    await page.goto("/account");
    await expect(page.getByText("Email Verification Pending")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open verification page" })).toBeVisible();

    await page.goto("/account/verify-email?token=test-token");
    await page.getByRole("button", { name: "Verify email" }).click();
    await expect(page.getByText("Your email is already verified.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Verify email" })).toHaveCount(0);

    await page.goto("/account");
    await expect(page.getByText("Email Verification Pending")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open verification page" })).toHaveCount(0);
  });
});
