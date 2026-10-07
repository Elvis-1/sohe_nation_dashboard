import { expect, test } from "@playwright/test";

// Server-rendered from the seeded e2e API: info pages are bootstrapped on first read,
// and seed_e2e sets one Instagram link in store profile settings.

const PAGES = [
  { path: "/about", heading: "Built Like An Army" },
  { path: "/contact", heading: "Contact us" },
  { path: "/shipping", heading: "Shipping and delivery" },
  { path: "/returns", heading: "Returns and refunds" },
  { path: "/size-guide", heading: "Size guide" },
  { path: "/faq", heading: "Frequently asked questions" },
  { path: "/privacy", heading: "Privacy and cookies" },
  { path: "/terms", heading: "Terms of sale" },
];

test.describe("storefront information and legal pages (Slice 13B)", () => {
  for (const { path, heading } of PAGES) {
    test(`${path} renders its page with a unique title`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page).toHaveTitle(`${heading} | Sohe's Nation`);
      await expect(page.getByText("Last updated")).toBeVisible();
      // Store placeholders are filled in by the API, never shown raw.
      await expect(page.locator("article")).not.toContainText("{{");
    });
  }

  test("contact page links to the support inbox from settings", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.locator("article").getByRole("link", { name: "support@sohenation.com" }),
    ).toHaveAttribute("href", "mailto:support@sohenation.com");
  });

  test("page body renders headings, lists, tables, and site links", async ({ page }) => {
    await page.goto("/size-guide");
    const article = page.locator("article");
    await expect(article.getByRole("table")).toBeVisible();
    await expect(article.getByRole("columnheader", { name: "Chest (cm)" })).toBeVisible();
    await expect(article.getByRole("heading", { level: 2, name: "How to measure" })).toBeVisible();

    await page.goto("/returns");
    await expect(page.locator("article ol li")).toHaveCount(3);
    // Slice 14F: final sale regions and window come from Settings → Returns.
    await expect(page.getByRole("heading", { level: 2, name: "Final sale and longer windows" })).toBeVisible();
    await expect(
      page.getByText(
        "Final sale applies to orders delivered to Nigeria, the United Kingdom, the United States and the European Union;",
      ),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Faulty or damaged items" })).toBeVisible();
    await page.locator("article").getByRole("link", { name: "account returns page" }).first().click();
    await expect(page).toHaveURL(/\/account\/returns$/);
  });

  test("unknown root paths return a real 404", async ({ page }) => {
    const response = await page.goto("/not-a-real-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Route off-grid" })).toBeVisible();
  });
});

test.describe("storefront footer navigation (Slice 13B)", () => {
  test("footer links reach shop, help, and legal pages", async ({ page }) => {
    await page.goto("/products");

    const help = page.getByRole("navigation", { name: "Footer help" });
    await expect(help.getByRole("link")).toHaveText([
      "Shipping and delivery",
      "Returns and refunds",
      "Size guide",
      "FAQ",
      "Track an order",
      "Contact us",
    ]);

    await page.getByRole("navigation", { name: "Footer legal" }).getByRole("link", { name: "Privacy and cookies" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole("heading", { level: 1, name: "Privacy and cookies" })).toBeVisible();

    await page.getByRole("navigation", { name: "Footer shop" }).getByRole("link", { name: "Women" }).click();
    await expect(page).toHaveURL(/\/women$/);
  });

  test("only social profiles set in settings are shown", async ({ page }) => {
    await page.goto("/faq");
    const social = page.getByRole("navigation", { name: "Social media" });
    await expect(social.getByRole("link")).toHaveCount(1);
    const instagram = social.getByRole("link", { name: /on Instagram/ });
    await expect(instagram).toHaveAttribute("href", "https://www.instagram.com/sohe.e2e");
    await expect(instagram).toHaveAttribute("target", "_blank");
  });

  test("the newsletter form links to the privacy policy", async ({ page }) => {
    await page.goto("/about");
    const form = page.getByRole("form", { name: "Newsletter sign-up" });
    await expect(form.getByRole("link", { name: "privacy policy" })).toHaveAttribute("href", "/privacy");
  });
});
