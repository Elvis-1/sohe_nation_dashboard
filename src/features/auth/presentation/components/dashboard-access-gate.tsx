"use client";

import { useEffect, useState } from "react";
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
  const { isAuthenticated } = useDashboardAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    if (!isAuthenticated && pathname !== "/signin") {
      router.replace(hasExpiredDashboardSession() ? "/session-expired" : "/signin");
    }
  }, [hasMounted, isAuthenticated, pathname, router]);

  if (!hasMounted) {
    return (
      <AppStateMessage
        eyebrow="Dashboard auth"
        title="Checking staff access"
        description="Restoring the fixture-mode session before the control desk opens."
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
