"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppStateMessage } from "@/src/core/ui/app-state-message";
import { useDashboardAuth } from "@/src/features/auth/presentation/state/dashboard-auth-provider";

export function AuthRouteGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
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
    if (hasMounted && isAuthenticated) {
      router.replace("/");
    }
  }, [hasMounted, isAuthenticated, router]);

  if (!hasMounted) {
    return (
      <AppStateMessage
        eyebrow="Staff access"
        title="Checking dashboard session"
        description="Restoring the fixture-mode staff session before the access screen opens."
      />
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
