"use client";

import { createContext, useContext, useEffect, useState } from "react";

const SESSION_STORAGE_KEY = "sohe-dashboard-session";
const SESSION_EXPIRED_FLAG_KEY = "sohe-dashboard-session-expired";

type DashboardSession = {
  token: string;
  email: string;
  name: string;
  role: string;
  isOwner: boolean;
  expiresAt: number;
};

type AuthPayload = {
  token: string;
  expires_at: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
  };
};

type AuthErrorPayload = {
  error?: {
    message?: string;
    code?: string;
    target?: string;
    status?: number;
  };
};

type DashboardAuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  session: DashboardSession | null;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  acceptInvite: (token: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const DashboardAuthContext = createContext<DashboardAuthContextValue | null>(null);

function readStoredSession(): DashboardSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as DashboardSession;
    if (parsedValue.expiresAt <= Date.now()) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.localStorage.setItem(SESSION_EXPIRED_FLAG_KEY, "true");
      return null;
    }
    return parsedValue;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function toDashboardSession(payload: AuthPayload): DashboardSession {
  const fullName = `${payload.user.first_name} ${payload.user.last_name}`.trim();

  return {
    token: payload.token,
    email: payload.user.email,
    name: fullName || "Operations Desk",
    role: payload.user.is_superuser ? "Owner" : payload.user.is_staff ? "Staff Access" : "Restricted",
    isOwner: payload.user.is_superuser ?? false,
    expiresAt: new Date(payload.expires_at).getTime(),
  };
}

async function readAuthResponse(response: Response): Promise<AuthPayload | AuthErrorPayload | null> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  if (!text) {
    return null;
  }

  return {
    error: {
      message: text.slice(0, 240),
      status: response.status,
    },
  };
}

export function DashboardAuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      const stored = readStoredSession();
      if (!stored) {
        if (isActive) {
          setIsReady(true);
        }
        return;
      }

      try {
        const response = await fetch("/api/backend/auth/staff/session/", {
          headers: {
            Authorization: `Bearer ${stored.token}`,
          },
        });

        if (!response.ok) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          if (isActive) {
            setSession(null);
            setIsReady(true);
          }
          return;
        }

        const payload = (await response.json()) as AuthPayload;
        const nextSession = toDashboardSession(payload);
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));

        if (isActive) {
          setSession(nextSession);
          setIsReady(true);
        }
      } catch {
        if (isActive) {
          setSession(stored);
          setIsReady(true);
        }
      }
    }

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  async function signIn(email: string, password: string) {
    let response: Response;
    try {
      response = await fetch("/api/backend/auth/staff/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: email, password }),
      });
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "The dashboard could not reach the local API.",
      };
    }

    const payload = await readAuthResponse(response);

    if (!response.ok || !payload || "error" in payload) {
      return {
        ok: false,
        error:
          payload && "error" in payload
            ? payload.error?.message ?? "Unable to enter the dashboard right now."
            : "Unable to enter the dashboard right now.",
      };
    }

    const nextSession = toDashboardSession(payload as AuthPayload);
    window.localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setIsReady(true);

    return { ok: true };
  }

  async function acceptInvite(token: string, password: string) {
    let response: Response;
    try {
      response = await fetch("/api/backend/auth/staff/invite/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "The dashboard could not reach the local API.",
      };
    }

    const payload = await readAuthResponse(response);

    if (!response.ok || !payload || "error" in payload) {
      return {
        ok: false,
        error:
          payload && "error" in payload
            ? payload.error?.message ?? "Unable to accept this invite right now."
            : "Unable to accept this invite right now.",
      };
    }

    const nextSession = toDashboardSession(payload as AuthPayload);
    window.localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    setIsReady(true);

    return { ok: true };
  }

  async function signOut() {
    if (session?.token) {
      await fetch("/api/backend/auth/staff/session/", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      }).catch(() => undefined);
    }

    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
    setSession(null);
  }

  const value: DashboardAuthContextValue = {
    isReady,
    isAuthenticated: Boolean(session),
    session,
    signIn,
    acceptInvite,
    signOut,
  };

  return (
    <DashboardAuthContext.Provider value={value}>{children}</DashboardAuthContext.Provider>
  );
}

export function useDashboardAuth() {
  const context = useContext(DashboardAuthContext);

  if (!context) {
    throw new Error("useDashboardAuth must be used within DashboardAuthProvider");
  }

  return context;
}

export function hasExpiredDashboardSession() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SESSION_EXPIRED_FLAG_KEY) === "true";
}
