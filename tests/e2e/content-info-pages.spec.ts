import { expect, test, type Page } from "@playwright/test";
import { OWNER_IDENTIFIER, OWNER_PASSWORD, submitSignIn } from "./support/staff-auth";

// Runs against the seeded e2e API; information pages are bootstrapped on the first content read.

async function openInfoPage(page: Page, name: string) {
  await page.goto("/content");
  const section = page.locator("#information-pages");
  await expect(section.getByRole("heading", { name: "Information pages" })).toBeVisible({ timeout: 20000 });
  await section.getByRole("link", { name: `Edit ${name}` }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible({ timeout: 20000 });
}

test.describe("Slice 13B — information pages in the content desk", () => {
  test.beforeEach(async ({ page }) => {
    await submitSignIn(page, OWNER_IDENTIFIER, OWNER_PASSWORD);
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test("desk lists every page and flags the ones awaiting owner review", async ({ page }) => {
    await page.goto("/content");
    const section = page.locator("#information-pages");
    await expect(section.getByRole("link", { name: /^Edit / })).toHaveCount(8, { timeout: 20000 });

    const privacy = section.locator("li", { hasText: "/privacy" });
    await expect(privacy.getByText("Needs owner review")).toBeVisible();
    const about = section.locator("li", { hasText: "/about" });
    await expect(about.getByText("Needs owner review")).toHaveCount(0);
    await expect(about.getByText("Live on storefront")).toBeVisible();
  });

  test("staff can edit page copy and the change persists", async ({ page }) => {
    await openInfoPage(page, "Frequently asked questions");
    const intro = page.getByLabel("Intro and search description");
    const original = await intro.inputValue();

    await intro.fill("Quick answers about orders, shipping, and returns.");
    await page.getByRole("button", { name: "Save page" }).click();
    await expect(page.getByText("Frequently asked questions saved and live on the storefront.")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Intro and search description")).toHaveValue(
      "Quick answers about orders, shipping, and returns.",
      { timeout: 20000 },
    );

    // Restore the seeded copy for other specs.
    await page.getByLabel("Intro and search description").fill(original);
    await page.getByRole("button", { name: "Save page" }).click();
    await expect(page.getByText("saved and live on the storefront.")).toBeVisible();
  });

  test("an empty page cannot be published", async ({ page }) => {
    await openInfoPage(page, "Size guide");
    await expect(page.getByRole("alert").filter({ hasText: "Needs owner review" })).toBeVisible();

    await page.getByLabel("Page body").fill("");
    await page.getByRole("button", { name: "Save page" }).click();

    await expect(page.getByText(/A published page needs this field/)).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Page body")).not.toHaveValue("", { timeout: 20000 });
  });
});

test.describe("Slice 13B — social profile links in settings", () => {
  test.beforeEach(async ({ page }) => {
    await submitSignIn(page, OWNER_IDENTIFIER, OWNER_PASSWORD);
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test("a link to the wrong site is rejected with a clear message", async ({ page }) => {
    await page.goto("/settings");
    const tiktok = page.getByLabel("Store profile TikTok URL");
    await expect(tiktok).toBeVisible({ timeout: 20000 });
    await expect(page.getByLabel("Store profile Instagram URL")).toBeVisible();

    await tiktok.fill("https://instagram.com/not-tiktok");
    await page.getByRole("button", { name: "Save settings" }).click();

    await expect(page.getByText(/must be an https:\/\/ link on tiktok\.com/)).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Store profile TikTok URL")).toHaveValue("", { timeout: 20000 });
  });
});
