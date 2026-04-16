import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  DashboardAuthProvider,
  hasExpiredDashboardSession,
  useDashboardAuth,
} from "@/src/features/auth/presentation/state/dashboard-auth-provider";

const sessionStorageKey = "sohe-dashboard-session";
const expiredSessionFlagKey = "sohe-dashboard-session-expired";

function AuthHarness() {
  const { isAuthenticated, session, signIn, signOut } = useDashboardAuth();

  return (
    <div>
      <div data-testid="auth-state">{isAuthenticated ? "authenticated" : "anonymous"}</div>
      <div data-testid="session-email">{session?.email ?? "none"}</div>
      <button
        type="button"
        onClick={async () => {
          await signIn("ops@sohesnation.com", "dashboard-demo");
        }}
      >
        Sign in valid
      </button>
      <button
        type="button"
        onClick={async () => {
          await signIn("wrong@example.com", "bad-password");
        }}
      >
        Sign in invalid
      </button>
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}

describe("DashboardAuthProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts anonymous without a stored session", () => {
    render(
      <DashboardAuthProvider>
        <AuthHarness />
      </DashboardAuthProvider>,
    );

    expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("session-email")).toHaveTextContent("none");
  });

  it("authenticates and stores a session with valid credentials", async () => {
    render(
      <DashboardAuthProvider>
        <AuthHarness />
      </DashboardAuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sign in valid" }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated");
    });

    const storedSession = window.localStorage.getItem(sessionStorageKey);
    expect(storedSession).not.toBeNull();
    expect(screen.getByTestId("session-email")).toHaveTextContent("ops@sohesnation.com");
    expect(hasExpiredDashboardSession()).toBe(false);
  });

  it("does not authenticate with invalid credentials", async () => {
    render(
      <DashboardAuthProvider>
        <AuthHarness />
      </DashboardAuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sign in invalid" }));
    });

    expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    expect(window.localStorage.getItem(sessionStorageKey)).toBeNull();
  });

  it("clears session and expiry flags on sign out", async () => {
    render(
      <DashboardAuthProvider>
        <AuthHarness />
      </DashboardAuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sign in valid" }));
    });

    window.localStorage.setItem(expiredSessionFlagKey, "true");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    });

    expect(window.localStorage.getItem(sessionStorageKey)).toBeNull();
    expect(window.localStorage.getItem(expiredSessionFlagKey)).toBeNull();
  });

  it("treats expired stored sessions as anonymous and flags expiry", () => {
    window.localStorage.setItem(
      sessionStorageKey,
      JSON.stringify({
        email: "ops@sohesnation.com",
        name: "Operations Desk",
        role: "Staff Access",
        expiresAt: Date.now() - 60_000,
      }),
    );

    render(
      <DashboardAuthProvider>
        <AuthHarness />
      </DashboardAuthProvider>,
    );

    expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous");
    expect(window.localStorage.getItem(sessionStorageKey)).toBeNull();
    expect(hasExpiredDashboardSession()).toBe(true);
  });
});
