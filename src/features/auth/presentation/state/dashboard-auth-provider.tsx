"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  createDashboardDemoSession,
  isValidDashboardDemoCredential,
  type DashboardSessionRecord,
} from "@/src/features/auth/data/mock-staff-auth-repository";

const SESSION_STORAGE_KEY = "sohe-dashboard-session";
const SESSION_CHANGE_EVENT = "sohe-dashboard-session-change";
const SESSION_EXPIRED_FLAG_KEY = "sohe-dashboard-session-expired";

type DashboardSession = DashboardSessionRecord;

type DashboardAuthContextValue = {
  isAuthenticated: boolean;
  session: DashboardSession | null;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
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

let cachedSessionRaw: string | null | undefined;
let cachedSessionValue: DashboardSession | null | undefined;

function getCachedSessionSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (rawValue === cachedSessionRaw && cachedSessionValue !== undefined) {
    return cachedSessionValue;
  }

  cachedSessionRaw = rawValue;
  cachedSessionValue = readStoredSession();

  return cachedSessionValue;
}

function subscribeToSession(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SESSION_STORAGE_KEY) {
      onStoreChange();
    }
  };

  const handleSessionChange = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SESSION_CHANGE_EVENT, handleSessionChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
  };
}

function dispatchSessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
  }
}

export function DashboardAuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = useSyncExternalStore(
    subscribeToSession,
    getCachedSessionSnapshot,
    () => null,
  );

  async function signIn(email: string, password: string) {
    if (!isValidDashboardDemoCredential(email, password)) {
      return {
        ok: false,
        error: "Use the fixture credentials to enter the dashboard.",
      };
    }

    const nextSession: DashboardSession = createDashboardDemoSession(email);

    window.localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    dispatchSessionChange();

    return { ok: true };
  }

  function signOut() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
    dispatchSessionChange();
  }

  const value = useMemo<DashboardAuthContextValue>(
    () => ({
      isAuthenticated: Boolean(session),
      session,
      signIn,
      signOut,
    }),
    [session],
  );

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
