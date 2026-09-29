import { defineConfig, devices } from "@playwright/test";

import { E2E_API_BASE_URL, e2eApiServer } from "./playwright.config";

/**
 * Storefront e2e specs against the built storefront (`npm run build` in web/storefront first).
 * Server-rendered pages read the seeded e2e API; browser-side API calls are mocked per spec.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /storefront-.*\.spec\.ts/,
  fullyParallel: true,
  // The e2e API is a single Django dev server.
  workers: 2,
  retries: 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3200" },
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
