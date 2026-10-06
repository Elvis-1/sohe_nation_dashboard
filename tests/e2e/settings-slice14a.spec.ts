import { expect, test, type Page } from "@playwright/test";

import { signInAsOwner } from "./support/staff-auth";

// Slice 14A: typed settings and the Returns group. Runs against the seeded e2e API.

async function openSettings(page: Page) {
  await page.goto("/settings");
  await expect(page.getByLabel("Returns Return window")).toBeVisible({ timeout: 20000 });
}

async function save(page: Page) {
  await page.getByRole("button", { name: "Save settings" }).click();
}

test.describe("Slice 14A — typed settings", () => {
  test.beforeEach(async ({ page }) => {
    await signInAsOwner(page);
  });

  test("Returns settings use real controls with their defaults", async ({ page }) => {
    await openSettings(page);

    const window = page.getByLabel("Returns Return window");
    await expect(window).toHaveAttribute("type", "number");
    await expect(window).toHaveValue("14");
    await expect(page.getByLabel("Returns Longest custom window")).toHaveValue("90");

    const multiple = page.getByRole("switch", { name: "Returns Allow several returns per order" });
    await expect(multiple).toBeChecked();

    const regions = page.getByRole("group", { name: "Returns Final sale applies to deliveries in" });
    for (const country of ["Nigeria", "United Kingdom", "United States", "European Union"]) {
      await expect(regions.getByRole("checkbox", { name: country })).toBeChecked();
    }

    const faulty = page.getByRole("switch", { name: "Returns Faulty items can always be returned" });
    await expect(faulty).toBeChecked();
    await expect(faulty).toBeDisabled();
    await expect(page.getByText(/Fixed\. A legal right/)).toBeVisible();

    await expect(page.getByLabel("Store profile Support email")).toHaveAttribute("type", "email");
  });

  test("changes save, persist, and out-of-range values are refused", async ({ page }) => {
    await openSettings(page);

    await page.getByLabel("Returns Return window").fill("30");
    await page
      .getByRole("group", { name: "Returns Final sale applies to deliveries in" })
      .getByRole("checkbox", { name: "United Kingdom" })
      .uncheck();
    await page.getByRole("switch", { name: "Returns Allow several returns per order" }).uncheck();
    await save(page);
    await expect(page.getByText("Settings changes saved.")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Returns Return window")).toHaveValue("30", { timeout: 20000 });
    await expect(
      page
        .getByRole("group", { name: "Returns Final sale applies to deliveries in" })
        .getByRole("checkbox", { name: "United Kingdom" }),
    ).not.toBeChecked();
    await expect(page.getByRole("switch", { name: "Returns Allow several returns per order" })).not.toBeChecked();

    await page.getByLabel("Returns Return window").fill("0");
    await save(page);
    await expect(page.getByText(/'Return window' must be between 1 and 90\./)).toBeVisible();

    // Restore the defaults for other specs.
    await page.reload();
    await page.getByLabel("Returns Return window").fill("14", { timeout: 20000 });
    await page
      .getByRole("group", { name: "Returns Final sale applies to deliveries in" })
      .getByRole("checkbox", { name: "United Kingdom" })
      .check();
    await page.getByRole("switch", { name: "Returns Allow several returns per order" }).check();
    await save(page);
    await expect(page.getByText("Settings changes saved.")).toBeVisible();
  });

  test("an invalid support email is refused", async ({ page }) => {
    await openSettings(page);
    const email = page.getByLabel("Store profile Support email");
    const original = await email.inputValue();
    await email.fill("not-an-email");
    await save(page);
    await expect(page.getByText(/'Support email' must be a valid email address\./)).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Store profile Support email")).toHaveValue(original, { timeout: 20000 });
  });
});
