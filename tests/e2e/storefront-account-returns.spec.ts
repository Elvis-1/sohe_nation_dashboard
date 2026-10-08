import { expect, test, type Page } from "@playwright/test";

import { STOREFRONT_API, apiOrder, money, signInCustomer } from "./support/storefront-customer";

// Slice 14E: customers return chosen items, with a quantity and reason each. Account calls are
// mocked; the API enforces the same rules again (apps/returns/tests/test_item_level_returns.py).

const ORDER_ID = "order-e2e-1";

function eligibility(overrides: Record<string, unknown> = {}) {
  return {
    eligible: true,
    faulty_only: false,
    remaining_quantity: 2,
    returnable_until: "2026-10-20T10:00:00Z",
    message: "Returnable within 14 days of delivery.",
    ...overrides,
  };
}

function orderDetail() {
  return {
    ...apiOrder({ id: ORDER_ID, can_report_faulty: true }),
    shipping_address: "12 Admiralty Way, Lagos",
    shipping_details: null,
    lines: [
      {
        id: "line-jacket",
        title: "Lunar Utility Jacket",
        variant_label: "Black / L",
        quantity: 2,
        unit_price: money(185000),
        return_policy: "standard",
        return_window_days: 14,
        return_eligibility: eligibility(),
      },
      {
        id: "line-knit",
        title: "Rally Knit Set",
        variant_label: "Ash / S",
        quantity: 1,
        unit_price: money(132000),
        return_policy: "final_sale",
        return_window_days: null,
        return_eligibility: eligibility({
          faulty_only: true,
          remaining_quantity: 1,
          returnable_until: null,
          message: "Final sale: can be returned only if faulty.",
        }),
      },
      {
        id: "line-cap",
        title: "Varsity Crest Cap",
        variant_label: "Sand / One size",
        quantity: 1,
        unit_price: money(42000),
        return_policy: "custom",
        return_window_days: 30,
        return_eligibility: eligibility({
          eligible: false,
          remaining_quantity: 0,
          returnable_until: null,
          message: "This item is already in a return request.",
        }),
      },
    ],
  };
}

async function signInWithOrder(page: Page) {
  await signInCustomer(page, { orders: [apiOrder({ id: ORDER_ID, can_report_faulty: true })] });
  // Registered after the account mocks, so it wins for the detail read.
  await page.route(`${STOREFRONT_API}/account/orders/${ORDER_ID}/`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(orderDetail()) }),
  );
}

async function captureReturnPost(page: Page, response: { status: number; body: unknown }) {
  const posted: Array<Record<string, unknown>> = [];
  await page.route(`${STOREFRONT_API}/account/returns/**`, async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    posted.push(route.request().postDataJSON());
    await route.fulfill({ status: response.status, contentType: "application/json", body: JSON.stringify(response.body) });
  });
  return posted;
}

test.describe("storefront account returns", () => {
  test("order detail shows each item's return status and starts a return for that order", async ({ page }) => {
    await signInWithOrder(page);
    await page.goto(`/account/orders/${ORDER_ID}`);

    const jacket = page.getByLabel("Returns for Lunar Utility Jacket");
    await expect(jacket).toContainText("Returnable within 14 days of delivery.");
    await expect(jacket).toContainText("Return by 20 Oct 2026");
    await expect(page.getByLabel("Returns for Rally Knit Set")).toContainText("Final sale");
    await expect(page.getByLabel("Returns for Varsity Crest Cap")).toContainText("already in a return request");
    await expect(page.getByRole("link", { name: "Start Return" })).toHaveAttribute(
      "href",
      `/account/returns?order=${ORDER_ID}`,
    );
  });

  test("customers choose items, quantities, and reasons", async ({ page }) => {
    await signInWithOrder(page);
    const posted = await captureReturnPost(page, {
      status: 201,
      body: {
        id: "return-e2e-1",
        order_id: ORDER_ID,
        status: "new",
        reason: "Wrong size or fit, Faulty or damaged",
        item_summary: "Lunar Utility Jacket / Black / L ×2; Rally Knit Set / Ash / S ×1",
        customer_note: "",
        requested_at: "2026-10-06T10:00:00Z",
        lines: [],
      },
    });

    await page.goto(`/account/returns?order=${ORDER_ID}`);
    const submit = page.getByRole("button", { name: "Submit Return Request" });
    await expect(page.getByLabel("Return Lunar Utility Jacket")).toBeVisible();
    await expect(submit).toBeDisabled();

    // Already-requested items can't be picked.
    await expect(page.getByLabel("Return Varsity Crest Cap")).toBeDisabled();

    await page.getByLabel("Return Lunar Utility Jacket").check();
    await page.getByLabel("Quantity of Lunar Utility Jacket").selectOption("2");
    await expect(submit).toBeDisabled(); // no reason yet
    await page.getByLabel("Reason for Lunar Utility Jacket").selectOption("wrong_size");

    // Final sale: "Faulty or damaged" is the only reason offered.
    await page.getByLabel("Return Rally Knit Set").check();
    const knitReason = page.getByLabel("Reason for Rally Knit Set");
    await expect(knitReason.locator("option")).toHaveText(["Faulty or damaged"]);

    await submit.click();
    await expect(page.getByText("Return request submitted.")).toBeVisible();
    expect(posted[0]).toEqual({
      order_id: ORDER_ID,
      lines: [
        { order_line_id: "line-jacket", quantity: 2, reason_code: "wrong_size" },
        { order_line_id: "line-knit", quantity: 1, reason_code: "faulty" },
      ],
    });
  });

  test("a refused item shows why next to it", async ({ page }) => {
    await signInWithOrder(page);
    await captureReturnPost(page, {
      status: 409,
      body: {
        error: {
          code: "return_line_not_eligible",
          message: "Only 1 of Lunar Utility Jacket can still be returned.",
          lines: [{ order_line_id: "line-jacket", message: "Only 1 of Lunar Utility Jacket can still be returned." }],
        },
      },
    });

    await page.goto(`/account/returns?order=${ORDER_ID}`);
    await page.getByLabel("Return Lunar Utility Jacket").check();
    await page.getByLabel("Reason for Lunar Utility Jacket").selectOption("changed_mind");
    await page.getByRole("button", { name: "Submit Return Request" }).click();

    await expect(page.getByText("Some items can't be returned as chosen.")).toBeVisible();
    await expect(page.getByRole("group", { name: "Lunar Utility Jacket" }).getByRole("alert")).toHaveText(
      "Only 1 of Lunar Utility Jacket can still be returned.",
    );
  });

  test("orders with nothing to return cannot be selected", async ({ page }) => {
    await signInCustomer(page, {
      orders: [apiOrder({ is_return_eligible: false, can_report_faulty: false })],
    });

    await page.goto("/account/returns");

    await expect(page.getByText("None of your orders are currently eligible for a return.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit Return Request" })).toBeDisabled();
  });
});
