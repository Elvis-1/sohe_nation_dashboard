import { expect, test } from "@playwright/test";

import { signInAsOwner } from "./support/staff-auth";

// Slice 14D: return rules on order lines and item-level returns in the dashboard.
// seed_e2e creates SOH-2050 (standard, final-sale, and 30-day custom items) and an item-level
// return covering the final-sale knit (faulty) and one cap (wrong size). Read-only here.

test.describe("Slice 14D — return rules and returned items", () => {
  test.beforeEach(async ({ page }) => {
    await signInAsOwner(page);
  });

  test("order detail shows the rule each item was bought under", async ({ page }) => {
    await page.goto("/orders");
    await page.locator("article").filter({ hasText: "SOH-2050" }).getByRole("link", { name: "Open order" }).click();
    await expect(page.getByRole("heading", { name: "Order SOH-2050" })).toBeVisible({ timeout: 20000 });

    await expect(page.getByLabel("Return rule for Lunar Utility Jacket")).toHaveText("Standard: 14 days");
    await expect(page.getByLabel("Return rule for Rally Knit Set")).toHaveText("Final sale");
    await expect(page.getByLabel("Return rule for Varsity Crest Cap")).toHaveText("Custom: 30 days");
  });

  test("return detail lists each returned item with quantity, reason, and rule", async ({ page }) => {
    await page.goto("/returns");
    await page
      .locator("article")
      .filter({ hasText: "Faulty or damaged, Wrong size or fit" })
      .getByRole("link", { name: "Open return" })
      .click();
    await expect(page).toHaveURL(/\/returns\/.+/);

    const items = page.getByRole("table", { name: "Returned items" });
    await expect(items).toBeVisible({ timeout: 20000 });
    const knit = items.getByRole("row").filter({ hasText: "Rally Knit Set" });
    await expect(knit.getByRole("cell", { name: "Faulty or damaged" })).toBeVisible();
    await expect(knit.getByText("Final sale")).toBeVisible();
    const cap = items.getByRole("row").filter({ hasText: "Varsity Crest Cap" });
    await expect(cap.getByRole("cell", { name: "1", exact: true })).toBeVisible();
    await expect(cap.getByRole("cell", { name: "Wrong size or fit" })).toBeVisible();
    await expect(cap.getByText("Custom: 30 days")).toBeVisible();
  });

  test("older order-level returns still show their summary", async ({ page }) => {
    await page.goto("/returns");
    await page.locator("article").filter({ hasText: "Damaged on arrival" }).getByRole("link", { name: "Open return" }).click();
    await expect(page.getByText("Varsity Crest Cap / Sand / One size").first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("table", { name: "Returned items" })).toHaveCount(0);
  });
});
