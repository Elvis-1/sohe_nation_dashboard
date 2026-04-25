import { expect, test, type Page } from "@playwright/test";

const demoEmail = "ops@sohesnation.com";
const demoPassword = "dashboard-demo";
const sessionToken = "responsive-test-token";

const product = {
  id: "prod_sunline_tee",
  slug: "sunline-training-tee",
  title: "Sunline Training Tee",
  subtitle: "Lightweight top for warm-weather sessions.",
  category: "tops",
  gender: "unisex",
  visibility: "published",
  price: { amount: 62000, currency: "NGN", formatted: "NGN 62,000" },
  compare_at_price: { amount: 70000, currency: "NGN", formatted: "NGN 70,000" },
  inventory_quantity: 4,
  primary_media: {
    id: "media_sunline_primary",
    alt: "Sunline Training Tee front view",
    kind: "image",
    url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
    is_primary: true,
  },
  shipping: { amount: 3500, currency: "NGN", formatted: "NGN 3,500" },
  narrative: {
    campaign_note: "Light movement and warm-weather layering.",
    fit_guidance: "Relaxed fit through the body.",
    material_story: "Soft jersey tuned for everyday wear.",
    sustainability_note: "Produced in limited small-batch runs.",
    delivery_note: "Dispatches within 2 business days.",
  },
  variants: [
    {
      id: "variant_sunline_m",
      sku: "SUN-TEE-WHT-M",
      size: "M",
      color: "White",
      inventory_quantity: 4,
      is_available: true,
      price: { amount: 62000, currency: "NGN", formatted: "NGN 62,000" },
      compare_at_price: { amount: 70000, currency: "NGN", formatted: "NGN 70,000" },
    },
  ],
  badge: "Low stock",
  description: "Breathable training tee with clean merchandising copy.",
  default_region: "NG",
  region_availability: ["NG", "US", "GB"],
};

const order = {
  id: "order_soh_2034",
  order_number: "SOH-2034",
  customer_id: "customer_ada_nwosu",
  customer_name: "Ada Nwosu",
  customer_email: "ada@example.com",
  status: "ready_to_fulfill",
  payment_provider: "paystack",
  total: { amount: 124000, currency: "NGN", formatted: "NGN 124,000" },
  created_at: "2026-04-15T10:00:00Z",
  shipping_address: "12 Admiralty Way, Lekki, Lagos",
  fulfillment_note: "Packed and ready for courier pickup.",
  internal_note: "VIP dispatch window before noon.",
  lines: [
    {
      id: "line_soh_2034_1",
      product_id: product.id,
      variant_id: "variant_sunline_m",
      title: product.title,
      variant_label: "White / M",
      quantity: 2,
      unit_price: { amount: 62000, currency: "NGN", formatted: "NGN 62,000" },
    },
  ],
};

const returnRecord = {
  id: "RET-103",
  order_id: "SOH-2026",
  customer_id: "customer_ada_nwosu",
  customer_name: "Ada Nwosu",
  customer_email: "ada@example.com",
  status: "in_review",
  reason: "damaged",
  requested_at: "2026-04-18T09:30:00Z",
  item_summary: "Varsity Crest Cap / Sand / One size",
  customer_note: "The brim arrived bent and the front panel stitching looks split.",
  internal_decision: "Inspection in progress.",
};

const customer = {
  id: "customer_ada_nwosu",
  email: "ada@example.com",
  first_name: "Ada",
  last_name: "Nwosu",
  default_region: "NG",
  order_count: 3,
  return_count: 1,
  address_count: 2,
  order_ids: [order.id],
  return_ids: [returnRecord.id],
};

const contentRecord = {
  id: "homepage",
  area: "homepage",
  slug: "homepage",
  title: "Homepage hero and lead merchandising rail",
  visibility: "ready",
  eyebrow: "Featured drop",
  headline: "Homepage and featured drop editor.",
  body: "Lead release framing for the current merchandising push.",
  summary: "Homepage summary",
  call_to_action_label: "Shop the drop",
  call_to_action_href: "/products",
  secondary_call_to_action_label: "Read the story",
  secondary_call_to_action_href: "/content/stories",
  chapter_label: "Week two",
  campaign_statement: "Campaign support across homepage surfaces.",
  linked_product_ids: [product.id],
  media_references: [
    {
      id: "content_media_homepage",
      alt: "Homepage editorial still",
      kind: "image",
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
    },
  ],
  preview_bullets: ["Hero reset", "Lead rail", "CTA refresh"],
  campaign_stats: [{ label: "Looks", value: "12" }],
  modules: [{ title: "Lead story", body: "Editorial framing for the homepage." }],
  hotspots: [
    {
      id: "hotspot_1",
      label: "Lead look",
      product_slug: product.slug,
      top: "58%",
      left: "44%",
      note: "Lead look note",
    },
  ],
};

