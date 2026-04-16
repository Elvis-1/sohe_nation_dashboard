import { test, expect, type Page } from "@playwright/test";

const demoEmail = "ops@sohesnation.com";
const demoPassword = "dashboard-demo";

async function signIn(page: Page) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(demoEmail);
  await page.getByLabel("Password").fill(demoPassword);
  await page.getByRole("button", { name: "Continue to overview" }).click();
  await expect(page).toHaveURL("/");
}

test.describe("dashboard implemented surfaces", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("shell exposes the expected top-level module navigation", async ({ page }) => {
    await expect(page.getByText("Control Desk")).toBeVisible();
    const sidebarNav = page.locator("aside nav");

    await expect(sidebarNav.locator('a[href="/"]').first()).toBeVisible();
    await expect(sidebarNav.locator('a[href="/products"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/orders"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/content"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/returns"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/customers"]')).toBeVisible();
    await expect(sidebarNav.locator('a[href="/settings"]')).toBeVisible();
  });

  test("tablet shell can open and close the sidebar navigation from the menu button", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 820, height: 1180 });

    const menuButton = page.getByRole("button", { name: /Menu/i });
    const sidebar = page.locator("#dashboard-sidebar");
    const backdrop = page.locator(".dashboard-backdrop");

    await expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toHaveAttribute("data-open", "true");
    await expect(backdrop).toHaveAttribute("data-open", "true");

    await backdrop.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar).toHaveAttribute("data-open", "false");
  });

  test("overview shows the planned operational summary blocks", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Daily control across the line." })).toBeVisible();
    await expect(page.getByText(/active order movements/i)).toBeVisible();
    await expect(page.getByText("Orders today", { exact: true })).toBeVisible();
    await expect(page.getByText("Revenue staged", { exact: true })).toBeVisible();
    await expect(page.getByText("Low stock", { exact: true })).toBeVisible();
    await expect(page.getByText("Returns awaiting review", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent orders" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Low stock watch" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Returns ready for review", exact: true }),
    ).toBeVisible();
  });

  test("overview quick actions and module cards lead to live module routes without dead ends", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Open module" }).first().click();
    await expect(page).toHaveURL("/returns");
    await expect(page.getByRole("heading", { name: "Process customer requests with a clear queue." })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Go to orders" }).click();
    await expect(page).toHaveURL("/orders");
    await expect(page.getByRole("heading", { name: "Track every purchase handoff." })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Open products" }).click();
    await expect(page).toHaveURL("/products");
    await expect(page.getByRole("heading", { name: "Catalog control for discovery and PDP." })).toBeVisible();
  });

  test("products module renders the fixture-backed catalog scaffold", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByRole("heading", { name: "Catalog control for discovery and PDP." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Product list" })).toBeVisible();
    await expect(page.getByText("Lunar Utility Jacket")).toBeVisible();
    await expect(page.getByText("Varsity Crest Cap")).toBeVisible();
  });

  test("orders module renders the fixture-backed order scaffold", async ({ page }) => {
    await page.goto("/orders");

    await expect(page.getByRole("heading", { name: "Track every purchase handoff." })).toBeVisible();
    await expect(page.getByText("Orders in motion")).toBeVisible();
    await expect(page.getByText("SOH-2034")).toBeVisible();
    await expect(page.getByText("Awaiting capture")).toBeVisible();
  });

  test("content module renders the fixture-backed content hub scaffold", async ({ page }) => {
    await page.goto("/content");

    await expect(page.getByRole("heading", { name: "Manage campaign and editorial surfaces." })).toBeVisible();
    await expect(page.getByText("Content hub")).toBeVisible();
    await expect(page.getByText("Homepage hero and lead merchandising rail")).toBeVisible();
  });

  test("returns module renders the fixture-backed queue scaffold", async ({ page }) => {
    await page.goto("/returns");

    await expect(page.getByRole("heading", { name: "Process customer requests with a clear queue." })).toBeVisible();
    await expect(page.getByText("Returns queue")).toBeVisible();
    await expect(page.getByText("RET-104")).toBeVisible();
    await expect(page.getByText("Fit exchange")).toBeVisible();
  });

  test("customers module renders the fixture-backed customer scaffold", async ({ page }) => {
    await page.goto("/customers");

    await expect(page.getByRole("heading", { name: "Profile, order, and return context in one place." })).toBeVisible();
    await expect(page.getByText("Customer list")).toBeVisible();
    await expect(page.getByText("Ada Nwosu")).toBeVisible();
    await expect(page.getByText("ada@example.com")).toBeVisible();
  });

  test("settings module renders the operational placeholder scaffold", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "Operational defaults before live wiring." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Settings groups" })).toBeVisible();
    await expect(page.getByText("Store profile", { exact: true })).toBeVisible();
    await expect(page.getByText("Staff roles placeholder", { exact: true })).toBeVisible();
  });

  test("unknown dashboard routes show the app not-found state", async ({ page }) => {
    await page.goto("/missing-route");

    await expect(page.getByText("This route is not part of the control map")).toBeVisible();
  });
});
