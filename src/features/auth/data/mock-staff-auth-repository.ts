export const DASHBOARD_DEMO_CREDENTIALS = {
  email: "ops@sohesnation.com",
  password: "dashboard-demo",
} as const;

const DASHBOARD_SESSION_DURATION_MS = 1000 * 60 * 45;

export type DashboardSessionRecord = {
  email: string;
  name: string;
  role: string;
  expiresAt: number;
};

export function isValidDashboardDemoCredential(email: string, password: string) {
  return (
    email.trim().toLowerCase() === DASHBOARD_DEMO_CREDENTIALS.email &&
    password === DASHBOARD_DEMO_CREDENTIALS.password
  );
}

export function createDashboardDemoSession(email: string): DashboardSessionRecord {
  return {
    email: email.trim().toLowerCase(),
    name: "Operations Desk",
    role: "Staff Access",
    expiresAt: Date.now() + DASHBOARD_SESSION_DURATION_MS,
  };
}
