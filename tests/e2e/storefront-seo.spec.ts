import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

// Slice 13C: landing pages, metadata, indexing control, sitemap, robots, and real 404s.
// Server-rendered from the seeded e2e API. Canonical URLs use the storefront's configured
// base URL, so they are matched by path.
//
// Indexing depends on how the storefront was built: only NEXT_PUBLIC_SITE_INDEXABLE=true
// (production) allows it. The spec reads robots.txt to learn the mode and checks the rules
// for that mode; run it against both builds before sign-off.

async function isIndexableBuild(request: APIRequestContext) {
  const robots = await (await request.get("/robots.txt")).text();
  return !/^Disallow: \/$/m.test(robots);
}

function meta(page: Page, selector: string) {
  return page.locator(selector).first();
}

async function robotsContent(page: Page) {
  const tags = page.locator('meta[name="robots"]');
  return (await tags.count()) ? await tags.first().getAttribute("content") : null;
}

test.describe("catalog landing pages", () => {
  const landings = [
    { path: "/men", heading: "Men's tactical streetwear.", title: "Men's Tactical Streetwear | Sohe Nation" },
    { path: "/women", heading: "Women's tactical streetwear.", title: "Women's Tactical Streetwear | Sohe Nation" },
    { path: "/collections/outerwear", heading: "Outerwear.", title: "Outerwear | Sohe Nation" },
    { path: "/collections/tracksuits", heading: "Tracksuits.", title: "Tracksuits | Sohe Nation" },
  ];

  for (const landing of landings) {
    test(`${landing.path} has its own heading, title, and canonical`, async ({ page }) => {
      const response = await page.goto(landing.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1, name: landing.heading })).toBeVisible();
      await expect(page).toHaveTitle(landing.title);
      await expect(meta(page, 'link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${landing.path}$`));
    });
  }

  test("landing pages show the right products", async ({ page }) => {
    await page.goto("/men");
    await expect(page.getByText("Lunar Utility Jacket").first()).toBeVisible();
    // Men includes unisex pieces.
    await expect(page.getByText("Varsity Crest Cap").first()).toBeVisible();
    await expect(page.getByText("Rally Knit Set")).toHaveCount(0);

    await page.goto("/collections/tracksuits");
    await expect(page.getByText("Rally Knit Set").first()).toBeVisible();
    await expect(page.getByText("Lunar Utility Jacket")).toHaveCount(0);
  });

  test("filtered views keep the landing canonical; search results are noindex, follow", async ({ page }) => {
    await page.goto("/men?size=M&sort=price-asc");
    await expect(meta(page, 'link[rel="canonical"]')).toHaveAttribute("href", /\/men$/);

    await page.goto("/products?query=jacket");
    await expect(meta(page, 'link[rel="canonical"]')).toHaveAttribute("href", /\/products$/);
    expect(await robotsContent(page)).toBe("noindex, follow");
  });

  test("the filter form stays on the landing page", async ({ page }) => {
    await page.goto("/women");
    await expect(page.getByRole("combobox", { name: "Gender" })).toHaveCount(0);
    await page.getByRole("combobox", { name: "Sort" }).selectOption("title");
    await page.getByRole("button", { name: "Apply Filters" }).click();
    await expect(page).toHaveURL(/\/women\?/);
  });

  test("header and footer link to the landing pages", async ({ page }) => {
    await page.goto("/stories");
    await expect(page.locator("header").getByRole("link", { name: "Men", exact: true }).first()).toHaveAttribute("href", "/men");
    const shop = page.getByRole("navigation", { name: "Footer shop" });
    await expect(shop.getByRole("link", { name: "Outerwear" })).toHaveAttribute("href", "/collections/outerwear");
  });
});

