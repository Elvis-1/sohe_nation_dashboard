import { test, expect, type Page } from "@playwright/test";

const ownerEmail = "admin";
const ownerPassword = "admin123";

async function signInAs(page: Page, identifier: string, password: string) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(identifier);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Continue to overview" }).click();
  await expect(page).toHaveURL("/", { timeout: 10000 });
}

// Wait for the staff list to have rendered at least one member row
async function waitForStaffList(page: Page) {
  await page.waitForSelector('a[href^="/team/"]:not([href="/team"])', { timeout: 20000 });
}

// Exact-match "Manage" links (avoids the sidebar nav link "Manage staff accounts")
function memberManageLinks(page: Page) {
  return page.getByRole("link", { name: "Manage", exact: true });
}

// Find the member row that contains a specific email, then get its Manage link.
// .last() picks the innermost matching div (the actual row), not an ancestor container.
function manageForEmail(page: Page, email: string) {
  return page
    .locator("div")
    .filter({ has: page.locator("span", { hasText: email }) })
    .filter({ has: page.getByRole("link", { name: "Manage", exact: true }) })
    .last()
    .getByRole("link", { name: "Manage", exact: true });
}

test.describe("Slice 10 — Team: owner-level access", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, ownerEmail, ownerPassword);
  });

  test("team nav link is visible in the sidebar", async ({ page }) => {
    const sidebar = page.locator("aside nav");
    await expect(sidebar.locator('a[href="/team"]')).toBeVisible();
    await expect(sidebar.locator('a[href="/team"]')).toContainText("Team");
  });

  test("team page loads and displays the page header", async ({ page }) => {
    await page.goto("/team");
    // Session validation API call can be slow under parallel load — use generous timeout
    await expect(
      page.getByRole("heading", { name: "Staff access and role management." }),
    ).toBeVisible({ timeout: 20000 });
  });

  test("team page lists staff members with role badges and status", async ({ page }) => {
    await page.goto("/team");

    // Wait directly on content — skips the href-selector wait that flakes under parallel load
    await expect(page.getByText("admin@sohe.com", { exact: true })).toBeVisible({ timeout: 20000 });

    // Owner badge appears in content (strong element)
    await expect(
      page.locator("strong", { hasText: "Owner" }).first(),
    ).toBeVisible();

    // Tolu row
    await expect(page.getByText("tolu@sohesnation.com", { exact: true })).toBeVisible();
    // Status badge (Active or Inactive — depends on prior run state)
    await expect(page.locator("span", { hasText: /Active|Inactive/ }).first()).toBeVisible();
  });

  test("each staff member row has a Manage link to the detail page", async ({ page }) => {
    await page.goto("/team");
    await waitForStaffList(page);

    const links = memberManageLinks(page);
    await expect(links.first()).toBeVisible();
    expect(await links.count()).toBeGreaterThanOrEqual(2);
  });

  test("owner sees the Add staff member button", async ({ page }) => {
    await page.goto("/team");
    await waitForStaffList(page);
    await expect(page.getByRole("button", { name: "Add staff member" })).toBeVisible();
  });

  test("Add staff member button opens the invite form", async ({ page }) => {
    await page.goto("/team");
    await waitForStaffList(page);

    await page.getByRole("button", { name: "Add staff member" }).click();

    await expect(page.getByPlaceholder("Tolu", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("Adeyemi", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("tolu@sohesnation.com", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add member" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("Cancel closes the invite form without submitting", async ({ page }) => {
    await page.goto("/team");
    await waitForStaffList(page);

    await page.getByRole("button", { name: "Add staff member" }).click();
    await expect(page.getByRole("button", { name: "Add member" })).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByRole("button", { name: "Add staff member" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add member" })).not.toBeVisible();
  });

  test("owner can create a new staff member and see email invite confirmation", async ({
    page,
  }) => {
    const uniqueEmail = `e2e-${Date.now()}@sohesnation.com`;

    await page.goto("/team");
    await waitForStaffList(page);

    await page.getByRole("button", { name: "Add staff member" }).click();
    await page.getByPlaceholder("Tolu", { exact: true }).fill("E2E");
    await page.getByPlaceholder("Adeyemi", { exact: true }).fill("Testmember");
    await page.getByPlaceholder("tolu@sohesnation.com", { exact: true }).fill(uniqueEmail);
    await page.locator("select").last().selectOption("editor");
    await page.getByRole("button", { name: "Add member" }).click();

    await expect(page.getByText("Login details were sent by email.")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(uniqueEmail, { exact: true })).toBeVisible();
  });

  test("team detail page renders staff member info and audit log section", async ({ page }) => {
    await page.goto("/team");
    await waitForStaffList(page);

    await memberManageLinks(page).last().click();
    await expect(page).toHaveURL(/\/team\/.+/);

    await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible({ timeout: 8000 });
  });

  test("detail page shows role controls for non-owner member", async ({ page }) => {
    await page.goto("/team");
    await waitForStaffList(page);

    await manageForEmail(page, "tolu@sohesnation.com").click();
    await expect(page).toHaveURL(/\/team\/.+/);

    await expect(page.getByRole("heading", { name: "Role and access" })).toBeVisible({ timeout: 8000 });
    await expect(page.locator("select")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save role" })).toBeVisible();
    // Button label depends on current state — previous runs may have left tolu deactivated
    await expect(page.getByRole("button", { name: /Deactivate|Reactivate/ })).toBeVisible();
  });

  test("detail page shows owner-protected message for the owner account", async ({ page }) => {
    await page.goto("/team");
    await waitForStaffList(page);

    await manageForEmail(page, "admin@sohe.com").click();
    await expect(page).toHaveURL(/\/team\/.+/);

    await expect(page.getByRole("heading", { name: "Owner account" })).toBeVisible({ timeout: 8000 });
    await expect(
      page.getByText("Owner accounts cannot be modified through this interface."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Deactivate" })).not.toBeVisible();
  });

  test("owner can change a staff member role and audit log records the change", async ({
    page,
  }) => {
    await page.goto("/team");
    await waitForStaffList(page);

    await manageForEmail(page, "tolu@sohesnation.com").click();
    await expect(page).toHaveURL(/\/team\/.+/);
    await expect(page.getByRole("heading", { name: "Role and access" })).toBeVisible({ timeout: 8000 });

    // Pick a role different from the current one
    const select = page.locator("select");
    const currentRole = await select.inputValue();
    const newRole = currentRole === "admin" ? "editor" : "admin";
    await select.selectOption(newRole);
    await page.getByRole("button", { name: "Save role" }).click();

    // Audit log may have multiple "Role changed" entries from prior runs — first() is fine
    await expect(page.getByText("Role changed").first()).toBeVisible({ timeout: 8000 });
  });

  test("owner can deactivate and then reactivate a staff member", async ({ page }) => {
    await page.goto("/team");
    await waitForStaffList(page);

    await manageForEmail(page, "tolu@sohesnation.com").click();
    await expect(page).toHaveURL(/\/team\/.+/);

    const deactivateBtn = page.getByRole("button", { name: "Deactivate" });
    const reactivateBtn = page.getByRole("button", { name: "Reactivate" });

    // Normalize to Active state — a previous run may have left tolu deactivated
    await expect(deactivateBtn.or(reactivateBtn)).toBeVisible({ timeout: 8000 });
    if (await reactivateBtn.isVisible()) {
      await reactivateBtn.click();
      await expect(deactivateBtn).toBeVisible({ timeout: 8000 });
    }

    // Deactivate → verify → Reactivate → verify
    await deactivateBtn.click();
    await expect(reactivateBtn).toBeVisible({ timeout: 8000 });
    // Audit log accumulates entries across runs — first() avoids strict mode violation
    await expect(page.getByText("Deactivated").first()).toBeVisible();

    await reactivateBtn.click();
    await expect(deactivateBtn).toBeVisible({ timeout: 8000 });
    await expect(page.getByText("Reactivated").first()).toBeVisible();
  });

  test("Back to team link returns to the team list", async ({ page }) => {
    await page.goto("/team");
    await waitForStaffList(page);

    await memberManageLinks(page).first().click();
    await expect(page).toHaveURL(/\/team\/.+/);

    await page.getByRole("link", { name: "Back to team" }).click();
    await expect(page).toHaveURL("/team");
    await expect(
      page.getByRole("heading", { name: "Staff access and role management." }),
    ).toBeVisible();
  });

  test("unknown team member id shows not-found state with back link", async ({ page }) => {
    await page.goto("/team/00000000-0000-0000-0000-000000000000");
    await expect(page.getByText("Staff member not found.")).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("link", { name: "Back to team" })).toBeVisible();
  });
});
