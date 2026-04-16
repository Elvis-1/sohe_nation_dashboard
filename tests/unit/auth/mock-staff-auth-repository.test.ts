import {
  DASHBOARD_DEMO_CREDENTIALS,
  createDashboardDemoSession,
  isValidDashboardDemoCredential,
} from "@/src/features/auth/data/mock-staff-auth-repository";

describe("mock staff auth repository", () => {
  it("accepts the documented demo credentials", () => {
    expect(
      isValidDashboardDemoCredential(
        DASHBOARD_DEMO_CREDENTIALS.email,
        DASHBOARD_DEMO_CREDENTIALS.password,
      ),
    ).toBe(true);
  });

  it("normalizes email input when validating credentials", () => {
    expect(
      isValidDashboardDemoCredential(
        "  OPS@SOHESNATION.COM ",
        DASHBOARD_DEMO_CREDENTIALS.password,
      ),
    ).toBe(true);
  });

  it("rejects invalid credentials", () => {
    expect(isValidDashboardDemoCredential("wrong@example.com", "bad-password")).toBe(false);
  });

  it("creates a staff access session with the expected defaults", () => {
    const before = Date.now();
    const session = createDashboardDemoSession("  OPS@SOHESNATION.COM ");
    const after = Date.now();

    expect(session.email).toBe(DASHBOARD_DEMO_CREDENTIALS.email);
    expect(session.name).toBe("Operations Desk");
    expect(session.role).toBe("Staff Access");
    expect(session.expiresAt).toBeGreaterThan(before);
    expect(session.expiresAt).toBeLessThanOrEqual(after + 1000 * 60 * 45);
  });
});