test.describe("old catalog URLs redirect permanently", () => {
  const cases = [
    { from: "/products?gender=men&size=M", to: "/men?size=M" },
    { from: "/products?gender=women", to: "/women" },
    { from: "/products?category=outerwear", to: "/collections/outerwear" },
    { from: "/products?category=tracksuit&sort=title", to: "/collections/tracksuits?sort=title" },
    { from: "/products?gender=women&category=tops", to: "/women?category=tops" },
  ];

  for (const { from, to } of cases) {
    test(`${from} → ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      expect(new URL(response.headers().location, "http://x").pathname + new URL(response.headers().location, "http://x").search).toBe(to);
    });
  }

  test("other catalog URLs are not redirected", async ({ request }) => {
    for (const path of ["/products", "/products?gender=unisex", "/products?category=not-a-category", "/products?query=cap"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBe(200);
    }
  });
});

test.describe("page metadata and share previews", () => {
  test("product pages describe the product and share its photo", async ({ page }) => {
    await page.goto("/products/lunar-utility-jacket");
    await expect(page).toHaveTitle("Lunar Utility Jacket: Weatherproof shell | Sohe Nation");
    await expect(meta(page, 'meta[name="description"]')).toHaveAttribute("content", "Lunar Utility Jacket for e2e runs.");
    await expect(meta(page, 'link[rel="canonical"]')).toHaveAttribute("href", /\/products\/lunar-utility-jacket$/);
    await expect(meta(page, 'meta[property="og:title"]')).toHaveAttribute("content", "Lunar Utility Jacket: Weatherproof shell | Sohe Nation");
    await expect(meta(page, 'meta[property="og:image"]')).not.toHaveAttribute("content", /share-card/);
    await expect(meta(page, 'meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  });

  test("staff search and share overrides replace the defaults", async ({ page }) => {
    await page.goto("/products/rally-knit-set");
    await expect(page).toHaveTitle("Rally Knit Set | Two-Piece Tracksuit | Sohe Nation");
    await expect(meta(page, 'meta[name="description"]')).toHaveAttribute(
      "content",
      "A two-piece knit tracksuit cut for movement.",
    );
    await expect(meta(page, 'meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://res.cloudinary.com/sohe-e2e/rally-share.jpg",
    );
  });

  test("pages without their own image use the branded share card", async ({ page, request }) => {
    await page.goto("/about");
    const image = await meta(page, 'meta[property="og:image"]').getAttribute("content");
    expect(image).toMatch(/\/share-card\.png$/);

    const card = await request.get("/share-card.png");
    expect(card.status()).toBe(200);
    expect(card.headers()["content-type"]).toBe("image/png");
  });

  test("story pages are articles with their own title", async ({ page }) => {
    await page.goto("/stories/built-like-an-army");
    await expect(page).toHaveTitle("Built Like An Army | Sohe Nation");
    await expect(meta(page, 'meta[property="og:type"]')).toHaveAttribute("content", "article");
  });

  test("home page leads with the brand", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Sohe Nation | Premium Tactical Streetwear, Built Like An Army");
    // The site root: the bare origin, with or without a trailing slash.
    await expect(meta(page, 'link[rel="canonical"]')).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
  });

  test("every public page has a unique title", async ({ page }) => {
    const paths = ["/", "/products", "/men", "/women", "/collections/headwear", "/stories", "/faq", "/products/rally-knit-set"];
    const titles = new Set<string>();
    for (const path of paths) {
      await page.goto(path);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(paths.length);
  });
});

test.describe("indexing control", () => {
  test("private pages are never indexed", async ({ page }) => {
    for (const path of ["/bag", "/checkout", "/checkout/return", "/account", "/account/orders"]) {
      await page.goto(path);
      expect(await robotsContent(page), path).toBe("noindex, nofollow");
    }
  });

  test("public pages follow the build's indexing mode", async ({ page, request }) => {
    const indexable = await isIndexableBuild(request);
    for (const path of ["/", "/men", "/products/lunar-utility-jacket", "/privacy"]) {
      await page.goto(path);
      expect(await robotsContent(page), path).toBe(indexable ? null : "noindex, nofollow");
    }
  });

  test("robots.txt matches the build's indexing mode", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    if (await isIndexableBuild(request)) {
      expect(body).toContain("Allow: /");
      expect(body).toContain("Disallow: /search");
      expect(body).toMatch(/Sitemap: .*\/sitemap\.xml/);
    } else {
      expect(body).toMatch(/^Disallow: \/$/m);
      expect(body).not.toContain("Sitemap:");
    }
  });

  test("sitemap lists public URLs only", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const xml = await response.text();
    for (const path of [
      "/men</loc>",
      "/collections/outerwear</loc>",
      "/products/lunar-utility-jacket</loc>",
      "/stories/built-like-an-army</loc>",
      "/privacy</loc>",
    ]) {
      expect(xml, path).toContain(path);
    }
    expect(xml).not.toContain("night-shift-cargo");
    expect(xml).not.toContain("e2e-edit-target");
    expect(xml).not.toContain("/account");
  });

  test("the web manifest is served", async ({ request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.name).toBe("Sohe Nation");
    expect(manifest.theme_color).toBe("#0B0B0B");
  });
});

test.describe("missing pages return a real 404", () => {
  for (const path of [
    "/products/not-a-real-product",
    "/stories/not-a-real-story",
    "/collections/not-a-collection",
    "/collections/constructor",
    "/not-a-real-page",
  ]) {
    test(path, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { name: "Route off-grid" })).toBeVisible();
    });
  }
});

// Slice 13D: schema.org structured data.
/* eslint-disable @typescript-eslint/no-explicit-any -- parsed JSON-LD is arbitrary JSON; the assertions below check its shape */
async function jsonLd(page: Page): Promise<Array<Record<string, any>>> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((text) => {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

function ofType(items: Array<Record<string, any>>, type: string) {
  return items.filter((item) => item["@type"] === type);
}

test.describe("structured data", () => {
  test("product pages describe every variant with price, stock, shipping, and returns", async ({ page }) => {
    await page.goto("/products/lunar-utility-jacket");
    const data = await jsonLd(page);
    const [group] = ofType(data, "ProductGroup");

    expect(group.name).toBe("Lunar Utility Jacket");
    expect(group.url).toMatch(/\/products\/lunar-utility-jacket$/);
    expect(group.brand).toEqual({ "@type": "Brand", name: "Sohe Nation" });
    expect(group.image.length).toBeGreaterThan(0);
    expect(group.variesBy).toEqual(["https://schema.org/size"]);
    expect(group).not.toHaveProperty("aggregateRating");
    expect(group).not.toHaveProperty("review");

    const skus = group.hasVariant.map((variant: any) => variant.sku).sort();
    expect(skus).toEqual(["SN-LUJ-BLK-L", "SN-LUJ-BLK-M"]);

    const offer = group.hasVariant[0].offers;
    expect(offer).toMatchObject({
      "@type": "Offer",
      price: "185000.00",
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    });
    expect(offer.shippingDetails[0]).toMatchObject({
      shippingRate: { value: "0.00", currency: "NGN" },
      shippingDestination: { addressCountry: "NG" },
    });
    expect(offer.hasMerchantReturnPolicy).toMatchObject({
      applicableCountry: ["NG"],
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
    });

    const [crumbs] = ofType(data, "BreadcrumbList");
    expect(crumbs.itemListElement.map((item: any) => item.name)).toEqual([
      "Home",
      "Shop All",
      "Outerwear",
      "Lunar Utility Jacket",
    ]);
  });

  test("each product's return policy follows its return rule (Slice 14F)", async ({ page }) => {
    // Seeded: knit is final sale (applies in every region by default), cap has a 30-day window.
    await page.goto("/products/rally-knit-set");
    const [knit] = ofType(await jsonLd(page), "ProductGroup");
    expect(knit.hasVariant[0].offers.hasMerchantReturnPolicy).toEqual({
      "@type": "MerchantReturnPolicy",
      applicableCountry: ["NG"],
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      merchantReturnLink: expect.stringMatching(/\/returns$/),
    });

    await page.goto("/products/varsity-crest-cap");
    const [cap] = ofType(await jsonLd(page), "ProductGroup");
    expect(cap.hasVariant[0].offers.hasMerchantReturnPolicy).toMatchObject({
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
    });
  });

  test("home page describes the organisation and website", async ({ page }) => {
    await page.goto("/");
    const data = await jsonLd(page);
    const [org] = ofType(data, "Organization");
    expect(org.name).toBe("Sohe Nation");
    expect(org.logo).toMatch(/\/icon\.png$/);
    // seed_e2e sets one Instagram link; blank social fields are left out.
    expect(org.sameAs).toEqual(["https://www.instagram.com/sohe.e2e"]);
    expect(org.contactPoint).toMatchObject({ contactType: "customer support", email: "support@sohenation.com" });
    expect(ofType(data, "WebSite")).toHaveLength(1);
  });

  test("landing pages carry breadcrumbs", async ({ page }) => {
    await page.goto("/men");
    const [crumbs] = ofType(await jsonLd(page), "BreadcrumbList");
    expect(crumbs.itemListElement.map((item: any) => item.name)).toEqual(["Home", "Men"]);

    await page.goto("/collections/headwear");
    const [collection] = ofType(await jsonLd(page), "BreadcrumbList");
    expect(collection.itemListElement.map((item: any) => item.name)).toEqual(["Home", "Shop All", "Headwear"]);
    expect(collection.itemListElement[2].item).toMatch(/\/collections\/headwear$/);
  });
});
