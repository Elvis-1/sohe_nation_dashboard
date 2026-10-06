import { expect, test, type Page } from "@playwright/test";

import { signInAsOwner } from "./support/staff-auth";

// Slice 14B: per-product return rule in the product editor. Runs against the seeded e2e API;
// "Returns Rule Target" is a draft only this spec edits.

async function openEditor(page: Page) {
  await page.goto("/products");
  await page
    .locator("article")
    .filter({ hasText: "Returns Rule Target" })
    .getByRole("link", { name: "Edit product" })
    .click();
  await expect(page).toHaveURL(/\/products\/.+/);
  await expect(page.getByRole("group", { name: "Product return rule" })).toBeVisible({ timeout: 20000 });
  return page.url();
}

test.describe("Slice 14B — product return rule", () => {
  test.beforeEach(async ({ page }) => {
    await signInAsOwner(page);
  });

  test("staff can choose final sale or a custom window, and it persists", async ({ page }) => {
    const editorUrl = await openEditor(page);
    const rules = page.getByRole("group", { name: "Product return rule" });
    await expect(rules.getByRole("radio", { name: /Standard/ })).toBeChecked();
    await expect(page.getByLabel("Product custom return window")).toHaveCount(0);

    await rules.getByRole("radio", { name: /Custom window/ }).check();
    await page.getByLabel("Product custom return window").fill("30");
    await page.getByRole("button", { name: "Save as draft" }).click();
    await expect(page.getByText("Product changes saved.")).toBeVisible();

    await page.goto(editorUrl);
    await expect(rules.getByRole("radio", { name: /Custom window/ })).toBeChecked({ timeout: 20000 });
    await expect(page.getByLabel("Product custom return window")).toHaveValue("30");

    await rules.getByRole("radio", { name: /Final sale/ }).check();
    await page.getByRole("button", { name: "Save as draft" }).click();
    await expect(page.getByText("Product changes saved.")).toBeVisible();
    await page.goto(editorUrl);
    await expect(rules.getByRole("radio", { name: /Final sale/ })).toBeChecked({ timeout: 20000 });
  });

  test("a custom window longer than the setting allows is refused", async ({ page }) => {
    await openEditor(page);
    await page.getByRole("group", { name: "Product return rule" }).getByRole("radio", { name: /Custom window/ }).check();
    await page.getByLabel("Product custom return window").fill("400");
    await page.getByRole("button", { name: "Save as draft" }).click();
    await expect(page.getByText(/at most 90 days/)).toBeVisible();
  });
});