const settingsGroups = [
  {
    id: "store_profile",
    title: "Store profile",
    description: "Profile defaults used across support and storefront handoff.",
    fields: [
      { id: "support_email", label: "Support email", value: "ops@sohesnation.com", placeholder: false },
      { id: "support_phone", label: "Support phone", value: "+234 800 000 0000", placeholder: false },
    ],
  },
  {
    id: "staff_roles_placeholder",
    title: "Staff roles placeholder",
    description: "Placeholder copy while live role policies are refined.",
    fields: [
      { id: "session_mode", label: "Session mode", value: "Fixture mode with persistence", placeholder: true },
    ],
  },
];

const staffMembers = [
  {
    id: "staff_owner",
    email: "admin@sohe.com",
    first_name: "Admin",
    last_name: "Owner",
    role: "owner",
    is_active: true,
    is_owner: true,
    created_at: "2026-04-01T09:00:00Z",
    audit_log: [],
  },
  {
    id: "staff_tolu",
    email: "tolu@sohesnation.com",
    first_name: "Tolu",
    last_name: "Adeyemi",
    role: "editor",
    is_active: true,
    is_owner: false,
    created_at: "2026-04-09T11:00:00Z",
    audit_log: [
      {
        action: "Role changed",
        performed_by_email: "admin@sohe.com",
        metadata: { from: "viewer", to: "editor" },
        created_at: "2026-04-14T08:00:00Z",
      },
    ],
  },
];

const notificationLogs = [
  {
    id: "notif_1",
    retry_of_id: null,
    event_type: "order_confirmation",
    recipient_email: "ada@example.com",
    subject: "Your order is confirmed",
    backend_name: "smtp",
    status: "sent",
    attempt_number: 1,
    sent_at: "2026-04-20T10:30:00Z",
    last_attempted_at: "2026-04-20T10:30:00Z",
    provider_response: "250 Accepted",
    error_message: "",
    can_retry: false,
    created_at: "2026-04-20T10:29:30Z",
  },
];

const providerStatus = {
  backend_name: "smtp",
  delivery_mode: "live",
  is_live_backend: true,
  is_configured: true,
  host: "smtp.zoho.com",
  port: 587,
  host_user_masked: "su***@sohesnation.com",
  use_tls: true,
  default_from_email: "Sohe's Nation <support@sohesnation.com>",
  notes: "Responsive test fixture provider status",
};

const viewports = [
  { label: "mobile", size: { width: 390, height: 844 } },
  { label: "tablet", size: { width: 820, height: 1180 } },
] as const;

const routes = [
  { path: "/", heading: "Daily operations at a glance." },
  { path: "/products", heading: "Catalog control for discovery and PDP." },
  { path: "/products/new", heading: "Product fields" },
  { path: "/orders", heading: "Track every purchase handoff." },
  { path: "/orders/order_soh_2034", heading: "Order SOH-2034" },
  { path: "/returns", heading: "Process customer requests with a clear queue." },
  { path: "/returns/RET-103", heading: "Return RET-103" },
  { path: "/customers", heading: "Profile, order, and return context in one place." },
  { path: "/customers/customer_ada_nwosu", heading: "Ada Nwosu" },
  { path: "/content", heading: "Manage campaign and editorial surfaces." },
  { path: "/content/homepage", heading: "Homepage and featured drop editor." },
  { path: "/notifications", heading: "Delivery log and retry control." },
  { path: "/settings", heading: "Operational defaults with live API backing." },
  { path: "/team", heading: "Staff access and role management." },
] as const;

async function signIn(page: Page) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(demoEmail);
  await page.getByLabel("Password").fill(demoPassword);
  await page.getByRole("button", { name: "Continue to overview" }).click();
  await expect(page).toHaveURL("/");
}

