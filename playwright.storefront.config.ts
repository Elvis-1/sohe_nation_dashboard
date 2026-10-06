import { defineConfig, devices } from "@playwright/test";

import { E2E_API_BASE_URL, e2eApiServer } from "./playwright.config";

/**
 * Storefront e2e specs against the built storefront. Build it with test analytics IDs so the
 * consent spec can run (the IDs are never contacted; the spec stubs Google's and Meta's scripts):
 *   cd web/storefront && NEXT_PUBLIC_GA_MEASUREMENT_ID=G-E2ETEST NEXT_PUBLIC_META_PIXEL_ID=1234567890 npm run build
 * Server-rendered pages read the seeded e2e API; browser-side API calls are mocked per spec.
 */

// Every spec starts with analytics already declined, so the consent banner never covers the
// page. storefront-consent.spec.ts clears this to test the banner itself.
const CONSENT_DECLINED = encodeURIComponent(
  JSON.stringify({ analytics: false, marketing: false, v: 1, at: "2026-01-01T00:00:00.000Z" }),
);
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /storefront-.*\.spec\.ts/,
  fullyParallel: true,
  // The e2e API is a single Django dev server.
  workers: 2,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3200",
    storageState: {
      cookies: [
        {
          name: "sohe_consent",
          value: CONSENT_DECLINED,
          domain: "127.0.0.1",
          path: "/",
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    },
  },
  webServer: [
    e2eApiServer,
    {
      command: "cd ../web/storefront && npm run start -- --hostname 127.0.0.1 --port 3200",
      url: "http://127.0.0.1:3200/",
      reuseExistingServer: false,
      timeout: 120000,
      env: { API_INTERNAL_BASE_URL: E2E_API_BASE_URL },
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
