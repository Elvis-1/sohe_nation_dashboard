import { expect, type Page } from "@playwright/test";

/** Local owner account seeded by `api/scripts/bootstrap_local_api.sh`. */
export const OWNER_IDENTIFIER = process.env.E2E_STAFF_IDENTIFIER ?? "admin";
export const OWNER_PASSWORD = process.env.E2E_STAFF_PASSWORD ?? "admin123";

/** Submit label on `/signin` (sign-in-page-shell.tsx). */
export const SIGN_IN_BUTTON = "Continue to dashboard";

export async function submitSignIn(page: Page, identifier: string, password: string) {
  await page.goto("/signin");
  await page.getByLabel("Email or username").fill(identifier);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: SIGN_IN_BUTTON }).click();
}

export async function signInAs(page: Page, identifier: string, password: string) {
  await submitSignIn(page, identifier, password);
  await expect(page).toHaveURL("/", { timeout: 15000 });
}

export async function signInAsOwner(page: Page) {
  await signInAs(page, OWNER_IDENTIFIER, OWNER_PASSWORD);
}