async function mockDashboardApi(page: Page) {
  await page.route("**/api/backend/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^\/api\/backend/, "");
    const method = route.request().method();

    const json = (body: unknown) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });

    if (path === "/auth/staff/login/" && method === "POST") {
      return json({
        token: sessionToken,
        expires_at: "2026-12-31T23:59:59Z",
        user: {
          email: demoEmail,
          first_name: "Operations",
          last_name: "Desk",
          is_staff: true,
          is_superuser: false,
        },
      });
    }

    if (path === "/auth/staff/session/" && method === "GET") {
      return json({
        token: sessionToken,
        expires_at: "2026-12-31T23:59:59Z",
        user: {
          email: demoEmail,
          first_name: "Operations",
          last_name: "Desk",
          is_staff: true,
          is_superuser: false,
        },
      });
    }

    if (path.startsWith("/dashboard/catalog/products")) {
      if (path === `/dashboard/catalog/products/${product.id}`) {
        return json(product);
      }
      return json({ count: 1, next: null, previous: null, results: [product] });
    }

    if (path.startsWith("/dashboard/orders")) {
      if (path === `/dashboard/orders/${order.id}`) {
        return json(order);
      }
      return json({ count: 1, next: null, previous: null, results: [order] });
    }

    if (path.startsWith("/dashboard/returns")) {
      if (path === `/dashboard/returns/${returnRecord.id}`) {
        return json(returnRecord);
      }
      return json({ count: 1, next: null, previous: null, results: [returnRecord] });
    }

    if (path.startsWith("/dashboard/customers")) {
      if (path === `/dashboard/customers/${customer.id}/` || path === `/dashboard/customers/${customer.id}`) {
        return json(customer);
      }
      return json({ count: 1, results: [customer] });
    }

    if (path.startsWith("/dashboard/content")) {
      if (path === `/dashboard/content/${contentRecord.id}`) {
        return json(contentRecord);
      }
      return json({ count: 1, next: null, previous: null, results: [contentRecord] });
    }

    if (path === "/dashboard/settings") {
      return json(settingsGroups);
    }

    if (path.startsWith("/dashboard/staff")) {
      if (path === `/dashboard/staff/${staffMembers[1].id}` || path === `/dashboard/staff/${staffMembers[0].id}`) {
        const member = staffMembers.find((item) => path.endsWith(item.id));
        return json(member);
      }
      return json(staffMembers);
    }

    if (path === "/dashboard/notifications/provider/") {
      return json(providerStatus);
    }

    if (path === "/dashboard/notifications/provider/test/" && method === "POST") {
      return json({
        recipient_email: "ops@sohesnation.com",
        sent_count: 1,
        backend_name: providerStatus.backend_name,
        delivery_mode: providerStatus.delivery_mode,
        default_from_email: providerStatus.default_from_email,
      });
    }

    if (path === "/dashboard/notifications/" || path.startsWith("/dashboard/notifications/?")) {
      return json({ count: 1, next: null, previous: null, results: notificationLogs });
    }

    return route.fulfill({ status: 404, body: "Not mocked in responsive test" });
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));

  expect(Math.max(dimensions.body, dimensions.document)).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  );
}

test.describe("dashboard responsive coverage", () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardApi(page);
    await signIn(page);
  });

  for (const viewport of viewports) {
    test(`${viewport.label} shell navigation stays usable`, async ({ page }) => {
      await page.setViewportSize(viewport.size);
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /Menu/i });
      const sidebar = page.locator("#dashboard-sidebar");

      await expect(menuButton).toBeVisible();
      await menuButton.click();
      await expect(sidebar).toHaveAttribute("data-open", "true");
      await expectNoHorizontalOverflow(page);
    });

    test(`${viewport.label} shell navigation remains scrollable on short screens`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.size.width, height: 560 });
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /Menu/i });
      const sidebar = page.locator("#dashboard-sidebar");
      const nav = page.locator(".dashboard-nav");

      await menuButton.click();
      await expect(sidebar).toHaveAttribute("data-open", "true");

      const scrollInfo = await nav.evaluate((element) => {
        const navElement = element as HTMLElement;
        const startTop = navElement.scrollTop;
        navElement.scrollTop = 9999;

        return {
          startTop,
          endTop: navElement.scrollTop,
          clientHeight: navElement.clientHeight,
          scrollHeight: navElement.scrollHeight,
          overflowY: window.getComputedStyle(navElement).overflowY,
        };
      });

      expect(scrollInfo.overflowY).toBe("auto");
      expect(scrollInfo.scrollHeight).toBeGreaterThan(scrollInfo.clientHeight);
      expect(scrollInfo.endTop).toBeGreaterThan(scrollInfo.startTop);
    });

    for (const route of routes) {
      test(`${viewport.label} route ${route.path} does not overflow horizontally`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport.size);
        await page.goto(route.path);
        await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
        await expectNoHorizontalOverflow(page);
      });
    }
  }
});
