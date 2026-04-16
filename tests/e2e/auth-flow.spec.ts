import { test, expect, type Page } from "@playwright/test";

const demoEmail = "ops@sohesnation.com";
const demoPassword = "dashboard-demo";
const sessionStorageKey = "sohe-dashboard-session";
const expiredSessionFlagKey = "sohe-dashboard-session-expired";

async function signIn(page: Page) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(demoEmail);
  await page.getByLabel("Password").fill(demoPassword);
  await page.getByRole("button", { name: "Continue to overview" }).click();
  await expect(page).toHaveURL("/");
}

test.describe("dashboard phase 1 auth flow", () => {
  test("staff can sign in through the mocked access flow and land on overview", async ({ page }) => {
    await page.goto("/signin");

    await expect(page.getByRole("heading", { name: "Enter the dashboard" })).toBeVisible();

    await page.getByLabel("Email").fill(demoEmail);
    await page.getByLabel("Password").fill(demoPassword);
    await page.getByRole("button", { name: "Continue to overview" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Daily control across the line." })).toBeVisible();
  });

  test("invalid staff credentials show a clear error and do not enter the dashboard", async ({
    page,
  }) => {
    await page.goto("/signin");

    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Continue to overview" }).click();

    await expect(page).toHaveURL("/signin");
    await expect(page.getByText("Use the fixture credentials to enter the dashboard.")).toBeVisible();
  });

  test("signed-out staff are redirected away from protected routes", async ({ page }) => {
    await page.goto("/orders");

    await expect(page).toHaveURL("/signin");
    await expect(page.getByRole("heading", { name: "Enter the dashboard" })).toBeVisible();
  });

  test("expired sessions are routed to the session-expired screen", async ({ page }) => {
    await page.addInitScript(
      ([storageKey, expiredKey]) => {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            email: "ops@sohesnation.com",
            name: "Operations Desk",
            role: "Staff Access",
            expiresAt: Date.now() - 60_000,
          }),
        );
        window.localStorage.removeItem(expiredKey);
      },
      [sessionStorageKey, expiredSessionFlagKey],
    );

    await page.goto("/returns");

    await expect(page).toHaveURL("/session-expired");
    await expect(page.getByRole("heading", { name: "The control desk timed out." })).toBeVisible();
  });

  test("authenticated staff are redirected away from auth pages back into the dashboard", async ({
    page,
  }) => {
    await signIn(page);

    await page.goto("/signin");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Daily control across the line." })).toBeVisible();
  });

  test("staff can sign out from the dashboard shell", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: /Sign out/i }).click();

    await expect(page).toHaveURL("/signin");
    await expect(page.getByRole("heading", { name: "Enter the dashboard" })).toBeVisible();
  });

  test("forgot-password placeholder remains accessible to signed-out staff", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page).toHaveURL("/forgot-password");
    await expect(
      page.getByRole("heading", { name: "Reset flow placeholder for dashboard access." }),
    ).toBeVisible();
    await expect(page.getByText("password recovery is intentionally non-functional")).toBeVisible();
  });

  test("session-expired screen lets staff re-enter through sign in", async ({ page }) => {
    await page.goto("/session-expired");

    await page.getByRole("link", { name: "Sign in again" }).click();

    await expect(page).toHaveURL("/signin");
    await expect(page.getByRole("heading", { name: "Enter the dashboard" })).toBeVisible();
  });
});
