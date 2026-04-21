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
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isReady } = useDashboardAuth();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated && pathname !== "/signin") {
      router.replace(hasExpiredDashboardSession() ? "/session-expired" : "/signin");
    }
  }, [isAuthenticated, isReady, pathname, router]);

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
