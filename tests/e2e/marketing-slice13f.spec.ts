import { readFile } from "node:fs/promises";

import { expect, test, type Page } from "@playwright/test";

import { OWNER_PASSWORD, signInAs, signInAsOwner } from "./support/staff-auth";

// Slice 13F: subscribers desk and search/share overrides. Runs against the seeded e2e API
// (seed_e2e creates five drop-list subscribers; none were synced to Brevo).

const SUPPORT_EMAIL = "tolu@sohenation.com";

async function openSubscribers(page: Page) {
  await page.goto("/subscribers");
  await expect(page.getByRole("heading", { name: "Newsletter subscribers." })).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("table")).toBeVisible({ timeout: 20000 });
}

test.describe("Slice 13F — subscribers desk", () => {
  test("owner sees counts, filters, and searches the list", async ({ page }) => {
    await signInAsOwner(page);
    await openSubscribers(page);

    const summary = page.getByLabel("Subscriber summary");
    await expect(summary.getByText("Brevo sync failed")).toBeVisible();
    await expect(page.getByRole("cell", { name: "drops-confirmed@example.com", exact: true })).toBeVisible();

    await page.getByLabel("Subscriber status").selectOption("unsubscribed");
    await expect(page.getByRole("cell", { name: "drops-left@example.com", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "drops-confirmed@example.com", exact: true })).toHaveCount(0);

    await page.getByLabel("Subscriber status").selectOption("");
    await page.getByLabel("Search subscribers").fill("checkout");
    await expect(page.getByRole("cell", { name: "drops-checkout@example.com", exact: true })).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(2);
    await expect(page.getByRole("cell", { name: "Sync failed", exact: true })).toBeVisible();
  });

  test("owner can export the list as CSV", async ({ page }) => {
    await signInAsOwner(page);
    await openSubscribers(page);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^sohe-subscribers-\d{4}-\d{2}-\d{2}\.csv$/);
    const csv = await readFile((await download.path())!, "utf-8");
    expect(csv.split("\n")[0]).toContain("email,status,source");
    expect(csv).toContain("drops-confirmed@example.com");
  });

  test("owner can remove a subscriber after confirming", async ({ page }) => {
    await signInAsOwner(page);
    await openSubscribers(page);
    await page.getByLabel("Search subscribers").fill("erase-me");
    await expect(page.getByRole("cell", { name: "erase-me@example.com", exact: true })).toBeVisible();

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("Remove erase-me@example.com completely?");
      void dialog.accept();
    });
    await page.getByRole("button", { name: "Remove erase-me@example.com" }).click();

    await expect(page.getByText("erase-me@example.com was removed.")).toBeVisible();
    await expect(page.getByText("No subscribers match these filters.")).toBeVisible();
  });

  test("support staff can view but not export", async ({ page }) => {
    await signInAs(page, SUPPORT_EMAIL, OWNER_PASSWORD);
    await openSubscribers(page);
    await page.getByRole("button", { name: "Export CSV" }).click();
    await expect(page.getByText("Only the owner or an admin can export or remove subscribers.")).toBeVisible();
  });
});

test.describe("Slice 13F — search and sharing overrides", () => {
  test.beforeEach(async ({ page }) => {
    await signInAsOwner(page);
  });

  test("product editor saves a search title and previews it", async ({ page }) => {
    // Night Shift Cargo is a draft no other spec edits.
    await page.goto("/products");
    await page
      .locator("article")
      .filter({ hasText: "Night Shift Cargo" })
      .getByRole("link", { name: "Edit product" })
      .click();
    await expect(page).toHaveURL(/\/products\/.+/);
    const editorUrl = page.url();

    const titleInput = page.getByLabel("Product search title");
    await expect(titleInput).toBeVisible({ timeout: 20000 });
    await titleInput.fill("Night Shift Cargo Trousers");
    await expect(page.getByLabel("Search result preview")).toContainText("Night Shift Cargo Trousers | Sohe Nation");

    await page.getByLabel("Product share image URL").fill("http://not-secure.example.com/a.jpg");
    await expect(page.getByText("The image link must start with https://")).toBeVisible();
    await page.getByLabel("Product share image URL").fill("");

    await page.getByRole("button", { name: "Save as draft" }).click();
    await expect(page.getByText("Product changes saved.")).toBeVisible();

    await page.goto(editorUrl);
    await expect(page.getByLabel("Product search title")).toHaveValue("Night Shift Cargo Trousers", { timeout: 20000 });
  });

  test("a story's search and sharing settings can be set", async ({ page }) => {
    await page.goto("/content");
    const stories = page.locator("#stories");
    await expect(stories.getByRole("heading", { name: "Stories" })).toBeVisible({ timeout: 20000 });
    await stories.getByRole("link", { name: /Search and sharing for/ }).first().click();

    const titleInput = page.getByLabel("Story search title");
    await expect(titleInput).toBeVisible({ timeout: 20000 });
    await titleInput.fill("Built Like An Army: Lookbook 01");
    await page.getByRole("button", { name: "Save search and sharing" }).click();
    await expect(page.getByText("Search and sharing settings saved.")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Story search title")).toHaveValue("Built Like An Army: Lookbook 01", {
      timeout: 20000,
    });
  });
});
