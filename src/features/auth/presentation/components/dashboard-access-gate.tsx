"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import {
  hasExpiredDashboardSession,
  useDashboardAuth,
} from "@/src/features/auth/presentation/state/dashboard-auth-provider";

export function DashboardAccessGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dev bypass: when NEXT_PUBLIC_DASHBOARD_BYPASS=1, render dashboard without auth.
  // Checked after the hooks so they run in the same order on every render.
  const bypassAuth = (process.env.NEXT_PUBLIC_DASHBOARD_BYPASS as string) === "1";
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isReady } = useDashboardAuth();

  useEffect(() => {
    if (bypassAuth || !isReady) {
      return;
    }

    if (!isAuthenticated && pathname !== "/signin") {
      router.replace(hasExpiredDashboardSession() ? "/session-expired" : "/signin");
    }
  }, [bypassAuth, isAuthenticated, isReady, pathname, router]);

  if (bypassAuth) {
    return <>{children}</>;
  }

  if (!isReady) {
    return (
      <AppStateMessage
        eyebrow="Dashboard auth"
        title="Checking staff access"
        description="Restoring the backend-backed staff session before the control desk opens."
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
