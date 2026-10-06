import { defineConfig, devices } from "@playwright/test";

/** Isolated API for e2e runs: own database, console email (see api/scripts/run_e2e_api.sh). */
export const E2E_API_BASE_URL = "http://127.0.0.1:8001/api/v1";

export const e2eApiServer = {
  command: "../api/scripts/run_e2e_api.sh",
  url: `${E2E_API_BASE_URL}/settings/storefront/`,
  reuseExistingServer: false,
  timeout: 180000,
};

export default defineConfig({
  testDir: "./tests/e2e",
  // Storefront specs run against the storefront app: playwright.storefront.config.ts.
  testIgnore: /storefront-.*\.spec\.ts/,
  fullyParallel: true,
  // Specs share the seeded owner account, and a staff sign-in revokes that user's other
  // staff tokens (apps/authentication issue_staff_token), so parallel workers log each other out.
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  webServer: [
    e2eApiServer,
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100/signin",
      reuseExistingServer: false,
      timeout: 120000,
      env: { DASHBOARD_API_INTERNAL_BASE_URL: E2E_API_BASE_URL },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
