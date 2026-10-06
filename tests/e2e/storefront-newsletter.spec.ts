import { expect, test, type Page } from "@playwright/test";

// Glob so route mocks match whichever API host the storefront env points at.
const API_BASE = "**/api/v1";
const SUBSCRIBE = `${API_BASE}/marketing/subscribe/`;
const CONFIRM = `${API_BASE}/marketing/subscribe/confirm/`;

function newsletterForm(page: Page) {
  return page.getByRole("form", { name: "Newsletter sign-up" });
}

test.describe("storefront newsletter sign-up (Slice 13A)", () => {
  test("footer sign-up reports success only after the API accepts it", async ({ page }) => {
    let body: Record<string, string> | null = null;
    await page.route(SUBSCRIBE, async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ message: "Check your inbox to confirm your place on the drop list." }),
      });
    });

    await page.goto("/products");
    const form = newsletterForm(page);
    await form.getByPlaceholder("Email address").fill("  ada@example.com ");
    await form.getByRole("button", { name: "Join The List" }).click();

    await expect(form.getByRole("status")).toHaveText(
      "Check your inbox to confirm your place on the drop list.",
    );
    expect(body).toEqual({ email: "ada@example.com", source: "footer" });
    await expect(form.getByPlaceholder("Email address")).toHaveValue("");
  });

  test("an invalid email is rejected without calling the API", async ({ page }) => {
    let called = false;
    await page.route(SUBSCRIBE, async (route) => {
      called = true;
      await route.abort();
    });

    await page.goto("/products");
    const form = newsletterForm(page);
    await form.getByPlaceholder("Email address").fill("not-an-email");
    await form.getByRole("button", { name: "Join The List" }).click();

    await expect(form.getByRole("status")).toHaveText(
      "Enter a valid email so we can hold your place on the drop list.",
    );
    expect(called).toBe(false);
  });

  test("throttled and failed sign-ups never show success", async ({ page }) => {
    let attempt = 0;
    await page.route(SUBSCRIBE, async (route) => {
      attempt += 1;
      await route.fulfill(
        attempt === 1
          ? {
              status: 429,
              contentType: "application/json",
              body: JSON.stringify({ error: { code: "http_429", message: "Request was throttled." } }),
            }
          : { status: 500, contentType: "text/plain", body: "boom" },
      );
    });

    await page.goto("/products");
    const form = newsletterForm(page);
    const input = form.getByPlaceholder("Email address");
    const submit = form.getByRole("button", { name: "Join The List" });

    await input.fill("ada@example.com");
    await submit.click();
    await expect(form.getByRole("status")).toHaveText(
      "Too many attempts. Give it a little while, then try again.",
    );
    // The address stays so the shopper can retry.
    await expect(input).toHaveValue("ada@example.com");

    await submit.click();
    await expect(form.getByRole("status")).toHaveText("We could not add you right now. Please try again.");
    await expect(page.getByText("Check your inbox")).toHaveCount(0);
  });
});

test.describe("storefront newsletter confirmation page (Slice 13A)", () => {
  test("confirms only when the button is clicked", async ({ page }) => {
    let body: Record<string, string> | null = null;
    await page.route(CONFIRM, async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "You are on the list. First notice goes to your inbox." }),
      });
    });

    await page.goto("/newsletter/confirm?token=abc123");
    await expect(page.getByRole("heading", { name: "Confirm your place." })).toBeVisible();
    expect(body).toBeNull();

    await page.getByRole("button", { name: "Confirm drop alerts" }).click();

    await expect(page.getByRole("heading", { name: "You're on the list." })).toBeVisible();
    expect(body).toEqual({ token: "abc123" });
    await expect(page.getByRole("button", { name: "Confirm drop alerts" })).toHaveCount(0);
  });

  test("shows the API message for a used or expired link", async ({ page }) => {
    await page.route(CONFIRM, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "newsletter_confirmation_invalid",
            message:
              "This confirmation link is no longer valid. If you already confirmed, you are on the list.",
          },
        }),
      });
    });

    await page.goto("/newsletter/confirm?token=used-token");
    await page.getByRole("button", { name: "Confirm drop alerts" }).click();

    await expect(
      page.getByText(
        "This confirmation link is no longer valid. If you already confirmed, you are on the list.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Confirm your place." })).toBeVisible();
  });

  test("a link without a token explains itself and offers no button", async ({ page }) => {
    await page.goto("/newsletter/confirm");
    await expect(
      page.getByText("This confirmation link is incomplete. Open the link from your email again."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm drop alerts" })).toHaveCount(0);
  });

  test("the confirmation page is not indexable", async ({ page }) => {
    await page.goto("/newsletter/confirm?token=abc123");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  });
});
