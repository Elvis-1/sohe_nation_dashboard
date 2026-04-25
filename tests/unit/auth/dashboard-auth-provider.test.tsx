import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
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

function ErrorHarness() {
  const { signIn } = useDashboardAuth();
  const [message, setMessage] = useState("none");

  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          const result = await signIn("wrong@example.com", "bad-password");
          setMessage(result.error ?? "none");
        }}
      >
        Capture sign in error
      </button>
      <div data-testid="sign-in-error">{message}</div>
    </div>
  );
}

describe("DashboardAuthProvider", () => {
  beforeAll(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(fetch).mockReset();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input.url;

      if (url.endsWith("/api/backend/auth/staff/login/")) {
        const rawBody = init?.body;
        const body =
          typeof rawBody === "string" ? (JSON.parse(rawBody) as { identifier?: string; password?: string }) : {};

        if (
          body.identifier !== "ops@sohesnation.com" ||
          body.password !== "dashboard-demo"
        ) {
          return new Response(
            JSON.stringify({
              error: { message: "Invalid credentials." },
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response(
          JSON.stringify({
            token: "staff-token",
            expires_at: "2026-12-31T23:59:59Z",
            user: {
              email: "ops@sohesnation.com",
              first_name: "Operations",
              last_name: "Desk",
              is_staff: true,
              is_superuser: false,
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (url.endsWith("/api/backend/auth/staff/session/")) {
        return new Response(null, { status: 401 });
      }

      return new Response(
        JSON.stringify({
          error: { message: "Invalid credentials." },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
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

  it("returns backend-provided login errors instead of a generic fallback", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input.url;

      if (url.endsWith("/api/backend/auth/staff/session/")) {
        return new Response(null, { status: 401 });
      }

      return new Response(
        JSON.stringify({
          error: { message: "backend_unreachable: connect ECONNREFUSED 127.0.0.1:8000" },
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    });

    render(
      <DashboardAuthProvider>
        <ErrorHarness />
      </DashboardAuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Capture sign in error" }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("sign-in-error")).toHaveTextContent(
        "backend_unreachable: connect ECONNREFUSED 127.0.0.1:8000",
      );
    });
  });
});
