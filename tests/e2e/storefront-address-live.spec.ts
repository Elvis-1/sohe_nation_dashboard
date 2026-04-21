import { expect, test } from "@playwright/test";

const STORAGE_KEY = "sohe-storefront-account-session";
const API_BASE = "http://localhost:8000/api/v1";

test("storefront live flow can save an address from account addresses page", async ({
  page,
  request,
}) => {
  const email = `live-address-${Date.now()}@example.com`;
  const password = "live-pass-123";
  const register = await request.post(`${API_BASE}/auth/customer/register/`, {
    data: {
      email,
      password,
      first_name: "Live",
      last_name: "Address",
    },
  });
  expect(register.ok()).toBeTruthy();
  const payload = await register.json();
  await page.addInitScript(
    ([storageKey, session]) => {
      window.localStorage.setItem(storageKey, JSON.stringify(session));
    },
    [
      STORAGE_KEY,
      {
        isAuthenticated: true,
        token: payload.token,
        expiresAt: new Date(payload.expires_at).getTime(),
        email: payload.user.email,
        firstName: payload.user.first_name,
        lastName: payload.user.last_name,
        emailVerified: payload.user.email_verified,
      },
    ],
  );

  await page.goto("/account/addresses");
  await expect(page.getByText("Address Book")).toBeVisible();

  const suffix = Date.now().toString().slice(-6);
  await page.getByPlaceholder("Label (Home, Office)").fill(`Home ${suffix}`);
  await page.getByPlaceholder("Recipient name").fill("Customer Person");
  await page.getByPlaceholder("Address line 1").fill(`12 Admiralty Way ${suffix}`);
  await page.getByPlaceholder("City").fill("Lagos");
  await page.getByPlaceholder("State / Province").fill("Lagos");
  await page.getByRole("button", { name: "Save Address" }).click();

  await expect(page.getByText("Address added.")).toBeVisible();
  await expect(page.getByText(`12 Admiralty Way ${suffix}, Lagos, Lagos`)).toBeVisible();
});
