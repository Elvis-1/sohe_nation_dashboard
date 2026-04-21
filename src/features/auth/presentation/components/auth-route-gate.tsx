"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { useDashboardAuth } from "@/src/features/auth/presentation/state/dashboard-auth-provider";

export function AuthRouteGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useDashboardAuth();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady) {
    return (
      <AppStateMessage
        eyebrow="Staff access"
        title="Checking dashboard session"
        description="Restoring the backend-backed staff session before the access screen opens."
      />
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
